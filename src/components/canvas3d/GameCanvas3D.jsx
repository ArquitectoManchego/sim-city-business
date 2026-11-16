/**
 * Motor Gráfico 3D Principal (Three.js WebGL) para SIM CITY BUSINESS.
 * Renderiza los 6 locales comerciales, Pisos, Muros, Bloques de Colisión, Grilla NavMesh A*,
 * Equipos Eléctricos procedurales detallados por local, Ventanas flotantes de telemetría
 * por operación, Empleados articulados con animaciones paso a paso y Clientes 3D.
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';
import {
  NEGOCIOS_ZONES_3D,
  ALL_ZONES_3D,
  WAYPOINTS_POR_NEGOCIO
} from '../../engine/ChoreographyRegistry.js';
import { isLocalPointBlocked } from '../../engine/NavMeshGrid.js';
import { audioEngine } from '../../engine/AudioEngine.js';
import { useGameStore, NEGOCIOS_ACTIVOS_IDS } from '../../store/useGameStore.js';
import { useSceneEditorStore } from '../../store/useSceneEditorStore.js';
import { useTrainingStore } from '../../store/useTrainingStore.js';
import { calcularCobroCFECompleto } from '../../shared/simuladorCFE.js';
import {
  createApplianceModel3D,
  updateApplianceVisualState,
  updateHandItemVisual,
  resolveDualHandTools,
  buildPapeleriaImperiArteFurniture3D
} from './EquipmentModels3D.js';
import {
  preloadSims2Assets,
  createDefaultSims2Profiles,
  buildCustomerSims2Profile,
  createSims2ActorGroup,
  syncSims2ActorProfile,
  animateSims2Actor
} from './Sims2AvatarLoader.js';

const APPLIANCE_SHORT_NAMES = {
  hp_raspadora: 'Raspadora Hielo',
  hp_crepera: 'Crepera Prof.',
  hp_marquesitera: 'Marquesitera',
  hp_licuadora: 'Licuadora Ninja',
  hp_breville: 'Espresso Gaggia',
  hp_tetera: 'Tetera Eléc.',
  hp_bano_maria: 'Baño María',
  hp_tpv: 'Caja TPV',
  hp_refrigerador: 'Refrigerador 11p',
  hp_congelador: 'Congelador',
  hp_ac_clientes: 'Minisplit 1.5TR',
  imp_tpv: 'Caja TPV Imperia',
  imp_terminal: 'Terminal POS',
  imp_ac: 'Minisplit 1TR',
  pap_docucolor: 'Xerox DocuColor',
  pap_tpv: 'PC AIO / TPV',
  pap_ac_18k: 'Minisplit 1.5TR',
  bv_aemco_220: 'Bordadora AEMCO 4C',
  bv_melco_emc: 'Bordadora Melco',
  bv_ac: 'Minisplit 1.5TR',
  tc_cortadora: 'Cortadora Disco',
  tc_overlock_5h: 'Overlock 5H',
  tc_rectas_singer: 'Rectas Singer',
  tc_collaretera_singer: 'Collaretera Singer',
  tc_plancha_vapor: 'Plancha Caldera',
  tc_ac: 'Minisplit 1TR',
  pi_pc_diseno: 'PC Diseño i7',
  pi_epson: 'Epson Sublimación',
  pi_plancha_tazas: 'Plancha Tazas',
  pi_plancha_plana: 'Plancha Plana',
  pi_atomstack: 'Láser Atomstack',
  oc_ac_1tr: 'Clima Oficina 1TR',
  oc_tv_32: 'Smart TV 32"',
  oc_laptop_diseno: 'Laptop Diseño PC'
};

function formatOpDuration(totalSeconds) {
  const sec = Math.max(0, Math.floor(totalSeconds || 0));
  const hrs = Math.floor(sec / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const remSec = sec % 60;
  if (hrs > 0) {
    return `${hrs}h ${String(mins).padStart(2, '0')}m`;
  }
  return `${String(mins).padStart(2, '0')}:${String(remSec).padStart(2, '0')}`;
}

function formatOpCostMxn(cost) {
  const val = Math.max(0, cost || 0);
  if (val < 0.1) return `$${val.toFixed(4)}`;
  if (val < 1.0) return `$${val.toFixed(3)}`;
  return `$${val.toFixed(2)}`;
}

function formatWattsText(watts) {
  const w = Math.round(watts || 0);
  if (w >= 1000) return `${w.toLocaleString()} W (${(w / 1000).toFixed(2)} kW)`;
  return `${w} W`;
}

function lerpAngle(current, target, alpha) {
  let diff = target - current;
  while (diff < -Math.PI) diff += Math.PI * 2;
  while (diff > Math.PI) diff -= Math.PI * 2;
  return current + diff * alpha;
}

/**
 * Construye estanterías de exhibición para las 6 ramas de Imperia Uniformes, rack de pedidos listos y mostrador de maniquíes
 */
function buildImperiaFixtures3D(localGroup, wps) {
  const frameMat = new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 0.72, roughness: 0.28 });
  const darkMetal = new THREE.MeshStandardMaterial({ color: '#1e293b', metalness: 0.5, roughness: 0.45 });

  const branchSpecs = [
    { key: 'rack_gastronomia', color: '#f8fafc', accent: '#ef4444' },
    { key: 'rack_enfermeria', color: '#14b8a6', accent: '#ccfbf1' },
    { key: 'rack_medicina', color: '#38bdf8', accent: '#f8fafc' },
    { key: 'rack_escolares', color: '#eab308', accent: '#1e3a8a' },
    { key: 'rack_industriales', color: '#f97316', accent: '#0f172a' },
    { key: 'rack_proveedores', color: '#a855f7', accent: '#e2e8f0' }
  ];

  // Fallbacks alineados con IMPERIA_BRANCH_RACKS por si algún waypoint cambia
  const fallbackX = [-4.4, -2.65, -0.9, 0.9, 2.65, 4.4];
  branchSpecs.forEach((spec, idx) => {
    const wp = wps[spec.key] || [fallbackX[idx], 0, -3.15];
    const rack = new THREE.Group();
    rack.name = `fixture_${spec.key}`;
    rack.position.set(wp[0], 0, -4.12);

    const base = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.08, 0.50), darkMetal);
    base.position.y = 0.04;
    base.castShadow = true;
    rack.add(base);

    [-0.65, 0.65].forEach((px) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.92, 8), frameMat);
      post.position.set(px, 0.96, 0);
      post.castShadow = true;
      rack.add(post);
    });

    const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.36, 8), frameMat);
    rail.rotation.z = Math.PI / 2;
    rail.position.set(0, 1.62, 0.05);
    rack.add(rail);

    const headerBar = new THREE.Mesh(
      new THREE.BoxGeometry(1.42, 0.16, 0.14),
      new THREE.MeshStandardMaterial({ color: spec.accent, emissive: spec.color, emissiveIntensity: 0.18 })
    );
    headerBar.position.set(0, 1.98, 0.08);
    rack.add(headerBar);

    const garmentMat = new THREE.MeshStandardMaterial({ color: spec.color, roughness: 0.65 });
    for (let gIdx = -2; gIdx <= 2; gIdx++) {
      const garment = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.72, 0.28), garmentMat);
      garment.position.set(gIdx * 0.23, 1.20, 0.05);
      garment.castShadow = true;
      rack.add(garment);
    }

    localGroup.add(rack);
  });

  // Rack de Pedidos Listos (recibidos de Bordados Veracruz y Taller Costura)
  if (wps.rack_pedidos_listos) {
    const readyRack = new THREE.Group();
    readyRack.name = 'fixture_rack_pedidos_listos';
    readyRack.position.set(wps.rack_pedidos_listos[0] + 0.55, 0, wps.rack_pedidos_listos[2]);
    const rBase = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.08, 1.25), darkMetal);
    rBase.position.y = 0.04;
    readyRack.add(rBase);
    [-0.55, 0.55].forEach((pz) => {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 1.75, 8), frameMat);
      p.position.set(0, 0.875, pz);
      readyRack.add(p);
    });
    const rBar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.15, 8), frameMat);
    rBar.rotation.x = Math.PI / 2;
    rBar.position.set(0, 1.65, 0);
    readyRack.add(rBar);
    const bagMat = new THREE.MeshStandardMaterial({ color: '#bae6fd', transparent: true, opacity: 0.75 });
    for (let bIdx = -1; bIdx <= 1; bIdx++) {
      const bag = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.78, 0.22), bagMat);
      bag.position.set(0, 1.22, bIdx * 0.34);
      readyRack.add(bag);
    }
    localGroup.add(readyRack);
  }

  // Exhibidores de uniformes en la entrada (área de maniquíes) sin geometrías humanoides primitivas
  if (wps.area_maniquies_entrada) {
    const standPos = [
      [wps.area_maniquies_entrada[0] - 0.35, wps.area_maniquies_entrada[2] - 0.55],
      [wps.area_maniquies_entrada[0] + 0.35, wps.area_maniquies_entrada[2] - 0.55]
    ];
    standPos.forEach(([sx, sz], idx) => {
      const plinth = new THREE.Group();
      plinth.position.set(sx, 0, sz);
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.28, 0.46), darkMetal);
      base.position.y = 0.14;
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 1.35, 8), frameMat);
      pole.position.y = 0.92;
      const formMat = new THREE.MeshStandardMaterial({ color: idx === 0 ? '#0ea5e9' : '#ec4899', roughness: 0.55 });
      const tunic = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.62, 0.20), formMat);
      tunic.position.y = 1.22;
      tunic.castShadow = true;
      plinth.add(base, pole, tunic);
      localGroup.add(plinth);
    });
  }

  // Cortinas en el módulo de probadores
  if (wps.probador_1) {
    const curtainMat = new THREE.MeshStandardMaterial({ color: '#64748b', roughness: 0.85, side: THREE.DoubleSide });
    const curtain = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 2.05), curtainMat);
    curtain.rotation.y = Math.PI / 2;
    curtain.position.set(-4.48, 1.05, 2.9);
    localGroup.add(curtain);
  }
}

/**
 * Construye estiba con cajas empacadas B2B en el almacén de Publi-Impresos
 */
function buildB2BWarehouseBoxes3D(localGroup, wp) {
  if (!wp) return;
  const g = new THREE.Group();
  g.name = 'fixture_almacen_b2b';
  g.position.set(wp[0] + 0.45, 0, wp[2] + 0.45);
  const pallet = new THREE.Mesh(
    new THREE.BoxGeometry(1.15, 0.12, 1.05),
    new THREE.MeshStandardMaterial({ color: '#92400e', roughness: 0.85 })
  );
  pallet.position.y = 0.06;
  g.add(pallet);

  const boxMat = new THREE.MeshStandardMaterial({ color: '#d97706', roughness: 0.78 });
  const tapeMat = new THREE.MeshStandardMaterial({ color: '#fde68a', roughness: 0.4 });
  const layout = [
    [-0.26, 0.34, -0.22],
    [0.24, 0.34, -0.22],
    [-0.24, 0.34, 0.24],
    [0.24, 0.34, 0.24],
    [-0.12, 0.76, -0.02],
    [0.22, 0.76, 0.08]
  ];
  layout.forEach(([bx, by, bz]) => {
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.38, 0.40), boxMat);
    box.position.set(bx, by, bz);
    box.castShadow = true;
    box.receiveShadow = true;
    const label = new THREE.Mesh(new THREE.BoxGeometry(0.43, 0.05, 0.08), tapeMat);
    label.position.y = 0.08;
    box.add(label);
    g.add(box);
  });
  localGroup.add(g);
}

/**
 * Señalización y mampara sutil de Baño de Empleado junto al waypoint bano_empleado
 */
function buildRestroomPartition3D(localGroup, wp, zoneSize) {
  if (!wp) return;
  const [w] = zoneSize;
  const sideSign = wp[0] >= 0 ? 1 : -1;
  const clampedX = Math.max(-w / 2 + 0.35, Math.min(w / 2 - 0.35, wp[0] + sideSign * 0.42));
  const grp = new THREE.Group();
  grp.position.set(clampedX, 0, wp[2]);
  const doorMat = new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.4 });
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.05, 0.92), doorMat);
  door.position.y = 1.025;
  door.castShadow = true;
  const wcSign = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 0.22, 0.34),
    new THREE.MeshBasicMaterial({ color: '#0ea5e9' })
  );
  wcSign.position.set(0, 1.72, 0);
  grp.add(door, wcSign);
  localGroup.add(grp);
}

export default function GameCanvas3D() {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const actorGroupsRef = useRef({ employees: {}, customers: {}, gerente: null, familia: {} });
  const defaultSims2Ref = useRef(createDefaultSims2Profiles());
  const machineGroupsRef = useRef({});
  const meterDiscsRef = useRef({});
  const collisionGroupRef = useRef(null);
  const navMeshGroupRef = useRef(null);
  const customModelsGroupRef = useRef(null);
  const cameraTransitionRef = useRef({
    active: false,
    startPos: new THREE.Vector3(),
    startTarget: new THREE.Vector3(),
    endPos: new THREE.Vector3(),
    endTarget: new THREE.Vector3(),
    progress: 0,
    duration: 1.05
  });
  const hasMountedCameraRef = useRef(false);

  const [overlayLabels, setOverlayLabels] = useState([]);
  const [overlayCashPopups, setOverlayCashPopups] = useState([]);
  const [overlayApplianceTelemetry, setOverlayApplianceTelemetry] = useState([]);

  const focusedNegocioId = useGameStore((s) => s.focusedNegocioId);
  const focusedMedidorId = useGameStore((s) => s.focusedMedidorId);
  const showNavMesh = useSceneEditorStore((s) => s.showNavMesh);
  const showCollisionBlocks = useSceneEditorStore((s) => s.showCollisionBlocks);
  const cutawayWalls = useSceneEditorStore((s) => s.cutawayWalls);
  const collisionBlocksByNegocio = useSceneEditorStore((s) => s.collisionBlocksByNegocio);
  const customModels3D = useSceneEditorStore((s) => s.customModels3D);
  const isTrainingMode = useTrainingStore((s) => s.isTrainingMode);
  const trainingNegocioId = useTrainingStore((s) => s.selectedNegocioId);

  // Inicialización del mundo 3D Three.js
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#060a12');
    scene.fog = new THREE.FogExp2('#060a12', 0.012);
    sceneRef.current = scene;

    // Precargar modelos GLB 3D reales estilo Sims 2 al montar el lienzo
    preloadSims2Assets();

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / Math.max(1, container.clientHeight),
      0.1,
      250
    );
    camera.position.set(-14, 11.5, 6.5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controls.minDistance = 2.2;
    controls.maxDistance = 65;
    controls.target.set(-14, 0.8, -6);
    controls.addEventListener('start', () => {
      cameraTransitionRef.current.active = false;
    });
    controlsRef.current = controls;

    // Iluminación Ambiental, Hemisférica PBR y Sol Direccional
    const ambientLight = new THREE.AmbientLight('#e2e8f0', 1.1);
    scene.add(ambientLight);
    scene.add(new THREE.HemisphereLight('#f1f5f9', '#0f172a', 0.65));

    const dirLight = new THREE.DirectionalLight('#fffbeb', 1.65);
    dirLight.position.set(18, 32, 22);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 90;
    const d = 32;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    scene.add(dirLight);

    // Plataforma Urbana General y Acera Peatonal
    const groundSlab = new THREE.Mesh(
      new THREE.PlaneGeometry(82, 58),
      new THREE.MeshStandardMaterial({ color: '#090f1d', roughness: 0.92 })
    );
    groundSlab.rotation.x = -Math.PI / 2;
    groundSlab.position.y = -0.04;
    groundSlab.receiveShadow = true;
    scene.add(groundSlab);

    const gridHelper = new THREE.GridHelper(78, 78, '#1e293b', '#0f172a');
    gridHelper.position.y = -0.02;
    scene.add(gridHelper);

    // Construir cada uno de los 6 Locales Comerciales + Oficina Consorcio y sus máquinas/insumos 3D
    const wallsList = [];
    Object.keys(ALL_ZONES_3D).forEach((negId) => {
      const zone = ALL_ZONES_3D[negId];
      const [cx, , cz] = zone.center;
      const [w, h, depth] = zone.size;
      const localGroup = new THREE.Group();
      localGroup.position.set(cx, 0, cz);
      scene.add(localGroup);

      // PISO CAMINABLE DEL LOCAL (FLOOR)
      const floorMesh = new THREE.Mesh(
        new THREE.BoxGeometry(w, 0.08, depth),
        new THREE.MeshStandardMaterial({ color: zone.pisoColorHex, roughness: 0.65 })
      );
      floorMesh.position.y = -0.04;
      floorMesh.receiveShadow = true;
      floorMesh.userData = { tagType: 'FLOOR', negocioId: negId };
      localGroup.add(floorMesh);

      // Acera frontal del local
      const sidewalk = new THREE.Mesh(
        new THREE.BoxGeometry(w, 0.06, 2.0),
        new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.85 })
      );
      sidewalk.position.set(0, -0.03, depth / 2 + 1.0);
      sidewalk.receiveShadow = true;
      localGroup.add(sidewalk);

      // MUROS PERIMETRALES (WALL)
      const wallMat = new THREE.MeshStandardMaterial({
        color: zone.muroColorHex,
        roughness: 0.5,
        transparent: true,
        opacity: 0.92
      });
      // Muro trasero
      const backWall = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.22), wallMat);
      backWall.position.set(0, h / 2, -depth / 2);
      backWall.castShadow = true;
      localGroup.add(backWall);

      // Muros laterales
      const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.22, h, depth), wallMat);
      leftWall.position.set(-w / 2, h / 2, 0);
      leftWall.castShadow = true;
      localGroup.add(leftWall);

      const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.22, h, depth), wallMat);
      rightWall.position.set(w / 2, h / 2, 0);
      rightWall.castShadow = true;
      localGroup.add(rightWall);

      // Muro frontal con vano de puerta de entrada (cutaway dinámico)
      const frontLeft = new THREE.Mesh(new THREE.BoxGeometry(w / 2 - 1.4, h, 0.20), wallMat.clone());
      frontLeft.position.set(-(w / 4 + 0.7), h / 2, depth / 2);
      const frontRight = new THREE.Mesh(new THREE.BoxGeometry(w / 2 - 1.4, h, 0.20), wallMat.clone());
      frontRight.position.set(w / 4 + 0.7, h / 2, depth / 2);
      wallsList.push(frontLeft, frontRight);
      localGroup.add(frontLeft, frontRight);

      // Borde luminoso superior identificando el color del negocio
      const neonRim = new THREE.Mesh(
        new THREE.BoxGeometry(w + 0.1, 0.14, 0.26),
        new THREE.MeshBasicMaterial({ color: zone.colorHex })
      );
      neonRim.position.set(0, h + 0.08, -depth / 2);
      localGroup.add(neonRim);

      // Estaciones de trabajo, equipos eléctricos y materia prima según WAYPOINTS_POR_NEGOCIO
      const wps = WAYPOINTS_POR_NEGOCIO[negId] || {};

      // Helper compacto para posicionar y registrar cada aparato 3D procedural
      const spawnMachine = (eqKey, pos, colorHexOverride = null) => {
        const model = createApplianceModel3D(eqKey, colorHexOverride || zone.colorHex);
        model.position.set(pos[0], pos[1], pos[2]);
        localGroup.add(model);
        machineGroupsRef.current[eqKey] = model;
        return model;
      };

      // Caja TPV detallada en negocios con mostrador de cobro
      const tpvY =
        negId === 'hawaiian_paradise'
          ? 1.05
          : negId === 'imperia_uniformes' || negId === 'papeleria_imperiarte'
            ? 1.0
            : 0.95;

      if (wps.caja_tpv_vendedor) {
        const tpvKey =
          negId === 'hawaiian_paradise'
            ? 'hp_tpv'
            : negId === 'imperia_uniformes'
              ? 'imp_tpv'
              : negId === 'papeleria_imperiarte'
                ? 'pap_tpv'
                : null;
        if (tpvKey) {
          spawnMachine(tpvKey, [wps.caja_tpv_vendedor[0], tpvY, 0.0]);
        } else {
          const genericPos = createApplianceModel3D('hp_tpv');
          genericPos.position.set(wps.caja_tpv_vendedor[0], tpvY, 0.0);
          localGroup.add(genericPos);
        }
      }

      // Minisplit Inverter montado en muro trasero de cada local y Oficina con clima
      const acKeyMap = {
        hawaiian_paradise: 'hp_ac_clientes',
        imperia_uniformes: 'imp_ac',
        papeleria_imperiarte: 'pap_ac_18k',
        bordados_veracruz: 'bv_ac',
        taller_costura: 'tc_ac',
        oficinas_consorcio: 'oc_ac_1tr'
      };
      if (acKeyMap[negId]) {
        spawnMachine(acKeyMap[negId], [0, 2.55, -depth / 2 + 0.30]);
      }

      // Baño de empleado en cada local y Oficina Consorcio
      if (wps.bano_empleado) {
        buildRestroomPartition3D(localGroup, wps.bano_empleado, zone.size);
      }

      if (negId === 'imperia_uniformes') {
        if (wps.caja_tpv_vendedor) {
          spawnMachine('imp_terminal', [wps.caja_tpv_vendedor[0] - 0.50, 1.0, 0.14]);
        }
        buildImperiaFixtures3D(localGroup, wps);
      }

      if (negId === 'hawaiian_paradise') {
        spawnMachine('hp_raspadora', [-3.50, 0, -2.95], '#0284c7');
        spawnMachine('hp_crepera', [wps.eq_hp_crepera[0], 0, wps.eq_hp_crepera[2] - 0.65]);
        spawnMachine('hp_marquesitera', [wps.eq_hp_marquesitera[0], 0, wps.eq_hp_marquesitera[2] - 0.65]);
        spawnMachine('hp_licuadora', [wps.eq_hp_licuadora[0], 0, wps.eq_hp_licuadora[2] - 0.65]);
        spawnMachine('hp_breville', [wps.eq_hp_breville[0], 0, wps.eq_hp_breville[2] - 0.65]);
        if (wps.eq_hp_tetera) {
          spawnMachine('hp_tetera', [wps.eq_hp_tetera[0] + 0.35, 0, wps.eq_hp_tetera[2] - 0.45]);
        }
        if (wps.eq_hp_bano_maria) {
          spawnMachine('hp_bano_maria', [wps.eq_hp_bano_maria[0] - 0.35, 0, wps.eq_hp_bano_maria[2]]);
        }

        // Estación de Jarabes (Limón, Fresa, Mango, Tamarindo) sobre mesa inoxidable de 4 patas
        const syrupStation = new THREE.Group();
        syrupStation.position.set(wps.raw_estacion_jarabes[0], 0, wps.raw_estacion_jarabes[2] - 0.35);
        const steelStandMat = new THREE.MeshStandardMaterial({ color: '#cbd5e1', metalness: 0.6, roughness: 0.3 });
        const topDeck = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.04, 0.42), steelStandMat);
        topDeck.position.set(0, 0.93, 0);
        topDeck.castShadow = true;
        topDeck.receiveShadow = true;
        syrupStation.add(topDeck);
        const legOffsets = [
          [-0.37, -0.16],
          [0.37, -0.16],
          [-0.37, 0.16],
          [0.37, 0.16]
        ];
        legOffsets.forEach(([lx, lz]) => {
          const leg = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.91, 0.04), steelStandMat);
          leg.position.set(lx, 0.455, lz);
          leg.castShadow = true;
          syrupStation.add(leg);
        });
        const colorsSyrup = ['#84cc16', '#ef4444', '#facc15', '#78350f'];
        colorsSyrup.forEach((col, idx) => {
          const bottle = new THREE.Mesh(
            new THREE.CylinderGeometry(0.055, 0.065, 0.28, 10),
            new THREE.MeshStandardMaterial({ color: col, roughness: 0.2 })
          );
          bottle.position.set((idx - 1.5) * 0.16, 0.95 + 0.14, 0);
          bottle.castShadow = true;
          syrupStation.add(bottle);
        });
        localGroup.add(syrupStation);

        // Congelador de Bloques de Hielo y Refrigerador Vertical de Insumos
        spawnMachine('hp_congelador', [wps.raw_congelador_hielo[0] - 0.4, 0, wps.raw_congelador_hielo[2] - 0.6]);
        spawnMachine('hp_refrigerador', [wps.raw_refrigerador_insumos[0] + 0.3, 0, wps.raw_refrigerador_insumos[2] - 0.6]);
      }

      if (negId === 'papeleria_imperiarte') {
        spawnMachine('pap_docucolor', [wps.eq_pap_docucolor[0], 0, wps.eq_pap_docucolor[2] - 0.75]);
        localGroup.add(buildPapeleriaImperiArteFurniture3D());
      }

      if (negId === 'bordados_veracruz') {
        spawnMachine('bv_aemco_220', [wps.eq_bv_aemco_220[0], 0, wps.eq_bv_aemco_220[2] - 0.8]);
        spawnMachine('bv_melco_emc', [wps.eq_bv_melco_emc[0], 0, wps.eq_bv_melco_emc[2] - 0.8]);
      }

      if (negId === 'taller_costura') {
        spawnMachine('tc_cortadora', [wps.eq_tc_cortadora[0], 0, wps.eq_tc_cortadora[2] - 0.7]);
        spawnMachine('tc_overlock_5h', [wps.eq_tc_overlock_5h[0], 0, wps.eq_tc_overlock_5h[2] - 0.7]);
        spawnMachine('tc_rectas_singer', [wps.eq_tc_rectas_singer[0], 0, wps.eq_tc_rectas_singer[2] - 0.7]);
        if (wps.eq_tc_collaretera_singer) {
          spawnMachine('tc_collaretera_singer', [wps.eq_tc_collaretera_singer[0], 0, wps.eq_tc_collaretera_singer[2] - 0.7]);
        }
        spawnMachine('tc_plancha_vapor', [wps.eq_tc_plancha_vapor[0] + 0.7, 0, wps.eq_tc_plancha_vapor[2]]);
      }

      if (negId === 'taller_publi_imperia') {
        if (wps.eq_pi_pc_diseno) {
          spawnMachine('pi_pc_diseno', [wps.eq_pi_pc_diseno[0] - 0.65, 0, wps.eq_pi_pc_diseno[2]]);
        }
        if (wps.eq_pi_epson) {
          spawnMachine('pi_epson', [wps.eq_pi_epson[0], 0, wps.eq_pi_epson[2] - 0.7]);
        }
        spawnMachine('pi_plancha_tazas', [wps.eq_pi_plancha_tazas[0], 0, wps.eq_pi_plancha_tazas[2] - 0.7]);
        spawnMachine('pi_plancha_plana', [wps.eq_pi_plancha_plana[0], 0, wps.eq_pi_plancha_plana[2] - 0.7]);
        spawnMachine('pi_atomstack', [wps.eq_pi_atomstack[0], 0, wps.eq_pi_atomstack[2] - 0.7]);
        if (wps.raw_almacen_b2b) {
          buildB2BWarehouseBoxes3D(localGroup, wps.raw_almacen_b2b);
        }
      }

      if (negId === 'oficinas_consorcio') {
        if (wps.eq_oc_laptop_diseno) {
          spawnMachine('oc_laptop_diseno', [wps.eq_oc_laptop_diseno[0], 0, wps.eq_oc_laptop_diseno[2] - 0.68]);
        }
        if (wps.eq_oc_tv_32) {
          spawnMachine('oc_tv_32', [wps.eq_oc_tv_32[0], 0, wps.eq_oc_tv_32[2] - 0.35]);
        }
      }
    });

    // PARED DE MEDIDORES DE LUZ CFE 3D (Muro de Acometida en X = -23, Z = 1)
    const cfeWallGroup = new THREE.Group();
    cfeWallGroup.position.set(-23, 0, 1);
    const pedestal = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 3.2, 6.2),
      new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.7 })
    );
    pedestal.position.y = 1.6;
    pedestal.castShadow = true;
    cfeWallGroup.add(pedestal);

    for (let mIdx = 0; mIdx < 6; mIdx++) {
      const medId = `med_${mIdx + 1}`;
      const zOffset = -2.2 + mIdx * 0.88;
      const meterBox = new THREE.Group();
      meterBox.position.set(0.65, 1.65, zOffset);

      const baseSocket = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.46, 0.38),
        new THREE.MeshStandardMaterial({ color: '#475569', metalness: 0.5 })
      );
      const glassDome = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.16, 0.22, 20),
        new THREE.MeshStandardMaterial({ color: '#bae6fd', transparent: true, opacity: 0.55, roughness: 0.1 })
      );
      glassDome.rotation.z = Math.PI / 2;
      glassDome.position.x = 0.14;

      const rotorDisc = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.02, 16),
        new THREE.MeshBasicMaterial({ color: '#10b981' })
      );
      rotorDisc.position.x = 0.14;
      meterDiscsRef.current[medId] = rotorDisc;

      meterBox.add(baseSocket, glassDome, rotorDisc);
      cfeWallGroup.add(meterBox);
    }
    scene.add(cfeWallGroup);

    // Contenedores dinámicos para Bloques de Colisión, Grilla NavMesh y Modelos SketchUp
    const colGroup = new THREE.Group();
    scene.add(colGroup);
    collisionGroupRef.current = colGroup;

    const navGroup = new THREE.Group();
    scene.add(navGroup);
    navMeshGroupRef.current = navGroup;

    const customGroup = new THREE.Group();
    scene.add(customGroup);
    customModelsGroupRef.current = customGroup;

    // Click en el piso para agregar Bloque de Colisión cuando la herramienta ADD_COLLISION está activa
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const handleCanvasClick = (ev) => {
      const editorState = useSceneEditorStore.getState();
      if (editorState.editorTool !== 'ADD_COLLISION') return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);

      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const hitPoint = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(plane, hitPoint)) {
        // Determinar en qué negocio cayó el clic
        const negFocus = useGameStore.getState().focusedNegocioId;
        const targetNegId = ALL_ZONES_3D[negFocus] ? negFocus : 'hawaiian_paradise';
        const zone = ALL_ZONES_3D[targetNegId];
        const localX = Math.round((hitPoint.x - zone.center[0]) * 10) / 10;
        const localZ = Math.round((hitPoint.z - zone.center[2]) * 10) / 10;
        if (Math.abs(localX) <= zone.size[0] / 2 && Math.abs(localZ) <= zone.size[2] / 2) {
          editorState.addCollisionBlock(targetNegId, {
            label: `Colisión Personalizada (${localX}, ${localZ})`,
            tagType: 'COLLISION_BLOCK',
            x: localX,
            z: localZ,
            w: 1.2,
            d: 1.0,
            h: 1.1,
            color: '#ef4444'
          });
        }
      }
    };
    renderer.domElement.addEventListener('pointerdown', handleCanvasClick);

    // Loop de animación 60 FPS (Avanza tanto el juego como el Modo Entrenamiento y proyecta etiquetas 2D)
    let animFrameId = null;
    let lastTime = performance.now();
    let labelThrottle = 0;

    const animate = (now) => {
      animFrameId = requestAnimationFrame(animate);
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      const gameState = useGameStore.getState();
      const trainingState = useTrainingStore.getState();
      const sceneEditorState = useSceneEditorStore.getState();

      // Actualizar opacidad de muros frontales según modo cutaway
      wallsList.forEach((wMesh) => {
        wMesh.material.opacity = sceneEditorState.cutawayWalls ? 0.14 : 0.90;
      });

      if (trainingState.isTrainingMode) {
        trainingState.tickTrainingDemo(dt);
      } else {
        gameState.advanceSimulationTick(dt);
      }

      const freshGame = useGameStore.getState();
      const freshTrain = useTrainingStore.getState();

      const nowSec = now * 0.001;

      // Actualizar animaciones 60 FPS de cada equipo procedural según paso activo / Entrenamiento / estado eléctrico
      Object.keys(machineGroupsRef.current).forEach((eqKey) => {
        const meshGroup = machineGroupsRef.current[eqKey];
        const eqRuntime = freshGame.equiposRuntime[eqKey];
        if (!meshGroup || !eqRuntime) return;

        let isWorking = eqRuntime.wattsActuales > 0 && eqRuntime.estado === 'WORK';
        let isPreheat = eqRuntime.wattsActuales > 0 && eqRuntime.estado === 'PREHEAT';
        let isActive = eqRuntime.wattsActuales > 0;
        let stepCodigo = null;
        let stepProgress = 0;

        if (freshTrain.isTrainingMode) {
          const rec = freshTrain.recetasEntrenadas[freshTrain.selectedProductId];
          const curStep = rec?.pasos?.[freshTrain.activeStepIndex];
          if (curStep?.equipoKey === eqKey && curStep?.estadoEquipo !== 'OFF') {
            isPreheat = curStep.estadoEquipo === 'PREHEAT';
            isWorking = !isPreheat;
            isActive = true;
            stepCodigo = curStep.codigo || null;
            stepProgress = Math.min(1, freshTrain.stepElapsedSec / Math.max(1, curStep.duracionSegundos || 4));
          } else {
            isWorking = false;
            isPreheat = false;
            isActive = false;
          }
        } else {
          const empListaNeg =
            freshGame.empleadosListaPorNegocio?.[eqRuntime.negocioId] ||
            (freshGame.empleadosPorNegocio?.[eqRuntime.negocioId] ? [freshGame.empleadosPorNegocio[eqRuntime.negocioId]] : []);
          for (const empNeg of empListaNeg) {
            if ((empNeg?.estado === 'ATENDIENDO_CLIENTE' || empNeg?.estado === 'ATENDIENDO_QUEUE') && empNeg.recetaActual) {
              const empStep = empNeg.recetaActual.pasos?.[empNeg.pasoActualIndex];
              if (empStep?.equipoKey === eqKey) {
                stepCodigo = empStep.codigo || null;
                stepProgress = Math.min(1, empNeg.pasoElapsedSec / Math.max(1, empStep.duracionSegundos || 4));
                break;
              }
            }
          }
        }

        const iceBlockRatio =
          eqRuntime.raspadosRestantesHielo !== undefined
            ? eqRuntime.raspadosRestantesHielo / (eqRuntime.maxRaspadosPorBloque || 10)
            : 1;

        updateApplianceVisualState(
          eqKey,
          meshGroup,
          { isWorking, isPreheat, isActive, stepCodigo, stepProgress, iceBlockRatio },
          nowSec
        );
      });

      // Hacer girar los discos de los Medidores CFE según los Watts instantáneos conectados
      Object.keys(meterDiscsRef.current).forEach((medId) => {
        const disc = meterDiscsRef.current[medId];
        let wattsMedidor = 0;
        Object.values(freshGame.equiposRuntime).forEach((eq) => {
          if (eq.medidorId === medId) wattsMedidor += eq.wattsActuales || 0;
        });
        disc.rotation.y += (wattsMedidor / 1000) * dt * 2.5;
      });

      // Actualizar posiciones 3D, avatares GLB Sims 2, esqueleto de 67 huesos e ítems de mano
      const activeEmployeeIds = new Set();
      const activeCustomerIds = new Set();
      const activeFamiliaIds = new Set();
      const tmpMachineWorldPos = new THREE.Vector3();
      const sims2ConfigMap = freshGame.sims2AvataresConfig || {};
      const defaultProfiles = defaultSims2Ref.current;

      NEGOCIOS_ACTIVOS_IDS.forEach((negId) => {
        const zone = ALL_ZONES_3D[negId];
        if (!zone) return;
        const [cx, , cz] = zone.center;
        const empLista =
          freshGame.empleadosListaPorNegocio?.[negId] ||
          (freshGame.empleadosPorNegocio?.[negId] ? [freshGame.empleadosPorNegocio[negId]] : []);

        empLista.forEach((empData, empIdx) => {
          if (!empData) return;
          activeEmployeeIds.add(empData.id);
          const sims2Id = empData.sims2Id || `emp_${negId}_${empIdx + 1}`;
          const empProfile = sims2ConfigMap[sims2Id] ||
            defaultProfiles[sims2Id] || {
              ...defaultProfiles.gerente,
              id: sims2Id,
              isManager: false,
              showAura: false,
              showPlumbob: false,
              topColor: zone.colorHex
            };

          let empMesh = actorGroupsRef.current.employees[empData.id];
          if (!empMesh) {
            empMesh = createSims2ActorGroup(empProfile);
            empMesh.position.set(cx + (empData.posicionLocal?.[0] || 0), 0, cz + (empData.posicionLocal?.[2] || -0.7));
            empMesh.userData._profileRef = empProfile;
            scene.add(empMesh);
            actorGroupsRef.current.employees[empData.id] = empMesh;
          } else if (empMesh.userData._profileRef !== empProfile) {
            syncSims2ActorProfile(empMesh, empProfile);
            empMesh.userData._profileRef = empProfile;
          }

          let targetLx = empData.posicionLocal?.[0] || 0;
          let targetLz = empData.posicionLocal?.[2] || 0;
          let handItem = empData.itemEnMano;
          let animType = empData.animacionActual || null;
          let targetMachineKey = null;
          let stepCodigo = null;
          let stepProgress = 0;

          if ((empData.estado === 'ATENDIENDO_CLIENTE' || empData.estado === 'ATENDIENDO_QUEUE') && empData.recetaActual) {
            const activeStep = empData.recetaActual.pasos?.[empData.pasoActualIndex];
            targetMachineKey = activeStep?.equipoKey || null;
            stepCodigo = activeStep?.codigo || null;
            const dur = activeStep?.duracion || 0;
            if (dur > 0 && typeof empData.tiempoPasoRestante === 'number') {
              stepProgress = Math.max(0, Math.min(1, 1 - empData.tiempoPasoRestante / dur));
            }
          }

          // Modo Entrenamiento sobre el empleado titular (empIdx === 0)
          if (empIdx === 0 && freshTrain.isTrainingMode && freshTrain.selectedNegocioId === negId) {
            const rec = freshTrain.recetasEntrenadas[freshTrain.selectedProductId];
            const curStep = rec?.pasos?.[freshTrain.activeStepIndex];
            const wps = WAYPOINTS_POR_NEGOCIO[negId] || {};
            const wpCoord = wps[curStep?.waypointVendedor || 'barra_vendedor'] || [0, 0, -0.6];
            targetLx = wpCoord[0];
            targetLz = wpCoord[2];
            handItem = curStep?.itemManoVendedor || null;
            animType = curStep?.animacionVendedor || null;
            targetMachineKey = curStep?.equipoKey || null;
            stepCodigo = curStep?.codigo || null;
            stepProgress = typeof freshTrain.stepProgress === 'number' ? freshTrain.stepProgress : (nowSec * 0.14) % 1;
          }

          const destX = cx + targetLx;
          const destZ = cz + targetLz;
          const dx = destX - empMesh.position.x;
          const dz = destZ - empMesh.position.z;
          const isMoving = Math.hypot(dx, dz) > 0.08;

          empMesh.position.x += dx * 0.22;
          empMesh.position.z += dz * 0.22;
          empMesh.position.y = 0;

          if (isMoving) {
            empMesh.rotation.y = lerpAngle(empMesh.rotation.y, Math.atan2(dx, dz), 0.25);
          } else if (targetMachineKey && machineGroupsRef.current[targetMachineKey]) {
            machineGroupsRef.current[targetMachineKey].getWorldPosition(tmpMachineWorldPos);
            const mdx = tmpMachineWorldPos.x - empMesh.position.x;
            const mdz = tmpMachineWorldPos.z - empMesh.position.z;
            if (Math.hypot(mdx, mdz) > 0.05) {
              empMesh.rotation.y = lerpAngle(empMesh.rotation.y, Math.atan2(mdx, mdz), 0.22);
            }
          } else {
            empMesh.rotation.y = lerpAngle(empMesh.rotation.y, 0, 0.16);
          }

          animateSims2Actor(empMesh, animType, isMoving, nowSec, {
            stepProgress,
            stepCodigo,
            gender: empProfile.gender,
            negocioId: negId
          });
          const dualTools = resolveDualHandTools(animType, stepCodigo, handItem);
          if (empMesh.userData.rightHandSocket) {
            updateHandItemVisual(empMesh.userData.rightHandSocket, dualTools.rightTool);
          }
          if (empMesh.userData.leftHandSocket) {
            updateHandItemVisual(empMesh.userData.leftHandSocket, dualTools.leftTool);
          }
        });

        // Clientes en cola y clientes post-compra de este negocio con avatares GLB Sims 2
        const allClients = [
          ...(freshGame.clientesColaPorNegocio[negId] || []),
          ...(freshGame.clientesPostCompraPorNegocio[negId] || [])
        ];

        allClients.forEach((cli) => {
          activeCustomerIds.add(cli.id);
          let cliMesh = actorGroupsRef.current.customers[cli.id];
          if (!cliMesh) {
            const cliProfile = buildCustomerSims2Profile(cli.id, cli.colorCamisa || '#38bdf8');
            cliMesh = createSims2ActorGroup(cliProfile);
            cliMesh.position.set(cx + cli.posicionLocal[0], 0, cz + cli.posicionLocal[2]);
            scene.add(cliMesh);
            actorGroupsRef.current.customers[cli.id] = cliMesh;
          }
          const cdx = cx + cli.posicionLocal[0] - cliMesh.position.x;
          const cdz = cz + cli.posicionLocal[2] - cliMesh.position.z;
          const cliMoving = Math.hypot(cdx, cdz) > 0.08;
          cliMesh.position.x += cdx * 0.22;
          cliMesh.position.z += cdz * 0.22;
          cliMesh.position.y = 0;

          if (cliMoving) {
            cliMesh.rotation.y = lerpAngle(cliMesh.rotation.y, Math.atan2(cdx, cdz), 0.24);
          } else {
            cliMesh.rotation.y = lerpAngle(cliMesh.rotation.y, Math.PI, 0.16);
          }

          const isSeatedCli = !cliMoving && (cli.decisionPostCompra === 'sentado_mesa' || cli.targetWaypoint?.startsWith('mesa_'));
          animateSims2Actor(cliMesh, isSeatedCli ? 'EAT_AT_TABLE' : null, cliMoving, nowSec, {
            gender: cliMesh.userData.profile?.gender
          });

          let cliHandItem = null;
          if (cli.tieneProductoEnMano) {
            const pId = cli.productoDeseado?.id || '';
            if (pId === 'hp_crepa') cliHandItem = 'plated_crepa';
            else if (pId === 'hp_espresso_americano' || pId === 'hp_cappuccino_latte') cliHandItem = 'espresso_cup';
            else if (pId === 'pi_sub_tazas') cliHandItem = 'sublimation_mug';
            else if (pId === 'pap_impresion_color') cliHandItem = 'paper_stack';
            else if (pId.startsWith('imp_') || pId.startsWith('uni_') || pId.startsWith('bv_') || pId.startsWith('tc_')) cliHandItem = 'product_bag';
            else cliHandItem = 'finished_lemon_raspado';
          }
          if (cliMesh.userData.rightHandSocket) {
            updateHandItemVisual(cliMesh.userData.rightHandSocket, cliHandItem);
          }
        });
      });

      // Gerente General (Usuario con aura dorada + Plumbob en movimiento entre los 6 negocios y Oficina Consorcio)
      const mgrData = freshGame.gerenteState;
      if (mgrData) {
        const mgrProfile = sims2ConfigMap.gerente || defaultProfiles.gerente;
        let mgrMesh = actorGroupsRef.current.gerente;
        if (!mgrMesh) {
          mgrMesh = createSims2ActorGroup(mgrProfile);
          const initW = mgrData.worldPos || [-14, 0, -5];
          mgrMesh.position.set(initW[0], 0, initW[2]);
          mgrMesh.userData._profileRef = mgrProfile;
          scene.add(mgrMesh);
          actorGroupsRef.current.gerente = mgrMesh;
        } else if (mgrMesh.userData._profileRef !== mgrProfile) {
          syncSims2ActorProfile(mgrMesh, mgrProfile);
          mgrMesh.userData._profileRef = mgrProfile;
        }

        const targetW = mgrData.worldPos || [mgrMesh.position.x, 0, mgrMesh.position.z];
        const mdx = targetW[0] - mgrMesh.position.x;
        const mdz = targetW[2] - mgrMesh.position.z;
        const mgrMoving = Math.hypot(mdx, mdz) > 0.08;
        mgrMesh.position.x += mdx * 0.22;
        mgrMesh.position.z += mdz * 0.22;
        mgrMesh.position.y = 0;

        if (mgrMoving) {
          mgrMesh.rotation.y = lerpAngle(mgrMesh.rotation.y, Math.atan2(mdx, mdz), 0.25);
        } else if (mgrData.targetWaypoint?.startsWith('eq_')) {
          const eqMatch = mgrData.targetWaypoint.replace(/^eq_/, '');
          const mach = machineGroupsRef.current[eqMatch];
          if (mach) {
            mach.getWorldPosition(tmpMachineWorldPos);
            const tdx = tmpMachineWorldPos.x - mgrMesh.position.x;
            const tdz = tmpMachineWorldPos.z - mgrMesh.position.z;
            if (Math.hypot(tdx, tdz) > 0.05) {
              mgrMesh.rotation.y = lerpAngle(mgrMesh.rotation.y, Math.atan2(tdx, tdz), 0.22);
            }
          }
        } else if (mgrData.animacionActual === 'EAT_AT_TABLE') {
          mgrMesh.rotation.y = lerpAngle(mgrMesh.rotation.y, 0, 0.16);
        } else {
          mgrMesh.rotation.y = lerpAngle(mgrMesh.rotation.y, 0, 0.16);
        }

        animateSims2Actor(mgrMesh, mgrData.animacionActual, mgrMoving, nowSec, {
          gender: mgrProfile.gender
        });
        const mgrDual = resolveDualHandTools(mgrData.animacionActual, null, mgrData.itemEnMano || null);
        if (mgrMesh.userData.rightHandSocket) {
          updateHandItemVisual(mgrMesh.userData.rightHandSocket, mgrDual.rightTool);
        }
        if (mgrMesh.userData.leftHandSocket) {
          updateHandItemVisual(mgrMesh.userData.leftHandSocket, mgrDual.leftTool);
        }
      }

      // Familia (Esposa, Alex 12 años y Bárbara 8 años entre 3:00 y 4:00 PM en Oficina o Hawaiian Paradise)
      const famState = freshGame.familiaState;
      if (famState?.visitActive && Array.isArray(famState.miembros)) {
        famState.miembros.forEach((fam) => {
          const famId = fam.sims2Id || fam.id;
          activeFamiliaIds.add(famId);
          const famProfile = sims2ConfigMap[famId] || defaultProfiles[famId] || defaultProfiles.familia_esposa;
          let famMesh = actorGroupsRef.current.familia[famId];
          if (!famMesh) {
            famMesh = createSims2ActorGroup(famProfile);
            const initFw = fam.worldPos || [26.5, 0, 5.2];
            famMesh.position.set(initFw[0], 0, initFw[2]);
            famMesh.userData._profileRef = famProfile;
            scene.add(famMesh);
            actorGroupsRef.current.familia[famId] = famMesh;
          } else if (famMesh.userData._profileRef !== famProfile) {
            syncSims2ActorProfile(famMesh, famProfile);
            famMesh.userData._profileRef = famProfile;
          }

          const targetFw = fam.worldPos || [famMesh.position.x, 0, famMesh.position.z];
          const fdx = targetFw[0] - famMesh.position.x;
          const fdz = targetFw[2] - famMesh.position.z;
          const famMoving = Math.hypot(fdx, fdz) > 0.08;
          famMesh.position.x += fdx * 0.22;
          famMesh.position.z += fdz * 0.22;
          famMesh.position.y = 0;

          if (famMoving) {
            famMesh.rotation.y = lerpAngle(famMesh.rotation.y, Math.atan2(fdx, fdz), 0.24);
          } else if (fam.targetWaypoint?.startsWith('sofa_tv')) {
            famMesh.rotation.y = lerpAngle(famMesh.rotation.y, Math.PI, 0.18);
          } else {
            famMesh.rotation.y = lerpAngle(famMesh.rotation.y, 0, 0.18);
          }

          animateSims2Actor(famMesh, fam.animacionActual, famMoving, nowSec, {
            gender: famProfile.gender
          });
        });
      }

      // Limpiar mallas de empleados, familiares y clientes que ya salieron del mapa
      Object.keys(actorGroupsRef.current.employees).forEach((empId) => {
        if (!activeEmployeeIds.has(empId)) {
          const oldEmp = actorGroupsRef.current.employees[empId];
          oldEmp.userData.disposed = true;
          scene.remove(oldEmp);
          delete actorGroupsRef.current.employees[empId];
        }
      });
      Object.keys(actorGroupsRef.current.familia).forEach((famId) => {
        if (!activeFamiliaIds.has(famId)) {
          const oldFam = actorGroupsRef.current.familia[famId];
          oldFam.userData.disposed = true;
          scene.remove(oldFam);
          delete actorGroupsRef.current.familia[famId];
        }
      });
      Object.keys(actorGroupsRef.current.customers).forEach((cliId) => {
        if (!activeCustomerIds.has(cliId)) {
          const oldCli = actorGroupsRef.current.customers[cliId];
          oldCli.userData.disposed = true;
          scene.remove(oldCli);
          delete actorGroupsRef.current.customers[cliId];
        }
      });

      // Interpolar transición suave de cámara si hay un cambio de negocio/vista en curso
      const camTrans = cameraTransitionRef.current;
      if (camTrans.active) {
        camTrans.progress = Math.min(1, camTrans.progress + dt / camTrans.duration);
        const t = camTrans.progress;
        const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        camera.position.lerpVectors(camTrans.startPos, camTrans.endPos, eased);
        controls.target.lerpVectors(camTrans.startTarget, camTrans.endTarget, eased);
        if (camTrans.progress >= 1) {
          camTrans.active = false;
        }
      }

      controls.update();
      renderer.render(scene, camera);

      // Actualizar motor de audio espacial (música BT, ambiente de tienda/cafetería/taller y sonido real de máquinas)
      let nearestNegId = 'hawaiian_paradise';
      let minNegDist = Infinity;
      Object.entries(ALL_ZONES_3D).forEach(([zId, zInfo]) => {
        if (!zInfo?.centro) return;
        const d = Math.hypot(controls.target.x - zInfo.centro[0], controls.target.z - zInfo.centro[2]);
        if (d < minNegDist) {
          minNegDist = d;
          nearestNegId = zId;
        }
      });
      audioEngine.updateFromSimulation(nowSec, nearestNegId, freshGame, freshTrain);

      // Actualizar etiquetas flotantes 2D proyectadas desde el mundo 3D cada ~80ms
      labelThrottle += dt;
      if (labelThrottle >= 0.08) {
        labelThrottle = 0;
        const width = container.clientWidth;
        const height = container.clientHeight;
        const nextLabels = [];

        const projectToScreen = (worldVec) => {
          const v = worldVec.clone().project(camera);
          if (v.z > 1) return null;
          return {
            x: (v.x * 0.5 + 0.5) * width,
            y: (-(v.y * 0.5) + 0.5) * height
          };
        };

        // Etiquetas de empleados (1..4 por local) y clientes activos
        NEGOCIOS_ACTIVOS_IDS.forEach((negId) => {
          const zone = ALL_ZONES_3D[negId];
          if (!zone) return;
          const empLista =
            freshGame.empleadosListaPorNegocio?.[negId] ||
            (freshGame.empleadosPorNegocio?.[negId] ? [freshGame.empleadosPorNegocio[negId]] : []);

          empLista.forEach((empData, empIdx) => {
            if (!empData) return;
            const empMesh = actorGroupsRef.current.employees[empData.id];
            if (!empMesh) return;
            const profile = empMesh.userData.profile;
            const labelY = Math.max(1.85, ((profile?.heightCm || 170) / 100) + 0.30);
            const screenPos = projectToScreen(new THREE.Vector3(empMesh.position.x, labelY, empMesh.position.z));
            if (screenPos) {
              let texto = empData.textoAccion;
              let subProgress = null;
              if (empIdx === 0 && freshTrain.isTrainingMode && freshTrain.selectedNegocioId === negId) {
                const rec = freshTrain.recetasEntrenadas[freshTrain.selectedProductId];
                const step = rec?.pasos?.[freshTrain.activeStepIndex];
                if (step) {
                  texto = `[Entrenamiento Paso ${step.orden}] ${step.titulo}`;
                  subProgress = Math.min(100, Math.round((freshTrain.stepElapsedSec / Math.max(1, step.duracionSegundos)) * 100));
                }
              } else if ((empData.estado === 'ATENDIENDO_CLIENTE' || empData.estado === 'ATENDIENDO_QUEUE') && empData.recetaActual) {
                const step = empData.recetaActual.pasos?.[empData.pasoActualIndex];
                if (step) {
                  subProgress = Math.min(100, Math.round((empData.pasoElapsedSec / Math.max(1, step.duracionSegundos)) * 100));
                }
              }

              nextLabels.push({
                id: `lbl_emp_${empData.id}`,
                x: screenPos.x,
                y: screenPos.y,
                badge: `${empData.nombre || `Emp ${empIdx + 1}`} · ${zone.nombre}`,
                color: empData.enHorarioComida ? '#f59e0b' : zone.colorHex,
                text: texto,
                progress: subProgress
              });
            }
          });

          // Globo de diálogo del cliente activo en este negocio
          const activeCli = freshGame.clientesColaPorNegocio[negId]?.[0];
          const cliMesh = activeCli ? actorGroupsRef.current.customers[activeCli.id] : null;
          if (activeCli && cliMesh && activeCli.globoTexto) {
            const cliScreen = projectToScreen(new THREE.Vector3(cliMesh.position.x, 1.95, cliMesh.position.z));
            if (cliScreen) {
              nextLabels.push({
                id: `lbl_cli_${activeCli.id}`,
                x: cliScreen.x,
                y: cliScreen.y,
                badge: activeCli.nombre,
                color: '#38bdf8',
                text: activeCli.globoTexto,
                isClient: true
              });
            }
          }
        });

        // Etiqueta flotante del Gerente General
        if (mgrData && actorGroupsRef.current.gerente) {
          const mgrMesh = actorGroupsRef.current.gerente;
          const mgrY = Math.max(2.05, ((mgrMesh.userData.profile?.heightCm || 175) / 100) + 0.56);
          const mgrScreen = projectToScreen(new THREE.Vector3(mgrMesh.position.x, mgrY, mgrMesh.position.z));
          if (mgrScreen && mgrData.textoAccion) {
            nextLabels.push({
              id: 'lbl_gerente_general',
              x: mgrScreen.x,
              y: mgrScreen.y,
              badge: '👑 Alex (Gerente General)',
              color: '#facc15',
              text: mgrData.textoAccion
            });
          }
        }

        // Etiquetas flotantes de la Familia cuando visitan Oficina o Hawaiian Paradise (3:00–4:00 PM)
        if (famState?.visitActive && Array.isArray(famState.miembros)) {
          famState.miembros.forEach((fam) => {
            const famId = fam.sims2Id || fam.id;
            const famMesh = actorGroupsRef.current.familia[famId];
            if (!famMesh || !fam.textoAccion) return;
            const famY = Math.max(1.55, ((famMesh.userData.profile?.heightCm || 150) / 100) + 0.42);
            const famScreen = projectToScreen(new THREE.Vector3(famMesh.position.x, famY, famMesh.position.z));
            if (famScreen) {
              nextLabels.push({
                id: `lbl_fam_${famId}`,
                x: famScreen.x,
                y: famScreen.y,
                badge: fam.nombre,
                color: '#ec4899',
                text: fam.textoAccion,
                isClient: true
              });
            }
          });
        }

        // Proyectar popups de pago en caja (+$50 estilo StarCraft SCV)
        const nextCash = [];
        (freshGame.cashPopups || []).forEach((cp) => {
          const zone = ALL_ZONES_3D[cp.negocioId];
          const wpMap = WAYPOINTS_POR_NEGOCIO[cp.negocioId];
          if (!zone || !wpMap) return;
          const wpCaja = wpMap.caja_tpv_vendedor || wpMap.barra_vendedor || [1.4, 0, -0.5];
          const screenPos = projectToScreen(
            new THREE.Vector3(zone.center[0] + wpCaja[0], 1.95, zone.center[2] + wpCaja[2] + 0.3)
          );
          if (screenPos) {
            nextCash.push({
              id: cp.id,
              x: screenPos.x,
              y: screenPos.y,
              monto: cp.monto
            });
          }
        });

        // Proyectar ventanas flotantes de telemetría eléctrica junto a cada aparato en operación (incluye Oficina Consorcio)
        const nextTelemetry = [];
        const totalKwhMesConsorcio = Object.keys(ALL_ZONES_3D).reduce(
          (acc, id) => acc + (freshGame.statsPorNegocio[id]?.kwhMes ?? freshGame.statsPorNegocio[id]?.kwhAcumulados ?? 0),
          0
        );
        const reciboConsorcio = calcularCobroCFECompleto(totalKwhMesConsorcio);
        const totalFactura = reciboConsorcio?.factura?.total || 0;
        const tarifaEfectivaKwh =
          totalKwhMesConsorcio > 0 && totalFactura > 0 ? totalFactura / totalKwhMesConsorcio : 1.164;
        const machineWorldPos = new THREE.Vector3();

        if (freshTrain.isTrainingMode) {
          const rec = freshTrain.recetasEntrenadas[freshTrain.selectedProductId];
          const curStep = rec?.pasos?.[freshTrain.activeStepIndex];
          const eqKey = curStep?.equipoKey;
          if (eqKey && curStep?.estadoEquipo !== 'OFF' && machineGroupsRef.current[eqKey]) {
            const meshGroup = machineGroupsRef.current[eqKey];
            const eqMeta = freshGame.equiposRuntime[eqKey];
            const wattsNow = Math.round(
              (curStep.wattsNominales || eqMeta?.wattsNominal || 0) * (curStep.factorPotencia ?? 1.0)
            );
            let opSec = Math.max(0, freshTrain.stepElapsedSec || 0);
            let opKwh = (wattsNow * (opSec / 3600)) / 1000;
            for (let idx = freshTrain.activeStepIndex - 1; idx >= 0; idx--) {
              const prevStep = rec.pasos[idx];
              if (!prevStep || prevStep.equipoKey !== eqKey || prevStep.estadoEquipo === 'OFF') break;
              const prevDur = Math.max(0, parseFloat(prevStep.duracionSegundos) || 0);
              const prevW = Math.round(
                (prevStep.wattsNominales || eqMeta?.wattsNominal || 0) * (prevStep.factorPotencia ?? 1.0)
              );
              opSec += prevDur;
              opKwh += (prevW * (prevDur / 3600)) / 1000;
            }
            meshGroup.getWorldPosition(machineWorldPos);
            const screenPos = projectToScreen(
              new THREE.Vector3(machineWorldPos.x + 0.55, machineWorldPos.y + 1.48, machineWorldPos.z)
            );
            if (screenPos && screenPos.x > -40 && screenPos.x < width + 40 && screenPos.y > -40 && screenPos.y < height + 40) {
              nextTelemetry.push({
                id: `tel_${eqKey}`,
                eqKey,
                nombre: APPLIANCE_SHORT_NAMES[eqKey] || eqMeta?.nombre || eqKey,
                watts: wattsNow,
                elapsedSec: opSec,
                costoMxn: opKwh * tarifaEfectivaKwh,
                estado: curStep.estadoEquipo || 'WORK',
                iceRemaining: eqKey === 'hp_raspadora' ? (eqMeta?.raspadosRestantesHielo ?? 10) : null,
                iceMax: eqKey === 'hp_raspadora' ? (eqMeta?.maxRaspadosPorBloque ?? 10) : null,
                x: screenPos.x,
                y: screenPos.y
              });
            }
          }
        } else {
          Object.keys(machineGroupsRef.current).forEach((eqKey) => {
            const meshGroup = machineGroupsRef.current[eqKey];
            const eq = freshGame.equiposRuntime[eqKey];
            if (!meshGroup || !eq || eq.wattsActuales <= 0 || !eq.operacionActiva) return;

            const isFocusedBusiness = freshGame.focusedNegocioId === eq.negocioId;
            const shouldDisplay =
              eq.rol === 'produccion' ||
              eq.rol === 'turno_fijo' ||
              eq.controlMode === 'MANUAL_ON' ||
              isFocusedBusiness;
            if (!shouldDisplay) return;

            meshGroup.getWorldPosition(machineWorldPos);
            const yOffset = eq.rol === 'clima' || eqKey.includes('ac') ? 0.35 : 1.48;
            const screenPos = projectToScreen(
              new THREE.Vector3(machineWorldPos.x + 0.55, machineWorldPos.y + yOffset, machineWorldPos.z)
            );
            if (!screenPos || screenPos.x < -40 || screenPos.x > width + 40 || screenPos.y < -40 || screenPos.y > height + 40) {
              return;
            }

            nextTelemetry.push({
              id: `tel_${eqKey}`,
              eqKey,
              nombre: APPLIANCE_SHORT_NAMES[eqKey] || eq.nombre,
              watts: eq.wattsActuales,
              elapsedSec: eq.segundosEnOperacionActual || 0,
              costoMxn: (eq.kwhEnOperacionActual || 0) * tarifaEfectivaKwh,
              estado: eq.estado,
              iceRemaining: eqKey === 'hp_raspadora' ? (eq.raspadosRestantesHielo ?? 10) : null,
              iceMax: eqKey === 'hp_raspadora' ? (eq.maxRaspadosPorBloque ?? 10) : null,
              x: screenPos.x,
              y: screenPos.y
            });
          });
        }

        setOverlayLabels(nextLabels);
        setOverlayCashPopups(nextCash);
        setOverlayApplianceTelemetry(nextTelemetry);
      }
    };

    animFrameId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / Math.max(1, container.clientHeight);
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handleCanvasClick);
      Object.values(actorGroupsRef.current.employees).forEach((g) => {
        if (g) g.userData.disposed = true;
      });
      Object.values(actorGroupsRef.current.customers).forEach((g) => {
        if (g) g.userData.disposed = true;
      });
      Object.values(actorGroupsRef.current.familia).forEach((g) => {
        if (g) g.userData.disposed = true;
      });
      if (actorGroupsRef.current.gerente) {
        actorGroupsRef.current.gerente.userData.disposed = true;
      }
      actorGroupsRef.current = { employees: {}, customers: {}, gerente: null, familia: {} };
      machineGroupsRef.current = {};
      meterDiscsRef.current = {};
      renderer.dispose();
    };
  }, []);

  // Reconstruir Bloques de Colisión y Grilla NavMesh cuando cambian en useSceneEditorStore
  useEffect(() => {
    const colGroup = collisionGroupRef.current;
    const navGroup = navMeshGroupRef.current;
    if (!colGroup || !navGroup) return;

    while (colGroup.children.length > 0) colGroup.remove(colGroup.children[0]);
    while (navGroup.children.length > 0) navGroup.remove(navGroup.children[0]);

    const EQUIPMENT_FOOTPRINT_BLOCK_IDS = new Set([
      'col_hp_isla_trasera',
      'col_pap_docucolor_base',
      'col_bv_bancada_4cab',
      'col_tc_mesa_corte',
      'col_tc_linea_costura',
      'col_pi_bancada_prensas',
      'col_imp_racks_fondo'
    ]);

    Object.keys(ALL_ZONES_3D).forEach((negId) => {
      const zone = ALL_ZONES_3D[negId];
      const [cx, , cz] = zone.center;
      const blocks = collisionBlocksByNegocio[negId] || [];

      blocks.forEach((b) => {
        const isSupersededOfficeModel =
          b.id?.startsWith('col_oc_tv') || b.id?.startsWith('col_oc_escritorio') || b.id?.startsWith('col_oc_laptop');
        if ((EQUIPMENT_FOOTPRINT_BLOCK_IDS.has(b.id) || isSupersededOfficeModel) && !showCollisionBlocks) {
          return;
        }

        if (!showCollisionBlocks && b.id?.startsWith('col_oc_sofa')) {
          const sofaGroup = new THREE.Group();
          sofaGroup.position.set(cx + b.x, 0, cz + b.z);
          const fabricMat = new THREE.MeshStandardMaterial({ color: '#1e3a8a', roughness: 0.78 });
          const seat = new THREE.Mesh(new THREE.BoxGeometry(b.w, 0.42, b.d), fabricMat);
          seat.position.y = 0.21;
          seat.castShadow = true;
          seat.receiveShadow = true;
          const back = new THREE.Mesh(new THREE.BoxGeometry(b.w, 0.48, 0.18), fabricMat);
          back.position.set(0, 0.56, b.d / 2 - 0.09);
          back.castShadow = true;
          sofaGroup.add(seat, back);
          colGroup.add(sofaGroup);
          return;
        }

        if (!showCollisionBlocks && b.id?.startsWith('col_hp_mesa_')) {
          const tableGroup = new THREE.Group();
          tableGroup.position.set(cx + b.x, 0, cz + b.z);
          const radius = Math.min(b.w, b.d) * 0.46;
          const topMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(radius, radius, 0.05, 18),
            new THREE.MeshStandardMaterial({ color: b.color || '#d97706', roughness: 0.35 })
          );
          topMesh.position.y = b.h - 0.025;
          topMesh.castShadow = true;
          topMesh.receiveShadow = true;
          tableGroup.add(topMesh);

          const metalMat = new THREE.MeshStandardMaterial({ color: '#475569', metalness: 0.6, roughness: 0.3 });
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, b.h - 0.05, 12), metalMat);
          post.position.y = (b.h - 0.05) / 2;
          post.castShadow = true;
          tableGroup.add(post);

          const base = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.48, radius * 0.52, 0.03, 14), metalMat);
          base.position.y = 0.015;
          base.receiveShadow = true;
          tableGroup.add(base);

          colGroup.add(tableGroup);
          return;
        }

        const boxGeo = new THREE.BoxGeometry(b.w, b.h, b.d);
        const boxMat = new THREE.MeshStandardMaterial({
          color: b.color || '#d97706',
          roughness: 0.45,
          transparent: showCollisionBlocks,
          opacity: showCollisionBlocks ? 0.65 : 1.0
        });
        const mesh = new THREE.Mesh(boxGeo, boxMat);
        mesh.position.set(cx + b.x, b.h / 2, cz + b.z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (showCollisionBlocks) {
          const edges = new THREE.EdgesGeometry(boxGeo);
          const wire = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: '#ef4444' }));
          mesh.add(wire);
        }
        colGroup.add(mesh);
      });

      // Si showNavMesh está activo, dibujar las celdas caminables (verde) vs bloqueadas (rojo)
      if (showNavMesh) {
        const step = 0.65;
        const halfX = Math.max(3.6, (zone.size?.[0] || 10.4) / 2 - 0.4);
        const halfZ = Math.max(3.6, (zone.size?.[2] || 9.0) / 2 - 0.4);
        for (let lx = -halfX; lx <= halfX; lx += step) {
          for (let lz = -halfZ; lz <= halfZ; lz += step) {
            const blocked = isLocalPointBlocked(lx, lz, negId, collisionBlocksByNegocio);
            const tile = new THREE.Mesh(
              new THREE.PlaneGeometry(step * 0.86, step * 0.86),
              new THREE.MeshBasicMaterial({
                color: blocked ? '#ef4444' : '#10b981',
                transparent: true,
                opacity: blocked ? 0.42 : 0.28,
                side: THREE.DoubleSide
              })
            );
            tile.rotation.x = -Math.PI / 2;
            tile.position.set(cx + lx, 0.03, cz + lz);
            navGroup.add(tile);
          }
        }
      }
    });
  }, [collisionBlocksByNegocio, showCollisionBlocks, showNavMesh]);

  // Renderizar Modelos 3D personalizados (.skp / .glb / .dae / .obj) importados por el usuario
  useEffect(() => {
    const customGroup = customModelsGroupRef.current;
    if (!customGroup) return;
    while (customGroup.children.length > 0) customGroup.remove(customModelsGroupRef.current.children[0]);

    customModels3D.forEach((item) => {
      if (!item.object3D) return;
      const zone = ALL_ZONES_3D[item.negocioId || 'hawaiian_paradise'] || NEGOCIOS_ZONES_3D.hawaiian_paradise;
      const clone = item.object3D.clone();
      clone.position.set(
        zone.center[0] + (item.localX || 0),
        item.localY || 0,
        zone.center[2] + (item.localZ || 0)
      );
      clone.rotation.y = ((item.rotationDeg || 0) * Math.PI) / 180;
      customGroup.add(clone);
    });
  }, [customModels3D]);

  // Mover suavemente la cámara con animación interpolada cuando el usuario selecciona un negocio, Oficina, vista general o Medidor CFE
  useEffect(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    const targetId = isTrainingMode ? trainingNegocioId : focusedNegocioId;
    const endPos = new THREE.Vector3();
    const endTarget = new THREE.Vector3();

    if (targetId === 'ALL_CONSORCIO') {
      endPos.set(2, 30, 31);
      endTarget.set(2, 0, 1);
    } else if (targetId === 'CFE_METER_INSPECT') {
      const mIdx = Math.max(0, (parseInt((focusedMedidorId || 'med_3').replace('med_', ''), 10) || 3) - 1);
      const zOff = 1 + (-2.2 + mIdx * 0.88);
      endPos.set(-19.5, 2.2, zOff + 0.8);
      endTarget.set(-22.4, 1.65, zOff);
    } else if (ALL_ZONES_3D[targetId]) {
      const zone = ALL_ZONES_3D[targetId];
      if (isTrainingMode) {
        endPos.set(zone.center[0], 6.5, zone.center[2] + 6.5);
        endTarget.set(zone.center[0], 1.0, zone.center[2] - 1.5);
      } else {
        endPos.set(...zone.cameraPreset.position);
        endTarget.set(...zone.cameraPreset.target);
      }
    } else {
      return;
    }

    if (!hasMountedCameraRef.current) {
      hasMountedCameraRef.current = true;
      camera.position.copy(endPos);
      controls.target.copy(endTarget);
      controls.update();
      return;
    }

    cameraTransitionRef.current = {
      active: true,
      startPos: camera.position.clone(),
      startTarget: controls.target.clone(),
      endPos,
      endTarget,
      progress: 0,
      duration: 1.05
    };
  }, [focusedNegocioId, focusedMedidorId, isTrainingMode, trainingNegocioId]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950">
      {/* Lienzo WebGL 3D */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Etiquetas Flotantes, Globos de Diálogo y Popups +$50 estilo StarCraft SCV */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {overlayLabels.map((lbl) => (
          <div
            key={lbl.id}
            style={{
              transform: `translate3d(${Math.round(lbl.x)}px, ${Math.round(lbl.y)}px, 0) translate(-50%, -100%)`
            }}
            className="absolute top-0 left-0 transition-transform duration-75"
          >
            <div
              className={`px-2.5 py-1.5 rounded-xl border shadow-lg backdrop-blur-md max-w-[230px] text-xs ${
                lbl.isClient
                  ? 'bg-sky-950/90 border-sky-400/50 text-sky-100'
                  : 'bg-slate-900/90 border-slate-700/80 text-slate-100'
              }`}
            >
              <div className="flex items-center gap-1.5 font-semibold text-[10px] uppercase tracking-wider mb-0.5">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: lbl.color }}
                />
                <span className="truncate opacity-90">{lbl.badge}</span>
              </div>
              <div className="font-medium leading-tight">{lbl.text}</div>
              {lbl.progress !== null && lbl.progress !== undefined && (
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-teal-400 transition-all duration-100"
                    style={{ width: `${lbl.progress}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Popups flotantes puro texto verde +$XX arriba de la caja (estilo StarCraft SCV minerales) */}
        {overlayCashPopups.map((cp) => (
          <div
            key={cp.id}
            style={{
              left: `${Math.round(cp.x)}px`,
              top: `${Math.round(cp.y)}px`,
              textShadow: '0 2px 3px rgba(0,0,0,0.98), 0 0 8px rgba(0,0,0,0.9)'
            }}
            className="animate-scv-cash absolute pointer-events-none select-none font-mono font-black text-xl text-[#22c55e] whitespace-nowrap bg-transparent border-0"
          >
            +${Number.isInteger(cp.monto) ? cp.monto : Math.round(cp.monto)}
          </div>
        ))}

        {/* Ventanas flotantes de telemetría junto a cada aparato eléctrico en funcionamiento */}
        {overlayApplianceTelemetry.map((tel) => {
          const isPreheat = tel.estado === 'PREHEAT';
          return (
            <div
              key={tel.id}
              data-testid={`appliance-telemetry-${tel.eqKey}`}
              style={{
                transform: `translate3d(${Math.round(tel.x)}px, ${Math.round(tel.y)}px, 0) translate(0%, -50%)`
              }}
              className={`absolute top-0 left-0 pointer-events-none select-none transition-transform duration-75 px-2 py-1.5 rounded-lg border backdrop-blur-md shadow-xl min-w-[148px] text-[10px] leading-tight ${
                isPreheat
                  ? 'bg-slate-950/92 border-amber-400/75 text-amber-100'
                  : 'bg-slate-950/92 border-emerald-400/75 text-emerald-100'
              }`}
            >
              <div className="flex items-center justify-between gap-2 pb-1 mb-1 border-b border-white/10">
                <span className="font-bold text-white truncate max-w-[110px]">{tel.nombre}</span>
                <span
                  className={`px-1 py-0.2 rounded text-[8px] font-black tracking-wider uppercase ${
                    isPreheat ? 'bg-amber-500/25 text-amber-300' : 'bg-emerald-500/25 text-emerald-300'
                  }`}
                >
                  {isPreheat ? 'PRECAL' : 'ON'}
                </span>
              </div>
              <div className="space-y-0.5 font-mono">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-400">⚡ Consumo:</span>
                  <span className="font-bold text-amber-300">{formatWattsText(tel.watts)}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-400">⏱️ Encendido:</span>
                  <span className="font-bold text-sky-300">{formatOpDuration(tel.elapsedSec)}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-400">💲 Gasto op.:</span>
                  <span className="font-bold text-emerald-300">{formatOpCostMxn(tel.costoMxn)}</span>
                </div>
                {tel.iceRemaining !== null && tel.iceRemaining !== undefined && (
                  <div className="flex items-center justify-between gap-2 pt-0.5 border-t border-white/10">
                    <span className="text-slate-400">🧊 Bloque:</span>
                    <span className={`font-bold ${tel.iceRemaining <= 2 ? 'text-rose-300' : 'text-cyan-300'}`}>
                      {tel.iceRemaining}/{tel.iceMax} raspados
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
