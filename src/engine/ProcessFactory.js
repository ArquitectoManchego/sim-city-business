/**
 * Fábrica Paramétrica de Procesos Operativos, Rutinas Humanas Universales y Queues Inter-Negocios.
 * Genera coreografías completas y realistas a partir de tablas de configuración compactas
 * sin duplicar lógica ni inflar el código.
 */

// ============================================================================
// 1. ESTANTES POR RAMA DE IMPERIA UNIFORMES (6 RAMAS + PEDIDOS LISTOS)
// ============================================================================
export const IMPERIA_BRANCH_RACKS = {
  gastronomia: {
    id: 'gastronomia',
    nombre: 'Gastronomía',
    waypoint: 'rack_gastronomia',
    pos: [-4.5, 0, -3.9],
    colorHex: '#f59e0b',
    prendas: ['Filipina de Chef', 'Mandil', 'Gorro Cocina', 'Pantalón Chef'],
    permiteArribaYAbajo: true
  },
  enfermeria: {
    id: 'enfermeria',
    nombre: 'Enfermería',
    waypoint: 'rack_enfermeria',
    pos: [-2.7, 0, -3.9],
    colorHex: '#e2e8f0',
    prendas: ['Conjunto Blanco Enfermería', 'Filipina Clínica'],
    permiteArribaYAbajo: true
  },
  medicina: {
    id: 'medicina',
    nombre: 'Medicina',
    waypoint: 'rack_medicina',
    pos: [-0.9, 0, -3.9],
    colorHex: '#14b8a6',
    prendas: ['Bata Médica', 'Scrub Quirúrgico Stretch', 'Juego Médico'],
    permiteArribaYAbajo: true
  },
  escolares: {
    id: 'escolares',
    nombre: 'Escolares',
    waypoint: 'rack_escolares',
    pos: [0.9, 0, -3.9],
    colorHex: '#3b82f6',
    prendas: ['Playera Escolar', 'Suéter', 'Falda / Pantalón Escolar'],
    permiteArribaYAbajo: true
  },
  industriales: {
    id: 'industriales',
    nombre: 'Industriales',
    waypoint: 'rack_industriales',
    pos: [2.7, 0, -3.9],
    colorHex: '#f97316',
    prendas: ['Camisola Industrial', 'Pantalón Cargo/Mezclilla', 'Overol', 'Chaleco'],
    permiteArribaYAbajo: true
  },
  proveedores: {
    id: 'proveedores',
    nombre: 'Proveedores (Cotexa/Euro/Jasbec)',
    waypoint: 'rack_proveedores',
    pos: [4.5, 0, -3.9],
    colorHex: '#8b5cf6',
    prendas: ['Playera Polo', 'Cuello Redondo', 'Camisa Vestir', 'Pantalón', 'Deportiva'],
    permiteArribaYAbajo: false
  }
};

// ============================================================================
// 2. CÁLCULO DE TIEMPOS EN PROBADOR DE IMPERIA UNIFORMES
// ============================================================================
/**
 * Calcula los segundos reales que tarda un cliente probándose N prendas (1..5):
 * - Compra directa (ya sabe su talla): 0s
 * - Solo prenda de arriba (filipina, camisa, playera, bata): 45s base + N * 50s
 * - Arriba + Abajo (conjunto con pantalón/falda): +65s extra por cambio de prenda inferior
 */
export function calcularTiempoProbador(numPrendas = 1, incluyePrendaAbajo = false, conoceTalla = false) {
  if (conoceTalla || numPrendas <= 0) return 0;
  const n = Math.max(1, Math.min(5, Math.round(numPrendas)));
  const segPorPrendaArriba = 50;
  const segExtraPrendaAbajo = incluyePrendaAbajo ? 65 : 0;
  return 45 + n * (segPorPrendaArriba + segExtraPrendaAbajo);
}

// ============================================================================
// 3. GENERADOR DE RECETAS PARA IMPERIA UNIFORMES (SHOWROOM, BORDADO, B2B)
// ============================================================================
export function buildImperiaShowroomRecipe({
  id,
  nombreProducto,
  precioVenta = 650,
  rama = 'medicina',
  numPrendas = 1,
  incluyePrendaAbajo = true,
  conoceTalla = false,
  requiereBordado = false,
  esPedidoB2B = false,
  esPedidoPubli = false,
  insumoId = 'mat_stock_clinico_taller'
}) {
  const rack = IMPERIA_BRANCH_RACKS[rama] || IMPERIA_BRANCH_RACKS.medicina;
  const pasos = [];
  let orden = 1;

  pasos.push({
    id: `${id}_ask`,
    orden: orden++,
    codigo: 'CLIENT_ASK_UNIFORM',
    titulo: `Cliente solicita ${rama} en Imperia Uniformes`,
    descripcion: `Atención en mostrador para gama de ${rack.nombre}.`,
    actor: 'ambos',
    waypointCliente: 'barra_cliente',
    waypointVendedor: 'barra_vendedor',
    duracionSegundos: 8.0,
    equipoKey: null,
    estadoEquipo: 'OFF',
    wattsNominales: 0,
    factorPotencia: 0,
    dialogoCliente: conoceTalla
      ? `¡Hola! Ya sé mi talla de ${rack.nombre}, vengo directo por ella.`
      : `¡Hola! Busco uniformes de ${rack.nombre} (${numPrendas} ${numPrendas === 1 ? 'prenda' : 'prendas'}).`,
    dialogoVendedor: `¡Con gusto! Vamos al estante de ${rack.nombre}.`
  });

  if (esPedidoB2B) {
    pasos.push({
      id: `${id}_b2b`,
      orden: orden++,
      codigo: 'CONSULT_B2B_SPECS',
      titulo: 'Asesoría B2B: modelo, manga, botones, color, tallas, entrega y facturación',
      descripcion: 'Cliente empresarial y vendedor definen si es prenda personalizada (manga corta/larga, botones, color), cantidad, tallas distintas, número de personas, uno o varios modelos, tiempo de entrega, forma de pago y datos de facturación.',
      actor: 'ambos',
      waypointCliente: 'barra_cliente',
      waypointVendedor: 'barra_vendedor',
      duracionSegundos: 195.0,
      equipoKey: 'imp_tpv',
      estadoEquipo: 'WORK',
      wattsNominales: 250,
      factorPotencia: 0.70,
      animacionVendedor: 'TALK_CLIENT',
      dialogoCliente: 'Necesitamos definir manga, botones, colores, tallas para el equipo, entrega y facturación.',
      dialogoVendedor: '📋 Anotando especificaciones B2B y enviando orden a fabricación...'
    });
  } else {
    pasos.push({
      id: `${id}_fetch`,
      orden: orden++,
      codigo: 'SELLER_FETCH_GARMENT',
      titulo: `Vendedor busca prenda en Estante de ${rack.nombre}`,
      descripcion: `Camina directamente al estante especializado de ${rack.nombre} y recoge ${numPrendas} ${numPrendas === 1 ? 'prenda' : 'prendas'}.`,
      actor: 'vendedor',
      waypointCliente: 'barra_cliente',
      waypointVendedor: rack.waypoint,
      duracionSegundos: 9.0 + numPrendas * 2.5,
      equipoKey: null,
      estadoEquipo: 'OFF',
      wattsNominales: 0,
      factorPotencia: 0,
      itemManoVendedor: 'garment_hanger',
      animacionVendedor: 'CARRY_PLATE',
      dialogoVendedor: `👕 Buscando talla en estante de ${rack.nombre}...`
    });

    if (!conoceTalla) {
      const tiempoProb = calcularTiempoProbador(numPrendas, incluyePrendaAbajo, false);
      pasos.push({
        id: `${id}_try`,
        orden: orden++,
        codigo: 'CLIENT_TRY_DRESSING_ROOM',
        titulo: `Cliente en Probador (${numPrendas} prendas, ${incluyePrendaAbajo ? 'arriba + abajo' : 'solo arriba'})`,
        descripcion: `Tiempo calculado para medirse ${numPrendas} prendas${incluyePrendaAbajo ? ' incluyendo cambio de prenda inferior' : ''}.`,
        actor: 'cliente',
        waypointCliente: 'probador_1',
        waypointVendedor: 'barra_vendedor',
        duracionSegundos: tiempoProb,
        equipoKey: null,
        estadoEquipo: 'OFF',
        wattsNominales: 0,
        factorPotencia: 0,
        numPrendasProbador: numPrendas,
        ramaEstante: rama,
        dialogoCliente: `🚪 Probándome ${numPrendas} ${numPrendas === 1 ? 'prenda' : 'prendas'} en vestidor (${tiempoProb}s)...`,
        dialogoVendedor: 'Me avisa si necesita otra talla o modelo.'
      });
    }
  }

  if (requiereBordado) {
    pasos.push({
      id: `${id}_emb`,
      orden: orden++,
      codigo: 'DEFINE_EMBROIDERY_SPECS',
      titulo: 'Definir logotipo, colores, cantidad y fecha de entrega de Bordado',
      descripcion: 'Vendedor y cliente acuerdan diseño de logotipo, colores de hilo, cantidad de prendas y fecha de entrega para Bordados Veracruz.',
      actor: 'ambos',
      waypointCliente: 'barra_cliente',
      waypointVendedor: 'barra_vendedor',
      duracionSegundos: 110.0,
      equipoKey: 'imp_tpv',
      estadoEquipo: 'WORK',
      wattsNominales: 250,
      factorPotencia: 0.70,
      animacionVendedor: 'TALK_CLIENT',
      dialogoCliente: 'Quiero bordar el logotipo con estos colores en las prendas, ¿para cuándo queda?',
      dialogoVendedor: '🧵 Definiendo logotipo y enviando pedido al queue de Bordados Veracruz...'
    });
  }

  pasos.push({
    id: `${id}_pay`,
    orden: orden++,
    codigo: 'POS_CHECKOUT_IMPERIA',
    titulo: `Registro en TPV y cobro en Terminal POS ($${precioVenta})`,
    descripcion: 'Registra venta/anticipo en sistema TPV Imperia y cobra con Terminal Bancaria.',
    actor: 'ambos',
    waypointCliente: 'caja_tpv_cliente',
    waypointVendedor: 'caja_tpv_vendedor',
    duracionSegundos: 22.0,
    equipoKey: 'imp_tpv',
    estadoEquipo: 'WORK',
    wattsNominales: 250,
    factorPotencia: 0.65,
    apagarAlFinal: false,
    insumoId,
    cantidadInsumo: esPedidoB2B ? 3 : 1,
    animacionVendedor: 'OPERATE_TPV',
    dialogoCliente: 'Perfecto, procedo con el pago.',
    dialogoVendedor: `💳 Cobrando $${precioVenta} MXN en TPV Imperia...`
  });

  pasos.push({
    id: `${id}_bag`,
    orden: orden++,
    codigo: 'BAG_AND_DELIVER_UNIFORM',
    titulo: esPedidoB2B || requiereBordado || esPedidoPubli
      ? 'Emitir orden de trabajo inter-negocio y comprobante'
      : 'Empacar en bolsa boutique y entregar al cliente',
    descripcion: 'Emite comprobante y encola trabajos pendientes a Taller Imperia, Bordados Veracruz o Publi-Impresos.',
    actor: 'ambos',
    waypointCliente: 'barra_entrega_cliente',
    waypointVendedor: 'barra_entrega_vendedor',
    duracionSegundos: 8.0,
    equipoKey: 'imp_terminal',
    estadoEquipo: 'WORK',
    wattsNominales: 15,
    factorPotencia: 1.0,
    apagarAlFinal: true,
    insumoId: 'mat_bolsa_empaque_imp',
    cantidadInsumo: 1,
    itemManoVendedor: 'product_bag',
    animacionVendedor: 'CARRY_PLATE',
    dialogoCliente: '¡Muchas gracias, excelente atención!',
    dialogoVendedor: '¡Gracias por su compra en Imperia Uniformes!'
  });

  return {
    id,
    negocioId: 'imperia_uniformes',
    nombreProducto,
    precioVenta,
    ramaEstante: rama,
    numPrendasProbador: conoceTalla ? 0 : numPrendas,
    routesToQueue: {
      bordados: requiereBordado,
      tallerCostura: esPedidoB2B,
      publiImpresos: esPedidoPubli
    },
    descripcionIA: `Estante ${rack.nombre}, ${conoceTalla ? 'compra directa sin probador' : `probador ${numPrendas} prendas`}${requiereBordado ? ' + orden a Bordados Veracruz' : ''}${esPedidoB2B ? ' + orden B2B a Taller Imperia' : ''}.`,
    pasos
  };
}

// ============================================================================
// 4. GENERADOR DE CONFECCIÓN SECUENCIAL PARA TALLER DE COSTURA IMPERIA
// ============================================================================
/**
 * Respeta la secuencia estricta:
 * Buscar trazo -> Buscar tela -> Extender sobre mesa -> Colocar trazo ->
 * Afianzar con alfileres -> Trazar greda -> Cortar -> Costura (Recta sola O Overlock+Recta+Collaretera) ->
 * Planchado intermedio entre costuras -> Regreso a máquina -> Planchado final completo, colgado y etiquetado.
 */
export function buildSewingWorkshopRecipe({
  id,
  nombreProducto,
  precioVenta = 480,
  tipoCostura = 'completo', // 'recta_sola' | 'completo'
  requierePlanchadoIntermedio = true
}) {
  const pasos = [];
  let orden = 1;

  pasos.push(
    {
      id: `${id}_s1`,
      orden: orden++,
      codigo: 'SEARCH_PATTERN',
      titulo: '1. Buscar trazo/molde de la prenda',
      descripcion: 'Localiza el patrón graduado por talla en el archivo de trazos.',
      actor: 'vendedor',
      waypointCliente: 'barra_cliente',
      waypointVendedor: 'raw_estante_avios',
      duracionSegundos: 12.0,
      equipoKey: null,
      estadoEquipo: 'OFF',
      wattsNominales: 0,
      factorPotencia: 0,
      itemManoVendedor: 'paper_stack',
      animacionVendedor: 'CARRY_PLATE',
      dialogoVendedor: '📐 Buscando trazo y molde por talla...'
    },
    {
      id: `${id}_s2`,
      orden: orden++,
      codigo: 'FETCH_FABRIC_ROLL',
      titulo: '2. Buscar rollo de tela correspondiente',
      descripcion: 'Toma el rollo de tela correcto para llevarlo a la mesa de corte.',
      actor: 'vendedor',
      waypointCliente: 'barra_cliente',
      waypointVendedor: 'raw_mesa_corte_telas',
      duracionSegundos: 12.0,
      equipoKey: null,
      estadoEquipo: 'OFF',
      wattsNominales: 0,
      factorPotencia: 0,
      itemManoVendedor: 'fabric_roll',
      animacionVendedor: 'CARRY_BOWL',
      dialogoVendedor: '🧵 Tomando rollo de tela para tendido...'
    },
    {
      id: `${id}_s3`,
      orden: orden++,
      codigo: 'SPREAD_AND_PIN_TRACE',
      titulo: '3–6. Extender tela en mesa, colocar trazo, afianzar con alfileres y trazar',
      descripcion: 'Extiende la tela sobre mesa de corte, coloca el molde, fija con alfileres y marca contorno con greda.',
      actor: 'vendedor',
      waypointCliente: 'espera_1',
      waypointVendedor: 'raw_mesa_corte_telas',
      duracionSegundos: 45.0,
      equipoKey: null,
      estadoEquipo: 'OFF',
      wattsNominales: 0,
      factorPotencia: 0,
      itemManoVendedor: 'fabric_roll',
      animacionVendedor: 'SPREAD_INGREDIENTS',
      dialogoVendedor: '📌 Extendiendo tela, colocando trazo, afianzando con alfileres y trazando...'
    },
    {
      id: `${id}_s4`,
      orden: orden++,
      codigo: 'CUT_FABRIC_DISC',
      titulo: '7. Cortar lienzos con Cortadora Eléctrica de Disco (300W)',
      descripcion: 'Corta con precisión siguiendo la línea trazada.',
      actor: 'vendedor',
      waypointCliente: 'espera_1',
      waypointVendedor: 'eq_tc_cortadora',
      duracionSegundos: 28.0,
      equipoKey: 'tc_cortadora',
      estadoEquipo: 'WORK',
      wattsNominales: 300,
      factorPotencia: 1.0,
      apagarAlFinal: true,
      insumoId: 'mat_rollo_gabardina_antifluidos',
      cantidadInsumo: 1.5,
      itemManoVendedor: 'fabric_roll',
      animacionVendedor: 'CUT_FABRIC',
      dialogoVendedor: '✂️ Cortando piezas en mesa con cortadora de disco (300W)...'
    }
  );

  if (tipoCostura === 'completo') {
    pasos.push({
      id: `${id}_s5`,
      orden: orden++,
      codigo: 'OVERLOCK_SEAMS',
      titulo: '8a. Pasar a máquina Overlock 5 Hilos (550W)',
      descripcion: 'Une piezas y realiza sobrehilado de refuerzo en 5 hilos.',
      actor: 'vendedor',
      waypointCliente: 'espera_1',
      waypointVendedor: 'eq_tc_overlock_5h',
      duracionSegundos: 26.0,
      equipoKey: 'tc_overlock_5h',
      estadoEquipo: 'WORK',
      wattsNominales: 550,
      factorPotencia: 0.48,
      apagarAlFinal: true,
      insumoId: 'mat_avios_costura',
      cantidadInsumo: 1,
      itemManoVendedor: 'fabric_roll',
      animacionVendedor: 'SEW_MACHINE',
      dialogoVendedor: '🪡 Cosiendo unión en máquina Overlock 5 hilos...'
    });
  }

  pasos.push({
    id: `${id}_s6`,
    orden: orden++,
    codigo: 'STRAIGHT_STITCH_SINGER',
    titulo: '8b. Costura armada en Rectas Industrial Singer (1100W)',
    descripcion: 'Arma cuellos, vistas, aletillas y bolsillos en máquina recta.',
    actor: 'vendedor',
    waypointCliente: 'espera_1',
    waypointVendedor: 'eq_tc_rectas_singer',
    duracionSegundos: 28.0,
    equipoKey: 'tc_rectas_singer',
    estadoEquipo: 'WORK',
    wattsNominales: 1100,
    factorPotencia: 0.45,
    apagarAlFinal: true,
    itemManoVendedor: 'fabric_roll',
    animacionVendedor: 'SEW_MACHINE',
    dialogoVendedor: '🧥 Cosido principal en Recta Singer (1100W)...'
  });

  if (requierePlanchadoIntermedio) {
    pasos.push(
      {
        id: `${id}_s7`,
        orden: orden++,
        codigo: 'MID_SEAM_PRESS',
        titulo: '8c. Planchado intermedio entre costuras en Plancha Vapor (1600W)',
        descripcion: 'Abre y asienta costuras, cuellos y bolsas con plancha de vapor antes del pespunte final.',
        actor: 'vendedor',
        waypointCliente: 'espera_1',
        waypointVendedor: 'eq_tc_plancha_vapor',
        duracionSegundos: 20.0,
        equipoKey: 'tc_plancha_vapor',
        estadoEquipo: 'WORK',
        wattsNominales: 1600,
        factorPotencia: 0.72,
        apagarAlFinal: false,
        itemManoVendedor: 'garment_hanger',
        animacionVendedor: 'IRON_PRESS',
        dialogoVendedor: '💨 Planchado intermedio de costuras y cuello...'
      },
      {
        id: `${id}_s8`,
        orden: orden++,
        codigo: 'RETURN_TO_STITCH_COLLARETERA',
        titulo: '8d. Regresar a máquina para pespunte final y collaretera (550W)',
        descripcion: 'Termina pespuntes y dobladillos tras el planchado intermedio.',
        actor: 'vendedor',
        waypointCliente: 'espera_1',
        waypointVendedor: tipoCostura === 'completo' ? 'eq_tc_collaretera_singer' : 'eq_tc_rectas_singer',
        duracionSegundos: 22.0,
        equipoKey: tipoCostura === 'completo' ? 'tc_collaretera_singer' : 'tc_rectas_singer',
        estadoEquipo: 'WORK',
        wattsNominales: tipoCostura === 'completo' ? 550 : 1100,
        factorPotencia: 0.48,
        apagarAlFinal: true,
        itemManoVendedor: 'fabric_roll',
        animacionVendedor: 'SEW_MACHINE',
        dialogoVendedor: '🪡 Regresando a máquina para pespunte y acabado final...'
      }
    );
  }

  pasos.push({
    id: `${id}_s9`,
    orden: orden++,
    codigo: 'FINAL_STEAM_PRESS_AND_TAG',
    titulo: '9. Planchado final completo, colgado en gancho y etiquetado',
    descripcion: 'Planchado integral con vapor (1600W), se cuelga la prenda y se etiqueta lista para traslado en lote a Imperia Uniformes.',
    actor: 'ambos',
    waypointCliente: 'barra_entrega_cliente',
    waypointVendedor: 'eq_tc_plancha_vapor',
    duracionSegundos: 26.0,
    equipoKey: 'tc_plancha_vapor',
    estadoEquipo: 'WORK',
    wattsNominales: 1600,
    factorPotencia: 0.78,
    apagarAlFinal: true,
    itemManoVendedor: 'garment_hanger',
    animacionVendedor: 'IRON_PRESS',
    dialogoVendedor: '🏷️ Planchado final, colgado y etiquetado para Imperia Uniformes.'
  });

  return {
    id,
    negocioId: 'taller_costura',
    nombreProducto,
    precioVenta,
    deliversToImperia: true,
    descripcionIA: 'Secuencia completa: trazo -> tela -> mesa -> alfileres -> tiza -> corte -> costura + planchado intermedio -> regreso a máquina -> planchado final, colgado, etiquetado y envío a Imperia.',
    pasos
  };
}

// ============================================================================
// 5. GENERADOR DE BORDADOS VERACRUZ + ETIQUETADO + ENVÍO A IMPERIA
// ============================================================================
export function buildEmbroideryRecipe({
  id,
  nombreProducto,
  precioVenta = 180,
  equipoKey = 'bv_aemco_220', // 'bv_aemco_220' | 'bv_melco_emc'
  wattsNominales = 1800
}) {
  const wpMachine = equipoKey === 'bv_melco_emc' ? 'eq_bv_melco_emc' : 'eq_bv_aemco_220';
  return {
    id,
    negocioId: 'bordados_veracruz',
    nombreProducto,
    precioVenta,
    deliversToImperia: true,
    descripcionIA: 'Enbastado con pelón, selección de hilos, corrida industrial de bordado, recorte, etiquetado y envío a Imperia Uniformes.',
    pasos: [
      {
        id: `${id}_b1`,
        orden: 1,
        codigo: 'HOOP_GARMENTS',
        titulo: 'Enbastidorar prendas y cargar matriz/conos de hilo',
        descripcion: 'Coloca pelón estabilizador y monta bastidores.',
        actor: 'vendedor',
        waypointCliente: 'barra_cliente',
        waypointVendedor: 'raw_mesa_bastidores',
        duracionSegundos: 20.0,
        equipoKey,
        estadoEquipo: 'PREHEAT',
        wattsNominales,
        factorPotencia: 0.08,
        insumoId: 'mat_pelon_estabilizador',
        cantidadInsumo: 4,
        itemManoVendedor: 'fabric_roll',
        animacionVendedor: 'CARRY_BOWL',
        dialogoCliente: 'Dejo estas prendas para bordado de logotipo.',
        dialogoVendedor: '🧵 Montando bastidores y cargando hilos...'
      },
      {
        id: `${id}_b2`,
        orden: 2,
        codigo: 'RUN_EMBROIDERY_MACHINE',
        titulo: `Bordado multipuntada en ${equipoKey === 'bv_melco_emc' ? 'Melco EMC' : 'AEMCO 4 Cabezas 220V'}`,
        descripcion: 'Bordado automatizado de alta densidad.',
        actor: 'vendedor',
        waypointCliente: 'espera_1',
        waypointVendedor: wpMachine,
        duracionSegundos: 45.0,
        equipoKey,
        estadoEquipo: 'WORK',
        wattsNominales,
        factorPotencia: 0.66,
        apagarAlFinal: true,
        insumoId: 'mat_hilo_bordado',
        cantidadInsumo: 4,
        animacionVendedor: 'WAIT_COOKING',
        dialogoVendedor: '⚡ Bordadora industrial trabajando a 850 RPM...'
      },
      {
        id: `${id}_b3`,
        orden: 3,
        codigo: 'TAG_AND_DELIVER_TO_IMPERIA',
        titulo: 'Recortar hilos, etiquetar prenda terminada y entregar a Imperia Uniformes',
        descripcion: 'Se etiqueta la prenda bordada y se traslada al empleado de Imperia Uniformes para colocarse en Pedidos Listos.',
        actor: 'ambos',
        waypointCliente: 'barra_entrega_cliente',
        waypointVendedor: 'barra_entrega_vendedor',
        duracionSegundos: 15.0,
        equipoKey: null,
        estadoEquipo: 'OFF',
        wattsNominales: 0,
        factorPotencia: 0,
        itemManoVendedor: 'garment_hanger',
        animacionVendedor: 'CARRY_PLATE',
        dialogoCliente: '¡Quedó nítido el bordado!',
        dialogoVendedor: '🏷️ Etiquetando prenda bordada y entregando a Imperia Uniformes...'
      }
    ]
  };
}

// ============================================================================
// 6. GENERADOR PARAMÉTRICO PARA PUBLI-IMPRESOS (DTF / SUBLIMACIÓN / VINIL / PROMO)
// ============================================================================
/**
 * Parametriza técnicas térmicas exactas y logística externa:
 * - DTF (Combi Gráfica / Promox): Precalentar 160°C 5m (300s) + 3 ciclos de (15s plancha + 20s enfriar).
 * - Sublimación Plana (Imagen Impresa): Precalentar 200°C 5m (300s) + 1 ciclo de 60s.
 * - Vinil Textil (Euro): Corte en plotter (60–300s) + depilado/pelado manual + Precalentar 140°C + 3 ciclos de (20s plancha + 20s enfriar).
 */
export function buildPubliPrintRecipe({
  id,
  nombreProducto,
  precioVenta = 190,
  tecnica = 'DTF', // 'DTF' | 'SUBLIMACION_PLANA' | 'VINIL_TEXTIL' | 'SUBLIMACION_TAZA' | 'LASER' | 'PROMOCIONAL_ESCOLAR'
  esUrgente = false,
  esLoteB2B = false,
  cantidadLote = 1
}) {
  const pasos = [];
  let orden = 1;

  if (tecnica === 'VINIL_TEXTIL') {
    pasos.push(
      {
        id: `${id}_v1`,
        orden: orden++,
        codigo: 'DESIGN_AND_CUT_VINYL',
        titulo: 'Diseño en PC (240W) y corte de vinil textil en plotter (1 a 5 min)',
        descripcion: 'Compra de vinil en Euro y envío de trazos en PC para cortar todos los diseños en una corrida.',
        actor: 'vendedor',
        waypointCliente: 'barra_cliente',
        waypointVendedor: 'eq_pi_pc_diseno',
        duracionSegundos: 90.0, // 1.5 min promedio dentro del rango 1-5 min
        equipoKey: 'pi_pc_diseno',
        estadoEquipo: 'WORK',
        wattsNominales: 240,
        factorPotencia: 0.72,
        insumoId: 'mat_transfer_dtf_vinil',
        cantidadInsumo: 1,
        itemManoVendedor: 'paper_stack',
        animacionVendedor: 'OPERATE_TPV',
        dialogoCliente: 'Necesito este diseño en vinil textil sobre la prenda.',
        dialogoVendedor: '✂️ Cortando vinil de Euro en plotter (1–5 min según complejidad)...'
      },
      {
        id: `${id}_v2`,
        orden: orden++,
        codigo: 'WEED_CUT_VINYL',
        titulo: 'Pelar / Depilar excedentes del vinil cortado (paso más tardado)',
        descripcion: 'Depilado manual detallado con depilador para dejar limpio el gráfico antes de planchar.',
        actor: 'vendedor',
        waypointCliente: 'espera_1',
        waypointVendedor: 'raw_mesa_impresion',
        duracionSegundos: 150.0,
        equipoKey: 'pi_pc_diseno',
        estadoEquipo: 'STANDBY',
        wattsNominales: 240,
        factorPotencia: 0.50,
        animacionVendedor: 'SPREAD_INGREDIENTS',
        dialogoVendedor: '🔎 Pelando y depilando vinil cortado (tarea detallada)...'
      },
      {
        id: `${id}_v3`,
        orden: orden++,
        codigo: 'PREHEAT_FLAT_PRESS_140',
        titulo: 'Precalentar Plancha Plana a 140°C (1000W)',
        descripcion: 'Verifica que prenda y vinil depilado estén listos y calienta plancha plana a 140°C.',
        actor: 'vendedor',
        waypointCliente: 'espera_1',
        waypointVendedor: 'eq_pi_plancha_plana',
        duracionSegundos: 180.0,
        equipoKey: 'pi_plancha_plana',
        estadoEquipo: 'PREHEAT',
        wattsNominales: 1000,
        factorPotencia: 0.90,
        animacionVendedor: 'WAIT_HEATING',
        dialogoVendedor: '🔥 Precalentando plancha plana a 140°C para vinil textil...'
      }
    );

    // 3 ciclos exactos de 20s planchado + 20s enfriamiento entre pasadas
    for (let c = 1; c <= 3; c++) {
      pasos.push({
        id: `${id}_vpress_${c}`,
        orden: orden++,
        codigo: `VINYL_PRESS_CYCLE_${c}`,
        titulo: `Planchar Vinil a 140°C — Pasada ${c}/3 (20s)`,
        descripcion: `Aplica presión y calor a 140°C durante 20 segundos (ciclo ${c} de 3).`,
        actor: 'vendedor',
        waypointCliente: 'espera_1',
        waypointVendedor: 'eq_pi_plancha_plana',
        duracionSegundos: 20.0,
        equipoKey: 'pi_plancha_plana',
        estadoEquipo: 'WORK',
        wattsNominales: 1000,
        factorPotencia: 0.95,
        apagarAlFinal: c === 3,
        animacionVendedor: 'IRON_PRESS',
        dialogoVendedor: `♨️ Planchando vinil a 140°C — Ciclo ${c}/3 (20s)...`
      });
      if (c < 3) {
        pasos.push({
          id: `${id}_vcool_${c}`,
          orden: orden++,
          codigo: `PRESS_COOLING_INTERVAL_${c}`,
          titulo: `Enfriar prenda entre planchados (${c}/2 — 20s)`,
          descripcion: 'Deja reposar 20 segundos para estabilizar adhesivo antes del siguiente prensado.',
          actor: 'vendedor',
          waypointCliente: 'espera_1',
          waypointVendedor: 'raw_mesa_impresion',
          duracionSegundos: 20.0,
          equipoKey: 'pi_plancha_plana',
          estadoEquipo: 'STANDBY',
          wattsNominales: 1000,
          factorPotencia: 0.15,
          animacionVendedor: 'WAIT_COOKING',
          dialogoVendedor: `❄️ Enfriando prenda 20 segundos antes de pasada ${c + 1}...`
        });
      }
    }
  } else if (tecnica === 'SUBLIMACION_PLANA') {
    pasos.push(
      {
        id: `${id}_sub0`,
        orden: orden++,
        codigo: 'PREP_SUBLIMATION_SHEET_AND_PREHEAT_200',
        titulo: 'Acomodar prenda y hoja sublimación + Precalentar Plancha a 200°C (5 min = 300s)',
        descripcion: 'Con prenda y hoja de Imagen Impresa/Epson listas, acomoda en mesa y precalienta plancha plana a 200°C durante 5 minutos.',
        actor: 'vendedor',
        waypointCliente: 'barra_cliente',
        waypointVendedor: 'eq_pi_plancha_plana',
        duracionSegundos: 300.0,
        equipoKey: 'pi_plancha_plana',
        estadoEquipo: 'PREHEAT',
        wattsNominales: 1000,
        factorPotencia: 0.92,
        insumoId: 'mat_playera_gorra_blank',
        cantidadInsumo: 1,
        animacionVendedor: 'WAIT_HEATING',
        dialogoCliente: 'Quiero sublimación de formato amplio en esta prenda.',
        dialogoVendedor: '🔥 Precalentando plancha plana a 200°C (5 min) con hoja lista...'
      },
      {
        id: `${id}_sub1`,
        orden: orden++,
        codigo: 'SUBLIMATION_PRESS_60S',
        titulo: 'Planchar Sublimación Textil a 200°C por 1 minuto (60s, una sola vez)',
        descripcion: 'Prensado único de 60 segundos a 200°C para sublimación completa.',
        actor: 'vendedor',
        waypointCliente: 'espera_1',
        waypointVendedor: 'eq_pi_plancha_plana',
        duracionSegundos: 60.0,
        equipoKey: 'pi_plancha_plana',
        estadoEquipo: 'WORK',
        wattsNominales: 1000,
        factorPotencia: 0.98,
        apagarAlFinal: true,
        insumoId: 'mat_transfer_dtf_vinil',
        cantidadInsumo: 1,
        animacionVendedor: 'IRON_PRESS',
        dialogoVendedor: '♨️ Planchando sublimación a 200°C durante 1 minuto exacto (60s)...'
      }
    );
  } else {
    // DTF por defecto: preheat 160°C 5 min (300s) + 3 ciclos de (15s plancha + 20s enfriamiento)
    pasos.push({
      id: `${id}_dtf0`,
      orden: orden++,
      codigo: 'PREP_DTF_AND_PREHEAT_160',
      titulo: 'Acomodar prenda con transfer DTF + Precalentar Plancha a 160°C (5 min = 300s)',
      descripcion: 'Cuando prenda y transfer DTF de Combi Gráfica/Promox están listos, acomoda prenda y precalienta plancha plana a 160°C durante 5 minutos.',
      actor: 'vendedor',
      waypointCliente: 'barra_cliente',
      waypointVendedor: 'eq_pi_plancha_plana',
      duracionSegundos: 300.0,
      equipoKey: 'pi_plancha_plana',
      estadoEquipo: 'PREHEAT',
      wattsNominales: 1000,
      factorPotencia: 0.88,
      insumoId: 'mat_playera_gorra_blank',
      cantidadInsumo: esLoteB2B ? 5 : 1,
      animacionVendedor: 'WAIT_HEATING',
      dialogoCliente: esLoteB2B
        ? `Pedido corporativo B2B de ${cantidadLote} prendas con DTF.`
        : 'Vengo por esta playera estampada con DTF.',
      dialogoVendedor: '🔥 Precalentando plancha plana a 160°C (5 min) para DTF...'
    });

    for (let c = 1; c <= 3; c++) {
      pasos.push({
        id: `${id}_dtfpress_${c}`,
        orden: orden++,
        codigo: `DTF_PRESS_CYCLE_${c}`,
        titulo: `Planchar DTF a 160°C — Pasada ${c}/3 (15s)`,
        descripcion: `Prensado DTF de 15 segundos exactos a 160°C (pasada ${c} de 3).`,
        actor: 'vendedor',
        waypointCliente: 'espera_1',
        waypointVendedor: 'eq_pi_plancha_plana',
        duracionSegundos: 15.0,
        equipoKey: 'pi_plancha_plana',
        estadoEquipo: 'WORK',
        wattsNominales: 1000,
        factorPotencia: 0.95,
        apagarAlFinal: c === 3,
        insumoId: c === 1 ? 'mat_transfer_dtf_vinil' : null,
        cantidadInsumo: c === 1 ? (esLoteB2B ? 5 : 1) : 0,
        animacionVendedor: 'IRON_PRESS',
        dialogoVendedor: `♨️ Planchando DTF 15 seg a 160°C — Ciclo ${c}/3...`
      });
      if (c < 3) {
        pasos.push({
          id: `${id}_dtfcool_${c}`,
          orden: orden++,
          codigo: `PRESS_COOLING_INTERVAL_${c}`,
          titulo: `Enfriar transfer DTF entre planchados (${c}/2 — 20s)`,
          descripcion: 'Espera 20 segundos de enfriamiento antes de retirar film y volver a planchar.',
          actor: 'vendedor',
          waypointCliente: 'espera_1',
          waypointVendedor: 'raw_mesa_impresion',
          duracionSegundos: 20.0,
          equipoKey: 'pi_plancha_plana',
          estadoEquipo: 'STANDBY',
          wattsNominales: 1000,
          factorPotencia: 0.15,
          animacionVendedor: 'WAIT_COOKING',
          dialogoVendedor: `❄️ Enfriando DTF 20s antes del siguiente planchado (${c + 1}/3)...`
        });
      }
    }
  }

  pasos.push({
    id: `${id}_pack`,
    orden: orden++,
    codigo: esLoteB2B ? 'PACK_B2B_STORAGE_BOXES' : 'TAG_AND_STORE_PUBLI',
    titulo: esLoteB2B
      ? `Empaquetar lote B2B (${cantidadLote} pzas) en cajas y guardar en Almacén Publi-Impresos`
      : `Etiquetar pedido${esUrgente ? ' URGENTE (entrega inmediata a Imperia)' : ' y agrupar para entrega diaria a Imperia'}`,
    descripcion: esLoteB2B
      ? 'Acomoda todas las prendas terminadas en cajas dentro del almacén B2B de Publi-Impresos para entrega directa en el local de la empresa cliente.'
      : 'Etiqueta la prenda y la deja lista para su envío agrupado a Imperia Uniformes (o envío inmediato si es urgente).',
    actor: 'ambos',
    waypointCliente: 'barra_entrega_cliente',
    waypointVendedor: esLoteB2B ? 'raw_almacen_b2b' : 'barra_entrega_vendedor',
    duracionSegundos: esLoteB2B ? 45.0 : 12.0,
    equipoKey: null,
    estadoEquipo: 'OFF',
    wattsNominales: 0,
    factorPotencia: 0,
    itemManoVendedor: 'product_bag',
    animacionVendedor: 'CARRY_PLATE',
    dialogoVendedor: esLoteB2B
      ? `📦 Lote B2B (${cantidadLote} pzas) empacado en cajas y guardado en Almacén Publi-Impresos.`
      : esUrgente
        ? '⚡ Pedido URGENTE etiquetado: entregando de inmediato a Imperia Uniformes.'
        : '🏷️ Etiquetado y acomodado para envío de hoy a Imperia Uniformes.'
  });

  return {
    id,
    negocioId: 'taller_publi_imperia',
    nombreProducto,
    precioVenta,
    esUrgente,
    esLoteB2B,
    cantidadLote,
    deliversToImperia: !esLoteB2B,
    descripcionIA: `Técnica ${tecnica}${esLoteB2B ? ` lote B2B (${cantidadLote} pzas en Almacén Publi-Impresos)` : ''}.`,
    pasos
  };
}

// ============================================================================
// 7. RUTINAS DIARIAS, OPERATIVAS Y COMPORTAMIENTO HUMANO UNIVERSAL
// ============================================================================
export const UNIVERSAL_HUMAN_ROUTINES = [
  {
    codigo: 'RESTROOM_BREAK',
    texto: '🚻 Yendo al baño (1 a 5 veces al día)',
    waypoint: 'bano_empleado',
    duracion: 75,
    animacion: 'WAIT_COOKING',
    tipo: 'fisiologica'
  },
  {
    codigo: 'WHATSAPP_FAMILY',
    texto: '📱 Comunicándose con su familia por WhatsApp / llamada',
    waypoint: 'barra_vendedor',
    duracion: 55,
    animacion: 'PHONE_CALL',
    tipo: 'ocio_humano'
  },
  {
    codigo: 'YOUTUBE_SOCIAL_BREAK',
    texto: '📺 Sentado viendo YouTube / redes sociales (sin clientes)',
    waypoint: 'espera_1',
    duracion: 70,
    animacion: 'WATCH_YOUTUBE',
    tipo: 'ocio_humano'
  }
];

export const IMPERIA_SPECIAL_ROUTINES = {
  apertura: [
    { codigo: 'OPEN_STORE', texto: '🔓 Abriendo tienda Imperia Uniformes', waypoint: 'puerta_entrada', duracion: 10, animacion: 'OPERATE_TPV' },
    { codigo: 'SETUP_MANNEQUINS', texto: '🧍 Sacando maniquíes de exhibición a la entrada', waypoint: 'area_maniquies_entrada', duracion: 18, animacion: 'CARRY_PLATE' },
    { codigo: 'COUNT_OPENING_CASH', texto: '💵 Abriendo caja y revisando efectivo inicial', waypoint: 'caja_tpv_vendedor', duracion: 20, animacion: 'OPERATE_TPV' },
    { codigo: 'CHECK_DAILY_ORDERS', texto: '📋 Revisando pedidos pendientes del día', waypoint: 'caja_tpv_vendedor', duracion: 16, animacion: 'OPERATE_TPV' },
    { codigo: 'TIDY_RACKS', texto: '👕 Acomodando prendas fuera de su lugar en estantes', waypoint: 'rack_medicina', duracion: 24, animacion: 'CARRY_PLATE' }
  ],
  administrativas: [
    {
      codigo: 'APP_COTIZACIONES',
      texto: '💻 Elaborando cotización en App (buscando precios en Cotexa/Euro/Jasbec y enviando a Gerente)',
      waypoint: 'caja_tpv_vendedor',
      duracion: 85,
      animacion: 'OPERATE_TPV',
      requiereAprobacionGerente: true
    },
    {
      codigo: 'CHECK_SOCIAL_IG_FB',
      texto: '📲 Contestando comentarios y preguntas en Facebook e Instagram',
      waypoint: 'barra_vendedor',
      duracion: 55,
      animacion: 'PHONE_CALL'
    },
    {
      codigo: 'WHATSAPP_CLIENT_STOCK',
      texto: '💬 Atendiendo WhatsApp de clientes (estado de pedido y existencia en rack)',
      waypoint: 'rack_proveedores',
      duracion: 65,
      animacion: 'PHONE_CALL'
    }
  ],
  limpieza: [
    { codigo: 'SWEEP_STORE', texto: '🧹 Barriendo el local', waypoint: 'barra_cliente', duracion: 45, animacion: 'SWEEP_MOP' },
    { codigo: 'MOP_STORE', texto: '🪣 Trapeando el local (1 vez cada 3 días)', waypoint: 'barra_cliente', duracion: 75, animacion: 'SWEEP_MOP', cadaNTresDias: true }
  ],
  cierre: [
    { codigo: 'CASH_CUT_CLOSING', texto: '🧾 Realizando corte de caja y cuadrando efectivo', waypoint: 'caja_tpv_vendedor', duracion: 40, animacion: 'OPERATE_TPV' },
    { codigo: 'MONTHLY_MANAGER_INVENTORY', texto: '📦 Inventario completo mensual en presencia del Gerente', waypoint: 'rack_gastronomia', duracion: 90, animacion: 'CARRY_PLATE' }
  ]
};

/**
 * Calcula tiempo estimado de disponibilidad en proveedor externo según las reglas reales del negocio:
 * - DTF (Combi Gráfica / Promox): 10:00 AM–4:00 PM sale el mismo día (+2h sim); después de 4:00 PM sale al día siguiente desde 12:00 PM.
 * - Sublimación > Carta (Imagen Impresa): 1 a 2 días (hasta 5 días en temporada alta) + 10 min de traslado a recoger.
 * - Promocionales en Doble V (2 cuadras) o Selene (centro): inmediato si hay stock, o 3 a 5 días si se pide por internet.
 * - Vinil Textil en Euro: compra directa y regreso al taller.
 */
export function calcularETAInsumoExterno(tipoProveedor, simDate, temporadaAlta = false) {
  const curMs = simDate.getTime();
  const h = simDate.getHours() + simDate.getMinutes() / 60;

  if (tipoProveedor === 'DTF_COMBI_PROMOX') {
    if (h >= 10 && h < 16) {
      return {
        proveedor: Math.random() < 0.5 ? 'Combi Gráfica' : 'Promox',
        etaMs: curMs + 2 * 3600 * 1000,
        regla: 'Enviado entre 10:00 AM y 4:00 PM -> sale hoy mismo'
      };
    }
    // Después de las 4:00 PM -> día siguiente desde las 12:00 PM
    const nextDay = new Date(simDate);
    nextDay.setDate(nextDay.getDate() + (h >= 16 ? 1 : 0));
    nextDay.setHours(12, 0, 0, 0);
    return {
      proveedor: Math.random() < 0.5 ? 'Combi Gráfica' : 'Promox',
      etaMs: nextDay.getTime(),
      regla: 'Enviado fuera de corte (después de 4:00 PM) -> listo mañana desde las 12:00 PM'
    };
  }

  if (tipoProveedor === 'SUBLIMACION_IMAGEN_IMPRESA') {
    const dias = temporadaAlta ? (2 + Math.floor(Math.random() * 4)) : (1 + Math.round(Math.random()));
    return {
      proveedor: 'Imagen Impresa (a 10 min)',
      etaMs: curMs + dias * 24 * 3600 * 1000 + 600 * 1000,
      regla: `Impresión mayor a carta (${dias} días${temporadaAlta ? ' temp. alta' : ''}) + 10 min de recolección`
    };
  }

  if (tipoProveedor === 'PROMO_INTERNET_O_SIN_STOCK') {
    const dias = 3 + Math.floor(Math.random() * 3); // 3 a 5 días
    return {
      proveedor: 'Proveedor Online (sin stock local)',
      etaMs: curMs + dias * 24 * 3600 * 1000,
      regla: `Pedido por internet sin stock en Doble V/Selene -> llegada en ${dias} días a tienda`
    };
  }

  // Compra física rápida: Doble V (2 cuadras ~15m), Selene (centro ~35m) o Euro (~20m)
  const minsMap = {
    DOBLE_V: { nombre: 'Doble V (2 cuadras)', mins: 15 },
    SELENE_CENTRO: { nombre: 'Selene (Centro)', mins: 35 },
    EURO_VINIL: { nombre: 'Euro (Vinil Textil)', mins: 20 }
  };
  const info = minsMap[tipoProveedor] || minsMap.DOBLE_V;
  return {
    proveedor: info.nombre,
    etaMs: curMs + info.mins * 60 * 1000,
    regla: `Compra presencial en ${info.nombre} (${info.mins} min)`
  };
}
