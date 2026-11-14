/**
 * Registro Maestro de Zonas Espaciales 3D, Waypoints de Interacción, Coreografías Paso a Paso
 * por Producto y Tareas Sin Clientes (Idle Tasks) para las Unidades de Negocio del Consorcio.
 */

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
    subtitulo: 'Showroom Comercial, Probadores & Mayoreo',
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
    subtitulo: 'Corte, Overlock 5H, Rectas Singer, Collaretera & Vapor',
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
    nombre: 'Publi-Imperia',
    subtitulo: 'Sublimación, Planchas DTF, Vinil ScanNCut & Láser CNC',
    colorHex: '#06b6d4',
    pisoColorHex: '#082f49',
    muroColorHex: '#0c4a6e',
    center: [14, 0, 8],
    size: [12, 3.2, 10],
    cameraPreset: { position: [14, 11, 20], target: [14, 0.8, 8] },
    medidorDefault: 'med_6'
  }
};

// ============================================================================
// 2. WAYPOINTS Y ESTACIONES 3D POR NEGOCIO (COORDENADAS LOCALES AL CENTRO DEL LOCAL)
// ============================================================================
export const WAYPOINTS_POR_NEGOCIO = {
  hawaiian_paradise: {
    puerta_entrada: [0, 0, 4.6],
    acera_exterior: [-4.5, 0, 5.4],
    barra_cliente: [-1.2, 0, 0.6],
    barra_vendedor: [-1.2, 0, -0.6],
    caja_tpv_cliente: [1.5, 0, 0.6],
    caja_tpv_vendedor: [1.5, 0, -0.6],
    barra_entrega_cliente: [0.2, 0, 0.6],
    barra_entrega_vendedor: [0.2, 0, -0.6],
    // Equipos de preparación (detrás de la barra)
    eq_hp_raspadora: [-3.8, 0, -2.2],
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
    // Puntos de consumo de clientes (De pie y Mesas con sillas)
    consumo_pie_1: [-4.2, 0, 2.2],
    consumo_pie_2: [-2.8, 0, 3.2],
    mesa_1_silla_1: [2.6, 0, 2.5],
    mesa_1_silla_2: [3.8, 0, 2.5],
    mesa_2_silla_1: [-0.8, 0, 3.0],
    mesa_2_silla_2: [0.6, 0, 3.0]
  },

  imperia_uniformes: {
    puerta_entrada: [0, 0, 4.6],
    acera_exterior: [4.5, 0, 5.4],
    barra_cliente: [-0.8, 0, 0.5],
    barra_vendedor: [-0.8, 0, -0.7],
    caja_tpv_cliente: [1.6, 0, 0.5],
    caja_tpv_vendedor: [1.6, 0, -0.7],
    barra_entrega_cliente: [0.4, 0, 0.5],
    barra_entrega_vendedor: [0.4, 0, -0.7],
    // Racks de exhibición y probadores
    raw_rack_clinico: [-4.2, 0, -2.5],
    raw_rack_gourmet: [-1.5, 0, -3.4],
    raw_rack_premium: [1.8, 0, -3.4],
    raw_mostrador_empaque: [2.8, 0, -1.0],
    probador_1: [-4.4, 0, 2.2],
    probador_2: [-4.4, 0, 3.6],
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
    raw_estante_papel: [-0.5, 0, -3.4],
    raw_estante_toner: [1.5, 0, -3.4],
    raw_rack_pliegos: [4.0, 0, -2.5],
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
    eq_tc_cortadora: [-4.0, 0, -2.8],
    eq_tc_overlock_5h: [-1.6, 0, -3.2],
    eq_tc_rectas_singer: [1.2, 0, -3.2],
    eq_tc_collaretera_singer: [3.8, 0, -3.0],
    eq_tc_plancha_vapor: [3.8, 0, -0.8],
    raw_mesa_corte_telas: [-4.2, 0, -1.0],
    raw_estante_avios: [-2.0, 0, -1.4],
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
    raw_mesa_impresion: [-2.2, 0, -1.8],
    espera_1: [3.0, 0, 2.8]
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
    descripcionIA: 'Secuencia completa de atención en barra, acuerdo de precio ($45), cobro en TPV, carga de bloque de hielo, encendido de raspadora (600W), llenado de vaso con hielo rallado empujando palanca, apagado, jarabeado lento de limón, colocación de popote y entrega.',
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
        duracionSegundos: 4.0,
        equipoKey: null,
        estadoEquipo: 'OFF',
        wattsNominales: 0,
        factorPotencia: 0,
        insumoId: null,
        cantidadInsumo: 0,
        dialogoCliente: 'Me da un Raspado de Limón por favor.',
        dialogoVendedor: '¡Claro que sí! Pasamos a la caja a cobrar.',
        itemManoVendedor: null,
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
        duracionSegundos: 6.0,
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
        efectoVisual: 'cash_register'
      },
      {
        id: 'step_5',
        orden: 5,
        codigo: 'INSERT_ICE_BLOCK',
        titulo: 'Preparar máquina insertando bloque de hielo',
        descripcion: 'El vendedor toma el bloque de hielo purificado y lo inserta dentro de la máquina de raspados.',
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
        cantidadInsumo: 0.25,
        dialogoCliente: null,
        dialogoVendedor: 'Insertando bloque de hielo en la máquina...',
        itemManoVendedor: 'ice_block',
        efectoVisual: 'load_ice'
      },
      {
        id: 'step_6',
        orden: 6,
        codigo: 'TURN_ON_SHAVER',
        titulo: 'Encender la máquina de raspados (600W)',
        descripcion: 'El vendedor acciona el interruptor y enciende el motor de la máquina de raspados.',
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
        dialogoVendedor: '⚡ Máquina de raspados encendida (600W)',
        itemManoVendedor: null,
        efectoVisual: 'machine_on'
      },
      {
        id: 'step_7',
        orden: 7,
        codigo: 'PLACE_CUP_UNDER_SPOUT',
        titulo: 'Tomar vaso y colocarlo bajo la salida de hielo',
        descripcion: 'El vendedor toma un vaso de 12oz y lo posiciona exactamente debajo de la salida de hielo.',
        actor: 'vendedor',
        waypointCliente: 'barra_entrega_cliente',
        waypointVendedor: 'eq_hp_raspadora',
        duracionSegundos: 3.0,
        equipoKey: 'hp_raspadora',
        estadoEquipo: 'WORK',
        wattsNominales: 600,
        factorPotencia: 0.85,
        apagarAlFinal: false,
        insumoId: 'mat_vaso_12oz',
        cantidadInsumo: 1,
        dialogoCliente: null,
        dialogoVendedor: 'Colocando vaso bajo la salida de hielo...',
        itemManoVendedor: 'empty_cup',
        efectoVisual: null
      },
      {
        id: 'step_8',
        orden: 8,
        codigo: 'PUSH_LEVER_SHAVE_ICE',
        titulo: 'Empujar palanca y llenar vaso con hielo rallado',
        descripcion: 'El vendedor empuja la palanca compresora y espera mientras el hielo rallado llena el vaso.',
        actor: 'vendedor',
        waypointCliente: 'barra_entrega_cliente',
        waypointVendedor: 'eq_hp_raspadora',
        duracionSegundos: 35.0, // 35s + 3s + 2s = 40s totales de motor encendido (0.67 min canónico)
        equipoKey: 'hp_raspadora',
        estadoEquipo: 'WORK',
        wattsNominales: 600,
        factorPotencia: 1.0,
        apagarAlFinal: false,
        insumoId: null,
        cantidadInsumo: 0,
        dialogoCliente: null,
        dialogoVendedor: '🍧 Rallando hielo... llenando vaso al 100%',
        itemManoVendedor: 'shaved_ice_cup',
        efectoVisual: 'shaving_ice_particles'
      },
      {
        id: 'step_9',
        orden: 9,
        codigo: 'TURN_OFF_SHAVER',
        titulo: 'Apagar la máquina de raspados',
        descripcion: 'Una vez lleno el vaso con nieve, el vendedor suelta la palanca y apaga la máquina.',
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
        dialogoVendedor: '🔌 Máquina de raspados apagada (0W)',
        itemManoVendedor: 'shaved_ice_cup',
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
    descripcionIA: 'Atención en barra, cobro en TPV ($75), precalentado de placa crepera a 200°C, vertido de masa, cocción al 80%, untado de Nutella/queso crema, doblado, apagado de crepera y entrega.',
    pasos: [
      {
        id: 'crepa_1',
        orden: 1,
        codigo: 'CLIENT_ORDER_CREPA',
        titulo: 'Cliente solicita Crepa en barra y acuerda precio ($75)',
        descripcion: 'Cliente llega a la barra, llama al vendedor y pide una Crepa recién hecha.',
        actor: 'ambos',
        waypointCliente: 'barra_cliente',
        waypointVendedor: 'barra_vendedor',
        duracionSegundos: 5.0,
        equipoKey: null,
        estadoEquipo: 'OFF',
        wattsNominales: 0,
        factorPotencia: 0,
        dialogoCliente: '¡Hola! ¿Me prepara una Crepa con Nutella y Queso?',
        dialogoVendedor: '¡Con gusto! Son $75 pesos en caja.'
      },
      {
        id: 'crepa_2',
        orden: 2,
        codigo: 'PAY_CREPA_TPV',
        titulo: 'Cobro de Crepa en TPV',
        descripcion: 'Registro de comanda y cobro en TPV.',
        actor: 'ambos',
        waypointCliente: 'caja_tpv_cliente',
        waypointVendedor: 'caja_tpv_vendedor',
        duracionSegundos: 6.0,
        equipoKey: 'hp_tpv',
        estadoEquipo: 'WORK',
        wattsNominales: 280,
        factorPotencia: 0.70,
        apagarAlFinal: false,
        dialogoCliente: 'Listo, pagado.',
        dialogoVendedor: '¡Gracias! Encendiendo la crepera.'
      },
      {
        id: 'crepa_3',
        orden: 3,
        codigo: 'PREHEAT_CREPERA',
        titulo: 'Encender y precalentar Crepera Profesional (3000W)',
        descripcion: 'Precalentamiento de placa de fundición a 200°C.',
        actor: 'vendedor',
        waypointCliente: 'barra_entrega_cliente',
        waypointVendedor: 'eq_hp_crepera',
        duracionSegundos: 45.0, // Ajustable con slider (preheat)
        equipoKey: 'hp_crepera',
        estadoEquipo: 'PREHEAT',
        wattsNominales: 3000,
        factorPotencia: 1.0,
        apagarAlFinal: false,
        dialogoVendedor: '🔥 Precalentando placa de crepera a 200°C...'
      },
      {
        id: 'crepa_4',
        orden: 4,
        codigo: 'COOK_CREPA_BATTER',
        titulo: 'Verter masa, extender con rastrillo y cocer crepa',
        descripcion: 'Toma porción de masa, la extiende en círculo y dora por ambos lados.',
        actor: 'vendedor',
        waypointCliente: 'barra_entrega_cliente',
        waypointVendedor: 'eq_hp_crepera',
        duracionSegundos: 90.0, // 1.5 min cocción activa
        equipoKey: 'hp_crepera',
        estadoEquipo: 'WORK',
        wattsNominales: 3000,
        factorPotencia: 0.80,
        apagarAlFinal: false,
        insumoId: 'mat_masa_crepa',
        cantidadInsumo: 1,
        dialogoVendedor: '🥞 Extendiendo masa y dorando crepa...'
      },
      {
        id: 'crepa_5',
        orden: 5,
        codigo: 'SPREAD_TOPPINGS_FOLD',
        titulo: 'Untar relleno gourmet, doblar y apagar crepera',
        descripcion: 'Coloca Nutella/queso crema, dobla en abanico y apaga la crepera.',
        actor: 'vendedor',
        waypointCliente: 'barra_entrega_cliente',
        waypointVendedor: 'raw_barra_toppings',
        duracionSegundos: 20.0,
        equipoKey: 'hp_crepera',
        estadoEquipo: 'OFF',
        wattsNominales: 3000,
        factorPotencia: 0.0,
        apagarAlFinal: true,
        insumoId: 'mat_relleno_gourmet',
        cantidadInsumo: 1,
        dialogoVendedor: 'Untando relleno y doblando crepa caliente...'
      },
      {
        id: 'crepa_6',
        orden: 6,
        codigo: 'DELIVER_CREPA',
        titulo: 'Entregar Crepa al cliente',
        descripcion: 'Entrega en barra al cliente.',
        actor: 'ambos',
        waypointCliente: 'barra_entrega_cliente',
        waypointVendedor: 'barra_entrega_vendedor',
        duracionSegundos: 4.0,
        equipoKey: null,
        estadoEquipo: 'OFF',
        wattsNominales: 0,
        factorPotencia: 0,
        dialogoCliente: '¡Huele increíble, gracias!',
        dialogoVendedor: '¡Su Crepa recién hecha!'
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
        duracionSegundos: 8.0,
        equipoKey: 'hp_tpv',
        estadoEquipo: 'WORK',
        wattsNominales: 280,
        factorPotencia: 0.70,
        apagarAlFinal: false,
        dialogoCliente: 'Una marquesita con mucho queso de bola por favor.',
        dialogoVendedor: '¡En seguida! Cobrando $65 en caja.'
      },
      {
        id: 'marq_2',
        orden: 2,
        codigo: 'PREHEAT_AND_PRESS_MARQ',
        titulo: 'Precalentar y prensar barquillo en Marquesitera (1300W)',
        descripcion: 'Precalienta planchas acanaladas y prensa la masa crujiente.',
        actor: 'vendedor',
        waypointCliente: 'barra_entrega_cliente',
        waypointVendedor: 'eq_hp_marquesitera',
        duracionSegundos: 95.0,
        equipoKey: 'hp_marquesitera',
        estadoEquipo: 'WORK',
        wattsNominales: 1300,
        factorPotencia: 0.85,
        apagarAlFinal: true,
        insumoId: 'mat_masa_crepa',
        cantidadInsumo: 1,
        dialogoVendedor: '🧀 Prensando barquillo y rallando queso de bola...'
      },
      {
        id: 'marq_3',
        orden: 3,
        codigo: 'ROLL_AND_DELIVER_MARQ',
        titulo: 'Rellenar, enrollar marquesita y entregar al cliente',
        descripcion: 'Agrega queso de bola, enrolla el tubo crujiente y entrega.',
        actor: 'ambos',
        waypointCliente: 'barra_entrega_cliente',
        waypointVendedor: 'barra_entrega_vendedor',
        duracionSegundos: 12.0,
        equipoKey: null,
        estadoEquipo: 'OFF',
        wattsNominales: 0,
        factorPotencia: 0,
        insumoId: 'mat_relleno_gourmet',
        cantidadInsumo: 0.8,
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
        duracionSegundos: 7.0,
        equipoKey: 'hp_tpv',
        estadoEquipo: 'WORK',
        wattsNominales: 280,
        factorPotencia: 0.70,
        apagarAlFinal: false,
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
        duracionSegundos: 8.0,
        equipoKey: null,
        estadoEquipo: 'OFF',
        wattsNominales: 0,
        factorPotencia: 0,
        insumoId: 'mat_pulpa_fruta',
        cantidadInsumo: 1,
        dialogoVendedor: 'Dosificando pulpa de fruta y hielo...'
      },
      {
        id: 'smoo_3',
        orden: 3,
        codigo: 'BLEND_HIGH_POWER',
        titulo: 'Licuar a alta potencia en Licuadora Profesional (51s)',
        descripcion: 'Enciende la licuadora de alta potencia durante 51 segundos y la apaga.',
        actor: 'vendedor',
        waypointCliente: 'barra_entrega_cliente',
        waypointVendedor: 'eq_hp_licuadora',
        duracionSegundos: 51.0,
        equipoKey: 'hp_licuadora',
        estadoEquipo: 'WORK',
        wattsNominales: 2000,
        factorPotencia: 1.0,
        apagarAlFinal: true,
        insumoId: 'mat_hielo_bloque',
        cantidadInsumo: 0.20,
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
        duracionSegundos: 7.0,
        equipoKey: null,
        estadoEquipo: 'OFF',
        wattsNominales: 0,
        factorPotencia: 0,
        insumoId: 'mat_vaso_12oz',
        cantidadInsumo: 1,
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
        duracionSegundos: 6.0,
        equipoKey: 'hp_tpv',
        estadoEquipo: 'WORK',
        wattsNominales: 280,
        factorPotencia: 0.70,
        apagarAlFinal: false,
        dialogoCliente: 'Un Café Americano recién molido, por favor.',
        dialogoVendedor: '¡En seguida! Son $40 pesos.'
      },
      {
        id: 'esp_2',
        orden: 2,
        codigo: 'GRIND_AND_EXTRACT_ESPRESSO',
        titulo: 'Molienda de grano (18g) y extracción en Cafetera Espresso',
        descripcion: 'Muele grano fresco, compacta portafiltro y extrae shot espresso.',
        actor: 'vendedor',
        waypointCliente: 'barra_entrega_cliente',
        waypointVendedor: 'eq_hp_breville',
        duracionSegundos: 40.0,
        equipoKey: 'hp_breville',
        estadoEquipo: 'WORK',
        wattsNominales: 2640,
        factorPotencia: 0.90,
        apagarAlFinal: false,
        insumoId: 'mat_cafe_grano',
        cantidadInsumo: 0.018,
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
        duracionSegundos: 6.0,
        equipoKey: 'hp_tpv',
        estadoEquipo: 'WORK',
        wattsNominales: 280,
        factorPotencia: 0.70,
        apagarAlFinal: false,
        dialogoCliente: '¿Me da un Cappuccino caliente por favor?',
        dialogoVendedor: '¡Claro! Son $55 pesos.'
      },
      {
        id: 'lat_2',
        orden: 2,
        codigo: 'EXTRACT_AND_STEAM_MILK',
        titulo: 'Extracción de espresso y espumado de leche al vapor',
        descripcion: 'Extrae el café y vaporiza la jarra de leche a 65°C.',
        actor: 'vendedor',
        waypointCliente: 'barra_entrega_cliente',
        waypointVendedor: 'eq_hp_breville',
        duracionSegundos: 70.0,
        equipoKey: 'hp_breville',
        estadoEquipo: 'WORK',
        wattsNominales: 2640,
        factorPotencia: 0.95,
        apagarAlFinal: false,
        insumoId: 'mat_leche_barista',
        cantidadInsumo: 0.22,
        dialogoVendedor: '🥛 Texturizando microespuma de leche al vapor...'
      },
      {
        id: 'lat_3',
        orden: 3,
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
        dialogoCliente: '¡Muchas gracias!',
        dialogoVendedor: '¡Su Cappuccino recién hecho!'
      }
    ]
  },

  // --------------------------------------------------------------------------
  // IMPERIA UNIFORMES: ATENCIÓN EN MOSTRADOR, EXHIBIDOR Y PROBADOR
  // --------------------------------------------------------------------------
  imp_uniforme_clinico_completo: {
    id: 'imp_uniforme_clinico_completo',
    negocioId: 'imperia_uniformes',
    nombreProducto: 'Uniforme Clínico / Filipina (Showroom con Probador)',
    precioVenta: 650.00,
    descripcionIA: 'El cliente entra a Imperia Uniformes, pregunta por tallas, la encargada busca la prenda en el rack exhibidor y se la muestra, el cliente entra al probador a medirse la prenda y decide comprarla pagando en TPV y Terminal POS.',
    pasos: [
      {
        id: 'imp_1',
        orden: 1,
        codigo: 'CLIENT_ASK_UNIFORM',
        titulo: 'Cliente entra al Showroom y solicita ver prenda',
        descripcion: 'El cliente se acerca al mostrador y pide ver un uniforme clínico / filipina.',
        actor: 'ambos',
        waypointCliente: 'barra_cliente',
        waypointVendedor: 'barra_vendedor',
        duracionSegundos: 5.0,
        equipoKey: null,
        estadoEquipo: 'OFF',
        wattsNominales: 0,
        factorPotencia: 0,
        dialogoCliente: '¡Buen día! Busco un uniforme clínico talla M.',
        dialogoVendedor: '¡Bienvenido a Imperia! Le muestro los modelos en existencia.'
      },
      {
        id: 'imp_2',
        orden: 2,
        codigo: 'SELLER_FETCH_GARMENT',
        titulo: 'Vendedora toma la prenda del exhibidor y la muestra',
        descripcion: 'La encargada camina al rack de uniformes, toma la talla solicitada y la muestra al cliente.',
        actor: 'vendedor',
        waypointCliente: 'barra_cliente',
        waypointVendedor: 'raw_rack_clinico',
        duracionSegundos: 7.0,
        equipoKey: null,
        estadoEquipo: 'OFF',
        wattsNominales: 0,
        factorPotencia: 0,
        dialogoVendedor: '👕 Tomando uniforme antifluidos del exhibidor...',
        itemManoVendedor: 'garment_hanger'
      },
      {
        id: 'imp_3',
        orden: 3,
        codigo: 'CLIENT_TRY_DRESSING_ROOM',
        titulo: 'Cliente pasa al Probador a medirse la prenda',
        descripcion: 'El cliente recibe la prenda, entra al probador y verifica cómo le queda.',
        actor: 'cliente',
        waypointCliente: 'probador_1',
        waypointVendedor: 'barra_vendedor',
        duracionSegundos: 25.0,
        equipoKey: null,
        estadoEquipo: 'OFF',
        wattsNominales: 0,
        factorPotencia: 0,
        dialogoCliente: '🚪 Probándome la prenda en el vestidor...',
        dialogoVendedor: 'Me avisa si necesita otra talla.'
      },
      {
        id: 'imp_4',
        orden: 4,
        codigo: 'POS_CHECKOUT_IMPERIA',
        titulo: 'Cliente decide comprar: Registro en TPV y cobro en Terminal POS',
        descripcion: 'El cliente sale convencido del probador, pasa al mostrador, se registra ticket en PC TPV (250W) y paga en Terminal Smart POS (15W).',
        actor: 'ambos',
        waypointCliente: 'caja_tpv_cliente',
        waypointVendedor: 'caja_tpv_vendedor',
        duracionSegundos: 35.0,
        equipoKey: 'imp_tpv',
        estadoEquipo: 'WORK',
        wattsNominales: 250,
        factorPotencia: 0.65,
        apagarAlFinal: false,
        insumoId: 'mat_stock_clinico_taller',
        cantidadInsumo: 1,
        dialogoCliente: '¡Me quedó excelente! Me lo llevo, pago con tarjeta.',
        dialogoVendedor: '💳 Cobrando en TPV y Terminal POS...'
      },
      {
        id: 'imp_5',
        orden: 5,
        codigo: 'BAG_AND_DELIVER_UNIFORM',
        titulo: 'Empaque en bolsa boutique y entrega al cliente',
        descripcion: 'La vendedora dobla el uniforme en bolsa Imperia y lo entrega.',
        actor: 'ambos',
        waypointCliente: 'barra_entrega_cliente',
        waypointVendedor: 'barra_entrega_vendedor',
        duracionSegundos: 6.0,
        equipoKey: 'imp_terminal',
        estadoEquipo: 'WORK',
        wattsNominales: 15,
        factorPotencia: 1.0,
        apagarAlFinal: false,
        insumoId: 'mat_bolsa_empaque_imp',
        cantidadInsumo: 1,
        dialogoCliente: '¡Muchas gracias, volveré pronto!',
        dialogoVendedor: '¡Gracias por su compra en Imperia Uniformes!'
      }
    ]
  },

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
        duracionSegundos: 15.0,
        equipoKey: 'pap_tpv',
        estadoEquipo: 'WORK',
        wattsNominales: 180,
        factorPotencia: 0.65,
        apagarAlFinal: false,
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
        duracionSegundos: 38.0,
        equipoKey: 'pap_docucolor',
        estadoEquipo: 'WORK',
        wattsNominales: 1500,
        factorPotencia: 0.95,
        apagarAlFinal: false,
        insumoId: 'mat_papel_bond_carta',
        cantidadInsumo: 8,
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
        dialogoCliente: '¡Quedaron nítidas, gracias!',
        dialogoVendedor: '¡Aquí tiene sus impresiones!'
      }
    ]
  },

  // --------------------------------------------------------------------------
  // BORDADOS VERACRUZ: LOTE 4 CABEZAS EN BORDADORA INDUSTRIAL AEMCO 220V
  // --------------------------------------------------------------------------
  bv_escudo_aemco: {
    id: 'bv_escudo_aemco',
    negocioId: 'bordados_veracruz',
    nombreProducto: 'Lote 4 Bordados Escudo en AEMCO 220V (4 Cabezas)',
    precioVenta: 180.00,
    descripcionIA: 'Enbastado de 4 prendas con pelón estabilizador, carga de diseño en panel Dahao, bordado simultáneo en 4 cabezas (1800W nominales / 1180W activos) y recorte.',
    pasos: [
      {
        id: 'bv_1',
        orden: 1,
        codigo: 'HOOP_GARMENTS',
        titulo: 'Recepción y enbastado de 4 prendas con pelón',
        descripcion: 'El operador coloca el pelón estabilizador y monta los 4 bastidores.',
        actor: 'vendedor',
        waypointCliente: 'barra_cliente',
        waypointVendedor: 'raw_mesa_bastidores',
        duracionSegundos: 20.0,
        equipoKey: 'bv_aemco_220',
        estadoEquipo: 'PREHEAT',
        wattsNominales: 1800,
        factorPotencia: 0.08,
        apagarAlFinal: false,
        insumoId: 'mat_pelon_estabilizador',
        cantidadInsumo: 4,
        dialogoCliente: 'Vengo por el bordado de estos 4 escudos escolares.',
        dialogoVendedor: '🧵 Montando 4 bastidores y cargando matriz en panel Dahao...'
      },
      {
        id: 'bv_2',
        orden: 2,
        codigo: 'RUN_4_HEAD_EMBROIDERY',
        titulo: 'Corrida continua de 4 cabezas en Bordadora AEMCO 220V (1800W)',
        descripcion: 'Los 4 cabezales bordan simultáneamente a 850 RPM.',
        actor: 'vendedor',
        waypointCliente: 'espera_1',
        waypointVendedor: 'eq_bv_aemco_220',
        duracionSegundos: 65.0,
        equipoKey: 'bv_aemco_220',
        estadoEquipo: 'WORK',
        wattsNominales: 1800,
        factorPotencia: 0.66,
        apagarAlFinal: true,
        insumoId: 'mat_hilo_bordado',
        cantidadInsumo: 4,
        dialogoVendedor: '⚡ Bordadora 4 cabezas operando a 220V...'
      },
      {
        id: 'bv_3',
        orden: 3,
        codigo: 'UNHOOP_AND_DELIVER',
        titulo: 'Desmontar bastidores, limpiar hilos y entregar lote',
        descripcion: 'Retira bastidores, apaga la bordadora y entrega las 4 prendas bordadas.',
        actor: 'ambos',
        waypointCliente: 'barra_entrega_cliente',
        waypointVendedor: 'barra_entrega_vendedor',
        duracionSegundos: 8.0,
        equipoKey: null,
        estadoEquipo: 'OFF',
        wattsNominales: 0,
        factorPotencia: 0,
        dialogoCliente: '¡Excelente calidad de puntada, gracias!',
        dialogoVendedor: '¡Listo su lote de 4 bordados!'
      }
    ]
  },

  // --------------------------------------------------------------------------
  // TALLER DE COSTURA IMPERIA: CONFECCIÓN COMPLETA DE FILIPINA (tc_filipina_chef)
  // --------------------------------------------------------------------------
  tc_filipina_chef: {
    id: 'tc_filipina_chef',
    negocioId: 'taller_costura',
    nombreProducto: 'Confección Filipina Médica / Chef (Corte + Overlock + Recta + Vapor)',
    precioVenta: 480.00,
    descripcionIA: 'Tendido y corte de tela con cortadora de disco (300W), sobrehilado en Overlock 5 Hilos (550W), costura en Rectas Singer (1100W) y planchado a vapor con caldera (1600W).',
    pasos: [
      {
        id: 'tc_1',
        orden: 1,
        codigo: 'CUT_FABRIC_DISC',
        titulo: 'Tendido de tela y corte con Cortadora de Disco (300W)',
        descripcion: 'Extiende rollo de gabardina/antifluidos y corta los patrones con cortadora octagonal.',
        actor: 'vendedor',
        waypointCliente: 'barra_cliente',
        waypointVendedor: 'eq_tc_cortadora',
        duracionSegundos: 18.0,
        equipoKey: 'tc_cortadora',
        estadoEquipo: 'WORK',
        wattsNominales: 300,
        factorPotencia: 1.0,
        apagarAlFinal: true,
        insumoId: 'mat_rollo_gabardina_antifluidos',
        cantidadInsumo: 1.6,
        dialogoVendedor: '✂️ Cortando lienzos con cortadora de disco (300W)...'
      },
      {
        id: 'tc_2',
        orden: 2,
        codigo: 'OVERLOCK_SEAMS',
        titulo: 'Sobrehilado y unión de piezas en Overlock 5 Hilos (550W)',
        descripcion: 'Cierra costados y mangas con puntada de seguridad de 5 hilos.',
        actor: 'vendedor',
        waypointCliente: 'espera_1',
        waypointVendedor: 'eq_tc_overlock_5h',
        duracionSegundos: 35.0,
        equipoKey: 'tc_overlock_5h',
        estadoEquipo: 'WORK',
        wattsNominales: 550,
        factorPotencia: 0.48,
        apagarAlFinal: false,
        insumoId: 'mat_avios_costura',
        cantidadInsumo: 1,
        dialogoVendedor: '🪡 Sobrehilando costuras en Overlock 5 Hilos...'
      },
      {
        id: 'tc_3',
        orden: 3,
        codigo: 'STRAIGHT_STITCH_SINGER',
        titulo: 'Armado de cuello, bolsas y aletilla en Rectas Singer (1100W)',
        descripcion: 'Pespunte fino de cuello mao, bolsas y ojales en máquinas rectas.',
        actor: 'vendedor',
        waypointCliente: 'espera_1',
        waypointVendedor: 'eq_tc_rectas_singer',
        duracionSegundos: 40.0,
        equipoKey: 'tc_rectas_singer',
        estadoEquipo: 'WORK',
        wattsNominales: 1100,
        factorPotencia: 0.45,
        apagarAlFinal: false,
        dialogoVendedor: '🧥 Cosiendo cuello y bolsas en Recta Industrial Singer...'
      },
      {
        id: 'tc_4',
        orden: 4,
        codigo: 'STEAM_PRESS_FINISH',
        titulo: 'Vaporizado final en Plancha con Caldera (1600W) y entrega',
        descripcion: 'Plancha con vapor industrial, apaga caldera y entrega prenda terminada (o envía a stock de Imperia).',
        actor: 'ambos',
        waypointCliente: 'barra_entrega_cliente',
        waypointVendedor: 'eq_tc_plancha_vapor',
        duracionSegundos: 22.0,
        equipoKey: 'tc_plancha_vapor',
        estadoEquipo: 'WORK',
        wattsNominales: 1600,
        factorPotencia: 0.75,
        apagarAlFinal: true,
        dialogoVendedor: '💨 Vaporizando filipina con caldera de 1.6 kW...'
      }
    ]
  },

  // --------------------------------------------------------------------------
  // PUBLI-IMPERIA: SUBLIMACIÓN DE TAZAS / DTF / LÁSER
  // --------------------------------------------------------------------------
  pi_sub_tazas: {
    id: 'pi_sub_tazas',
    negocioId: 'taller_publi_imperia',
    nombreProducto: 'Taza Sublimada Personalizada 11oz (Epson + Plancha 350W)',
    precioVenta: 95.00,
    descripcionIA: 'Ajuste de diseño en PC (240W), impresión de papel transfer en Epson L120 (20W), precalentado y prensado térmico a 200°C en Plancha de Tazas (350W) y apagado.',
    pasos: [
      {
        id: 'pi_1',
        orden: 1,
        codigo: 'DESIGN_AND_PRINT_TRANSFER',
        titulo: 'Diseño en PC (240W) e impresión transfer en Epson L120 (20W)',
        descripcion: 'Prepara plantilla en PC y envía impresión espejo con tinta de sublimación.',
        actor: 'vendedor',
        waypointCliente: 'barra_cliente',
        waypointVendedor: 'eq_pi_pc_diseno',
        duracionSegundos: 20.0,
        equipoKey: 'pi_pc_diseno',
        estadoEquipo: 'WORK',
        wattsNominales: 240,
        factorPotencia: 0.65,
        apagarAlFinal: false,
        insumoId: 'mat_transfer_dtf_vinil',
        cantidadInsumo: 1,
        dialogoCliente: 'Quiero sublimar esta taza con este diseño.',
        dialogoVendedor: '🖥️ Ajustando diseño e imprimiendo hoja de sublimación...'
      },
      {
        id: 'pi_2',
        orden: 2,
        codigo: 'HEAT_PRESS_MUG',
        titulo: 'Precalentado a 200°C y prensado en Plancha de Tazas (350W)',
        descripcion: 'Encinta el papel a la taza blanca, precalienta y prensa a 200°C; apaga al terminar.',
        actor: 'vendedor',
        waypointCliente: 'barra_entrega_cliente',
        waypointVendedor: 'eq_pi_plancha_tazas',
        duracionSegundos: 55.0,
        equipoKey: 'pi_plancha_tazas',
        estadoEquipo: 'WORK',
        wattsNominales: 350,
        factorPotencia: 0.85,
        apagarAlFinal: true,
        insumoId: 'mat_taza_blanca_11oz',
        cantidadInsumo: 1,
        dialogoVendedor: '🔥 Sublimando taza a 200°C en prensa cilíndrica (350W)...'
      },
      {
        id: 'pi_3',
        orden: 3,
        codigo: 'PEEL_AND_DELIVER_MUG',
        titulo: 'Retirar papel transfer y entregar taza personalizada',
        descripcion: 'Retira el papel en caliente y entrega la taza brillante al cliente.',
        actor: 'ambos',
        waypointCliente: 'barra_entrega_cliente',
        waypointVendedor: 'barra_entrega_vendedor',
        duracionSegundos: 6.0,
        equipoKey: null,
        estadoEquipo: 'OFF',
        wattsNominales: 0,
        factorPotencia: 0,
        dialogoCliente: '¡Colores súper vivos, muchas gracias!',
        dialogoVendedor: '¡Lista su taza sublimada!'
      }
    ]
  }
};

// ============================================================================
// 4. TAREAS DE EMPLEADOS CUANDO NO HAY CLIENTES (IDLE / MANTENIMIENTO)
// ============================================================================
export const TAREAS_SIN_CLIENTES_POR_NEGOCIO = {
  hawaiian_paradise: [
    { codigo: 'CLEAN_BAR', texto: '🧹 Limpiando barra y vitrinas', waypoint: 'barra_vendedor', duracion: 10 },
    { codigo: 'CHECK_ICE_STOCK', texto: '🧊 Revisando bloques de hielo en congeladora', waypoint: 'raw_congelador_hielo', duracion: 8 },
    { codigo: 'REFILL_SYRUPS', texto: '🍋 Acomodando botellas en estación de jarabes', waypoint: 'raw_estacion_jarabes', duracion: 9 },
    { codigo: 'CLEAN_CREPERA', texto: '✨ Limpiando placa de crepera y marquesitera', waypoint: 'eq_hp_crepera', duracion: 8 }
  ],
  imperia_uniformes: [
    { codigo: 'FOLD_UNIFORMS', texto: '👕 Doblando y alineando filipinas en exhibidor', waypoint: 'raw_rack_clinico', duracion: 12 },
    { codigo: 'ARRANGE_GOURMET', texto: '👨‍🍳 Ordenando línea PermaChef y Clinik', waypoint: 'raw_rack_gourmet', duracion: 10 },
    { codigo: 'CHECK_DRESSING_ROOM', texto: '🚪 Despejando prendas de los probadores', waypoint: 'probador_1', duracion: 8 },
    { codigo: 'INVENTORY_POS', texto: '💻 Verificando existencias de tallas en TPV', waypoint: 'caja_tpv_vendedor', duracion: 10 }
  ],
  papeleria_imperiarte: [
    { codigo: 'ALIGN_PAPER', texto: '📄 Acomodando resmas de papel bond y opalina', waypoint: 'raw_estante_papel', duracion: 10 },
    { codigo: 'ORGANIZE_BOARDS', texto: '📐 Ordenando pliegos de cartón batería y marquilla', waypoint: 'raw_rack_pliegos', duracion: 12 },
    { codigo: 'CLEAN_GLASS_DOCUCOLOR', texto: '✨ Limpiando cristal de exposición DocuColor', waypoint: 'eq_pap_docucolor', duracion: 9 }
  ],
  bordados_veracruz: [
    { codigo: 'PREP_BOBBINS', texto: '🧵 Devanando bobinas y ordenando conos de hilo', waypoint: 'raw_estante_hilos', duracion: 12 },
    { codigo: 'LUBE_HOOKS', texto: '🔧 Revisando tensión de agujas en AEMCO 4 cabezas', waypoint: 'eq_bv_aemco_220', duracion: 10 },
    { codigo: 'CUT_BACKING', texto: '✂️ Pre-cortando tramos de pelón estabilizador', waypoint: 'raw_mesa_bastidores', duracion: 11 }
  ],
  taller_costura: [
    { codigo: 'SORT_PATTERNS', texto: '📏 Ordenando moldes y rollos de gabardina', waypoint: 'raw_mesa_corte_telas', duracion: 11 },
    { codigo: 'THREAD_OVERLOCK', texto: '🪡 Revisando enhebrado de 5 hilos en Overlock', waypoint: 'eq_tc_overlock_5h', duracion: 10 },
    { codigo: 'FOLD_FINISHED', texto: '🧥 Empacando lote de prendas para Imperia Uniformes', waypoint: 'barra_vendedor', duracion: 12 }
  ],
  taller_publi_imperia: [
    { codigo: 'VECTOR_TEMPLATES', texto: '🎨 Preparando vectores y plantillas en PC Diseño', waypoint: 'eq_pi_pc_diseno', duracion: 14 },
    { codigo: 'ORGANIZE_BLANKS', texto: '☕ Acomodando cajas de tazas blancas y termos', waypoint: 'raw_estante_blanks', duracion: 10 },
    { codigo: 'CLEAN_LASER_LENS', texto: '🔬 Limpiando lente óptico de Láser Atomstack A20', waypoint: 'eq_pi_atomstack', duracion: 9 }
  ]
};

/**
 * Obtiene la receta coreografiada de un producto o genera una adaptada dinámicamente si es un producto secundario
 */
export function obtenerCoreografiaProducto(productoId, negocioId = 'hawaiian_paradise', overridesRecetas = {}) {
  if (overridesRecetas && overridesRecetas[productoId]) {
    return overridesRecetas[productoId];
  }
  if (RECETAS_COREOGRAFICAS_DETALLADAS[productoId]) {
    return RECETAS_COREOGRAFICAS_DETALLADAS[productoId];
  }
  // Fallbacks inteligentes por familia de negocio
  if (negocioId === 'imperia_uniformes') return RECETAS_COREOGRAFICAS_DETALLADAS.imp_uniforme_clinico_completo;
  if (negocioId === 'papeleria_imperiarte') return RECETAS_COREOGRAFICAS_DETALLADAS.pap_impresion_color;
  if (negocioId === 'bordados_veracruz') return RECETAS_COREOGRAFICAS_DETALLADAS.bv_escudo_aemco;
  if (negocioId === 'taller_costura') return RECETAS_COREOGRAFICAS_DETALLADAS.tc_filipina_chef;
  if (negocioId === 'taller_publi_imperia') return RECETAS_COREOGRAFICAS_DETALLADAS.pi_sub_tazas;
  return RECETAS_COREOGRAFICAS_DETALLADAS.hp_raspado;
}
