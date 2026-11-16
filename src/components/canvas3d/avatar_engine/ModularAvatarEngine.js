import * as THREE from 'three';
import { GLTFLoader, SkeletonUtils } from 'three-stdlib';

/**
 * MOTOR DE AVATARES MODULARES PARAMÉTRICOS 2.0
 * Soporta cuerpos base de alta precisión MakeHuman / MPFB2 (Hombre, Mujer, Niño),
 * 53 huesos de cinemática inversa, 27 Shape Keys anatómicas y guardarropa modular conformal.
 */

export const AVATAR_ENGINE_PATHS = {
  // Cuerpos base
  female_base: '/models/avatar_engine/body_female_base.glb',
  male_base: '/models/avatar_engine/body_male_base.glb',
  child_base: '/models/avatar_engine/body_child_base.glb',

  // Guardarropa modular
  top_polo: '/models/avatar_engine/wardrobe/top_polo.glb',
  top_scrub: '/models/avatar_engine/wardrobe/top_scrub.glb',
  top_labcoat: '/models/avatar_engine/wardrobe/top_labcoat.glb',
  bottom_scrub_pants: '/models/avatar_engine/wardrobe/bottom_scrub_pants.glb',
  bottom_jeans: '/models/avatar_engine/wardrobe/bottom_jeans.glb',
  bottom_bermuda: '/models/avatar_engine/wardrobe/bottom_bermuda.glb',
  shoes_sneakers: '/models/avatar_engine/wardrobe/shoes_sneakers.glb'
};

const engineCache = {
  loaded: false,
  loadingPromise: null,
  models: {}
};

/**
 * Precarga todos los GLBs del motor de avatares (cuerpos y prendas modulares)
 */
export function preloadAvatarEngineAssets() {
  if (engineCache.loadingPromise) return engineCache.loadingPromise;

  const loader = new GLTFLoader();
  const entries = Object.entries(AVATAR_ENGINE_PATHS);

  engineCache.loadingPromise = Promise.all(
    entries.map(async ([key, url]) => {
      try {
        const gltf = await loader.loadAsync(url);
        const scene = gltf.scene;
        scene.updateMatrixWorld(true);

        let skinnedMesh = null;
        let skeleton = null;

        scene.traverse((child) => {
          if (child.isSkinnedMesh) {
            skinnedMesh = child;
            skeleton = child.skeleton;
            child.castShadow = true;
            child.receiveShadow = true;
            child.frustumCulled = false;
          }
        });

        engineCache.models[key] = { scene, skinnedMesh, skeleton };
      } catch (err) {
        console.warn(`[AvatarEngine] Error cargando asset ${key} (${url}):`, err);
      }
    })
  ).then(() => {
    engineCache.loaded = true;
    console.log('[AvatarEngine] Todos los modelos y prendas precargados.');
  });

  return engineCache.loadingPromise;
}

/**
 * Mapea los valores del perfil (UI / CAS Studio) a las Shape Keys anatómicas exactas
 */
export function computeMorphTargetsFromProfile(profile) {
  const isChild = profile.age && profile.age <= 12;
  const isFemale = profile.gender === 'F';
  const BODY_FACTOR = 0.5; // Reducción al 50% solicitada por el usuario para balance natural

  const cup = profile.bustCup || 'B';
  const bustShape = profile.bustShape || 'semi_esfera';
  const gluteShape = profile.glutesShape || 'redondo';
  const fs = profile.faceSliders || {};

  // Copa de busto (A=-0.35, B=0, C=0.35, D=0.70, DD=1.05)
  const cupDelta = cup === 'A' ? -0.35 :
                   cup === 'B' ? 0.0 :
                   cup === 'C' ? 0.40 :
                   cup === 'D' ? 0.80 :
                   cup === 'DD' ? 1.20 : 0.0;

  // Medidas relativas
  const rawFit = profile.complexion === 'atletica' ? 0.85 :
                 profile.complexion === 'robusta' ? 0.35 :
                 profile.complexion === 'corpulenta' ? 0.15 : 0.45;

  const rawFat = profile.complexion === 'corpulenta' ? 0.90 :
                 profile.complexion === 'robusta' ? 0.60 :
                 profile.complexion === 'delgada' ? 0.05 : 0.25;

  const waistDelta = ((profile.waistCm || 74) - (isFemale ? 68 : 80)) / 16;
  const hipDelta = ((profile.hipCm || 95) - (isFemale ? 94 : 96)) / 16;

  const morphs = {
    // Bust (Mujer adulta)
    bust_volume_up: !isChild && isFemale ? Math.max(0, cupDelta) * BODY_FACTOR : 0,
    bust_volume_down: !isChild && isFemale ? Math.max(0, -cupDelta) * BODY_FACTOR : 0,
    bust_firmness_up: !isChild && isFemale && (bustShape === 'esfera' || bustShape === 'pico') ? 0.8 * BODY_FACTOR : 0,
    bust_firmness_down: !isChild && isFemale && bustShape === 'pera' ? 0.8 * BODY_FACTOR : 0,
    bust_distance_up: 0,
    bust_distance_down: !isChild && isFemale && bustShape === 'esfera' ? 0.5 * BODY_FACTOR : 0,
    bust_height_up: !isChild && isFemale && bustShape === 'esfera' ? 0.4 * BODY_FACTOR : 0,
    bust_height_down: !isChild && isFemale && bustShape === 'pera' ? 0.4 * BODY_FACTOR : 0,

    // Waist
    waist_cinch: !isChild ? Math.max(0, -waistDelta) * BODY_FACTOR : 0,
    waist_expand: !isChild ? Math.max(0, waistDelta) * BODY_FACTOR : 0,

    // Hips & Glutes
    hip_width_up: !isChild ? Math.max(0, hipDelta) * BODY_FACTOR : 0,
    hip_width_down: !isChild ? Math.max(0, -hipDelta) * BODY_FACTOR : 0,
    hip_depth_up: !isChild ? Math.max(0, hipDelta * 0.7) * BODY_FACTOR : 0,
    glute_volume_up: !isChild ? (gluteShape === 'bubblebutt' ? 1.0 : gluteShape === 'corazon' ? 0.75 : Math.max(0.2, hipDelta)) * BODY_FACTOR : 0,
    glute_volume_down: !isChild && hipDelta < -0.2 ? Math.min(1.0, -hipDelta) * BODY_FACTOR : 0,

    // Stomach
    stomach_tone: rawFit * BODY_FACTOR,
    stomach_fullness: rawFat * BODY_FACTOR,

    // Male Chest & Back
    chest_pectoral: !isChild && !isFemale ? rawFit * BODY_FACTOR : 0,
    v_taper: !isChild && !isFemale ? (rawFit * 0.85) * BODY_FACTOR : 0,
    back_dorsi: !isChild && !isFemale ? (rawFit * 0.70) * BODY_FACTOR : 0,

    // Muscle
    upperarm_muscle: THREE.MathUtils.clamp(profile.biceps ?? (rawFit * 0.5), 0, 1.3) * BODY_FACTOR,
    lowerarm_muscle: THREE.MathUtils.clamp(profile.forearms ?? (rawFit * 0.4), 0, 1.3) * BODY_FACTOR,
    upperleg_muscle: THREE.MathUtils.clamp(profile.quads ?? (rawFit * 0.5), 0, 1.4) * BODY_FACTOR,
    lowerleg_muscle: THREE.MathUtils.clamp(profile.calves ?? (rawFit * 0.4), 0, 1.3) * BODY_FACTOR,

    // Facial features
    nose_concave: Math.max(0, -(fs.noseBridgeCurve || 0)),
    nose_convex: Math.max(0, (fs.noseBridgeCurve || 0)),
    nose_flaring: Math.max(0, (fs.nostrilFlare || 0)),
    mouth_cupid: Math.max(0, (fs.upperLipThickness || 0)),
    lips_full: Math.max(0, (fs.lowerLipThickness || 0)),
    cheek_volume: Math.max(0, (fs.cheekboneWidth || 0)),
    chin_prominent: Math.max(0, (fs.chinLength || 0)),
    chin_width: Math.max(0, (fs.jawWidth || 0))
  };

  return morphs;
}

/**
 * Aplica los Morph Targets a cualquier SkinnedMesh que los posea
 */
export function applyMorphsToMesh(skinnedMesh, morphValues) {
  if (!skinnedMesh || !skinnedMesh.morphTargetDictionary || !skinnedMesh.morphTargetInfluences) return;

  for (const [targetName, idx] of Object.entries(skinnedMesh.morphTargetDictionary)) {
    if (morphValues[targetName] !== undefined) {
      skinnedMesh.morphTargetInfluences[idx] = morphValues[targetName];
    }
  }
}

/**
 * Crea o actualiza un avatar modular completo
 */
export function createModularAvatar(profile) {
  const isChild = profile.age && profile.age <= 12;
  const isFemale = profile.gender === 'F';
  const baseKey = isChild ? 'child_base' : isFemale ? 'female_base' : 'male_base';

  const baseEntry = engineCache.models[baseKey];
  if (!baseEntry) {
    console.warn(`[AvatarEngine] Base model ${baseKey} no está precargado.`);
    return null;
  }

  const actorGroup = new THREE.Group();
  actorGroup.name = `avatar_${profile.id || 'sim'}`;

  // 1. Clonar cuerpo base
  const clonedScene = SkeletonUtils.clone(baseEntry.scene);
  actorGroup.add(clonedScene);

  let bodyMesh = null;
  let skeleton = null;
  const bones = {};

  clonedScene.traverse((child) => {
    if (child.isBone) {
      bones[child.name] = child;
    }
    if (child.isSkinnedMesh) {
      bodyMesh = child;
      skeleton = child.skeleton;
      child.material = child.material.clone();
      if (profile.skinColor) {
        child.material.color.set(profile.skinColor);
      }
    }
  });

  actorGroup.userData = {
    profile: { ...profile },
    bodyMesh,
    skeleton,
    bones,
    garments: {}
  };

  // 2. Determinar qué prendas equipar
  const topKey = profile.topStyle === 'filipina' ? 'top_scrub' :
                 profile.topStyle === 'bata' || (profile.roleTag && profile.roleTag.includes('Doctor')) ? 'top_labcoat' :
                 'top_polo';

  const bottomKey = profile.bottomStyle === 'bermuda' ? 'bottom_bermuda' :
                    profile.bottomStyle === 'pantalon_vestir' || (profile.roleTag && profile.roleTag.includes('Doctor')) ? 'bottom_scrub_pants' :
                    'bottom_jeans';

  const shoeKey = 'shoes_sneakers';

  // Función interna para equipar prenda SkinnedMesh
  const equip = (slot, garmentKey, colorHex) => {
    const garmentEntry = engineCache.models[garmentKey];
    if (!garmentEntry || !garmentEntry.skinnedMesh) return;

    const garmentMesh = garmentEntry.skinnedMesh.clone();
    garmentMesh.material = garmentEntry.skinnedMesh.material.clone();
    if (colorHex) {
      garmentMesh.material.color.set(colorHex);
    }
    garmentMesh.bind(skeleton, garmentMesh.bindMatrix);
    clonedScene.add(garmentMesh);
    actorGroup.userData.garments[slot] = garmentMesh;
  };

  equip('top', topKey, profile.topColor || (topKey === 'top_scrub' ? '#0d9488' : '#1e3a8a'));
  equip('bottom', bottomKey, profile.bottomColor || (bottomKey === 'bottom_scrub_pants' ? '#0d9488' : '#1e293b'));
  equip('shoes', shoeKey, profile.shoeColor || '#f8fafc');

  // 3. Aplicar medidas y Morph Targets conformales en sincronía 1:1
  const morphValues = computeMorphTargetsFromProfile(profile);
  applyMorphsToMesh(bodyMesh, morphValues);
  for (const garmentMesh of Object.values(actorGroup.userData.garments)) {
    applyMorphsToMesh(garmentMesh, morphValues);
  }

  // 4. Escala general según estatura (cm)
  const targetH = Math.max(1.10, Math.min(2.05, (profile.heightCm || 170) / 100));
  const nativeH = isChild ? 1.35 : 1.70;
  const scale = targetH / nativeH;
  clonedScene.scale.set(scale, scale, scale);

  return actorGroup;
}
