import bpy
import json
import gzip
import os
import sys
from mathutils import Vector

def load_target_deltas(target_path):
    deltas = {}
    if not os.path.exists(target_path):
        print(f"Warning: target not found: {target_path}")
        return deltas
    with gzip.open(target_path, 'rt', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'): continue
            parts = line.split()
            idx = int(parts[0])
            # Coordinate conversion: MakeHuman raw (X, Y up, Z forward) in dm -> Blender (X, -Z, Y) in meters
            dx = float(parts[1]) * 0.1
            dy = -float(parts[3]) * 0.1
            dz = float(parts[2]) * 0.1
            deltas[idx] = (dx, dy, dz)
    return deltas

def apply_target_deltas_to_vertices(mesh_obj, deltas, factor=1.0):
    for idx, (dx, dy, dz) in deltas.items():
        if idx < len(mesh_obj.data.vertices):
            v = mesh_obj.data.vertices[idx]
            v.co.x += dx * factor
            v.co.y += dy * factor
            v.co.z += dz * factor
    mesh_obj.data.update()

def add_shape_key_from_deltas(mesh_obj, shape_name, deltas_list):
    sk = mesh_obj.shape_key_add(name=shape_name, from_mix=False)
    sk_buffer = [0.0] * (len(sk.data) * 3)
    sk.relative_key.data.foreach_get('co', sk_buffer)
    
    for deltas, factor in deltas_list:
        for idx, (dx, dy, dz) in deltas.items():
            base = idx * 3
            if base < len(sk_buffer):
                sk_buffer[base] += dx * factor
                sk_buffer[base + 1] += dy * factor
                sk_buffer[base + 2] += dz * factor
                
    sk.data.foreach_set('co', sk_buffer)
    mesh_obj.data.update()
    return sk

def build_avatar(avatar_type, base_target_name, shape_keys_specs, skin_color, output_filename):
    print(f"\n==========================================")
    print(f"Building avatar: {avatar_type} -> {output_filename}")
    print(f"==========================================")
    
    mpfb_dir = os.path.abspath("tools/blender/mpfb_data")
    obj_path = os.path.join(mpfb_dir, "base.obj")
    rig_path = os.path.join(mpfb_dir, "rig.game_engine.json")
    weights_path = os.path.join(mpfb_dir, "weights.game_engine.json")
    targets_dir = os.path.join(mpfb_dir, "targets")

    bpy.ops.wm.read_factory_settings(use_empty=True)

    # 1. Import base OBJ
    bpy.ops.wm.obj_import(filepath=obj_path)
    mesh_obj = bpy.context.selected_objects[0]
    mesh_obj.name = f"Mesh_{avatar_type}"

    # Transform vertices from MakeHuman raw coords to Blender meters
    for v in mesh_obj.data.vertices:
        raw_x, raw_y, raw_z = v.co.x, v.co.y, v.co.z
        v.co = Vector((raw_x * 0.1, -raw_z * 0.1, raw_y * 0.1))
    mesh_obj.data.update()

    # 2. Bake gender/age base macro target into vertices
    if base_target_name:
        base_target_path = os.path.join(targets_dir, "macrodetails", base_target_name)
        base_deltas = load_target_deltas(base_target_path)
        apply_target_deltas_to_vertices(mesh_obj, base_deltas, factor=1.0)
        print(f"Baked base macro target '{base_target_name}' ({len(base_deltas)} verts)")

    # 3. Create Basis Shape Key
    mesh_obj.shape_key_add(name="Basis", from_mix=False)

    # 4. Add Modifier Shape Keys
    for sk_name, spec_list in shape_keys_specs:
        deltas_list = []
        for rel_path, factor in spec_list:
            full_path = os.path.join(targets_dir, rel_path)
            d = load_target_deltas(full_path)
            deltas_list.append((d, factor))
        add_shape_key_from_deltas(mesh_obj, sk_name, deltas_list)

    print(f"Configured {len(mesh_obj.data.shape_keys.key_blocks) - 1} shape keys")

    # 5. Build Armature
    with open(rig_path, 'r', encoding='utf-8') as f:
        rig_data = json.load(f)

    arm_data = bpy.data.armatures.new(f"Skeleton_{avatar_type}")
    arm_obj = bpy.data.objects.new(f"Skeleton_{avatar_type}", arm_data)
    bpy.context.scene.collection.objects.link(arm_obj)
    bpy.context.view_layer.objects.active = arm_obj
    arm_obj.select_set(True)

    bpy.ops.object.mode_set(mode='EDIT')
    edit_bones = arm_data.edit_bones

    for bone_name, bone_info in rig_data.items():
        eb = edit_bones.new(bone_name)
        head_pos = bone_info["head"]["default_position"]
        tail_pos = bone_info["tail"]["default_position"]
        eb.head = (head_pos[0], head_pos[1], head_pos[2])
        eb.tail = (tail_pos[0], tail_pos[1], tail_pos[2])
        if (eb.tail - eb.head).length < 0.001:
            eb.tail.z += 0.05
        if "roll" in bone_info:
            eb.roll = bone_info["roll"]

    for bone_name, bone_info in rig_data.items():
        parent_name = bone_info.get("parent")
        if parent_name and parent_name in edit_bones:
            eb = edit_bones[bone_name]
            eb.parent = edit_bones[parent_name]
            eb.use_connect = bone_info.get("use_connect", False)

    bpy.ops.object.mode_set(mode='OBJECT')

    # 6. Apply Vertex Weights
    with open(weights_path, 'r', encoding='utf-8') as f:
        weights_json = json.load(f)
        weights_data = weights_json.get("weights", {})

    for bone_name, pairs in weights_data.items():
        if not pairs: continue
        vg = mesh_obj.vertex_groups.new(name=bone_name)
        for p in pairs:
            vert_idx, weight = p[0], p[1]
            vg.add([vert_idx], weight, 'REPLACE')

    mod = mesh_obj.modifiers.new(name="Armature", type='ARMATURE')
    mod.object = arm_obj
    mod.use_vertex_groups = True
    mesh_obj.parent = arm_obj

    # 7. Material
    mat = bpy.data.materials.new(name=f"M_Skin_{avatar_type}")
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs['Base Color'].default_value = (*skin_color, 1.0)
        bsdf.inputs['Roughness'].default_value = 0.6
    mesh_obj.data.materials.append(mat)

    # 8. Export to GLB
    out_dir = os.path.abspath("public/models/avatar_engine")
    os.makedirs(out_dir, exist_ok=True)
    glb_path = os.path.join(out_dir, output_filename)

    bpy.ops.object.select_all(action='DESELECT')
    arm_obj.select_set(True)
    mesh_obj.select_set(True)
    bpy.context.view_layer.objects.active = arm_obj

    bpy.ops.export_scene.gltf(
        filepath=glb_path,
        use_selection=True,
        export_format='GLB',
        export_morph=True,
        export_morph_normal=True,
        export_skins=True,
        export_all_influences=True
    )

    size_mb = os.path.getsize(glb_path) / (1024 * 1024)
    print(f"Exported {glb_path} ({size_mb:.2f} MB)")

def main():
    common_face_shapes = [
        ("nose_concave", [("nose/nose-curve-concave.target.gz", 1.0)]),
        ("nose_convex", [("nose/nose-curve-convex.target.gz", 1.0)]),
        ("nose_flaring", [("nose/nose-flaring-incr.target.gz", 1.0)]),
        ("mouth_cupid", [("mouth/mouth-cupidsbow-incr.target.gz", 1.0)]),
        ("lips_full", [("mouth/mouth-lowerlip-height-incr.target.gz", 1.0)]),
        ("cheek_volume", [
            ("cheek/l-cheek-volume-incr.target.gz", 1.0),
            ("cheek/r-cheek-volume-incr.target.gz", 1.0)
        ]),
        ("chin_prominent", [("chin/chin-prominent-incr.target.gz", 1.0)]),
        ("chin_width", [("chin/chin-width-incr.target.gz", 1.0)])
    ]

    # --- 1. FEMALE BASE ---
    female_shapes = [
        # Bust
        ("bust_volume_up", [("breast/breast-volume-vert-up.target.gz", 1.0)]),
        ("bust_volume_down", [("breast/breast-volume-vert-down.target.gz", 1.0)]),
        ("bust_firmness_up", [("breast/breast-point-incr.target.gz", 1.0)]),
        ("bust_firmness_down", [("breast/breast-point-decr.target.gz", 1.0)]),
        ("bust_distance_up", [("breast/breast-dist-incr.target.gz", 1.0)]),
        ("bust_distance_down", [("breast/breast-dist-decr.target.gz", 1.0)]),
        ("bust_height_up", [("breast/breast-trans-up.target.gz", 1.0)]),
        ("bust_height_down", [("breast/breast-trans-down.target.gz", 1.0)]),
        
        # Waist
        ("waist_cinch", [("torso/measure-waist-circ-decr.target.gz", 1.0)]),
        ("waist_expand", [("torso/measure-waist-circ-incr.target.gz", 1.0)]),
        
        # Hips & Glutes
        ("hip_width_up", [("hip/hip-scale-horiz-incr.target.gz", 1.0)]),
        ("hip_width_down", [("hip/hip-scale-horiz-decr.target.gz", 1.0)]),
        ("hip_depth_up", [("hip/hip-scale-depth-incr.target.gz", 1.0)]),
        ("glute_volume_up", [("buttocks/buttocks-volume-incr.target.gz", 1.0)]),
        ("glute_volume_down", [("buttocks/buttocks-volume-decr.target.gz", 1.0)]),
        
        # Stomach
        ("stomach_tone", [("stomach/stomach-tone-incr.target.gz", 1.0)]),
        ("stomach_fullness", [("stomach/stomach-pregnant-incr.target.gz", 1.0)]),
        
        # Muscle
        ("upperarm_muscle", [
            ("arms/l-upperarm-muscle-incr.target.gz", 1.0),
            ("arms/r-upperarm-muscle-incr.target.gz", 1.0)
        ]),
        ("upperleg_muscle", [
            ("legs/l-upperleg-muscle-incr.target.gz", 1.0),
            ("legs/r-upperleg-muscle-incr.target.gz", 1.0)
        ]),
        *common_face_shapes
    ]
    build_avatar("Female", "caucasian-female-young.target.gz", female_shapes, (0.83, 0.65, 0.55), "body_female_base.glb")

    # --- 2. MALE BASE ---
    male_shapes = [
        # Chest & V-Shape
        ("chest_pectoral", [("torso/torso-muscle-pectoral-incr.target.gz", 1.0)]),
        ("v_taper", [("torso/torso-vshape-incr.target.gz", 1.0)]),
        ("back_dorsi", [("torso/torso-muscle-dorsi-incr.target.gz", 1.0)]),
        
        # Waist
        ("waist_cinch", [("torso/measure-waist-circ-decr.target.gz", 1.0)]),
        ("waist_expand", [("torso/measure-waist-circ-incr.target.gz", 1.0)]),
        
        # Glutes & Hips
        ("glute_volume_up", [("buttocks/buttocks-volume-incr.target.gz", 1.0)]),
        ("glute_volume_down", [("buttocks/buttocks-volume-decr.target.gz", 1.0)]),
        ("hip_width_up", [("hip/hip-scale-horiz-incr.target.gz", 1.0)]),
        ("hip_width_down", [("hip/hip-scale-horiz-decr.target.gz", 1.0)]),
        
        # Stomach
        ("stomach_tone", [("stomach/stomach-tone-incr.target.gz", 1.0)]),
        ("stomach_fullness", [("stomach/stomach-pregnant-incr.target.gz", 1.0)]),
        
        # Muscle
        ("upperarm_muscle", [
            ("arms/l-upperarm-muscle-incr.target.gz", 1.0),
            ("arms/r-upperarm-muscle-incr.target.gz", 1.0)
        ]),
        ("lowerarm_muscle", [
            ("arms/l-lowerarm-muscle-incr.target.gz", 1.0),
            ("arms/r-lowerarm-muscle-incr.target.gz", 1.0)
        ]),
        ("upperleg_muscle", [
            ("legs/l-upperleg-muscle-incr.target.gz", 1.0),
            ("legs/r-upperleg-muscle-incr.target.gz", 1.0)
        ]),
        ("lowerleg_muscle", [
            ("legs/l-lowerleg-muscle-incr.target.gz", 1.0),
            ("legs/r-lowerleg-muscle-incr.target.gz", 1.0)
        ]),
        *common_face_shapes
    ]
    build_avatar("Male", "caucasian-male-young.target.gz", male_shapes, (0.78, 0.60, 0.50), "body_male_base.glb")

    # --- 3. CHILD BASE ---
    child_shapes = [
        ("stomach_tone", [("stomach/stomach-tone-incr.target.gz", 1.0)]),
        ("stomach_fullness", [("stomach/stomach-pregnant-incr.target.gz", 1.0)]),
        *common_face_shapes
    ]
    build_avatar("Child", "caucasian-female-child.target.gz", child_shapes, (0.85, 0.68, 0.58), "body_child_base.glb")

    print("\nAll 3 base avatars built successfully!")

if __name__ == "__main__":
    main()
