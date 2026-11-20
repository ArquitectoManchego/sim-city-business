import * as THREE from 'three';

/**
 * Generador procedural del Reloj de Pared Circular 3D (30 cm de diámetro).
 *
 * Especificaciones:
 * - Diámetro exterior: 30 cm (escala 0.30 m)
 * - Carcasa circular: Negro carbón mate/satinado con bisel elegante
 * - Dial interior: Blanco puro con 12 marcadores horarios
 * - Manecilla Horaria: Color Rojo vibrante (corta, destacada)
 * - Manecilla Minutero: Color Negro carbón (larga, estilizada)
 * - Segundero: Rojo fino con contrapeso de precisión
 * - Cristal frontal: Ligeramente reflectante y translúcido
 */
export function createWallClock3D(negocioId = '') {
  const clockGroup = new THREE.Group();
  clockGroup.name = `reloj_pared_3d_${negocioId}`;
  clockGroup.userData = {
    tagType: 'WALL_CLOCK',
    negocioId,
    displayName: 'Reloj de Pared Analógico 30cm'
  };

  // 1. Carcasa circular negra (Radio: 0.15m = 30cm diámetro, fondo: 0.035m)
  const housingMat = new THREE.MeshStandardMaterial({
    color: 0x111827, // Slate-900 / Negro carbón
    roughness: 0.45,
    metalness: 0.35
  });
  const housing = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.15, 0.035, 36),
    housingMat
  );
  housing.rotation.x = Math.PI / 2;
  housing.castShadow = true;
  housing.receiveShadow = true;
  clockGroup.add(housing);

  // Bisel frontal redondeado
  const bezelMat = new THREE.MeshStandardMaterial({
    color: 0x1f2937,
    roughness: 0.3,
    metalness: 0.5
  });
  const bezel = new THREE.Mesh(
    new THREE.TorusGeometry(0.144, 0.010, 16, 36),
    bezelMat
  );
  bezel.position.z = 0.016;
  clockGroup.add(bezel);

  // 2. Dial blanco del reloj (Radio: 0.138m)
  const dialMat = new THREE.MeshStandardMaterial({
    color: 0xfafafa,
    roughness: 0.25,
    metalness: 0.05
  });
  const dial = new THREE.Mesh(
    new THREE.CircleGeometry(0.138, 36),
    dialMat
  );
  dial.position.z = 0.018;
  dial.receiveShadow = true;
  clockGroup.add(dial);

  // 3. Marcas horarias (12 horas)
  const tickMatMain = new THREE.MeshBasicMaterial({ color: 0x0f172a });
  const tickMatSub = new THREE.MeshBasicMaterial({ color: 0x64748b });

  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const isQuarter = i % 3 === 0; // 12, 3, 6, 9
    const length = isQuarter ? 0.020 : 0.011;
    const width = isQuarter ? 0.005 : 0.0026;

    const tick = new THREE.Mesh(
      new THREE.PlaneGeometry(width, length),
      isQuarter ? tickMatMain : tickMatSub
    );
    const r = 0.138 - length / 2 - 0.005;
    tick.position.set(Math.sin(angle) * r, Math.cos(angle) * r, 0.019);
    tick.rotation.z = -angle;
    clockGroup.add(tick);
  }

  // 4. Manecilla HORARIA (ROJA): corta (~6.8 cm), gruesa (0.009 m)
  const hourHandGroup = new THREE.Group();
  hourHandGroup.position.z = 0.021;
  const hourHandMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626, // Rojo intenso solicitado
    roughness: 0.3,
    metalness: 0.2
  });
  const hourHandMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.009, 0.068, 0.003),
    hourHandMat
  );
  hourHandMesh.position.y = 0.068 / 2 - 0.007; // Centro hacia arriba con ligera cola
  hourHandMesh.castShadow = true;
  hourHandGroup.add(hourHandMesh);
  clockGroup.add(hourHandGroup);

  // 5. Manecilla MINUTERO (NEGRA): larga (~10.8 cm), estilizada (0.006 m)
  const minuteHandGroup = new THREE.Group();
  minuteHandGroup.position.z = 0.024;
  const minuteHandMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a, // Negro solicitado
    roughness: 0.35,
    metalness: 0.2
  });
  const minuteHandMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.006, 0.108, 0.003),
    minuteHandMat
  );
  minuteHandMesh.position.y = 0.108 / 2 - 0.009;
  minuteHandMesh.castShadow = true;
  minuteHandGroup.add(minuteHandMesh);
  clockGroup.add(minuteHandGroup);

  // 6. Manecilla SEGUNDERO (ROJA fina con contrapeso)
  const secondHandGroup = new THREE.Group();
  secondHandGroup.position.z = 0.027;
  const secondHandMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const secondHandMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.002, 0.128, 0.0015),
    secondHandMat
  );
  secondHandMesh.position.y = 0.046; // Cola de 1.8cm abajo, punta de 11cm arriba
  secondHandGroup.add(secondHandMesh);
  clockGroup.add(secondHandGroup);

  // 7. Perno o tachuela central
  const capMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.25,
    metalness: 0.8
  });
  const centerCap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.008, 0.006, 16),
    capMat
  );
  centerCap.rotation.x = Math.PI / 2;
  centerCap.position.z = 0.029;
  clockGroup.add(centerCap);

  // 8. Cristal protector frontal
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.15,
    roughness: 0.08,
    metalness: 0.1
  });
  const glass = new THREE.Mesh(
    new THREE.CircleGeometry(0.142, 32),
    glassMat
  );
  glass.position.z = 0.031;
  clockGroup.add(glass);

  return {
    clockGroup,
    hourHand: hourHandGroup,
    minuteHand: minuteHandGroup,
    secondHand: secondHandGroup
  };
}

/**
 * Actualiza la rotación de las manecillas con base en los milisegundos de la simulación.
 */
export function updateWallClockHands(clockEntry, simTimeMs) {
  if (!clockEntry) return;
  const date = new Date(simTimeMs || Date.now());
  const sec = date.getSeconds() + date.getMilliseconds() / 1000;
  const min = date.getMinutes() + sec / 60;
  const hr = (date.getHours() % 12) + min / 60;

  // Sentido de las manecillas del reloj: rotación Z negativa en Three.js
  const hrRad = -(hr / 12) * Math.PI * 2;
  const minRad = -(min / 60) * Math.PI * 2;
  const secRad = -(sec / 60) * Math.PI * 2;

  clockEntry.hourHand.rotation.z = hrRad;
  clockEntry.minuteHand.rotation.z = minRad;
  clockEntry.secondHand.rotation.z = secRad;
}
