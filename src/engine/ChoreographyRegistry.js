/**
 * Registro Maestro de Zonas Espaciales 3D, Waypoints de Interacción, Coreografías Paso a Paso
 * por Producto y Tareas Sin Clientes (Idle Tasks) para las Unidades de Negocio del Consorcio.
 */

import {
  buildImperiaShowroomRecipe,
  buildSewingWorkshopRecipe,
  buildEmbroideryRecipe,
  buildPubliPrintRecipe,
  UNIVERSAL_HUMAN_ROUTINES,
  IMPERIA_SPECIAL_ROUTINES
} from './ProcessFactory.js';
import { IMPERIARTE_CATALOG_DB } from '../shared/imperiarteCatalogDB.js';

// ============================================================================
// 1. ZONAS ARQUITECTÓNICAS 3D DE LOS LOCALES COMERCIALES (PLANTA DEL INMUEBLE)
// ============================================================================
export const NEGOCIOS_ZONES_3D = {
  hawaiian_paradise: {
    id: 'hawaiian_paradise',
    nombre: 'Hawaiian Paradise',
    subtitulo: 'Cafetería, Raspados, Crepas & Marquesitas',
    colorHex: '#f59e0b',
    pisoColorHex: '#1e293b',
    muroColorHex: '#334155',
    center: [-14, 0, -6],
    size: [12, 3.2, 10], // Ancho X, Alto Y, Fondo Z
    cameraPreset: { position: [-14, 11, 6], target: [-14, 0.8, -6] },
    medidorDefault: 'med_3'
  },
  imperia_uniformes: {
    id: 'imperia_uniformes',
    nombre: 'Imperia Uniformes',
    subtitulo: '6 Estantes por Rama, Probadores, Bordado & Pedidos B2B',
    colorHex: '#10b981',
    pisoColorHex: '#0f172a',
    muroColorHex: '#1e293b',
    center: [0, 0, -6],
    size: [12, 3.2, 10],
    cameraPreset: { position: [0, 11, 6], target: [0, 0.8, -6] },
    medidorDefault: 'med_1'
  },
  papeleria_imperiarte: {
    id: 'papeleria_imperiarte',
    nombre: 'Papelería ImperiArte',
    subtitulo: 'Copiado Xerox DocuColor & Maquetería',
    colorHex: '#3b82f6',
    pisoColorHex: '#172554',
    muroColorHex: '#1e3a8a',
    center: [14, 0, -6],
    size: [12, 3.2, 10],
    cameraPreset: { position: [14, 11, 6], target: [14, 0.8, -6] },
    medidorDefault: 'med_2'
  },
  bordados_veracruz: {
    id: 'bordados_veracruz',
    nombre: 'Bordados Veracruz',
    subtitulo: 'Bordadoras Industriales 4 Cabezas AEMCO & Melco',
    colorHex: '#f43f5e',
    pisoColorHex: '#1f1224',
    muroColorHex: '#3b1d38',
    center: [-14, 0, 8],
    size: [12, 3.2, 10],
    cameraPreset: { position: [-14, 11, 20], target: [-14, 0.8, 8] },
    medidorDefault: 'med_4'
  },
  taller_costura: {
    id: 'taller_costura',
    nombre: 'Taller de Costura Imperia',
    subtitulo: 'Trazo, Corte, Overlock 5H, Rectas Singer, Collaretera & Vapor',
    colorHex: '#a855f7',
    pisoColorHex: '#1e1b4b',
    muroColorHex: '#312e81',
    center: [0, 0, 8],
    size: [12, 3.2, 10],
    cameraPreset: { position: [0, 11, 20], target: [0, 0.8, 8] },
    medidorDefault: 'med_5'
  },
  taller_publi_imperia: {
    id: 'taller_publi_imperia',
    nombre: 'Publi-Impresos',
    subtitulo: 'DTF, Sublimación, Vinil Textil, Láser CNC & Almacén B2B',
    colorHex: '#06b6d4',
    pisoColorHex: '#082f49',
    muroColorHex: '#0c4a6e',
    center: [14, 0, 8],
    size: [12, 3.2, 10],
    cameraPreset: { position: [14, 11, 20], target: [14, 0.8, 8] },
    medidorDefault: 'med_6'
  }
};

export const OFICINA_CONSORCIO_ZONE = {
  id: 'oficinas_consorcio',
  nombre: 'Oficina Consorcio',
  subtitulo: 'Dirección, Diseño PC, Clima A/C, Smart TV y Descanso Familiar',
  colorHex: '#facc15',
  pisoColorHex: '#1e293b',
  muroColorHex: '#334155',
  center: [26.5, 0, 1],
  size: [8.5, 3.2, 8.5],
  cameraPreset: { position: [26.5, 9.5, 11], target: [26.5, 0.8, 1] },
  medidorDefault: 'med_3'
};

export const ALL_ZONES_3D = {
  ...NEGOCIOS_ZONES_3D,
  oficinas_consorcio: OFICINA_CONSORCIO_ZONE
};

// ============================================================================
// 2. WAYPOINTS Y ESTACIONES 3D POR NEGOCIO (COORDENADAS LOCALES AL CENTRO DEL LOCAL)
// ============================================================================
export const WAYPOINTS_POR_NEGOCIO = {
  hawaiian_paradise: {
    puerta_entrada: [0, 0, 4.6],
    acera_exterior: [-4.5, 0, 5.4],
    barra_cliente: [-1.2, 0, 0.85],
    barra_vendedor: [-1.2, 0, -0.65],
    caja_tpv_cliente: [1.5, 0, 0.85],
    caja_tpv_vendedor: [1.5, 0, -0.65],
    barra_entrega_cliente: [0.2, 0, 0.85],
    barra_entrega_vendedor: [0.2, 0, -0.65],
    // Equipos de preparación (detrás de la barra)
    eq_hp_raspadora: [-4.32, 0, -2.65],
    eq_hp_crepera: [-1.8, 0, -3.4],
    eq_hp_marquesitera: [0.0, 0, -3.4],
    eq_hp_licuadora: [1.8, 0, -3.4],
    eq_hp_breville: [3.6, 0, -3.4],
    eq_hp_tetera: [4.5, 0, -1.8],
    eq_hp_bano_maria: [-4.5, 0, -0.5],
    // Estaciones de materia prima e insumos
    raw_congelador_hielo: [-4.6, 0, -3.4],
    raw_dispensador_vasos: [-3.0, 0, -1.5],
    raw_estacion_jarabes: [-2.4, 0, -1.5],
    raw_refrigerador_insumos: [4.6, 0, -3.4],
    raw_barra_toppings: [-0.8, 0, -2.0],
    raw_tolva_cafe: [3.0, 0, -2.2],
    // Puntos de consumo y descanso
    consumo_pie_1: [-4.2, 0, 2.2],
    consumo_pie_2: [-2.8, 0, 3.2],
    mesa_1_silla_1: [2.6, 0, 2.5],
    mesa_1_silla_2: [3.8, 0, 2.5],
    mesa_2_silla_1: [-0.8, 0, 3.0],
    mesa_2_silla_2: [0.6, 0, 3.0],
    bano_empleado: [-4.8, 0, 1.0],
    espera_bano: [-3.8, 0, 1.0],
    espera_1: [2.4, 0, 1.8]
  },

  imperia_uniformes: {
    puerta_entrada: [0, 0, 4.6],
    acera_exterior: [4.5, 0, 5.4],
    area_maniquies_entrada: [-2.6, 0, 5.1],
    barra_cliente: [-0.8, 0, 0.5],
    barra_vendedor: [-0.8, 0, -0.7],
    caja_tpv_cliente: [1.6, 0, 0.5],
    caja_tpv_vendedor: [1.6, 0, -0.7],
    barra_entrega_cliente: [0.4, 0, 0.5],
    barra_entrega_vendedor: [0.4, 0, -0.7],
    // 6 Estantes especializados + Estante de Pedidos Listos para Entregar
    rack_gastronomia: [-4.4, 0, -3.15],
    rack_enfermeria: [-2.65, 0, -3.15],
    rack_medicina: [-0.9, 0, -3.15],
    rack_escolares: [0.9, 0, -3.15],
    rack_industriales: [2.65, 0, -3.15],
    rack_proveedores: [4.4, 0, -3.15],
    rack_pedidos_listos: [4.2, 0, -1.0],
    // Alias heredados para compatibilidad de recetas guardadas
    raw_rack_clinico: [-2.65, 0, -3.15],
    raw_rack_gourmet: [-4.4, 0, -3.15],
    raw_rack_premium: [4.4, 0, -3.15],
    raw_mostrador_empaque: [3.2, 0, -1.0],
    probador_1: [-4.3, 0, 2.2],
    probador_2: [-4.3, 0, 3.6],
    bano_empleado: [-4.6, 0, 0.2],
    espera_bano: [-3.6, 0, 0.2],
    espera_1: [2.5, 0, 2.4],
    espera_showroom_1: [2.5, 0, 2.4],
    espera_showroom_2: [3.8, 0, 2.4]
  },

  papeleria_imperiarte: {
    puerta_entrada: [0, 0, 4.6],
    acera_exterior: [4.5, 0, 5.4],
    barra_cliente: [-1.0, 0, 0.6],
    barra_vendedor: [-1.0, 0, -0.6],
    caja_tpv_cliente: [1.4, 0, 0.6],
    caja_tpv_vendedor: [1.4, 0, -0.6],
    barra_entrega_cliente: [0.2, 0, 0.6],
    barra_entrega_vendedor: [0.2, 0, -0.6],
    eq_pap_docucolor: [-3.2, 0, -3.0],
    raw_estante_papel: [-0.5, 0, -2.5],
    raw_estante_toner: [-1.8, 0, -2.8],
    raw_rack_pliegos: [3.2, 0, -2.5],
    rack_horizontal_cartones: [3.2, 0, -2.5],
    rack_horizontal_papeles: [0.4, 0, -2.5],
    rack_bastidores_caballetes: [-4.1, 0, -0.8],
    rack_pinturas_medios: [-2.2, 0, -2.8],
    rack_marcadores_dibujo: [2.8, 0, -0.2],
    rack_pinceles_herramientas: [4.2, 0, -0.2],
    bano_empleado: [-4.6, 0, 1.0],
    espera_bano: [-3.6, 0, 1.0],
    espera_1: [-3.0, 0, 2.5],
    espera_2: [2.8, 0, 2.5]
  },

  bordados_veracruz: {
    puerta_entrada: [0, 0, 4.6],
    acera_exterior: [-4.5, 0, 5.4],
    barra_cliente: [-1.0, 0, 1.2],
    barra_vendedor: [-1.0, 0, 0.0],
    caja_tpv_cliente: [1.2, 0, 1.2],
    caja_tpv_vendedor: [1.2, 0, 0.0],
    barra_entrega_cliente: [0.0, 0, 1.2],
    barra_entrega_vendedor: [0.0, 0, 0.0],
    eq_bv_aemco_220: [-2.8, 0, -2.8],
    eq_bv_melco_emc: [2.6, 0, -2.8],
    raw_estante_hilos: [-4.4, 0, -1.2],
    raw_mesa_bastidores: [0.0, 0, -2.2],
    bano_empleado: [4.6, 0, -1.0],
    espera_bano: [3.6, 0, -1.0],
    espera_1: [3.2, 0, 2.6]
  },

  taller_costura: {
    puerta_entrada: [0, 0, 4.6],
    acera_exterior: [4.5, 0, 5.4],
    barra_cliente: [-1.0, 0, 1.5],
    barra_vendedor: [-1.0, 0, 0.3],
    caja_tpv_cliente: [1.2, 0, 1.5],
    caja_tpv_vendedor: [1.2, 0, 0.3],
    barra_entrega_cliente: [0.0, 0, 1.5],
    barra_entrega_vendedor: [0.0, 0, 0.3],
    eq_tc_cortadora: [-3.0, 0, -2.8],
    eq_tc_overlock_5h: [-1.2, 0, -3.2],
    eq_tc_rectas_singer: [1.2, 0, -3.2],
    eq_tc_collaretera_singer: [3.5, 0, -3.0],
    eq_tc_plancha_vapor: [3.8, 0, -0.8],
    raw_mesa_corte_telas: [-3.0, 0, -1.2],
    raw_estante_avios: [-1.6, 0, -1.2],
    bano_empleado: [-4.6, 0, 2.5],
    espera_bano: [-3.6, 0, 2.5],
    espera_1: [3.0, 0, 2.8]
  },

  taller_publi_imperia: {
    puerta_entrada: [0, 0, 4.6],
    acera_exterior: [4.5, 0, 5.4],
    barra_cliente: [-1.0, 0, 1.0],
    barra_vendedor: [-1.0, 0, -0.2],
    caja_tpv_cliente: [1.4, 0, 1.0],
    caja_tpv_vendedor: [1.4, 0, -0.2],
    barra_entrega_cliente: [0.2, 0, 1.0],
    barra_entrega_vendedor: [0.2, 0, -0.2],
    eq_pi_pc_diseno: [-4.0, 0, -1.2],
    eq_pi_epson: [-4.0, 0, -3.0],
    eq_pi_plancha_tazas: [-1.6, 0, -3.2],
    eq_pi_plancha_plana: [0.8, 0, -3.2],
    eq_pi_atomstack: [3.6, 0, -3.0],
    raw_estante_blanks: [4.2, 0, -0.8],
    raw_almacen_b2b: [4.4, 0, 2.0],
    raw_mesa_impresion: [-2.2, 0, -1.8],
    bano_empleado: [-4.6, 0, 2.4],
    espera_bano: [-3.6, 0, 2.4],
    espera_1: [3.0, 0, 2.8]
  },

  oficinas_consorcio: {
    puerta_entrada: [0, 0, 3.8],
    acera_exterior: [0, 0, 4.8],
    eq_oc_laptop_diseno: [-2.2, 0, -1.8],
    eq_oc_tv_32: [2.2, 0, -3.4],
    eq_oc_ac_1tr: [0, 0, -3.5],
    sofa_tv_1: [1.6, 0, -0.8],
    sofa_tv_2: [2.5, 0, -0.8],
    sofa_tv_3: [3.2, 0, -0.8],
    mesa_comer_1: [-2.2, 0, 1.4],
    mesa_comer_2: [-1.0, 0, 1.4],
    bano_empleado: [-3.4, 0, 2.8],
    espera_bano: [-2.4, 0, 2.8],
    espera_1: [1.5, 0, 1.5]
  }
};

// ============================================================================
// 3. RECETAS COREOGRAFIADAS PASO A PASO (EDITABLES EN MODO ENTRENAMIENTO)
// ============================================================================
export const RECETAS_COREOGRAFICAS_DETALLADAS = {
  // --------------------------------------------------------------------------
  // CASO CANÓNICO PRINCIPAL: RASPADO DE LIMÓN EN HAWAIIAN PARADISE
  // --------------------------------------------------------------------------
  hp_raspado: {
    id: 'hp_raspado',
    negocioId: 'hawaiian_paradise',
    nombreProducto: 'Raspado de Limón Clásico Hawaiian',
    precioVenta: 45.00,
    descripcionIA: 'Atención en barra, cobro en TPV ($45), recarga de bloque en compuerta central cada 10 raspados, encendido derecho (600W), vaso bajo hueco derecho, giro de manivela izquierda (12.5s) empujando el hielo contra las cuchillas, apagado derecho, jarabeado de limón y entrega.',
    pasos: [
      {
        id: 'step_1',
        orden: 1,
        codigo: 'CLIENT_CALL_SELLER',
        titulo: 'Cliente llega a barra y llama al vendedor',
        descripcion: 'El cliente entra al local, camina a la barra y manda a llamar al vendedor.',
        actor: 'cliente',
        waypointCliente: 'barra_cliente',
        waypointVendedor: null,
        duracionSegundos: 3.5,
        equipoKey: null,
        estadoEquipo: 'OFF',
        wattsNominales: 0,
        factorPotencia: 0,
        insumoId: null,
        cantidadInsumo: 0,
        dialogoCliente: '¡Hola! ¿Me atiendes por favor?',
        dialogoVendedor: null,
        itemManoVendedor: null,
        animacionVendedor: 'TALK_CLIENT',
        efectoVisual: null
      },
      {
        id: 'step_2',
        orden: 2,
        codigo: 'SELLER_APPROACH_FRONT',
        titulo: 'Vendedor se acerca y se coloca de frente',
        descripcion: 'El vendedor acude al llamado y se posiciona en la barra exactamente de frente al cliente.',
        actor: 'vendedor',
        waypointCliente: 'barra_cliente',
        waypointVendedor: 'barra_vendedor',
        duracionSegundos: 3.0,
        equipoKey: null,
        estadoEquipo: 'OFF',
        wattsNominales: 0,
        factorPotencia: 0,
        insumoId: null,
        cantidadInsumo: 0,
        dialogoCliente: '¿Qué precio tiene el raspado?',
        dialogoVendedor: '¡Bienvenido a Hawaiian! Cuesta $45 pesos.',
        itemManoVendedor: null,
        animacionVendedor: 'TALK_CLIENT',
        efectoVisual: null
      },
      {
        id: 'step_3',
        orden: 3,
        codigo: 'ORDER_AND_AGREEMENT',
        titulo: 'Pide Raspado de Limón y llegan a acuerdo',
        descripcion: 'El cliente elige sabor Limón, acuerdan la compra y se dirigen a la caja.',
        actor: 'ambos',
        waypointCliente: 'barra_cliente',
        waypointVendedor: 'barra_vendedor',
        duracionSegundos: 3.5,
        equipoKey: null,
        estadoEquipo: 'OFF',
        wattsNominales: 0,
        factorPotencia: 0,
        insumoId: null,
        cantidadInsumo: 0,
        dialogoCliente: 'Me da un Raspado de Limón por favor.',
        dialogoVendedor: '¡Claro que sí! Pasamos a la caja a cobrar.',
        itemManoVendedor: null,
        animacionVendedor: 'TALK_CLIENT',
        efectoVisual: null
      },
      {
        id: 'step_4',
        orden: 4,
        codigo: 'PAY_AT_CASHIER_TPV',
        titulo: 'Pago en Caja Registradora / TPV',
        descripcion: 'El cliente pasa a la caja a pagar $45.00; el vendedor registra el ticket en el TPV.',
        actor: 'ambos',
        waypointCliente: 'caja_tpv_cliente',
        waypointVendedor: 'caja_tpv_vendedor',
        duracionSegundos: 5.5,
        equipoKey: 'hp_tpv',
        estadoEquipo: 'WORK',
        wattsNominales: 280,
        factorPotencia: 0.75,
        apagarAlFinal: false,
        insumoId: null,
        cantidadInsumo: 0,
        dialogoCliente: 'Aquí tiene los $45.00.',
        dialogoVendedor: '¡Gracias! En seguida preparo su raspado de limón.',
        itemManoVendedor: 'ticket',
        animacionVendedor: 'OPERATE_TPV',
        efectoVisual: 'cash_register'
      },
      {
        id: 'step_5',
        orden: 5,
        codigo: 'INSERT_ICE_BLOCK',
        titulo: 'Abrir compuerta central e insertar bloque de hielo (cada 10 raspados)',
        descripcion: 'Abre la compuerta blanca con ventana Hawaiian Paradise, carga un bloque nuevo de hielo (rinde 10 raspados) y cierra la cámara.',
        actor: 'vendedor',
        waypointCliente: 'barra_entrega_cliente',
        waypointVendedor: 'eq_hp_raspadora',
        duracionSegundos: 5.0,
        equipoKey: 'hp_raspadora',
        estadoEquipo: 'PREP',
        wattsNominales: 600,
        factorPotencia: 0.0,
        apagarAlFinal: false,
        insumoId: 'mat_hielo_bloque',
        cantidadInsumo: 2.5,
        dialogoCliente: null,
        dialogoVendedor: '🧊 Abriendo compuerta central e insertando bloque de hielo (10/10)...',
        itemManoVendedor: 'ice_block',
        animacionVendedor: 'CARRY_BOWL',
        efectoVisual: 'load_ice'
      },
      {
        id: 'step_6',
        orden: 6,
        codigo: 'TURN_ON_SHAVER',
        titulo: 'Presionar botón derecho de encendido (600W)',
        descripcion: 'El vendedor presiona el interruptor ON del lado derecho debajo del motor para arrancar las cuchillas giratorias.',
        actor: 'vendedor',
        waypointCliente: 'barra_entrega_cliente',
        waypointVendedor: 'eq_hp_raspadora',
        duracionSegundos: 2.0,
        equipoKey: 'hp_raspadora',
        estadoEquipo: 'WORK',
        wattsNominales: 600,
        factorPotencia: 1.0,
        apagarAlFinal: false,
        insumoId: null,
        cantidadInsumo: 0,
        dialogoCliente: null,
        dialogoVendedor: '⚡ Presionando botón derecho ON de la raspadora (600W)',
        itemManoVendedor: null,
        animacionVendedor: 'PRESS_RIGHT_SWITCH',
        efectoVisual: 'machine_on'
      },
      {
        id: 'step_7',
        orden: 7,
        codigo: 'PLACE_CUP_UNDER_SPOUT',
        titulo: 'Colocar vaso bajo hueco derecho de salida de hielo',
        descripcion: 'El vendedor toma un vaso de 12oz y lo coloca debajo del conducto derecho con letrero de peligro.',
        actor: 'vendedor',
        waypointCliente: 'barra_entrega_cliente',
        waypointVendedor: 'eq_hp_raspadora',
        duracionSegundos: 2.5,
        equipoKey: 'hp_raspadora',
        estadoEquipo: 'WORK',
        wattsNominales: 600,
        factorPotencia: 0.85,
        apagarAlFinal: false,
        insumoId: 'mat_vaso_12oz',
        cantidadInsumo: 1,
        dialogoCliente: null,
        dialogoVendedor: 'Colocando vaso debajo de la salida de hielo...',
        itemManoVendedor: 'empty_cup',
        animacionVendedor: 'CARRY_PLATE',
        efectoVisual: null
      },
      {
        id: 'step_8',
        orden: 8,
        codigo: 'PUSH_LEVER_SHAVE_ICE',
        titulo: 'Girar manivela izquierda y llenar vaso con hielo (10-15s)',
        descripcion: 'Gira la manivela del lado izquierdo empujando la barra interna sobre el hielo contra las cuchillas mientras el hielo triturado llena el vaso en 12.5s.',
        actor: 'vendedor',
        waypointCliente: 'barra_entrega_cliente',
        waypointVendedor: 'eq_hp_raspadora',
        duracionSegundos: 12.5,
        equipoKey: 'hp_raspadora',
        estadoEquipo: 'WORK',
        wattsNominales: 600,
        factorPotencia: 1.0,
        apagarAlFinal: false,
        insumoId: null,
        cantidadInsumo: 0,
        dialogoCliente: null,
        dialogoVendedor: '🍧 Girando manivela izquierda y rallando hielo (12.5s)...',
        itemManoVendedor: null,
        animacionVendedor: 'CRANK_LEFT_HANDLE',
        efectoVisual: 'shaving_ice_particles'
      },
      {
        id: 'step_9',
        orden: 9,
        codigo: 'TURN_OFF_SHAVER',
        titulo: 'Presionar botón derecho de apagado y retirar vaso',
        descripcion: 'Con el vaso lleno de hielo triturado, presiona el botón derecho de apagado (0W) y retira el vaso.',
        actor: 'vendedor',
        waypointCliente: 'barra_entrega_cliente',
        waypointVendedor: 'eq_hp_raspadora',
        duracionSegundos: 2.0,
        equipoKey: 'hp_raspadora',
        estadoEquipo: 'OFF',
        wattsNominales: 600,
        factorPotencia: 0.0,
        apagarAlFinal: true,
        insumoId: null,
        cantidadInsumo: 0,
        dialogoCliente: null,
        dialogoVendedor: '🔌 Botón derecho en OFF (0W) — Vaso lleno de nieve',
        itemManoVendedor: 'shaved_ice_cup',
        animacionVendedor: 'PRESS_RIGHT_SWITCH',
        efectoVisual: 'machine_off'
      },
      {
        id: 'step_10',
        orden: 10,
        codigo: 'MOVE_AND_POUR_SYRUP',
        titulo: 'Ir a estación de jarabes y servir jarabe de limón lentamente',
        descripcion: 'El vendedor se mueve a la estación de jarabes, toma la botella de Limón y lo sirve lentamente.',
        actor: 'vendedor',
        waypointCliente: 'barra_entrega_cliente',
        waypointVendedor: 'raw_estacion_jarabes',
        duracionSegundos: 6.5,
        equipoKey: null,
        estadoEquipo: 'OFF',
        wattsNominales: 0,
        factorPotencia: 0,
        insumoId: 'mat_jarabe_limon',
        cantidadInsumo: 0.06,
        dialogoCliente: null,
        dialogoVendedor: '🍋 Sirviendo jarabe natural de limón lentamente...',
        itemManoVendedor: 'lemon_syrup_pouring',
        efectoVisual: 'pouring_green_syrup'
      },
      {
        id: 'step_11',
        orden: 11,
        codigo: 'PLACE_STRAW',
        titulo: 'Colocar popote y cuchara en el raspado',
        descripcion: 'El vendedor toma un popote y lo inserta en el vaso de raspado de limón.',
        actor: 'vendedor',
        waypointCliente: 'barra_entrega_cliente',
        waypointVendedor: 'raw_estacion_jarabes',
        duracionSegundos: 2.5,
        equipoKey: null,
        estadoEquipo: 'OFF',
        wattsNominales: 0,
        factorPotencia: 0,
        insumoId: 'mat_popote_cuchara',
        cantidadInsumo: 1,
        dialogoCliente: null,
        dialogoVendedor: 'Colocando popote biodegradable...',
        itemManoVendedor: 'finished_lemon_raspado',
        efectoVisual: null
      },
      {
        id: 'step_12',
        orden: 12,
        codigo: 'DELIVER_PRODUCT',
        titulo: 'Entregar Raspado de Limón al cliente en barra',
        descripcion: 'El vendedor se acerca a la barra de entrega y le da el raspado terminado al cliente.',
        actor: 'ambos',
        waypointCliente: 'barra_entrega_cliente',
        waypointVendedor: 'barra_entrega_vendedor',
        duracionSegundos: 3.5,
        equipoKey: null,
        estadoEquipo: 'OFF',
        wattsNominales: 0,
        factorPotencia: 0,
        insumoId: null,
        cantidadInsumo: 0,
        dialogoCliente: '¡Se ve delicioso, muchas gracias!',
        dialogoVendedor: '¡Aquí tiene su Raspado de Limón! Que lo disfrute.',
        itemManoVendedor: 'finished_lemon_raspado',
        efectoVisual: 'sale_complete'
      }
    ]
  },

  // --------------------------------------------------------------------------
  // HAWAIIAN PARADISE: CREPA DULCE O SALADA (hp_crepa)
  // --------------------------------------------------------------------------
  hp_crepa: {
    id: 'hp_crepa',
    negocioId: 'hawaiian_paradise',
    nombreProducto: 'Crepa Dulce o Salada (Crepera Profesional)',
    precioVenta: 75.00,
    descripcionIA: 'Atención en barra, cobro en TPV ($75), encendido y precalentado de crepera a 200°C, toma de traste con batter, vertido lento, extendido circular con rastrillo, cocción dorada, aplicación de ingredientes, doblado en plato con apagado y entrega.',
    pasos: [
      {
        id: 'crepa_1',
        orden: 1,
        codigo: 'CLIENT_ORDER_CREPA',
        titulo: 'Cliente solicita Crepa en barra y acuerda precio ($75)',
        descripcion: 'Cliente llega a la barra, llama al vendedor y pide una Crepa de Nutella con fresa y plátano.',
        actor: 'ambos',
        waypointCliente: 'barra_cliente',
        waypointVendedor: 'barra_vendedor',
        duracionSegundos: 4.5,
        equipoKey: null,
        estadoEquipo: 'OFF',
        wattsNominales: 0,
        factorPotencia: 0,
        animacionVendedor: 'TALK_CLIENT',
        dialogoCliente: '¡Hola! ¿Me prepara una Crepa con Nutella, fresa y plátano?',
        dialogoVendedor: '¡Con gusto! Son $75 pesos en caja.'
      },
      {
        id: 'crepa_2',
        orden: 2,
        codigo: 'PAY_CREPA_TPV',
        titulo: 'Cobro de Crepa en TPV ($75)',
        descripcion: 'Registro de comanda y cobro en TPV con apertura de cajón de efectivo.',
        actor: 'ambos',
        waypointCliente: 'caja_tpv_cliente',
        waypointVendedor: 'caja_tpv_vendedor',
        duracionSegundos: 5.0,
        equipoKey: 'hp_tpv',
        estadoEquipo: 'WORK',
        wattsNominales: 280,
        factorPotencia: 0.70,
        apagarAlFinal: false,
        itemManoVendedor: 'ticket',
        animacionVendedor: 'OPERATE_TPV',
        dialogoCliente: 'Listo, aquí tiene.',
        dialogoVendedor: '¡Gracias! Enciendo la crepera de inmediato.'
      },
      {
        id: 'crepa_3',
        orden: 3,
        codigo: 'PREHEAT_CREPERA',
        titulo: 'Encender crepera y esperar precalentamiento (200°C)',
        descripcion: 'Gira el termostato de la crepera a 200°C y espera a que la placa alcance temperatura.',
        actor: 'vendedor',
        waypointCliente: 'barra_entrega_cliente',
        waypointVendedor: 'eq_hp_crepera',
        duracionSegundos: 16.0,
        equipoKey: 'hp_crepera',
        estadoEquipo: 'PREHEAT',
        wattsNominales: 3000,
        factorPotencia: 1.0,
        apagarAlFinal: false,
        animacionVendedor: 'WAIT_HEATING',
        efectoVisual: 'crepe_preheat',
        dialogoVendedor: '🔥 Encendiendo crepera y esperando que caliente a 200°C...'
      },
      {
        id: 'crepa_4',
        orden: 4,
        codigo: 'TAKE_BATTER_BOWL',
        titulo: 'Tomar traste con masa líquida (batter) fría',
        descripcion: 'Va al refrigerador de insumos para tomar el bowl metálico con batter preparado.',
        actor: 'vendedor',
        waypointCliente: 'barra_entrega_cliente',
        waypointVendedor: 'raw_refrigerador_insumos',
        duracionSegundos: 6.0,
        equipoKey: 'hp_crepera',
        estadoEquipo: 'PREHEAT',
        wattsNominales: 3000,
        factorPotencia: 0.65,
        apagarAlFinal: false,
        itemManoVendedor: 'batter_bowl',
        animacionVendedor: 'CARRY_BOWL',
        efectoVisual: 'crepe_preheat',
        dialogoVendedor: '🥣 Tomando el traste de batter preparado...'
      },
      {
        id: 'crepa_5',
        orden: 5,
        codigo: 'POUR_BATTER_ON_PLATE',
        titulo: 'Verter masa líquida en el centro de la crepera',
        descripcion: 'Inclina el traste y vierte la porción exacta de batter sobre la placa caliente.',
        actor: 'vendedor',
        waypointCliente: 'barra_entrega_cliente',
        waypointVendedor: 'eq_hp_crepera',
        duracionSegundos: 7.0,
        equipoKey: 'hp_crepera',
        estadoEquipo: 'WORK',
        wattsNominales: 3000,
        factorPotencia: 0.85,
        apagarAlFinal: false,
        insumoId: 'mat_masa_crepa',
        cantidadInsumo: 1,
        itemManoVendedor: 'batter_bowl_tilted',
        animacionVendedor: 'POUR_BATTER',
        efectoVisual: 'crepe_pour',
        dialogoVendedor: '🫗 Vertiendo el batter en el centro de la placa caliente...'
      },
      {
        id: 'crepa_6',
        orden: 6,
        codigo: 'SPREAD_BATTER_CIRCULAR',
        titulo: 'Extender batter en círculo con rastrillo T de madera',
        descripcion: 'Gira suavemente el rastrillo T formando un disco fino y uniforme sobre toda la placa.',
        actor: 'vendedor',
        waypointCliente: 'barra_entrega_cliente',
        waypointVendedor: 'eq_hp_crepera',
        duracionSegundos: 9.0,
        equipoKey: 'hp_crepera',
        estadoEquipo: 'WORK',
        wattsNominales: 3000,
        factorPotencia: 0.85,
        apagarAlFinal: false,
        itemManoVendedor: 'crepe_rake',
        animacionVendedor: 'CIRCULAR_RAKE',
        efectoVisual: 'crepe_spread',
        dialogoVendedor: '🌀 Extendiendo el batter en movimiento circular con rastrillo...'
      },
      {
        id: 'crepa_7',
        orden: 7,
        codigo: 'WAIT_COOK_CREPA',
        titulo: 'Esperar cocción uniforme hasta dorar la crepa',
        descripcion: 'Supervisa la cocción mientras la masa pasa de crema pálido a dorado crujiente y humeante.',
        actor: 'vendedor',
        waypointCliente: 'barra_entrega_cliente',
        waypointVendedor: 'eq_hp_crepera',
        duracionSegundos: 18.0,
        equipoKey: 'hp_crepera',
        estadoEquipo: 'WORK',
        wattsNominales: 3000,
        factorPotencia: 0.78,
        apagarAlFinal: false,
        itemManoVendedor: 'metal_spatula',
        animacionVendedor: 'WAIT_COOKING',
        efectoVisual: 'crepe_cook',
        dialogoVendedor: '⏳ Esperando cocción uniforme hasta que dore...'
      },
      {
        id: 'crepa_8',
        orden: 8,
        codigo: 'ADD_CREPA_INGREDIENTS',
        titulo: 'Untar Nutella y colocar fruta fresca (fresa y plátano)',
        descripcion: 'Toma ingredientes de la barra de toppings, unta chocolate fundido y acomoda fruta rebanada.',
        actor: 'vendedor',
        waypointCliente: 'barra_entrega_cliente',
        waypointVendedor: 'eq_hp_crepera',
        duracionSegundos: 10.0,
        equipoKey: 'hp_crepera',
        estadoEquipo: 'WORK',
        wattsNominales: 3000,
        factorPotencia: 0.72,
        apagarAlFinal: false,
        insumoId: 'mat_relleno_gourmet',
        cantidadInsumo: 1,
        itemManoVendedor: 'nutella_spatula',
        animacionVendedor: 'SPREAD_INGREDIENTS',
        efectoVisual: 'crepe_toppings',
        dialogoVendedor: '🍓 Untando Nutella y colocando fresa y plátano...'
      },
      {
        id: 'crepa_9',
        orden: 9,
        codigo: 'FOLD_AND_PLATE_CREPA',
        titulo: 'Doblar crepa en abanico, emplatar y apagar crepera',
        descripcion: 'Con la espátula dobla la crepa en cuartos, la desliza al plato blanco y apaga el termostato.',
        actor: 'vendedor',
        waypointCliente: 'barra_entrega_cliente',
        waypointVendedor: 'eq_hp_crepera',
        duracionSegundos: 7.0,
        equipoKey: 'hp_crepera',
        estadoEquipo: 'WORK',
        wattsNominales: 3000,
        factorPotencia: 0.25,
        apagarAlFinal: true,
        itemManoVendedor: 'plated_crepa',
        animacionVendedor: 'FOLD_CREPA',
        efectoVisual: 'crepe_plated',
        dialogoVendedor: '🍽️ Doblando crepa, emplatando y apagando crepera...'
      },
      {
        id: 'crepa_10',
        orden: 10,
        codigo: 'DELIVER_PLATED_CREPA',
        titulo: 'Entregar plato con Crepa terminada al cliente',
        descripcion: 'Lleva el plato con la crepa caliente a la barra y la entrega al cliente.',
        actor: 'ambos',
        waypointCliente: 'barra_entrega_cliente',
        waypointVendedor: 'barra_entrega_vendedor',
        duracionSegundos: 5.0,
        equipoKey: null,
        estadoEquipo: 'OFF',
        wattsNominales: 0,
        factorPotencia: 0,
        itemManoVendedor: 'plated_crepa',
        animacionVendedor: 'CARRY_PLATE',
        dialogoCliente: '¡Se ve y huele increíble, muchas gracias!',
        dialogoVendedor: '¡Aquí tiene su Crepa recién hecha, disfrútela!'
      }
    ]
  },

  // --------------------------------------------------------------------------
  // HAWAIIAN PARADISE: MARQUESITA TRADICIONAL (hp_marquesita)
  // --------------------------------------------------------------------------
  hp_marquesita: {
    id: 'hp_marquesita',
    negocioId: 'hawaiian_paradise',
    nombreProducto: 'Marquesita Tradicional Queso de Bola',
    precioVenta: 65.00,
    descripcionIA: 'Atención, cobro en TPV ($65), precalentado de plancha marquesitera (1300W), prensado de barquillo, relleno de queso de bola, enrollado y apagado.',
    pasos: [
      {
        id: 'marq_1',
        orden: 1,
        codigo: 'ORDER_AND_PAY_MARQ',
        titulo: 'Pedido de Marquesita y cobro en TPV ($65)',
        descripcion: 'Cliente pide marquesita y paga en caja TPV.',
        actor: 'ambos',
        waypointCliente: 'caja_tpv_cliente',
        waypointVendedor: 'caja_tpv_vendedor',
        duracionSegundos: 6.0,
        equipoKey: 'hp_tpv',
        estadoEquipo: 'WORK',
        wattsNominales: 280,
        factorPotencia: 0.70,
        apagarAlFinal: false,
        itemManoVendedor: 'ticket',
        animacionVendedor: 'OPERATE_TPV',
        dialogoCliente: 'Una marquesita con mucho queso de bola por favor.',
        dialogoVendedor: '¡En seguida! Cobrando $65 en caja.'
      },
      {
        id: 'marq_2',
        orden: 2,
        codigo: 'PREHEAT_AND_PRESS_MARQ',
        titulo: 'Precalentar, verter y prensar barquillo en Marquesitera (1300W)',
        descripcion: 'Precalienta planchas acanaladas y prensa la masa crujiente.',
        actor: 'vendedor',
        waypointCliente: 'barra_entrega_cliente',
        waypointVendedor: 'eq_hp_marquesitera',
        duracionSegundos: 28.0,
        equipoKey: 'hp_marquesitera',
        estadoEquipo: 'WORK',
        wattsNominales: 1300,
        factorPotencia: 0.85,
        apagarAlFinal: false,
        insumoId: 'mat_masa_crepa',
        cantidadInsumo: 1,
        itemManoVendedor: 'batter_bowl_tilted',
        animacionVendedor: 'POUR_BATTER',
        dialogoVendedor: '🧀 Prensando barquillo dorado en marquesitera...'
      },
      {
        id: 'marq_3',
        orden: 3,
        codigo: 'ROLL_FILL_MARQ',
        titulo: 'Rellenar con queso de bola y enrollar tubo crujiente',
        descripcion: 'Abre la prensa caliente, añade Nutella/queso de bola y enrolla el barquillo.',
        actor: 'vendedor',
        waypointCliente: 'barra_entrega_cliente',
        waypointVendedor: 'eq_hp_marquesitera',
        duracionSegundos: 10.0,
        equipoKey: 'hp_marquesitera',
        estadoEquipo: 'WORK',
        wattsNominales: 1300,
        factorPotencia: 0.35,
        apagarAlFinal: true,
        insumoId: 'mat_relleno_gourmet',
        cantidadInsumo: 0.8,
        itemManoVendedor: 'nutella_spatula',
        animacionVendedor: 'FOLD_CREPA',
        dialogoVendedor: '🌀 Rellenando con queso de bola y enrollando en caliente...'
      },
      {
        id: 'marq_4',
        orden: 4,
        codigo: 'ROLL_AND_DELIVER_MARQ',
        titulo: 'Entregar Marquesita crujiente al cliente',
        descripcion: 'Entrega la marquesita recién enrollada en servilleta.',
        actor: 'ambos',
        waypointCliente: 'barra_entrega_cliente',
        waypointVendedor: 'barra_entrega_vendedor',
        duracionSegundos: 5.0,
        equipoKey: null,
        estadoEquipo: 'OFF',
        wattsNominales: 0,
        factorPotencia: 0,
        itemManoVendedor: 'product_bag',
        animacionVendedor: 'CARRY_PLATE',
        dialogoCliente: '¡Crujiente y calientita, gracias!',
        dialogoVendedor: '¡Lista su Marquesita!'
      }
    ]
  },

  // --------------------------------------------------------------------------
  // HAWAIIAN PARADISE: SMOOTHIE / FRAPPÉ (hp_smoothie)
  // --------------------------------------------------------------------------
  hp_smoothie: {
    id: 'hp_smoothie',
    negocioId: 'hawaiian_paradise',
    nombreProducto: 'Smoothie Frutal / Frappé (Licuadora Ninja)',
    precioVenta: 60.00,
    descripcionIA: 'Pedido en barra, cobro en TPV ($60), carga de pulpa congelada y hielo, licuado de alta potencia (51s a 2000W), servido en vaso domo con popote y entrega.',
    pasos: [
      {
        id: 'smoo_1',
        orden: 1,
        codigo: 'ORDER_PAY_SMOOTHIE',
        titulo: 'Pedido de Smoothie/Frappé y cobro en TPV ($60)',
        descripcion: 'Cliente acuerda compra y paga en caja.',
        actor: 'ambos',
        waypointCliente: 'caja_tpv_cliente',
        waypointVendedor: 'caja_tpv_vendedor',
        duracionSegundos: 6.0,
        equipoKey: 'hp_tpv',
        estadoEquipo: 'WORK',
        wattsNominales: 280,
        factorPotencia: 0.70,
        apagarAlFinal: false,
        itemManoVendedor: 'ticket',
        animacionVendedor: 'OPERATE_TPV',
        dialogoCliente: 'Me da un Smoothie frutal bien frío.',
        dialogoVendedor: '¡Claro! Son $60 pesos.'
      },
      {
        id: 'smoo_2',
        orden: 2,
        codigo: 'LOAD_FRUIT_AND_ICE',
        titulo: 'Dosificar pulpa congelada y hielo en vaso Ninja',
        descripcion: 'Toma pulpa y hielo del congelador y los coloca en la licuadora.',
        actor: 'vendedor',
        waypointCliente: 'barra_entrega_cliente',
        waypointVendedor: 'raw_congelador_hielo',
        duracionSegundos: 7.0,
        equipoKey: null,
        estadoEquipo: 'OFF',
        wattsNominales: 0,
        factorPotencia: 0,
        insumoId: 'mat_pulpa_fruta',
        cantidadInsumo: 1,
        itemManoVendedor: 'ice_block',
        animacionVendedor: 'CARRY_BOWL',
        dialogoVendedor: '🧊 Dosificando pulpa de fruta y hielo...'
      },
      {
        id: 'smoo_3',
        orden: 3,
        codigo: 'BLEND_HIGH_POWER',
        titulo: 'Licuar a alta potencia en Licuadora Profesional (2000W)',
        descripcion: 'Enciende la licuadora de alta potencia formando vórtice frutal y la apaga.',
        actor: 'vendedor',
        waypointCliente: 'barra_entrega_cliente',
        waypointVendedor: 'eq_hp_licuadora',
        duracionSegundos: 30.0,
        equipoKey: 'hp_licuadora',
        estadoEquipo: 'WORK',
        wattsNominales: 2000,
        factorPotencia: 1.0,
        apagarAlFinal: true,
        insumoId: 'mat_hielo_bloque',
        cantidadInsumo: 0.20,
        animacionVendedor: 'WAIT_COOKING',
        dialogoVendedor: '🌪️ Licuando frappé a máxima potencia...'
      },
      {
        id: 'smoo_4',
        orden: 4,
        codigo: 'SERVE_AND_DELIVER_SMOOTHIE',
        titulo: 'Servir en vaso domo con popote y entregar',
        descripcion: 'Vierte en vaso 12oz, coloca popote y entrega al cliente.',
        actor: 'ambos',
        waypointCliente: 'barra_entrega_cliente',
        waypointVendedor: 'barra_entrega_vendedor',
        duracionSegundos: 6.0,
        equipoKey: null,
        estadoEquipo: 'OFF',
        wattsNominales: 0,
        factorPotencia: 0,
        insumoId: 'mat_vaso_12oz',
        cantidadInsumo: 1,
        itemManoVendedor: 'finished_lemon_raspado',
        animacionVendedor: 'CARRY_PLATE',
        dialogoCliente: '¡Gracias!',
        dialogoVendedor: '¡Aquí está su Smoothie Frutal!'
      }
    ]
  },

  // --------------------------------------------------------------------------
  // HAWAIIAN PARADISE: CAFÉ ESPRESSO / CAPPUCCINO / LATTE
  // --------------------------------------------------------------------------
  hp_espresso_americano: {
    id: 'hp_espresso_americano',
    negocioId: 'hawaiian_paradise',
    nombreProducto: 'Café Espresso / Americano (Gaggia / Breville)',
    precioVenta: 40.00,
    descripcionIA: 'Cobro en TPV ($40), molienda de 18g de café en grano, extracción a 15 bar en cafetera profesional y entrega en vaso térmico.',
    pasos: [
      {
        id: 'esp_1',
        orden: 1,
        codigo: 'PAY_COFFEE',
        titulo: 'Pedido y cobro de Café en TPV ($40)',
        descripcion: 'Cliente pide un Americano recién extraído y paga en caja.',
        actor: 'ambos',
        waypointCliente: 'caja_tpv_cliente',
        waypointVendedor: 'caja_tpv_vendedor',
        duracionSegundos: 5.5,
        equipoKey: 'hp_tpv',
        estadoEquipo: 'WORK',
        wattsNominales: 280,
        factorPotencia: 0.70,
        apagarAlFinal: false,
        itemManoVendedor: 'ticket',
        animacionVendedor: 'OPERATE_TPV',
        dialogoCliente: 'Un Café Americano recién molido, por favor.',
        dialogoVendedor: '¡En seguida! Son $40 pesos.'
      },
      {
        id: 'esp_2',
        orden: 2,
        codigo: 'EXTRACT_ESPRESSO',
        titulo: 'Molienda de grano (18g) y extracción en Cafetera Espresso',
        descripcion: 'Muele grano fresco, compacta portafiltro y extrae shot espresso.',
        actor: 'vendedor',
        waypointCliente: 'barra_entrega_cliente',
        waypointVendedor: 'eq_hp_breville',
        duracionSegundos: 28.0,
        equipoKey: 'hp_breville',
        estadoEquipo: 'WORK',
        wattsNominales: 2640,
        factorPotencia: 0.90,
        apagarAlFinal: false,
        insumoId: 'mat_cafe_grano',
        cantidadInsumo: 0.018,
        itemManoVendedor: 'espresso_cup',
        animacionVendedor: 'WAIT_COOKING',
        dialogoVendedor: '☕ Extrayendo shot espresso a 9 bares...'
      },
      {
        id: 'esp_3',
        orden: 3,
        codigo: 'DELIVER_COFFEE',
        titulo: 'Servir en vaso térmico y entregar al cliente',
        descripcion: 'Coloca tapa térmica y entrega en barra.',
        actor: 'ambos',
        waypointCliente: 'barra_entrega_cliente',
        waypointVendedor: 'barra_entrega_vendedor',
        duracionSegundos: 5.0,
        equipoKey: null,
        estadoEquipo: 'OFF',
        wattsNominales: 0,
        factorPotencia: 0,
        insumoId: 'mat_vaso_12oz',
        cantidadInsumo: 1,
        itemManoVendedor: 'espresso_cup',
        animacionVendedor: 'CARRY_PLATE',
        dialogoCliente: '¡El aroma es espectacular, gracias!',
        dialogoVendedor: '¡Disfrute su café de especialidad!'
      }
    ]
  },

  hp_cappuccino_latte: {
    id: 'hp_cappuccino_latte',
    negocioId: 'hawaiian_paradise',
    nombreProducto: 'Cappuccino / Latte Espumado al Vapor',
    precioVenta: 55.00,
    descripcionIA: 'Cobro en TPV ($55), molienda y extracción de espresso + texturizado de 220ml de leche en lanceta de vapor y entrega.',
    pasos: [
      {
        id: 'lat_1',
        orden: 1,
        codigo: 'PAY_LATTE',
        titulo: 'Pedido de Cappuccino/Latte y cobro en TPV ($55)',
        descripcion: 'Cliente pide Cappuccino espumoso y paga en caja.',
        actor: 'ambos',
        waypointCliente: 'caja_tpv_cliente',
        waypointVendedor: 'caja_tpv_vendedor',
        duracionSegundos: 5.5,
        equipoKey: 'hp_tpv',
        estadoEquipo: 'WORK',
        wattsNominales: 280,
        factorPotencia: 0.70,
        apagarAlFinal: false,
        itemManoVendedor: 'ticket',
        animacionVendedor: 'OPERATE_TPV',
        dialogoCliente: '¿Me da un Cappuccino caliente por favor?',
        dialogoVendedor: '¡Claro! Son $55 pesos.'
      },
      {
        id: 'lat_2',
        orden: 2,
        codigo: 'EXTRACT_ESPRESSO',
        titulo: 'Extraer carga doble de espresso a 9 bares',
        descripcion: 'Compacta el portafiltro y extrae base espresso con crema avellana.',
        actor: 'vendedor',
        waypointCliente: 'barra_entrega_cliente',
        waypointVendedor: 'eq_hp_breville',
        duracionSegundos: 20.0,
        equipoKey: 'hp_breville',
        estadoEquipo: 'WORK',
        wattsNominales: 2640,
        factorPotencia: 0.88,
        apagarAlFinal: false,
        itemManoVendedor: 'espresso_cup',
        animacionVendedor: 'WAIT_COOKING',
        dialogoVendedor: '☕ Extrayendo carga doble espresso...'
      },
      {
        id: 'lat_3',
        orden: 3,
        codigo: 'STEAM_MILK_FOAM',
        titulo: 'Espumar jarra de leche en lanceta de vapor a 65°C',
        descripcion: 'Texturiza 220ml de leche barista en jarra metálica con vapor presurizado.',
        actor: 'vendedor',
        waypointCliente: 'barra_entrega_cliente',
        waypointVendedor: 'eq_hp_breville',
        duracionSegundos: 24.0,
        equipoKey: 'hp_breville',
        estadoEquipo: 'WORK',
        wattsNominales: 2640,
        factorPotencia: 0.95,
        apagarAlFinal: true,
        insumoId: 'mat_leche_barista',
        cantidadInsumo: 0.22,
        itemManoVendedor: 'milk_pitcher',
        animacionVendedor: 'SPREAD_INGREDIENTS',
        dialogoVendedor: '🥛 Texturizando microespuma de leche al vapor...'
      },
      {
        id: 'lat_4',
        orden: 4,
        codigo: 'DELIVER_LATTE',
        titulo: 'Verter arte latte y entregar al cliente',
        descripcion: 'Entrega el Cappuccino terminado en barra.',
        actor: 'ambos',
        waypointCliente: 'barra_entrega_cliente',
        waypointVendedor: 'barra_entrega_vendedor',
        duracionSegundos: 5.0,
        equipoKey: null,
        estadoEquipo: 'OFF',
        wattsNominales: 0,
        factorPotencia: 0,
        insumoId: 'mat_cafe_grano',
        cantidadInsumo: 0.018,
        itemManoVendedor: 'espresso_cup',
        animacionVendedor: 'CARRY_PLATE',
        dialogoCliente: '¡Muchas gracias!',
        dialogoVendedor: '¡Su Cappuccino recién hecho!'
      }
    ]
  },

  // --------------------------------------------------------------------------
  // IMPERIA UNIFORMES: 6 ESTANTES POR RAMA + PROBADORES + ROUTING B2B/BORDADO
  // --------------------------------------------------------------------------
  imp_uniforme_clinico_completo: buildImperiaShowroomRecipe({
    id: 'imp_uniforme_clinico_completo',
    nombreProducto: 'Uniforme Clínico / Scrub Medicina (Estante Medicina)',
    precioVenta: 650.00,
    rama: 'medicina',
    numPrendas: 2,
    incluyePrendaAbajo: true,
    conoceTalla: false,
    requiereBordado: false,
    esPedidoB2B: false,
    insumoId: 'mat_stock_clinico_taller'
  }),
  imp_chef_gastronomia: buildImperiaShowroomRecipe({
    id: 'imp_chef_gastronomia',
    nombreProducto: 'Filipina / Mandil Gastronomía (Estante Gastronomía)',
    precioVenta: 590.00,
    rama: 'gastronomia',
    numPrendas: 2,
    incluyePrendaAbajo: false,
    conoceTalla: false,
    requiereBordado: true,
    insumoId: 'mat_stock_clinico_taller'
  }),
  imp_conjunto_enfermeria: buildImperiaShowroomRecipe({
    id: 'imp_conjunto_enfermeria',
    nombreProducto: 'Conjunto Blanco Enfermería (Estante Enfermería)',
    precioVenta: 680.00,
    rama: 'enfermeria',
    numPrendas: 3,
    incluyePrendaAbajo: true,
    conoceTalla: false,
    requiereBordado: true,
    insumoId: 'mat_stock_clinico_taller'
  }),
  imp_uniforme_escolar: buildImperiaShowroomRecipe({
    id: 'imp_uniforme_escolar',
    nombreProducto: 'Uniforme Escolar Completo (Estante Escolares)',
    precioVenta: 420.00,
    rama: 'escolares',
    numPrendas: 1,
    incluyePrendaAbajo: true,
    conoceTalla: true,
    requiereBordado: true,
    insumoId: 'mat_stock_clinico_taller'
  }),
  imp_camisola_industrial: buildImperiaShowroomRecipe({
    id: 'imp_camisola_industrial',
    nombreProducto: 'Camisola / Overol Industrial (Estante Industriales)',
    precioVenta: 740.00,
    rama: 'industriales',
    numPrendas: 2,
    incluyePrendaAbajo: true,
    conoceTalla: false,
    esPedidoB2B: true,
    insumoId: 'mat_stock_clinico_taller'
  }),
  imp_polo_proveedor: buildImperiaShowroomRecipe({
    id: 'imp_polo_proveedor',
    nombreProducto: 'Playera Polo / Camisa Cotexa-Euro-Jasbec (Estante Proveedores)',
    precioVenta: 340.00,
    rama: 'proveedores',
    numPrendas: 1,
    incluyePrendaAbajo: false,
    conoceTalla: true,
    requiereBordado: true,
    esPedidoPubli: true,
    insumoId: 'mat_playera_gorra_blank'
  }),
  imp_pedido_b2b_empresa: buildImperiaShowroomRecipe({
    id: 'imp_pedido_b2b_empresa',
    nombreProducto: 'Pedido Empresarial B2B a Medida (Ruta Taller + Bordado + Publi)',
    precioVenta: 4800.00,
    rama: 'industriales',
    numPrendas: 1,
    incluyePrendaAbajo: false,
    conoceTalla: true,
    requiereBordado: true,
    esPedidoB2B: true,
    esPedidoPubli: true,
    insumoId: 'mat_stock_clinico_taller'
  }),

  // --------------------------------------------------------------------------
  // PAPELERÍA IMPERIARTE: IMPRESIÓN LÁSER / FOTOCOPIADO EN XEROX DOCUCOLOR
  // --------------------------------------------------------------------------
  pap_impresion_color: {
    id: 'pap_impresion_color',
    negocioId: 'papeleria_imperiarte',
    nombreProducto: 'Impresión Digital Color / Copias (Xerox DocuColor 1500W)',
    precioVenta: 64.00,
    descripcionIA: 'Recepción de archivo PDF en computadora AIO TPV (180W), precalentado de fusor en Xerox DocuColor (1500W), tiraje láser color, cobro y entrega.',
    pasos: [
      {
        id: 'pap_1',
        orden: 1,
        codigo: 'REVIEW_FILE_AIO',
        titulo: 'Revisión de archivo en PC All-in-One TPV (180W)',
        descripcion: 'El cliente entrega su USB/archivo y el encargado configura la cola de impresión.',
        actor: 'ambos',
        waypointCliente: 'barra_cliente',
        waypointVendedor: 'caja_tpv_vendedor',
        duracionSegundos: 12.0,
        equipoKey: 'pap_tpv',
        estadoEquipo: 'WORK',
        wattsNominales: 180,
        factorPotencia: 0.65,
        apagarAlFinal: false,
        itemManoVendedor: 'ticket',
        animacionVendedor: 'OPERATE_TPV',
        dialogoCliente: 'Hola, vengo a imprimir estas láminas a color en DocuColor.',
        dialogoVendedor: '🖨️ Abriendo PDF y enviando a cola RIP...'
      },
      {
        id: 'pap_2',
        orden: 2,
        codigo: 'DOCUCOLOR_FUSER_PRINT',
        titulo: 'Calentamiento de fusor y tiraje en Xerox DocuColor (1500W)',
        descripcion: 'El fusor sube a 190°C y ejecuta el tiraje láser CMYK a 1500W.',
        actor: 'vendedor',
        waypointCliente: 'barra_entrega_cliente',
        waypointVendedor: 'eq_pap_docucolor',
        duracionSegundos: 28.0,
        equipoKey: 'pap_docucolor',
        estadoEquipo: 'WORK',
        wattsNominales: 1500,
        factorPotencia: 0.95,
        apagarAlFinal: true,
        insumoId: 'mat_papel_bond_carta',
        cantidadInsumo: 8,
        itemManoVendedor: 'paper_stack',
        animacionVendedor: 'WAIT_COOKING',
        dialogoVendedor: '⚡ Imprimiendo en Xerox DocuColor (1500W)...'
      },
      {
        id: 'pap_3',
        orden: 3,
        codigo: 'DELIVER_PRINTS',
        titulo: 'Cobro y entrega de impresiones en mostrador',
        descripcion: 'Recoge las hojas impresas, cobra en caja y entrega al cliente.',
        actor: 'ambos',
        waypointCliente: 'barra_entrega_cliente',
        waypointVendedor: 'barra_entrega_vendedor',
        duracionSegundos: 6.0,
        equipoKey: null,
        estadoEquipo: 'OFF',
        wattsNominales: 0,
        factorPotencia: 0,
        insumoId: 'mat_toner_cmyk',
        cantidadInsumo: 2,
        itemManoVendedor: 'paper_stack',
        animacionVendedor: 'CARRY_PLATE',
        dialogoCliente: '¡Quedaron nítidas, gracias!',
        dialogoVendedor: '¡Aquí tiene sus impresiones!'
      }
    ]
  },

  // --------------------------------------------------------------------------
  // BORDADOS VERACRUZ: AEMCO 4 CABEZAS / MELCO + ETIQUETADO + ENTREGA IMPERIA
  // --------------------------------------------------------------------------
  bv_escudo_aemco: buildEmbroideryRecipe({
    id: 'bv_escudo_aemco',
    nombreProducto: 'Lote Bordados Escudo en AEMCO 220V (4 Cabezas) + Entrega Imperia',
    precioVenta: 240.00,
    equipoKey: 'bv_aemco_220',
    wattsNominales: 1800
  }),
  bv_nombre_melco: buildEmbroideryRecipe({
    id: 'bv_nombre_melco',
    nombreProducto: 'Bordado Personalizado Nombre/Logo en Melco EMC + Entrega Imperia',
    precioVenta: 145.00,
    equipoKey: 'bv_melco_emc',
    wattsNominales: 900
  }),

  // --------------------------------------------------------------------------
  // TALLER DE COSTURA IMPERIA: SECUENCIA COMPLETA CON PLANCHADO INTERMEDIO
  // --------------------------------------------------------------------------
  tc_filipina_chef: buildSewingWorkshopRecipe({
    id: 'tc_filipina_chef',
    nombreProducto: 'Confección Filipina Médica / Chef (Secuencia Completa Taller Imperia)',
    precioVenta: 480.00,
    tipoCostura: 'completo',
    requierePlanchadoIntermedio: true
  }),
  tc_bata_recta: buildSewingWorkshopRecipe({
    id: 'tc_bata_recta',
    nombreProducto: 'Confección Prenda Recta Industrial + Planchado Intermedio',
    precioVenta: 410.00,
    tipoCostura: 'recta_sola',
    requierePlanchadoIntermedio: true
  }),

  // --------------------------------------------------------------------------
  // PUBLI-IMPERIA: DTF, SUBLIMACIÓN PLANA/TAZA, VINIL TEXTIL, LÁSER Y LOTES B2B
  // --------------------------------------------------------------------------
  pi_sub_tazas: buildPubliPrintRecipe({
    id: 'pi_sub_tazas',
    nombreProducto: 'Taza Sublimada Personalizada 11oz (Epson + Plancha 350W)',
    precioVenta: 95.00,
    tecnica: 'SUBLIMACION_TAZA',
    esUrgente: false,
    esLoteB2B: false
  }),
  pi_dtf_playeras: buildPubliPrintRecipe({
    id: 'pi_dtf_playeras',
    nombreProducto: 'DTF Textil (Combi/Promox -> 160°C 5m + 3x 15s/20s -> Entrega Imperia)',
    precioVenta: 220.00,
    tecnica: 'DTF',
    esUrgente: false,
    esLoteB2B: false
  }),
  pi_sublimacion_plana: buildPubliPrintRecipe({
    id: 'pi_sublimacion_plana',
    nombreProducto: 'Sublimación Formato Amplio (Imagen Impresa -> 200°C 5m + 60s)',
    precioVenta: 260.00,
    tecnica: 'SUBLIMACION_PLANA',
    esUrgente: true,
    esLoteB2B: false
  }),
  pi_vinil_textil_euro: buildPubliPrintRecipe({
    id: 'pi_vinil_textil_euro',
    nombreProducto: 'Vinil Textil Euro (Plotter 1-5m + Depilado + 140°C + 3x 20s/20s)',
    precioVenta: 195.00,
    tecnica: 'VINIL_TEXTIL',
    esUrgente: false,
    esLoteB2B: false
  }),
  pi_lote_b2b_playeras: buildPubliPrintRecipe({
    id: 'pi_lote_b2b_playeras',
    nombreProducto: 'Lote B2B Empresarial (20-100 Playeras DTF/Vinil -> Cajas Almacén Publi)',
    precioVenta: 6800.00,
    tecnica: 'DTF',
    esUrgente: false,
    esLoteB2B: true,
    cantidadLote: 50
  })
};

// ============================================================================
// 4. TAREAS DE EMPLEADOS SIN CLIENTES + RUTINAS HUMANAS UNIVERSALES E IMPERIA
// ============================================================================
export const TAREAS_SIN_CLIENTES_POR_NEGOCIO = {
  hawaiian_paradise: [
    { codigo: 'CLEAN_BAR', texto: '🧹 Limpiando barra y vitrinas', waypoint: 'barra_vendedor', duracion: 18, animacion: 'SWEEP_MOP' },
    { codigo: 'CHECK_ICE_STOCK', texto: '🧊 Revisando bloques de hielo en congeladora', waypoint: 'raw_congelador_hielo', duracion: 14 },
    { codigo: 'REFILL_SYRUPS', texto: '🍋 Acomodando botellas en estación de jarabes', waypoint: 'raw_estacion_jarabes', duracion: 15 },
    { codigo: 'CLEAN_CREPERA', texto: '✨ Limpiando placa de crepera y marquesitera', waypoint: 'eq_hp_crepera', duracion: 14 },
    ...UNIVERSAL_HUMAN_ROUTINES
  ],
  imperia_uniformes: [
    ...IMPERIA_SPECIAL_ROUTINES.apertura,
    ...IMPERIA_SPECIAL_ROUTINES.administrativas,
    ...IMPERIA_SPECIAL_ROUTINES.limpieza,
    { codigo: 'CHECK_DRESSING_ROOM', texto: '🚪 Recogiendo prendas del probador y regresando a su rack', waypoint: 'probador_1', duracion: 18, animacion: 'CARRY_PLATE' },
    { codigo: 'CHECK_COUNTER_FORGOTTEN', texto: '🔍 Revisando si algún cliente dejó olvidado algo en mostrador', waypoint: 'barra_vendedor', duracion: 12 },
    ...UNIVERSAL_HUMAN_ROUTINES
  ],
  papeleria_imperiarte: [
    { codigo: 'ALIGN_PAPER', texto: '📄 Acomodando resmas de papel bond y opalina', waypoint: 'raw_estante_papel', duracion: 16, animacion: 'CARRY_PLATE' },
    { codigo: 'ORGANIZE_BOARDS', texto: '📐 Ordenando pliegos de cartón batería y marquilla', waypoint: 'raw_rack_pliegos', duracion: 18 },
    { codigo: 'CLEAN_GLASS_DOCUCOLOR', texto: '✨ Limpiando cristal de exposición DocuColor', waypoint: 'eq_pap_docucolor', duracion: 14 },
    ...UNIVERSAL_HUMAN_ROUTINES
  ],
  bordados_veracruz: [
    { codigo: 'PREP_BOBBINS', texto: '🧵 Devanando bobinas y ordenando conos de hilo', waypoint: 'raw_estante_hilos', duracion: 18 },
    { codigo: 'LUBE_HOOKS', texto: '🔧 Revisando tensión de agujas en AEMCO 4 cabezas', waypoint: 'eq_bv_aemco_220', duracion: 16 },
    { codigo: 'CUT_BACKING', texto: '✂️ Pre-cortando tramos de pelón estabilizador', waypoint: 'raw_mesa_bastidores', duracion: 16 },
    ...UNIVERSAL_HUMAN_ROUTINES
  ],
  taller_costura: [
    { codigo: 'SORT_PATTERNS', texto: '📏 Ordenando moldes y rollos de tela en mesa de corte', waypoint: 'raw_mesa_corte_telas', duracion: 18 },
    { codigo: 'THREAD_OVERLOCK', texto: '🪡 Revisando enhebrado de Overlock y Collaretera', waypoint: 'eq_tc_overlock_5h', duracion: 15 },
    { codigo: 'BATCH_FOR_IMPERIA', texto: '🧥 Agrupando lote terminado para entregar a Imperia Uniformes', waypoint: 'barra_vendedor', duracion: 20, animacion: 'CARRY_PLATE' },
    ...UNIVERSAL_HUMAN_ROUTINES
  ],
  taller_publi_imperia: [
    { codigo: 'VECTOR_TEMPLATES', texto: '🎨 Preparando vectores y archivos de impresión en PC Diseño', waypoint: 'eq_pi_pc_diseno', duracion: 22, animacion: 'OPERATE_TPV' },
    { codigo: 'ORGANIZE_B2B_BOXES', texto: '📦 Organizando cajas de lotes B2B en Almacén Publi-Impresos', waypoint: 'raw_almacen_b2b', duracion: 18, animacion: 'CARRY_PLATE' },
    { codigo: 'WEED_VINYL_SCRAPS', texto: '🔎 Depilando viniles textiles pendientes de Euro', waypoint: 'raw_mesa_impresion', duracion: 20 },
    ...UNIVERSAL_HUMAN_ROUTINES
  ]
};

/**
 * Obtiene la receta coreografiada de un producto o genera una adaptada dinámicamente si es un producto secundario
 */
function buildImperiArteProductRecipe(item) {
  const isBoard = Boolean(item.isHorizontalBoard);
  const insumoId =
    item.rackKey === 'rack_horizontal_cartones'
      ? 'mat_pliego_bateria_marquilla'
      : item.rackKey === 'rack_horizontal_papeles'
        ? 'mat_papeles_arte_fabriano'
        : item.rackKey === 'rack_bastidores_caballetes'
          ? 'mat_bastidores_caballetes'
          : 'mat_pinturas_marcadores_arte';

  return {
    id: item.id,
    negocioId: 'papeleria_imperiarte',
    nombreProducto: `${item.nombre} (${item.sku})`,
    precioVenta: item.precio,
    descripcionIA: `Atención ImperiArte: consulta de ${item.categoria}, extracción ${isBoard ? 'horizontal de repisa de madera' : 'de exhibidor especializado'} y cobro en TPV.`,
    pasos: [
      {
        id: `${item.id}_1`,
        orden: 1,
        codigo: 'LISTEN_IMPERIARTE_ORDER',
        titulo: `Atender pedido: ${item.nombre}`,
        descripcion: `El cliente solicita ${item.nombre} (${item.categoria}).`,
        actor: 'ambos',
        waypointCliente: 'barra_cliente',
        waypointVendedor: 'barra_vendedor',
        duracionSegundos: 6.0,
        equipoKey: null,
        estadoEquipo: 'OFF',
        wattsNominales: 0,
        factorPotencia: 0,
        itemManoVendedor: null,
        animacionVendedor: 'TALK_CLIENT',
        dialogoCliente: `Hola, busco ${item.nombre}.`,
        dialogoVendedor: isBoard
          ? '📐 ¡Claro! Voy por el pliego a las repisas horizontales de madera.'
          : `🎨 Con gusto, lo tomo del área de ${item.categoria}.`
      },
      {
        id: `${item.id}_2`,
        orden: 2,
        codigo: isBoard ? 'PULL_HORIZONTAL_BOARD' : 'FETCH_ART_SUPPLY',
        titulo: isBoard
          ? 'Extraer cartón/pliego horizontalmente de repisa de madera'
          : `Tomar artículo de ${item.categoria}`,
        descripcion: isBoard
          ? 'Saca el cartón grande de manera horizontal de la repisa multinivel de madera.'
          : 'Toma el material artístico del estante correspondiente.',
        actor: 'vendedor',
        waypointCliente: 'barra_entrega_cliente',
        waypointVendedor: item.rackKey || 'rack_horizontal_cartones',
        duracionSegundos: 9.0,
        equipoKey: null,
        estadoEquipo: 'OFF',
        wattsNominales: 0,
        factorPotencia: 0,
        insumoId,
        cantidadInsumo: 1,
        itemManoVendedor: item.handItem || 'large_cardboard_sheet',
        animacionVendedor: isBoard ? 'PULL_HORIZONTAL_BOARD' : 'CARRY_PLATE',
        dialogoVendedor: isBoard
          ? '🪵 Deslizando pliego horizontal de la repisa...'
          : `📦 Tomando ${item.marca}...`
      },
      {
        id: `${item.id}_3`,
        orden: 3,
        codigo: 'COBRAR_Y_ENTREGAR_IMPERIARTE',
        titulo: 'Cobro en TPV y entrega de material ImperiArte',
        descripcion: 'Registra el SKU en caja TPV y entrega el material al cliente.',
        actor: 'ambos',
        waypointCliente: 'barra_entrega_cliente',
        waypointVendedor: 'caja_tpv_vendedor',
        duracionSegundos: 7.0,
        equipoKey: 'pap_tpv',
        estadoEquipo: 'WORK',
        wattsNominales: 180,
        factorPotencia: 0.65,
        itemManoVendedor: item.handItem || 'large_cardboard_sheet',
        animacionVendedor: isBoard ? 'CARRY_HORIZONTAL_BOARD' : 'OPERATE_TPV',
        dialogoCliente: '¡Excelente calidad, muchas gracias!',
        dialogoVendedor: `✅ Cobrado $${item.precio.toFixed(2)} MXN (${item.sku}). ¡Gracias por su compra!`
      }
    ]
  };
}

export function obtenerCoreografiaProducto(productoId, negocioId = 'hawaiian_paradise', overridesRecetas = {}) {
  if (overridesRecetas && overridesRecetas[productoId]) {
    return overridesRecetas[productoId];
  }
  if (RECETAS_COREOGRAFICAS_DETALLADAS[productoId]) {
    return RECETAS_COREOGRAFICAS_DETALLADAS[productoId];
  }
  // Fallbacks inteligentes por familia de negocio y prefijo de producto
  if (negocioId === 'imperia_uniformes') {
    const pid = String(productoId || '');
    if (pid.includes('chef') || pid.includes('gastro') || pid.includes('mandil')) return RECETAS_COREOGRAFICAS_DETALLADAS.imp_chef_gastronomia;
    if (pid.includes('enferm')) return RECETAS_COREOGRAFICAS_DETALLADAS.imp_conjunto_enfermeria;
    if (pid.includes('escol')) return RECETAS_COREOGRAFICAS_DETALLADAS.imp_uniforme_escolar;
    if (pid.includes('indust')) return RECETAS_COREOGRAFICAS_DETALLADAS.imp_camisola_industrial;
    if (pid.includes('polo') || pid.includes('prov') || pid.includes('cotexa') || pid.includes('euro') || pid.includes('jasbec')) {
      return RECETAS_COREOGRAFICAS_DETALLADAS.imp_polo_proveedor;
    }
    if (pid.includes('b2b')) return RECETAS_COREOGRAFICAS_DETALLADAS.imp_pedido_b2b_empresa;
    return RECETAS_COREOGRAFICAS_DETALLADAS.imp_uniforme_clinico_completo;
  }
  if (negocioId === 'papeleria_imperiarte') {
    const imperiItem = IMPERIARTE_CATALOG_DB.find((it) => it.id === productoId);
    if (imperiItem) return buildImperiArteProductRecipe(imperiItem);
    return RECETAS_COREOGRAFICAS_DETALLADAS.pap_impresion_color;
  }
  if (negocioId === 'bordados_veracruz') {
    return String(productoId || '').includes('melco')
      ? RECETAS_COREOGRAFICAS_DETALLADAS.bv_nombre_melco
      : RECETAS_COREOGRAFICAS_DETALLADAS.bv_escudo_aemco;
  }
  if (negocioId === 'taller_costura') {
    return String(productoId || '').includes('recta')
      ? RECETAS_COREOGRAFICAS_DETALLADAS.tc_bata_recta
      : RECETAS_COREOGRAFICAS_DETALLADAS.tc_filipina_chef;
  }
  if (negocioId === 'taller_publi_imperia') {
    const pid = String(productoId || '');
    if (pid.includes('dtf')) return RECETAS_COREOGRAFICAS_DETALLADAS.pi_dtf_playeras;
    if (pid.includes('vinil')) return RECETAS_COREOGRAFICAS_DETALLADAS.pi_vinil_textil_euro;
    if (pid.includes('sublimacion_plana') || pid.includes('plana')) return RECETAS_COREOGRAFICAS_DETALLADAS.pi_sublimacion_plana;
    if (pid.includes('b2b')) return RECETAS_COREOGRAFICAS_DETALLADAS.pi_lote_b2b_playeras;
    return RECETAS_COREOGRAFICAS_DETALLADAS.pi_sub_tazas;
  }
  return RECETAS_COREOGRAFICAS_DETALLADAS.hp_raspado;
}
