/**
 * Motor Gráfico 3D Principal (Three.js WebGL) para SIM CITY BUSINESS.
 * Renderiza los 6 locales comerciales, Pisos, Muros, Bloques de Colisión, Grilla NavMesh A*,
 * Equipos Eléctricos detallados (Máquina de Raspados con palanca y hielo, Crepera, Licuadora,
 * Cafetera, TPV, DocuColor, Bordadoras 4 cabezas, Costura, Sublimación/Láser), Materia Prima,
 * Empleados y Clientes con globos de diálogo en vivo y Pared de Medidores CFE.
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';
import {
  NEGOCIOS_ZONES_3D,
  WAYPOINTS_POR_NEGOCIO
} from '../../engine/ChoreographyRegistry.js';
import { isLocalPointBlocked } from '../../engine/NavMeshGrid.js';
import { useGameStore, NEGOCIOS_ACTIVOS_IDS } from '../../store/useGameStore.js';
import { useSceneEditorStore } from '../../store/useSceneEditorStore.js';
import { useTrainingStore } from '../../store/useTrainingStore.js';

/**
 * Construye una figura humanoide 3D estilizada para Empleado o Cliente
 */
function createHumanoidActorMesh(shirtColorHex = '#10b981', isEmployee = false) {
  const group = new THREE.Group();

  // Piernas
  const legGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.55, 10);
  const legMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.7 });
  const leftLeg = new THREE.Mesh(legGeo, legMat);
  leftLeg.position.set(-0.11, 0.275, 0);
  leftLeg.castShadow = true;
  const rightLeg = new THREE.Mesh(legGeo, legMat);
  rightLeg.position.set(0.11, 0.275, 0);
  rightLeg.castShadow = true;
  group.add(leftLeg, rightLeg);

  // Torso
  const torsoGeo = new THREE.CylinderGeometry(0.22, 0.18, 0.62, 12);
  const torsoMat = new THREE.MeshStandardMaterial({ color: shirtColorHex, roughness: 0.45 });
  const torso = new THREE.Mesh(torsoGeo, torsoMat);
  torso.position.set(0, 0.85, 0);
  torso.castShadow = true;
  group.add(torso);

  // Mandil si es empleado
  if (isEmployee) {
    const apronGeo = new THREE.BoxGeometry(0.32, 0.52, 0.12);
    const apronMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.5 });
    const apron = new THREE.Mesh(apronGeo, apronMat);
    apron.position.set(0, 0.80, 0.14);
    group.add(apron);
  }

  // Cabeza
  const headGeo = new THREE.SphereGeometry(0.21, 16, 16);
  const headMat = new THREE.MeshStandardMaterial({ color: '#fde68a', roughness: 0.4 });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.set(0, 1.38, 0);
  head.castShadow = true;
  group.add(head);

  // Gorra si es empleado
  if (isEmployee) {
    const capGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.10, 14);
    const capMat = new THREE.MeshStandardMaterial({ color: shirtColorHex, roughness: 0.4 });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.set(0, 1.52, 0);
    group.add(cap);
  }

  // Brazos
  const armGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.48, 8);
  const armMat = new THREE.MeshStandardMaterial({ color: shirtColorHex, roughness: 0.5 });
  const leftArm = new THREE.Mesh(armGeo, armMat);
  leftArm.position.set(-0.28, 0.88, 0.08);
  leftArm.rotation.x = -0.35;
  const rightArm = new THREE.Mesh(armGeo, armMat);
  rightArm.position.set(0.28, 0.88, 0.08);
  rightArm.rotation.x = -0.35;
  group.add(leftArm, rightArm);

  // Contenedor de objeto en manos (hielo, vaso, raspado, jarabe, prenda)
  const handItemGroup = new THREE.Group();
  handItemGroup.position.set(0, 0.92, 0.34);
  handItemGroup.name = 'handItemGroup';
  group.add(handItemGroup);

  return group;
}

/**
 * Actualiza el objeto 3D que lleva en la mano el vendedor o el cliente (ej. bloque de hielo, vaso, raspado de limón)
 */
function updateHandItemVisual(handItemGroup, itemType) {
  if (!handItemGroup) return;
  if (handItemGroup.userData.currentItemType === itemType) return;
  handItemGroup.userData.currentItemType = itemType;

  while (handItemGroup.children.length > 0) {
    handItemGroup.remove(handItemGroup.children[0]);
  }
  if (!itemType) return;

  if (itemType === 'ice_block') {
    const ice = new THREE.Mesh(
      new THREE.BoxGeometry(0.26, 0.22, 0.26),
      new THREE.MeshStandardMaterial({ color: '#7dd3fc', transparent: true, opacity: 0.85, roughness: 0.15 })
    );
    handItemGroup.add(ice);
  } else if (itemType === 'empty_cup') {
    const cup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.10, 0.07, 0.24, 12),
      new THREE.MeshStandardMaterial({ color: '#e2e8f0', transparent: true, opacity: 0.75 })
    );
    handItemGroup.add(cup);
  } else if (itemType === 'shaved_ice_cup') {
    const cup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.10, 0.07, 0.24, 12),
      new THREE.MeshStandardMaterial({ color: '#f8fafc' })
    );
    const snow = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 12, 12),
      new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.9 })
    );
    snow.position.y = 0.12;
    cup.add(snow);
    handItemGroup.add(cup);
  } else if (itemType === 'lemon_syrup_pouring') {
    const bottle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.07, 0.28, 10),
      new THREE.MeshStandardMaterial({ color: '#84cc16', roughness: 0.2 })
    );
    bottle.rotation.z = 0.85;
    handItemGroup.add(bottle);
  } else if (itemType === 'finished_lemon_raspado' || itemType === 'product_bag') {
    const cup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.08, 0.25, 12),
      new THREE.MeshStandardMaterial({ color: '#a3e635' })
    );
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 12, 12),
      new THREE.MeshStandardMaterial({ color: '#84cc16', roughness: 0.4 })
    );
    dome.position.y = 0.13;
    const straw = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.22, 8),
      new THREE.MeshStandardMaterial({ color: '#f43f5e' })
    );
    straw.position.set(0.03, 0.20, 0);
    straw.rotation.z = -0.25;
    cup.add(dome, straw);
    handItemGroup.add(cup);
  } else if (itemType === 'garment_hanger') {
    const garment = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 0.42, 0.08),
      new THREE.MeshStandardMaterial({ color: '#0ea5e9', roughness: 0.6 })
    );
    handItemGroup.add(garment);
  }
}

/**
 * Construye una Máquina de Raspados 3D detallada con tolva de hielo, palanca móvil, vaso y partículas de nieve
 */
function createIceShaverMachine3D() {
  const group = new THREE.Group();

  // Mesa soporte de acero inoxidable
  const table = new THREE.Mesh(
    new THREE.BoxGeometry(0.95, 0.85, 0.75),
    new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 0.6, roughness: 0.3 })
  );
  table.position.y = 0.425;
  table.castShadow = true;
  group.add(table);

  // Cuerpo de la máquina Hawaiian
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.48, 0.40),
    new THREE.MeshStandardMaterial({ color: '#0284c7', roughness: 0.3 })
  );
  body.position.set(0, 1.08, -0.05);
  group.add(body);

  // Tolva transparente de acrílico con bloque de hielo interior
  const hopper = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.18, 0.32, 16),
    new THREE.MeshStandardMaterial({ color: '#e0f2fe', transparent: true, opacity: 0.45 })
  );
  hopper.position.set(0, 1.46, -0.05);
  group.add(hopper);

  const iceBlockInside = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.22, 0.22),
    new THREE.MeshStandardMaterial({ color: '#38bdf8', transparent: true, opacity: 0.85 })
  );
  iceBlockInside.position.set(0, 1.44, -0.05);
  iceBlockInside.name = 'shaverIceBlock';
  group.add(iceBlockInside);

  // Palanca superior compresora (animada cuando está rallando hielo)
  const leverPivot = new THREE.Group();
  leverPivot.position.set(0, 1.64, -0.05);
  leverPivot.name = 'shaverLeverPivot';
  const leverArm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 0.45, 8),
    new THREE.MeshStandardMaterial({ color: '#f59e0b', metalness: 0.5 })
  );
  leverArm.rotation.x = Math.PI / 3;
  leverArm.position.set(0, 0.08, 0.18);
  leverPivot.add(leverArm);
  group.add(leverPivot);

  // Vaso receptor bajo la salida de hielo y partículas de hielo rallado
  const cupUnder = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.06, 0.22, 12),
    new THREE.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0.85 })
  );
  cupUnder.position.set(0, 0.96, 0.22);
  cupUnder.name = 'shaverCupUnder';
  group.add(cupUnder);

  const snowStream = new THREE.Mesh(
    new THREE.ConeGeometry(0.08, 0.28, 10),
    new THREE.MeshStandardMaterial({ color: '#f8fafc', emissive: '#bae6fd', emissiveIntensity: 0.5 })
  );
  snowStream.position.set(0, 1.12, 0.22);
  snowStream.name = 'shaverSnowStream';
  snowStream.visible = false;
  group.add(snowStream);

  // Halo luminoso de estado eléctrico en el piso
  const statusRing = new THREE.Mesh(
    new THREE.RingGeometry(0.55, 0.68, 24),
    new THREE.MeshBasicMaterial({ color: '#10b981', side: THREE.DoubleSide, transparent: true, opacity: 0.0 })
  );
  statusRing.rotation.x = -Math.PI / 2;
  statusRing.position.y = 0.02;
  statusRing.name = 'statusRing';
  group.add(statusRing);

  return group;
}

/**
 * Construye una máquina genérica industrial o de cocina con su halo de estado eléctrico
 */
function createGenericMachine3D(colorHex = '#f59e0b', w = 0.9, h = 1.1, d = 0.75, typeHint = 'box') {
  const group = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(w, 0.82, d),
    new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.6 })
  );
  base.position.y = 0.41;
  base.castShadow = true;
  group.add(base);

  if (typeHint === 'crepera') {
    const plate = new THREE.Mesh(
      new THREE.CylinderGeometry(0.36, 0.36, 0.08, 20),
      new THREE.MeshStandardMaterial({ color: '#090d16', metalness: 0.7, roughness: 0.3 })
    );
    plate.position.y = 0.86;
    plate.name = 'hotPlate';
    group.add(plate);
  } else {
    const topUnit = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.82, Math.max(0.28, h - 0.82), d * 0.80),
      new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.35, metalness: 0.25 })
    );
    topUnit.position.y = 0.82 + Math.max(0.28, h - 0.82) / 2;
    topUnit.castShadow = true;
    group.add(topUnit);
  }

  const statusRing = new THREE.Mesh(
    new THREE.RingGeometry(Math.max(w, d) * 0.58, Math.max(w, d) * 0.70, 24),
    new THREE.MeshBasicMaterial({ color: '#10b981', side: THREE.DoubleSide, transparent: true, opacity: 0.0 })
  );
  statusRing.rotation.x = -Math.PI / 2;
  statusRing.position.y = 0.02;
  statusRing.name = 'statusRing';
  group.add(statusRing);

  return group;
}

export default function GameCanvas3D() {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const actorGroupsRef = useRef({ employees: {}, customers: {} });
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

    // Iluminación Ambiental y Sol Direccional
    const ambientLight = new THREE.AmbientLight('#e2e8f0', 1.15);
    scene.add(ambientLight);

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
      new THREE.PlaneGeometry(75, 55),
      new THREE.MeshStandardMaterial({ color: '#090f1d', roughness: 0.92 })
    );
    groundSlab.rotation.x = -Math.PI / 2;
    groundSlab.position.y = -0.04;
    groundSlab.receiveShadow = true;
    scene.add(groundSlab);

    const gridHelper = new THREE.GridHelper(70, 70, '#1e293b', '#0f172a');
    gridHelper.position.y = -0.02;
    scene.add(gridHelper);

    // Construir cada uno de los 6 Locales Comerciales y sus máquinas/insumos 3D
    const wallsList = [];
    NEGOCIOS_ACTIVOS_IDS.forEach((negId) => {
      const zone = NEGOCIOS_ZONES_3D[negId];
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

      // Caja TPV en todos los negocios
      if (wps.caja_tpv_vendedor) {
        const tpvKey = negId === 'hawaiian_paradise' ? 'hp_tpv' : (negId === 'imperia_uniformes' ? 'imp_tpv' : (negId === 'papeleria_imperiarte' ? 'pap_tpv' : null));
        const pos = new THREE.Mesh(
          new THREE.BoxGeometry(0.46, 0.38, 0.32),
          new THREE.MeshStandardMaterial({ color: '#0f172a', emissive: '#0284c7', emissiveIntensity: 0.35 })
        );
        pos.position.set(wps.caja_tpv_vendedor[0], 1.18, 0.0);
        localGroup.add(pos);
        if (tpvKey) {
          machineGroupsRef.current[tpvKey] = pos;
        }
      }

      if (negId === 'hawaiian_paradise') {
        // 1. Máquina de Raspados Hawaiian (600W)
        const shaver = createIceShaverMachine3D();
        shaver.position.set(wps.eq_hp_raspadora[0], 0, wps.eq_hp_raspadora[2] - 0.65);
        localGroup.add(shaver);
        machineGroupsRef.current.hp_raspadora = shaver;

        // 2. Crepera Profesional (3000W)
        const crepera = createGenericMachine3D('#f59e0b', 0.95, 0.95, 0.85, 'crepera');
        crepera.position.set(wps.eq_hp_crepera[0], 0, wps.eq_hp_crepera[2] - 0.65);
        localGroup.add(crepera);
        machineGroupsRef.current.hp_crepera = crepera;

        // 3. Marquesitera (1300W)
        const marq = createGenericMachine3D('#d97706', 0.85, 1.05, 0.80);
        marq.position.set(wps.eq_hp_marquesitera[0], 0, wps.eq_hp_marquesitera[2] - 0.65);
        localGroup.add(marq);
        machineGroupsRef.current.hp_marquesitera = marq;

        // 4. Licuadora Ninja (2000W)
        const blender = createGenericMachine3D('#ef4444', 0.70, 1.32, 0.70);
        blender.position.set(wps.eq_hp_licuadora[0], 0, wps.eq_hp_licuadora[2] - 0.65);
        localGroup.add(blender);
        machineGroupsRef.current.hp_licuadora = blender;

        // 5. Cafetera Expresso Gaggia Ruby Pro (2640W)
        const espresso = createGenericMachine3D('#b91c1c', 1.05, 1.30, 0.80);
        espresso.position.set(wps.eq_hp_breville[0], 0, wps.eq_hp_breville[2] - 0.65);
        localGroup.add(espresso);
        machineGroupsRef.current.hp_breville = espresso;

        // 6. Estación de Jarabes (Limón, Fresa, Mango, Tamarindo) y Popotes
        const syrupStation = new THREE.Group();
        syrupStation.position.set(wps.raw_estacion_jarabes[0], 0.95, wps.raw_estacion_jarabes[2] - 0.35);
        const colorsSyrup = ['#84cc16', '#ef4444', '#facc15', '#78350f'];
        colorsSyrup.forEach((col, idx) => {
          const bottle = new THREE.Mesh(
            new THREE.CylinderGeometry(0.055, 0.065, 0.28, 10),
            new THREE.MeshStandardMaterial({ color: col, roughness: 0.2 })
          );
          bottle.position.set((idx - 1.5) * 0.16, 0.14, 0);
          syrupStation.add(bottle);
        });
        localGroup.add(syrupStation);

        // 7. Congelador de Bloques de Hielo y Refrigerador Vertical
        const freezer = createGenericMachine3D('#38bdf8', 1.1, 1.05, 0.85);
        freezer.position.set(wps.raw_congelador_hielo[0] - 0.4, 0, wps.raw_congelador_hielo[2] - 0.6);
        localGroup.add(freezer);
        machineGroupsRef.current.hp_congelador = freezer;

        const fridge = createGenericMachine3D('#cbd5e1', 0.95, 1.95, 0.85);
        fridge.position.set(wps.raw_refrigerador_insumos[0] + 0.3, 0, wps.raw_refrigerador_insumos[2] - 0.6);
        localGroup.add(fridge);
        machineGroupsRef.current.hp_refrigerador = fridge;
      }

      if (negId === 'papeleria_imperiarte') {
        const docucolor = createGenericMachine3D('#2563eb', 1.85, 1.38, 0.90);
        docucolor.position.set(wps.eq_pap_docucolor[0], 0, wps.eq_pap_docucolor[2] - 0.75);
        localGroup.add(docucolor);
        machineGroupsRef.current.pap_docucolor = docucolor;
      }

      if (negId === 'bordados_veracruz') {
        const aemco = createGenericMachine3D('#e11d48', 2.8, 1.45, 1.0);
        aemco.position.set(wps.eq_bv_aemco_220[0], 0, wps.eq_bv_aemco_220[2] - 0.8);
        localGroup.add(aemco);
        machineGroupsRef.current.bv_aemco_220 = aemco;

        const melco = createGenericMachine3D('#be123c', 2.6, 1.45, 1.0);
        melco.position.set(wps.eq_bv_melco_emc[0], 0, wps.eq_bv_melco_emc[2] - 0.8);
        localGroup.add(melco);
        machineGroupsRef.current.bv_melco_emc = melco;
      }

      if (negId === 'taller_costura') {
        const cortadora = createGenericMachine3D('#a855f7', 1.1, 1.1, 0.85);
        cortadora.position.set(wps.eq_tc_cortadora[0], 0, wps.eq_tc_cortadora[2] - 0.7);
        localGroup.add(cortadora);
        machineGroupsRef.current.tc_cortadora = cortadora;

        const overlock = createGenericMachine3D('#9333ea', 1.1, 1.15, 0.80);
        overlock.position.set(wps.eq_tc_overlock_5h[0], 0, wps.eq_tc_overlock_5h[2] - 0.7);
        localGroup.add(overlock);
        machineGroupsRef.current.tc_overlock_5h = overlock;

        const rectas = createGenericMachine3D('#7e22ce', 1.6, 1.15, 0.80);
        rectas.position.set(wps.eq_tc_rectas_singer[0], 0, wps.eq_tc_rectas_singer[2] - 0.7);
        localGroup.add(rectas);
        machineGroupsRef.current.tc_rectas_singer = rectas;

        const planchaVapor = createGenericMachine3D('#38bdf8', 1.0, 1.35, 0.80);
        planchaVapor.position.set(wps.eq_tc_plancha_vapor[0] + 0.7, 0, wps.eq_tc_plancha_vapor[2]);
        localGroup.add(planchaVapor);
        machineGroupsRef.current.tc_plancha_vapor = planchaVapor;
      }

      if (negId === 'taller_publi_imperia') {
        const planchaTazas = createGenericMachine3D('#06b6d4', 0.85, 1.15, 0.75);
        planchaTazas.position.set(wps.eq_pi_plancha_tazas[0], 0, wps.eq_pi_plancha_tazas[2] - 0.7);
        localGroup.add(planchaTazas);
        machineGroupsRef.current.pi_plancha_tazas = planchaTazas;

        const planchaPlana = createGenericMachine3D('#0891b2', 1.1, 1.2, 0.85);
        planchaPlana.position.set(wps.eq_pi_plancha_plana[0], 0, wps.eq_pi_plancha_plana[2] - 0.7);
        localGroup.add(planchaPlana);
        machineGroupsRef.current.pi_plancha_plana = planchaPlana;

        const laserCnc = createGenericMachine3D('#22d3ee', 1.25, 1.05, 0.95);
        laserCnc.position.set(wps.eq_pi_atomstack[0], 0, wps.eq_pi_atomstack[2] - 0.7);
        localGroup.add(laserCnc);
        machineGroupsRef.current.pi_atomstack = laserCnc;
      }

      // Crear el Empleado 3D del negocio
      const empMesh = createHumanoidActorMesh(zone.colorHex, true);
      empMesh.position.set(cx, 0, cz - 0.7);
      scene.add(empMesh);
      actorGroupsRef.current.employees[negId] = empMesh;
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
        const targetNegId = NEGOCIOS_ZONES_3D[negFocus] ? negFocus : 'hawaiian_paradise';
        const zone = NEGOCIOS_ZONES_3D[targetNegId];
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

      // Actualizar estados visuales de las máquinas (halos luminosos, palanca de raspadora y nieve)
      Object.keys(machineGroupsRef.current).forEach((eqKey) => {
        const meshGroup = machineGroupsRef.current[eqKey];
        const eqRuntime = freshGame.equiposRuntime[eqKey];
        if (!meshGroup || !eqRuntime) return;

        let isWorking = eqRuntime.wattsActuales > 0 && eqRuntime.estado === 'WORK';
        if (freshTrain.isTrainingMode) {
          const rec = freshTrain.recetasEntrenadas[freshTrain.selectedProductId];
          const curStep = rec?.pasos?.[freshTrain.activeStepIndex];
          isWorking = curStep?.equipoKey === eqKey && curStep?.estadoEquipo !== 'OFF';
        }

        const ring = meshGroup.getObjectByName('statusRing');
        if (ring) {
          ring.material.opacity = isWorking ? (0.45 + 0.25 * Math.sin(now * 0.008)) : 0.0;
          ring.material.color.set(isWorking ? '#10b981' : '#64748b');
        }

        if (eqKey === 'hp_raspadora') {
          const lever = meshGroup.getObjectByName('shaverLeverPivot');
          const snow = meshGroup.getObjectByName('shaverSnowStream');
          if (lever) {
            lever.rotation.x = isWorking ? (0.35 + 0.08 * Math.sin(now * 0.02)) : 0;
          }
          if (snow) {
            snow.visible = isWorking;
          }
        }
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

      // Actualizar posiciones 3D de Empleados y Clientes
      const activeCustomerIds = new Set();

      NEGOCIOS_ACTIVOS_IDS.forEach((negId) => {
        const zone = NEGOCIOS_ZONES_3D[negId];
        const [cx, , cz] = zone.center;
        const empMesh = actorGroupsRef.current.employees[negId];
        const empData = freshGame.empleadosPorNegocio[negId];

        if (empMesh && empData) {
          let targetLx = empData.posicionLocal[0];
          let targetLz = empData.posicionLocal[2];
          let handItem = empData.itemEnMano;

          // Si está activo el Modo Entrenamiento en este negocio, posicionar al empleado en el waypoint del paso entrenado
          if (freshTrain.isTrainingMode && freshTrain.selectedNegocioId === negId) {
            const rec = freshTrain.recetasEntrenadas[freshTrain.selectedProductId];
            const curStep = rec?.pasos?.[freshTrain.activeStepIndex];
            const wps = WAYPOINTS_POR_NEGOCIO[negId] || {};
            const wpCoord = wps[curStep?.waypointVendedor || 'barra_vendedor'] || [0, 0, -0.6];
            targetLx = wpCoord[0];
            targetLz = wpCoord[2];
            handItem = curStep?.itemManoVendedor || null;
          }

          empMesh.position.x += (cx + targetLx - empMesh.position.x) * 0.22;
          empMesh.position.z += (cz + targetLz - empMesh.position.z) * 0.22;
          empMesh.position.y = Math.abs(Math.sin(now * 0.008)) * 0.04;

          const handGroup = empMesh.getObjectByName('handItemGroup');
          updateHandItemVisual(handGroup, handItem);
        }

        // Clientes en cola y clientes post-compra de este negocio
        const allClients = [
          ...(freshGame.clientesColaPorNegocio[negId] || []),
          ...(freshGame.clientesPostCompraPorNegocio[negId] || [])
        ];

        allClients.forEach((cli) => {
          activeCustomerIds.add(cli.id);
          let cliMesh = actorGroupsRef.current.customers[cli.id];
          if (!cliMesh) {
            cliMesh = createHumanoidActorMesh(cli.colorCamisa || '#38bdf8', false);
            cliMesh.position.set(cx + cli.posicionLocal[0], 0, cz + cli.posicionLocal[2]);
            scene.add(cliMesh);
            actorGroupsRef.current.customers[cli.id] = cliMesh;
          }
          cliMesh.position.x += (cx + cli.posicionLocal[0] - cliMesh.position.x) * 0.22;
          cliMesh.position.z += (cz + cli.posicionLocal[2] - cliMesh.position.z) * 0.22;
          const handGroup = cliMesh.getObjectByName('handItemGroup');
          updateHandItemVisual(handGroup, cli.tieneProductoEnMano ? 'finished_lemon_raspado' : null);
        });
      });

      // Limpiar mallas de clientes que ya salieron del mapa
      Object.keys(actorGroupsRef.current.customers).forEach((cliId) => {
        if (!activeCustomerIds.has(cliId)) {
          scene.remove(actorGroupsRef.current.customers[cliId]);
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

        // Etiquetas de cada local comercial y su empleado activo
        NEGOCIOS_ACTIVOS_IDS.forEach((negId) => {
          const zone = NEGOCIOS_ZONES_3D[negId];
          const [cx, , cz] = zone.center;
          const empData = freshGame.empleadosPorNegocio[negId];
          const empMesh = actorGroupsRef.current.employees[negId];

          if (empMesh && empData) {
            const screenPos = projectToScreen(new THREE.Vector3(empMesh.position.x, 2.05, empMesh.position.z));
            if (screenPos) {
              let texto = empData.textoAccion;
              let subProgress = null;
              if (freshTrain.isTrainingMode && freshTrain.selectedNegocioId === negId) {
                const rec = freshTrain.recetasEntrenadas[freshTrain.selectedProductId];
                const step = rec?.pasos?.[freshTrain.activeStepIndex];
                if (step) {
                  texto = `[Entrenamiento Paso ${step.orden}] ${step.titulo}`;
                  subProgress = Math.min(100, Math.round((freshTrain.stepElapsedSec / Math.max(1, step.duracionSegundos)) * 100));
                }
              } else if (empData.estado === 'ATENDIENDO_CLIENTE' && empData.recetaActual) {
                const step = empData.recetaActual.pasos?.[empData.pasoActualIndex];
                if (step) {
                  subProgress = Math.min(100, Math.round((empData.pasoElapsedSec / Math.max(1, step.duracionSegundos)) * 100));
                }
              }

              nextLabels.push({
                id: `lbl_emp_${negId}`,
                x: screenPos.x,
                y: screenPos.y,
                badge: zone.nombre,
                color: zone.colorHex,
                text: texto,
                progress: subProgress
              });
            }
          }

          // Globo de diálogo del cliente activo en este negocio
          const activeCli = freshGame.clientesColaPorNegocio[negId]?.[0];
          const cliMesh = activeCli ? actorGroupsRef.current.customers[activeCli.id] : null;
          if (activeCli && cliMesh && activeCli.globoTexto) {
            const cliScreen = projectToScreen(new THREE.Vector3(cliMesh.position.x, 1.85, cliMesh.position.z));
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

        // Proyectar popups de pago en caja (+$50 estilo StarCraft SCV)
        const nextCash = [];
        (freshGame.cashPopups || []).forEach((cp) => {
          const zone = NEGOCIOS_ZONES_3D[cp.negocioId];
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

        setOverlayLabels(nextLabels);
        setOverlayCashPopups(nextCash);
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

    NEGOCIOS_ACTIVOS_IDS.forEach((negId) => {
      const zone = NEGOCIOS_ZONES_3D[negId];
      const [cx, , cz] = zone.center;
      const blocks = collisionBlocksByNegocio[negId] || [];

      blocks.forEach((b) => {
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
        for (let lx = -5.2; lx <= 5.2; lx += step) {
          for (let lz = -4.2; lz <= 5.2; lz += step) {
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
      const zone = NEGOCIOS_ZONES_3D[item.negocioId || 'hawaiian_paradise'];
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

  // Mover suavemente la cámara con animación interpolada cuando el usuario selecciona un negocio, vista general o el Medidor CFE
  useEffect(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    const targetId = isTrainingMode ? trainingNegocioId : focusedNegocioId;
    const endPos = new THREE.Vector3();
    const endTarget = new THREE.Vector3();

    if (targetId === 'ALL_CONSORCIO') {
      endPos.set(0, 28, 28);
      endTarget.set(0, 0, 1);
    } else if (targetId === 'CFE_METER_INSPECT') {
      const mIdx = Math.max(0, (parseInt((focusedMedidorId || 'med_3').replace('med_', ''), 10) || 3) - 1);
      const zOff = 1 + (-2.2 + mIdx * 0.88);
      endPos.set(-19.5, 2.2, zOff + 0.8);
      endTarget.set(-22.4, 1.65, zOff);
    } else if (NEGOCIOS_ZONES_3D[targetId]) {
      const zone = NEGOCIOS_ZONES_3D[targetId];
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
      </div>
    </div>
  );
}
