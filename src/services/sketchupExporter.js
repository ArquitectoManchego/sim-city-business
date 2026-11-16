/**
 * Motor de Exportación y Serialización 3D para Trimble SketchUp (2018 - 2026).
 * Empaqueta muros con corte arquitectónico, pisos caminables (NavMesh), bloques de colisión,
 * mobiliario/equipos y personajes con mallas 3D y texturas/colores.
 */

import { ALL_ZONES_3D, NEGOCIOS_ZONES_3D } from '../engine/ChoreographyRegistry.js';
import { DEFAULT_COLLISION_BLOCKS_POR_NEGOCIO } from '../engine/NavMeshGrid.js';
import { useSceneEditorStore } from '../store/useSceneEditorStore.js';
import { useGameStore } from '../store/useGameStore.js';

/**
 * Genera el paquete completo de datos de la escena para SketchUp (.scb / .json)
 */
export function buildSketchupSceneData(options = {}) {
  const {
    corteArquitectonico = true,
    alturaCorte = 1.20,
    incluirPersonajes = true,
    incluirEquipos = true,
    incluirColisiones = true,
    incluirPisoCaminable = true
  } = options;

  const sceneEditorState = useSceneEditorStore.getState();
  const gameState = useGameStore.getState();
  const collisionBlocksMap = sceneEditorState.collisionBlocksByNegocio || DEFAULT_COLLISION_BLOCKS_POR_NEGOCIO;
  const avatarConfigs = gameState.sims2AvataresConfig || {};

  const scenePayload = {
    formato: 'SIM_CITY_BUSINESS_SKP_EXCHANGE',
    version: '2.0.0',
    generadoPor: 'Sim City Business Web 3D Engine',
    fecha: new Date().toISOString(),
    unidades: 'metros',
    corteArquitectonico: {
      activo: Boolean(corteArquitectonico),
      alturaCorteMts: alturaCorte,
      alturaCompletaMts: 3.20
    },
    locales: [],
    bloquesColision: [],
    pisoCaminable: [],
    equipos: [],
    personajes: []
  };

  // 1. LOCALES Y MUROS ARQUITECTÓNICOS
  Object.entries(ALL_ZONES_3D).forEach(([negId, zone]) => {
    const [cx, cy, cz] = zone.center;
    const [w, hFull, depth] = zone.size;
    const wallH = corteArquitectonico ? Math.min(alturaCorte, hFull) : hFull;
    const wallThick = 0.22;

    const localData = {
      id: negId,
      nombre: zone.nombre,
      subtitulo: zone.subtitulo || '',
      colorHex: zone.colorHex || '#3b82f6',
      pisoColorHex: zone.pisoColorHex || '#1e293b',
      muroColorHex: zone.muroColorHex || '#334155',
      centro: [cx, cy, cz],
      dimensiones: [w, wallH, depth],
      muros: [],
      pisos: []
    };

    // Piso del local
    localData.pisos.push({
      tipo: 'PISO_INTERIOR',
      centro: [cx, 0, cz],
      ancho: w,
      fondo: depth,
      espesor: 0.08,
      color: zone.pisoColorHex || '#1e293b',
      layer: 'SCB_Piso_Caminable'
    });

    // Acera exterior frontal
    localData.pisos.push({
      tipo: 'ACERA_EXTERIOR',
      centro: [cx, 0, cz + depth / 2 + 1.0],
      ancho: w,
      fondo: 2.0,
      espesor: 0.06,
      color: '#334155',
      layer: 'SCB_Piso_Caminable'
    });

    // Muro trasero (continuo)
    localData.muros.push({
      lado: 'TRASERO',
      centro: [cx, wallH / 2, cz - depth / 2],
      dimensiones: [w, wallH, wallThick],
      color: zone.muroColorHex || '#334155',
      layer: corteArquitectonico ? 'SCB_Corte_Muros' : 'SCB_Muros_Arquitectura'
    });

    // Muro lateral izquierdo (continuo)
    localData.muros.push({
      lado: 'IZQUIERDO',
      centro: [cx - w / 2, wallH / 2, cz],
      dimensiones: [wallThick, wallH, depth],
      color: zone.muroColorHex || '#334155',
      layer: corteArquitectonico ? 'SCB_Corte_Muros' : 'SCB_Muros_Arquitectura'
    });

    // Muro lateral derecho (continuo)
    localData.muros.push({
      lado: 'DERECHO',
      centro: [cx + w / 2, wallH / 2, cz],
      dimensiones: [wallThick, wallH, depth],
      color: zone.muroColorHex || '#334155',
      layer: corteArquitectonico ? 'SCB_Corte_Muros' : 'SCB_Muros_Arquitectura'
    });

    // Muro frontal (con vano de puerta central entre -1.4m y +1.4m)
    const doorHalfW = 1.45;
    const segW = (w / 2) - doorHalfW;
    if (segW > 0.2) {
      // Segmento frontal izquierdo
      localData.muros.push({
        lado: 'FRONTAL_IZQUIERDO',
        centro: [cx - doorHalfW - segW / 2, wallH / 2, cz + depth / 2],
        dimensiones: [segW, wallH, wallThick],
        color: zone.muroColorHex || '#334155',
        layer: corteArquitectonico ? 'SCB_Corte_Muros' : 'SCB_Muros_Arquitectura'
      });
      // Segmento frontal derecho
      localData.muros.push({
        lado: 'FRONTAL_DERECHO',
        centro: [cx + doorHalfW + segW / 2, wallH / 2, cz + depth / 2],
        dimensiones: [segW, wallH, wallThick],
        color: zone.muroColorHex || '#334155',
        layer: corteArquitectonico ? 'SCB_Corte_Muros' : 'SCB_Muros_Arquitectura'
      });
    }

    scenePayload.locales.push(localData);

    // 2. PISO CAMINABLE (NAVMESH TRANSITABLE)
    if (incluirPisoCaminable) {
      scenePayload.pisoCaminable.push({
        negocioId: negId,
        nombre: `NavMesh ${zone.nombre}`,
        layer: 'SCB_Piso_Caminable',
        poligono: [
          [cx - w / 2 + 0.35, 0.01, cz - depth / 2 + 0.35],
          [cx + w / 2 - 0.35, 0.01, cz - depth / 2 + 0.35],
          [cx + w / 2 - 0.35, 0.01, cz + depth / 2 - 0.25],
          [cx - w / 2 + 0.35, 0.01, cz + depth / 2 - 0.25]
        ],
        aceraFrontal: [
          [cx - w / 2 + 0.1, 0.01, cz + depth / 2],
          [cx + w / 2 - 0.1, 0.01, cz + depth / 2],
          [cx + w / 2 - 0.1, 0.01, cz + depth / 2 + 1.8],
          [cx - w / 2 + 0.1, 0.01, cz + depth / 2 + 1.8]
        ]
      });
    }

    // 3. BLOQUES DE COLISIÓN
    if (incluirColisiones) {
      const blocks = collisionBlocksMap[negId] || [];
      blocks.forEach((b) => {
        if (b.disabled) return;
        const worldX = cx + (parseFloat(b.x) || 0);
        const worldZ = cz + (parseFloat(b.z) || 0);
        const worldH = parseFloat(b.h) || 1.0;
        const worldY = worldH / 2;

        scenePayload.bloquesColision.push({
          negocioId: negId,
          id: b.id,
          label: b.label || 'Bloque de Colisión',
          tagType: b.tagType || 'COLLISION_BLOCK',
          centro: [worldX, worldY, worldZ],
          dimensiones: [b.w, worldH, b.d],
          color: b.color || (b.tagType === 'ACCESSORY' ? '#b45309' : '#ef4444'),
          layer: 'SCB_Bloques_Colision',
          atributos: {
            negocioId: negId,
            idOriginal: b.id,
            tipo: b.tagType || 'COLLISION_BLOCK',
            localOffset: [b.x, b.z]
          }
        });
      });
    }
  });

  // 4. EQUIPOS Y MOBILIARIO FUNCIONAL
  if (incluirEquipos) {
    const equiposCatalogo = [
      // Hawaiian Paradise
      { id: 'hp_crepera', nombre: 'Crepera Doble Francesa Krampouz', negId: 'hawaiian_paradise', pos: [-14.0, 0.95, -10.1], dim: [0.90, 0.28, 0.50], color: '#475569' },
      { id: 'hp_marquesitera', nombre: 'Parrilla Marquesitas Yucatecas', negId: 'hawaiian_paradise', pos: [-12.2, 0.95, -10.1], dim: [0.65, 0.32, 0.45], color: '#334155' },
      { id: 'hp_raspados', nombre: 'Raspadora de Hielo Hokuriku Swan', negId: 'hawaiian_paradise', pos: [-15.8, 0.95, -10.1], dim: [0.55, 0.72, 0.45], color: '#0284c7' },
      { id: 'hp_espresso', nombre: 'Cafetera Espresso 2 Grupos Faema', negId: 'hawaiian_paradise', pos: [-14.2, 1.05, -5.9], dim: [0.85, 0.55, 0.52], color: '#b45309' },
      // Imperia Uniformes
      { id: 'imp_probador_1', nombre: 'Cabina de Probador #1', negId: 'imperia_uniformes', pos: [-5.1, 1.1, -3.1], dim: [1.2, 2.2, 1.4], color: '#0f766e' },
      { id: 'imp_mostrador', nombre: 'Mostrador de Atención B2B & Caja', negId: 'imperia_uniformes', pos: [0.4, 0.5, -6.1], dim: [4.2, 1.0, 0.75], color: '#059669' },
      // Papelería ImperiArte
      { id: 'pap_docucolor', nombre: 'Prensa Digital Xerox DocuColor', negId: 'papeleria_imperiarte', pos: [10.8, 0.65, -9.8], dim: [2.2, 1.3, 1.0], color: '#1d4ed8' },
      { id: 'pap_rack_fabriano', nombre: 'Mueble Horizontal Papeles Finos', negId: 'papeleria_imperiarte', pos: [14.4, 0.9, -9.65], dim: [2.3, 1.8, 1.15], color: '#d97706' },
      // Bordados Veracruz
      { id: 'bv_aemco_4cab', nombre: 'Bordadora Industrial 4 Cabezas AEMCO', negId: 'bordados_veracruz', pos: [-14.0, 0.75, 4.3], dim: [8.8, 1.5, 1.2], color: '#881337' },
      // Taller de Costura
      { id: 'tc_mesa_corte', nombre: 'Mesa de Tendido y Corte 2.60m', negId: 'taller_costura', pos: [-4.2, 0.45, 6.1], dim: [1.8, 0.9, 2.6], color: '#7e22ce' },
      { id: 'tc_overlock_line', nombre: 'Línea de Costura Industrial Singer/Siruba', negId: 'taller_costura', pos: [1.0, 0.45, 4.1], dim: [6.8, 0.9, 0.9], color: '#6b21a8' },
      // Publi-Impresos
      { id: 'pi_planchas', nombre: 'Bancada Prensas Térmicas & Horno DTF', negId: 'taller_publi_imperia', pos: [14.8, 0.5, 4.1], dim: [7.5, 1.0, 0.95], color: '#155e75' }
    ];

    equiposCatalogo.forEach((eq) => {
      scenePayload.equipos.push({
        id: eq.id,
        nombre: eq.nombre,
        negocioId: eq.negId,
        centro: eq.pos,
        dimensiones: eq.dim,
        color: eq.color,
        layer: 'SCB_Equipos'
      });
    });
  }

  // 5. PERSONAJES CON MALLA 3D Y VESTIMENTA (AVATARES SIMS 2)
  if (incluirPersonajes) {
    const simsList = [
      { id: 'gerente', nombre: 'Alex (Gerente General)', rol: 'Gerente General', pos: [-14.0, 0, -4.8], alturaM: 1.76, color: '#facc15' },
      { id: 'familia_esposa', nombre: 'Esposa (42 años)', rol: 'Familia', pos: [26.0, 0, 1.5], alturaM: 1.63, color: '#f472b6' },
      { id: 'familia_alex', nombre: 'Alex Jr. (12 años)', rol: 'Hijo 12a', pos: [27.2, 0, 0.8], alturaM: 1.48, color: '#0284c7' },
      { id: 'familia_barbara', nombre: 'Bárbara (8 años)', rol: 'Hija 8a', pos: [25.5, 0, 2.2], alturaM: 1.24, color: '#a855f7' },
      { id: 'emp_hawaiian_paradise_0', nombre: 'Barista Hawaiian', rol: 'Empleado', pos: [-15.2, 0, -6.65], alturaM: 1.64, color: '#f59e0b' },
      { id: 'emp_imperia_uniformes_0', nombre: 'Asesora Mostrador Imperia', rol: 'Empleado', pos: [0.4, 0, -6.8], alturaM: 1.65, color: '#10b981' },
      { id: 'emp_papeleria_imperiarte_0', nombre: 'Encargado Papelería', rol: 'Empleado', pos: [14.2, 0, -6.0], alturaM: 1.73, color: '#3b82f6' },
      { id: 'emp_bordados_veracruz_0', nombre: 'Operador Bordados', rol: 'Empleado', pos: [-14.0, 0, 5.2], alturaM: 1.74, color: '#f43f5e' },
      { id: 'emp_taller_costura_0', nombre: 'Costurera Maestra', rol: 'Empleado', pos: [0.0, 0, 5.0], alturaM: 1.60, color: '#a855f7' },
      { id: 'emp_taller_publi_imperia_0', nombre: 'Operador Prensa Publi', rol: 'Empleado', pos: [14.8, 0, 5.0], alturaM: 1.75, color: '#06b6d4' }
    ];

    simsList.forEach((sim) => {
      const cfg = avatarConfigs[sim.id] || {};
      const h = (cfg.heightCm ? cfg.heightCm / 100 : sim.alturaM) || 1.70;
      const topColor = cfg.topColor || sim.color;
      const bottomColor = cfg.bottomColor || '#1e293b';
      const skinColor = cfg.skinColor || '#d8a27c';

      // Generar malla 3D anatómica sólida simplificada para SketchUp (Cuerpo, Ropa, Cabeza)
      const mesh3D = buildSimplifiedHumanMesh(sim.pos, h, topColor, bottomColor, skinColor);

      scenePayload.personajes.push({
        id: sim.id,
        nombre: sim.nombre,
        rol: sim.rol,
        posicion: sim.pos,
        alturaMts: h,
        genero: cfg.gender || (sim.id.includes('barbara') || sim.id.includes('esposa') ? 'F' : 'M'),
        colorPrimario: topColor,
        layer: 'SCB_Personajes',
        malla3D: mesh3D
      });
    });
  }

  return scenePayload;
}

/**
 * Construye una malla 3D anatómica representativa de un personaje (Torso, Cabeza, Brazos, Piernas)
 * para que SketchUp cree de inmediato los componentes sólidos 3D con colores de vestimenta.
 */
function buildSimplifiedHumanMesh(basePos, height, topColor, bottomColor, skinColor) {
  const [x, y, z] = basePos;
  const scale = height / 1.75;

  const parts = [
    // Cabeza (piel)
    {
      nombre: 'Cabeza',
      centro: [x, y + 1.55 * scale, z],
      dimensiones: [0.20 * scale, 0.24 * scale, 0.20 * scale],
      color: skinColor
    },
    // Torso / Prenda Superior (Polo / Filipina)
    {
      nombre: 'Torso_Prenda',
      centro: [x, y + 1.15 * scale, z],
      dimensiones: [0.38 * scale, 0.55 * scale, 0.24 * scale],
      color: topColor
    },
    // Brazo Izquierdo
    {
      nombre: 'Brazo_Izq',
      centro: [x - 0.24 * scale, y + 1.10 * scale, z],
      dimensiones: [0.10 * scale, 0.50 * scale, 0.12 * scale],
      color: topColor
    },
    // Brazo Derecho
    {
      nombre: 'Brazo_Der',
      centro: [x + 0.24 * scale, y + 1.10 * scale, z],
      dimensiones: [0.10 * scale, 0.50 * scale, 0.12 * scale],
      color: topColor
    },
    // Pierna Izquierda / Pantalón
    {
      nombre: 'Pierna_Izq',
      centro: [x - 0.11 * scale, y + 0.44 * scale, z],
      dimensiones: [0.14 * scale, 0.84 * scale, 0.16 * scale],
      color: bottomColor
    },
    // Pierna Derecha / Pantalón
    {
      nombre: 'Pierna_Der',
      centro: [x + 0.11 * scale, y + 0.44 * scale, z],
      dimensiones: [0.14 * scale, 0.84 * scale, 0.16 * scale],
      color: bottomColor
    },
    // Calzado
    {
      nombre: 'Calzado_Izq',
      centro: [x - 0.11 * scale, y + 0.04 * scale, z + 0.03 * scale],
      dimensiones: [0.13 * scale, 0.08 * scale, 0.24 * scale],
      color: '#0f172a'
    },
    {
      nombre: 'Calzado_Der',
      centro: [x + 0.11 * scale, y + 0.04 * scale, z + 0.03 * scale],
      dimensiones: [0.13 * scale, 0.08 * scale, 0.24 * scale],
      color: '#0f172a'
    }
  ];

  return { partes: parts };
}

/**
 * Descarga el archivo de escena (.scb / .json) en el navegador del usuario
 */
export function downloadSketchupSceneFile(options = {}) {
  const data = buildSketchupSceneData(options);
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const fileName = options.corteArquitectonico
    ? `simcity_corte_planta_${Date.now()}.scb`
    : `simcity_modelo_completo_${Date.now()}.scb`;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return { success: true, fileName, countLocales: data.locales.length, countBloques: data.bloquesColision.length };
}

/**
 * Procesa e importa un archivo exportado desde SketchUp de vuelta a la aplicación
 */
export function importFromSketchupPayload(sketchupData) {
  if (!sketchupData || !sketchupData.bloquesColision) {
    throw new Error('El archivo no contiene un formato válido de exportación de SketchUp Sim City.');
  }

  const editorStore = useSceneEditorStore.getState();
  const currentBlocks = structuredClone(editorStore.collisionBlocksByNegocio);

  // Mapear bloques de colisión devueltos desde SketchUp
  const updatedNegocios = new Set();
  sketchupData.bloquesColision.forEach((b) => {
    const negId = b.negocioId || 'hawaiian_paradise';
    updatedNegocios.add(negId);

    // Calcular posición local respecto al centro del negocio
    const zone = ALL_ZONES_3D[negId] || NEGOCIOS_ZONES_3D[negId];
    const [cx, , cz] = zone ? zone.center : [0, 0, 0];

    const localX = b.centro ? b.centro[0] - cx : b.x || 0;
    const localZ = b.centro ? b.centro[2] - cz : b.z || 0;
    const [w, h, d] = b.dimensiones || [b.w || 1.2, b.h || 1.0, b.d || 1.2];

    if (!currentBlocks[negId]) currentBlocks[negId] = [];

    const existingIdx = currentBlocks[negId].findIndex((ex) => ex.id === b.id);
    const blockEntry = {
      id: b.id || `col_skp_${Date.now()}`,
      label: b.label || 'Bloque Editado en SketchUp',
      tagType: b.tagType || 'COLLISION_BLOCK',
      x: parseFloat(localX.toFixed(3)),
      z: parseFloat(localZ.toFixed(3)),
      w: parseFloat(w.toFixed(3)),
      h: parseFloat(h.toFixed(3)),
      d: parseFloat(d.toFixed(3)),
      color: b.color || '#ef4444'
    };

    if (existingIdx >= 0) {
      currentBlocks[negId][existingIdx] = blockEntry;
    } else {
      currentBlocks[negId].push(blockEntry);
    }
  });

  // Guardar en store
  useSceneEditorStore.setState({ collisionBlocksByNegocio: currentBlocks });

  return {
    success: true,
    negociosAfectados: Array.from(updatedNegocios),
    totalBloques: sketchupData.bloquesColision.length
  };
}
