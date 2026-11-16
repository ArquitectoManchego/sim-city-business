/**
 * Motor Probabilístico de Generación de Clientes y Demanda Comercial.
 * Modula la llegada de clientes en función de: Fecha del Año, Hora del Día, Tipo de Cliente,
 * Días de Quincena, Fechas Especiales (CATALOGO_EVENTOS_MEXICO) y Campañas Publicitarias.
 */

import { MESES_INFO, CATALOGO_EVENTOS_MEXICO } from '../shared/motorTemporadasYEventos.js';
import { PRODUCTOS_OPERATIVOS_EXTENDIDOS } from '../shared/catalogoProductosInsumos.js';

export const ARQUETIPOS_CLIENTE = [
  {
    id: 'estudiante_univ',
    nombre: 'Estudiante Universitario',
    colorCamisa: '#38bdf8',
    presupuestoMax: 150,
    negociosFrecuentes: ['hawaiian_paradise', 'papeleria_imperiarte', 'taller_publi_imperia'],
    preferenciaPostCompra: { sentado: 0.45, de_pie: 0.30, salir: 0.25 }
  },
  {
    id: 'doctor_medico',
    nombre: 'Médico / Especialista Clínico',
    colorCamisa: '#ffffff',
    presupuestoMax: 3500,
    negociosFrecuentes: ['imperia_uniformes', 'hawaiian_paradise', 'bordados_veracruz'],
    preferenciaPostCompra: { sentado: 0.20, de_pie: 0.20, salir: 0.60 }
  },
  {
    id: 'enfermera_clinica',
    nombre: 'Enfermera / Enfermero Clínico',
    colorCamisa: '#14b8a6',
    presupuestoMax: 2200,
    negociosFrecuentes: ['imperia_uniformes', 'hawaiian_paradise', 'bordados_veracruz'],
    preferenciaPostCompra: { sentado: 0.25, de_pie: 0.25, salir: 0.50 }
  },
  {
    id: 'estudiante_medicina',
    nombre: 'Estudiante de Medicina (Facultad UV)',
    colorCamisa: '#ffffff',
    presupuestoMax: 1600,
    negociosFrecuentes: ['imperia_uniformes', 'papeleria_imperiarte', 'hawaiian_paradise'],
    preferenciaPostCompra: { sentado: 0.35, de_pie: 0.30, salir: 0.35 }
  },
  {
    id: 'estudiante_enfermeria',
    nombre: 'Estudiante de Enfermería (Facultad UV)',
    colorCamisa: '#ffffff',
    presupuestoMax: 1300,
    negociosFrecuentes: ['imperia_uniformes', 'papeleria_imperiarte', 'hawaiian_paradise'],
    preferenciaPostCompra: { sentado: 0.35, de_pie: 0.30, salir: 0.35 }
  },
  {
    id: 'chef_restaurantero',
    nombre: 'Chef / Gastrónomo',
    colorCamisa: '#f59e0b',
    presupuestoMax: 2800,
    negociosFrecuentes: ['imperia_uniformes', 'taller_costura', 'bordados_veracruz'],
    preferenciaPostCompra: { sentado: 0.25, de_pie: 0.25, salir: 0.50 }
  },
  {
    id: 'cliente_corporativo',
    nombre: 'Cliente Empresarial / Escolar',
    colorCamisa: '#6366f1',
    presupuestoMax: 5000,
    negociosFrecuentes: ['imperia_uniformes', 'taller_publi_imperia', 'bordados_veracruz', 'taller_costura'],
    preferenciaPostCompra: { sentado: 0.15, de_pie: 0.15, salir: 0.70 }
  },
  {
    id: 'paseante_familia',
    nombre: 'Cliente Local / Paseo',
    colorCamisa: '#ec4899',
    presupuestoMax: 350,
    negociosFrecuentes: ['hawaiian_paradise', 'papeleria_imperiarte', 'taller_publi_imperia'],
    preferenciaPostCompra: { sentado: 0.50, de_pie: 0.25, salir: 0.25 }
  }
];

const NOMBRES_CLIENTES = [
  'Dr. Alejandro P.', 'Dra. Elena V.', 'Enf. Mariana C.', 'Enf. Carlos R.',
  'Méd. Interno Daniel S.', 'Est. Valeria G.', 'Dr. Ricardo M.', 'Dra. Sofía M.',
  'Enf. Lucía F.', 'Chef Marco A.', 'Ing. Roberto T.', 'Fernanda L.', 'Luis E.',
  'Camila H.', 'Mónica B.', 'Jorge N.'
];

/**
 * Evalúa todos los multiplicadores ambientales y comerciales para la fecha y hora simuladas
 */
export function evaluarCondicionesDemanda(simDate, campanasActivas = {}, escenarioGlobal = 'medio') {
  const mesNum = simDate.getMonth() + 1; // 1..12
  const diaMes = simDate.getDate(); // 1..31
  const diaSemana = simDate.getDay(); // 0=Dom..6=Sáb
  const hora = simDate.getHours() + simDate.getMinutes() / 60;

  const infoMes = MESES_INFO.find(m => m.id === mesNum) || MESES_INFO[4];

  // 1. Días de Quincena (14, 15, 16 y 28, 29, 30, 31, 1)
  const esQuincena = (diaMes >= 14 && diaMes <= 16) || diaMes >= 28 || diaMes === 1;
  const factorQuincena = esQuincena ? 1.38 : 1.0;

  // 2. Fechas Especiales / Eventos del Mes
  const eventosDelMes = CATALOGO_EVENTOS_MEXICO.filter(ev => ev.mesEvento === mesNum);
  const eventoPrincipal = eventosDelMes[0] || null;

  // 3. Multiplicador por Escenario Base
  const multEscenario = {
    bajo: 0.55,
    tablas: 0.80,
    medio: 1.05,
    alto: 1.45,
    muy_alto: 1.85
  }[escenarioGlobal] || 1.0;

  // 4. Horario comercial (08:00 a 20:30)
  const enHorarioOperativo = hora >= 8.0 && hora <= 20.5;

  return {
    mesNum,
    nombreMes: infoMes.nombre,
    estacion: infoMes.estacion,
    descripcionClima: infoMes.descripcionClima,
    factorClimaUso: infoMes.factorClimaUso,
    vacacionesUniversitarias: infoMes.vacacionesUniversitarias,
    diaMes,
    diaSemana,
    hora,
    esQuincena,
    factorQuincena,
    eventoPrincipal,
    eventosDelMes,
    multEscenario,
    enHorarioOperativo
  };
}

/**
 * Calcula la tasa de llegada de clientes por hora (lambda) para un negocio específico
 */
export function calcularTasaClientesPorHora(negocioId, condiciones, campanasActivas = {}) {
  if (!condiciones.enHorarioOperativo) return 0;

  const { hora, factorQuincena, factorClimaUso, vacacionesUniversitarias, eventosDelMes, multEscenario } = condiciones;

  // Base por negocio (clientes por hora en escenario medio)
  const basePorNegocio = {
    hawaiian_paradise: 6.5,
    imperia_uniformes: 3.2,
    papeleria_imperiarte: 5.5,
    bordados_veracruz: 2.2,
    taller_costura: 2.0,
    taller_publi_imperia: 3.0
  };

  let lambda = basePorNegocio[negocioId] || 3.0;

  // Curva horaria según giro del negocio
  if (negocioId === 'hawaiian_paradise') {
    if (hora < 9.5) lambda *= 0.35; // Pre-apertura / desayuno ligero
    else if (hora >= 13.0 && hora <= 16.0) lambda *= 1.45; // Calor de mediodía (pico raspados y smoothies)
    else if (hora >= 17.0 && hora <= 20.2) lambda *= 1.65; // Tarde/noche (pico crepas, marquesitas y café)
    // El calor intenso impulsa las ventas de Hawaiian
    lambda *= (0.75 + factorClimaUso * 0.55);
  } else if (negocioId === 'papeleria_imperiarte') {
    if (hora >= 8.0 && hora <= 12.0) lambda *= 1.55; // Mañana universitaria
    else if (hora >= 18.5) lambda *= 0.45;
    if (vacacionesUniversitarias) lambda *= 0.60;
  } else if (negocioId === 'imperia_uniformes') {
    if (hora >= 10.5 && hora <= 14.0) lambda *= 1.35;
    else if (hora >= 16.0 && hora <= 19.0) lambda *= 1.40;
    else lambda *= 0.65;
  }

  // Efecto Quincena
  lambda *= factorQuincena;

  // Efecto Eventos Especiales del Mes
  let boostEvento = 1.0;
  eventosDelMes.forEach(ev => {
    if (ev.negociosBeneficiados.includes(negocioId)) {
      boostEvento += (ev.aumentoDemandaBasePct || 25) / 200;
    }
  });
  lambda *= boostEvento;

  // Efecto Campañas Publicitarias Activas del Jugador
  const campanaNegocio = campanasActivas[negocioId];
  if (campanaNegocio && campanaNegocio.activa) {
    const multCampana = 1 + (campanaNegocio.intensidadPct || 35) / 100;
    lambda *= multCampana;
  }

  return lambda * multEscenario;
}

/**
 * Selecciona el producto que pedirá un nuevo cliente en un negocio, ponderado por clima, hora y mix
 */
export function seleccionarProductoParaCliente(negocioId, condiciones, productoForzadoId = null) {
  const listaProductos = PRODUCTOS_OPERATIVOS_EXTENDIDOS[negocioId] || PRODUCTOS_OPERATIVOS_EXTENDIDOS.hawaiian_paradise;
  if (productoForzadoId) {
    const encontrado = listaProductos.find(p => p.id === productoForzadoId);
    if (encontrado) return encontrado;
  }

  // Ajustar pesos dinámicamente (ej. en Hawaiian Paradise con calor se piden muchos más Raspados de Limón y Smoothies)
  const pesos = listaProductos.map(prod => {
    let w = prod.pesoEnMix || 15;
    if (negocioId === 'hawaiian_paradise') {
      if (prod.id === 'hp_raspado' && condiciones.factorClimaUso >= 0.70) {
        w *= 2.1; // Impulso al Raspado de Limón en calor
      }
      if (prod.id === 'hp_crepa' && condiciones.hora >= 16.5) {
        w *= 1.5; // Tarde de crepas
      }
    }
    return { prod, w };
  });

  const sumaPesos = pesos.reduce((acc, item) => acc + item.w, 0);
  let r = Math.random() * sumaPesos;
  for (let i = 0; i < pesos.length; i++) {
    r -= pesos[i].w;
    if (r <= 0) return pesos[i].prod;
  }
  return listaProductos[0];
}

/**
 * Crea la entidad completa de un Cliente 3D listo para entrar al local comercial
 */
export function crearEntidadCliente(negocioId, condiciones, productoForzadoId = null) {
  const arquetiposValidos = ARQUETIPOS_CLIENTE.filter(a => a.negociosFrecuentes.includes(negocioId));
  const arquetipo = arquetiposValidos.length > 0
    ? arquetiposValidos[Math.floor(Math.random() * arquetiposValidos.length)]
    : ARQUETIPOS_CLIENTE[0];

  const producto = seleccionarProductoParaCliente(negocioId, condiciones, productoForzadoId);
  const nombre = NOMBRES_CLIENTES[Math.floor(Math.random() * NOMBRES_CLIENTES.length)];

  // Decisión post-compra pre-calculada según preferencias del arquetipo
  const randPost = Math.random();
  let decisionPostCompra = 'salir';
  if (negocioId === 'hawaiian_paradise') {
    if (randPost < 0.38) decisionPostCompra = 'sentado_mesa';
    else if (randPost < 0.68) decisionPostCompra = 'de_pie';
    else decisionPostCompra = 'salir';
  }

  // En Imperia Uniformes, probabilidad de compra tras probarse la prenda (82% compra, 18% solo se prueba y no compra)
  const compraraTrasPrueba = negocioId === 'imperia_uniformes' ? (Math.random() < 0.84) : true;

  // Necesidades fisiológicas y de higiene de clientes al llegar al establecimiento
  // Tipos con diferente duración: Lavarse las manos (~10s), Del 1 (~20s), Del 2 (~45s)
  const randBano = Math.random();
  const tieneNecesidadBano = randBano < 0.22; // ~22% de probabilidad al visitar
  let necesidadBano = null;
  let tiempoBanoRestanteSeg = 0;
  if (tieneNecesidadBano) {
    const randTipo = Math.random();
    if (randTipo < 0.48) {
      necesidadBano = 'manos';
      tiempoBanoRestanteSeg = 10;
    } else if (randTipo < 0.82) {
      necesidadBano = 'del_1';
      tiempoBanoRestanteSeg = 20;
    } else {
      necesidadBano = 'del_2';
      tiempoBanoRestanteSeg = 45;
    }
  }

  return {
    id: `cli_${negocioId}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    negocioId,
    nombre,
    arquetipoId: arquetipo.id,
    arquetipoNombre: arquetipo.nombre,
    colorCamisa: arquetipo.colorCamisa,
    productoDeseado: producto,
    saborElegido: producto.saborDefault || 'Limón',
    decisionPostCompra,
    compraraTrasPrueba,
    tiempoConsumoPostSeg: decisionPostCompra === 'sentado_mesa' ? 28 : (decisionPostCompra === 'de_pie' ? 16 : 2),
    estado: 'ENTRANDO_A_BARRA',
    posicionLocal: [0, 0, 5.2],
    targetWaypoint: 'barra_cliente',
    rutaActual: [],
    globoTexto: null,
    tieneProductoEnMano: false,
    // Estado y necesidades de baño
    solicitoBano: tieneNecesidadBano,
    necesidadBano,
    tiempoBanoRestanteSeg,
    banoCompletado: !tieneNecesidadBano,
    isInsideRestroom: false,
    isWaitingRestroom: false
  };
}
