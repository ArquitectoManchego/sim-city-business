/**
 * Motor de Grilla de Navegación (NavMesh 2.5D), Bloques de Colisión, Muros y Pathfinding A* (A-Star).
 * Define con exactitud por dónde pueden caminar los empleados y clientes dentro y fuera de cada local.
 */

import { NEGOCIOS_ZONES_3D, ALL_ZONES_3D } from './ChoreographyRegistry.js';

/**
 * Bloques de colisión por defecto para cada local comercial (Mostradores, Barras, Islas de Trabajo, Muros Internos).
 * El jugador puede visualizar, mover, eliminar o agregar nuevos bloques desde la herramienta CollisionAndLayerTool.
 * Coordenadas relativas al centro del local [offsetX, offsetZ, widthX, depthZ, label, tagType].
 */
export const DEFAULT_COLLISION_BLOCKS_POR_NEGOCIO = {
  hawaiian_paradise: [
    { id: 'col_hp_barra', label: 'Barra Principal Hawaiian', tagType: 'COLLISION_BLOCK', x: -0.2, z: 0.0, w: 4.6, d: 0.75, h: 1.05, color: '#d97706' },
    { id: 'col_hp_isla_trasera', label: 'Bancada Equipos Calientes', tagType: 'COLLISION_BLOCK', x: 0.0, z: -4.1, w: 9.8, d: 0.9, h: 0.95, color: '#475569' },
    { id: 'col_hp_mesa_1', label: 'Mesa Clientes #1', tagType: 'ACCESSORY', x: 3.2, z: 2.5, w: 0.9, d: 0.9, h: 0.78, color: '#b45309' },
    { id: 'col_hp_mesa_2', label: 'Mesa Clientes #2', tagType: 'ACCESSORY', x: -0.1, z: 3.0, w: 0.9, d: 0.9, h: 0.78, color: '#b45309' }
  ],
  imperia_uniformes: [
    { id: 'col_imp_mostrador', label: 'Mostrador y Caja Imperia', tagType: 'COLLISION_BLOCK', x: 0.4, z: -0.1, w: 4.2, d: 0.75, h: 1.0, color: '#059669' },
    { id: 'col_imp_probadores', label: 'Módulo de Probadores', tagType: 'COLLISION_BLOCK', x: -5.1, z: 2.9, w: 1.2, d: 2.8, h: 2.2, color: '#334155' },
    { id: 'col_imp_racks_fondo', label: '6 Estantes por Rama Imperia', tagType: 'COLLISION_BLOCK', x: 0.0, z: -4.15, w: 10.6, d: 0.65, h: 1.8, color: '#0f766e' }
  ],
  papeleria_imperiarte: [
    { id: 'col_pap_mostrador', label: 'Mostrador Papelería & TPV', tagType: 'COLLISION_BLOCK', x: 0.2, z: 0.0, w: 4.2, d: 0.75, h: 1.0, color: '#2563eb' },
    { id: 'col_pap_docucolor_base', label: 'Isla Xerox DocuColor', tagType: 'COLLISION_BLOCK', x: -3.2, z: -3.8, w: 2.2, d: 1.0, h: 1.15, color: '#1d4ed8' },
    { id: 'col_pap_rack_cartones', label: 'Mueble Horizontal Cartones (6 Niveles)', tagType: 'COLLISION_BLOCK', x: 3.2, z: -3.65, w: 2.3, d: 1.15, h: 1.75, color: '#b45309' },
    { id: 'col_pap_rack_papeles', label: 'Mueble Horizontal Papeles Finos Fabriano/Favini', tagType: 'COLLISION_BLOCK', x: 0.4, z: -3.65, w: 2.3, d: 1.15, h: 1.75, color: '#d97706' },
    { id: 'col_pap_bastidores', label: 'Rack Bastidores, Lonetas y Caballetes', tagType: 'COLLISION_BLOCK', x: -4.8, z: -0.8, w: 0.7, d: 2.0, h: 1.65, color: '#92400e' }
  ],
  bordados_veracruz: [
    { id: 'col_bv_mesa_recepcion', label: 'Mesa de Recepción y Bastidores', tagType: 'COLLISION_BLOCK', x: 0.0, z: 0.6, w: 3.8, d: 0.75, h: 0.95, color: '#e11d48' },
    { id: 'col_bv_bancada_4cab', label: 'Chasis Bordadoras 4 Cabezas', tagType: 'COLLISION_BLOCK', x: 0.0, z: -3.7, w: 8.8, d: 1.1, h: 1.3, color: '#881337' }
  ],
  taller_costura: [
    { id: 'col_tc_mesa_corte', label: 'Mesa de Tendido y Corte', tagType: 'COLLISION_BLOCK', x: -4.2, z: -1.9, w: 1.8, d: 2.6, h: 0.9, color: '#7e22ce' },
    { id: 'col_tc_linea_costura', label: 'Islas Rectas / Overlock / Collaretera', tagType: 'COLLISION_BLOCK', x: 1.0, z: -3.9, w: 6.8, d: 0.9, h: 0.85, color: '#6b21a8' }
  ],
  taller_publi_imperia: [
    { id: 'col_pi_mostrador', label: 'Mostrador Publi-Imperia', tagType: 'COLLISION_BLOCK', x: 0.2, z: 0.4, w: 3.8, d: 0.7, h: 0.95, color: '#0891b2' },
    { id: 'col_pi_bancada_prensas', label: 'Bancada de Planchas y Láser', tagType: 'COLLISION_BLOCK', x: 0.8, z: -3.9, w: 7.5, d: 0.95, h: 0.9, color: '#155e75' }
  ],
  oficinas_consorcio: [
    { id: 'col_oc_escritorio', label: 'Escritorio Gerencia & Diseño PC', tagType: 'COLLISION_BLOCK', x: -2.2, z: -2.6, w: 1.8, d: 0.75, h: 0.78, color: '#ca8a04' },
    { id: 'col_oc_mueble_tv', label: 'Mueble Smart TV 32"', tagType: 'ACCESSORY', x: 2.2, z: -3.75, w: 1.6, d: 0.45, h: 0.65, color: '#334155' },
    { id: 'col_oc_sofa_tv', label: 'Sofá Descanso TV / Clima', tagType: 'ACCESSORY', x: 2.4, z: -0.1, w: 2.2, d: 0.75, h: 0.8, color: '#475569' },
    { id: 'col_oc_mesa_comer', label: 'Mesa Comedor Oficina', tagType: 'ACCESSORY', x: -1.6, z: 2.2, w: 1.4, d: 0.85, h: 0.76, color: '#78350f' }
  ]
};

/**
 * Verifica si un punto local (lx, lz) dentro de un negocio choca con un muro o bloque de colisión
 */
export function isLocalPointBlocked(lx, lz, negocioId = 'hawaiian_paradise', customBlocksMap = null) {
  const zone = ALL_ZONES_3D[negocioId] || NEGOCIOS_ZONES_3D[negocioId];
  if (!zone) return false;
  const halfW = zone.size[0] / 2;
  const halfD = zone.size[2] / 2;

  // Permitir la acera exterior (z entre halfD y halfD + 1.6) y el hueco de la puerta frontal (x entre -1.3 y +1.3)
  if (lz > halfD + 1.8 || lz < -halfD + 0.35 || lx < -halfW + 0.35 || lx > halfW - 0.35) {
    return true;
  }

  // Muro frontal (z ≈ halfD = 5.0), excepto el vano de la puerta central (-1.4 <= lx <= 1.4)
  if (Math.abs(lz - (halfD - 0.2)) < 0.32 && Math.abs(lx) > 1.45) {
    return true;
  }

  const blocks = (customBlocksMap && customBlocksMap[negocioId]) || DEFAULT_COLLISION_BLOCKS_POR_NEGOCIO[negocioId] || [];
  const margin = 0.08; // Radio de colisión optimizado para no trabar personajes en barras y mostradores

  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.disabled) continue;
    // Las mesas, sillas y accesorios donde se sientan o interactúan clientes/familiares no bloquean el paso
    if (b.tagType === 'ACCESSORY') continue;
    const minX = b.x - b.w / 2 - margin;
    const maxX = b.x + b.w / 2 + margin;
    const minZ = b.z - b.d / 2 - margin;
    const maxZ = b.z + b.d / 2 + margin;
    if (lx >= minX && lx <= maxX && lz >= minZ && lz <= maxZ) {
      return true;
    }
  }
  return false;
}

/**
 * Calcula una ruta A* en coordenadas locales del negocio [lx, 0, lz] rodeando barras, muros y bloques de colisión
 */
export function computeLocalPathAStar(startLocal, targetLocal, negocioId = 'hawaiian_paradise', customBlocksMap = null) {
  const sx = startLocal[0];
  const sz = startLocal[2];
  const tx = targetLocal[0];
  const tz = targetLocal[2];

  const distDirect = Math.hypot(tx - sx, tz - sz);
  if (distDirect < 0.35) {
    return [[tx, 0, tz]];
  }

  // Verificar si la línea recta está libre de colisiones
  let lineClear = true;
  const stepsCheck = Math.max(4, Math.ceil(distDirect / 0.25));
  for (let s = 1; s < stepsCheck; s++) {
    const frac = s / stepsCheck;
    const cx = sx + (tx - sx) * frac;
    const cz = sz + (tz - sz) * frac;
    if (isLocalPointBlocked(cx, cz, negocioId, customBlocksMap)) {
      lineClear = false;
      break;
    }
  }
  if (lineClear) {
    return [[tx, 0, tz]];
  }

  // Grilla A* de resolución 0.40m adaptada al tamaño de la zona
  const zone = ALL_ZONES_3D[negocioId] || NEGOCIOS_ZONES_3D[negocioId];
  const halfW = zone ? zone.size[0] / 2 : 6.0;
  const halfD = zone ? zone.size[2] / 2 : 5.0;
  const step = 0.40;
  const minX = -(halfW - 0.4);
  const maxX = halfW - 0.4;
  const minZ = -(halfD - 0.4);
  const maxZ = halfD + 0.6;
  const cols = Math.round((maxX - minX) / step);
  const rows = Math.round((maxZ - minZ) / step);

  const toGrid = (x, z) => ({
    c: Math.max(0, Math.min(cols, Math.round((x - minX) / step))),
    r: Math.max(0, Math.min(rows, Math.round((z - minZ) / step)))
  });
  const toWorld = (c, r) => [
    minX + c * step,
    0,
    minZ + r * step
  ];

  const startNode = toGrid(sx, sz);
  const goalNode = toGrid(tx, tz);
  const key = (c, r) => `${c}_${r}`;

  const openSet = [{ c: startNode.c, r: startNode.r, g: 0, f: Math.hypot(goalNode.c - startNode.c, goalNode.r - startNode.r) }];
  const cameFrom = new Map();
  const gScore = new Map([[key(startNode.c, startNode.r), 0]]);
  const closed = new Set();

  const dirs = [
    [1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
    [1, 1, 1.414], [-1, 1, 1.414], [1, -1, 1.414], [-1, -1, 1.414]
  ];

  let iterations = 0;
  while (openSet.length > 0 && iterations < 450) {
    iterations++;
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift();
    const curKey = key(current.c, current.r);

    if (current.c === goalNode.c && current.r === goalNode.r) {
      const path = [[tx, 0, tz]];
      let traceKey = curKey;
      while (cameFrom.has(traceKey)) {
        const prev = cameFrom.get(traceKey);
        if (prev.c === startNode.c && prev.r === startNode.r) break;
        path.unshift(toWorld(prev.c, prev.r));
        traceKey = key(prev.c, prev.r);
      }
      return path;
    }

    closed.add(curKey);

    for (let d = 0; d < dirs.length; d++) {
      const nc = current.c + dirs[d][0];
      const nr = current.r + dirs[d][1];
      if (nc < 0 || nc > cols || nr < 0 || nr > rows) continue;
      const nKey = key(nc, nr);
      if (closed.has(nKey)) continue;

      const [wx, , wz] = toWorld(nc, nr);
      const isGoal = nc === goalNode.c && nr === goalNode.r;
      if (!isGoal && isLocalPointBlocked(wx, wz, negocioId, customBlocksMap)) {
        continue;
      }

      const tentativeG = (gScore.get(curKey) || 0) + dirs[d][2];
      if (tentativeG < (gScore.get(nKey) ?? Infinity)) {
        cameFrom.set(nKey, current);
        gScore.set(nKey, tentativeG);
        const h = Math.hypot(goalNode.c - nc, goalNode.r - nr);
        const existing = openSet.find(n => n.c === nc && n.r === nr);
        if (existing) {
          existing.g = tentativeG;
          existing.f = tentativeG + h;
        } else {
          openSet.push({ c: nc, r: nr, g: tentativeG, f: tentativeG + h });
        }
      }
    }
  }

  // Fallback de rodeo lateral de barra si el punto estaba muy pegado a un borde
  const midX = sx * 0.5 + tx * 0.5 > 0 ? 2.6 : -2.8;
  return [[midX, 0, sz], [midX, 0, tz], [tx, 0, tz]];
}
