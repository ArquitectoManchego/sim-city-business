import bpy
import json
import gzip
import os
import bmesh
from mathutils import Vector

def load_target_deltas(target_path):
    deltas = {}
    if not os.path.exists(target_path):
        return deltas
    with gzip.open(target_path, 'rt', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'): continue
            parts = line.split()
            idx = int(parts[0])
            dx = float(parts[1]) * 0.1
            dy = -float(parts[3]) * 0.1
            dz = float(parts[2]) * 0.1
            deltas[idx] = (dx, dy, dz)
    return deltas

def add_shape_key_from_deltas(mesh_obj, shape_name, deltas_list, vert_map):
    sk = mesh_obj.shape_key_add(name=shape_name, from_mix=False)
    sk_buffer = [0.0] * (len(sk.data) * 3)
    sk.relative_key.data.foreach_get('co', sk_buffer)
    
    for deltas, factor in deltas_list:
        for orig_idx, (dx, dy, dz) in deltas.items():
            if orig_idx in vert_map:
                new_idx = vert_map[orig_idx]
                base = new_idx * 3
                if base < len(sk_buffer):
                    sk_buffer[base] += dx * factor
                    sk_buffer[base + 1] += dy * factor
                    sk_buffer[base + 2] += dz * factor
                
    sk.data.foreach_set('co', sk_buffer)
    mesh_obj.data.update()
    return sk

mpfb_dir = os.path.abspath("tools/blender/mpfb_data")
obj_path = os.path.join(mpfb_dir, "base.obj")
rig_path = os.path.join(mpfb_dir, "rig.game_engine.json")
weights_path = os.path.join(mpfb_dir, "weights.game_engine.json")
targets_dir = os.path.join(mpfb_dir, "targets")
wardrobe_dir = os.path.abspath("public/models/avatar_engine/wardrobe")
os.makedirs(wardrobe_dir, exist_ok=True)

with open(weights_path, 'r', encoding='utf-8') as f:
    w = json.load(f)['weights']

with open(rig_path, 'r', encoding='utf-8') as f:
    rig_data = json.load(f)

def get_bone_verts(bone_names, min_weight=0.15):
    verts = set()
    for b in bone_names:
        for item in w.get(b, []):
            if item[1] >= min_weight:
                verts.add(item[0])
    return verts

polo_bones = ['spine_01', 'spine_02', 'spine_03', 'clavicle_l', 'clavicle_r', 'upperarm_l', 'upperarm_r']
scrub_bones = ['spine_01', 'spine_02', 'spine_03', 'clavicle_l', 'clavicle_r', 'upperarm_l', 'upperarm_r', 'pelvis']
labcoat_bones = ['spine_01', 'spine_02', 'spine_03', 'clavicle_l', 'clavicle_r', 'upperarm_l', 'upperarm_r', 'lowerarm_l', 'lowerarm_r', 'pelvis', 'thigh_l', 'thigh_r']
pants_bones = ['pelvis', 'thigh_l', 'thigh_r', 'calf_l', 'calf_r']
bermuda_bones = ['pelvis', 'thigh_l', 'thigh_r']
shoe_bones = ['foot_l', 'foot_r', 'ball_l', 'ball_r']

head_verts = get_bone_verts(['neck_01', 'head'], min_weight=0.10)
hand_verts = get_bone_verts(['hand_l', 'hand_r'], min_weight=0.10)

def build_garment(garment_name, keep_verts, shape_key_specs, offset_dist, color_rgb, output_filename):
    print(f"\n==========================================")
    print(f"Building Garment: {garment_name} -> {output_filename}")
    print(f"==========================================")

    bpy.ops.wm.read_factory_settings(use_empty=True)

    # 1. Import base OBJ
    bpy.ops.wm.obj_import(filepath=obj_path)
    mesh_obj = bpy.context.selected_objects[0]
    mesh_obj.name = f"Mesh_{garment_name}"

    # Transform coordinates from MH decimeters to Blender meters
    for v in mesh_obj.data.vertices:
        raw_x, raw_y, raw_z = v.co.x, v.co.y, v.co.z
        v.co = Vector((raw_x * 0.1, -raw_z * 0.1, raw_y * 0.1))
    mesh_obj.data.update()

    # 2. Filter vertices with bmesh, tracking original index mapping
    bm = bmesh.new()
    bm.from_mesh(mesh_obj.data)
    bm.verts.ensure_lookup_table()

    # Tag original indices in a custom layer or dict before deletion
    orig_indices = {v: v.index for v in bm.verts}
    to_delete = [v for v in bm.verts if orig_indices[v] not in keep_verts]
    bmesh.ops.delete(bm, geom=to_delete, context='VERTS')
    bm.verts.ensure_lookup_table()
    bm.normal_update()

    # Displace vertices along normals outward by offset_dist
    for v in bm.verts:
        v.co += v.normal * offset_dist

    # Map original base.obj vertex index -> new garment mesh vertex index
    vert_map = {}
    for new_idx, v in enumerate(bm.verts):
        orig_idx = orig_indices[v]
        vert_map[orig_idx] = new_idx

    bm.to_mesh(mesh_obj.data)
    bm.free()
    mesh_obj.data.update()
    print(f"Retained {len(mesh_obj.data.vertices)} vertices for {garment_name}")

    # 3. Add Basis Shape Key
    mesh_obj.shape_key_add(name="Basis", from_mix=False)

    # 4. Add Conformal Shape Keys
    for sk_name, spec_list in shape_key_specs:
        deltas_list = []
        for rel_path, factor in spec_list:
            full_path = os.path.join(targets_dir, rel_path)
            d = load_target_deltas(full_path)
            deltas_list.append((d, factor))
        add_shape_key_from_deltas(mesh_obj, sk_name, deltas_list, vert_map)

    # 5. Build Armature
    arm_data = bpy.data.armatures.new(f"Skeleton_{garment_name}")
    arm_obj = bpy.data.objects.new(f"Skeleton_{garment_name}", arm_data)
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

    # 6. Apply vertex weights (mapped to new indices)
    for bone_name, pairs in w.items():
        if not pairs: continue
        vg = mesh_obj.vertex_groups.new(name=bone_name)
        for p in pairs:
            orig_idx, weight = p[0], p[1]
            if orig_idx in vert_map:
                new_idx = vert_map[orig_idx]
                vg.add([new_idx], weight, 'REPLACE')

    # 7. Armature Modifier
    mod = mesh_obj.modifiers.new(name="Armature", type='ARMATURE')
    mod.object = arm_obj
    mod.use_vertex_groups = True
    mesh_obj.parent = arm_obj

    # 8. PBR Cloth Material
    mat = bpy.data.materials.new(name=f"M_{garment_name}")
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs['Base Color'].default_value = (*color_rgb, 1.0)
        bsdf.inputs['Roughness'].default_value = 0.8
    mesh_obj.data.materials.append(mat)

    # 9. Export to GLB
    out_path = os.path.join(wardrobe_dir, output_filename)
    bpy.ops.object.select_all(action='DESELECT')
    arm_obj.select_set(True)
    mesh_obj.select_set(True)
    bpy.context.view_layer.objects.active = arm_obj

    bpy.ops.export_scene.gltf(
        filepath=out_path,
        use_selection=True,
        export_format='GLB',
        export_morph=True,
        export_morph_normal=True,
        export_skins=True,
        export_all_influences=True
    )
    size_mb = os.path.getsize(out_path) / (1024 * 1024)
    print(f"Exported {out_path} ({size_mb:.2f} MB)")

def main():
    top_shapes = [
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
        # Stomach
        ("stomach_tone", [("stomach/stomach-tone-incr.target.gz", 1.0)]),
        ("stomach_fullness", [("stomach/stomach-pregnant-incr.target.gz", 1.0)]),
        # Male upper muscle
        ("chest_pectoral", [("torso/torso-muscle-pectoral-incr.target.gz", 1.0)]),
        ("v_taper", [("torso/torso-vshape-incr.target.gz", 1.0)]),
        ("back_dorsi", [("torso/torso-muscle-dorsi-incr.target.gz", 1.0)]),
        ("upperarm_muscle", [
            ("arms/l-upperarm-muscle-incr.target.gz", 1.0),
            ("arms/r-upperarm-muscle-incr.target.gz", 1.0)
        ])
    ]

    bottom_shapes = [
        ("waist_cinch", [("torso/measure-waist-circ-decr.target.gz", 1.0)]),
        ("waist_expand", [("torso/measure-waist-circ-incr.target.gz", 1.0)]),
        ("hip_width_up", [("hip/hip-scale-horiz-incr.target.gz", 1.0)]),
        ("hip_width_down", [("hip/hip-scale-horiz-decr.target.gz", 1.0)]),
        ("hip_depth_up", [("hip/hip-scale-depth-incr.target.gz", 1.0)]),
        ("glute_volume_up", [("buttocks/buttocks-volume-incr.target.gz", 1.0)]),
        ("glute_volume_down", [("buttocks/buttocks-volume-decr.target.gz", 1.0)]),
        ("upperleg_muscle", [
            ("legs/l-upperleg-muscle-incr.target.gz", 1.0),
            ("legs/r-upperleg-muscle-incr.target.gz", 1.0)
        ]),
        ("lowerleg_muscle", [
            ("legs/l-lowerleg-muscle-incr.target.gz", 1.0),
            ("legs/r-lowerleg-muscle-incr.target.gz", 1.0)
        ])
    ]

    # 1. Playera Polo (Navy Blue - Employee)
    polo_verts = (get_bone_verts(polo_bones, min_weight=0.12) - head_verts) - hand_verts
    build_garment("TopPolo", polo_verts, top_shapes, 0.005, (0.05, 0.12, 0.35), "top_polo.glb")

    # 2. Filipina Médica (Medical Teal)
    scrub_verts = (get_bone_verts(scrub_bones, min_weight=0.10) - head_verts) - hand_verts
    build_garment("TopScrub", scrub_verts, top_shapes, 0.006, (0.08, 0.45, 0.52), "top_scrub.glb")

    # 3. Bata Médica (Doctor White)
    coat_verts = (get_bone_verts(labcoat_bones, min_weight=0.08) - head_verts) - hand_verts
    build_garment("TopLabCoat", coat_verts, top_shapes, 0.009, (0.95, 0.95, 0.96), "top_labcoat.glb")

    # 4. Pantalón Quirúrgico (Medical Teal)
    pants_verts = get_bone_verts(pants_bones, min_weight=0.10)
    build_garment("BottomScrubPants", pants_verts, bottom_shapes, 0.005, (0.08, 0.45, 0.52), "bottom_scrub_pants.glb")

    # 5. Jeans Clásicos (Casual Denim Blue)
    build_garment("BottomJeans", pants_verts, bottom_shapes, 0.006, (0.12, 0.22, 0.42), "bottom_jeans.glb")

    # 6. Bermudas de Lino (Summer Khaki)
    bermuda_verts = get_bone_verts(bermuda_bones, min_weight=0.12)
    build_garment("BottomBermuda", bermuda_verts, bottom_shapes, 0.006, (0.76, 0.70, 0.58), "bottom_bermuda.glb")

    # 7. Zapatos Clínicos / Tenis (Clean Work Shoes)
    shoe_verts = get_bone_verts(shoe_bones, min_weight=0.15)
    build_garment("ShoesSneakers", shoe_verts, [], 0.006, (0.90, 0.90, 0.92), "shoes_sneakers.glb")

    print("\nAll modular garments built successfully!")

if __name__ == "__main__":
    main()
