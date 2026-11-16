/**
 * Store Maestro de Simulación de SIM CITY BUSINESS 3D.
 * Gestiona el Reloj Multi-Velocidad (0x, 1x, 10x, 60x, 600x [1h=6s], y saltos de Día/Semana/Mes/Año),
 * Agentes Sims 2 Reales (Múltiples Empleados, Gerente, Familia 3-4 PM y Clientes), Stock, Queues, Red CFE y Log.
 */

import { create } from 'zustand';
import {
  NEGOCIOS_ZONES_3D,
  ALL_ZONES_3D,
  WAYPOINTS_POR_NEGOCIO,
  TAREAS_SIN_CLIENTES_POR_NEGOCIO,
  obtenerCoreografiaProducto
} from '../engine/ChoreographyRegistry.js';
import {
  UNIVERSAL_HUMAN_ROUTINES,
  IMPERIA_SPECIAL_ROUTINES,
  calcularETAInsumoExterno
} from '../engine/ProcessFactory.js';
import { createDefaultSims2Profiles } from '../components/canvas3d/Sims2AvatarLoader.js';
import { computeLocalPathAStar } from '../engine/NavMeshGrid.js';
import {
  evaluarCondicionesDemanda,
  calcularTasaClientesPorHora,
  crearEntidadCliente
} from '../engine/CustomerSpawner.js';
import {
  MATERIAS_PRIMAS_POR_NEGOCIO,
  PRODUCTOS_OPERATIVOS_EXTENDIDOS
} from '../shared/catalogoProductosInsumos.js';
import { PLANTILLA_DEFAULT_NEGOCIOS, calcularNominaNegocio } from '../shared/nominaYTurnosNegocios.js';
import { simCitySyncService, identificarNegocioDeAparato } from '../services/firebaseSync.js';
import { useTrainingStore } from './useTrainingStore.js';
import { useSceneEditorStore } from './useSceneEditorStore.js';

export const NEGOCIOS_ACTIVOS_IDS = [
  'hawaiian_paradise',
  'imperia_uniformes',
  'papeleria_imperiarte',
  'bordados_veracruz',
  'taller_costura',
  'taller_publi_imperia'
];

// Catálogo maestro de máquinas operativas para vincular pasos de recetas con medidores CFE
export const EQUIPOS_OPERATIVOS_BASE = {
  // Hawaiian Paradise (med_3)
  hp_raspadora: { key: 'hp_raspadora', nombre: 'Máquina de Raspados Hawaiian (600W)', negocioId: 'hawaiian_paradise', medidorId: 'med_3', wattsNominal: 600, fase: 'A', rol: 'produccion' },
  hp_crepera: { key: 'hp_crepera', nombre: 'Crepera Eléctrica Profesional (3000W)', negocioId: 'hawaiian_paradise', medidorId: 'med_3', wattsNominal: 3000, fase: 'C', rol: 'produccion' },
  hp_marquesitera: { key: 'hp_marquesitera', nombre: 'Máquina de Marquesitas Conesa (1300W)', negocioId: 'hawaiian_paradise', medidorId: 'med_3', wattsNominal: 1300, fase: 'A', rol: 'produccion' },
  hp_licuadora: { key: 'hp_licuadora', nombre: 'Licuadora Alta Potencia Ninja/Ultrachef (2000W)', negocioId: 'hawaiian_paradise', medidorId: 'med_3', wattsNominal: 2000, fase: 'A', rol: 'produccion' },
  hp_breville: { key: 'hp_breville', nombre: 'Cafetera Expresso Gaggia Ruby Pro (2640W)', negocioId: 'hawaiian_paradise', medidorId: 'med_3', wattsNominal: 2640, fase: 'B-C', rol: 'produccion' },
  hp_tetera: { key: 'hp_tetera', nombre: 'Tetera Eléctrica Rápida (1500W)', negocioId: 'hawaiian_paradise', medidorId: 'med_3', wattsNominal: 1500, fase: 'B', rol: 'produccion' },
  hp_bano_maria: { key: 'hp_bano_maria', nombre: 'Baño María 2 Ollas Esquites (1200W)', negocioId: 'hawaiian_paradise', medidorId: 'med_3', wattsNominal: 1200, fase: 'B', rol: 'produccion' },
  hp_tpv: { key: 'hp_tpv', nombre: 'Caja TPV Punto de Venta Hawaiian (280W)', negocioId: 'hawaiian_paradise', medidorId: 'med_3', wattsNominal: 280, fase: 'C', rol: 'turno_fijo' },
  hp_refrigerador: { key: 'hp_refrigerador', nombre: 'Refrigerador Vertical 11 pies (310W)', negocioId: 'hawaiian_paradise', medidorId: 'med_3', wattsNominal: 310, fase: 'A', rol: 'continuo_24h' },
  hp_congelador: { key: 'hp_congelador', nombre: 'Congelador Horizontal Hielo/Pulpa (290W)', negocioId: 'hawaiian_paradise', medidorId: 'med_3', wattsNominal: 290, fase: 'B', rol: 'continuo_24h' },
  hp_ac_clientes: { key: 'hp_ac_clientes', nombre: 'Minisplit Inverter Hawaiian 1.5 TR (1700W)', negocioId: 'hawaiian_paradise', medidorId: 'med_3', wattsNominal: 1700, fase: 'A-B', rol: 'clima' },
  hp_luces: { key: 'hp_luces', nombre: 'Alumbrado General LED Hawaiian (135W)', negocioId: 'hawaiian_paradise', medidorId: 'med_3', wattsNominal: 135, fase: 'B', rol: 'turno_fijo' },

  // Imperia Uniformes (med_1)
  imp_tpv: { key: 'imp_tpv', nombre: 'Computadora Mostrador TPV Imperia (250W)', negocioId: 'imperia_uniformes', medidorId: 'med_1', wattsNominal: 250, fase: 'A', rol: 'turno_fijo' },
  imp_terminal: { key: 'imp_terminal', nombre: 'Terminal Bancaria Smart POS (15W)', negocioId: 'imperia_uniformes', medidorId: 'med_1', wattsNominal: 15, fase: 'A', rol: 'produccion' },
  imp_ac: { key: 'imp_ac', nombre: 'Minisplit Inverter Showroom 1 TR (1150W)', negocioId: 'imperia_uniformes', medidorId: 'med_1', wattsNominal: 1150, fase: 'A-B', rol: 'clima' },
  imp_luces: { key: 'imp_luces', nombre: 'Alumbrado LED Showroom Imperia (180W)', negocioId: 'imperia_uniformes', medidorId: 'med_1', wattsNominal: 180, fase: 'B', rol: 'turno_fijo' },
  imp_cctv: { key: 'imp_cctv', nombre: 'Sistema CCTV 16 Cámaras + DVR (150W)', negocioId: 'imperia_uniformes', medidorId: 'med_1', wattsNominal: 150, fase: 'B', rol: 'continuo_24h' },

  // Papelería ImperiArte (med_2)
  pap_docucolor: { key: 'pap_docucolor', nombre: 'Fotocopiadora Xerox DocuColor (1500W)', negocioId: 'papeleria_imperiarte', medidorId: 'med_2', wattsNominal: 1500, fase: 'A', rol: 'produccion' },
  pap_tpv: { key: 'pap_tpv', nombre: 'Computadora AIO TPV Papelería (180W)', negocioId: 'papeleria_imperiarte', medidorId: 'med_2', wattsNominal: 180, fase: 'A', rol: 'turno_fijo' },
  pap_ac_18k: { key: 'pap_ac_18k', nombre: 'Minisplit Inverter Papelería 1.5 TR (1700W)', negocioId: 'papeleria_imperiarte', medidorId: 'med_2', wattsNominal: 1700, fase: 'A-B', rol: 'clima' },
  pap_luces: { key: 'pap_luces', nombre: 'Alumbrado LED Papelería (72W)', negocioId: 'papeleria_imperiarte', medidorId: 'med_2', wattsNominal: 72, fase: 'B', rol: 'turno_fijo' },

  // Bordados Veracruz (med_2 o med_4)
  bv_aemco_220: { key: 'bv_aemco_220', nombre: 'Bordadora Industrial AEMCO 4 Cabezas 220V (1800W)', negocioId: 'bordados_veracruz', medidorId: 'med_2', wattsNominal: 1800, fase: 'A-B', rol: 'produccion' },
  bv_melco_emc: { key: 'bv_melco_emc', nombre: 'Bordadora Industrial Melco EMC 6/4 (1500W)', negocioId: 'bordados_veracruz', medidorId: 'med_2', wattsNominal: 1500, fase: 'A', rol: 'produccion' },
  bv_ac: { key: 'bv_ac', nombre: 'Minisplit Inverter Bordados 1.5 TR (1700W)', negocioId: 'bordados_veracruz', medidorId: 'med_2', wattsNominal: 1700, fase: 'A-B', rol: 'clima' },

  // Taller de Costura Imperia (med_1 o med_5)
  tc_cortadora: { key: 'tc_cortadora', nombre: 'Cortadora de Tela Industrial de Disco (300W)', negocioId: 'taller_costura', medidorId: 'med_1', wattsNominal: 300, fase: 'A', rol: 'produccion' },
  tc_overlock_5h: { key: 'tc_overlock_5h', nombre: 'Máquina Overlock Industrial 5 Hilos (550W)', negocioId: 'taller_costura', medidorId: 'med_1', wattsNominal: 550, fase: 'A', rol: 'produccion' },
  tc_rectas_singer: { key: 'tc_rectas_singer', nombre: '2x Máquinas Recta Industrial Singer (1100W)', negocioId: 'taller_costura', medidorId: 'med_1', wattsNominal: 1100, fase: 'A', rol: 'produccion' },
  tc_collaretera_singer: { key: 'tc_collaretera_singer', nombre: 'Máquina Collaretera Industrial Singer (550W)', negocioId: 'taller_costura', medidorId: 'med_1', wattsNominal: 550, fase: 'B', rol: 'produccion' },
  tc_plancha_vapor: { key: 'tc_plancha_vapor', nombre: 'Plancha de Vapor con Caldera (1600W)', negocioId: 'taller_costura', medidorId: 'med_1', wattsNominal: 1600, fase: 'B', rol: 'produccion' },
  tc_ac: { key: 'tc_ac', nombre: 'Minisplit Inverter Taller Costura 1 TR (1150W)', negocioId: 'taller_costura', medidorId: 'med_1', wattsNominal: 1150, fase: 'A-B', rol: 'clima' },

  // Publi-Imperia (med_3 o med_6)
  pi_pc_diseno: { key: 'pi_pc_diseno', nombre: 'Workstation Diseño Gráfico i7/GPU (240W)', negocioId: 'taller_publi_imperia', medidorId: 'med_3', wattsNominal: 240, fase: 'A', rol: 'turno_fijo' },
  pi_epson: { key: 'pi_epson', nombre: 'Impresora Sublimación Epson L120 (20W)', negocioId: 'taller_publi_imperia', medidorId: 'med_3', wattsNominal: 20, fase: 'B', rol: 'produccion' },
  pi_plancha_tazas: { key: 'pi_plancha_tazas', nombre: 'Plancha Sublimación Tazas 11oz (350W)', negocioId: 'taller_publi_imperia', medidorId: 'med_3', wattsNominal: 350, fase: 'A', rol: 'produccion' },
  pi_plancha_plana: { key: 'pi_plancha_plana', nombre: 'Plancha Plana Sublimación/DTF (1000W)', negocioId: 'taller_publi_imperia', medidorId: 'med_3', wattsNominal: 1000, fase: 'A', rol: 'produccion' },
  pi_atomstack: { key: 'pi_atomstack', nombre: 'Grabadora y Cortadora Láser Atomstack A20 (120W)', negocioId: 'taller_publi_imperia', medidorId: 'med_3', wattsNominal: 120, fase: 'B', rol: 'produccion' },

  // Oficina Consorcio (med_3 — Clima, Smart TV 32", Laptop Diseño Gerencia)
  oc_ac_1tr: { key: 'oc_ac_1tr', nombre: 'Minisplit Clima Oficina Consorcio 1 TR (1150W)', negocioId: 'oficinas_consorcio', medidorId: 'med_3', wattsNominal: 1150, fase: 'A', rol: 'produccion' },
  oc_tv_32: { key: 'oc_tv_32', nombre: 'Smart TV 32" Oficina Consorcio (55W)', negocioId: 'oficinas_consorcio', medidorId: 'med_3', wattsNominal: 55, fase: 'B', rol: 'produccion' },
  oc_laptop_diseno: { key: 'oc_laptop_diseno', nombre: 'Laptop Diseño PC Oficina Consorcio (65W)', negocioId: 'oficinas_consorcio', medidorId: 'med_3', wattsNominal: 65, fase: 'A', rol: 'produccion' }
};

function buildInitialEquiposRuntime() {
  const runtime = {};
  Object.keys(EQUIPOS_OPERATIVOS_BASE).forEach((key) => {
    const eq = EQUIPOS_OPERATIVOS_BASE[key];
    const isAlwaysOn = eq.rol === 'continuo_24h';
    const isShiftOn = eq.rol === 'turno_fijo' || eq.rol === 'clima';
    const factorInicial = isAlwaysOn ? 0.45 : (eq.rol === 'clima' ? 0.60 : (eq.rol === 'turno_fijo' ? 0.75 : 0));
    runtime[key] = {
      ...eq,
      controlMode: 'AUTO', // 'AUTO' | 'MANUAL_ON' | 'MANUAL_OFF'
      estado: isAlwaysOn || isShiftOn ? 'STANDBY' : 'OFF', // 'OFF' | 'PREHEAT' | 'WORK' | 'STANDBY'
      wattsActuales: Math.round(eq.wattsNominal * factorInicial),
      segundosEncendidoHoy: 0,
      segundosEncendidoTotal: 0,
      kwhAcumulados: 0,
      operacionActiva: false,
      segundosEnOperacionActual: 0,
      kwhEnOperacionActual: 0,
      ...(key === 'hp_raspadora' ? { raspadosRestantesHielo: 10, maxRaspadosPorBloque: 10 } : {})
    };
  });
  return runtime;
}

function buildInitialStatsPorNegocio() {
  const stats = {};
  NEGOCIOS_ACTIVOS_IDS.forEach((negId) => {
    stats[negId] = {
      negocioId: negId,
      nombre: NEGOCIOS_ZONES_3D[negId].nombre,
      ingresosHoy: 0,
      ingresosTotales: 0,
      costoInsumosHoy: 0,
      costoInsumosTotales: 0,
      kwhHoy: 0,
      kwhMes: 0,
      kwhAcumulados: 0,
      ventasHoy: 0,
      ventasTotales: 0,
      productosVendidosCount: {},
      clientesAtendidos: 0,
      clientesSinCompra: 0
    };
  });
  stats.oficinas_consorcio = {
    negocioId: 'oficinas_consorcio',
    nombre: 'Oficina Consorcio',
    ingresosHoy: 0,
    ingresosTotales: 0,
    costoInsumosHoy: 0,
    costoInsumosTotales: 0,
    kwhHoy: 0,
    kwhMes: 0,
    kwhAcumulados: 0,
    ventasHoy: 0,
    ventasTotales: 0,
    productosVendidosCount: {},
    clientesAtendidos: 0,
    clientesSinCompra: 0
  };
  return stats;
}

function createEmployeeEntity(negId, index, customMeta = {}) {
  const plantilla = PLANTILLA_DEFAULT_NEGOCIOS[negId]?.empleados || [];
  const meta = plantilla[index] || customMeta || {};
  const id = meta.id || `${negId}_emp_${index + 1}`;
  return {
    id,
    sims2Id: `emp_${negId}_${index}`,
    negocioId: negId,
    index,
    nombre: meta.nombre || `${NEGOCIOS_ZONES_3D[negId]?.nombre?.split(' ')[0] || 'Staff'} #${index + 1}`,
    puesto: meta.puesto || 'Operador',
    posicionLocal: [(index % 2 === 0 ? -0.4 : 0.9), 0, -0.7 - index * 0.35],
    targetWaypoint: 'barra_vendedor',
    rutaActual: [],
    estado: 'IDLE_TASK', // 'IDLE_TASK' | 'ATENDIENDO_CLIENTE' | 'ATENDIENDO_QUEUE' | 'EN_COMIDA' | 'RUTINA_HUMANA'
    idleTaskIndex: index,
    idleElapsedSec: 0,
    textoAccion: 'Listo en mostrador',
    itemEnMano: null,
    clienteActualId: null,
    queueOrderActual: null,
    recetaActual: null,
    pasoActualIndex: 0,
    pasoElapsedSec: 0,
    pasoCodigoActual: null,
    pasoDuracionActual: 1.0,
    animacionActual: null,
    efectoVisualActual: null,
    // Reglas laborales y humanas universales (1h comida 1-2 ó 2-3 PM + 1..5 idas al baño + ocio celular sin clientes)
    lunchStartHour: index % 2 === 0 ? (negId === 'imperia_uniformes' || negId === 'taller_costura' ? 13 : 14) : 13,
    humanRoutineActual: null,
    humanRoutineElapsedSec: 0,
    restroomsToday: 0,
    maxRestroomsToday: 2 + (index % 4), // 2..5 por día
    nextRestroomTriggerSec: 1800 + index * 900,
    workSecondsToday: 0,
    // Estado y mutex de baño
    isInsideRestroom: false,
    isWaitingRestroom: false,
    restroomNeedType: null,
    restroomElapsedSec: 0,
    restroomDurationSec: 0,
    imperiaOpeningDoneToday: false,
    imperiaClosingDoneToday: false,
    imperiaOpenPhaseIndex: 0,
    imperiaLastDayNum: 15,
    imperiaDaysWorkedCount: 0
  };
}

function buildInitialEmpleadosLista() {
  const listMap = {};
  NEGOCIOS_ACTIVOS_IDS.forEach((negId) => {
    listMap[negId] = [createEmployeeEntity(negId, 0)];
  });
  return listMap;
}

function buildInitialEmpleadosFromLista(listMap) {
  const map = {};
  NEGOCIOS_ACTIVOS_IDS.forEach((negId) => {
    map[negId] = (listMap[negId] && listMap[negId][0]) || createEmployeeEntity(negId, 0);
  });
  return map;
}

function buildInitialGerenteState() {
  const zoneCenter = ALL_ZONES_3D.taller_publi_imperia.center;
  const wpLocal = WAYPOINTS_POR_NEGOCIO.taller_publi_imperia.eq_pi_pc_diseno;
  return {
    id: 'gerente',
    sims2Id: 'gerente',
    nombre: 'Alex (Gerente General)',
    currentZoneId: 'taller_publi_imperia',
    targetZoneId: 'taller_publi_imperia',
    targetWaypoint: 'eq_pi_pc_diseno',
    posicionLocal: [...wpLocal],
    worldPos: [zoneCenter[0] + wpLocal[0], 0, zoneCenter[2] + wpLocal[2]],
    rutaLocal: [],
    taskType: 'DESIGN_PUBLI',
    animacionActual: 'OPERATE_TPV',
    textoAccion: '🎨 Diseñando vectores en Publi-Impresos (Rol principal)',
    isOutsideSupplyRun: false,
    supplyProveedor: null,
    phaseElapsedSec: 0,
    phaseDurationSec: 45,
    autoTaskIndex: 0,
    manualLockUntilSimMs: 0,
    acOfficeActive: false
  };
}

function buildInitialFamiliaState() {
  const ofCenter = ALL_ZONES_3D.oficinas_consorcio.center;
  const wpOf = WAYPOINTS_POR_NEGOCIO.oficinas_consorcio;
  return {
    visitActive: false,
    lastVisitDay: 14,
    locationZone: 'oficinas_consorcio', // 'oficinas_consorcio' | 'hawaiian_paradise'
    activityMode: 'OFICINA_TV', // 'OFICINA_TV' | 'OFICINA_COMER' | 'OFICINA_BANO' | 'COMER_HAWAIIAN'
    eatingWithManager: false,
    visitEndSimMs: 0,
    miembros: [
      {
        id: 'familia_esposa',
        sims2Id: 'familia_esposa',
        nombre: 'Esposa',
        currentZoneId: 'oficinas_consorcio',
        posicionLocal: [...wpOf.sofa_tv_1],
        worldPos: [ofCenter[0] + wpOf.sofa_tv_1[0], 0, ofCenter[2] + wpOf.sofa_tv_1[2]],
        targetWaypoint: 'sofa_tv_1',
        rutaLocal: [],
        animacionActual: 'WATCH_TV_SOFA',
        textoAccion: 'En casa'
      },
      {
        id: 'familia_alex',
        sims2Id: 'familia_alex',
        nombre: 'Alex Jr. (12 años)',
        currentZoneId: 'oficinas_consorcio',
        posicionLocal: [...wpOf.sofa_tv_2],
        worldPos: [ofCenter[0] + wpOf.sofa_tv_2[0], 0, ofCenter[2] + wpOf.sofa_tv_2[2]],
        targetWaypoint: 'sofa_tv_2',
        rutaLocal: [],
        animacionActual: 'WATCH_TV_SOFA',
        textoAccion: 'En casa'
      },
      {
        id: 'familia_barbara',
        sims2Id: 'familia_barbara',
        nombre: 'Bárbara (8 años)',
        currentZoneId: 'oficinas_consorcio',
        posicionLocal: [...wpOf.sofa_tv_3],
        worldPos: [ofCenter[0] + wpOf.sofa_tv_3[0], 0, ofCenter[2] + wpOf.sofa_tv_3[2]],
        targetWaypoint: 'sofa_tv_3',
        rutaLocal: [],
        animacionActual: 'WATCH_TV_SOFA',
        textoAccion: 'En casa'
      }
    ]
  };
}

function formatTimeHHMMSS(dateObj) {
  const hh = String(dateObj.getHours()).padStart(2, '0');
  const mm = String(dateObj.getMinutes()).padStart(2, '0');
  const ss = String(dateObj.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

function formatDateShort(dateObj) {
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${String(dateObj.getDate()).padStart(2, '0')} ${meses[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
}

const initialListaEmpleados = buildInitialEmpleadosLista();

export const useGameStore = create((set, get) => ({
  // Reloj de simulación: Viernes 15 de Mayo 2026 (Quincena + Temporada de Calor en Veracruz) 10:15:00 AM
  simTimeMs: new Date(2026, 4, 15, 10, 15, 0).getTime(),
  diasSimuladosCount: 1,
  ultimoDiaRegistrado: 15,
  ultimoMesRegistrado: 4,
  timeScale: 1, // 0=Pausa, 1=Tiempo Real (1s=1s), 10=10x, 60=1min/s, 600=1h en 6s
  escenarioGlobal: 'medio', // 'bajo' | 'tablas' | 'medio' | 'alto' | 'muy_alto'
  cashPopups: [], // Popups flotantes StarCraft +$50 arriba de la caja TPV

  // Cámara y foco de vista 3D
  focusedNegocioId: 'hawaiian_paradise', // 'ALL_CONSORCIO' | negocioId | 'oficinas_consorcio' | 'CFE_METER_INSPECT'
  focusedMedidorId: 'med_3',

  // Modales del HUD
  isKpiModalOpen: false,
  isCfeReceiptModalOpen: false,
  isInventoryDrawerOpen: false,
  isMarketingModalOpen: false,
  isCasStudioOpen: false,
  casTargetActorId: 'gerente',

  // Personalización 3D The Sims 2 CAS para Gerente, Familia y Empleados
  sims2AvataresConfig: createDefaultSims2Profiles(),

  // Sincronización con Eléctrico Alacio
  cloudConnected: false,
  medidores: [
    { id: 'med_1', numero: 1, nombre: 'Medidor 1 — Imperia & Costura', forzarTrifasico: false },
    { id: 'med_2', numero: 2, nombre: 'Medidor 2 — Papelería & Bordados', forzarTrifasico: false },
    { id: 'med_3', numero: 3, nombre: 'Medidor 3 — Hawaiian, Publi & Consorcio', forzarTrifasico: false }
  ],
  aparatosElectricoAlacio: [],
  equiposRuntime: buildInitialEquiposRuntime(),

  // Inventario de materia prima por negocio
  inventarioPorNegocio: structuredClone(MATERIAS_PRIMAS_POR_NEGOCIO),
  autoRestockEnabled: true,

  // Campañas publicitarias activas
  campanasActivas: {
    hawaiian_paradise: { activa: true, nombre: 'Promo Calor Universitario 2x1 Raspados & Crepas', intensidadPct: 35, costoDiario: 85 },
    imperia_uniformes: { activa: true, nombre: 'Catálogo Clínico & PermaChef Quincena', intensidadPct: 30, costoDiario: 110 },
    papeleria_imperiarte: { activa: false, nombre: 'Impresión Tesis y Entregas Finales', intensidadPct: 25, costoDiario: 60 },
    bordados_veracruz: { activa: false, nombre: 'Bordado Corporativo Express', intensidadPct: 25, costoDiario: 70 },
    taller_costura: { activa: false, nombre: 'Maquila Uniformes Clínicos e Industriales', intensidadPct: 25, costoDiario: 75 },
    taller_publi_imperia: { activa: true, nombre: 'Regalos Personalizados Tazas, Termos & DTF', intensidadPct: 30, costoDiario: 80 }
  },

  // Agentes 3D: Empleados (Multi-empleado 1..4), Gerente, Familia y Queues Inter-Negocio
  empleadosListaPorNegocio: initialListaEmpleados,
  empleadosPorNegocio: buildInitialEmpleadosFromLista(initialListaEmpleados),
  gerenteState: buildInitialGerenteState(),
  familiaState: buildInitialFamiliaState(),
  workQueuesPorNegocio: {
    bordados_veracruz: [],
    taller_costura: [],
    taller_publi_imperia: []
  },
  waitingPartsQueuePubli: [],
  pedidosListosImperia: [],
  almacenB2BPubli: [],
  cotizacionesPendientesGerente: [],

  clientesColaPorNegocio: {
    hawaiian_paradise: [],
    imperia_uniformes: [],
    papeleria_imperiarte: [],
    bordados_veracruz: [],
    taller_costura: [],
    taller_publi_imperia: []
  },
  clientesPostCompraPorNegocio: {
    hawaiian_paradise: [],
    imperia_uniformes: [],
    papeleria_imperiarte: [],
    bordados_veracruz: [],
    taller_costura: [],
    taller_publi_imperia: []
  },
  // Mutex de baños (1 persona a la vez por local)
  banoOcupadoPorNegocio: {
    hawaiian_paradise: null,
    imperia_uniformes: null,
    papeleria_imperiarte: null,
    bordados_veracruz: null,
    taller_costura: null,
    taller_publi_imperia: null,
    oficinas_consorcio: null
  },
  spawnAccumulators: {
    hawaiian_paradise: 0.72,
    imperia_uniformes: 0.65,
    papeleria_imperiarte: 0.55,
    bordados_veracruz: 0.45,
    taller_costura: 0.40,
    taller_publi_imperia: 0.50
  },

  statsPorNegocio: buildInitialStatsPorNegocio(),
  historialDiario: [],
  liveLogs: [
    {
      id: 'log_init_1',
      fechaStr: '15 May 2026',
      horaStr: '10:15:00',
      negocioId: 'consorcio',
      tipo: 'system',
      mensaje: '⚡ Conectado bidireccionalmente con Eléctrico Alacio. Motores Sims 2 CAS, Queues Inter-Negocio, Gerente y Familia activos.'
    },
    {
      id: 'log_init_2',
      fechaStr: '15 May 2026',
      horaStr: '10:15:01',
      negocioId: 'hawaiian_paradise',
      tipo: 'info',
      mensaje: '🍧 Hawaiian Paradise abierto: Máquina de raspados con manivela izquierda, Crepera (3000W) y Gaggia listas.'
    }
  ],

  // --- ACCIONES DE CONFIGURACIÓN, NAVEGACIÓN, SIMS 2 CAS, GERENTE Y FAMILIA ---
  setTimeScale: (scale) => set({ timeScale: scale }),
  setFocusedNegocioId: (negId) => set({ focusedNegocioId: negId }),
  setFocusedMedidorId: (medId) => set({ focusedMedidorId: medId, focusedNegocioId: 'CFE_METER_INSPECT' }),
  setEscenarioGlobal: (esc) => set({ escenarioGlobal: esc }),

  setKpiModalOpen: (open) => set({ isKpiModalOpen: open }),
  setCfeReceiptModalOpen: (open) => set({ isCfeReceiptModalOpen: open }),
  setInventoryDrawerOpen: (open) => set({ isInventoryDrawerOpen: open }),
  setMarketingModalOpen: (open) => set({ isMarketingModalOpen: open }),
  setAutoRestockEnabled: (enabled) => set({ autoRestockEnabled: enabled }),

  setCasStudioOpen: (open, actorId = 'gerente') =>
    set((state) => ({
      isCasStudioOpen: open,
      casTargetActorId: actorId || state.casTargetActorId || 'gerente'
    })),

  updateSims2AvatarConfig: (actorId, partialConfig) =>
    set((state) => {
      const existing = state.sims2AvataresConfig[actorId] || createDefaultSims2Profiles().gerente;
      const merged = {
        ...existing,
        ...partialConfig,
        faceSliders: {
          ...(existing.faceSliders || {}),
          ...(partialConfig.faceSliders || {})
        }
      };
      return {
        sims2AvataresConfig: {
          ...state.sims2AvataresConfig,
          [actorId]: merged
        }
      };
    }),

  addEmployeeToNegocio: (negocioId) =>
    set((state) => {
      const current = state.empleadosListaPorNegocio[negocioId] || [];
      if (current.length >= 4) return {};
      const nextIdx = current.length;
      const newEmp = createEmployeeEntity(negocioId, nextIdx);
      const nextList = [...current, newEmp];
      const baseAvatar = state.sims2AvataresConfig[`emp_${negocioId}_0`] || createDefaultSims2Profiles().gerente;
      const newAvatar = {
        ...baseAvatar,
        id: newEmp.sims2Id,
        displayName: newEmp.nombre,
        roleTag: NEGOCIOS_ZONES_3D[negocioId]?.nombre || negocioId,
        baseModel: nextIdx % 2 === 1 ? (baseAvatar.baseModel === 'male_base' ? 'female_base' : 'male_base') : 'female_casual',
        gender: nextIdx % 2 === 1 ? (baseAvatar.gender === 'M' ? 'F' : 'M') : 'F',
        hairStyle: nextIdx % 2 === 1 ? 'ondulado_casual' : 'corto_ejecutivo',
        hasAura: false,
        showPlumbob: false
      };
      const simDate = new Date(state.simTimeMs);
      return {
        empleadosListaPorNegocio: { ...state.empleadosListaPorNegocio, [negocioId]: nextList },
        sims2AvataresConfig: { ...state.sims2AvataresConfig, [newEmp.sims2Id]: newAvatar },
        liveLogs: [
          {
            id: `log_emp_add_${Date.now()}`,
            fechaStr: formatDateShort(simDate),
            horaStr: formatTimeHHMMSS(simDate),
            negocioId,
            tipo: 'system',
            mensaje: `👥 Contratado ${newEmp.nombre} en ${NEGOCIOS_ZONES_3D[negocioId]?.nombre} (${nextList.length}/4 empleados activos).`
          },
          ...state.liveLogs.slice(0, 140)
        ]
      };
    }),

  removeEmployeeFromNegocio: (negocioId) =>
    set((state) => {
      const current = state.empleadosListaPorNegocio[negocioId] || [];
      if (current.length <= 1) return {};
      const removed = current[current.length - 1];
      const nextList = current.slice(0, -1);
      return {
        empleadosListaPorNegocio: { ...state.empleadosListaPorNegocio, [negocioId]: nextList },
        empleadosPorNegocio: { ...state.empleadosPorNegocio, [negocioId]: nextList[0] },
        liveLogs: [
          {
            id: `log_emp_rem_${Date.now()}`,
            fechaStr: formatDateShort(new Date(state.simTimeMs)),
            horaStr: formatTimeHHMMSS(new Date(state.simTimeMs)),
            negocioId,
            tipo: 'info',
            mensaje: `➖ Desasignado ${removed.nombre} de ${NEGOCIOS_ZONES_3D[negocioId]?.nombre}.`
          },
          ...state.liveLogs.slice(0, 140)
        ]
      };
    }),

  setEmployeeLunchSlot: (negocioId, empId, startHour) =>
    set((state) => {
      const list = state.empleadosListaPorNegocio[negocioId] || [];
      const h = Number(startHour) === 13 ? 13 : 14;
      const nextList = list.map((e) => (e.id === empId ? { ...e, lunchStartHour: h } : e));
      return {
        empleadosListaPorNegocio: { ...state.empleadosListaPorNegocio, [negocioId]: nextList },
        empleadosPorNegocio: { ...state.empleadosPorNegocio, [negocioId]: nextList[0] || state.empleadosPorNegocio[negocioId] }
      };
    }),

  triggerCustomerRestroomRequest: (negocioId, customerId, needType = 'manos') =>
    set((state) => {
      const colas = { ...state.clientesColaPorNegocio };
      const list = [...(colas[negocioId] || [])];
      const durations = { manos: 10, del_1: 20, del_2: 45 };
      const dur = durations[needType] || 15;
      const idx = list.findIndex((c) => c.id === customerId);
      if (idx !== -1) {
        list[idx] = {
          ...list[idx],
          solicitoBano: true,
          necesidadBano: needType,
          tiempoBanoRestanteSeg: dur,
          banoCompletado: false,
          isInsideRestroom: false,
          isWaitingRestroom: false
        };
        colas[negocioId] = list;
      }
      return { clientesColaPorNegocio: colas };
    }),

  triggerEmployeeRestroomRequest: (negocioId, empId) =>
    set((state) => {
      const empMap = { ...state.empleadosListaPorNegocio };
      const list = [...(empMap[negocioId] || [])];
      const idx = list.findIndex((e) => e.id === empId);
      if (idx !== -1) {
        list[idx] = {
          ...list[idx],
          estado: 'RUTINA_HUMANA',
          clienteActualId: null,
          recetaActual: null,
          humanRoutineActual: UNIVERSAL_HUMAN_ROUTINES[0],
          humanRoutineElapsedSec: 0,
          isInsideRestroom: false,
          isWaitingRestroom: false
        };
        empMap[negocioId] = list;
      }
      return {
        empleadosListaPorNegocio: empMap,
        empleadosPorNegocio: { ...state.empleadosPorNegocio, [negocioId]: list[0] || state.empleadosPorNegocio[negocioId] }
      };
    }),

  commandManagerAction: (targetZoneId, taskType = 'SUPERVISE', customText = null) =>
    set((state) => {
      // Regla estricta del dueño: en Taller de Costura NUNCA cose; solo supervisa, entrega tela o da instrucciones
      const resolvedTask = targetZoneId === 'taller_costura' && taskType === 'SEW' ? 'SUPERVISE_COSTURA' : taskType;
      const wpDefaults = {
        taller_publi_imperia: 'eq_pi_pc_diseno',
        oficinas_consorcio: 'eq_oc_laptop_diseno',
        hawaiian_paradise: 'mesa_1_silla_1',
        papeleria_imperiarte: 'eq_pap_docucolor',
        imperia_uniformes: 'caja_tpv_vendedor',
        taller_costura: 'raw_mesa_corte_telas',
        bordados_veracruz: 'raw_mesa_bastidores'
      };
      const defaultMsgMap = {
        taller_publi_imperia: '🎨 Gerente: Diseñando / planchando prendas en Publi-Impresos',
        oficinas_consorcio: '💻 Gerente: Encendiendo Clima A/C y diseñando en Oficina',
        hawaiian_paradise: '🍽️ Gerente: Visitando mesas y supervisando Hawaiian Paradise',
        papeleria_imperiarte: '🖨️ Gerente: Imprimiendo en DocuColor y revisando stock Papelería',
        imperia_uniformes: '📋 Gerente: Revisando caja, pedidos, cotizaciones y estantes Imperia',
        taller_costura: '🧵 Gerente: Llevando tela y supervisando costura (sin coser)',
        bordados_veracruz: '🧵 Gerente: Supervisando matrices y pedidos en Bordados'
      };
      const simDate = new Date(state.simTimeMs);
      return {
        focusedNegocioId: ALL_ZONES_3D[targetZoneId] ? targetZoneId : state.focusedNegocioId,
        gerenteState: {
          ...state.gerenteState,
          targetZoneId,
          targetWaypoint: wpDefaults[targetZoneId] || 'barra_vendedor',
          taskType: resolvedTask,
          isOutsideSupplyRun: taskType === 'PICKUP_SUPPLIES',
          textoAccion: customText || defaultMsgMap[targetZoneId] || '👔 Gerente en supervisión',
          manualLockUntilSimMs: state.simTimeMs + 180 * 1000
        },
        liveLogs: [
          {
            id: `log_mgr_${Date.now()}`,
            fechaStr: formatDateShort(simDate),
            horaStr: formatTimeHHMMSS(simDate),
            negocioId: targetZoneId,
            tipo: 'system',
            mensaje: customText || defaultMsgMap[targetZoneId] || `👔 Gerente dirigido a ${targetZoneId}`
          },
          ...state.liveLogs.slice(0, 140)
        ]
      };
    }),

  triggerFamiliaVisit: (goEatHawaiian = true) =>
    set((state) => {
      const targetZone = goEatHawaiian ? 'hawaiian_paradise' : 'oficinas_consorcio';
      const center = ALL_ZONES_3D[targetZone].center;
      const wpList = goEatHawaiian
        ? ['mesa_1_silla_1', 'mesa_2_silla_1', 'mesa_2_silla_2']
        : ['sofa_tv_1', 'sofa_tv_2', 'sofa_tv_3'];
      const simDate = new Date(state.simTimeMs);
      const nextMiembros = state.familiaState.miembros.map((m, i) => ({
        ...m,
        currentZoneId: targetZone,
        targetWaypoint: wpList[i] || 'espera_1',
        posicionLocal: goEatHawaiian ? [0, 0, 4.4] : [0, 0, 3.2],
        worldPos: [center[0], 0, center[2] + (goEatHawaiian ? 4.4 : 3.2)],
        animacionActual: goEatHawaiian ? 'EAT_AT_TABLE' : 'WATCH_TV_SOFA',
        textoAccion: goEatHawaiian ? '🍧 Comiendo en Hawaiian Paradise con papá' : '📺 Viendo tele en el clima de la Oficina'
      }));
      const startMs = goEatHawaiian ? state.simTimeMs : state.simTimeMs - 31 * 60 * 1000;
      return {
        focusedNegocioId: targetZone,
        familiaState: {
          ...state.familiaState,
          visitActive: true,
          lastVisitDay: simDate.getDate(),
          visitStartSimMs: startMs,
          locationZone: targetZone,
          activityMode: goEatHawaiian ? 'COMER_HAWAIIAN' : 'OFICINA_TV',
          eatingWithManager: goEatHawaiian,
          visitEndSimMs: state.simTimeMs + (goEatHawaiian ? 90 : 59) * 60 * 1000,
          miembros: nextMiembros
        },
        gerenteState: {
          ...state.gerenteState,
          currentZoneId: targetZone,
          targetZoneId: targetZone,
          targetWaypoint: goEatHawaiian ? 'mesa_1_silla_2' : 'sofa_tv_1',
          taskType: goEatHawaiian ? 'EAT_WITH_FAMILY' : 'WATCH_TV_SOFA',
          animacionActual: goEatHawaiian ? 'EAT_AT_TABLE' : 'WATCH_TV_SOFA',
          isOutsideSupplyRun: false,
          textoAccion: goEatHawaiian
            ? '👨‍👩‍👧‍👦 Comiendo en Hawaiian Paradise con Esposa, Alex y Bárbara'
            : '📺 Viendo tele con mi familia en el clima de la Oficina',
          manualLockUntilSimMs: state.simTimeMs + (goEatHawaiian ? 90 : 59) * 60 * 1000
        },
        equiposRuntime: {
          ...state.equiposRuntime,
          oc_ac_1tr: {
            ...state.equiposRuntime.oc_ac_1tr,
            estado: goEatHawaiian ? 'OFF' : 'WORK',
            wattsActuales: goEatHawaiian ? 0 : 1150,
            operacionActiva: !goEatHawaiian
          },
          oc_tv_32: {
            ...state.equiposRuntime.oc_tv_32,
            estado: goEatHawaiian ? 'OFF' : 'WORK',
            wattsActuales: goEatHawaiian ? 0 : 55,
            operacionActiva: !goEatHawaiian
          }
        },
        liveLogs: [
          {
            id: `log_fam_${Date.now()}`,
            fechaStr: formatDateShort(simDate),
            horaStr: formatTimeHHMMSS(simDate),
            negocioId: targetZone,
            tipo: 'client',
            mensaje: goEatHawaiian
              ? '👨‍👩‍👧‍👦 15:15 hrs — Llegó Esposa con Alex (12) y Bárbara (8) a comer a Hawaiian Paradise (30 min) y luego a la Oficina (1 hr).'
              : '👨‍👩‍👧‍👦 Familia y Gerente en Oficina Consorcio (Clima A/C + Smart TV encendidos).'
          },
          ...state.liveLogs.slice(0, 140)
        ]
      };
    }),

  triggerMonthlyInventory: () =>
    set((state) => {
      const simDate = new Date(state.simTimeMs);
      return {
        focusedNegocioId: 'imperia_uniformes',
        gerenteState: {
          ...state.gerenteState,
          targetZoneId: 'imperia_uniformes',
          targetWaypoint: 'rack_gastronomia',
          taskType: 'MONTHLY_INVENTORY',
          textoAccion: '📦 Gerente supervisando Inventario Completo Mensual de Imperia Uniformes',
          manualLockUntilSimMs: state.simTimeMs + 120 * 1000
        },
        liveLogs: [
          {
            id: `log_inv_m_${Date.now()}`,
            fechaStr: formatDateShort(simDate),
            horaStr: formatTimeHHMMSS(simDate),
            negocioId: 'imperia_uniformes',
            tipo: 'stock',
            mensaje: '📦 Inventario Completo Mensual iniciado en Imperia Uniformes en presencia del Gerente (revisando los 6 estantes por rama).'
          },
          ...state.liveLogs.slice(0, 140)
        ]
      };
    }),

  setSimulationDateTime: (year, monthIndex, day, hour = 10, minute = 0) => {
    const newDate = new Date(year, monthIndex, day, hour, minute, 0);
    set((state) => ({
      simTimeMs: newDate.getTime(),
      ultimoDiaRegistrado: newDate.getDate(),
      liveLogs: [
        {
          id: `log_date_${Date.now()}`,
          fechaStr: formatDateShort(newDate),
          horaStr: formatTimeHHMMSS(newDate),
          negocioId: 'consorcio',
          tipo: 'system',
          mensaje: `📅 Fecha ajustada a ${formatDateShort(newDate)} ${formatTimeHHMMSS(newDate)}.`
        },
        ...state.liveLogs.slice(0, 140)
      ]
    }));
  },

  toggleCampaign: (negocioId) => {
    set((state) => {
      const actual = state.campanasActivas[negocioId] || { activa: false, nombre: 'Campaña Digital', intensidadPct: 30, costoDiario: 80 };
      return {
        campanasActivas: {
          ...state.campanasActivas,
          [negocioId]: { ...actual, activa: !actual.activa }
        }
      };
    });
  },

  updateCampaignIntensity: (negocioId, intensidadPct) => {
    set((state) => {
      const actual = state.campanasActivas[negocioId];
      if (!actual) return {};
      return {
        campanasActivas: {
          ...state.campanasActivas,
          [negocioId]: { ...actual, intensidadPct: Number(intensidadPct) || 25 }
        }
      };
    });
  },

  /**
   * Inicializa la sincronización en vivo con Eléctrico Alacio y lanza los primeros clientes de demostración
   */
  initializeFromElectricoAlacio: async () => {
    try {
      const fullState = await simCitySyncService.loadConsorcioFullState('consorcio_general');

      if (fullState.recetasEntrenadas) {
        useTrainingStore.getState().loadRecetasFromCloud(fullState.recetasEntrenadas);
      }
      if (fullState.escena3DConfig) {
        useSceneEditorStore.getState().loadEscenaConfigFromCloud(fullState.escena3DConfig);
      }

      set((state) => {
        const nextRuntime = { ...state.equiposRuntime };
        // Sincronizar medidorId de cada aparato según la base de datos de Eléctrico Alacio
        if (Array.isArray(fullState.aparatos)) {
          fullState.aparatos.forEach((ap) => {
            const { negocioId } = identificarNegocioDeAparato(ap);
            Object.keys(nextRuntime).forEach((eqKey) => {
              if (nextRuntime[eqKey].negocioId === negocioId && ap.medidorId) {
                nextRuntime[eqKey] = {
                  ...nextRuntime[eqKey],
                  medidorId: ap.medidorId
                };
              }
            });
          });
        }

        return {
          cloudConnected: true,
          medidores: fullState.medidores || state.medidores,
          aparatosElectricoAlacio: fullState.aparatos || [],
          equiposRuntime: nextRuntime
        };
      });

      // Suscribirse a cambios en tiempo real hechos desde Eléctrico Alacio
      simCitySyncService.subscribeToElectricoAlacio('consorcio_general', (remoteData) => {
        if (remoteData.medidores) {
          set({ medidores: remoteData.medidores });
        }
        if (remoteData.aparatos) {
          set({ aparatosElectricoAlacio: remoteData.aparatos });
        }
        if (remoteData.recetasEntrenadas) {
          useTrainingStore.getState().loadRecetasFromCloud(remoteData.recetasEntrenadas);
        }
      });

      // Generar un cliente inicial pidiendo un Raspado de Limón en Hawaiian Paradise y un cliente en Imperia Uniformes
      get().spawnCustomerNow('hawaiian_paradise', 'hp_raspado');
      get().spawnCustomerNow('imperia_uniformes', 'imp_uniforme_clinico_completo');
    } catch (err) {
      console.warn('Error inicializando desde Eléctrico Alacio:', err);
    }
  },

  /**
   * Permite al jugador encender o apagar manualmente cualquier aparato eléctrico ('AUTO' | 'MANUAL_ON' | 'MANUAL_OFF')
   */
  setEquipmentControlMode: (equipoKey, mode) => {
    set((state) => {
      const eq = state.equiposRuntime[equipoKey];
      if (!eq) return {};
      const nextEstado = mode === 'MANUAL_ON' ? 'WORK' : (mode === 'MANUAL_OFF' ? 'OFF' : 'STANDBY');
      const nextWatts = mode === 'MANUAL_ON' ? eq.wattsNominal : (mode === 'MANUAL_OFF' ? 0 : Math.round(eq.wattsNominal * 0.25));
      const simDate = new Date(state.simTimeMs);

      return {
        equiposRuntime: {
          ...state.equiposRuntime,
          [equipoKey]: {
            ...eq,
            controlMode: mode,
            estado: nextEstado,
            wattsActuales: nextWatts
          }
        },
        liveLogs: [
          {
            id: `log_eq_${Date.now()}_${Math.random()}`,
            fechaStr: formatDateShort(simDate),
            horaStr: formatTimeHHMMSS(simDate),
            negocioId: eq.negocioId,
            tipo: 'energy',
            mensaje: `🔌 [${eq.nombre}] cambiado manualmente a modo ${mode} (${nextWatts}W en ${eq.medidorId.toUpperCase()}).`
          },
          ...state.liveLogs.slice(0, 140)
        ]
      };
    });
  },

  /**
   * Reabastece manualmente la materia prima de un negocio
   */
  restockInsumo: (negocioId, insumoId) => {
    set((state) => {
      const lista = state.inventarioPorNegocio[negocioId] || [];
      let costoCompra = 0;
      let nombreInsumo = '';
      const nuevaLista = lista.map((item) => {
        if (item.id !== insumoId) return item;
        const faltante = Math.max(item.loteRecompra, item.stockMaximo - item.stockActual);
        costoCompra = faltante * item.costoUnitario;
        nombreInsumo = item.nombre;
        return {
          ...item,
          stockActual: Math.round((item.stockActual + faltante) * 100) / 100
        };
      });

      const statsNeg = state.statsPorNegocio[negocioId];
      const simDate = new Date(state.simTimeMs);

      return {
        inventarioPorNegocio: {
          ...state.inventarioPorNegocio,
          [negocioId]: nuevaLista
        },
        statsPorNegocio: {
          ...state.statsPorNegocio,
          [negocioId]: {
            ...statsNeg,
            costoInsumosTotales: statsNeg.costoInsumosTotales + costoCompra
          }
        },
        liveLogs: [
          {
            id: `log_restock_${Date.now()}`,
            fechaStr: formatDateShort(simDate),
            horaStr: formatTimeHHMMSS(simDate),
            negocioId,
            tipo: 'stock',
            mensaje: `📦 Reabastecido [${nombreInsumo}] en ${NEGOCIOS_ZONES_3D[negocioId]?.nombre} (-$${costoCompra.toFixed(2)} MXN).`
          },
          ...state.liveLogs.slice(0, 140)
        ]
      };
    });
  },

  /**
   * Lanza inmediatamente un cliente hacia un negocio con un producto específico (ej. Raspado de Limón).
   * Publi-Impresos, Taller de Costura y Bordados Veracruz no atienden al público en general.
   */
  spawnCustomerNow: (negocioId = 'hawaiian_paradise', productoId = null) => {
    if (negocioId === 'publi_impresos' || negocioId === 'taller_costura' || negocioId === 'bordados_veracruz') {
      set((state) => {
        const simDate = new Date(state.simTimeMs);
        return {
          liveLogs: [
            {
              id: `log_no_public_${Date.now()}`,
              fechaStr: formatDateShort(simDate),
              horaStr: formatTimeHHMMSS(simDate),
              negocioId,
              tipo: 'system',
              mensaje: `🚫 ${NEGOCIOS_ZONES_3D[negocioId]?.nombre || negocioId} es taller interno (no atiende público general; solo empleados, gerente y familia).`
            },
            ...state.liveLogs.slice(0, 140)
          ]
        };
      });
      return;
    }
    set((state) => {
      const simDate = new Date(state.simTimeMs);
      const condiciones = evaluarCondicionesDemanda(simDate, state.campanasActivas, state.escenarioGlobal);
      const nuevoCliente = crearEntidadCliente(negocioId, condiciones, productoId);
      const colaActual = state.clientesColaPorNegocio[negocioId] || [];
      if (colaActual.length >= 5) return {};

      return {
        clientesColaPorNegocio: {
          ...state.clientesColaPorNegocio,
          [negocioId]: [...colaActual, nuevoCliente]
        },
        liveLogs: [
          {
            id: `log_spawn_${nuevoCliente.id}`,
            fechaStr: formatDateShort(simDate),
            horaStr: formatTimeHHMMSS(simDate),
            negocioId,
            tipo: 'client',
            mensaje: `🚶 ${nuevoCliente.nombre} (${nuevoCliente.arquetipoNombre}) entró a ${NEGOCIOS_ZONES_3D[negocioId]?.nombre} buscando ${nuevoCliente.productoDeseado.nombre}.`
          },
          ...state.liveLogs.slice(0, 140)
        ]
      };
    });
  },

  /**
   * TICK PRINCIPAL DE SIMULACIÓN EN TIEMPO REAL (60 FPS desde GameCanvas3D / TimeEngine)
   */
  advanceSimulationTick: (deltaRealSec) => {
    const state = get();
    if (state.timeScale <= 0) return;

    // Limitar deltaRealSec para evitar saltos bruscos al cambiar de pestaña
    const clampedRealDt = Math.min(deltaRealSec, 0.1);
    const simDeltaSec = clampedRealDt * state.timeScale;
    const nextSimTimeMs = state.simTimeMs + simDeltaSec * 1000;
    const simDate = new Date(nextSimTimeMs);
    const simHour = simDate.getHours();

    const condiciones = evaluarCondicionesDemanda(simDate, state.campanasActivas, state.escenarioGlobal);
    const recetasEntrenadas = useTrainingStore.getState().recetasEntrenadas;
    const collisionBlocksMap = useSceneEditorStore.getState().collisionBlocksByNegocio;

    const nextEmpleadosLista = { ...state.empleadosListaPorNegocio };
    const nextEmpleados = { ...state.empleadosPorNegocio };
    const nextColas = { ...state.clientesColaPorNegocio };
    const nextPostCompra = { ...state.clientesPostCompraPorNegocio };
    const nextSpawnAcc = { ...state.spawnAccumulators };
    const nextStats = { ...state.statsPorNegocio };
    const nextInventario = { ...state.inventarioPorNegocio };
    const nextEquipos = { ...state.equiposRuntime };
    const nextWorkQueues = {
      bordados_veracruz: [...(state.workQueuesPorNegocio?.bordados_veracruz || [])],
      taller_costura: [...(state.workQueuesPorNegocio?.taller_costura || [])],
      taller_publi_imperia: [...(state.workQueuesPorNegocio?.taller_publi_imperia || [])]
    };
    let nextWaitingPubli = [...(state.waitingPartsQueuePubli || [])];
    let nextPedidosListos = [...(state.pedidosListosImperia || [])];
    let nextAlmacenB2B = [...(state.almacenB2BPubli || [])];
    let nextCotizaciones = [...(state.cotizacionesPendientesGerente || [])];
    let nextGerente = { ...state.gerenteState };
    let nextFamilia = {
      ...state.familiaState,
      miembros: (state.familiaState?.miembros || []).map((m) => ({ ...m }))
    };

    let nextLogs = state.liveLogs;
    let nextHistorial = state.historialDiario;
    let nextDiasCount = state.diasSimuladosCount;
    let nextUltimoDia = state.ultimoDiaRegistrado;
    let nextUltimoMes = state.ultimoMesRegistrado ?? simDate.getMonth();
    const realNowMs = Date.now();
    let nextCashPopups = (state.cashPopups || []).filter((p) => realNowMs - p.createdAtMs < 2100);

    const pushLog = (negocioId, tipo, mensaje) => {
      nextLogs = [
        {
          id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          fechaStr: formatDateShort(simDate),
          horaStr: formatTimeHHMMSS(simDate),
          negocioId,
          tipo,
          mensaje
        },
        ...nextLogs.slice(0, 160)
      ];
    };

    // Cambio de día calendario -> guardar corte diario y reiniciar contadores diarios de empleados y kWh
    if (simDate.getDate() !== state.ultimoDiaRegistrado) {
      const esNuevoMes = simDate.getMonth() !== nextUltimoMes;
      nextUltimoDia = simDate.getDate();
      nextUltimoMes = simDate.getMonth();
      nextDiasCount += 1;
      const resumenDia = {
        fecha: formatDateShort(new Date(state.simTimeMs)),
        porNegocio: {}
      };
      let totalDiaConsorcio = 0;
      NEGOCIOS_ACTIVOS_IDS.forEach((nId) => {
        resumenDia.porNegocio[nId] = {
          ingresos: nextStats[nId].ingresosHoy,
          ventas: nextStats[nId].ventasHoy
        };
        totalDiaConsorcio += nextStats[nId].ingresosHoy;
        nextStats[nId] = {
          ...nextStats[nId],
          ingresosHoy: 0,
          costoInsumosHoy: 0,
          kwhHoy: 0,
          kwhMes: esNuevoMes ? 0 : (nextStats[nId].kwhMes || 0),
          ventasHoy: 0
        };
        nextEmpleadosLista[nId] = (nextEmpleadosLista[nId] || []).map((e, idx) => ({
          ...e,
          restroomsToday: 0,
          workSecondsToday: 0,
          nextRestroomTriggerSec: 1800 + idx * 900,
          imperiaOpeningDoneToday: false,
          imperiaClosingDoneToday: false,
          imperiaOpenPhaseIndex: 0,
          imperiaLastDayNum: nextUltimoDia,
          imperiaDaysWorkedCount: (e.imperiaDaysWorkedCount || 0) + 1
        }));
      });
      if (nextStats.oficinas_consorcio) {
        nextStats.oficinas_consorcio = {
          ...nextStats.oficinas_consorcio,
          kwhHoy: 0,
          kwhMes: esNuevoMes ? 0 : (nextStats.oficinas_consorcio.kwhMes || 0)
        };
      }
      nextHistorial = [resumenDia, ...nextHistorial.slice(0, 365)];
      pushLog('consorcio', 'daily_close', `📊 Cierre del Día (${resumenDia.fecha}): Ingresos Totales Consorcio = $${totalDiaConsorcio.toFixed(2)} MXN.`);
    }

    // Resetear equipos de producción en modo AUTO a OFF antes de evaluar pasos y ocupación de Oficina
    Object.keys(nextEquipos).forEach((eqKey) => {
      const eq = nextEquipos[eqKey];
      if (eq.controlMode === 'MANUAL_ON') {
        nextEquipos[eqKey] = { ...eq, estado: 'WORK', wattsActuales: eq.wattsNominal };
      } else if (eq.controlMode === 'MANUAL_OFF') {
        nextEquipos[eqKey] = { ...eq, estado: 'OFF', wattsActuales: 0 };
      } else if (eq.rol === 'continuo_24h') {
        nextEquipos[eqKey] = { ...eq, estado: 'WORK', wattsActuales: Math.round(eq.wattsNominal * 0.45) };
      } else if (eq.rol === 'clima') {
        const enTurno = condiciones.enHorarioOperativo;
        const factorClima = enTurno ? (0.35 + condiciones.factorClimaUso * 0.45) : 0;
        nextEquipos[eqKey] = { ...eq, estado: enTurno ? 'WORK' : 'OFF', wattsActuales: Math.round(eq.wattsNominal * factorClima) };
      } else if (eq.rol === 'turno_fijo') {
        const enTurno = condiciones.enHorarioOperativo;
        nextEquipos[eqKey] = { ...eq, estado: enTurno ? 'STANDBY' : 'OFF', wattsActuales: enTurno ? Math.round(eq.wattsNominal * 0.65) : 0 };
      } else {
        nextEquipos[eqKey] = { ...eq, estado: 'OFF', wattsActuales: 0 };
      }
    });

    // Liberar de Sync-Gate de Publi-Impresos cuando prenda E impresión externa ya llegaron
    if (nextWaitingPubli.length > 0) {
      const stillWaiting = [];
      for (const job of nextWaitingPubli) {
        if (nextSimTimeMs >= (job.prendaReadyMs || 0) && nextSimTimeMs >= (job.printReadyMs || 0)) {
          nextWorkQueues.taller_publi_imperia.push({ ...job, readyToPress: true });
          pushLog(
            'taller_publi_imperia',
            'stock',
            `✅ Prenda e Impresión [${job.proveedorInfo || 'DTF/Sublimación'}] listos en Publi-Impresos para planchado.`
          );
        } else {
          stillWaiting.push(job);
        }
      }
      nextWaitingPubli = stillWaiting;
    }

    const walkSpeedMps = state.timeScale > 20 ? 6.5 : 2.4;

    const moveActorTowardsWaypoint = (actor, waypointKey, negId, offset = [0, 0, 0]) => {
      const wpMap = WAYPOINTS_POR_NEGOCIO[negId] || WAYPOINTS_POR_NEGOCIO.hawaiian_paradise;
      // Sanitizar por si se pasa una clave con sufijos de offset acumulados
      const cleanWpKey = (waypointKey || 'barra_cliente').replace(/(_-?\d+)+$/, '');
      const validWp = wpMap[cleanWpKey] ? cleanWpKey : (wpMap[waypointKey] ? waypointKey : 'barra_cliente');
      const baseCoords = wpMap[validWp] || wpMap.barra_cliente || [0, 0, 1.2];
      const targetCoords = [
        baseCoords[0] + (offset[0] || 0),
        baseCoords[1] + (offset[1] || 0),
        baseCoords[2] + (offset[2] || 0)
      ];
      const [ax, , az] = actor.posicionLocal || [0, 0, 0];
      const distFinal = Math.hypot(targetCoords[0] - ax, targetCoords[2] - az);
      if (distFinal <= 0.18) {
        actor.posicionLocal = [targetCoords[0], 0, targetCoords[2]];
        actor.rutaActual = [];
        actor.targetWaypoint = validWp;
        actor._navCacheKey = `${validWp}_${Math.round((offset[0] || 0) * 100)}_${Math.round((offset[2] || 0) * 100)}`;
        return true;
      }

      const offsetKey = `${Math.round((offset[0] || 0) * 100)}_${Math.round((offset[2] || 0) * 100)}`;
      const cacheKey = `${validWp}_${offsetKey}`;
      if (!actor.rutaActual || actor.rutaActual.length === 0 || actor._navCacheKey !== cacheKey) {
        actor._navCacheKey = cacheKey;
        actor.targetWaypoint = validWp;
        actor.rutaActual = computeLocalPathAStar([ax, 0, az], targetCoords, negId, collisionBlocksMap);
      }

      const nextNode = actor.rutaActual[0] || targetCoords;
      const dx = nextNode[0] - ax;
      const dz = nextNode[2] - az;
      const distNode = Math.hypot(dx, dz);
      const stepDist = walkSpeedMps * simDeltaSec;

      if (stepDist >= distNode) {
        actor.posicionLocal = [nextNode[0], 0, nextNode[2]];
        actor.rutaActual.shift();
        return actor.rutaActual.length === 0;
      }
      actor.posicionLocal = [ax + (dx / distNode) * stepDist, 0, az + (dz / distNode) * stepDist];
      return false;
    };

    const moveWorldAgentTowardsTarget = (agent, targetZoneId, targetWp) => {
      const zone = ALL_ZONES_3D[targetZoneId] || NEGOCIOS_ZONES_3D.taller_publi_imperia;
      const wpMap = WAYPOINTS_POR_NEGOCIO[targetZoneId] || WAYPOINTS_POR_NEGOCIO.hawaiian_paradise;
      const targetLocal = wpMap[targetWp] || [0, 0, 0];
      const destWorld = [zone.center[0] + targetLocal[0], 0, zone.center[2] + targetLocal[2]];

      if (agent.isOutsideSupplyRun && targetZoneId === 'EXTERIOR_PROVEEDORES') {
        const extPoint = [24, 0, 15];
        const dx = extPoint[0] - agent.worldPos[0];
        const dz = extPoint[2] - agent.worldPos[2];
        const d = Math.hypot(dx, dz);
        if (d <= 0.3) {
          agent.worldPos = extPoint;
          return true;
        }
        const step = walkSpeedMps * 1.45 * simDeltaSec;
        agent.worldPos = step >= d ? extPoint : [agent.worldPos[0] + (dx / d) * step, 0, agent.worldPos[2] + (dz / d) * step];
        return step >= d;
      }

      // Si ya se encuentra dentro de la zona destino -> navegación interior con A*
      const distToZoneCenter = Math.hypot(agent.worldPos[0] - zone.center[0], agent.worldPos[2] - zone.center[2]);
      if (agent.currentZoneId === targetZoneId || distToZoneCenter < Math.max(zone.size[0], zone.size[2]) * 0.55) {
        agent.currentZoneId = targetZoneId;
        const localCur = [agent.worldPos[0] - zone.center[0], 0, agent.worldPos[2] - zone.center[2]];
        const helper = {
          posicionLocal: localCur,
          targetWaypoint: agent.targetWaypoint,
          rutaActual: agent.rutaLocal || []
        };
        const arrived = moveActorTowardsWaypoint(helper, targetWp, targetZoneId);
        agent.posicionLocal = helper.posicionLocal;
        agent.targetWaypoint = targetWp;
        agent.rutaLocal = helper.rutaActual;
        agent.worldPos = [zone.center[0] + helper.posicionLocal[0], 0, zone.center[2] + helper.posicionLocal[2]];
        return arrived;
      }

      // Caminata inter-local por la acera / avenida central entre módulos
      agent.currentZoneId = null;
      agent.rutaLocal = [];
      const doorWorld = [zone.center[0], 0, zone.center[2] + zone.size[2] / 2 + 0.5];
      const dx = doorWorld[0] - agent.worldPos[0];
      const dz = doorWorld[2] - agent.worldPos[2];
      const dist = Math.hypot(dx, dz);
      const step = walkSpeedMps * 1.35 * simDeltaSec;
      if (step >= dist) {
        agent.worldPos = doorWorld;
        agent.currentZoneId = targetZoneId;
        agent.posicionLocal = [0, 0, zone.size[2] / 2 + 0.4];
        return false;
      }
      agent.worldPos = [agent.worldPos[0] + (dx / dist) * step, 0, agent.worldPos[2] + (dz / dist) * step];
      return false;
    };

    const registrarVentaCompleta = (negId, clienteActivo, prodVendido) => {
      const precio = parseFloat(prodVendido?.precioVenta) || 45;
      const costoMat = parseFloat(prodVendido?.costoMateriales) || 10;
      const st = nextStats[negId];
      const prevCount = st.productosVendidosCount[prodVendido.id] || 0;
      if (!clienteActivo.pagoEmitido) {
        clienteActivo.pagoEmitido = true;
        nextCashPopups.push({
          id: `cash_${realNowMs}_${Math.random().toString(36).slice(2, 7)}`,
          negocioId: negId,
          monto: precio,
          createdAtMs: realNowMs
        });
      }
      nextStats[negId] = {
        ...st,
        ingresosHoy: st.ingresosHoy + precio,
        ingresosTotales: st.ingresosTotales + precio,
        costoInsumosHoy: (st.costoInsumosHoy || 0) + costoMat,
        costoInsumosTotales: st.costoInsumosTotales + costoMat,
        ventasHoy: st.ventasHoy + 1,
        ventasTotales: st.ventasTotales + 1,
        clientesAtendidos: st.clientesAtendidos + 1,
        productosVendidosCount: {
          ...st.productosVendidosCount,
          [prodVendido.id]: prevCount + 1
        }
      };
    };

    // Mutex de baños (1 persona a la vez por local)
    const nextBanoOcupado = { ...(state.banoOcupadoPorNegocio || {}) };

    // Procesar cada unidad de negocio con soporte multi-empleado (1..4) y queues inter-empresa
    NEGOCIOS_ACTIVOS_IDS.forEach((negId) => {
      const empLista = (nextEmpleadosLista[negId] || [nextEmpleados[negId]]).map((e) => ({ ...e }));
      let cola = [...(nextColas[negId] || [])].map((c) => ({ ...c }));
      const postList = [...(nextPostCompra[negId] || [])];
      // Registro de máquinas reclamadas en este tick para exclusividad y delegación
      const occupiedMachinesThisTick = {};

      // 1. Spawning probabilístico de nuevos clientes (solo en locales con atención al público)
      const esTallerSinPublico =
        negId === 'publi_impresos' || negId === 'taller_costura' || negId === 'bordados_veracruz';
      if (!esTallerSinPublico) {
        const lambdaHora = calcularTasaClientesPorHora(negId, condiciones, state.campanasActivas);
        const nuevosEsperados = (lambdaHora / 3600) * simDeltaSec;
        nextSpawnAcc[negId] = (nextSpawnAcc[negId] || 0) + nuevosEsperados;

        if (nextSpawnAcc[negId] >= 1.0) {
          const cantSpawn = Math.floor(nextSpawnAcc[negId]);
          nextSpawnAcc[negId] -= cantSpawn;
          if (cola.length < 4 + empLista.length) {
            const nuevoCli = crearEntidadCliente(negId, condiciones);
            cola.push(nuevoCli);
            if (state.timeScale <= 60) {
              pushLog(negId, 'client', `🚶 ${nuevoCli.nombre} entró a ${NEGOCIOS_ZONES_3D[negId].nombre} (Desea: ${nuevoCli.productoDeseado.nombre}).`);
            }
          }
        }
      } else if (cola.length > 0) {
        cola = [];
      }

      // 2. Actualizar clientes post-compra en mesa, de pie o saliendo del local
      const remainingPost = [];
      for (let i = 0; i < postList.length; i++) {
        const cPost = { ...postList[i] };
        const arrived = moveActorTowardsWaypoint(cPost, cPost.targetWaypoint, negId);
        if (arrived) {
          cPost.tiempoRestanteSeg = (cPost.tiempoRestanteSeg ?? 15) - simDeltaSec;
          if (cPost.tiempoRestanteSeg <= 0) {
            if (cPost.targetWaypoint !== 'acera_exterior') {
              cPost.targetWaypoint = 'acera_exterior';
              cPost.globoTexto = '¡Estuvo excelente! Hasta luego.';
              cPost.tiempoRestanteSeg = 4;
              remainingPost.push(cPost);
            }
          } else {
            remainingPost.push(cPost);
          }
        } else {
          remainingPost.push(cPost);
        }
      }
      nextPostCompra[negId] = remainingPost;

      // 3. Procesar cada empleado activo del local en paralelo
      for (let eIdx = 0; eIdx < empLista.length; eIdx++) {
        const emp = empLista[eIdx];
        emp.workSecondsToday = (emp.workSecondsToday || 0) + simDeltaSec;
        const lunchH = emp.lunchStartHour || 13;
        const enHorarioComida = simHour >= lunchH && simHour < lunchH + 1;

        // A) Verificar hora de comida obligatoria (1:00-2:00 PM o 2:00-3:00 PM) si no está mitad de venta urgente
        if (enHorarioComida && emp.estado !== 'ATENDIENDO_CLIENTE') {
          emp.estado = 'EN_COMIDA';
          emp.itemEnMano = null;
          emp.animacionActual = 'EAT_AT_TABLE';
          emp.textoAccion = `🍽️ Hora de comida (${lunchH}:00–${lunchH + 1}:00 PM)`;
          moveActorTowardsWaypoint(emp, 'espera_1', negId);
          empLista[eIdx] = emp;
          continue;
        } else if (!enHorarioComida && emp.estado === 'EN_COMIDA') {
          emp.estado = 'IDLE_TASK';
          emp.animacionActual = null;
        }

        // B) Apertura de Imperia Uniformes (sacar maniquíes, caja, pedidos, acomodar racks)
        if (
          negId === 'imperia_uniformes' &&
          eIdx === 0 &&
          !emp.imperiaOpeningDoneToday &&
          cola.length === 0 &&
          emp.estado === 'IDLE_TASK'
        ) {
          const openSteps = IMPERIA_SPECIAL_ROUTINES.apertura;
          const stepOpen = openSteps[emp.imperiaOpenPhaseIndex % openSteps.length];
          emp.textoAccion = stepOpen.texto;
          emp.animacionActual = stepOpen.animacion || 'OPERATE_TPV';
          if (moveActorTowardsWaypoint(emp, stepOpen.waypoint, negId)) {
            emp.idleElapsedSec = (emp.idleElapsedSec || 0) + simDeltaSec;
            if (emp.idleElapsedSec >= stepOpen.duracion) {
              emp.idleElapsedSec = 0;
              if (stepOpen.codigo === 'SETUP_MANNEQUINS') {
                pushLog(negId, 'info', '🧍 Encargada sacó los maniquíes a la entrada de Imperia Uniformes y abrió caja.');
              }
              if (emp.imperiaOpenPhaseIndex + 1 >= openSteps.length) {
                emp.imperiaOpeningDoneToday = true;
              } else {
                emp.imperiaOpenPhaseIndex += 1;
              }
            }
          }
          empLista[eIdx] = emp;
          continue;
        }

        // Limpiar bloqueo de baño si el ocupante ya no está en el local
        if (nextBanoOcupado[negId]) {
          const occId = nextBanoOcupado[negId].id;
          const inEmp = empLista.some((e) => e.id === occId && e.humanRoutineActual?.codigo === 'RESTROOM_BREAK');
          const inCli = cola.some((c) => c.id === occId && c.solicitoBano && !c.banoCompletado);
          if (!inEmp && !inCli) {
            nextBanoOcupado[negId] = null;
          }
        }

        // Liberar clientes asignados cuyo empleado ya no los está atendiendo activamente
        cola.forEach((c) => {
          if (c.atendidoPorEmpId) {
            const empOwner = empLista.find((e) => e.id === c.atendidoPorEmpId);
            if (!empOwner || empOwner.estado !== 'ATENDIENDO_CLIENTE' || empOwner.clienteActualId !== c.id) {
              c.atendidoPorEmpId = null;
            }
          }
        });

        // C) Asignar cliente esperando O trabajo interno de queue si el empleado está libre
        if (
          emp.estado !== 'ATENDIENDO_CLIENTE' &&
          emp.estado !== 'ATENDIENDO_QUEUE' &&
          emp.estado !== 'RUTINA_HUMANA' &&
          !emp.humanRoutineActual
        ) {
          const unassignedClient = cola.find((c) => !c.atendidoPorEmpId && (!c.solicitoBano || c.banoCompletado));
          if (unassignedClient) {
            unassignedClient.atendidoPorEmpId = emp.id;
            const receta = obtenerCoreografiaProducto(
              unassignedClient.productoDeseado.id,
              negId,
              recetasEntrenadas
            );
            emp.estado = 'ATENDIENDO_CLIENTE';
            emp.clienteActualId = unassignedClient.id;
            emp.recetaActual = receta;
            emp.pasoActualIndex = 0;
            emp.pasoElapsedSec = 0;
            emp.humanRoutineActual = null;
          } else if (nextWorkQueues[negId] && nextWorkQueues[negId].length > 0) {
            const ordenInterna = nextWorkQueues[negId].shift();
            const recetaQueue = obtenerCoreografiaProducto(ordenInterna.productoId, negId, recetasEntrenadas);
            emp.estado = 'ATENDIENDO_QUEUE';
            emp.queueOrderActual = ordenInterna;
            emp.recetaActual = recetaQueue;
            emp.pasoActualIndex = 0;
            emp.pasoElapsedSec = 0;
            emp.humanRoutineActual = null;
          }
        }

        // D) Ejecutar atención a cliente asignado
        if (emp.estado === 'ATENDIENDO_CLIENTE') {
          const cliIdx = cola.findIndex((c) => c.id === emp.clienteActualId);
          if (cliIdx === -1) {
            emp.estado = 'IDLE_TASK';
            emp.clienteActualId = null;
            emp.recetaActual = null;
          } else {
            const clienteActivo = cola[cliIdx];
            const pasos = emp.recetaActual?.pasos || [];
            const paso = pasos[emp.pasoActualIndex] || pasos[0];
            if (paso) {
              const wpCli = paso.waypointCliente || 'barra_cliente';
              const wpVen = paso.waypointVendedor || 'barra_vendedor';
              const slotOffset = emp.index === 0 ? -0.65 : (emp.index === 1 ? 0.65 : (emp.index - 0.5) * 1.3);
              const cliOffset = (wpCli === 'barra_cliente' || wpCli === 'caja_tpv_cliente') ? [slotOffset, 0, 0] : [0, 0, 0];
              const venOffset = (wpVen === 'barra_vendedor' || wpVen === 'caja_tpv_vendedor') ? [slotOffset, 0, 0] : [0, 0, 0];

              const reqEqKey = paso.equipoKey;
              let isMachineBlocked = false;
              let blockingEmpName = '';
              let isSameProductType = false;

              if (reqEqKey && !reqEqKey.includes('tpv') && !reqEqKey.includes('ac')) {
                if (occupiedMachinesThisTick[reqEqKey] && occupiedMachinesThisTick[reqEqKey].empId !== emp.id) {
                  isMachineBlocked = true;
                  blockingEmpName = occupiedMachinesThisTick[reqEqKey].empNombre;
                  isSameProductType = occupiedMachinesThisTick[reqEqKey].productoId === (emp.recetaActual?.id || clienteActivo.productoDeseado?.id);
                } else {
                  occupiedMachinesThisTick[reqEqKey] = {
                    empId: emp.id,
                    empNombre: emp.nombre,
                    productoId: emp.recetaActual?.id || clienteActivo.productoDeseado?.id
                  };
                }
              }

              let cliArrived = false;
              let venArrived = false;

              if (isMachineBlocked) {
                // Mutex: No pueden ocupar la misma máquina a la vez. Delegación o esperar turno en mostrador
                if (isSameProductType) {
                  emp.textoAccion = `🤝 Delegando ${paso.titulo} a ${blockingEmpName} (ya está en ${nextEquipos[reqEqKey]?.nombre || reqEqKey})`;
                  emp.animacionActual = 'TALK_TO_CUSTOMER';
                } else {
                  emp.textoAccion = `⏳ Esperando turno en ${nextEquipos[reqEqKey]?.nombre || reqEqKey} (en uso por ${blockingEmpName})`;
                  emp.animacionActual = 'WAIT_COOKING';
                }
                moveActorTowardsWaypoint(emp, 'barra_vendedor', negId, venOffset);
                moveActorTowardsWaypoint(clienteActivo, wpCli, negId, cliOffset);
                clienteActivo.globoTexto = paso.dialogoCliente || `Esperando mi ${clienteActivo.productoDeseado.nombre}...`;
              } else {
                cliArrived = moveActorTowardsWaypoint(clienteActivo, wpCli, negId, cliOffset);
                venArrived = moveActorTowardsWaypoint(emp, wpVen, negId, venOffset);

                clienteActivo.globoTexto = paso.dialogoCliente || null;
                emp.textoAccion = paso.dialogoVendedor || paso.titulo;
                emp.itemEnMano = paso.itemManoVendedor || null;
                emp.pasoCodigoActual = paso.codigo || null;
                emp.pasoDuracionActual = Math.max(1.0, parseFloat(paso.duracionSegundos) || 4.0);
                emp.animacionActual = paso.animacionVendedor || null;
                emp.efectoVisualActual = paso.efectoVisual || null;

                if (paso.equipoKey && nextEquipos[paso.equipoKey] && nextEquipos[paso.equipoKey].controlMode === 'AUTO') {
                  const eqTarget = nextEquipos[paso.equipoKey];
                  const wattsActivos = paso.estadoEquipo === 'OFF'
                    ? 0
                    : Math.round((paso.wattsNominales || eqTarget.wattsNominal) * (paso.factorPotencia ?? 1.0));
                  nextEquipos[paso.equipoKey] = {
                    ...eqTarget,
                    estado: paso.estadoEquipo || 'WORK',
                    wattsActuales: wattsActivos,
                    operacionActiva: paso.estadoEquipo !== 'OFF'
                  };
                }
              }

              if (!isMachineBlocked && ((cliArrived && venArrived) || state.timeScale >= 60)) {
                emp.pasoElapsedSec += simDeltaSec;
                const durRequerida = Math.max(1.0, parseFloat(paso.duracionSegundos) || 4.0);
                if (emp.pasoElapsedSec >= durRequerida) {
                  // Consumo de materia prima + auto-recompra
                  if (paso.insumoId && paso.cantidadInsumo > 0) {
                    const invList = [...(nextInventario[negId] || [])];
                    const idxIns = invList.findIndex((ins) => ins.id === paso.insumoId);
                    if (idxIns !== -1) {
                      const ins = { ...invList[idxIns] };
                      ins.stockActual = Math.max(0, Math.round((ins.stockActual - paso.cantidadInsumo) * 100) / 100);
                      if (ins.stockActual <= ins.puntoReorden && state.autoRestockEnabled) {
                        const costoLote = ins.loteRecompra * ins.costoUnitario;
                        ins.stockActual = Math.round((ins.stockActual + ins.loteRecompra) * 100) / 100;
                        nextStats[negId] = { ...nextStats[negId], costoInsumosTotales: nextStats[negId].costoInsumosTotales + costoLote };
                        pushLog(negId, 'stock', `🔄 Auto-Recompra [${ins.nombre}] (+${ins.loteRecompra} ${ins.unidad}, -$${costoLote.toFixed(2)}).`);
                      }
                      invList[idxIns] = ins;
                      nextInventario[negId] = invList;
                    }
                  }

                  // Desgaste real de hielo cada 10 raspados
                  if (paso.codigo === 'INSERT_ICE_BLOCK' && nextEquipos.hp_raspadora) {
                    const maxRasp = nextEquipos.hp_raspadora.maxRaspadosPorBloque || 10;
                    nextEquipos.hp_raspadora = { ...nextEquipos.hp_raspadora, raspadosRestantesHielo: maxRasp };
                    pushLog(negId, 'stock', `🧊 Bloque de hielo nuevo cargado en raspadora (${maxRasp}/${maxRasp} raspados).`);
                  } else if ((paso.codigo === 'PUSH_LEVER_SHAVE_ICE' || paso.codigo === 'SHAVE_ICE') && nextEquipos.hp_raspadora) {
                    const prevRasp = nextEquipos.hp_raspadora.raspadosRestantesHielo ?? 10;
                    nextEquipos.hp_raspadora = { ...nextEquipos.hp_raspadora, raspadosRestantesHielo: Math.max(0, prevRasp - 1) };
                  }

                  // Popup StarCraft +$XX arriba de la caja TPV
                  const esPasoPago =
                    paso.waypointCliente === 'caja_tpv_cliente' ||
                    paso.waypointVendedor === 'caja_tpv_vendedor' ||
                    (paso.codigo || '').includes('PAY') ||
                    (paso.codigo || '').includes('CHECKOUT');
                  if (esPasoPago && !clienteActivo.pagoEmitido) {
                    const montoPago = parseFloat(clienteActivo.productoDeseado?.precioVenta) || 45;
                    clienteActivo.pagoEmitido = true;
                    nextCashPopups.push({
                      id: `cash_${realNowMs}_${Math.random().toString(36).slice(2, 7)}`,
                      negocioId: negId,
                      monto: montoPago,
                      createdAtMs: realNowMs
                    });
                  }

                  if (emp.pasoActualIndex + 1 < pasos.length) {
                    emp.pasoActualIndex += 1;
                    emp.pasoElapsedSec = 0;

                    const nextPasoCheck = pasos[emp.pasoActualIndex];
                    if (
                      nextPasoCheck?.codigo === 'INSERT_ICE_BLOCK' &&
                      (nextEquipos.hp_raspadora?.raspadosRestantesHielo ?? 10) > 0 &&
                      emp.pasoActualIndex + 1 < pasos.length
                    ) {
                      emp.pasoActualIndex += 1;
                    }

                    // Si en probador Imperia no le gustó, no compra pero queda prenda pendiente por devolver a su rack
                    if (
                      negId === 'imperia_uniformes' &&
                      paso.codigo === 'CLIENT_TRY_DRESSING_ROOM' &&
                      !clienteActivo.compraraTrasPrueba
                    ) {
                      nextStats[negId] = { ...nextStats[negId], clientesSinCompra: nextStats[negId].clientesSinCompra + 1 };
                      pushLog(negId, 'info', `🚪 ${clienteActivo.nombre} probó en vestidor de Imperia pero no compró hoy; prenda por regresar a estante.`);
                      const [cliSaliente] = cola.splice(cliIdx, 1);
                      cliSaliente.targetWaypoint = 'acera_exterior';
                      cliSaliente.tiempoRestanteSeg = 5;
                      cliSaliente.globoTexto = 'Gracias, regreso luego.';
                      nextPostCompra[negId] = [...nextPostCompra[negId], cliSaliente];
                      emp.estado = 'IDLE_TASK';
                      emp.clienteActualId = null;
                      emp.recetaActual = null;
                    }
                  } else {
                    // Venta completa -> registrar stats + enrutar a Bordados / Taller Costura / Publi-Impresos
                    const prodVendido = clienteActivo.productoDeseado;
                    registrarVentaCompleta(negId, clienteActivo, prodVendido);
                    const routes = emp.recetaActual?.routesToQueue || {};

                    if (negId === 'imperia_uniformes') {
                      if (routes.bordados || prodVendido.id === 'imp_chef_gastronomia' || prodVendido.id === 'imp_conjunto_enfermeria') {
                        nextWorkQueues.bordados_veracruz.push({
                          id: `ord_bv_${Date.now()}`,
                          productoId: 'bv_escudo_aemco',
                          clienteOrigen: clienteActivo.nombre,
                          origen: 'Imperia Uniformes'
                        });
                        pushLog('bordados_veracruz', 'stock', `🧵 Pedido enviado desde Imperia Uniformes al queue de Bordados Veracruz (${clienteActivo.nombre}).`);
                      }
                      if (routes.tallerCostura || prodVendido.id === 'imp_pedido_b2b_empresa' || prodVendido.id === 'imp_pedido_corporativo_lote') {
                        nextWorkQueues.taller_costura.push({
                          id: `ord_tc_${Date.now()}`,
                          productoId: 'tc_filipina_chef',
                          clienteOrigen: clienteActivo.nombre,
                          origen: 'Imperia B2B'
                        });
                        pushLog('taller_costura', 'stock', `🧥 Pedido B2B / personalizado en queue de Taller Imperia Costura (${clienteActivo.nombre}).`);
                      }
                      if (routes.publiImpresos) {
                        const etaDtf = calcularETAInsumoExterno('DTF_COMBI_PROMOX', simDate, condiciones.esQuincena);
                        nextWaitingPubli.push({
                          id: `ord_pi_${Date.now()}`,
                          productoId: 'pi_dtf_playeras',
                          clienteOrigen: clienteActivo.nombre,
                          prendaReadyMs: nextSimTimeMs + 15000,
                          printReadyMs: nextSimTimeMs + 30000, // Simula espera de impresión mientras llega el DTF
                          proveedorInfo: etaDtf.proveedor
                        });
                        pushLog('taller_publi_imperia', 'stock', `🖨️ Pedido DTF en espera de sincronía (prenda + impresión en ${etaDtf.proveedor}).`);
                      }
                    }

                    const [cliTerminado] = cola.splice(cliIdx, 1);
                    cliTerminado.tieneProductoEnMano = true;
                    cliTerminado.atendidoPorEmpId = null;
                    let postDestino = 'acera_exterior';
                    if (negId === 'hawaiian_paradise') {
                      if (cliTerminado.decisionPostCompra === 'sentado_mesa') {
                        const availableChairs = [
                          'mesa_1_silla_1',
                          'mesa_1_silla_2',
                          'mesa_2_silla_1',
                          'mesa_2_silla_2'
                        ].filter((wp) => !(nextPostCompra[negId] || []).some((pc) => pc.targetWaypoint === wp));
                        postDestino = availableChairs.length > 0 ? availableChairs[0] : 'acera_exterior';
                        cliTerminado.globoTexto = `😋 Disfrutando ${prodVendido.nombre} en mesa`;
                      } else if (cliTerminado.decisionPostCompra === 'de_pie') {
                        const availableStanding = ['consumo_pie_1', 'consumo_pie_2'].filter(
                          (wp) => !(nextPostCompra[negId] || []).some((pc) => pc.targetWaypoint === wp)
                        );
                        postDestino = availableStanding.length > 0 ? availableStanding[0] : 'acera_exterior';
                        cliTerminado.globoTexto = `🍧 Consumiendo ${prodVendido.nombre} de pie`;
                      }
                    } else {
                      cliTerminado.globoTexto = '¡Excelente servicio!';
                    }
                    cliTerminado.targetWaypoint = postDestino;
                    cliTerminado.tiempoRestanteSeg = cliTerminado.tiempoConsumoPostSeg || 15;
                    nextPostCompra[negId] = [...(nextPostCompra[negId] || []), cliTerminado];

                    pushLog(negId, 'sale', `💰 Venta en ${NEGOCIOS_ZONES_3D[negId].nombre}: ${prodVendido.nombre} (+$${(parseFloat(prodVendido.precioVenta) || 45).toFixed(2)} MXN).`);
                    emp.estado = 'IDLE_TASK';
                    emp.clienteActualId = null;
                    emp.recetaActual = null;
                    emp.itemEnMano = null;
                    emp.pasoCodigoActual = null;
                    emp.animacionActual = null;
                    emp.efectoVisualActual = null;
                  }
                }
              }
            }
          }
        } else if (emp.estado === 'ATENDIENDO_QUEUE' && emp.recetaActual) {
          // E) Ejecutar orden interna en paralelo (Costura secuencia 9 pasos, Bordados, Publi DTF/Sublimación/Vinil)
          const pasos = emp.recetaActual.pasos || [];
          const paso = pasos[emp.pasoActualIndex] || pasos[0];
          if (paso) {
            const reqEqKey = paso.equipoKey;
            let isMachineBlocked = false;
            let blockingEmpName = '';
            if (reqEqKey && !reqEqKey.includes('tpv') && !reqEqKey.includes('ac')) {
              if (occupiedMachinesThisTick[reqEqKey] && occupiedMachinesThisTick[reqEqKey].empId !== emp.id) {
                isMachineBlocked = true;
                blockingEmpName = occupiedMachinesThisTick[reqEqKey].empNombre;
              } else {
                occupiedMachinesThisTick[reqEqKey] = {
                  empId: emp.id,
                  empNombre: emp.nombre,
                  productoId: emp.recetaActual?.id
                };
              }
            }

            const venArrived = moveActorTowardsWaypoint(emp, paso.waypointVendedor || 'barra_vendedor', negId);

            if (isMachineBlocked) {
              emp.textoAccion = `⏳ Esperando turno en ${reqEqKey.replace(/^[a-z]+_/, '')} (ocupado por ${blockingEmpName})...`;
              emp.animacionActual = 'WAIT_COOKING';
            } else {
              emp.textoAccion = `[Queue] ${paso.dialogoVendedor || paso.titulo}`;
              emp.itemEnMano = paso.itemManoVendedor || null;
              emp.pasoCodigoActual = paso.codigo || null;
              emp.animacionActual = paso.animacionVendedor || null;

              if (paso.equipoKey && nextEquipos[paso.equipoKey] && nextEquipos[paso.equipoKey].controlMode === 'AUTO') {
                const eqTarget = nextEquipos[paso.equipoKey];
                nextEquipos[paso.equipoKey] = {
                  ...eqTarget,
                  estado: paso.estadoEquipo || 'WORK',
                  wattsActuales: Math.round((paso.wattsNominales || eqTarget.wattsNominal) * (paso.factorPotencia ?? 1.0))
                };
              }
            }

            if (!isMachineBlocked && (venArrived || state.timeScale >= 60)) {
              emp.pasoElapsedSec += simDeltaSec;
              const dur = Math.max(1.0, parseFloat(paso.duracionSegundos) || 12.0);
              if (emp.pasoElapsedSec >= dur) {
                if (emp.pasoActualIndex + 1 < pasos.length) {
                  emp.pasoActualIndex += 1;
                  emp.pasoElapsedSec = 0;
                } else {
                  const recetaFin = emp.recetaActual;
                  if (recetaFin.esLoteB2B) {
                    nextAlmacenB2B = [
                      { id: `box_${Date.now()}`, titulo: recetaFin.nombreProducto, piezas: recetaFin.cantidadLote || 50 },
                      ...nextAlmacenB2B.slice(0, 12)
                    ];
                    pushLog('taller_publi_imperia', 'stock', `📦 Lote B2B empacado en cajas y guardado en Almacén de Publi-Impresos para entrega directa a empresa cliente.`);
                  } else if (recetaFin.deliversToImperia) {
                    nextPedidosListos = [
                      {
                        id: `ready_${Date.now()}`,
                        origen: NEGOCIOS_ZONES_3D[negId].nombre,
                        cliente: emp.queueOrderActual?.clienteOrigen || 'Stock Imperia',
                        nombre: recetaFin.nombreProducto
                      },
                      ...nextPedidosListos.slice(0, 14)
                    ];
                    pushLog('imperia_uniformes', 'stock', `🏷️ Pedido terminado de ${NEGOCIOS_ZONES_3D[negId].nombre} recibido en Rack de Pedidos Listos de Imperia.`);
                  }
                  emp.estado = 'IDLE_TASK';
                  emp.queueOrderActual = null;
                  emp.recetaActual = null;
                  emp.itemEnMano = null;
                  emp.animacionActual = null;
                }
              }
            }
          }
        } else {
          // F) Sin clientes ni queue -> Idas al baño (1-5/día), WhatsApp/YouTube solo sin clientes, y rutinas operativas
          emp.estado = 'IDLE_TASK';
          emp.itemEnMano = null;
          emp.pasoCodigoActual = null;
          emp.efectoVisualActual = null;

          // Verificar si toca ida al baño fisiológica (1 a 5 veces en la jornada)
          if (
            !emp.humanRoutineActual &&
            emp.restroomsToday < (emp.maxRestroomsToday || 3) &&
            emp.workSecondsToday >= (emp.nextRestroomTriggerSec || 1800)
          ) {
            emp.humanRoutineActual = UNIVERSAL_HUMAN_ROUTINES[0]; // RESTROOM_BREAK
            emp.humanRoutineElapsedSec = 0;
            emp.restroomsToday += 1;
            emp.nextRestroomTriggerSec = emp.workSecondsToday + 3600 + Math.random() * 2400;
          }

          if (emp.humanRoutineActual && emp.humanRoutineActual.codigo === 'RESTROOM_BREAK') {
            const hr = emp.humanRoutineActual;
            emp.estado = 'RUTINA_HUMANA';

            const banoActual = nextBanoOcupado[negId];
            if (!banoActual || banoActual.id === emp.id) {
              // Baño reservado para este empleado
              nextBanoOcupado[negId] = { id: emp.id, name: emp.nombre, type: 'empleado' };
              emp.isWaitingRestroom = false;
              const arrivedDoor = moveActorTowardsWaypoint(emp, 'bano_empleado', negId);
              if (arrivedDoor) {
                emp.isInsideRestroom = true; // Entra por la puerta y desaparece de la vista del local
                emp.textoAccion = '🚻 En el baño...';
                emp.humanRoutineElapsedSec += simDeltaSec;
                if (emp.humanRoutineElapsedSec >= (hr.duracion || 35)) {
                  // Termina y sale del baño
                  emp.isInsideRestroom = false;
                  nextBanoOcupado[negId] = null;
                  emp.humanRoutineActual = null;
                  emp.humanRoutineElapsedSec = 0;
                  emp.estado = 'IDLE_TASK';
                  emp.animacionActual = null;
                  pushLog(negId, 'info', `🚻 ${emp.nombre} salió del baño y regresó a sus labores.`);
                }
              } else {
                emp.textoAccion = '🚻 Dirigiéndose al baño...';
                emp.animacionActual = 'WALK';
              }
            } else {
              // Baño ocupado por otra persona (cliente u otro empleado): espera afuera del baño
              emp.isInsideRestroom = false;
              emp.isWaitingRestroom = true;
              moveActorTowardsWaypoint(emp, 'espera_bano', negId);
              emp.textoAccion = `🚻 Esperando turno del baño (ocupado por ${banoActual.name})...`;
              emp.animacionActual = 'WAIT_COOKING';
            }
          } else if (emp.humanRoutineActual) {
            const hr = emp.humanRoutineActual;
            emp.estado = 'RUTINA_HUMANA';
            emp.textoAccion = hr.texto;
            emp.animacionActual = hr.animacion || 'WAIT_COOKING';
            if (moveActorTowardsWaypoint(emp, hr.waypoint, negId)) {
              emp.humanRoutineElapsedSec += simDeltaSec;
              if (emp.humanRoutineElapsedSec >= (hr.duracion || 60)) {
                emp.humanRoutineActual = null;
                emp.humanRoutineElapsedSec = 0;
                emp.estado = 'IDLE_TASK';
                emp.animacionActual = null;
              }
            }
          } else {
            const listaTareas = TAREAS_SIN_CLIENTES_POR_NEGOCIO[negId] || TAREAS_SIN_CLIENTES_POR_NEGOCIO.hawaiian_paradise;
            const tarea = listaTareas[emp.idleTaskIndex % listaTareas.length];
            emp.textoAccion = tarea.texto;
            emp.animacionActual = tarea.animacion || null;

            const arrivedIdle = moveActorTowardsWaypoint(emp, tarea.waypoint, negId);
            if (arrivedIdle) {
              emp.idleElapsedSec = (emp.idleElapsedSec || 0) + simDeltaSec;
              if (emp.idleElapsedSec >= (tarea.duracion || 14)) {
                if (negId === 'imperia_uniformes' && tarea.codigo === 'APP_COTIZACIONES') {
                  nextCotizaciones = [
                    { id: `cot_${Date.now()}`, monto: 3850, proveedor: 'Cotexa / Euro / Jasbec', creadaHora: formatTimeHHMMSS(simDate) },
                    ...nextCotizaciones.slice(0, 8)
                  ];
                  pushLog(negId, 'info', '💻 Cotización enviada al Gerente para aprobación antes de reenviar por correo al cliente.');
                } else if (negId === 'imperia_uniformes' && tarea.codigo === 'MOP_STORE' && (emp.imperiaDaysWorkedCount % 3 === 0)) {
                  pushLog(negId, 'info', '🪣 Trapeado cada 3 días completado en Imperia Uniformes.');
                }
                emp.idleElapsedSec = 0;
                emp.idleTaskIndex = (emp.idleTaskIndex + 1) % listaTareas.length;
              }
            }
          }
        }

        empLista[eIdx] = emp;
      }

      // 4. Clientes restantes en fila que aún esperan turno o usan el baño
      let waitSlot = 0;
      for (let cIdx = 0; cIdx < cola.length; cIdx++) {
        const cli = cola[cIdx];
        if (!cli.atendidoPorEmpId) {
          if (cli.solicitoBano && !cli.banoCompletado) {
            // El cliente solicitó pasar al baño (lavarse las manos, del 1 o del 2)
            const banoActual = nextBanoOcupado[negId];
            if (!banoActual || banoActual.id === cli.id) {
              nextBanoOcupado[negId] = { id: cli.id, name: cli.nombre, type: 'cliente', need: cli.necesidadBano };
              cli.isWaitingRestroom = false;
              const arrivedDoor = moveActorTowardsWaypoint(cli, 'bano_empleado', negId);
              if (arrivedDoor) {
                cli.isInsideRestroom = true; // Entra y desaparece de la vista del local
                cli.globoTexto = null;
                cli.tiempoBanoRestanteSeg = (cli.tiempoBanoRestanteSeg || 15) - simDeltaSec;
                if (cli.tiempoBanoRestanteSeg <= 0) {
                  cli.isInsideRestroom = false; // Reaparece
                  cli.banoCompletado = true;
                  nextBanoOcupado[negId] = null;
                  const txtNeed = cli.necesidadBano === 'manos' ? 'lavarse las manos' : (cli.necesidadBano === 'del_1' ? 'hacer del 1' : 'hacer del 2');
                  pushLog(negId, 'client', `🚻 ${cli.nombre} terminó de ${txtNeed} en el baño y pasa a formarse.`);
                }
              } else {
                const txtNeed = cli.necesidadBano === 'manos' ? 'lavarme las manos' : (cli.necesidadBano === 'del_1' ? 'hacer del 1' : 'hacer del 2');
                cli.globoTexto = `¿Puedo pasar al baño a ${txtNeed}?`;
              }
            } else {
              cli.isInsideRestroom = false;
              cli.isWaitingRestroom = true;
              moveActorTowardsWaypoint(cli, 'espera_bano', negId);
              cli.globoTexto = `🚻 Esperando turno del baño (ocupado por ${banoActual.name})...`;
            }
          } else {
            // Cliente normal esperando en fila: se acomoda ordenadamente detrás del mostrador (separado por ~1.1m cada uno)
            const qOffset = [(waitSlot % 2 === 0 ? 0.08 : -0.08), 0, 1.25 + waitSlot * 1.1];
            moveActorTowardsWaypoint(cli, 'barra_cliente', negId, qOffset);
            cli.globoTexto = `En fila (#${waitSlot + 1}) para ${cli.productoDeseado.nombre}`;
            waitSlot++;
          }
        }
      }

      // 5. Clientes post-compra (Consumo en mesas / de pie, o salida a la calle)
      const remainingPostCompra = [];
      const currentPost = nextPostCompra[negId] || [];

      for (let pIdx = 0; pIdx < currentPost.length; pIdx++) {
        const pCli = { ...currentPost[pIdx] };
        pCli.tiempoRestanteSeg = (pCli.tiempoRestanteSeg ?? 15) - simDeltaSec;

        const isExiting = pCli.tiempoRestanteSeg <= 0 || pCli.targetWaypoint === 'acera_exterior';

        if (isExiting) {
          pCli.targetWaypoint = 'acera_exterior';
          pCli.globoTexto = '¡Gracias, hasta luego!';
          pCli.animacionActual = 'WALK';

          const [, , pz] = pCli.posicionLocal || [0, 0, 0];

          // Para salir limpiamente del establecimiento:
          // 1. Si aún está en el interior (pz < 4.4), caminar primero hacia el vano de la puerta frontal
          // 2. Al cruzar la puerta (pz >= 4.4), caminar hacia la acera exterior
          const wpTarget = pz < 4.4 ? 'puerta_entrada' : 'acera_exterior';
          const arrivedExit = moveActorTowardsWaypoint(pCli, wpTarget, negId);

          // Si llegó a la acera exterior, o cruzó el vano de la puerta hacia la calle (pz >= 4.9), o tiempo excedido
          if (arrivedExit || pz >= 4.9 || pCli.tiempoRestanteSeg < -10) {
            pushLog(negId, 'client', `👋 ${pCli.nombre} salió satisfecho de ${NEGOCIOS_ZONES_3D[negId].nombre}.`);
            continue; // Se despawnea del local y no se incluye en remainingPostCompra
          }
        } else {
          // Cliente disfrutando producto en mesa o de pie
          const arrivedSpot = moveActorTowardsWaypoint(pCli, pCli.targetWaypoint, negId);
          if (arrivedSpot) {
            pCli.animacionActual = pCli.targetWaypoint.startsWith('mesa_') ? 'EAT_AT_TABLE' : null;
          }
        }

        remainingPostCompra.push(pCli);
      }

      nextEmpleadosLista[negId] = empLista;
      nextEmpleados[negId] = empLista[0];
      nextColas[negId] = cola;
      nextPostCompra[negId] = remainingPostCompra;
    });

    // 5. VISITA FAMILIAR AUTOMÁTICA A LAS 15:15 HRS (Esposa, Alex 12 años y Bárbara 8 años)
    // Llegan 15:15 hrs a comer media hora (15:15–15:45) y después pasan 1 hr en la oficina viendo tele (15:45–16:45)
    if (
      simHour === 15 &&
      simMinute >= 15 &&
      nextFamilia.lastVisitDay !== simDate.getDate() &&
      !nextFamilia.visitActive
    ) {
      const targetZ = 'hawaiian_paradise';
      const cZ = ALL_ZONES_3D[targetZ].center;
      const wps = ['mesa_1_silla_1', 'mesa_2_silla_1', 'mesa_2_silla_2'];
      nextFamilia.visitActive = true;
      nextFamilia.lastVisitDay = simDate.getDate();
      nextFamilia.visitStartSimMs = nextSimTimeMs;
      nextFamilia.locationZone = targetZ;
      nextFamilia.activityMode = 'COMER_HAWAIIAN';
      nextFamilia.eatingWithManager = true;
      nextFamilia.visitEndSimMs = nextSimTimeMs + 90 * 60 * 1000;
      nextFamilia.miembros = nextFamilia.miembros.map((m, i) => ({
        ...m,
        currentZoneId: targetZ,
        targetWaypoint: wps[i] || 'espera_1',
        posicionLocal: [0, 0, 4.3],
        worldPos: [cZ[0], 0, cZ[2] + 4.3],
        animacionActual: 'EAT_AT_TABLE',
        textoAccion: '🍧 Comiendo en Hawaiian Paradise con papá'
      }));
      pushLog(
        targetZ,
        'client',
        '👨‍👩‍👧‍👦 15:15 hrs — Llegó Esposa con Alex (12) y Bárbara (8) a comer a Hawaiian Paradise (media hora).'
      );
    }

    if (nextFamilia.visitActive) {
      const startMs = nextFamilia.visitStartSimMs || nextSimTimeMs;
      const elapsedMin = Math.max(0, (nextSimTimeMs - startMs) / (60 * 1000));

      if (elapsedMin >= 90) {
        // Fase 3: A las 16:45 hrs (90 min después de llegar) se van
        nextFamilia.visitActive = false;
        nextFamilia.eatingWithManager = false;
        if (nextEquipos.oc_tv_32) {
          nextEquipos.oc_tv_32 = { ...nextEquipos.oc_tv_32, estado: 'OFF', wattsActuales: 0, operacionActiva: false };
        }
        pushLog(
          'oficinas_consorcio',
          'client',
          '👨‍👩‍👧‍👦 16:45 hrs — Esposa, Alex y Bárbara se despiden y se van a casa. El Gerente retoma supervisión de negocios.'
        );
      } else if (elapsedMin >= 30) {
        // Fase 2: 1 hora en la oficina viendo tele (15:45 a 16:45 hrs)
        const isTransitioningToOffice = nextFamilia.locationZone !== 'oficinas_consorcio';
        nextFamilia.locationZone = 'oficinas_consorcio';
        nextFamilia.activityMode = 'OFICINA_TV';

        if (isTransitioningToOffice) {
          const ofCenter = ALL_ZONES_3D.oficinas_consorcio.center;
          const ofWps = ['sofa_tv_1', 'sofa_tv_2', 'sofa_tv_3'];
          nextFamilia.miembros.forEach((m, i) => {
            m.currentZoneId = 'oficinas_consorcio';
            m.targetWaypoint = ofWps[i] || 'sofa_tv_1';
            m.posicionLocal = [0, 0, 3.2];
            m.worldPos = [ofCenter[0], 0, ofCenter[2] + 3.2];
            m.textoAccion = '📺 Viendo tele en el clima de la Oficina';
            m.animacionActual = 'WATCH_TV_SOFA';
          });
          pushLog(
            'oficinas_consorcio',
            'client',
            '👨‍👩‍👧‍👦 15:45 hrs — Familia y Gerente pasan a estar 1 hr en Oficina Consorcio (Clima A/C + Smart TV encendidos).'
          );
        }

        const ofWps = ['sofa_tv_1', 'sofa_tv_2', 'sofa_tv_3'];
        nextFamilia.miembros.forEach((m, i) => {
          m.currentZoneId = 'oficinas_consorcio';
          const arrivedF = moveWorldAgentTowardsTarget(m, 'oficinas_consorcio', ofWps[i]);
          if (arrivedF) {
            m.animacionActual = 'WATCH_TV_SOFA';
          }
        });

        if (nextEquipos.oc_ac_1tr) {
          nextEquipos.oc_ac_1tr = { ...nextEquipos.oc_ac_1tr, estado: 'WORK', wattsActuales: 1150, operacionActiva: true };
        }
        if (nextEquipos.oc_tv_32) {
          nextEquipos.oc_tv_32 = { ...nextEquipos.oc_tv_32, estado: 'WORK', wattsActuales: 55, operacionActiva: true };
        }
      } else {
        // Fase 1: Comiendo en Hawaiian Paradise durante media hora (15:15 a 15:45 hrs)
        nextFamilia.locationZone = 'hawaiian_paradise';
        nextFamilia.activityMode = 'COMER_HAWAIIAN';
        const hpWps = ['mesa_1_silla_1', 'mesa_2_silla_1', 'mesa_2_silla_2'];
        nextFamilia.miembros.forEach((m, i) => {
          m.currentZoneId = 'hawaiian_paradise';
          const arrivedF = moveWorldAgentTowardsTarget(m, 'hawaiian_paradise', hpWps[i]);
          if (arrivedF) {
            m.animacionActual = 'EAT_AT_TABLE';
          }
        });
      }
    }

    // 6. MOVIMIENTO Y LABORES DEL GERENTE (Usuario con glow + Plumbob en el mundo 3D)
    if (nextFamilia.visitActive) {
      const startMs = nextFamilia.visitStartSimMs || nextSimTimeMs;
      const elapsedMin = Math.max(0, (nextSimTimeMs - startMs) / (60 * 1000));

      if (elapsedMin < 30) {
        // Si la familia está comiendo en Hawaiian -> deja su trabajo y come con ellos
        nextGerente.currentZoneId = 'hawaiian_paradise';
        nextGerente.targetZoneId = 'hawaiian_paradise';
        nextGerente.targetWaypoint = 'mesa_1_silla_2';
        nextGerente.isOutsideSupplyRun = false;
        nextGerente.textoAccion = '👨‍👩‍👧‍👦 Comiendo en Hawaiian Paradise con Esposa, Alex y Bárbara';
        const satWithFam = moveWorldAgentTowardsTarget(nextGerente, 'hawaiian_paradise', 'mesa_1_silla_2');
        nextGerente.animacionActual = satWithFam ? 'EAT_AT_TABLE' : null;
      } else {
        // En la oficina con la familia (1 hr)
        nextGerente.currentZoneId = 'oficinas_consorcio';
        nextGerente.targetZoneId = 'oficinas_consorcio';

        // Comportamiento: durante ~5 minutos (minuto 55 a 60 de la visita, o sea a los 25 min de estar en oficina)
        // se levanta a revisar algo urgente en la PC de la oficina, luego regresa a ver tele con ellos
        const isUrgentPcCheck = elapsedMin >= 55 && elapsedMin < 60;
        if (isUrgentPcCheck) {
          nextGerente.targetWaypoint = 'eq_oc_laptop_diseno';
          nextGerente.textoAccion = '💻 Revisando algo urgente en el PC de la Oficina (5 min)';
          const atPc = moveWorldAgentTowardsTarget(nextGerente, 'oficinas_consorcio', 'eq_oc_laptop_diseno');
          nextGerente.animacionActual = atPc ? 'DESIGN_PC' : null;
          if (nextEquipos.oc_laptop_diseno) {
            nextEquipos.oc_laptop_diseno = { ...nextEquipos.oc_laptop_diseno, estado: 'WORK', wattsActuales: 65, operacionActiva: true };
          }
        } else {
          if (nextEquipos.oc_laptop_diseno) {
            nextEquipos.oc_laptop_diseno = { ...nextEquipos.oc_laptop_diseno, estado: 'OFF', wattsActuales: 0, operacionActiva: false };
          }
          nextGerente.targetWaypoint = 'sofa_tv_1';
          nextGerente.textoAccion = '📺 Viendo tele con mi familia en el clima de la Oficina';
          const atSofa = moveWorldAgentTowardsTarget(nextGerente, 'oficinas_consorcio', 'sofa_tv_1');
          nextGerente.animacionActual = atSofa ? 'WATCH_TV_SOFA' : null;
        }
      }
    } else {
      const targetZ = nextGerente.targetZoneId || 'taller_publi_imperia';
      const targetW = nextGerente.targetWaypoint || 'eq_pi_pc_diseno';
      nextGerente.currentZoneId = targetZ;
      const arrivedMgr = moveWorldAgentTowardsTarget(nextGerente, targetZ, targetW);
      if (arrivedMgr) {
        nextGerente.phaseElapsedSec = (nextGerente.phaseElapsedSec || 0) + simDeltaSec;
        if (targetZ === 'oficinas_consorcio') {
          if (nextEquipos.oc_ac_1tr) nextEquipos.oc_ac_1tr = { ...nextEquipos.oc_ac_1tr, estado: 'WORK', wattsActuales: 1150 };
          if (nextEquipos.oc_laptop_diseno) nextEquipos.oc_laptop_diseno = { ...nextEquipos.oc_laptop_diseno, estado: 'WORK', wattsActuales: 65 };
          nextGerente.animacionActual = 'DESIGN_PC';
        } else if (targetZ === 'taller_publi_imperia') {
          nextGerente.animacionActual = targetW.includes('plancha') ? 'IRON_PRESS' : 'DESIGN_PC';
        } else if (targetZ === 'hawaiian_paradise') {
          nextGerente.animacionActual = 'IDLE_WAIT';
        } else {
          nextGerente.animacionActual = 'OPERATE_TPV';
        }

        // Rotación automática de actividades si expiró el comando manual
        if (nextSimTimeMs >= (nextGerente.manualLockUntilSimMs || 0) && nextGerente.phaseElapsedSec >= (nextGerente.phaseDurationSec || 45)) {
          nextGerente.phaseElapsedSec = 0;
          const MGR_ROTATION = [
            { z: 'taller_publi_imperia', wp: 'eq_pi_pc_diseno', dur: 65, txt: '🎨 Gerente: Diseñando vectores en Publi-Impresos (tarea principal)' },
            { z: 'taller_publi_imperia', wp: 'eq_pi_plancha_plana', dur: 40, txt: '♨️ Gerente: Planchando DTF/Sublimación en Publi-Impresos' },
            { z: 'imperia_uniformes', wp: 'caja_tpv_vendedor', dur: 35, txt: '📋 Gerente: Aprobando cotizaciones, revisando pedidos y stock Imperia' },
            { z: 'hawaiian_paradise', wp: 'mesa_1_silla_1', dur: 30, txt: '🍧 Gerente: Preguntando en mesas de Hawaiian si todo está bien' },
            { z: 'oficinas_consorcio', wp: 'eq_oc_laptop_diseno', dur: 45, txt: '❄️ Gerente: Oficina Consorcio (Clima A/C encendido + diseño PC)' },
            { z: 'taller_costura', wp: 'raw_mesa_corte_telas', dur: 25, txt: '🧵 Gerente: Llevando tela y supervisando Taller Costura (nunca cose)' },
            { z: 'papeleria_imperiarte', wp: 'eq_pap_docucolor', dur: 25, txt: '🖨️ Gerente: Imprimiendo en DocuColor y revisando stock Papelería' }
          ];
          nextGerente.autoTaskIndex = ((nextGerente.autoTaskIndex || 0) + 1) % MGR_ROTATION.length;
          const nextR = MGR_ROTATION[nextGerente.autoTaskIndex];
          nextGerente.targetZoneId = nextR.z;
          nextGerente.currentZoneId = nextR.z;
          nextGerente.targetWaypoint = nextR.wp;
          nextGerente.phaseDurationSec = nextR.dur;
          nextGerente.textoAccion = nextR.txt;
          nextGerente.isOutsideSupplyRun = false;
        }
      } else {
        nextGerente.animacionActual = null;
      }
    }

    // 7. Integrar consumo eléctrico (Wh -> kWh) de cada aparato activo incluyendo Clima/TV/PC de Oficina
    Object.keys(nextEquipos).forEach((eqKey) => {
      const eq = nextEquipos[eqKey];
      const estaEnOperacion = eq.wattsActuales > 0 && (eq.estado === 'WORK' || eq.estado === 'PREHEAT');
      if (eq.wattsActuales > 0) {
        const deltaKwh = (eq.wattsActuales * (simDeltaSec / 3600)) / 1000;
        const nextOpSec = estaEnOperacion
          ? ((eq.operacionActiva ? (eq.segundosEnOperacionActual || 0) : 0) + simDeltaSec)
          : 0;
        const nextOpKwh = estaEnOperacion
          ? ((eq.operacionActiva ? (eq.kwhEnOperacionActual || 0) : 0) + deltaKwh)
          : 0;
        nextEquipos[eqKey] = {
          ...eq,
          segundosEncendidoHoy: eq.segundosEncendidoHoy + simDeltaSec,
          segundosEncendidoTotal: eq.segundosEncendidoTotal + simDeltaSec,
          kwhAcumulados: eq.kwhAcumulados + deltaKwh,
          operacionActiva: estaEnOperacion,
          segundosEnOperacionActual: nextOpSec,
          kwhEnOperacionActual: nextOpKwh
        };
        if (nextStats[eq.negocioId]) {
          nextStats[eq.negocioId] = {
            ...nextStats[eq.negocioId],
            kwhHoy: (nextStats[eq.negocioId].kwhHoy || 0) + deltaKwh,
            kwhMes: (nextStats[eq.negocioId].kwhMes || 0) + deltaKwh,
            kwhAcumulados: nextStats[eq.negocioId].kwhAcumulados + deltaKwh
          };
        }
      } else if (eq.operacionActiva || eq.segundosEnOperacionActual > 0 || eq.kwhEnOperacionActual > 0) {
        nextEquipos[eqKey] = {
          ...eq,
          operacionActiva: false,
          segundosEnOperacionActual: 0,
          kwhEnOperacionActual: 0
        };
      }
    });

    set({
      simTimeMs: nextSimTimeMs,
      diasSimuladosCount: nextDiasCount,
      ultimoDiaRegistrado: nextUltimoDia,
      ultimoMesRegistrado: nextUltimoMes,
      cashPopups: nextCashPopups,
      empleadosListaPorNegocio: nextEmpleadosLista,
      empleadosPorNegocio: nextEmpleados,
      gerenteState: nextGerente,
      familiaState: nextFamilia,
      workQueuesPorNegocio: nextWorkQueues,
      waitingPartsQueuePubli: nextWaitingPubli,
      pedidosListosImperia: nextPedidosListos,
      almacenB2BPubli: nextAlmacenB2B,
      cotizacionesPendientesGerente: nextCotizaciones,
      clientesColaPorNegocio: nextColas,
      clientesPostCompraPorNegocio: nextPostCompra,
      banoOcupadoPorNegocio: nextBanoOcupado,
      spawnAccumulators: nextSpawnAcc,
      statsPorNegocio: nextStats,
      inventarioPorNegocio: nextInventario,
      equiposRuntime: nextEquipos,
      historialDiario: nextHistorial,
      liveLogs: nextLogs
    });
  },

  /**
   * SIMULADOR ACELERADO DE MACRO-PERIODOS (1 Hora, 1 Día, 1 Semana, 1 Mes, 1 Año)
   * Calcula con precisión matemática las ventas, gasto de materia prima, horas de máquinas y kWh CFE,
   * alimentando el Log de Texto y las tarjetas de Stats de cada negocio.
   */
  simulateMacroPeriod: (periodType = 'day') => {
    const horasASimular = {
      hour: 1,
      day: 24,
      week: 24 * 7,
      month: 24 * 30,
      year: 24 * 365
    }[periodType] || 24;

    set((state) => {
      let cursorMs = state.simTimeMs;
      const nextStats = structuredClone(state.statsPorNegocio);
      const nextInventario = structuredClone(state.inventarioPorNegocio);
      const nextEquipos = structuredClone(state.equiposRuntime);
      let nextLogs = [...state.liveLogs];
      let nextHistorial = [...state.historialDiario];
      let nextDiasCount = state.diasSimuladosCount;
      const recetasEntrenadas = useTrainingStore.getState().recetasEntrenadas;

      let totalIngresosSalto = 0;
      let totalVentasSalto = 0;
      let totalKwhSalto = 0;
      let trackedMonth = new Date(cursorMs).getMonth();

      for (let h = 0; h < horasASimular; h++) {
        cursorMs += 3600 * 1000;
        const curDate = new Date(cursorMs);
        if (curDate.getMonth() !== trackedMonth) {
          trackedMonth = curDate.getMonth();
          NEGOCIOS_ACTIVOS_IDS.forEach((nId) => {
            nextStats[nId].kwhMes = 0;
          });
        }
        const cond = evaluarCondicionesDemanda(curDate, state.campanasActivas, state.escenarioGlobal);

        // Integrar consumo eléctrico base de refrigeradores/CCTV/luces/clima en esta hora
        Object.keys(nextEquipos).forEach((eqKey) => {
          const eq = nextEquipos[eqKey];
          if (eq.controlMode === 'MANUAL_OFF') return;
          let wHora = 0;
          if (eq.controlMode === 'MANUAL_ON') {
            wHora = eq.wattsNominal;
          } else if (eq.rol === 'continuo_24h') {
            wHora = eq.wattsNominal * 0.45;
          } else if (eq.rol === 'clima' && cond.enHorarioOperativo) {
            wHora = eq.wattsNominal * (0.35 + cond.factorClimaUso * 0.45);
          } else if (eq.rol === 'turno_fijo' && cond.enHorarioOperativo) {
            wHora = eq.wattsNominal * 0.65;
          }
          if (wHora > 0) {
            const kwhH = wHora / 1000;
            eq.segundosEncendidoTotal += 3600;
            eq.kwhAcumulados += kwhH;
            totalKwhSalto += kwhH;
            if (nextStats[eq.negocioId]) {
              nextStats[eq.negocioId].kwhHoy = (nextStats[eq.negocioId].kwhHoy || 0) + kwhH;
              nextStats[eq.negocioId].kwhMes = (nextStats[eq.negocioId].kwhMes || 0) + kwhH;
              nextStats[eq.negocioId].kwhAcumulados += kwhH;
            }
          }
        });

        // Simular ventas por negocio en esta hora si está dentro del horario operativo
        if (cond.enHorarioOperativo) {
          NEGOCIOS_ACTIVOS_IDS.forEach((negId) => {
            const lambda = calcularTasaClientesPorHora(negId, cond, state.campanasActivas);
            const numClientes = Math.max(0, Math.round(lambda * (0.75 + Math.random() * 0.5)));

            for (let c = 0; c < numClientes; c++) {
              const cli = crearEntidadCliente(negId, cond);
              if (!cli.compraraTrasPrueba) {
                nextStats[negId].clientesSinCompra += 1;
                continue;
              }
              const prod = cli.productoDeseado;
              const receta = obtenerCoreografiaProducto(prod.id, negId, recetasEntrenadas);

              // Sumar consumo eléctrico exacto de los pasos con máquina de la receta
              (receta.pasos || []).forEach((paso) => {
                if (paso.equipoKey && nextEquipos[paso.equipoKey] && paso.estadoEquipo !== 'OFF') {
                  const eq = nextEquipos[paso.equipoKey];
                  const segs = parseFloat(paso.duracionSegundos) || 10;
                  const wattsEfectivos = (paso.wattsNominales || eq.wattsNominal) * (paso.factorPotencia ?? 1.0);
                  const kwhPaso = (wattsEfectivos * (segs / 3600)) / 1000;
                  eq.segundosEncendidoTotal += segs;
                  eq.kwhAcumulados += kwhPaso;
                  nextStats[negId].kwhHoy = (nextStats[negId].kwhHoy || 0) + kwhPaso;
                  nextStats[negId].kwhMes = (nextStats[negId].kwhMes || 0) + kwhPaso;
                  nextStats[negId].kwhAcumulados += kwhPaso;
                  totalKwhSalto += kwhPaso;
                }
              });

              // Descontar BOM de materia prima y auto-reabastecer
              (prod.bom || []).forEach((bomItem) => {
                const invList = nextInventario[negId] || [];
                const ins = invList.find(i => i.id === bomItem.insumoId);
                if (ins) {
                  ins.stockActual = Math.max(0, Math.round((ins.stockActual - bomItem.cantidad) * 100) / 100);
                  if (ins.stockActual <= ins.puntoReorden && state.autoRestockEnabled) {
                    const costoRecompra = ins.loteRecompra * ins.costoUnitario;
                    ins.stockActual = Math.round((ins.stockActual + ins.loteRecompra) * 100) / 100;
                    nextStats[negId].costoInsumosTotales += costoRecompra;
                  }
                }
              });

              // Sumar venta e ingreso
              const precio = parseFloat(prod.precioVenta) || 45;
              const costoMat = parseFloat(prod.costoMateriales) || 10;
              nextStats[negId].ingresosHoy += precio;
              nextStats[negId].ingresosTotales += precio;
              nextStats[negId].costoInsumosHoy = (nextStats[negId].costoInsumosHoy || 0) + costoMat;
              nextStats[negId].costoInsumosTotales += costoMat;
              nextStats[negId].ventasHoy += 1;
              nextStats[negId].ventasTotales += 1;
              nextStats[negId].clientesAtendidos += 1;
              nextStats[negId].productosVendidosCount[prod.id] =
                (nextStats[negId].productosVendidosCount[prod.id] || 0) + 1;

              totalIngresosSalto += precio;
              totalVentasSalto += 1;
            }
          });
        }

        // Al terminar cada día a las 23:00, registrar corte diario en el historial y reiniciar contadores del día
        if (curDate.getHours() === 23) {
          nextDiasCount += 1;
          const resumenDia = {
            fecha: formatDateShort(curDate),
            porNegocio: {}
          };
          let sumaDia = 0;
          NEGOCIOS_ACTIVOS_IDS.forEach((nId) => {
            resumenDia.porNegocio[nId] = {
              ingresos: nextStats[nId].ingresosHoy,
              ventas: nextStats[nId].ventasHoy
            };
            sumaDia += nextStats[nId].ingresosHoy;
            nextStats[nId].ingresosHoy = 0;
            nextStats[nId].costoInsumosHoy = 0;
            nextStats[nId].kwhHoy = 0;
            nextStats[nId].ventasHoy = 0;
          });
          nextHistorial = [resumenDia, ...nextHistorial.slice(0, 365)];

          if (horasASimular <= 24 * 31 || curDate.getDate() === 15 || curDate.getDate() === 30) {
            nextLogs.unshift({
              id: `log_macro_day_${cursorMs}_${Math.random()}`,
              fechaStr: resumenDia.fecha,
              horaStr: '23:00:00',
              negocioId: 'consorcio',
              tipo: 'daily_close',
              mensaje: `📅 [${resumenDia.fecha}] Hawaiian: $${resumenDia.porNegocio.hawaiian_paradise.ingresos.toFixed(0)} | Imperia: $${resumenDia.porNegocio.imperia_uniformes.ingresos.toFixed(0)} | Papelería: $${resumenDia.porNegocio.papeleria_imperiarte.ingresos.toFixed(0)} | Total Día: $${sumaDia.toFixed(2)}`
            });
          }
        }
      }

      const endDate = new Date(cursorMs);
      const labelPeriodo = {
        hour: '1 Hora',
        day: '1 Día (24h)',
        week: '1 Semana (7 días)',
        month: '1 Mes (30 días)',
        year: '1 Año Completo (365 días)'
      }[periodType] || periodType;

      nextLogs.unshift({
        id: `log_macro_summary_${Date.now()}`,
        fechaStr: formatDateShort(endDate),
        horaStr: formatTimeHHMMSS(endDate),
        negocioId: 'consorcio',
        tipo: 'sale',
        mensaje: `🚀 Simulación acelerada de [${labelPeriodo}] completada: ${totalVentasSalto.toLocaleString()} ventas realizadas | Ingresos: +$${totalIngresosSalto.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN | Consumo CFE: +${totalKwhSalto.toFixed(2)} kWh.`
      });

      // Sincronizar telemetría con Eléctrico Alacio
      simCitySyncService.syncSimulationTelemetry('consorcio_general', {
        diasSimulados: nextDiasCount,
        fechaSimulada: endDate.toISOString(),
        statsPorNegocio: nextStats
      });

      return {
        simTimeMs: cursorMs,
        diasSimuladosCount: nextDiasCount,
        ultimoDiaRegistrado: endDate.getDate(),
        ultimoMesRegistrado: endDate.getMonth(),
        statsPorNegocio: nextStats,
        inventarioPorNegocio: nextInventario,
        equiposRuntime: nextEquipos,
        historialDiario: nextHistorial.slice(0, 365),
        liveLogs: nextLogs.slice(0, 180)
      };
    });
  }
}));
