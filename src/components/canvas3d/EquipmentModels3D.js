import * as THREE from 'three';

/**
 * Shared material builders for procedural 3D commercial appliances.
 */
function matStandard(color, roughness = 0.5, metalness = 0.1, extra = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
}

function addPart(parent, geo, mat, pos = [0, 0, 0], rot = [0, 0, 0], name = null) {
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(pos[0], pos[1], pos[2]);
  mesh.rotation.set(rot[0], rot[1], rot[2]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  if (name) mesh.name = name;
  parent.add(mesh);
  return mesh;
}

/**
 * Builds an open 4-leg stainless/industrial worktable instead of an opaque cube,
 * giving appliances an unmistakable silhouette from isometric and close-up views.
 */
function addOpenInoxTable(parent, w = 1.0, d = 0.8, topY = 0.86, frameColor = 0x64748b, topColor = 0xdbeafe, shelfY = 0.24) {
  const legMat = matStandard(frameColor, 0.35, 0.78);
  const topMat = matStandard(topColor, 0.28, 0.82);

  // Tabletop
  addPart(parent, new THREE.BoxGeometry(w, 0.055, d), topMat, [0, topY - 0.027, 0]);
  // Lower undershelf
  addPart(parent, new THREE.BoxGeometry(w - 0.08, 0.03, d - 0.08), legMat, [0, shelfY, 0]);

  // 4 Tubular stainless legs
  const ox = w / 2 - 0.06;
  const oz = d / 2 - 0.06;
  [
    [-ox, -oz],
    [ox, -oz],
    [-ox, oz],
    [ox, oz]
  ].forEach(([lx, lz]) => {
    addPart(parent, new THREE.CylinderGeometry(0.032, 0.028, topY - 0.05, 10), legMat, [lx, (topY - 0.05) / 2, lz]);
  });
}

function attachStatusRing(group, radius = 0.72, y = 0.04) {
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(radius - 0.07, radius, 28),
    new THREE.MeshBasicMaterial({
      color: 0x22c55e,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.0
    })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = y;
  ring.name = 'statusRing';
  group.add(ring);
  return ring;
}

function attachLedIndicator(group, pos = [0.2, 0.5, 0.25], radius = 0.032) {
  const led = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 10, 10),
    new THREE.MeshStandardMaterial({
      color: 0x334155,
      emissive: 0x000000,
      emissiveIntensity: 0,
      roughness: 0.2
    })
  );
  led.position.set(pos[0], pos[1], pos[2]);
  led.name = 'powerLed';
  group.add(led);
  return led;
}

function buildCrepera3D() {
  const g = new THREE.Group();
  const inoxMat = matStandard(0xe2e8f0, 0.25, 0.88);
  const hotPlateMat = matStandard(0x18181b, 0.65, 0.55);

  addOpenInoxTable(g, 1.15, 0.84, 0.86, 0x475569, 0xcbd5e1, 0.24);
  // Stainless cylindrical housing & cast iron griddle
  addPart(g, new THREE.CylinderGeometry(0.38, 0.40, 0.16, 28), inoxMat, [-0.10, 0.94, 0]);
  const plate = addPart(
    g,
    new THREE.CylinderGeometry(0.37, 0.37, 0.05, 32),
    hotPlateMat,
    [-0.10, 1.045, 0],
    [0, 0, 0],
    'crepeHotPlate'
  );
  plate.material = hotPlateMat.clone();

  // Thermostat dial & indicator LED on front panel of crepera
  addPart(g, new THREE.CylinderGeometry(0.055, 0.055, 0.04, 16), matStandard(0x0f172a, 0.4, 0.2), [-0.10, 0.94, 0.40], [Math.PI / 2, 0, 0], 'crepeDial');
  addPart(g, new THREE.BoxGeometry(0.015, 0.04, 0.02), matStandard(0xf59e0b), [-0.10, 0.94, 0.43]);
  attachLedIndicator(g, [0.06, 0.94, 0.39], 0.026);

  // Side props on crepe prep table: stacked ceramic plates & Nutella jar
  for (let p = 0; p < 4; p++) {
    addPart(g, new THREE.CylinderGeometry(0.14, 0.12, 0.02, 18), matStandard(0xf8fafc, 0.2, 0.1), [0.39, 0.875 + p * 0.022, -0.14]);
  }
  addPart(g, new THREE.CylinderGeometry(0.075, 0.075, 0.15, 12), matStandard(0x451a03), [0.40, 0.935, 0.16]);
  addPart(g, new THREE.CylinderGeometry(0.072, 0.072, 0.03, 12), matStandard(0xf8fafc), [0.40, 1.02, 0.16]);

  // Heat glow halo right above plate
  const heatGlow = addPart(
    g,
    new THREE.RingGeometry(0.11, 0.36, 28),
    new THREE.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0, side: THREE.DoubleSide }),
    [-0.10, 1.072, 0],
    [-Math.PI / 2, 0, 0],
    'crepeHeatGlow'
  );
  heatGlow.castShadow = false;

  // Dynamic pouring batter stream
  const pourStream = addPart(
    g,
    new THREE.CylinderGeometry(0.025, 0.045, 0.36, 12),
    matStandard(0xfef3c7, 0.35, 0.0, { transparent: true, opacity: 0.95 }),
    [-0.10, 1.26, 0],
    [0, 0, 0],
    'crepePourStream'
  );
  pourStream.visible = false;

  // Expanding & browning batter disc
  const batterDisc = addPart(
    g,
    new THREE.CylinderGeometry(0.32, 0.33, 0.02, 28),
    matStandard(0xfef3c7, 0.45, 0.0),
    [-0.10, 1.08, 0],
    [0, 0, 0],
    'crepeBatterDisc'
  );
  batterDisc.material = batterDisc.material.clone();
  batterDisc.visible = false;

  // Wooden T-rake pivot on plate center
  const rakePivot = new THREE.Group();
  rakePivot.name = 'crepeRakePivot';
  rakePivot.position.set(-0.10, 1.105, 0);
  const woodMat = matStandard(0xd97706, 0.72, 0.05);
  addPart(rakePivot, new THREE.CylinderGeometry(0.013, 0.013, 0.30, 10), woodMat, [0.15, 0, 0], [0, 0, Math.PI / 2]);
  addPart(rakePivot, new THREE.CylinderGeometry(0.012, 0.012, 0.36, 10), woodMat, [0.22, 0.16, 0], [0, 0, -0.42]);
  rakePivot.visible = false;
  g.add(rakePivot);

  // Gourmet toppings layer (Nutella ribbons, strawberry slices, banana coins)
  const toppingsGroup = new THREE.Group();
  toppingsGroup.name = 'crepeIngredientsLayer';
  toppingsGroup.position.set(-0.10, 1.098, 0);
  const nutellaMat = matStandard(0x451a03, 0.25, 0.1);
  const berryMat = matStandard(0xdc2626, 0.35, 0.05);
  const bananaMat = matStandard(0xfde047, 0.45, 0.0);
  addPart(toppingsGroup, new THREE.BoxGeometry(0.34, 0.015, 0.065), nutellaMat, [0, 0, 0], [0, 0.4, 0]);
  addPart(toppingsGroup, new THREE.BoxGeometry(0.28, 0.015, 0.05), nutellaMat, [0, 0.002, 0.06], [0, -0.35, 0]);
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2 + 0.3;
    addPart(toppingsGroup, new THREE.CylinderGeometry(0.034, 0.034, 0.016, 10), berryMat, [Math.cos(angle) * 0.12, 0.009, Math.sin(angle) * 0.12]);
    addPart(toppingsGroup, new THREE.CylinderGeometry(0.030, 0.030, 0.016, 10), bananaMat, [Math.cos(angle + 0.7) * 0.16, 0.009, Math.sin(angle + 0.7) * 0.16]);
  }
  toppingsGroup.visible = false;
  g.add(toppingsGroup);

  // Folded triangle crepe on white ceramic plate
  const foldedGroup = new THREE.Group();
  foldedGroup.name = 'crepeFoldedMesh';
  foldedGroup.position.set(-0.10, 1.095, 0);
  addPart(foldedGroup, new THREE.CylinderGeometry(0.26, 0.22, 0.022, 24), matStandard(0xf8fafc, 0.2, 0.1), [0, 0, 0]);
  addPart(foldedGroup, new THREE.ConeGeometry(0.19, 0.29, 3), matStandard(0xd99b52, 0.5, 0.05), [0, 0.026, 0], [Math.PI / 2, 0, 0.25]);
  foldedGroup.visible = false;
  g.add(foldedGroup);

  // Rising steam puffs
  const steamGroup = new THREE.Group();
  steamGroup.name = 'crepeSteamGroup';
  steamGroup.position.set(-0.10, 1.14, 0);
  const steamMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc, transparent: true, opacity: 0.45 });
  for (let i = 0; i < 3; i++) {
    const puff = addPart(steamGroup, new THREE.SphereGeometry(0.065 + i * 0.016, 10, 10), steamMat, [(i - 1) * 0.11, i * 0.13, (i % 2 ? 0.06 : -0.06)]);
    puff.castShadow = false;
  }
  steamGroup.visible = false;
  g.add(steamGroup);

  attachStatusRing(g, 0.76);
  return g;
}

function createLabeledPlaneTexture(width, height, drawFn) {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  drawFn(ctx, width, height);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function buildIceShaver3D(colorHex) {
  const g = new THREE.Group();
  const inoxMat = matStandard(0xcbd5e1, 0.30, 0.86);
  const darkInoxMat = matStandard(0x334155, 0.45, 0.75);
  const whiteFrameMat = matStandard(0xf1f5f9, 0.35, 0.12);
  const motorMat = matStandard(0x94a3b8, 0.32, 0.82);
  const cableMat = matStandard(0x18181b, 0.75, 0.1);

  // Mesa de trabajo abierta de 4 patas en acero inoxidable (suficiente espacio bajo la salida derecha)
  addOpenInoxTable(g, 1.42, 0.88, 0.72, 0x64748b, 0xdbeafe, 0.22);

  // Dos patas metálicas tipo trineo en "U" que elevan la raspadora sobre la mesa (y = 0.72 -> 1.00)
  [-0.45, 0.24].forEach((lx) => {
    addPart(g, new THREE.BoxGeometry(0.055, 0.03, 0.44), inoxMat, [lx, 0.735, 0]);
    addPart(g, new THREE.BoxGeometry(0.055, 0.28, 0.045), inoxMat, [lx, 0.86, 0.20]);
    addPart(g, new THREE.BoxGeometry(0.055, 0.28, 0.045), inoxMat, [lx, 0.86, -0.20]);
  });

  // Gabinete horizontal de acero inoxidable (x: -0.56 a +0.44, y: 1.00 a 1.34, z: -0.23 a +0.23)
  // Construido con cámara frontal hueca para ver por la ventana el bloque de hielo y la barra empujadora
  addPart(g, new THREE.BoxGeometry(1.00, 0.05, 0.46), inoxMat, [-0.06, 1.315, 0]); // Techo
  addPart(g, new THREE.BoxGeometry(1.00, 0.045, 0.46), inoxMat, [-0.06, 1.022, 0]); // Piso
  addPart(g, new THREE.BoxGeometry(1.00, 0.25, 0.06), darkInoxMat, [-0.06, 1.17, -0.20]); // Fondo cámara
  addPart(g, new THREE.BoxGeometry(0.06, 0.25, 0.46), inoxMat, [-0.53, 1.17, 0]); // Pared izquierda
  addPart(g, new THREE.BoxGeometry(0.28, 0.25, 0.46), inoxMat, [0.30, 1.17, 0]); // Pared / caja derecha (interruptor y ducto)

  // Cabezal de cuchillas giratorias en el costado derecho de la cámara interior (x = +0.15)
  const bladesDrum = new THREE.Group();
  bladesDrum.name = 'shaverBladesDrum';
  bladesDrum.position.set(0.15, 1.17, 0);
  addPart(bladesDrum, new THREE.CylinderGeometry(0.105, 0.105, 0.03, 16), matStandard(0xe2e8f0, 0.2, 0.92), [0, 0, 0], [0, 0, Math.PI / 2]);
  for (let b = 0; b < 4; b++) {
    const ang = (b * Math.PI) / 2;
    addPart(
      bladesDrum,
      new THREE.BoxGeometry(0.025, 0.19, 0.018),
      matStandard(0xf8fafc, 0.15, 0.95),
      [0, Math.sin(ang) * 0.01, Math.cos(ang) * 0.01],
      [ang, 0, 0]
    );
  }
  g.add(bladesDrum);

  // Barra dentada empujadora interna + placa compresora (se desplaza de izquierda a derecha)
  const pusherGroup = new THREE.Group();
  pusherGroup.name = 'shaverPusherGroup';
  pusherGroup.position.set(-0.28, 1.16, 0);
  addPart(pusherGroup, new THREE.BoxGeometry(0.03, 0.18, 0.25), matStandard(0xe2e8f0, 0.25, 0.9), [0, 0, 0]); // Placa empuje
  addPart(pusherGroup, new THREE.BoxGeometry(0.56, 0.036, 0.036), matStandard(0x94a3b8, 0.35, 0.85), [-0.28, 0, 0]); // Vástago horizontal
  g.add(pusherGroup);

  // Bloque de hielo interior (anclado contra las cuchillas en x = +0.135; se encoge con cada raspado de 10 -> 0)
  const iceMat = matStandard(colorHex ? 0xbaf2ff : 0xe0f2fe, 0.10, 0.12, {
    transparent: true,
    opacity: 0.92,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.22
  });
  const iceBlock = addPart(g, new THREE.BoxGeometry(1.0, 0.19, 0.24), iceMat, [-0.06, 1.14, 0], [0, 0, 0], 'shaverIceBlock');
  iceBlock.scale.set(0.39, 1, 1);

  // Compuerta frontal central abatible con marco blanco biselado, manija superior y ventana con logo
  const doorPivot = new THREE.Group();
  doorPivot.name = 'shaverDoorPivot';
  doorPivot.position.set(-0.17, 1.03, 0.235);
  // Marco blanco (superior, inferior, izquierdo, derecho)
  addPart(doorPivot, new THREE.BoxGeometry(0.62, 0.042, 0.035), whiteFrameMat, [0, 0.228, 0.012]);
  addPart(doorPivot, new THREE.BoxGeometry(0.62, 0.042, 0.035), whiteFrameMat, [0, 0.021, 0.012]);
  addPart(doorPivot, new THREE.BoxGeometry(0.048, 0.25, 0.035), whiteFrameMat, [-0.286, 0.124, 0.012]);
  addPart(doorPivot, new THREE.BoxGeometry(0.048, 0.25, 0.035), whiteFrameMat, [0.286, 0.124, 0.012]);
  // Manija superior y bisagras inferiores
  addPart(doorPivot, new THREE.BoxGeometry(0.11, 0.018, 0.025), darkInoxMat, [0, 0.228, 0.038]);
  addPart(doorPivot, new THREE.CylinderGeometry(0.01, 0.01, 0.04, 8), darkInoxMat, [-0.18, 0.002, 0.02], [0, 0, Math.PI / 2]);
  addPart(doorPivot, new THREE.CylinderGeometry(0.01, 0.01, 0.04, 8), darkInoxMat, [0.18, 0.002, 0.02], [0, 0, Math.PI / 2]);

  // Cristal frontal transparente con leyenda HAWAIIAN PARADISE / DURANGO MEXICO
  const doorTex = createLabeledPlaneTexture(256, 96, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(186, 230, 253, 0.18)';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.72)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(46, 28);
    ctx.lineTo(w - 46, 28);
    ctx.lineTo(w - 64, h - 28);
    ctx.lineTo(64, h - 28);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = 'rgba(248, 250, 252, 0.92)';
    ctx.textAlign = 'center';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('HAWAIIAN', w / 2, 46);
    ctx.fillText('PARADISE', w / 2, 66);
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('DURANGO            MEXICO', w / 2, 82);
  });
  const glassMat = doorTex
    ? new THREE.MeshStandardMaterial({ map: doorTex, transparent: true, roughness: 0.12, metalness: 0.1 })
    : matStandard(0xbae6fd, 0.1, 0.1, { transparent: true, opacity: 0.25 });
  addPart(doorPivot, new THREE.PlaneGeometry(0.525, 0.168), glassMat, [0, 0.124, 0.022]);
  g.add(doorPivot);

  // LADO IZQUIERDO: Manivela giratoria que empuja la barra interna contra las cuchillas
  const crankPivot = new THREE.Group();
  crankPivot.name = 'shaverCrankPivot';
  crankPivot.position.set(-0.56, 1.17, 0.04);
  addPart(crankPivot, new THREE.CylinderGeometry(0.02, 0.02, 0.08, 10), inoxMat, [-0.03, 0, 0], [0, 0, Math.PI / 2]);
  addPart(crankPivot, new THREE.BoxGeometry(0.022, 0.24, 0.032), inoxMat, [-0.065, -0.10, 0.03], [0.22, 0, 0]);
  addPart(crankPivot, new THREE.CylinderGeometry(0.018, 0.018, 0.13, 10), matStandard(0xe2e8f0, 0.2, 0.9), [-0.13, -0.20, 0.05], [0, 0, Math.PI / 2]);
  g.add(crankPivot);

  // CUBIERTA SUPERIOR CENTRO: Volante auxiliar de ajuste con poste y cable enrollado
  addPart(g, new THREE.CylinderGeometry(0.06, 0.075, 0.03, 14), darkInoxMat, [-0.14, 1.355, -0.02]);
  addPart(g, new THREE.CylinderGeometry(0.018, 0.018, 0.14, 10), darkInoxMat, [-0.14, 1.43, -0.02]);
  addPart(g, new THREE.TorusGeometry(0.095, 0.018, 8, 18), motorMat, [-0.14, 1.50, -0.02], [Math.PI / 2, 0, 0]);
  addPart(g, new THREE.TorusGeometry(0.10, 0.018, 8, 16), cableMat, [-0.16, 1.36, 0.06], [Math.PI / 2, 0, 0]);

  // LADO DERECHO SUPERIOR: Motor eléctrico de inducción 600W + capacitor + placa amarilla + cable
  addPart(g, new THREE.BoxGeometry(0.30, 0.03, 0.24), darkInoxMat, [0.26, 1.355, -0.02]);
  const motorBarrel = addPart(g, new THREE.CylinderGeometry(0.135, 0.135, 0.28, 18), motorMat, [0.26, 1.49, -0.02], [0, 0, Math.PI / 2]);
  motorBarrel.name = 'shaverMotorBarrel';
  addPart(g, new THREE.BoxGeometry(0.14, 0.06, 0.09), motorMat, [0.26, 1.635, -0.02]); // Capacitor superior
  addPart(g, new THREE.BoxGeometry(0.12, 0.07, 0.01), matStandard(0xfacc15, 0.4, 0.1), [0.26, 1.50, 0.116]); // Placa amarilla
  // Cable hacia la caja del interruptor derecho
  addPart(g, new THREE.CylinderGeometry(0.014, 0.014, 0.26, 8), cableMat, [0.24, 1.34, 0.20], [0.45, 0, -0.25]);

  // EXTREMO DERECHO: Guarda vertical de acero inoxidable para banda y polea
  addPart(g, new THREE.BoxGeometry(0.13, 0.68, 0.24), inoxMat, [0.495, 1.32, -0.02]);

  // LADO DERECHO FRONTAL: Botón de Encendido y Apagado + Letrero PELIGRO + Hueco inferior de salida
  addPart(g, new THREE.BoxGeometry(0.14, 0.14, 0.07), whiteFrameMat, [0.30, 1.18, 0.26]); // Caja interruptor
  addPart(g, new THREE.BoxGeometry(0.042, 0.07, 0.025), matStandard(0x22c55e, 0.4, 0.1), [0.275, 1.18, 0.295], [0, 0, 0], 'shaverBtnOn');
  addPart(g, new THREE.BoxGeometry(0.042, 0.07, 0.025), matStandard(0xef4444, 0.4, 0.1), [0.325, 1.18, 0.295], [0, 0, 0], 'shaverBtnOff');
  attachLedIndicator(g, [0.30, 1.265, 0.285], 0.02);

  // Ducto vertical derecho debajo del botón con letrero "PELIGRO NO" y boquilla inferior de salida de hielo
  addPart(g, new THREE.BoxGeometry(0.13, 0.18, 0.13), inoxMat, [0.30, 0.99, 0.25]);
  const signTex = createLabeledPlaneTexture(128, 160, (ctx, w, h) => {
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, w - 6, h - 6);
    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PELIGRO', w / 2, 30);
    ctx.beginPath();
    ctx.arc(w / 2, 74, 28, 0, Math.PI * 2);
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 7;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(w / 2 - 20, 54);
    ctx.lineTo(w / 2 + 20, 94);
    ctx.stroke();
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('NO', w / 2, 136);
  });
  addPart(
    g,
    new THREE.PlaneGeometry(0.11, 0.145),
    signTex ? new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.4 }) : matStandard(0xdc2626),
    [0.30, 0.99, 0.318]
  );
  // Hueco inferior por donde cae el hielo triturado
  addPart(g, new THREE.CylinderGeometry(0.048, 0.048, 0.025, 14), darkInoxMat, [0.30, 0.895, 0.25], [0, 0, 0], 'shaverExitHole');

  // ABAJO DEL HUECO DERECHO: Chorro de hielo triturado y vaso receptor con nieve progresiva (0% -> 100%)
  const snowStream = addPart(
    g,
    new THREE.CylinderGeometry(0.022, 0.046, 0.16, 12),
    new THREE.MeshBasicMaterial({ color: 0xf8fafc, transparent: true, opacity: 0.92 }),
    [0.30, 0.82, 0.25],
    [0, 0, 0],
    'shaverSnowStream'
  );
  snowStream.visible = false;

  const cupGroup = new THREE.Group();
  cupGroup.name = 'shaverCupUnder';
  cupGroup.position.set(0.30, 0.72, 0.25);
  addPart(
    cupGroup,
    new THREE.CylinderGeometry(0.068, 0.048, 0.145, 14),
    matStandard(0xe0f2fe, 0.15, 0.05, { transparent: true, opacity: 0.72 }),
    [0, 0.0725, 0]
  );
  const snowFill = new THREE.Group();
  snowFill.name = 'shaverSnowFill';
  addPart(snowFill, new THREE.CylinderGeometry(0.062, 0.045, 0.135, 14), matStandard(0xffffff, 0.95, 0.0), [0, 0.068, 0]);
  addPart(snowFill, new THREE.SphereGeometry(0.062, 12, 10), matStandard(0xffffff, 0.95, 0.0), [0, 0.135, 0]);
  snowFill.scale.set(1, 0.04, 1);
  cupGroup.add(snowFill);
  cupGroup.visible = false;
  g.add(cupGroup);

  attachStatusRing(g, 0.78);
  return g;
}

function buildMarquesitera3D() {
  const g = new THREE.Group();
  addOpenInoxTable(g, 0.95, 0.80, 0.86, 0x475569, 0xdbeafe, 0.24);
  addPart(g, new THREE.BoxGeometry(0.66, 0.14, 0.58), matStandard(0xcbd5e1, 0.28, 0.85), [0, 0.93, 0]);
  addPart(g, new THREE.CylinderGeometry(0.26, 0.26, 0.035, 18), matStandard(0x27272a, 0.55, 0.5), [0, 1.01, 0.03]);

  // Hinged waffle iron upper press lid with arched handle
  const lidPivot = new THREE.Group();
  lidPivot.name = 'marqUpperLidPivot';
  lidPivot.position.set(0, 1.02, -0.25);
  addPart(lidPivot, new THREE.CylinderGeometry(0.26, 0.26, 0.045, 18), matStandard(0x18181b, 0.45, 0.6), [0, 0.022, 0.28]);
  addPart(lidPivot, new THREE.BoxGeometry(0.07, 0.04, 0.24), matStandard(0x0f172a), [0, 0.05, 0.58]);
  g.add(lidPivot);

  const roll = addPart(g, new THREE.CylinderGeometry(0.048, 0.048, 0.30, 12), matStandard(0xf59e0b, 0.5, 0.05), [0, 1.05, 0.04], [0, 0, Math.PI / 2], 'marqRollMesh');
  roll.visible = false;

  attachLedIndicator(g, [0.24, 0.93, 0.30], 0.024);
  attachStatusRing(g, 0.72);
  return g;
}

function buildBlenderNinja3D() {
  const g = new THREE.Group();
  addOpenInoxTable(g, 0.84, 0.78, 0.86, 0x475569, 0xdbeafe, 0.24);
  // Ninja motor base + glowing blue touchscreen strip
  addPart(g, new THREE.BoxGeometry(0.32, 0.26, 0.32), matStandard(0x0f172a, 0.32, 0.45), [0, 0.99, 0]);
  addPart(g, new THREE.BoxGeometry(0.24, 0.08, 0.02), matStandard(0x0284c7, 0.2, 0.2, { emissive: 0x0369a1, emissiveIntensity: 0.45 }), [0, 0.98, 0.17]);
  // Tapered graduated crystal pitcher + black lid & red handle
  addPart(g, new THREE.CylinderGeometry(0.16, 0.11, 0.44, 16), matStandard(0xe0f2fe, 0.1, 0.05, { transparent: true, opacity: 0.54 }), [0, 1.34, 0]);
  addPart(g, new THREE.BoxGeometry(0.045, 0.28, 0.06), matStandard(0xdc2626, 0.4, 0.1), [0.16, 1.32, 0]);
  addPart(g, new THREE.CylinderGeometry(0.165, 0.165, 0.05, 16), matStandard(0x0f172a, 0.4, 0.2), [0, 1.58, 0]);

  const vortex = addPart(
    g,
    new THREE.ConeGeometry(0.12, 0.30, 12),
    matStandard(0xf43f5e, 0.25, 0.05),
    [0, 1.28, 0],
    [Math.PI, 0, 0],
    'blenderVortexMesh'
  );
  vortex.visible = false;

  attachLedIndicator(g, [0.12, 1.06, 0.17], 0.022);
  attachStatusRing(g, 0.68);
  return g;
}

function buildEspressoGaggia3D() {
  const g = new THREE.Group();
  const cherryRed = matStandard(0xdc2626, 0.26, 0.45);
  const chrome = matStandard(0xf1f5f9, 0.16, 0.92);
  const darkMetal = matStandard(0x1e293b, 0.45, 0.5);

  addOpenInoxTable(g, 1.12, 0.86, 0.86, 0x475569, 0xdbeafe, 0.24);
  // 2-group Gaggia chassis & chrome drip tray
  addPart(g, new THREE.BoxGeometry(0.84, 0.52, 0.54), cherryRed, [0, 1.12, -0.05]);
  addPart(g, new THREE.BoxGeometry(0.84, 0.08, 0.26), chrome, [0, 0.90, 0.28]);
  // Top rail warmer & stacked espresso demitasse cups + hopper
  addPart(g, new THREE.BoxGeometry(0.80, 0.025, 0.48), chrome, [0, 1.39, -0.05]);
  for (let i = -2; i <= 2; i++) {
    addPart(g, new THREE.CylinderGeometry(0.048, 0.036, 0.08, 12), matStandard(0xf8fafc), [i * 0.13, 1.44, -0.10]);
  }
  // Dual group heads & protruding portafilters
  const pfGroup = new THREE.Group();
  pfGroup.name = 'portafilterGroup';
  for (const x of [-0.18, 0.18]) {
    addPart(g, new THREE.CylinderGeometry(0.078, 0.078, 0.08, 16), chrome, [x, 1.24, 0.24]);
    addPart(pfGroup, new THREE.CylinderGeometry(0.062, 0.056, 0.055, 14), chrome, [x, 1.18, 0.24]);
    addPart(pfGroup, new THREE.CylinderGeometry(0.017, 0.02, 0.22, 10), darkMetal, [x, 1.18, 0.39], [Math.PI / 2, 0, 0]);
  }
  g.add(pfGroup);

  const streams = new THREE.Group();
  streams.name = 'espressoStreams';
  for (const x of [-0.18, 0.18]) {
    addPart(streams, new THREE.CylinderGeometry(0.009, 0.009, 0.20, 8), matStandard(0x451a03), [x, 1.04, 0.24]);
    addPart(streams, new THREE.CylinderGeometry(0.05, 0.04, 0.09, 12), matStandard(0xf8fafc), [x, 0.99, 0.24]);
  }
  streams.visible = false;
  g.add(streams);

  // Steam wand + frothing milk pitcher
  addPart(g, new THREE.CylinderGeometry(0.010, 0.010, 0.24, 8), chrome, [0.36, 1.15, 0.26], [0.25, 0, -0.18]);
  const pitcher = addPart(
    g,
    new THREE.CylinderGeometry(0.065, 0.075, 0.14, 14),
    chrome,
    [0.36, 1.02, 0.29],
    [0, 0, 0],
    'milkPitcherGroup'
  );
  pitcher.visible = false;

  const steam = addPart(
    g,
    new THREE.SphereGeometry(0.10, 10, 10),
    new THREE.MeshBasicMaterial({ color: 0xf8fafc, transparent: true, opacity: 0.45 }),
    [0.36, 1.16, 0.30],
    [0, 0, 0],
    'espressoSteamCloud'
  );
  steam.visible = false;

  attachLedIndicator(g, [0, 1.32, 0.24], 0.026);
  attachStatusRing(g, 0.80);
  return g;
}

function buildKettleOrChafing3D(eqKey) {
  const g = new THREE.Group();
  const inox = matStandard(0xd1d5db, 0.22, 0.88);
  addOpenInoxTable(g, 0.84, 0.72, 0.84, 0x475569, 0xdbeafe, 0.22);
  if (eqKey === 'hp_tetera') {
    addPart(g, new THREE.CylinderGeometry(0.15, 0.17, 0.32, 16), inox, [0, 1.01, 0]);
    addPart(g, new THREE.BoxGeometry(0.035, 0.18, 0.045), matStandard(0x0f172a), [-0.16, 1.02, 0]);
  } else {
    addPart(g, new THREE.BoxGeometry(0.74, 0.24, 0.56), inox, [0, 0.96, 0]);
    addPart(g, new THREE.BoxGeometry(0.30, 0.05, 0.44), matStandard(0xfacc15), [-0.17, 1.09, 0]);
    addPart(g, new THREE.BoxGeometry(0.30, 0.05, 0.44), matStandard(0xfacc15), [0.17, 1.09, 0]);
  }
  attachLedIndicator(g, [0.22, 0.90, 0.32], 0.024);
  attachStatusRing(g, 0.65);
  return g;
}

function buildColdAppliance3D(eqKey) {
  const g = new THREE.Group();
  const whiteCoat = matStandard(0xf1f5f9, 0.32, 0.18);
  const glass = matStandard(0xbae6fd, 0.08, 0.1, { transparent: true, opacity: 0.42 });

  if (eqKey === 'hp_congelador') {
    addPart(g, new THREE.BoxGeometry(1.55, 0.88, 0.94), whiteCoat, [0, 0.46, 0]);
    addPart(g, new THREE.BoxGeometry(1.55, 0.10, 0.96), matStandard(0x0284c7), [0, 0.90, 0]);
    addPart(g, new THREE.BoxGeometry(1.42, 0.04, 0.84), glass, [0, 0.96, 0]);
    const iceMat = matStandard(0x7dd3fc, 0.15, 0.05);
    for (let i = -2; i <= 2; i++) {
      addPart(g, new THREE.BoxGeometry(0.22, 0.24, 0.36), iceMat, [i * 0.26, 0.72, 0]);
    }
    attachLedIndicator(g, [0.65, 0.78, 0.49], 0.026);
    attachStatusRing(g, 0.96);
  } else {
    addPart(g, new THREE.BoxGeometry(1.08, 2.15, 0.90), whiteCoat, [0, 1.075, 0]);
    addPart(g, new THREE.BoxGeometry(0.90, 1.54, 0.04), glass, [0, 1.18, 0.46]);
    addPart(g, new THREE.BoxGeometry(0.94, 0.24, 0.05), matStandard(0x0ea5e9, 0.25, 0.1, { emissive: 0x0284c7, emissiveIntensity: 0.55 }), [0, 2.02, 0.46]);
    for (let s = 0; s < 3; s++) {
      addPart(g, new THREE.BoxGeometry(0.84, 0.025, 0.65), matStandard(0x94a3b8), [0, 0.72 + s * 0.40, 0]);
      addPart(g, new THREE.CylinderGeometry(0.075, 0.075, 0.24, 10), matStandard(0xfef3c7), [-0.20, 0.85 + s * 0.40, 0.14]);
      addPart(g, new THREE.CylinderGeometry(0.055, 0.055, 0.26, 10), matStandard(0xdc2626), [0.16, 0.86 + s * 0.40, 0.14]);
    }
    attachLedIndicator(g, [0.42, 0.35, 0.46], 0.026);
    attachStatusRing(g, 0.86);
  }
  return g;
}

function buildTPVTerminal3D(eqKey) {
  const g = new THREE.Group();
  const darkSlate = matStandard(0x0f172a, 0.35, 0.4);
  const screenMat = matStandard(0x38bdf8, 0.2, 0.1, { emissive: 0x0284c7, emissiveIntensity: 0.5 });

  // Cash drawer sitting flush on counter (y = 0)
  addPart(g, new THREE.BoxGeometry(0.46, 0.10, 0.42), darkSlate, [0, 0.05, 0], [0, 0, 0], 'posCashDrawer');
  // AIO Touch Monitor stand & glowing screen
  addPart(g, new THREE.BoxGeometry(0.12, 0.18, 0.10), matStandard(0x475569, 0.3, 0.6), [0, 0.19, -0.05]);
  addPart(g, new THREE.BoxGeometry(0.38, 0.26, 0.03), darkSlate, [0, 0.35, -0.02], [-0.28, 0, 0]);
  addPart(g, new THREE.BoxGeometry(0.34, 0.22, 0.012), screenMat, [0, 0.35, 0.0], [-0.28, 0, 0], 'posScreen');
  // Thermal ticket printer
  addPart(g, new THREE.BoxGeometry(0.15, 0.13, 0.17), matStandard(0x334155), [0.29, 0.065, 0.06]);
  addPart(g, new THREE.BoxGeometry(0.07, 0.09, 0.01), matStandard(0xf8fafc), [0.29, 0.16, 0.06], [-0.2, 0, 0], 'posTicket');

  if (eqKey === 'imp_terminal') {
    addPart(g, new THREE.BoxGeometry(0.14, 0.05, 0.22), matStandard(0x2563eb), [-0.28, 0.03, 0.12]);
  }
  attachLedIndicator(g, [-0.18, 0.08, 0.22], 0.018);
  attachStatusRing(g, 0.46, 0.015);
  return g;
}

function buildXeroxDocuColor3D() {
  const g = new THREE.Group();
  const bodyWhite = matStandard(0xf1f5f9, 0.36, 0.22);
  const cobaltBlue = matStandard(0x1d4ed8, 0.38, 0.25);
  const darkAccent = matStandard(0x1e293b, 0.45, 0.35);

  // Main multifunction paper-tray chassis
  addPart(g, new THREE.BoxGeometry(1.18, 0.98, 0.84), bodyWhite, [0, 0.49, 0]);
  // Stepped high-capacity paper feeder on right + cobalt drawer handles
  addPart(g, new THREE.BoxGeometry(0.46, 0.78, 0.76), bodyWhite, [0.80, 0.39, 0]);
  for (let d = 0; d < 3; d++) {
    addPart(g, new THREE.BoxGeometry(0.92, 0.20, 0.03), cobaltBlue, [-0.04, 0.20 + d * 0.24, 0.43]);
  }
  // Flatbed scanner glass & raised ADF cover
  addPart(g, new THREE.BoxGeometry(0.94, 0.04, 0.66), matStandard(0x94a3b8, 0.1, 0.25), [0.02, 1.00, 0]);
  addPart(g, new THREE.BoxGeometry(0.84, 0.18, 0.58), darkAccent, [0.02, 1.14, -0.02]);
  // Raised touchscreen GUI controller pole
  addPart(g, new THREE.CylinderGeometry(0.022, 0.022, 0.36, 8), matStandard(0x94a3b8), [0.50, 1.18, 0.28]);
  addPart(g, new THREE.BoxGeometry(0.28, 0.20, 0.03), matStandard(0x38bdf8, 0.2, 0.1, { emissive: 0x0284c7, emissiveIntensity: 0.45 }), [0.50, 1.38, 0.30], [-0.45, 0.2, 0]);

  const scanBar = addPart(
    g,
    new THREE.BoxGeometry(0.045, 0.025, 0.60),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8 }),
    [-0.3, 1.03, 0],
    [0, 0, 0],
    'scannerLightBar'
  );
  scanBar.visible = false;

  // Left angled finisher catch tray + printed pages
  addPart(g, new THREE.BoxGeometry(0.42, 0.04, 0.48), darkAccent, [-0.78, 0.78, 0], [0, 0, 0.18]);
  const sheets = addPart(g, new THREE.BoxGeometry(0.30, 0.04, 0.36), matStandard(0xf8fafc), [-0.78, 0.82, 0], [0, 0, 0.18], 'printedSheetsStack');
  sheets.visible = false;

  attachLedIndicator(g, [0.46, 0.92, 0.43], 0.026);
  attachStatusRing(g, 0.96);
  return g;
}

function buildBordadoraMultiHead3D(eqKey) {
  const g = new THREE.Group();
  const frameWhite = matStandard(0xf1f5f9, 0.32, 0.35);
  const frameAccent = matStandard(eqKey === 'bv_aemco_220' ? 0x2563eb : 0xe11d48, 0.35, 0.3);
  const darkMetal = matStandard(0x334155, 0.4, 0.65);

  // Open tubular heavy stand legs + table bed
  addOpenInoxTable(g, 2.10, 1.05, 0.78, 0x334155, 0xe2e8f0, 0.20);

  // Moving pantograph & circular embroidery hoops
  const panto = new THREE.Group();
  panto.name = 'pantographFrame';
  panto.position.set(0, 0.81, 0.08);
  addPart(panto, new THREE.BoxGeometry(1.90, 0.035, 0.10), darkMetal, [0, 0, -0.24]);
  const hoopXs = eqKey === 'bv_aemco_220' ? [-0.69, -0.23, 0.23, 0.69] : [-0.42, 0.42];
  hoopXs.forEach((hx) => {
    addPart(panto, new THREE.TorusGeometry(0.145, 0.018, 8, 20), matStandard(0x16a34a), [hx, 0, 0.08], [Math.PI / 2, 0, 0]);
    addPart(panto, new THREE.CylinderGeometry(0.14, 0.14, 0.01, 16), matStandard(0xf8fafc), [hx, -0.004, 0.08]);
  });
  g.add(panto);

  // Side uprights lifting the upper multi-head gantry clearly above the bed
  addPart(g, new THREE.BoxGeometry(0.14, 0.56, 0.36), frameAccent, [-0.94, 1.06, -0.10]);
  addPart(g, new THREE.BoxGeometry(0.14, 0.56, 0.36), frameAccent, [0.94, 1.06, -0.10]);
  addPart(g, new THREE.BoxGeometry(2.02, 0.34, 0.32), frameAccent, [0, 1.24, -0.10]);

  const needles = new THREE.Group();
  needles.name = 'embroideryNeedlesGroup';
  const threadColors = [0xef4444, 0xfacc15, 0x22c55e, 0x38bdf8, 0xc084fc, 0xffffff];
  hoopXs.forEach((hx, idx) => {
    addPart(needles, new THREE.BoxGeometry(0.18, 0.26, 0.16), frameWhite, [hx, 1.08, 0.12]);
    addPart(needles, new THREE.CylinderGeometry(0.01, 0.004, 0.16, 8), matStandard(0xcbd5e1, 0.1, 0.9), [hx, 0.91, 0.16]);
    // Overhead colorful spool cones on high bridge rack
    addPart(g, new THREE.BoxGeometry(0.24, 0.025, 0.14), darkMetal, [hx, 1.43, -0.14]);
    for (let c = 0; c < 4; c++) {
      addPart(
        g,
        new THREE.CylinderGeometry(0.022, 0.036, 0.14, 10),
        matStandard(threadColors[(idx * 3 + c) % threadColors.length], 0.45, 0.05),
        [hx - 0.075 + c * 0.05, 1.52, -0.14]
      );
    }
  });
  g.add(needles);

  // Dahao LCD control panel sticking out on right corner
  addPart(g, new THREE.BoxGeometry(0.28, 0.22, 0.04), matStandard(0x0ea5e9, 0.2, 0.1, { emissive: 0x0284c7, emissiveIntensity: 0.45 }), [0.95, 1.18, 0.28], [-0.2, -0.35, 0]);
  attachLedIndicator(g, [0.94, 1.02, 0.30], 0.028);
  attachStatusRing(g, 1.15);
  return g;
}

function buildTextileMachine3D(eqKey) {
  const g = new THREE.Group();

  if (eqKey === 'tc_cortadora') {
    addOpenInoxTable(g, 1.75, 1.15, 0.86, 0x475569, 0xf8fafc, 0.22);
    // Draped blue gabardine fabric roll & spread layers
    addPart(g, new THREE.CylinderGeometry(0.11, 0.11, 1.0, 12), matStandard(0x1d4ed8), [-0.66, 0.98, 0], [Math.PI / 2, 0, 0]);
    addPart(g, new THREE.BoxGeometry(1.18, 0.03, 0.84), matStandard(0x2563eb), [0.06, 0.89, 0]);
    const carriage = new THREE.Group();
    carriage.name = 'cutterDiscCarriage';
    carriage.position.set(0, 1.03, 0);
    addPart(carriage, new THREE.CylinderGeometry(0.075, 0.075, 0.26, 12), matStandard(0xdc2626), [0, 0.05, 0]);
    addPart(carriage, new THREE.CylinderGeometry(0.085, 0.085, 0.015, 16), matStandard(0xe2e8f0, 0.15, 0.9), [0, -0.06, 0.09], [0, 0, Math.PI / 2]);
    g.add(carriage);
    attachLedIndicator(g, [0.76, 0.86, 0.56], 0.026);
    attachStatusRing(g, 1.04);
    return g;
  }

  if (eqKey === 'tc_plancha_vapor') {
    addOpenInoxTable(g, 1.38, 0.64, 0.86, 0x475569, 0x38bdf8, 0.22);
    // Vertical pressurized boiler tank beside ironing board
    addPart(g, new THREE.CylinderGeometry(0.19, 0.19, 0.50, 16), matStandard(0xe2e8f0, 0.22, 0.88), [-0.56, 1.08, 0]);
    addPart(g, new THREE.CylinderGeometry(0.05, 0.05, 0.04, 12), matStandard(0xfacc15), [-0.56, 1.35, 0.10]);
    const iron = addPart(g, new THREE.ConeGeometry(0.115, 0.28, 4), matStandard(0x0f172a), [0.16, 0.94, 0], [Math.PI / 2, 0, 0.4], 'steamIronMesh');
    iron.castShadow = true;
    const steam = addPart(g, new THREE.SphereGeometry(0.13, 10, 10), new THREE.MeshBasicMaterial({ color: 0xf8fafc, transparent: true, opacity: 0.45 }), [0.16, 1.08, 0], [0, 0, 0], 'boilerSteamCloud');
    steam.visible = false;
    attachLedIndicator(g, [-0.56, 1.24, 0.18], 0.026);
    attachStatusRing(g, 0.88);
    return g;
  }

  // Open 4-leg Singer sewing / Overlock table + gooseneck head + tall overhead spool tree
  addOpenInoxTable(g, 1.15, 0.68, 0.84, 0x475569, 0xf8fafc, 0.22);
  const machineColor = eqKey === 'tc_overlock_5h' ? 0xf8fafc : (eqKey === 'tc_collaretera_singer' ? 0xe0f2fe : 0xfef3c7);
  addPart(g, new THREE.BoxGeometry(0.52, 0.18, 0.22), matStandard(machineColor, 0.28, 0.25), [0, 1.01, 0]);
  addPart(g, new THREE.BoxGeometry(0.18, 0.24, 0.22), matStandard(machineColor, 0.28, 0.25), [0.18, 0.96, 0]);
  const wheel = addPart(g, new THREE.CylinderGeometry(0.09, 0.09, 0.045, 16), matStandard(0x0f172a), [0.30, 1.01, 0], [0, 0, Math.PI / 2], 'sewingHandwheel');
  wheel.castShadow = true;

  // High spool tree so colored cones stand clearly visible above sewing table
  addPart(g, new THREE.CylinderGeometry(0.015, 0.015, 0.62, 8), matStandard(0x94a3b8, 0.2, 0.8), [-0.36, 1.15, -0.20]);
  const coneCount = eqKey === 'tc_overlock_5h' ? 5 : 3;
  for (let i = 0; i < coneCount; i++) {
    addPart(
      g,
      new THREE.CylinderGeometry(0.025, 0.036, 0.12, 10),
      matStandard([0x3b82f6, 0xef4444, 0x22c55e, 0xf59e0b, 0xffffff][i % 5]),
      [-0.44 + i * 0.065, 1.24, -0.20]
    );
  }
  attachLedIndicator(g, [0.18, 0.90, 0.34], 0.025);
  attachStatusRing(g, 0.74);
  return g;
}

function buildPubliWorkshop3D(eqKey) {
  const g = new THREE.Group();
  const darkMetal = matStandard(0x1e293b, 0.4, 0.45);
  const brightOrange = matStandard(0xf97316, 0.32, 0.32);

  if (eqKey === 'pi_pc_diseno') {
    addOpenInoxTable(g, 1.28, 0.76, 0.84, 0x334155, 0xe7e5e4, 0.22);
    addPart(g, new THREE.BoxGeometry(0.62, 0.38, 0.03), matStandard(0x38bdf8, 0.2, 0.1, { emissive: 0x0369a1, emissiveIntensity: 0.45 }), [-0.08, 1.14, -0.18]);
    addPart(g, new THREE.BoxGeometry(0.24, 0.48, 0.44), darkMetal, [0.46, 1.10, -0.05]);
    attachLedIndicator(g, [0.46, 1.28, 0.18], 0.024);
    attachStatusRing(g, 0.78);
    return g;
  }

  if (eqKey === 'pi_epson') {
    addOpenInoxTable(g, 0.94, 0.72, 0.84, 0x475569, 0xdbeafe, 0.22);
    addPart(g, new THREE.BoxGeometry(0.76, 0.26, 0.50), matStandard(0x0f172a), [0, 0.97, 0]);
    [0x06b6d4, 0xd946ef, 0xfacc15, 0x0f172a].forEach((c, i) => {
      addPart(g, new THREE.BoxGeometry(0.045, 0.14, 0.065), matStandard(c), [0.18 + i * 0.052, 0.95, 0.25]);
    });
    attachLedIndicator(g, [-0.28, 1.03, 0.26], 0.024);
    attachStatusRing(g, 0.68);
    return g;
  }

  if (eqKey === 'pi_plancha_tazas') {
    addOpenInoxTable(g, 0.84, 0.72, 0.84, 0x475569, 0xdbeafe, 0.22);
    addPart(g, new THREE.BoxGeometry(0.40, 0.24, 0.36), brightOrange, [0, 0.96, 0]);
    const clamp = addPart(g, new THREE.CylinderGeometry(0.095, 0.095, 0.20, 14), matStandard(0xdc2626), [0, 1.15, 0.06], [0, 0, Math.PI / 2], 'mugPressClamp');
    addPart(clamp, new THREE.CylinderGeometry(0.072, 0.072, 0.18, 14), matStandard(0xf8fafc), [0, 0, 0], [0, 0, 0], 'sublimatingMug');
    attachLedIndicator(g, [0.12, 0.99, 0.19], 0.025);
    attachStatusRing(g, 0.64);
    return g;
  }

  if (eqKey === 'pi_plancha_plana') {
    addOpenInoxTable(g, 0.96, 0.82, 0.84, 0x475569, 0xdbeafe, 0.22);
    addPart(g, new THREE.BoxGeometry(0.66, 0.09, 0.60), matStandard(0x94a3b8), [0, 0.91, 0.05]);
    const platenPivot = new THREE.Group();
    platenPivot.name = 'flatPressPlatenPivot';
    platenPivot.position.set(0, 0.98, -0.24);
    addPart(platenPivot, new THREE.BoxGeometry(0.64, 0.08, 0.58), brightOrange, [0, 0.05, 0.29]);
    addPart(platenPivot, new THREE.BoxGeometry(0.07, 0.14, 0.38), darkMetal, [0, 0.14, 0.36]);
    g.add(platenPivot);
    attachLedIndicator(g, [0.25, 0.92, 0.36], 0.025);
    attachStatusRing(g, 0.74);
    return g;
  }

  // pi_atomstack open-frame CNC Laser Engraver
  addOpenInoxTable(g, 0.96, 0.84, 0.84, 0x334155, 0xdbeafe, 0.22);
  addPart(g, new THREE.BoxGeometry(0.78, 0.04, 0.78), matStandard(0x0f172a), [0, 0.86, 0]);
  addPart(g, new THREE.BoxGeometry(0.78, 0.06, 0.06), brightOrange, [0, 0.90, -0.36]);
  addPart(g, new THREE.BoxGeometry(0.78, 0.06, 0.06), brightOrange, [0, 0.90, 0.36]);
  const gantry = new THREE.Group();
  gantry.name = 'laserGantryGroup';
  gantry.position.set(0, 0.96, 0);
  addPart(gantry, new THREE.BoxGeometry(0.05, 0.06, 0.78), matStandard(0xe2e8f0), [0, 0, 0]);
  addPart(gantry, new THREE.BoxGeometry(0.11, 0.16, 0.11), matStandard(0x2563eb), [0, 0.03, 0]);
  const beam = addPart(gantry, new THREE.CylinderGeometry(0.01, 0.01, 0.16, 8), new THREE.MeshBasicMaterial({ color: 0x3b82f6 }), [0, -0.06, 0], [0, 0, 0], 'laserBeamMesh');
  beam.visible = false;
  g.add(gantry);
  attachLedIndicator(g, [0.35, 0.90, 0.38], 0.025);
  attachStatusRing(g, 0.74);
  return g;
}

function buildOfficeAppliance3D(eqKey) {
  const g = new THREE.Group();
  if (eqKey === 'oc_tv_32') {
    // Credenza de madera + Smart TV 32" montada
    addPart(g, new THREE.BoxGeometry(1.45, 0.56, 0.44), matStandard(0x3f2e21, 0.55, 0.08), [0, 0.28, 0]);
    addPart(g, new THREE.BoxGeometry(1.18, 0.68, 0.05), matStandard(0x0f172a, 0.25, 0.35), [0, 1.04, -0.08]);
    addPart(
      g,
      new THREE.PlaneGeometry(1.08, 0.58),
      matStandard(0x1e293b, 0.15, 0.05, { emissive: 0x0284c7, emissiveIntensity: 0.08 }),
      [0, 1.04, -0.052],
      [0, 0, 0],
      'tvScreenMesh'
    );
    attachLedIndicator(g, [0.52, 0.72, -0.05], 0.022);
    attachStatusRing(g, 0.72);
    return g;
  }

  // oc_laptop_diseno: Escritorio ejecutivo con Laptop + Monitor Diseño 27"
  addOpenInoxTable(g, 1.48, 0.78, 0.76, 0x334155, 0x1e293b, 0.22);
  addPart(g, new THREE.BoxGeometry(0.46, 0.02, 0.32), matStandard(0x475569, 0.3, 0.7), [-0.18, 0.78, 0.08]);
  addPart(
    g,
    new THREE.BoxGeometry(0.46, 0.30, 0.018),
    matStandard(0x0f172a, 0.25, 0.6),
    [-0.18, 0.92, -0.07],
    [-0.18, 0, 0]
  );
  addPart(
    g,
    new THREE.PlaneGeometry(0.42, 0.25),
    matStandard(0x0ea5e9, 0.15, 0.1, { emissive: 0x0369a1, emissiveIntensity: 0.12 }),
    [-0.18, 0.92, -0.058],
    [-0.18, 0, 0],
    'officeScreenMesh'
  );
  // Monitor secundario de arquitectura/vectores
  addPart(g, new THREE.BoxGeometry(0.68, 0.42, 0.03), matStandard(0x0f172a, 0.25, 0.4), [0.36, 1.06, -0.18]);
  addPart(
    g,
    new THREE.PlaneGeometry(0.62, 0.36),
    matStandard(0x38bdf8, 0.15, 0.1, { emissive: 0x0284c7, emissiveIntensity: 0.12 }),
    [0.36, 1.06, -0.16],
    [0, 0, 0],
    'officeSecondaryScreenMesh'
  );
  attachLedIndicator(g, [0.58, 0.87, -0.14], 0.022);
  attachStatusRing(g, 0.78);
  return g;
}

function buildClimateOrLight3D(eqKey, colorHex) {
  const g = new THREE.Group();
  if (eqKey.includes('ac') || eqKey.includes('cctv')) {
    addPart(g, new THREE.BoxGeometry(1.15, 0.34, 0.30), matStandard(0xf8fafc, 0.35, 0.1), [0, 0, 0]);
    addPart(g, new THREE.BoxGeometry(0.98, 0.05, 0.06), matStandard(0x38bdf8), [0, -0.14, 0.12]);
  } else {
    addPart(g, new THREE.BoxGeometry(0.7, 0.12, 0.7), matStandard(colorHex || 0xfef08a, 0.3, 0.2), [0, 0, 0]);
  }
  attachLedIndicator(g, [0.44, 0, 0.16], 0.022);
  attachStatusRing(g, 0.55, -0.2);
  return g;
}

/**
 * Factory building distinct, recognizable procedural 3D models for every commercial appliance.
 */
export function createApplianceModel3D(eqKey, colorHex) {
  if (eqKey === 'hp_crepera') return buildCrepera3D();
  if (eqKey === 'hp_raspadora') return buildIceShaver3D(colorHex);
  if (eqKey === 'hp_marquesitera') return buildMarquesitera3D();
  if (eqKey === 'hp_licuadora') return buildBlenderNinja3D();
  if (eqKey === 'hp_breville') return buildEspressoGaggia3D();
  if (eqKey === 'hp_tetera' || eqKey === 'hp_bano_maria') return buildKettleOrChafing3D(eqKey);
  if (eqKey === 'hp_congelador' || eqKey === 'hp_refrigerador') return buildColdAppliance3D(eqKey);
  if (eqKey === 'hp_tpv' || eqKey === 'imp_tpv' || eqKey === 'imp_terminal' || eqKey === 'pap_tpv') {
    return buildTPVTerminal3D(eqKey);
  }
  if (eqKey === 'pap_docucolor') return buildXeroxDocuColor3D();
  if (eqKey === 'bv_aemco_220' || eqKey === 'bv_melco_emc') return buildBordadoraMultiHead3D(eqKey);
  if (
    eqKey === 'tc_cortadora' ||
    eqKey === 'tc_overlock_5h' ||
    eqKey === 'tc_rectas_singer' ||
    eqKey === 'tc_collaretera_singer' ||
    eqKey === 'tc_plancha_vapor'
  ) {
    return buildTextileMachine3D(eqKey);
  }
  if (
    eqKey === 'pi_pc_diseno' ||
    eqKey === 'pi_epson' ||
    eqKey === 'pi_plancha_tazas' ||
    eqKey === 'pi_plancha_plana' ||
    eqKey === 'pi_atomstack'
  ) {
    return buildPubliWorkshop3D(eqKey);
  }
  if (eqKey === 'oc_tv_32' || eqKey === 'oc_laptop_diseno') {
    return buildOfficeAppliance3D(eqKey);
  }
  return buildClimateOrLight3D(eqKey, colorHex);
}

/**
 * Updates 60 FPS animations for equipment sub-meshes, status rings, LEDs, and active step effects.
 */
export function updateApplianceVisualState(eqKey, meshGroup, stateInfo, nowSec) {
  if (!meshGroup) return;
  const { isWorking, isPreheat, isActive, stepCodigo, stepProgress = 0, iceBlockRatio = 1 } = stateInfo;

  const ring = meshGroup.getObjectByName('statusRing');
  if (ring?.material) {
    if (isWorking) {
      ring.material.color.setHex(0x22c55e);
      ring.material.opacity = 0.55 + Math.sin(nowSec * 6.0) * 0.25;
    } else if (isPreheat) {
      ring.material.color.setHex(0xf59e0b);
      ring.material.opacity = 0.45 + Math.sin(nowSec * 4.0) * 0.2;
    } else if (isActive) {
      ring.material.color.setHex(0x38bdf8);
      ring.material.opacity = 0.16;
    } else {
      ring.material.opacity = 0.0;
    }
  }

  const led = meshGroup.getObjectByName('powerLed');
  if (led?.material) {
    if (isWorking) {
      led.material.color.setHex(0x22c55e);
      led.material.emissive.setHex(0x16a34a);
      led.material.emissiveIntensity = 1.6;
    } else if (isPreheat) {
      led.material.color.setHex(0xf59e0b);
      led.material.emissive.setHex(0xd97706);
      led.material.emissiveIntensity = 1.2;
    } else if (isActive) {
      led.material.color.setHex(0x38bdf8);
      led.material.emissive.setHex(0x0284c7);
      led.material.emissiveIntensity = 0.6;
    } else {
      led.material.color.setHex(0x334155);
      led.material.emissiveIntensity = 0;
    }
  }

  // 1. Crepera interactive micro-process animations
  if (eqKey === 'hp_crepera') {
    const plate = meshGroup.getObjectByName('crepeHotPlate');
    const glow = meshGroup.getObjectByName('crepeHeatGlow');
    const pour = meshGroup.getObjectByName('crepePourStream');
    const batter = meshGroup.getObjectByName('crepeBatterDisc');
    const rake = meshGroup.getObjectByName('crepeRakePivot');
    const toppings = meshGroup.getObjectByName('crepeIngredientsLayer');
    const folded = meshGroup.getObjectByName('crepeFoldedMesh');
    const steam = meshGroup.getObjectByName('crepeSteamGroup');

    const isHeating = isWorking || isPreheat;
    if (plate?.material) {
      plate.material.emissive.setHex(isHeating ? 0x9a3412 : 0x000000);
      plate.material.emissiveIntensity = isHeating ? (isPreheat ? 0.35 + stepProgress * 0.55 : 0.72) : 0;
    }
    if (glow?.material) {
      glow.material.opacity = isHeating ? 0.28 + Math.sin(nowSec * 5.0) * 0.14 : 0;
    }

    const activeCrepe = stepCodigo || '';
    const hasBatterBase = [
      'POUR_BATTER_ON_PLATE',
      'SPREAD_BATTER_CIRCULAR',
      'WAIT_COOK_CREPA',
      'ADD_CREPA_INGREDIENTS'
    ].includes(activeCrepe);

    if (pour) {
      pour.visible = activeCrepe === 'POUR_BATTER_ON_PLATE';
      if (pour.visible) {
        pour.scale.set(1, 0.85 + Math.sin(nowSec * 12) * 0.15, 1);
      }
    }

    if (batter) {
      batter.visible = hasBatterBase;
      if (batter.visible) {
        let s = 1.0;
        let hexColor = 0xfef3c7;
        if (activeCrepe === 'POUR_BATTER_ON_PLATE') {
          s = 0.25 + 0.35 * stepProgress;
        } else if (activeCrepe === 'SPREAD_BATTER_CIRCULAR') {
          s = 0.60 + 0.40 * stepProgress;
        } else if (activeCrepe === 'WAIT_COOK_CREPA') {
          const cookColor = new THREE.Color(0xfef3c7).lerp(new THREE.Color(0xd99b52), Math.min(1, stepProgress));
          hexColor = cookColor.getHex();
        } else if (activeCrepe === 'ADD_CREPA_INGREDIENTS') {
          hexColor = 0xd99b52;
        }
        batter.scale.set(s, 1, s);
        batter.material.color.setHex(hexColor);
      }
    }

    if (rake) {
      rake.visible = activeCrepe === 'SPREAD_BATTER_CIRCULAR';
      if (rake.visible) {
        rake.rotation.y = nowSec * 5.2;
      }
    }
    if (toppings) {
      toppings.visible = activeCrepe === 'ADD_CREPA_INGREDIENTS';
      if (toppings.visible) {
        toppings.scale.setScalar(0.35 + 0.65 * stepProgress);
      }
    }
    if (folded) {
      folded.visible = activeCrepe === 'FOLD_AND_PLATE_CREPA';
    }
    if (steam) {
      steam.visible =
        isHeating &&
        ['PREHEAT_CREPERA', 'POUR_BATTER_ON_PLATE', 'SPREAD_BATTER_CIRCULAR', 'WAIT_COOK_CREPA', 'ADD_CREPA_INGREDIENTS'].includes(
          activeCrepe
        );
      if (steam.visible) {
        steam.position.y = 1.12 + ((nowSec * 0.4) % 0.18);
      }
    }
    return;
  }

  // 2. Ice Shaver horizontal mechanics (manivela izquierda, barra empujadora, desgaste 10 raspados, motor y vaso bajo salida)
  if (eqKey === 'hp_raspadora') {
    const crank = meshGroup.getObjectByName('shaverCrankPivot');
    const door = meshGroup.getObjectByName('shaverDoorPivot');
    const pusher = meshGroup.getObjectByName('shaverPusherGroup');
    const blades = meshGroup.getObjectByName('shaverBladesDrum');
    const btnOn = meshGroup.getObjectByName('shaverBtnOn');
    const btnOff = meshGroup.getObjectByName('shaverBtnOff');
    const snow = meshGroup.getObjectByName('shaverSnowStream');
    const cup = meshGroup.getObjectByName('shaverCupUnder');
    const snowFill = meshGroup.getObjectByName('shaverSnowFill');
    const ice = meshGroup.getObjectByName('shaverIceBlock');

    const activeStep = stepCodigo || '';
    const isShaving = activeStep === 'PUSH_LEVER_SHAVE_ICE' || activeStep === 'SHAVE_ICE';
    const isReloading = activeStep === 'INSERT_ICE_BLOCK';
    const isPlacingCup = activeStep === 'PLACE_CUP_UNDER_SPOUT' || activeStep === 'PLACE_CUP';
    const isTurningOff = activeStep === 'TURN_OFF_SHAVER';

    if (door) {
      door.rotation.x = isReloading ? Math.sin(Math.min(1, stepProgress) * Math.PI) * 1.05 : 0;
    }

    if (blades) {
      if (isWorking) blades.rotation.x = nowSec * 18.0;
    }

    if (crank) {
      if (isShaving) {
        crank.rotation.x = nowSec * 7.5;
      } else if (isReloading) {
        crank.rotation.x = -stepProgress * Math.PI * 2;
      }
    }

    const baseRatio = Math.max(0, Math.min(1, iceBlockRatio));
    const effectiveRatio = isReloading
      ? stepProgress > 0.35 ? 1.0 : 0.0
      : isShaving
        ? Math.max(0.02, baseRatio - 0.10 * stepProgress)
        : baseRatio;

    const maxIceWidth = 0.39;
    const xRightBlades = 0.135;
    const currentWidth = Math.max(0.015, maxIceWidth * effectiveRatio);

    if (ice) {
      ice.visible = effectiveRatio > 0.015;
      if (ice.visible) {
        ice.scale.set(currentWidth, 1, 1);
        ice.position.x = xRightBlades - currentWidth / 2;
      }
    }

    if (pusher) {
      pusher.position.x = isReloading
        ? -0.34
        : effectiveRatio <= 0.015
          ? xRightBlades - 0.025
          : xRightBlades - currentWidth - 0.018;
    }

    if (btnOn) btnOn.position.z = isWorking ? 0.286 : 0.295;
    if (btnOff) btnOff.position.z = isWorking ? 0.295 : 0.287;

    if (snow) {
      snow.visible = isShaving;
      if (snow.visible) {
        const pulse = 0.9 + Math.sin(nowSec * 22.0) * 0.16;
        snow.scale.set(pulse, 0.92 + Math.cos(nowSec * 18.0) * 0.08, pulse);
      }
    }

    if (cup) {
      cup.visible = isPlacingCup || isShaving || isTurningOff;
    }

    if (snowFill) {
      const fillRatio = isShaving ? Math.max(0.05, stepProgress) : isTurningOff ? 1.0 : 0.02;
      snowFill.visible = fillRatio > 0.04;
      snowFill.scale.set(1, fillRatio, 1);
    }
    return;
  }

  // 3. Marquesitera hinged iron
  if (eqKey === 'hp_marquesitera') {
    const lid = meshGroup.getObjectByName('marqUpperLidPivot');
    const roll = meshGroup.getObjectByName('marqRollMesh');
    const isOpen = stepCodigo === 'CLIENT_ORDER_MARQ' || stepCodigo === 'ROLL_FILL_MARQ';
    if (lid) lid.rotation.x = isOpen ? -0.95 : 0;
    if (roll) roll.visible = stepCodigo === 'ROLL_FILL_MARQ';
    return;
  }

  // 4. Blender vortex
  if (eqKey === 'hp_licuadora') {
    const vortex = meshGroup.getObjectByName('blenderVortexMesh');
    if (vortex) {
      vortex.visible = isWorking;
      if (isWorking) {
        vortex.rotation.y = nowSec * 16.0;
        vortex.scale.y = 0.85 + Math.sin(nowSec * 18) * 0.15;
      }
    }
    return;
  }

  // 5. Espresso coffee & steam frother
  if (eqKey === 'hp_breville') {
    const streams = meshGroup.getObjectByName('espressoStreams');
    const pitcher = meshGroup.getObjectByName('milkPitcherGroup');
    const steam = meshGroup.getObjectByName('espressoSteamCloud');
    if (streams) streams.visible = isWorking && (stepCodigo === 'EXTRACT_ESPRESSO' || stepCodigo === 'GRIND_AND_EXTRACT_ESPRESSO');
    if (pitcher) pitcher.visible = isWorking && (stepCodigo === 'STEAM_MILK_FOAM' || stepCodigo === 'EXTRACT_AND_STEAM_MILK');
    if (steam) {
      steam.visible = isWorking && (stepCodigo === 'STEAM_MILK_FOAM' || stepCodigo === 'EXTRACT_AND_STEAM_MILK');
      if (steam.visible) steam.scale.setScalar(0.8 + Math.sin(nowSec * 10) * 0.25);
    }
    return;
  }

  // 6. Xerox scanner sweep & printed paper output
  if (eqKey === 'pap_docucolor') {
    const bar = meshGroup.getObjectByName('scannerLightBar');
    const stack = meshGroup.getObjectByName('printedSheetsStack');
    if (bar) {
      bar.visible = isWorking;
      if (isWorking) bar.position.x = Math.sin(nowSec * 4.5) * 0.34;
    }
    if (stack) stack.visible = isWorking || stepCodigo === 'SORT_STAPLING';
    return;
  }

  // 7. Embroidery Bridge oscillation
  if (eqKey === 'bv_aemco_220' || eqKey === 'bv_melco_emc') {
    const needles = meshGroup.getObjectByName('embroideryNeedlesGroup');
    const panto = meshGroup.getObjectByName('pantographFrame');
    if (needles && isWorking) needles.position.y = Math.sin(nowSec * 36) * 0.025;
    if (panto && isWorking) {
      panto.position.x = Math.sin(nowSec * 5.0) * 0.04;
      panto.position.z = 0.08 + Math.cos(nowSec * 7.0) * 0.04;
    }
    return;
  }

  // 8. Textile cutting & sewing animations
  if (eqKey === 'tc_cortadora') {
    const carriage = meshGroup.getObjectByName('cutterDiscCarriage');
    if (carriage && isWorking) carriage.position.x = Math.sin(nowSec * 3.0) * 0.45;
  } else if (eqKey === 'tc_rectas_singer' || eqKey === 'tc_overlock_5h' || eqKey === 'tc_collaretera_singer') {
    const wheel = meshGroup.getObjectByName('sewingHandwheel');
    if (wheel && isWorking) wheel.rotation.x = nowSec * 22.0;
  } else if (eqKey === 'tc_plancha_vapor') {
    const iron = meshGroup.getObjectByName('steamIronMesh');
    const steam = meshGroup.getObjectByName('boilerSteamCloud');
    if (iron && isWorking) iron.position.x = 0.16 + Math.sin(nowSec * 4.2) * 0.25;
    if (steam) steam.visible = isWorking;
  }

  // 9. Sublimation / Laser CNC animations
  if (eqKey === 'pi_plancha_plana') {
    const platen = meshGroup.getObjectByName('flatPressPlatenPivot');
    if (platen) platen.rotation.x = isWorking ? 0 : -0.78;
  } else if (eqKey === 'pi_atomstack') {
    const gantry = meshGroup.getObjectByName('laserGantryGroup');
    const beam = meshGroup.getObjectByName('laserBeamMesh');
    if (gantry && isWorking) gantry.position.x = Math.sin(nowSec * 3.8) * 0.26;
    if (beam) beam.visible = isWorking;
  }

  // 10. POS Cash drawer pop when charging customer & Office TV/Laptop screen glow
  if (eqKey.endsWith('_tpv')) {
    const drawer = meshGroup.getObjectByName('posCashDrawer');
    const ticket = meshGroup.getObjectByName('posTicket');
    if (drawer) drawer.position.z = isWorking ? 0.16 : 0;
    if (ticket) ticket.scale.y = isWorking ? 1.5 : 1.0;
  } else if (eqKey === 'oc_tv_32') {
    const tvScr = meshGroup.getObjectByName('tvScreenMesh');
    if (tvScr?.material) {
      tvScr.material.emissive.setHex(isActive ? 0x38bdf8 : 0x0284c7);
      tvScr.material.emissiveIntensity = isActive ? 0.85 + Math.sin(nowSec * 3.5) * 0.25 : 0.05;
    }
  } else if (eqKey === 'oc_laptop_diseno') {
    const scr1 = meshGroup.getObjectByName('officeScreenMesh');
    const scr2 = meshGroup.getObjectByName('officeSecondaryScreenMesh');
    if (scr1?.material) scr1.material.emissiveIntensity = isActive ? 0.95 : 0.08;
    if (scr2?.material) scr2.material.emissiveIntensity = isActive ? 0.85 : 0.08;
  }
}

/**
 * Populates the hand-held item group carried by workers/customers during choreographies.
 */
export function updateHandItemVisual(handItemGroup, itemType) {
  if (!handItemGroup) return;
  if (handItemGroup.userData.currentItem === itemType) return;
  handItemGroup.userData.currentItem = itemType;

  while (handItemGroup.children.length > 0) {
    handItemGroup.remove(handItemGroup.children[0]);
  }
  if (!itemType) return;

  if (itemType === 'batter_bowl' || itemType === 'batter_bowl_tilted') {
    const bowl = new THREE.Group();
    addPart(bowl, new THREE.CylinderGeometry(0.14, 0.09, 0.16, 14), matStandard(0xcbd5e1, 0.25, 0.8), [0, 0, 0]);
    addPart(bowl, new THREE.CylinderGeometry(0.125, 0.125, 0.03, 14), matStandard(0xfef3c7), [0, 0.065, 0]);
    if (itemType === 'batter_bowl_tilted') {
      bowl.rotation.x = 0.72;
      bowl.position.set(0, 0.06, 0.08);
    }
    handItemGroup.add(bowl);
  } else if (itemType === 'crepe_rake') {
    const rake = new THREE.Group();
    const wood = matStandard(0xd97706, 0.7, 0.05);
    addPart(rake, new THREE.CylinderGeometry(0.014, 0.014, 0.38, 8), wood, [0, 0.05, 0.12], [Math.PI / 2.6, 0, 0]);
    addPart(rake, new THREE.CylinderGeometry(0.015, 0.015, 0.24, 8), wood, [0, -0.02, 0.29], [0, 0, Math.PI / 2]);
    handItemGroup.add(rake);
  } else if (itemType === 'nutella_jar' || itemType === 'nutella_spatula') {
    addPart(handItemGroup, new THREE.CylinderGeometry(0.08, 0.08, 0.16, 12), matStandard(0x451a03), [0, 0.02, 0]);
    addPart(handItemGroup, new THREE.CylinderGeometry(0.078, 0.078, 0.03, 12), matStandard(0xf8fafc), [0, 0.10, 0]);
    if (itemType === 'nutella_spatula') {
      addPart(handItemGroup, new THREE.BoxGeometry(0.03, 0.01, 0.26), matStandard(0xe2e8f0, 0.2, 0.8), [0.10, 0.03, 0.10]);
    }
  } else if (itemType === 'metal_spatula') {
    addPart(handItemGroup, new THREE.CylinderGeometry(0.014, 0.014, 0.14, 8), matStandard(0x1e293b), [0, 0.02, 0], [Math.PI / 2, 0, 0]);
    addPart(handItemGroup, new THREE.BoxGeometry(0.06, 0.01, 0.22), matStandard(0xe2e8f0, 0.18, 0.9), [0, 0.02, 0.18]);
  } else if (itemType === 'plated_crepa') {
    addPart(handItemGroup, new THREE.CylinderGeometry(0.20, 0.16, 0.025, 18), matStandard(0xf8fafc, 0.2, 0.1), [0, 0, 0.05]);
    addPart(handItemGroup, new THREE.ConeGeometry(0.13, 0.22, 3), matStandard(0xd99b52), [0, 0.03, 0.05], [Math.PI / 2, 0, 0.2]);
    addPart(handItemGroup, new THREE.BoxGeometry(0.08, 0.015, 0.04), matStandard(0x451a03), [0, 0.045, 0.05]);
  } else if (itemType === 'milk_pitcher') {
    addPart(handItemGroup, new THREE.CylinderGeometry(0.065, 0.075, 0.15, 12), matStandard(0xd1d5db, 0.2, 0.85), [0, 0.02, 0.04]);
  } else if (itemType === 'espresso_cup') {
    addPart(handItemGroup, new THREE.CylinderGeometry(0.055, 0.045, 0.10, 12), matStandard(0xf8fafc), [0, 0, 0.04]);
    addPart(handItemGroup, new THREE.CylinderGeometry(0.048, 0.048, 0.02, 12), matStandard(0x78350f), [0, 0.045, 0.04]);
  } else if (itemType === 'ice_block') {
    addPart(handItemGroup, new THREE.BoxGeometry(0.22, 0.20, 0.22), matStandard(0xbae6fd, 0.1, 0.1, { transparent: true, opacity: 0.85 }), [0, 0, 0.05]);
  } else if (itemType === 'empty_cup') {
    addPart(handItemGroup, new THREE.CylinderGeometry(0.07, 0.05, 0.16, 12), matStandard(0xe0f2fe, 0.15, 0.05, { transparent: true, opacity: 0.78 }), [0, 0, 0]);
  } else if (itemType === 'shaved_ice_cup') {
    addPart(handItemGroup, new THREE.CylinderGeometry(0.07, 0.05, 0.16, 12), matStandard(0xe0f2fe, 0.2, 0.05), [0, 0, 0]);
    addPart(handItemGroup, new THREE.SphereGeometry(0.075, 10, 10), matStandard(0xffffff, 0.9, 0.0), [0, 0.10, 0]);
  } else if (itemType === 'lemon_syrup_pouring' || itemType === 'finished_lemon_raspado') {
    addPart(handItemGroup, new THREE.CylinderGeometry(0.07, 0.05, 0.16, 12), matStandard(0x86efac, 0.2, 0.05), [0, 0, 0]);
    addPart(handItemGroup, new THREE.SphereGeometry(0.075, 10, 10), matStandard(0x4ade80, 0.7, 0.0), [0, 0.10, 0]);
    if (itemType === 'finished_lemon_raspado') {
      addPart(handItemGroup, new THREE.CylinderGeometry(0.01, 0.01, 0.22, 6), matStandard(0xfef08a), [0.03, 0.14, 0], [0, 0, -0.25]);
    } else {
      addPart(handItemGroup, new THREE.CylinderGeometry(0.04, 0.04, 0.20, 10), matStandard(0x22c55e, 0.2, 0.1), [-0.14, 0.16, 0.04], [0, 0, -0.8]);
    }
  } else if (itemType === 'sublimation_mug') {
    addPart(handItemGroup, new THREE.CylinderGeometry(0.065, 0.065, 0.15, 12), matStandard(0xf8fafc), [0, 0.02, 0.05]);
  } else if (itemType === 'paper_stack' || itemType === 'ticket') {
    const h = itemType === 'ticket' ? 0.01 : 0.05;
    addPart(handItemGroup, new THREE.BoxGeometry(0.22, h, 0.28), matStandard(0xf8fafc), [0, 0.02, 0.04]);
  } else if (itemType === 'fabric_roll') {
    addPart(handItemGroup, new THREE.CylinderGeometry(0.08, 0.08, 0.42, 12), matStandard(0x2563eb, 0.7, 0.0), [0, 0.04, 0.04], [0, 0, Math.PI / 2]);
  } else if (itemType === 'garment_hanger') {
    addPart(handItemGroup, new THREE.BoxGeometry(0.32, 0.015, 0.015), matStandard(0xcbd5e1, 0.2, 0.8), [0, 0.04, 0.02]);
    addPart(handItemGroup, new THREE.BoxGeometry(0.26, 0.34, 0.04), matStandard(0x0ea5e9, 0.7, 0.05), [0, -0.14, 0.02]);
  } else if (itemType === 'product_bag') {
    addPart(handItemGroup, new THREE.BoxGeometry(0.20, 0.24, 0.14), matStandard(0xf59e0b, 0.6, 0.0), [0, -0.02, 0]);
  }
}
