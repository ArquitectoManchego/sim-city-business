/**
 * Store Maestro de Simulación de SIM CITY BUSINESS 3D.
 * Gestiona el Reloj Multi-Velocidad (0x, 1x, 10x, 60x, 600x [1h=6s], y saltos de Día/Semana/Mes/Año),
 * Agentes (Empleados y Clientes), Stock de Materia Prima, Red Eléctrica por Medidor CFE y Log en Vivo.
 */

import { create } from 'zustand';
import {
  NEGOCIOS_ZONES_3D,
  WAYPOINTS_POR_NEGOCIO,
  TAREAS_SIN_CLIENTES_POR_NEGOCIO,
  obtenerCoreografiaProducto
} from '../engine/ChoreographyRegistry.js';
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
  pi_atomstack: { key: 'pi_atomstack', nombre: 'Grabadora y Cortadora Láser Atomstack A20 (120W)', negocioId: 'taller_publi_imperia', medidorId: 'med_3', wattsNominal: 120, fase: 'B', rol: 'produccion' }
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
  return stats;
}

function buildInitialEmpleados() {
  const map = {};
  NEGOCIOS_ACTIVOS_IDS.forEach((negId) => {
    const plantilla = PLANTILLA_DEFAULT_NEGOCIOS[negId]?.empleados || [];
    const emp1 = plantilla[0] || { id: `${negId}_emp_1`, nombre: 'Vendedor Principal', puesto: 'Operador' };
    map[negId] = {
      id: emp1.id,
      negocioId: negId,
      nombre: emp1.nombre,
      puesto: emp1.puesto,
      posicionLocal: [0.0, 0, -0.7],
      targetWaypoint: 'barra_vendedor',
      rutaActual: [],
      estado: 'IDLE_TASK', // 'IDLE_TASK' | 'ATENDIENDO_CLIENTE'
      idleTaskIndex: 0,
      idleElapsedSec: 0,
      textoAccion: 'Listo en mostrador',
      itemEnMano: null,
      clienteActualId: null,
      recetaActual: null,
      pasoActualIndex: 0,
      pasoElapsedSec: 0,
      pasoCodigoActual: null,
      pasoDuracionActual: 1.0,
      animacionActual: null,
      efectoVisualActual: null
    };
  });
  return map;
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
  focusedNegocioId: 'hawaiian_paradise', // 'ALL_CONSORCIO' | negocioId | 'CFE_METER_INSPECT'
  focusedMedidorId: 'med_3',

  // Modales del HUD
  isKpiModalOpen: false,
  isCfeReceiptModalOpen: false,
  isInventoryDrawerOpen: false,
  isMarketingModalOpen: false,

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

  // Agentes 3D y Estadísticas
  empleadosPorNegocio: buildInitialEmpleados(),
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
      mensaje: '⚡ Conectado bidireccionalmente con Eléctrico Casa Alacio Pérez (Firestore electrico-e2896). Día de Quincena activo.'
    },
    {
      id: 'log_init_2',
      fechaStr: '15 May 2026',
      horaStr: '10:15:01',
      negocioId: 'hawaiian_paradise',
      tipo: 'info',
      mensaje: '🍧 Hawaiian Paradise abierto: Máquina de raspados (600W), Crepera (3000W), Licuadora Ninja (2000W) y Gaggia (2640W) listas.'
    }
  ],

  // --- ACCIONES DE CONFIGURACIÓN Y NAVEGACIÓN ---
  setTimeScale: (scale) => set({ timeScale: scale }),
  setFocusedNegocioId: (negId) => set({ focusedNegocioId: negId }),
  setFocusedMedidorId: (medId) => set({ focusedMedidorId: medId, focusedNegocioId: 'CFE_METER_INSPECT' }),
  setEscenarioGlobal: (esc) => set({ escenarioGlobal: esc }),

  setKpiModalOpen: (open) => set({ isKpiModalOpen: open }),
  setCfeReceiptModalOpen: (open) => set({ isCfeReceiptModalOpen: open }),
  setInventoryDrawerOpen: (open) => set({ isInventoryDrawerOpen: open }),
  setMarketingModalOpen: (open) => set({ isMarketingModalOpen: open }),
  setAutoRestockEnabled: (enabled) => set({ autoRestockEnabled: enabled }),

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
   * Lanza inmediatamente un cliente hacia un negocio con un producto específico (ej. Raspado de Limón)
   */
  spawnCustomerNow: (negocioId = 'hawaiian_paradise', productoId = null) => {
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

    const condiciones = evaluarCondicionesDemanda(simDate, state.campanasActivas, state.escenarioGlobal);
    const recetasEntrenadas = useTrainingStore.getState().recetasEntrenadas;
    const collisionBlocksMap = useSceneEditorStore.getState().collisionBlocksByNegocio;

    const nextEmpleados = { ...state.empleadosPorNegocio };
    const nextColas = { ...state.clientesColaPorNegocio };
    const nextPostCompra = { ...state.clientesPostCompraPorNegocio };
    const nextSpawnAcc = { ...state.spawnAccumulators };
    const nextStats = { ...state.statsPorNegocio };
    const nextInventario = { ...state.inventarioPorNegocio };
    const nextEquipos = { ...state.equiposRuntime };
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

    // Cambio de día calendario -> guardar corte diario en historialDiario y reiniciar contadores diarios
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
      });
      nextHistorial = [resumenDia, ...nextHistorial.slice(0, 365)];
      pushLog('consorcio', 'daily_close', `📊 Cierre del Día (${resumenDia.fecha}): Ingresos Totales Consorcio = $${totalDiaConsorcio.toFixed(2)} MXN.`);
    }

    // Resetear equipos de producción en modo AUTO a OFF antes de evaluar qué paso activo los está encendiendo
    Object.keys(nextEquipos).forEach((eqKey) => {
      const eq = nextEquipos[eqKey];
      if (eq.controlMode === 'MANUAL_ON') {
        nextEquipos[eqKey] = { ...eq, estado: 'WORK', wattsActuales: eq.wattsNominal };
      } else if (eq.controlMode === 'MANUAL_OFF') {
        nextEquipos[eqKey] = { ...eq, estado: 'OFF', wattsActuales: 0 };
      } else {
        // Modo AUTO
        if (eq.rol === 'continuo_24h') {
          nextEquipos[eqKey] = { ...eq, estado: 'WORK', wattsActuales: Math.round(eq.wattsNominal * 0.45) };
        } else if (eq.rol === 'clima') {
          const enTurno = condiciones.enHorarioOperativo;
          const factorClima = enTurno ? (0.35 + condiciones.factorClimaUso * 0.45) : 0;
          nextEquipos[eqKey] = {
            ...eq,
            estado: enTurno ? 'WORK' : 'OFF',
            wattsActuales: Math.round(eq.wattsNominal * factorClima)
          };
        } else if (eq.rol === 'turno_fijo') {
          const enTurno = condiciones.enHorarioOperativo;
          nextEquipos[eqKey] = {
            ...eq,
            estado: enTurno ? 'STANDBY' : 'OFF',
            wattsActuales: enTurno ? Math.round(eq.wattsNominal * 0.65) : 0
          };
        } else {
          // Equipo de producción (raspadora, crepera, licuadora, cafetera, docucolor, bordadora, etc.)
          nextEquipos[eqKey] = { ...eq, estado: 'OFF', wattsActuales: 0 };
        }
      }
    });

    // Velocidad de caminata de los agentes en el espacio 3D (metros por segundo simulado)
    const walkSpeedMps = state.timeScale > 20 ? 6.5 : 2.35;

    const moveActorTowardsWaypoint = (actor, waypointKey, negId) => {
      const wpMap = WAYPOINTS_POR_NEGOCIO[negId] || WAYPOINTS_POR_NEGOCIO.hawaiian_paradise;
      const targetCoords = wpMap[waypointKey] || [0, 0, 0];
      const [ax, , az] = actor.posicionLocal;
      const distFinal = Math.hypot(targetCoords[0] - ax, targetCoords[2] - az);
      if (distFinal <= 0.18) {
        actor.posicionLocal = [targetCoords[0], 0, targetCoords[2]];
        actor.rutaActual = [];
        return true; // Llegó al waypoint
      }

      if (!actor.rutaActual || actor.rutaActual.length === 0 || actor.targetWaypoint !== waypointKey) {
        actor.targetWaypoint = waypointKey;
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
      } else {
        actor.posicionLocal = [
          ax + (dx / distNode) * stepDist,
          0,
          az + (dz / distNode) * stepDist
        ];
        return false;
      }
    };

    // Procesar cada unidad de negocio
    NEGOCIOS_ACTIVOS_IDS.forEach((negId) => {
      const emp = { ...nextEmpleados[negId] };
      const cola = [...(nextColas[negId] || [])];
      const postList = [...(nextPostCompra[negId] || [])];

      // 1. Spawning probabilístico de nuevos clientes
      const lambdaHora = calcularTasaClientesPorHora(negId, condiciones, state.campanasActivas);
      const nuevosEsperados = (lambdaHora / 3600) * simDeltaSec;
      nextSpawnAcc[negId] = (nextSpawnAcc[negId] || 0) + nuevosEsperados;

      if (nextSpawnAcc[negId] >= 1.0) {
        const cantSpawn = Math.floor(nextSpawnAcc[negId]);
        nextSpawnAcc[negId] -= cantSpawn;
        if (cola.length < 4) {
          const nuevoCli = crearEntidadCliente(negId, condiciones);
          cola.push(nuevoCli);
          if (state.timeScale <= 60) {
            pushLog(negId, 'client', `🚶 ${nuevoCli.nombre} entró a ${NEGOCIOS_ZONES_3D[negId].nombre} (Desea: ${nuevoCli.productoDeseado.nombre}).`);
          }
        }
      }

      // 2. Actualizar clientes que están consumiendo en mesa, de pie o saliendo del local
      const remainingPost = [];
      for (let i = 0; i < postList.length; i++) {
        const cPost = { ...postList[i] };
        const arrived = moveActorTowardsWaypoint(cPost, cPost.targetWaypoint, negId);
        if (arrived) {
          cPost.tiempoRestanteSeg = (cPost.tiempoRestanteSeg ?? 15) - simDeltaSec;
          if (cPost.tiempoRestanteSeg <= 0) {
            if (cPost.targetWaypoint !== 'acera_exterior') {
              cPost.targetWaypoint = 'acera_exterior';
              cPost.globoTexto = '¡Estuvo buenísimo! Hasta luego.';
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

      // 3. Máquina de estados del Empleado y Cliente Activo
      if (cola.length > 0) {
        const clienteActivo = { ...cola[0] };
        cola[0] = clienteActivo;

        // Cargar receta entrenada o canónica para el producto deseado del cliente
        if (emp.estado !== 'ATENDIENDO_CLIENTE' || emp.clienteActualId !== clienteActivo.id || !emp.recetaActual) {
          const receta = obtenerCoreografiaProducto(
            clienteActivo.productoDeseado.id,
            negId,
            recetasEntrenadas
          );
          emp.estado = 'ATENDIENDO_CLIENTE';
          emp.clienteActualId = clienteActivo.id;
          emp.recetaActual = receta;
          emp.pasoActualIndex = 0;
          emp.pasoElapsedSec = 0;
        }

        const pasos = emp.recetaActual.pasos || [];
        const paso = pasos[emp.pasoActualIndex] || pasos[0];

        if (paso) {
          const wpCli = paso.waypointCliente || 'barra_cliente';
          const wpVen = paso.waypointVendedor || 'barra_vendedor';

          const cliArrived = moveActorTowardsWaypoint(clienteActivo, wpCli, negId);
          const venArrived = moveActorTowardsWaypoint(emp, wpVen, negId);

          clienteActivo.globoTexto = paso.dialogoCliente || null;
          emp.textoAccion = paso.dialogoVendedor || paso.titulo;
          emp.itemEnMano = paso.itemManoVendedor || null;
          emp.pasoCodigoActual = paso.codigo || null;
          emp.pasoDuracionActual = Math.max(1.0, parseFloat(paso.duracionSegundos) || 4.0);
          emp.animacionActual = paso.animacionVendedor || null;
          emp.efectoVisualActual = paso.efectoVisual || null;

          // Encender el equipo eléctrico del paso si corresponde y está en modo AUTO
          if (paso.equipoKey && nextEquipos[paso.equipoKey]) {
            const eqTarget = nextEquipos[paso.equipoKey];
            if (eqTarget.controlMode === 'AUTO') {
              const wattsActivos = paso.estadoEquipo === 'OFF'
                ? 0
                : Math.round((paso.wattsNominales || eqTarget.wattsNominal) * (paso.factorPotencia ?? 1.0));
              nextEquipos[paso.equipoKey] = {
                ...eqTarget,
                estado: paso.estadoEquipo || 'WORK',
                wattsActuales: wattsActivos
              };
            }
          }

          // Avanzar tiempo del paso cuando los actores llegaron a su estación (o inmediato en velocidad alta >= 60x)
          if ((cliArrived && venArrived) || state.timeScale >= 60) {
            emp.pasoElapsedSec += simDeltaSec;
            const durRequerida = Math.max(1.0, parseFloat(paso.duracionSegundos) || 4.0);

            if (emp.pasoElapsedSec >= durRequerida) {
              // Descontar materia prima si este sub-paso consume un insumo
              if (paso.insumoId && paso.cantidadInsumo > 0) {
                const invList = [...(nextInventario[negId] || [])];
                const idxIns = invList.findIndex(ins => ins.id === paso.insumoId);
                if (idxIns !== -1) {
                  const ins = { ...invList[idxIns] };
                  ins.stockActual = Math.max(0, Math.round((ins.stockActual - paso.cantidadInsumo) * 100) / 100);
                  // Auto-recompra si llega al punto de reorden
                  if (ins.stockActual <= ins.puntoReorden && state.autoRestockEnabled) {
                    const costoLote = ins.loteRecompra * ins.costoUnitario;
                    ins.stockActual = Math.round((ins.stockActual + ins.loteRecompra) * 100) / 100;
                    nextStats[negId] = {
                      ...nextStats[negId],
                      costoInsumosTotales: nextStats[negId].costoInsumosTotales + costoLote
                    };
                    pushLog(negId, 'stock', `🔄 Auto-Recompra de [${ins.nombre}] (+${ins.loteRecompra} ${ins.unidad}, -$${costoLote.toFixed(2)}).`);
                  }
                  invList[idxIns] = ins;
                  nextInventario[negId] = invList;
                }
              }

              // Actualizar desgaste real de bloque de hielo (1 bloque = 10 raspados)
              if (paso.codigo === 'INSERT_ICE_BLOCK' && nextEquipos.hp_raspadora) {
                const maxRasp = nextEquipos.hp_raspadora.maxRaspadosPorBloque || 10;
                nextEquipos.hp_raspadora = {
                  ...nextEquipos.hp_raspadora,
                  raspadosRestantesHielo: maxRasp
                };
                pushLog(negId, 'stock', `🧊 Bloque de hielo nuevo cargado en raspadora (${maxRasp}/${maxRasp} raspados).`);
              } else if (
                (paso.codigo === 'PUSH_LEVER_SHAVE_ICE' || paso.codigo === 'SHAVE_ICE') &&
                nextEquipos.hp_raspadora
              ) {
                const prevRasp = nextEquipos.hp_raspadora.raspadosRestantesHielo ?? 10;
                const rem = Math.max(0, prevRasp - 1);
                nextEquipos.hp_raspadora = {
                  ...nextEquipos.hp_raspadora,
                  raspadosRestantesHielo: rem
                };
                if (rem === 0) {
                  pushLog(negId, 'info', '🧊 Bloque de hielo agotado tras 10 raspados; el siguiente cliente requerirá recarga.');
                }
              }

              // Detectar si el sub-paso que acaba de concluir es el pago en caja TPV
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

              // Pasar al siguiente sub-paso o concluir la venta/atención
              if (emp.pasoActualIndex + 1 < pasos.length) {
                emp.pasoActualIndex += 1;
                emp.pasoElapsedSec = 0;

                // Si aún queda hielo en cámara (> 0 de 10 raspados), omitir recarga e ir directo al botón ON
                const nextPasoCheck = pasos[emp.pasoActualIndex];
                if (
                  nextPasoCheck?.codigo === 'INSERT_ICE_BLOCK' &&
                  (nextEquipos.hp_raspadora?.raspadosRestantesHielo ?? 10) > 0 &&
                  emp.pasoActualIndex + 1 < pasos.length
                ) {
                  emp.pasoActualIndex += 1;
                }

                // En Imperia Uniformes: verificar si tras el probador (paso 3) el cliente decide NO comprar
                if (
                  negId === 'imperia_uniformes' &&
                  paso.codigo === 'CLIENT_TRY_DRESSING_ROOM' &&
                  !clienteActivo.compraraTrasPrueba
                ) {
                  nextStats[negId] = {
                    ...nextStats[negId],
                    clientesSinCompra: nextStats[negId].clientesSinCompra + 1
                  };
                  pushLog(
                    negId,
                    'info',
                    `🚪 ${clienteActivo.nombre} se probó ${clienteActivo.productoDeseado.nombre} en el vestidor pero decidió no comprarlo hoy.`
                  );
                  const cliSaliente = cola.shift();
                  cliSaliente.targetWaypoint = 'acera_exterior';
                  cliSaliente.tiempoRestanteSeg = 5;
                  cliSaliente.globoTexto = 'Gracias, regresaré en quincena.';
                  nextPostCompra[negId] = [...nextPostCompra[negId], cliSaliente];
                  emp.estado = 'IDLE_TASK';
                  emp.clienteActualId = null;
                  emp.recetaActual = null;
                }
              } else {
                // ¡Receta y entrega completada! Registrar ingreso financiero y estadística de producto
                const prodVendido = clienteActivo.productoDeseado;
                const precio = parseFloat(prodVendido.precioVenta) || 45;
                const costoMat = parseFloat(prodVendido.costoMateriales) || 10;
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

                // Si Imperia Uniformes levantó un pedido corporativo, enviar orden a Taller de Costura
                if (prodVendido.id === 'imp_pedido_corporativo_lote' && nextColas.taller_costura.length < 3) {
                  const ordenTaller = crearEntidadCliente('taller_costura', condiciones, 'tc_filipina_chef');
                  ordenTaller.nombre = `Orden Interna Imperia (${clienteActivo.nombre})`;
                  nextColas.taller_costura = [...nextColas.taller_costura, ordenTaller];
                }

                // Determinar comportamiento post-compra del cliente (Sentarse en mesa, quedarse de pie o salir)
                const cliTerminado = cola.shift();
                cliTerminado.tieneProductoEnMano = true;

                let postDestino = 'acera_exterior';
                let postMsg = 'salió del local con su compra';
                if (negId === 'hawaiian_paradise') {
                  if (cliTerminado.decisionPostCompra === 'sentado_mesa') {
                    postDestino = Math.random() < 0.5 ? 'mesa_1_silla_1' : 'mesa_2_silla_1';
                    cliTerminado.globoTexto = `😋 Disfrutando ${prodVendido.nombre} en la mesa`;
                    postMsg = 'se sentó en una mesa a consumir su producto';
                  } else if (cliTerminado.decisionPostCompra === 'de_pie') {
                    postDestino = Math.random() < 0.5 ? 'consumo_pie_1' : 'consumo_pie_2';
                    cliTerminado.globoTexto = `🍧 Consumiendo ${prodVendido.nombre} de pie`;
                    postMsg = 'se quedó consumiendo su producto de pie';
                  } else {
                    postDestino = 'acera_exterior';
                    cliTerminado.globoTexto = '¡Qué rico raspado!';
                  }
                } else {
                  cliTerminado.globoTexto = '¡Excelente servicio!';
                }

                cliTerminado.targetWaypoint = postDestino;
                cliTerminado.tiempoRestanteSeg = cliTerminado.tiempoConsumoPostSeg || 15;
                nextPostCompra[negId] = [...nextPostCompra[negId], cliTerminado];

                pushLog(
                  negId,
                  'sale',
                  `💰 Venta en ${NEGOCIOS_ZONES_3D[negId].nombre}: ${prodVendido.nombre} (+$${precio.toFixed(2)} MXN) a ${cliTerminado.nombre}, quien ${postMsg}.`
                );

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
      } else {
        // 4. Sin clientes en cola -> Empleado ejecuta sus tareas de mantenimiento/preparación interna
        emp.estado = 'IDLE_TASK';
        emp.itemEnMano = null;
        emp.pasoCodigoActual = null;
        emp.animacionActual = null;
        emp.efectoVisualActual = null;
        const listaTareas = TAREAS_SIN_CLIENTES_POR_NEGOCIO[negId] || TAREAS_SIN_CLIENTES_POR_NEGOCIO.hawaiian_paradise;
        const tarea = listaTareas[emp.idleTaskIndex % listaTareas.length];
        emp.textoAccion = tarea.texto;

        const arrivedIdle = moveActorTowardsWaypoint(emp, tarea.waypoint, negId);
        if (arrivedIdle) {
          emp.idleElapsedSec += simDeltaSec;
          if (emp.idleElapsedSec >= (tarea.duracion || 10)) {
            emp.idleElapsedSec = 0;
            emp.idleTaskIndex = (emp.idleTaskIndex + 1) % listaTareas.length;
          }
        }
      }

      // Mover en fila a los clientes en espera (índices 1..N de la cola)
      for (let cIdx = 1; cIdx < cola.length; cIdx++) {
        const cliFila = { ...cola[cIdx] };
        const wpEspera = cIdx === 1 ? 'puerta_entrada' : 'acera_exterior';
        moveActorTowardsWaypoint(cliFila, wpEspera, negId);
        cliFila.globoTexto = `En fila (#${cIdx + 1}) para ${cliFila.productoDeseado.nombre}`;
        cola[cIdx] = cliFila;
      }

      nextEmpleados[negId] = emp;
      nextColas[negId] = cola;
    });

    // 5. Integrar el consumo de energía eléctrica (Wh -> kWh) de cada aparato activo en este tick
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
      empleadosPorNegocio: nextEmpleados,
      clientesColaPorNegocio: nextColas,
      clientesPostCompraPorNegocio: nextPostCompra,
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
