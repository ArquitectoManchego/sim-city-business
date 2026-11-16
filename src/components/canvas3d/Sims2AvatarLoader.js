import * as THREE from 'three';
import { GLTFLoader, SkeletonUtils } from 'three-stdlib';

// ============================================================================
// CATÁLOGOS THE SIMS 2 CAS (PIEL, COMPLEXIÓN, CABELLO, PRENDAS, 27 SLIDERS)
// ============================================================================
export const SIMS2_MODEL_PATHS = {
  male_base: '/models/sims2/male_base.glb',
  female_base: '/models/sims2/female_base.glb',
  female_casual: '/models/sims2/female_casual.glb'
};

export const SIMS2_SKIN_TONES = [
  { id: 'S1', name: 'S1 — Clara Marfil', hex: '#f4d1be' },
  { id: 'S2', name: 'S2 — Media Dorada', hex: '#d8a27c' },
  { id: 'S3', name: 'S3 — Bronceada Cálida', hex: '#ae724e' },
  { id: 'S4', name: 'S4 — Morena Profunda', hex: '#6c422c' }
];

export const SIMS2_HAIR_STYLES = [
  { id: 'nativo', label: 'Estilo Base del Sim' },
  { id: 'corto_ejecutivo', label: 'Corto Ejecutivo' },
  { id: 'ondulado_casual', label: 'Medio Ondulado' },
  { id: 'largo_liso', label: 'Largo Estilizado' },
  { id: 'calvo', label: 'Sin Cabello / Rapado' }
];

export const SIMS2_OUTFIT_TOP_STYLES = [
  { id: 'polo', label: 'Playera Polo' },
  { id: 'filipina', label: 'Filipina Médica / Chef' },
  { id: 'camisa', label: 'Camisa de Vestir' },
  { id: 'tshirt', label: 'Playera Cuello Redondo' },
  { id: 'hoodie', label: 'Sudadera / Chamarra' }
];

export const SIMS2_OUTFIT_BOTTOM_STYLES = [
  { id: 'pantalon_vestir', label: 'Pantalón Vestir / Quirúrgico' },
  { id: 'jeans', label: 'Mezclilla / Jeans' },
  { id: 'cargo', label: 'Pantalón Cargo Industrial' },
  { id: 'falda', label: 'Escolar / Falda Tabla' }
];

export const SIMS2_COMPLEXIONS = [
  { id: 'delgada', label: 'Delgada', fat: 0.0, fit: 0.15 },
  { id: 'atletica', label: 'Atlética (Fit)', fat: 0.0, fit: 0.85 },
  { id: 'media', label: 'Media Equilibrada', fat: 0.2, fit: 0.35 },
  { id: 'robusta', label: 'Robusta', fat: 0.6, fit: 0.25 },
  { id: 'corpulenta', label: 'Corpulenta (Fat)', fat: 0.95, fit: 0.1 }
];

export const SIMS2_FACE_SLIDER_GROUPS = [
  {
    group: 'Cejas (4 Canales)',
    sliders: [
      { key: 'browHeight', label: 'Altura de Cejas' },
      { key: 'browTilt', label: 'Inclinación / Expresión' },
      { key: 'browThickness', label: 'Arco Interno' },
      { key: 'browCurve', label: 'Curvatura Externa' }
    ]
  },
  {
    group: 'Ojos (6 Canales)',
    sliders: [
      { key: 'eyeSize', label: 'Tamaño de Ojos' },
      { key: 'eyeHeight', label: 'Apertura Párpado' },
      { key: 'eyeSpacing', label: 'Separación Ocular' },
      { key: 'eyeAngle', label: 'Inclinación Almendrada' },
      { key: 'eyelidOpenness', label: 'Entrecerrado / Enfoque' },
      { key: 'eyeDepth', label: 'Profundidad Cuenca' }
    ]
  },
  {
    group: 'Nariz (6 Canales)',
    sliders: [
      { key: 'noseLength', label: 'Largo Nasal' },
      { key: 'noseBridgeWidth', label: 'Ancho de Puente' },
      { key: 'noseTipHeight', label: 'Elevación Punta' },
      { key: 'noseTipWidth', label: 'Ancho de Punta' },
      { key: 'nostrilFlare', label: 'Apertura Fosas' },
      { key: 'noseBridgeCurve', label: 'Perfil de Puente' }
    ]
  },
  {
    group: 'Boca y Labios (6 Canales)',
    sliders: [
      { key: 'mouthWidth', label: 'Ancho de Boca' },
      { key: 'mouthHeight', label: 'Proyección Sonrisa' },
      { key: 'upperLipThickness', label: 'Grosor Labio Superior' },
      { key: 'lowerLipThickness', label: 'Grosor Labio Inferior' },
      { key: 'mouthCornerCurve', label: 'Curva Comisuras' },
      { key: 'mouthDepth', label: 'Protrusión Labial' }
    ]
  },
  {
    group: 'Mandíbula y Cráneo (5 Canales)',
    sliders: [
      { key: 'jawWidth', label: 'Ancho de Mandíbula' },
      { key: 'chinLength', label: 'Largo / Saliente Mentón' },
      { key: 'cheekboneWidth', label: 'Prominencia Pómulos' },
      { key: 'foreheadSlope', label: 'Amplitud Frente' },
      { key: 'faceWidth', label: 'Ancho General de Rostro' }
    ]
  }
];

export const DEFAULT_FACE_SLIDERS = {
  browHeight: 0,
  browTilt: 0,
  browThickness: 0,
  browCurve: 0,
  eyeSize: 0.1,
  eyeHeight: 0.05,
  eyeSpacing: 0,
  eyeAngle: 0,
  eyelidOpenness: 0,
  eyeDepth: 0,
  noseLength: 0,
  noseBridgeWidth: 0,
  noseTipHeight: 0,
  noseTipWidth: 0,
  nostrilFlare: 0,
  noseBridgeCurve: 0,
  mouthWidth: 0,
  mouthHeight: 0.15,
  upperLipThickness: 0,
  lowerLipThickness: 0,
  mouthCornerCurve: 0.1,
  mouthDepth: 0,
  jawWidth: 0,
  chinLength: 0,
  cheekboneWidth: 0,
  foreheadSlope: 0,
  faceWidth: 0
};

/**
 * Perfiles iniciales completos (Gerente, Esposa, Alex 12 años, Bárbara 8 años y Empleados de los 6 negocios)
 */
export function createDefaultSims2Profiles() {
  return {
    gerente: {
      id: 'gerente',
      displayName: 'Alex (Gerente General)',
      roleTag: 'Gerente / Diseñador Principal',
      baseModel: 'male_base',
      gender: 'M',
      age: 38,
      heightCm: 176,
      weightKg: 76,
      shoulderCm: 46,
      bustCm: 100,
      waistCm: 84,
      hipCm: 98,
      complexion: 'atletica',
      skinTone: 'S2',
      skinColor: '#d8a27c',
      eyeColor: '#3b2416',
      hairStyle: 'corto_ejecutivo',
      hairColor: '#1e1b18',
      topStyle: 'polo',
      topColor: '#facc15',
      bottomStyle: 'jeans',
      bottomColor: '#1e293b',
      shoeColor: '#0f172a',
      hasGlasses: false,
      hasAura: true,
      auraColor: '#facc15',
      showPlumbob: true,
      faceSliders: { ...DEFAULT_FACE_SLIDERS, jawWidth: 0.25, cheekboneWidth: 0.15, mouthHeight: 0.25 }
    },
    familia_esposa: {
      id: 'familia_esposa',
      displayName: 'Esposa (Familia)',
      roleTag: 'Familia — Visita 3–4 PM',
      baseModel: 'female_casual',
      gender: 'F',
      age: 35,
      heightCm: 163,
      weightKg: 58,
      shoulderCm: 38,
      bustCm: 90,
      waistCm: 68,
      hipCm: 95,
      complexion: 'media',
      skinTone: 'S2',
      skinColor: '#e2af8c',
      eyeColor: '#452b1a',
      hairStyle: 'largo_liso',
      hairColor: '#3b2314',
      topStyle: 'camisa',
      topColor: '#ec4899',
      bottomStyle: 'jeans',
      bottomColor: '#334155',
      shoeColor: '#1e293b',
      hasGlasses: false,
      hasAura: true,
      auraColor: '#f472b6',
      showPlumbob: true,
      faceSliders: { ...DEFAULT_FACE_SLIDERS, cheekboneWidth: 0.2, eyeSize: 0.2, mouthCornerCurve: 0.25 }
    },
    familia_alex: {
      id: 'familia_alex',
      displayName: 'Alex Jr. (12 años)',
      roleTag: 'Hijo 12 años — Visita 3–4 PM',
      baseModel: 'male_base',
      gender: 'M',
      age: 12,
      heightCm: 150,
      weightKg: 43,
      shoulderCm: 36,
      bustCm: 74,
      waistCm: 64,
      hipCm: 78,
      complexion: 'delgada',
      skinTone: 'S2',
      skinColor: '#e0ab88',
      eyeColor: '#3b2416',
      hairStyle: 'corto_ejecutivo',
      hairColor: '#261c15',
      topStyle: 'hoodie',
      topColor: '#38bdf8',
      bottomStyle: 'jeans',
      bottomColor: '#1e3a8a',
      shoeColor: '#e2e8f0',
      hasGlasses: false,
      hasAura: true,
      auraColor: '#38bdf8',
      showPlumbob: true,
      faceSliders: { ...DEFAULT_FACE_SLIDERS, eyeSize: 0.3, faceWidth: -0.1, jawWidth: -0.25 }
    },
    familia_barbara: {
      id: 'familia_barbara',
      displayName: 'Bárbara (8 años)',
      roleTag: 'Hija 8 años — Visita 3–4 PM',
      baseModel: 'female_base',
      gender: 'F',
      age: 8,
      heightCm: 126,
      weightKg: 27,
      shoulderCm: 32,
      bustCm: 64,
      waistCm: 56,
      hipCm: 68,
      complexion: 'delgada',
      skinTone: 'S1',
      skinColor: '#f1c6ab',
      eyeColor: '#452b1a',
      hairStyle: 'ondulado_casual',
      hairColor: '#3b2618',
      topStyle: 'tshirt',
      topColor: '#a855f7',
      bottomStyle: 'falda',
      bottomColor: '#1e1b4b',
      shoeColor: '#f8fafc',
      hasGlasses: false,
      hasAura: true,
      auraColor: '#c084fc',
      showPlumbob: true,
      faceSliders: { ...DEFAULT_FACE_SLIDERS, eyeSize: 0.35, cheekboneWidth: 0.25, jawWidth: -0.35 }
    },
    emp_hawaiian_paradise_0: {
      id: 'emp_hawaiian_paradise_0',
      displayName: 'Barista Hawaiian #1',
      roleTag: 'Hawaiian Paradise',
      baseModel: 'female_base',
      gender: 'F',
      age: 24,
      heightCm: 164,
      weightKg: 59,
      shoulderCm: 38,
      bustCm: 88,
      waistCm: 68,
      hipCm: 93,
      complexion: 'media',
      skinTone: 'S2',
      skinColor: '#d8a27c',
      eyeColor: '#2f1e14',
      hairStyle: 'ondulado_casual',
      hairColor: '#1f1612',
      topStyle: 'polo',
      topColor: '#f59e0b',
      bottomStyle: 'jeans',
      bottomColor: '#1e293b',
      shoeColor: '#111827',
      hasGlasses: false,
      hasAura: false,
      showPlumbob: false,
      faceSliders: { ...DEFAULT_FACE_SLIDERS }
    },
    emp_imperia_uniformes_0: {
      id: 'emp_imperia_uniformes_0',
      displayName: 'Asesora Mostrador Imperia #1',
      roleTag: 'Imperia Uniformes',
      baseModel: 'female_casual',
      gender: 'F',
      age: 28,
      heightCm: 165,
      weightKg: 60,
      shoulderCm: 38,
      bustCm: 90,
      waistCm: 70,
      hipCm: 96,
      complexion: 'media',
      skinTone: 'S2',
      skinColor: '#dfb08e',
      eyeColor: '#3b2416',
      hairStyle: 'largo_liso',
      hairColor: '#2d1c12',
      topStyle: 'filipina',
      topColor: '#10b981',
      bottomStyle: 'pantalon_vestir',
      bottomColor: '#064e3b',
      shoeColor: '#0f172a',
      hasGlasses: true,
      hasAura: false,
      showPlumbob: false,
      faceSliders: { ...DEFAULT_FACE_SLIDERS }
    },
    emp_papeleria_imperiarte_0: {
      id: 'emp_papeleria_imperiarte_0',
      displayName: 'Encargado Papelería #1',
      roleTag: 'Papelería Imperiarte',
      baseModel: 'male_base',
      gender: 'M',
      age: 26,
      heightCm: 173,
      weightKg: 71,
      shoulderCm: 43,
      bustCm: 94,
      waistCm: 80,
      hipCm: 94,
      complexion: 'media',
      skinTone: 'S2',
      skinColor: '#d49b74',
      eyeColor: '#2f1e14',
      hairStyle: 'corto_ejecutivo',
      hairColor: '#141414',
      topStyle: 'polo',
      topColor: '#3b82f6',
      bottomStyle: 'pantalon_vestir',
      bottomColor: '#1e293b',
      shoeColor: '#0f172a',
      hasGlasses: false,
      hasAura: false,
      showPlumbob: false,
      faceSliders: { ...DEFAULT_FACE_SLIDERS }
    },
    emp_bordados_veracruz_0: {
      id: 'emp_bordados_veracruz_0',
      displayName: 'Operador Bordados #1',
      roleTag: 'Bordados Veracruz',
      baseModel: 'male_base',
      gender: 'M',
      age: 32,
      heightCm: 174,
      weightKg: 78,
      shoulderCm: 45,
      bustCm: 100,
      waistCm: 88,
      hipCm: 98,
      complexion: 'robusta',
      skinTone: 'S3',
      skinColor: '#ae724e',
      eyeColor: '#1c140e',
      hairStyle: 'corto_ejecutivo',
      hairColor: '#111111',
      topStyle: 'polo',
      topColor: '#f43f5e',
      bottomStyle: 'cargo',
      bottomColor: '#334155',
      shoeColor: '#0f172a',
      hasGlasses: false,
      hasAura: false,
      showPlumbob: false,
      faceSliders: { ...DEFAULT_FACE_SLIDERS }
    },
    emp_taller_costura_0: {
      id: 'emp_taller_costura_0',
      displayName: 'Costurera Maestra #1',
      roleTag: 'Taller Imperia Costura',
      baseModel: 'female_base',
      gender: 'F',
      age: 39,
      heightCm: 160,
      weightKg: 64,
      shoulderCm: 39,
      bustCm: 94,
      waistCm: 76,
      hipCm: 99,
      complexion: 'media',
      skinTone: 'S3',
      skinColor: '#be835e',
      eyeColor: '#2a1a10',
      hairStyle: 'ondulado_casual',
      hairColor: '#241710',
      topStyle: 'filipina',
      topColor: '#a855f7',
      bottomStyle: 'pantalon_vestir',
      bottomColor: '#1e1b4b',
      shoeColor: '#111827',
      hasGlasses: false,
      hasAura: false,
      showPlumbob: false,
      faceSliders: { ...DEFAULT_FACE_SLIDERS }
    },
    emp_taller_publi_imperia_0: {
      id: 'emp_taller_publi_imperia_0',
      displayName: 'Operador / Prensa Publi #1',
      roleTag: 'Publi-Impresos',
      baseModel: 'male_base',
      gender: 'M',
      age: 27,
      heightCm: 175,
      weightKg: 73,
      shoulderCm: 44,
      bustCm: 96,
      waistCm: 81,
      hipCm: 95,
      complexion: 'atletica',
      skinTone: 'S2',
      skinColor: '#d8a27c',
      eyeColor: '#2b1b12',
      hairStyle: 'corto_ejecutivo',
      hairColor: '#1c1512',
      topStyle: 'tshirt',
      topColor: '#06b6d4',
      bottomStyle: 'cargo',
      bottomColor: '#1e293b',
      shoeColor: '#0f172a',
      hasGlasses: false,
      hasAura: false,
      showPlumbob: false,
      faceSliders: { ...DEFAULT_FACE_SLIDERS }
    }
  };
}

export function buildCustomerSims2Profile(customerId, shirtColorHex = '#3b82f6') {
  let hash = 0;
  for (let i = 0; i < String(customerId).length; i++) {
    hash = (hash * 31 + String(customerId).charCodeAt(i)) >>> 0;
  }
  const models = ['male_base', 'female_base', 'female_casual'];
  const baseModel = models[hash % models.length];
  const isMale = baseModel === 'male_base';
  const skinObj = SIMS2_SKIN_TONES[hash % SIMS2_SKIN_TONES.length];
  const compObj = SIMS2_COMPLEXIONS[(hash >>> 2) % 3]; // delgada, atletica, media
  const pantPalette = ['#1e293b', '#334155', '#0f172a', '#3f3f46', '#1e3a8a'];
  const hairPalette = ['#111111', '#2c1b12', '#4a3020', '#6b4728', '#8c6239'];
  return {
    id: `cust_${customerId}`,
    displayName: 'Cliente',
    baseModel,
    gender: isMale ? 'M' : 'F',
    age: 20 + (hash % 32),
    heightCm: isMale ? 168 + (hash % 14) : 156 + (hash % 12),
    weightKg: isMale ? 66 + (hash % 18) : 53 + (hash % 14),
    shoulderCm: isMale ? 43 : 37,
    bustCm: isMale ? 96 : 88,
    waistCm: isMale ? 80 : 68,
    hipCm: isMale ? 95 : 94,
    complexion: compObj.id,
    skinTone: skinObj.id,
    skinColor: skinObj.hex,
    eyeColor: '#2c1e16',
    hairStyle: 'nativo',
    hairColor: hairPalette[hash % hairPalette.length],
    topStyle: (hash % 3 === 0) ? 'camisa' : 'tshirt',
    topColor: shirtColorHex,
    bottomStyle: 'jeans',
    bottomColor: pantPalette[hash % pantPalette.length],
    shoeColor: '#111827',
    hasGlasses: baseModel === 'female_casual' && hash % 4 === 0,
    hasAura: false,
    showPlumbob: false,
    faceSliders: { ...DEFAULT_FACE_SLIDERS }
  };
}

// ============================================================================
// CACHÉ GLOBAL DE GLBs, MORPHS PARAMÉTRICOS SIMS 2 Y TEXTURAS DINÁMICAS PBR
// ============================================================================
const assetCache = {
  loadingPromise: null,
  loaded: false,
  models: {}, // key -> { scene, nativeHeight, hairGeometry, hairMaterial }
  hairPresets: {}, // 'corto_ejecutivo' | 'ondulado_casual' | 'largo_liso' -> { geometry, material }
  textures: new Map(), // cacheKey -> THREE.CanvasTexture
  glowTexture: null
};

const pendingSubscribers = new Set();

function getRadialGlowTexture() {
  if (assetCache.glowTexture) return assetCache.glowTexture;
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 62);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.42, 'rgba(255,255,255,0.62)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  assetCache.glowTexture = tex;
  return tex;
}

/**
 * Inyecta morph targets Sims 2 (Fat/Fit, Hombros, Busto, Cintura, Cadera y Cráneo/Rostro)
 * directamente en la geometría maestra del GLB una única vez al precargar.
 */
function injectSims2MorphTargets(mesh, nativeHeight) {
  const geom = mesh.geometry;
  if (!geom || !geom.attributes?.position || geom.userData._sims2MorphsInjected) return;
  geom.userData._sims2MorphsInjected = true;

  const isHead = mesh.name.includes('Head');
  const isHair = mesh.name.includes('Hair');
  const isBodySlot =
    mesh.name.includes('Body') ||
    mesh.name.includes('Outfit_Top') ||
    mesh.name.includes('Outfit_Bottom') ||
    mesh.name.includes('Footwear');

  // Nunca crear morphAttributes.position vacío en Eyes / Teeth / Glasses (rompe MeshDepthMaterial Shader)
  if (!isBodySlot && !isHead && !isHair) {
    return;
  }

  const pos = geom.attributes.position;
  const count = pos.count;

  if (!geom.morphAttributes.position) {
    geom.morphAttributes.position = [];
  }
  geom.morphTargetsRelative = true;
  const hasMorphNormals = Array.isArray(geom.morphAttributes.normal) && geom.morphAttributes.normal.length > 0;
  const hasMorphTangents = Array.isArray(geom.morphAttributes.tangent) && geom.morphAttributes.tangent.length > 0;
  if (!mesh.morphTargetDictionary) {
    mesh.morphTargetDictionary = {};
  }

  const addMorph = (name, computeDeltaFn) => {
    if (mesh.morphTargetDictionary[name] !== undefined) return;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      const vz = pos.getZ(i);
      const [dx, dy, dz] = computeDeltaFn(vx, vy, vz, i);
      arr[i * 3] = dx;
      arr[i * 3 + 1] = dy;
      arr[i * 3 + 2] = dz;
    }
    const attr = new THREE.Float32BufferAttribute(arr, 3);
    attr.name = name;
    const idx = geom.morphAttributes.position.length;
    geom.morphAttributes.position.push(attr);
    if (hasMorphNormals) {
      const zeroNorm = new THREE.Float32BufferAttribute(new Float32Array(count * 3), 3);
      zeroNorm.name = name;
      geom.morphAttributes.normal.push(zeroNorm);
    }
    if (hasMorphTangents) {
      const zeroTan = new THREE.Float32BufferAttribute(new Float32Array(count * 3), 3);
      zeroTan.name = name;
      geom.morphAttributes.tangent.push(zeroTan);
    }
    mesh.morphTargetDictionary[name] = idx;
  };

  const gauss = (val, center, width) => {
    const d = (val - center) / width;
    return Math.exp(-d * d);
  };

  if (isBodySlot) {
    addMorph('sims2_fatness', (x, y, z) => {
      const yn = y / nativeHeight;
      if (yn < 0.08 || yn > 0.84) return [0, 0, 0];
      const bellyWeight = gauss(yn, 0.59, 0.14) * (z > -0.02 ? 1.35 : 0.75);
      const thighHipWeight = gauss(yn, 0.45, 0.15) * 0.85;
      const w = Math.min(1.4, bellyWeight + thighHipWeight);
      const distXZ = Math.hypot(x, z) || 0.001;
      return [(x / distXZ) * 0.042 * w, 0, (z > 0 ? 0.052 : 0.030 * (z / distXZ)) * w];
    });

    addMorph('sims2_fitness', (x, y, z) => {
      const yn = y / nativeHeight;
      if (yn < 0.25 || yn > 0.84) return [0, 0, 0];
      const chestBroad = gauss(yn, 0.74, 0.08);
      const waistTaper = gauss(yn, 0.59, 0.07);
      const dx = Math.sign(x) * (0.024 * chestBroad - 0.012 * waistTaper) * Math.min(1, Math.abs(x) / 0.12);
      const dz = z > 0 ? (0.018 * chestBroad - 0.008 * waistTaper) : 0;
      return [dx, 0, dz];
    });

    addMorph('sims2_shoulders', (x, y, z) => {
      const yn = y / nativeHeight;
      const w = gauss(yn, 0.78, 0.065);
      if (w < 0.05) return [0, 0, 0];
      return [Math.sign(x) * 0.038 * w * Math.min(1, Math.abs(x) / 0.10), 0.006 * w, 0];
    });

    addMorph('sims2_bust', (x, y, z) => {
      const yn = y / nativeHeight;
      const w = gauss(yn, 0.72, 0.055) * (z > 0.015 ? 1.0 : 0.15);
      if (w < 0.04) return [0, 0, 0];
      return [Math.sign(x) * 0.014 * w, -0.004 * w, 0.042 * w];
    });

    addMorph('sims2_waist', (x, y, z) => {
      const yn = y / nativeHeight;
      const w = gauss(yn, 0.60, 0.065);
      if (w < 0.04) return [0, 0, 0];
      const r = Math.hypot(x, z) || 0.001;
      return [(x / r) * 0.036 * w, 0, (z / r) * 0.036 * w];
    });

    addMorph('sims2_hips', (x, y, z) => {
      const yn = y / nativeHeight;
      const w = gauss(yn, 0.49, 0.075);
      if (w < 0.04) return [0, 0, 0];
      const r = Math.hypot(x, z) || 0.001;
      return [(x / r) * 0.042 * w, 0, (z / r) * 0.032 * w];
    });
  }

  if (isHead || isHair) {
    // Centro craneal aproximado manteniendo costura del cuello intacta
    const headBaseY = nativeHeight * 0.885;
    const neckSealY = nativeHeight * 0.818;

    const neckFade = (y) => THREE.MathUtils.clamp((y - neckSealY) / 0.045, 0, 1);

    addMorph('face_jaw_width', (x, y, z) => {
      const fade = neckFade(y);
      const dy = y - headBaseY;
      const jawW = gauss(dy, -0.045, 0.035) * (z > -0.02 ? 1 : 0.3);
      return [Math.sign(x) * 0.016 * jawW * fade, 0, 0];
    });

    addMorph('face_cheek_width', (x, y, z) => {
      const fade = neckFade(y);
      const dy = y - headBaseY;
      const w = gauss(dy, -0.005, 0.028) * (z > 0.01 ? 1 : 0.2);
      return [Math.sign(x) * 0.014 * w * fade, 0, 0.008 * w * fade];
    });

    addMorph('face_chin_length', (x, y, z) => {
      const fade = neckFade(y);
      const dy = y - headBaseY;
      const w = gauss(dy, -0.068, 0.024) * gauss(x, 0, 0.032) * (z > 0.03 ? 1 : 0);
      return [0, -0.015 * w * fade, 0.014 * w * fade];
    });

    addMorph('face_forehead_width', (x, y, z) => {
      const fade = neckFade(y);
      const dy = y - headBaseY;
      const w = gauss(dy, 0.055, 0.032);
      return [Math.sign(x) * 0.015 * w * fade, 0.006 * w * fade, 0.010 * w * fade];
    });

    addMorph('face_nose_bridge', (x, y, z) => {
      const fade = neckFade(y);
      const dy = y - headBaseY;
      const w = gauss(dy, 0.002, 0.024) * gauss(x, 0, 0.018) * (z > 0.055 ? 1 : 0);
      return [0, -0.004 * w * fade, 0.014 * w * fade];
    });
  }

  mesh.updateMorphTargets();
}

/**
 * Genera o recupera de caché una textura PBR teñida desde la textura base original del GLB
 */
function getTintedCanvasTexture(sourceImage, hexColor, slotName = 'generic', styleId = 'default') {
  const key = `${slotName}_${styleId}_${hexColor}_${sourceImage?.width || 0}`;
  if (assetCache.textures.has(key)) {
    return assetCache.textures.get(key);
  }

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const col = new THREE.Color(hexColor || '#ffffff');

  if (sourceImage && sourceImage.width > 0) {
    ctx.drawImage(sourceImage, 0, 0, size, size);
    const imgData = ctx.getImageData(0, 0, size, size);
    const d = imgData.data;

    // Preservar textura de ojos excepto el anillo del iris si es slot 'eye'
    if (slotName === 'eye') {
      const rT = Math.round(col.r * 255);
      const gT = Math.round(col.g * 255);
      const bT = Math.round(col.b * 255);
      for (let i = 0; i < d.length; i += 4) {
        const lum = (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255;
        // Esclerótica blanca (> 0.65) vs Iris oscuro (0.15..0.60)
        if (lum > 0.14 && lum < 0.62) {
          const factor = 0.75 + lum * 0.85;
          d[i] = Math.min(255, Math.round(rT * factor));
          d[i + 1] = Math.min(255, Math.round(gT * factor));
          d[i + 2] = Math.min(255, Math.round(bT * factor));
        }
      }
      ctx.putImageData(imgData, 0, 0);
    } else {
      const rT = col.r;
      const gT = col.g;
      const bT = col.b;
      for (let i = 0; i < d.length; i += 4) {
        const lum = (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255;
        // Normalizar pliegues suaves alrededor de 0.35..1.15 para colores vivos sin matar negro/blanco
        const shade = slotName === 'skin' || slotName === 'hair' ? 0.52 + lum * 0.66 : 0.48 + lum * 0.72;
        d[i] = Math.min(255, Math.round(rT * 255 * shade));
        d[i + 1] = Math.min(255, Math.round(gT * 255 * shade));
        d[i + 2] = Math.min(255, Math.round(bT * 255 * shade));
      }
      ctx.putImageData(imgData, 0, 0);
    }
  } else {
    ctx.fillStyle = hexColor || '#cbd5e1';
    ctx.fillRect(0, 0, size, size);
  }

  // Detalles estilizados según prenda Sims 2
  if (slotName === 'top') {
    if (styleId === 'filipina') {
      ctx.strokeStyle = 'rgba(255,255,255,0.45)';
      ctx.lineWidth = 4;
      ctx.strokeRect(18, 18, size - 36, size - 36);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillRect(size * 0.48, 22, 6, size * 0.5);
    } else if (styleId === 'polo' || styleId === 'camisa') {
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.fillRect(size * 0.44, 10, 28, 36);
    }
  } else if (slotName === 'bottom' && styleId === 'jeans') {
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 2;
    for (let y = 0; y < size; y += 6) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.flipY = false; // Crucial en texturas UV de GLTF/GLB
  tex.needsUpdate = true;
  assetCache.textures.set(key, tex);
  return tex;
}

/**
 * Precarga asíncrona de los 3 modelos GLB y extracción de pelucas combinables en espacio Head
 */
export function preloadSims2Assets() {
  if (assetCache.loadingPromise) return assetCache.loadingPromise;

  const loader = new GLTFLoader();
  assetCache.loadingPromise = Promise.all(
    Object.entries(SIMS2_MODEL_PATHS).map(async ([key, url]) => {
      const gltf = await loader.loadAsync(url);
      const scene = gltf.scene;
      scene.updateMatrixWorld(true);

      const box = new THREE.Box3().setFromObject(scene);
      const nativeHeight = Math.max(1.4, box.max.y - box.min.y);

      let headBone = null;
      let hairMesh = null;

      scene.traverse((obj) => {
        if (obj.isBone && obj.name === 'Head') headBone = obj;
        if (obj.isSkinnedMesh) {
          obj.castShadow = true;
          obj.receiveShadow = true;
          obj.frustumCulled = false;
          injectSims2MorphTargets(obj, nativeHeight);
          if (obj.name.includes('Hair')) hairMesh = obj;
        }
      });

      assetCache.models[key] = { scene, nativeHeight, hairMesh, headBone };

      // Guardar preset de cabello estático alineado respecto al hueso Head para intercambio multi-modelo
      if (hairMesh && headBone) {
        const clonedGeom = hairMesh.geometry.clone();
        const hairToHeadLocal = new THREE.Matrix4()
          .copy(headBone.matrixWorld)
          .invert()
          .multiply(hairMesh.matrixWorld);
        clonedGeom.applyMatrix4(hairToHeadLocal);
        clonedGeom.morphAttributes = {};
        const presetId =
          key === 'male_base'
            ? 'corto_ejecutivo'
            : key === 'female_base'
              ? 'ondulado_casual'
              : 'largo_liso';
        assetCache.hairPresets[presetId] = {
          geometry: clonedGeom,
          baseImage: hairMesh.material?.map?.image || null
        };
      }
    })
  )
    .then(() => {
      assetCache.loaded = true;
      pendingSubscribers.forEach((cb) => cb());
      pendingSubscribers.clear();
    })
    .catch((err) => {
      console.error('Error cargando GLBs Sims 2:', err);
    });

  return assetCache.loadingPromise;
}

/**
 * Construye o actualiza los efectos especiales de Gerente y Familia (Aura Luminosa + Plumbob Sims 2)
 */
function syncAuraAndPlumbob(actorGroup, profile) {
  let auraGroup = actorGroup.getObjectByName('sims2_aura_group');
  if (!profile.hasAura && !profile.showPlumbob) {
    if (auraGroup) auraGroup.visible = false;
    return;
  }
  if (!auraGroup) {
    auraGroup = new THREE.Group();
    auraGroup.name = 'sims2_aura_group';

    // Anillo energético radial en el suelo
    const floorRingMat = new THREE.MeshBasicMaterial({
      map: getRadialGlowTexture(),
      color: profile.auraColor || '#facc15',
      transparent: true,
      opacity: 0.78,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const floorRing = new THREE.Mesh(new THREE.PlaneGeometry(1.45, 1.45), floorRingMat);
    floorRing.rotation.x = -Math.PI / 2;
    floorRing.position.y = 0.03;
    floorRing.name = 'aura_floor_ring';
    auraGroup.add(floorRing);

    // Columna de brillo envolvente alrededor del cuerpo
    const haloMat = new THREE.MeshBasicMaterial({
      color: profile.auraColor || '#facc15',
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const halo = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.56, 1.8, 24, 1, true), haloMat);
    halo.position.y = 0.92;
    halo.name = 'aura_body_column';
    auraGroup.add(halo);

    // Rombo / Plumbob característico de The Sims 2 encima de la cabeza
    const plumbobMat = new THREE.MeshStandardMaterial({
      color: '#4ade80',
      emissive: profile.auraColor || '#22c55e',
      emissiveIntensity: 0.95,
      roughness: 0.15,
      metalness: 0.35,
      transparent: true,
      opacity: 0.92
    });
    const plumbob = new THREE.Mesh(new THREE.OctahedronGeometry(0.11, 0), plumbobMat);
    plumbob.scale.set(0.75, 1.45, 0.75);
    plumbob.position.y = 2.08;
    plumbob.name = 'sims2_plumbob';
    auraGroup.add(plumbob);

    actorGroup.add(auraGroup);
  }

  auraGroup.visible = true;
  const col = profile.auraColor || '#facc15';
  const floorRing = auraGroup.getObjectByName('aura_floor_ring');
  const halo = auraGroup.getObjectByName('aura_body_column');
  const plumbob = auraGroup.getObjectByName('sims2_plumbob');
  if (floorRing) {
    floorRing.visible = Boolean(profile.hasAura);
    floorRing.material.color.set(col);
  }
  if (halo) {
    halo.visible = Boolean(profile.hasAura);
    halo.material.color.set(col);
  }
  if (plumbob) {
    plumbob.visible = Boolean(profile.showPlumbob || profile.hasAura);
    const plumbobHeight = Math.max(1.45, (profile.heightCm || 170) / 100 + 0.34);
    plumbob.position.y = plumbobHeight;
    plumbob.material.emissive.set(col);
  }
}

/**
 * Aplica todas las medidas exactas (estatura, peso, hombro, busto, cintura, cadera),
 * morfotipo Fits/Fats, 27 sliders faciales, estilo de cabello y tintado PBR sobre el actor clonado.
 */
export function applySims2ProfileToGroup(actorGroup, profile) {
  if (!actorGroup || !profile) return;
  actorGroup.userData.profile = { ...profile };

  syncAuraAndPlumbob(actorGroup, profile);

  const rigRoot = actorGroup.userData.rigRoot;
  if (!rigRoot) return; // Aún descargando GLB; se aplicará al terminar carga

  const nativeH = actorGroup.userData.nativeHeight || 1.76;
  const targetH = Math.max(1.12, Math.min(2.05, (profile.heightCm || 170) / 100));
  const yScale = targetH / nativeH;
  const bmiFactor = Math.max(
    0.85,
    Math.min(1.22, ((profile.weightKg || 68) / Math.pow(targetH, 2)) / 22.0)
  );
  // Compresión infantil / estatura real sin deformar cabeza grotescamente
  const xzScale = yScale * (0.94 + 0.06 * Math.sqrt(bmiFactor));
  rigRoot.scale.set(xzScale, yScale, xzScale);

  // Calcular pesos morph desde complexión + medidas exactas en cm
  const compMeta = SIMS2_COMPLEXIONS.find((c) => c.id === profile.complexion) || SIMS2_COMPLEXIONS[2];
  const rawFat = THREE.MathUtils.clamp(compMeta.fat * 0.55 + Math.max(0, (bmiFactor - 1.0) * 1.9), 0, 1.15);
  const rawFit = THREE.MathUtils.clamp(compMeta.fit, 0, 1.1);
  const baseShoulder = profile.gender === 'F' ? 37 : 44;
  const baseBust = profile.gender === 'F' ? 88 : 96;
  const baseWaist = profile.gender === 'F' ? 68 : 80;
  const baseHip = profile.gender === 'F' ? 94 : 96;

  const morphShoulder = THREE.MathUtils.clamp(((profile.shoulderCm ?? baseShoulder) - baseShoulder) / 8, -0.7, 1.1);
  const morphBust = THREE.MathUtils.clamp(((profile.bustCm ?? baseBust) - baseBust) / 16, -0.5, 1.2);
  const morphWaist = THREE.MathUtils.clamp(((profile.waistCm ?? baseWaist) - baseWaist) / 18, -0.6, 1.2);
  const morphHips = THREE.MathUtils.clamp(((profile.hipCm ?? baseHip) - baseHip) / 16, -0.5, 1.2);

  const fs = { ...DEFAULT_FACE_SLIDERS, ...(profile.faceSliders || {}) };
  const morphValues = {
    sims2_fatness: rawFat,
    sims2_fitness: rawFit,
    sims2_shoulders: morphShoulder,
    sims2_bust: morphBust,
    sims2_waist: morphWaist,
    sims2_hips: morphHips,
    face_jaw_width: THREE.MathUtils.clamp(fs.jawWidth * 0.8 + fs.faceWidth * 0.4, -1, 1),
    face_cheek_width: THREE.MathUtils.clamp(fs.cheekboneWidth * 0.85 + fs.faceWidth * 0.4, -1, 1),
    face_chin_length: THREE.MathUtils.clamp(fs.chinLength, -1, 1),
    face_forehead_width: THREE.MathUtils.clamp(fs.foreheadSlope * 0.8 + fs.faceWidth * 0.35, -1, 1),
    face_nose_bridge: THREE.MathUtils.clamp(fs.noseBridgeCurve * 0.7 + fs.noseLength * 0.5, -1, 1),
    // Mapeo a morph targets ARKit nativos de Wolf3D_Head
    browInnerUp: Math.max(0, fs.browHeight * 0.55 + fs.browThickness * 0.35),
    browDownLeft: Math.max(0, -fs.browHeight * 0.5 + fs.browTilt * 0.4),
    browDownRight: Math.max(0, -fs.browHeight * 0.5 - fs.browTilt * 0.4),
    browOuterUpLeft: Math.max(0, fs.browCurve * 0.6),
    browOuterUpRight: Math.max(0, fs.browCurve * 0.6),
    eyeWideLeft: Math.max(0, fs.eyeSize * 0.65 + fs.eyeHeight * 0.4),
    eyeWideRight: Math.max(0, fs.eyeSize * 0.65 + fs.eyeHeight * 0.4),
    eyeSquintLeft: Math.max(0, fs.eyelidOpenness * 0.5 + fs.eyeAngle * 0.35),
    eyeSquintRight: Math.max(0, fs.eyelidOpenness * 0.5 + fs.eyeAngle * 0.35),
    noseSneerLeft: Math.max(0, fs.nostrilFlare * 0.55 + fs.noseTipWidth * 0.35),
    noseSneerRight: Math.max(0, fs.nostrilFlare * 0.55 + fs.noseTipWidth * 0.35),
    mouthSmileLeft: Math.max(0, fs.mouthHeight * 0.45 + fs.mouthCornerCurve * 0.55),
    mouthSmileRight: Math.max(0, fs.mouthHeight * 0.45 + fs.mouthCornerCurve * 0.55),
    mouthStretchLeft: Math.max(0, fs.mouthWidth * 0.55),
    mouthStretchRight: Math.max(0, fs.mouthWidth * 0.55),
    mouthPucker: Math.max(0, -fs.mouthWidth * 0.5 + fs.mouthDepth * 0.45),
    mouthShrugUpper: Math.max(0, fs.upperLipThickness * 0.6),
    mouthLowerDownLeft: Math.max(0, fs.lowerLipThickness * 0.5),
    mouthLowerDownRight: Math.max(0, fs.lowerLipThickness * 0.5),
    jawForward: THREE.MathUtils.clamp(fs.chinLength * 0.35, 0, 0.7),
    cheekSquintLeft: Math.max(0, fs.cheekboneWidth * 0.45),
    cheekSquintRight: Math.max(0, fs.cheekboneWidth * 0.45)
  };

  rigRoot.traverse((obj) => {
    if (!obj.isMesh) return;

    // 1. Aplicar Morph Targets si existen
    if (obj.morphTargetDictionary && obj.morphTargetInfluences) {
      for (const [mName, mIdx] of Object.entries(obj.morphTargetDictionary)) {
        if (mName === 'eyeBlinkLeft' || mName === 'eyeBlinkRight') continue; // Lo anima blink en 60fps
        if (morphValues[mName] !== undefined) {
          obj.morphTargetInfluences[mIdx] = morphValues[mName];
        }
      }
    }

    // 2. Visibilidad de lentes y cabello nativo
    if (obj.name.includes('Glasses')) {
      obj.visible = Boolean(profile.hasGlasses);
    }
    if (obj.name.includes('Hair') && obj.isSkinnedMesh) {
      obj.visible = profile.hairStyle === 'nativo';
    }

    // 3. Re-tintar texturas PBR en materiales clonados por slot
    const mat = obj.material;
    if (!mat) return;
    const origImg = obj.userData.originalMapImage;

    if (obj.name.includes('EyeLeft') || obj.name.includes('EyeRight')) {
      mat.map = getTintedCanvasTexture(origImg, profile.eyeColor || '#2c1e16', 'eye', 'iris');
      mat.needsUpdate = true;
    } else if (obj.name.includes('Head') || obj.name.includes('Body')) {
      mat.map = getTintedCanvasTexture(origImg, profile.skinColor || '#d8a27c', 'skin', profile.skinTone || 'S2');
      mat.needsUpdate = true;
    } else if (obj.name.includes('Hair')) {
      mat.map = getTintedCanvasTexture(origImg, profile.hairColor || '#1e1b18', 'hair', 'hair');
      mat.needsUpdate = true;
    } else if (obj.name.includes('Outfit_Top')) {
      mat.map = getTintedCanvasTexture(origImg, profile.topColor || '#3b82f6', 'top', profile.topStyle || 'polo');
      mat.needsUpdate = true;
    } else if (obj.name.includes('Outfit_Bottom')) {
      mat.map = getTintedCanvasTexture(origImg, profile.bottomColor || '#1e293b', 'bottom', profile.bottomStyle || 'jeans');
      mat.needsUpdate = true;
    } else if (obj.name.includes('Footwear')) {
      mat.map = getTintedCanvasTexture(origImg, profile.shoeColor || '#0f172a', 'shoe', 'shoe');
      mat.needsUpdate = true;
    }
  });

  // 4. Swapping de pelucas personalizadas en el hueso Head
  const headBone = actorGroup.userData.bones?.Head;
  if (headBone) {
    let customHairMesh = headBone.getObjectByName('sims2_custom_hair_attachment');
    if (profile.hairStyle && profile.hairStyle !== 'nativo' && profile.hairStyle !== 'calvo') {
      const preset = assetCache.hairPresets[profile.hairStyle];
      if (preset) {
        if (!customHairMesh) {
          customHairMesh = new THREE.Mesh(
            preset.geometry,
            new THREE.MeshStandardMaterial({ roughness: 0.72, metalness: 0.05 })
          );
          customHairMesh.name = 'sims2_custom_hair_attachment';
          customHairMesh.castShadow = true;
          headBone.add(customHairMesh);
        } else if (customHairMesh.geometry !== preset.geometry) {
          customHairMesh.geometry = preset.geometry;
        }
        customHairMesh.visible = true;
        customHairMesh.material.map = getTintedCanvasTexture(
          preset.baseImage,
          profile.hairColor || '#1e1b18',
          'hair',
          profile.hairStyle
        );
        customHairMesh.material.needsUpdate = true;
      }
    } else if (customHairMesh) {
      customHairMesh.visible = false;
    }
  }
}

/**
 * Instancia el esqueleto GLB clonado real dentro de actorGroup cuando el asset está listo
 */
function hydrateActorWithGLB(actorGroup, profile) {
  const modelKey = SIMS2_MODEL_PATHS[profile.baseModel] ? profile.baseModel : 'male_base';
  const entry = assetCache.models[modelKey];
  if (!entry) return false;

  // Limpiar rig previo si cambió el baseModel en CAS Studio
  const oldRig = actorGroup.userData.rigRoot;
  if (oldRig) {
    actorGroup.remove(oldRig);
  }

  const clonedScene = SkeletonUtils.clone(entry.scene);
  clonedScene.name = `sims2_rig_${modelKey}`;
  clonedScene.updateMatrixWorld(true);

  const bones = {};
  const invRootQuat = new THREE.Quaternion();
  clonedScene.getWorldQuaternion(invRootQuat);

  // Clonar materiales independientemente y capturar poses de descanso + eje world->local
  clonedScene.traverse((obj) => {
    if (obj.isBone) {
      obj.userData.restQuat = obj.quaternion.clone();
      obj.userData.restPos = obj.position.clone();
      const wq = new THREE.Quaternion();
      obj.getWorldQuaternion(wq);
      obj.userData.restWorldQuatInv = wq.clone().invert();
      bones[obj.name] = obj;
    }
    if (obj.isMesh) {
      if (obj.morphTargetInfluences) {
        obj.morphTargetInfluences = obj.morphTargetInfluences.slice();
      }
      if (obj.material) {
        obj.userData.originalMapImage = obj.material.map?.image || null;
        obj.material = obj.material.clone();
      }
    }
  });

  // Anclas para accesorios sostenidos en ambas manos (tazas, crepas, pala/rastrillo, vasos, telas)
  let rightHandSocket = null;
  if (bones.RightHand) {
    rightHandSocket = new THREE.Group();
    rightHandSocket.name = 'hand_item_socket';
    rightHandSocket.position.set(0, 0.08, 0.03);
    bones.RightHand.add(rightHandSocket);
  }
  let leftHandSocket = null;
  if (bones.LeftHand) {
    leftHandSocket = new THREE.Group();
    leftHandSocket.name = 'left_hand_item_socket';
    leftHandSocket.position.set(0, 0.08, 0.03);
    bones.LeftHand.add(leftHandSocket);
  }

  actorGroup.add(clonedScene);
  actorGroup.userData.rigRoot = clonedScene;
  actorGroup.userData.baseModelLoaded = modelKey;
  actorGroup.userData.nativeHeight = entry.nativeHeight;
  actorGroup.userData.bones = bones;
  actorGroup.userData.rightHandSocket = rightHandSocket;
  actorGroup.userData.leftHandSocket = leftHandSocket;

  applySims2ProfileToGroup(actorGroup, profile);
  return true;
}

/**
 * Crea un actor 3D basado 100% en SkinnedMesh GLB Sims 2 (CERO cilindros/esferas/cajas primitivas)
 */
export function createSims2ActorGroup(profile) {
  const actorGroup = new THREE.Group();
  actorGroup.userData.profile = { ...profile };
  actorGroup.userData.isSims2Avatar = true;

  syncAuraAndPlumbob(actorGroup, profile);

  if (assetCache.loaded && assetCache.models[profile.baseModel || 'male_base']) {
    hydrateActorWithGLB(actorGroup, profile);
  } else {
    preloadSims2Assets().then(() => {
      if (actorGroup && !actorGroup.userData.disposed) {
        hydrateActorWithGLB(actorGroup, actorGroup.userData.profile || profile);
      }
    });
  }
  return actorGroup;
}

/**
 * Cambia dinámicamente el modelo o apariencia desde el Studio CAS sin perder la posición ni la animación
 */
export function syncSims2ActorProfile(actorGroup, nextProfile) {
  if (!actorGroup || !nextProfile) return;
  const prevModel = actorGroup.userData.baseModelLoaded;
  actorGroup.userData.profile = { ...nextProfile };
  if (assetCache.loaded && prevModel !== nextProfile.baseModel) {
    hydrateActorWithGLB(actorGroup, nextProfile);
  } else {
    applySims2ProfileToGroup(actorGroup, nextProfile);
  }
}

// Reutilizables cero-GC para animación a 60 FPS en el esqueleto de 67 huesos
const _axisX = new THREE.Vector3(1, 0, 0);
const _axisY = new THREE.Vector3(0, 1, 0);
const _axisZ = new THREE.Vector3(0, 0, 1);
const _tmpAxis = new THREE.Vector3();
const _tmpQ1 = new THREE.Quaternion();
const _tmpQ2 = new THREE.Quaternion();

const _rigInvMat = new THREE.Matrix4();
const _rigWorldQ = new THREE.Quaternion();
const _rigWorldQInv = new THREE.Quaternion();
const _parentWorldQ = new THREE.Quaternion();
const _parentRigQ = new THREE.Quaternion();
const _parentRigQInv = new THREE.Quaternion();
const _qDeltaRig = new THREE.Quaternion();
const _qLocalDelta = new THREE.Quaternion();
const _vS = new THREE.Vector3();
const _vF = new THREE.Vector3();
const _vH = new THREE.Vector3();
const _vT = new THREE.Vector3();
const _vP = new THREE.Vector3();
const _vE = new THREE.Vector3();
const _vDirST = new THREE.Vector3();
const _vPoleProj = new THREE.Vector3();
const _vDesiredArm = new THREE.Vector3();
const _vDesiredFore = new THREE.Vector3();
const _vCurArm = new THREE.Vector3();
const _vCurFore = new THREE.Vector3();
const _vProjCur = new THREE.Vector3();
const _vProjDes = new THREE.Vector3();
const _vCross = new THREE.Vector3();
const _vHandUp = new THREE.Vector3();
const _vTargetHandUp = new THREE.Vector3();

function rotateBoneModelSpace(bone, rx, ry, rz) {
  if (!bone || !bone.userData.restQuat || !bone.userData.restWorldQuatInv) return;
  bone.quaternion.copy(bone.userData.restQuat);
  const inv = bone.userData.restWorldQuatInv;
  if (Math.abs(rx) > 0.0005) {
    _tmpAxis.copy(_axisX).applyQuaternion(inv).normalize();
    _tmpQ1.setFromAxisAngle(_tmpAxis, rx);
    bone.quaternion.multiply(_tmpQ1);
  }
  if (Math.abs(ry) > 0.0005) {
    _tmpAxis.copy(_axisY).applyQuaternion(inv).normalize();
    _tmpQ1.setFromAxisAngle(_tmpAxis, ry);
    bone.quaternion.multiply(_tmpQ1);
  }
  if (Math.abs(rz) > 0.0005) {
    _tmpAxis.copy(_axisZ).applyQuaternion(inv).normalize();
    _tmpQ2.setFromAxisAngle(_tmpAxis, rz);
    bone.quaternion.multiply(_tmpQ2);
  }
}

function getPosInRig(bone, rigInvMat, outVec) {
  outVec.setFromMatrixPosition(bone.matrixWorld).applyMatrix4(rigInvMat);
  return outVec;
}

function applyRigDeltaToBone(bone, qDeltaRig, rigWorldQInv) {
  bone.parent.getWorldQuaternion(_parentWorldQ);
  _parentRigQ.multiplyQuaternions(rigWorldQInv, _parentWorldQ);
  _parentRigQInv.copy(_parentRigQ).invert();
  _qLocalDelta.multiplyQuaternions(_parentRigQInv, qDeltaRig).multiply(_parentRigQ);
  bone.quaternion.premultiply(_qLocalDelta);
}

/**
 * Solver analítico de 2 huesos (IK en espacio nativo de rigRoot) para posicionar
 * LeftHand / RightHand exactamente en coordenadas [x, y, z] sin T-pose ni torsiones.
 */
function solveArmIKCharacterSpace(
  rigRoot,
  sideSign, // +1 = Left (+X), -1 = Right (-X)
  armBone,
  foreArmBone,
  handBone,
  targetX,
  targetY,
  targetZ,
  poleX,
  poleY,
  poleZ,
  handMode = 'natural'
) {
  if (!rigRoot || !armBone || !foreArmBone || !handBone) return;
  if (!armBone.userData.restQuat || !foreArmBone.userData.restQuat) return;

  armBone.quaternion.copy(armBone.userData.restQuat);
  foreArmBone.quaternion.copy(foreArmBone.userData.restQuat);
  if (handBone.userData.restQuat) {
    handBone.quaternion.copy(handBone.userData.restQuat);
  }

  rigRoot.updateMatrixWorld(true);
  _rigInvMat.copy(rigRoot.matrixWorld).invert();
  rigRoot.getWorldQuaternion(_rigWorldQ);
  _rigWorldQInv.copy(_rigWorldQ).invert();

  getPosInRig(armBone, _rigInvMat, _vS);
  getPosInRig(foreArmBone, _rigInvMat, _vF);
  getPosInRig(handBone, _rigInvMat, _vH);

  const l1 = _vS.distanceTo(_vF);
  const l2 = _vF.distanceTo(_vH);
  if (l1 < 0.02 || l2 < 0.02) return;

  _vT.set(targetX, targetY, targetZ);
  _vP.set(poleX, poleY, poleZ);

  _vDirST.subVectors(_vT, _vS);
  const rawDist = _vDirST.length();
  const minDist = Math.abs(l1 - l2) + 0.02;
  const maxDist = l1 + l2 - 0.004;
  const d = THREE.MathUtils.clamp(rawDist, minDist, maxDist);
  if (rawDist > 1e-5) {
    _vDirST.divideScalar(rawDist);
  } else {
    _vDirST.set(0, -1, 0);
  }

  const cosAlpha = THREE.MathUtils.clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1);
  const sinAlpha = Math.sqrt(Math.max(0, 1 - cosAlpha * cosAlpha));

  _vPoleProj.subVectors(_vP, _vS);
  const projDot = _vPoleProj.dot(_vDirST);
  _vPoleProj.addScaledVector(_vDirST, -projDot);
  if (_vPoleProj.lengthSq() < 1e-6) {
    _vPoleProj.set(sideSign * 0.25, 0, -1);
    const pDot = _vPoleProj.dot(_vDirST);
    _vPoleProj.addScaledVector(_vDirST, -pDot);
  }
  _vPoleProj.normalize();

  _vE
    .copy(_vS)
    .addScaledVector(_vDirST, l1 * cosAlpha)
    .addScaledVector(_vPoleProj, l1 * sinAlpha);

  _vDesiredArm.subVectors(_vE, _vS).normalize();
  _vDesiredFore.subVectors(_vT, _vE).normalize();

  // 1. Alinear Arm hacia el codo objetivo E
  _vCurArm.subVectors(_vF, _vS).normalize();
  _qDeltaRig.setFromUnitVectors(_vCurArm, _vDesiredArm);
  applyRigDeltaToBone(armBone, _qDeltaRig, _rigWorldQInv);

  // 2. Twist de Arm para que el plano del codo apunte exactamente hacia T
  armBone.updateMatrixWorld(true);
  getPosInRig(foreArmBone, _rigInvMat, _vF);
  getPosInRig(handBone, _rigInvMat, _vH);
  _vCurFore.subVectors(_vH, _vF).normalize();

  _vProjCur.copy(_vCurFore).addScaledVector(_vDesiredArm, -_vCurFore.dot(_vDesiredArm));
  _vProjDes.copy(_vDesiredFore).addScaledVector(_vDesiredArm, -_vDesiredFore.dot(_vDesiredArm));
  if (_vProjCur.lengthSq() > 1e-5 && _vProjDes.lengthSq() > 1e-5) {
    _vProjCur.normalize();
    _vProjDes.normalize();
    const dot = THREE.MathUtils.clamp(_vProjCur.dot(_vProjDes), -1, 1);
    _vCross.crossVectors(_vProjCur, _vProjDes);
    const sinSign = _vCross.dot(_vDesiredArm) >= 0 ? 1 : -1;
    const twistAngle = Math.acos(dot) * sinSign;
    if (Math.abs(twistAngle) > 1e-4) {
      _qDeltaRig.setFromAxisAngle(_vDesiredArm, twistAngle);
      applyRigDeltaToBone(armBone, _qDeltaRig, _rigWorldQInv);
    }
  }

  // 3. Alinear ForeArm hacia la mano objetivo T
  armBone.updateMatrixWorld(true);
  getPosInRig(foreArmBone, _rigInvMat, _vF);
  getPosInRig(handBone, _rigInvMat, _vH);
  _vCurFore.subVectors(_vH, _vF).normalize();
  _qDeltaRig.setFromUnitVectors(_vCurFore, _vDesiredFore);
  applyRigDeltaToBone(foreArmBone, _qDeltaRig, _rigWorldQInv);

  // 4. Orientación de muñeca según la acción (vertical para vaso, inclinada para verter, etc.)
  if (handMode !== 'natural') {
    foreArmBone.updateMatrixWorld(true);
    handBone.getWorldQuaternion(_parentWorldQ);
    _parentRigQ.multiplyQuaternions(_rigWorldQInv, _parentWorldQ);
    _vHandUp.copy(_axisY).applyQuaternion(_parentRigQ).normalize();

    if (handMode === 'upright') {
      _vTargetHandUp.set(0, 1, 0.08).normalize();
    } else if (handMode === 'pour_left') {
      _vTargetHandUp.set(0.72, 0.48, 0.45).normalize();
    } else if (handMode === 'rake_down') {
      _vTargetHandUp.set(0.15, -0.35, 0.92).normalize();
    } else if (handMode === 'waist') {
      _vTargetHandUp.set(-sideSign * 0.65, -0.65, 0.35).normalize();
    } else if (handMode === 'ear_phone') {
      _vTargetHandUp.set(0.28, 0.92, 0.15).normalize();
    } else {
      _vTargetHandUp.copy(_vHandUp);
    }

    _qDeltaRig.setFromUnitVectors(_vHandUp, _vTargetHandUp);
    applyRigDeltaToBone(handBone, _qDeltaRig, _rigWorldQInv);
  }
}

/**
 * Máquina de Animación Esquelética (67 huesos) con Solver Bimanual IK en espacio de personaje
 * para caminata, postura frente al cliente, raspadora, crepera, costura, TPV, comida, TV y celular.
 */
export function animateSims2Actor(
  actorGroup,
  animType = 'IDLE_WAIT',
  isMoving = false,
  nowSec = 0,
  animMeta = null
) {
  if (!actorGroup) return;

  // Animar Plumbob y Aura en todos los frames
  const auraGroup = actorGroup.getObjectByName('sims2_aura_group');
  if (auraGroup && auraGroup.visible) {
    const plumbob = auraGroup.getObjectByName('sims2_plumbob');
    const floorRing = auraGroup.getObjectByName('aura_floor_ring');
    const halo = auraGroup.getObjectByName('aura_body_column');
    if (plumbob) {
      const baseY = Math.max(1.45, (actorGroup.userData.profile?.heightCm || 170) / 100 + 0.34);
      plumbob.position.y = baseY + Math.sin(nowSec * 3.1) * 0.05;
      plumbob.rotation.y = nowSec * 1.9;
    }
    if (floorRing) {
      const pulse = 1 + Math.sin(nowSec * 2.8) * 0.09;
      floorRing.scale.set(pulse, pulse, 1);
    }
    if (halo) {
      halo.material.opacity = 0.13 + Math.sin(nowSec * 3.4) * 0.05;
    }
  }

  const rigRoot = actorGroup.userData.rigRoot;
  const bones = actorGroup.userData.bones;
  if (!bones || !rigRoot) return;

  const {
    Hips,
    Spine,
    Spine2,
    Head,
    LeftArm,
    LeftForeArm,
    LeftHand,
    RightArm,
    RightForeArm,
    RightHand,
    LeftUpLeg,
    LeftLeg,
    RightUpLeg,
    RightLeg
  } = bones;

  const profile = actorGroup.userData.profile || {};
  const isFemale = (animMeta?.gender || profile.gender) === 'F';
  const stepProgress = THREE.MathUtils.clamp(animMeta?.stepProgress ?? 0, 0, 1);
  const stepCodigo = animMeta?.stepCodigo || '';

  // Reset de posición vertical de cadera
  if (Hips && Hips.userData.restPos) {
    Hips.position.copy(Hips.userData.restPos);
  }

  // Parpadeo orgánico Sims 2 cada ~3.8 segundos
  const blinkPhase = nowSec % 3.8;
  const blinkVal = blinkPhase > 3.66 ? Math.sin(((blinkPhase - 3.66) / 0.14) * Math.PI) : 0;
  rigRoot.traverse((m) => {
    if (m.isSkinnedMesh && m.name.includes('Head') && m.morphTargetDictionary && m.morphTargetInfluences) {
      const biL = m.morphTargetDictionary.eyeBlinkLeft;
      const biR = m.morphTargetDictionary.eyeBlinkRight;
      if (biL !== undefined) m.morphTargetInfluences[biL] = blinkVal;
      if (biR !== undefined) m.morphTargetInfluences[biR] = blinkVal;
    }
  });

  // Valores por defecto de torso, cabeza y piernas
  let lLegRx = 0, rLegRx = 0, lKneeRx = 0, rKneeRx = 0;
  let spineRx = 0, spineRy = 0, spineRz = 0;
  let headRx = 0, headRy = 0;
  let hipDropY = 0;

  // Objetivos por defecto de manos en espacio nativo de rigRoot (~1.76m):
  // Brazos relajados rectos hacia abajo junto al cuerpo (NUNCA T-pose abierta)
  let lHand = [0.18, 0.85, 0.03];
  let rHand = [-0.18, 0.85, 0.03];
  let lPole = [0.30, 1.12, -0.25];
  let rPole = [-0.30, 1.12, -0.25];
  let lHandMode = 'natural';
  let rHandMode = 'natural';

  if (isMoving) {
    const stride = nowSec * 7.8;
    const legSwing = Math.sin(stride) * 0.48;
    lLegRx = -legSwing;
    rLegRx = legSwing;
    lKneeRx = Math.max(0, Math.sin(stride) * 0.52);
    rKneeRx = Math.max(0, -Math.sin(stride) * 0.52);
    hipDropY = -Math.abs(Math.cos(stride)) * 0.025;
    spineRy = Math.sin(stride) * 0.07;

    // Balanceo natural de brazos pegados al costado opuesto a cada zancada
    const armSwing = Math.sin(stride) * 0.19;
    lHand = [0.19, 0.87 + Math.abs(armSwing) * 0.14, 0.03 + armSwing];
    rHand = [-0.19, 0.87 + Math.abs(armSwing) * 0.14, 0.03 - armSwing];
    lPole = [0.27, 1.12, -0.26 - Math.max(0, armSwing) * 0.35];
    rPole = [-0.27, 1.12, -0.26 - Math.max(0, -armSwing) * 0.35];
  } else if (
    animType === 'EAT_AT_TABLE' ||
    animType === 'WATCH_YOUTUBE' ||
    animType === 'WATCH_TV_SOFA'
  ) {
    // Sentado real con flexión de cadera y rodilla ~86°
    hipDropY = -0.36;
    lLegRx = -1.48;
    rLegRx = -1.48;
    lKneeRx = 1.48;
    rKneeRx = 1.48;

    if (animType === 'EAT_AT_TABLE') {
      const spoon = Math.sin(nowSec * 3.4);
      const lift = Math.max(0, spoon);
      spineRx = 0.08;
      lHand = [0.16, 0.82, 0.28];
      rHand = [-0.10, 0.84 + lift * 0.30, 0.28 - lift * 0.08];
      lPole = [0.30, 0.96, -0.10];
      rPole = [-0.30, 0.96, -0.10];
      headRx = 0.12 - lift * 0.08;
    } else if (animType === 'WATCH_YOUTUBE') {
      spineRx = 0.10;
      lHand = [0.06, 0.98, 0.27];
      rHand = [-0.06, 0.98, 0.27];
      lPole = [0.26, 0.95, 0.0];
      rPole = [-0.26, 0.95, 0.0];
      headRx = 0.28;
    } else {
      // Sofá viendo Smart TV en oficina con clima
      spineRx = -0.10;
      lHand = [0.22, 0.78, 0.20];
      rHand = [-0.22, 0.78, 0.20];
      lPole = [0.34, 0.96, -0.15];
      rPole = [-0.34, 0.96, -0.15];
      headRx = -0.04;
      headRy = Math.sin(nowSec * 0.8) * 0.08;
    }
  } else if (animType === 'TALK_CLIENT') {
    // Frente a un cliente: posturas de vendedor experimentado (brazos a la altura de la cintura
    // gesticulando como orador), alternando en mujeres con manos en la cintura.
    const cycle = nowSec * 0.45;
    const isFemaleWaistPhase = isFemale && Math.sin(cycle) > 0.35;
    spineRx = 0.04;
    headRx = Math.sin(nowSec * 1.8) * 0.05;
    headRy = Math.sin(nowSec * 1.1) * 0.10;

    if (isFemaleWaistPhase) {
      // Mano izquierda en la cintura, mano derecha gesticulando suavemente al hablar
      lHand = [0.15, 1.03, 0.02];
      lPole = [0.36, 1.15, -0.06];
      lHandMode = 'waist';
      const g = Math.sin(nowSec * 3.8);
      rHand = [-0.16 + Math.cos(nowSec * 2.6) * 0.05, 1.09 + g * 0.04, 0.26 + Math.sin(nowSec * 2.2) * 0.04];
      rPole = [-0.30, 1.10, -0.08];
    } else {
      // Orador / vendedor experimentado: manos a la altura de la cintura en movimiento expresivo
      const gL = Math.sin(nowSec * 3.6);
      const gR = Math.sin(nowSec * 3.6 + 1.1);
      lHand = [0.17 + Math.cos(nowSec * 2.3) * 0.04, 1.08 + gL * 0.045, 0.26 + Math.sin(nowSec * 2.0) * 0.04];
      rHand = [-0.17 - Math.cos(nowSec * 2.5) * 0.04, 1.08 + gR * 0.045, 0.26 + Math.cos(nowSec * 2.1) * 0.04];
      lPole = [0.30, 1.10, -0.10];
      rPole = [-0.30, 1.10, -0.10];
    }
  } else if (animType === 'CRANK_LEFT_HANDLE') {
    // RASPADORA: mano izquierda mueve la manivela MUY LENTAMENTE solo ~3 cm (0.03m) en total
    // durante toda la presión; mano derecha sostiene el vaso COMPLETAMENTE VERTICAL debajo del hueco.
    spineRx = 0.09;
    headRx = 0.14;
    const crankDrop = stepProgress > 0 ? stepProgress * 0.03 : ((Math.sin(nowSec * 0.6) + 1) * 0.5) * 0.03;
    lHand = [0.20, 1.25 - crankDrop, 0.30];
    lPole = [0.36, 1.22, -0.02];
    rHand = [-0.08, 1.02, 0.34];
    rPole = [-0.28, 1.08, 0.02];
    rHandMode = 'upright';
  } else if (animType === 'PRESS_RIGHT_SWITCH') {
    // Botón de encendido/apagado al lado derecho de la raspadora
    spineRx = 0.06;
    headRx = 0.10;
    const pressZ = 0.32 + Math.sin(nowSec * 5.0) * 0.02;
    rHand = [-0.18, 1.15, pressZ];
    rPole = [-0.34, 1.16, -0.05];
    lHand = [0.16, 0.96, 0.18];
    lPole = [0.28, 1.10, -0.16];
  } else if (animType === 'POUR_BATTER') {
    // CREPERA PASO 1: mano derecha vierte la mezcla sobre la crepera mientras
    // mano izquierda permanece sosteniendo la pala (crepe_rake) al lado lista para esparcir.
    spineRx = 0.12;
    headRx = 0.18;
    const pourWobble = Math.sin(nowSec * 3.0) * 0.015;
    rHand = [-0.04 + pourWobble, 1.19, 0.36];
    rPole = [-0.28, 1.16, 0.02];
    rHandMode = 'pour_left';
    lHand = [0.21, 1.03, 0.26];
    lPole = [0.34, 1.10, -0.08];
  } else if (animType === 'CIRCULAR_RAKE') {
    // CREPERA PASO 2: la mano izquierda toma protagonismo y gira la pala en un movimiento
    // circular continuo esparciendo adecuadamente la masa sobre toda la crepera.
    spineRx = 0.14;
    headRx = 0.20;
    const theta = nowSec * 5.2;
    const radius = 0.125;
    lHand = [0.02 + Math.cos(theta) * radius, 1.02, 0.35 + Math.sin(theta) * radius];
    lPole = [0.28, 1.12, 0.02];
    lHandMode = 'rake_down';
    rHand = [-0.19, 0.90, 0.12];
    rPole = [-0.30, 1.10, -0.20];
  } else if (animType === 'SPREAD_INGREDIENTS') {
    // Untar Nutella/jarabe/toppings o depilar vinil
    spineRx = 0.12;
    headRx = 0.18;
    if (stepCodigo === 'POUR_SYRUP_FLAVOR' || stepCodigo === 'ADD_SYRUP') {
      // Raspado: mano izquierda carga el vaso vertical y derecha vierte el jarabe
      lHand = [0.09, 1.03, 0.28];
      lPole = [0.28, 1.08, -0.06];
      lHandMode = 'upright';
      const swirl = nowSec * 4.0;
      rHand = [-0.05 + Math.cos(swirl) * 0.035, 1.21, 0.30 + Math.sin(swirl) * 0.035];
      rPole = [-0.28, 1.16, 0.0];
      rHandMode = 'pour_left';
    } else {
      const brush = Math.sin(nowSec * 5.2) * 0.09;
      lHand = [0.16, 1.00, 0.26];
      lPole = [0.30, 1.10, -0.08];
      rHand = [-0.05 + brush, 1.02, 0.34 + Math.cos(nowSec * 5.2) * 0.04];
      rPole = [-0.28, 1.12, -0.04];
    }
  } else if (animType === 'FOLD_CREPA' || animType === 'FOLD_AND_PLATE') {
    // Doblar crepa o enrollar marquesita con ambas manos coordinadas sobre la plancha
    spineRx = 0.12;
    headRx = 0.18;
    const fold = Math.sin(nowSec * 3.8) * 0.05;
    lHand = [0.10 - fold, 1.03, 0.33];
    rHand = [-0.10 + fold, 1.03, 0.34];
    lPole = [0.30, 1.12, -0.04];
    rPole = [-0.30, 1.12, -0.04];
  } else if (animType === 'WAIT_HEATING' || animType === 'WAIT_COOKING') {
    // Espera activa frente a máquina: postura natural o manos en cintura / pala lista
    const breath = Math.sin(nowSec * 2.0) * 0.012;
    spineRx = 0.03;
    headRx = 0.08;
    if (stepCodigo === 'WAIT_HEATING' || stepCodigo === 'PREHEAT_CREPERA') {
      // Sostiene pala en izquierda esperando que caliente la crepera
      lHand = [0.19, 0.99 + breath, 0.21];
      rHand = [-0.18, 0.86 + breath, 0.05];
    } else if (isFemale) {
      lHand = [0.15, 1.03, 0.02];
      rHand = [-0.15, 1.03, 0.02];
      lPole = [0.34, 1.15, -0.08];
      rPole = [-0.34, 1.15, -0.08];
      lHandMode = 'waist';
      rHandMode = 'waist';
    } else {
      lHand = [0.18, 0.92 + breath, 0.16];
      rHand = [-0.18, 0.92 + breath, 0.16];
    }
  } else if (animType === 'OPERATE_TPV' || animType === 'DESIGN_PC') {
    // Teclado + Mouse / TPV
    const typeL = Math.sin(nowSec * 13.0) * 0.015;
    const typeR = Math.cos(nowSec * 12.0) * 0.018;
    spineRx = 0.07;
    headRx = 0.14;
    headRy = Math.sin(nowSec * 1.3) * 0.08;
    lHand = [0.11, 0.99 + typeL, 0.29];
    rHand = [-0.15 + typeR, 0.99, 0.28];
    lPole = [0.28, 1.08, -0.06];
    rPole = [-0.28, 1.08, -0.06];
  } else if (animType === 'SEW_MACHINE') {
    // Costura bimanual guiando tela frente a la aguja
    const feed = Math.sin(nowSec * 8.0) * 0.015;
    spineRx = 0.14;
    headRx = 0.22;
    lHand = [0.10, 0.98, 0.33 + feed];
    rHand = [-0.10, 0.98, 0.33 - feed];
    lPole = [0.29, 1.08, -0.06];
    rPole = [-0.29, 1.08, -0.06];
  } else if (animType === 'CUT_FABRIC') {
    // Mano izquierda presiona tela firme; mano derecha empuja cortadora de disco hacia adelante
    spineRx = 0.15;
    headRx = 0.20;
    const cutSlide = ((nowSec * 0.55) % 1) * 0.18;
    lHand = [0.14, 0.99, 0.31];
    rHand = [-0.08, 0.99, 0.24 + cutSlide];
    lPole = [0.30, 1.12, -0.06];
    rPole = [-0.28, 1.12, -0.06];
  } else if (animType === 'IRON_PRESS') {
    // Planchado de vapor o cierre de plancha térmica plana
    spineRx = 0.12;
    headRx = 0.16;
    const glide = Math.sin(nowSec * 4.2) * 0.11;
    lHand = [0.14, 1.00, 0.28];
    rHand = [-0.06 + glide, 1.02, 0.33];
    lPole = [0.30, 1.12, -0.06];
    rPole = [-0.28, 1.14, -0.04];
  } else if (animType === 'PHONE_CALL') {
    // Mano derecha en la oreja sosteniendo celular; brazo izquierdo relajado recto hacia abajo
    rHand = [-0.14, 1.54, 0.05];
    rPole = [-0.26, 1.24, 0.16];
    rHandMode = 'ear_phone';
    lHand = [0.18, 0.85, 0.03];
    lPole = [0.28, 1.12, -0.25];
    headRx = Math.sin(nowSec * 2.4) * 0.04;
    headRy = -0.10 + Math.sin(nowSec * 1.2) * 0.08;
  } else if (animType === 'SWEEP_MOP') {
    // Agarre diagonal de escoba/trapeador remando en vaivén
    const sw = Math.sin(nowSec * 4.2) * 0.14;
    spineRx = 0.14;
    spineRy = sw * 0.8;
    headRx = 0.20;
    lHand = [0.06 + sw, 0.94, 0.31];
    rHand = [-0.05 + sw * 0.5, 1.18, 0.25];
    lPole = [0.28, 1.08, -0.08];
    rPole = [-0.28, 1.22, -0.08];
  } else if (animType === 'PULL_HORIZONTAL_BOARD') {
    // Repisas horizontales de madera ImperiArte: desliza el cartón grande hacia afuera horizontalmente
    const pullZ = 0.36 - (stepProgress > 0 ? stepProgress : (Math.sin(nowSec * 1.4) + 1) * 0.5) * 0.14;
    spineRx = 0.08;
    headRx = 0.06;
    lHand = [0.23, 1.12, pullZ];
    rHand = [-0.23, 1.12, pullZ];
    lPole = [0.34, 1.14, -0.06];
    rPole = [-0.34, 1.14, -0.06];
    lHandMode = 'upright';
    rHandMode = 'upright';
  } else if (animType === 'CARRY_HORIZONTAL_BOARD') {
    // Sostiene el cartón grande plano y nivelado con ambas manos separadas
    lHand = [0.24, 1.04, 0.28];
    rHand = [-0.24, 1.04, 0.28];
    lPole = [0.34, 1.10, -0.10];
    rPole = [-0.34, 1.10, -0.10];
    lHandMode = 'upright';
    rHandMode = 'upright';
  } else if (animType === 'CARRY_BOWL' || animType === 'CARRY_PLATE') {
    // Cargar charola/plato/prenda frente al cuerpo con antebrazos nivelados
    const stepBob = Math.sin(nowSec * 4.0) * 0.01;
    lHand = [0.14, 1.00 + stepBob, 0.28];
    rHand = [-0.14, 1.00 + stepBob, 0.28];
    lPole = [0.28, 1.10, -0.12];
    rPole = [-0.28, 1.10, -0.12];
    lHandMode = 'upright';
    rHandMode = 'upright';
  } else {
    // IDLE_WAIT / Espera tranquila:
    // Mujeres pueden descansar con manos en la cintura periódicamente; hombres o postura base,
    // brazos rectos relajados hacia abajo pegados al cuerpo.
    const breath = Math.sin(nowSec * 2.0) * 0.01;
    spineRx = breath * 0.8;
    headRy = Math.sin(nowSec * 0.85) * 0.10;
    headRx = Math.sin(nowSec * 1.2) * 0.035;

    if (isFemale && Math.sin(nowSec * 0.28) > 0.2) {
      lHand = [0.15, 1.03 + breath * 0.3, 0.02];
      rHand = [-0.15, 1.03 + breath * 0.3, 0.02];
      lPole = [0.35, 1.15, -0.07];
      rPole = [-0.35, 1.15, -0.07];
      lHandMode = 'waist';
      rHandMode = 'waist';
    } else {
      lHand = [0.18, 0.85 + breath, 0.03];
      rHand = [-0.18, 0.85 + breath, 0.03];
      lPole = [0.28, 1.12, -0.25];
      rPole = [-0.28, 1.12, -0.25];
    }
  }

  if (Hips && Hips.userData.restPos && Math.abs(hipDropY) > 0.001) {
    Hips.position.y = Hips.userData.restPos.y + hipDropY / (rigRoot.scale?.y || 1);
  }

  // 1. Aplicar rotaciones de torso, cabeza y piernas
  rotateBoneModelSpace(Hips, 0, spineRy * 0.3, 0);
  rotateBoneModelSpace(Spine, spineRx * 0.5, spineRy * 0.5, spineRz);
  rotateBoneModelSpace(Spine2, spineRx * 0.5, spineRy * 0.5, 0);
  rotateBoneModelSpace(Head, headRx, headRy, 0);
  rotateBoneModelSpace(LeftUpLeg, lLegRx, 0, 0);
  rotateBoneModelSpace(LeftLeg, lKneeRx, 0, 0);
  rotateBoneModelSpace(RightUpLeg, rLegRx, 0, 0);
  rotateBoneModelSpace(RightLeg, rKneeRx, 0, 0);

  // 2. Resolver cadenas anatómicas de ambos brazos con IK exacto en espacio de personaje
  solveArmIKCharacterSpace(
    rigRoot,
    1,
    LeftArm,
    LeftForeArm,
    LeftHand,
    lHand[0],
    lHand[1],
    lHand[2],
    lPole[0],
    lPole[1],
    lPole[2],
    lHandMode
  );
  solveArmIKCharacterSpace(
    rigRoot,
    -1,
    RightArm,
    RightForeArm,
    RightHand,
    rHand[0],
    rHand[1],
    rHand[2],
    rPole[0],
    rPole[1],
    rPole[2],
    rHandMode
  );
}

