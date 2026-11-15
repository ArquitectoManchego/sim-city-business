/**
 * Catálogo Extendido de Productos, Clasificación Operativa (Preparado, Reventa, Manufactura),
 * Materia Prima (BOM - Bill of Materials), Costos de Insumos y Stock Inicial por Negocio.
 * Conectado 1:1 con CATALOGO_PRECIOS_COSTOS y PROCESOS_POR_NEGOCIO de Eléctrico Alacio.
 */

import { CATALOGO_PRECIOS_COSTOS } from './preciosYCostosProductos.js';
import { PROCESOS_POR_NEGOCIO } from './procesosNegocios.js';
import { NEGOCIOS_CONFIG } from './equiposNegocios.js';

export { CATALOGO_PRECIOS_COSTOS, PROCESOS_POR_NEGOCIO, NEGOCIOS_CONFIG };

// ============================================================================
// 1. INVENTARIO DE MATERIA PRIMA E INSUMOS POR UNIDAD DE NEGOCIO
// ============================================================================
export const MATERIAS_PRIMAS_POR_NEGOCIO = {
  hawaiian_paradise: [
    {
      id: 'mat_hielo_bloque',
      nombre: 'Bloque de Hielo Purificado',
      unidad: 'kg',
      costoUnitario: 8.00,
      stockActual: 45.0,
      stockMaximo: 60.0,
      puntoReorden: 10.0,
      loteRecompra: 40.0,
      estacionKey: 'raw_congelador_hielo',
      colorHex: '#bae6fd',
      forma3D: 'ice_block'
    },
    {
      id: 'mat_jarabe_limon',
      nombre: 'Jarabe Natural de Limón y Frutas',
      unidad: 'L',
      costoUnitario: 65.00,
      stockActual: 14.0,
      stockMaximo: 20.0,
      puntoReorden: 3.0,
      loteRecompra: 12.0,
      estacionKey: 'raw_estacion_jarabes',
      colorHex: '#84cc16',
      forma3D: 'syrup_bottle'
    },
    {
      id: 'mat_vaso_12oz',
      nombre: 'Vasos Transparentes 12oz / Domo',
      unidad: 'pza',
      costoUnitario: 1.80,
      stockActual: 240,
      stockMaximo: 400,
      puntoReorden: 50,
      loteRecompra: 250,
      estacionKey: 'raw_dispensador_vasos',
      colorHex: '#e2e8f0',
      forma3D: 'cup_stack'
    },
    {
      id: 'mat_popote_cuchara',
      nombre: 'Popotes y Cucharas Biodegradables',
      unidad: 'pza',
      costoUnitario: 0.45,
      stockActual: 380,
      stockMaximo: 500,
      puntoReorden: 80,
      loteRecompra: 300,
      estacionKey: 'raw_estacion_jarabes',
      colorHex: '#f43f5e',
      forma3D: 'straw_holder'
    },
    {
      id: 'mat_masa_crepa',
      nombre: 'Masa Artesanal Crepa / Marquesita',
      unidad: 'porción',
      costoUnitario: 7.50,
      stockActual: 85,
      stockMaximo: 120,
      puntoReorden: 20,
      loteRecompra: 80,
      estacionKey: 'raw_refrigerador_insumos',
      colorHex: '#fef08a',
      forma3D: 'batter_bowl'
    },
    {
      id: 'mat_relleno_gourmet',
      nombre: 'Rellenos (Nutella, Queso Crema, Queso de Bola)',
      unidad: 'porción',
      costoUnitario: 12.50,
      stockActual: 90,
      stockMaximo: 120,
      puntoReorden: 20,
      loteRecompra: 80,
      estacionKey: 'raw_barra_toppings',
      colorHex: '#78350f',
      forma3D: 'jar_group'
    },
    {
      id: 'mat_pulpa_fruta',
      nombre: 'Pulpa de Fruta Congelada y Base Frappé',
      unidad: 'porción',
      costoUnitario: 13.00,
      stockActual: 70,
      stockMaximo: 100,
      puntoReorden: 15,
      loteRecompra: 60,
      estacionKey: 'raw_congelador_hielo',
      colorHex: '#fb7185',
      forma3D: 'fruit_pack'
    },
    {
      id: 'mat_cafe_grano',
      nombre: 'Café de Especialidad en Grano (Altura)',
      unidad: 'kg',
      costoUnitario: 320.00,
      stockActual: 6.5,
      stockMaximo: 10.0,
      puntoReorden: 1.5,
      loteRecompra: 5.0,
      estacionKey: 'raw_tolva_cafe',
      colorHex: '#451a03',
      forma3D: 'coffee_bag'
    },
    {
      id: 'mat_leche_barista',
      nombre: 'Leche Entera / Deslactosada Barista',
      unidad: 'L',
      costoUnitario: 28.00,
      stockActual: 24.0,
      stockMaximo: 36.0,
      puntoReorden: 6.0,
      loteRecompra: 24.0,
      estacionKey: 'raw_refrigerador_insumos',
      colorHex: '#f8fafc',
      forma3D: 'milk_carton'
    },
    {
      id: 'mat_elote_esquite',
      nombre: 'Elote Tierno Desgranado y Aderezos',
      unidad: 'porción',
      costoUnitario: 10.50,
      stockActual: 60,
      stockMaximo: 90,
      puntoReorden: 15,
      loteRecompra: 50,
      estacionKey: 'raw_bano_maria_insumos',
      colorHex: '#facc15',
      forma3D: 'corn_pot'
    },
    {
      id: 'mat_vaso_ramen',
      nombre: 'Vaso Sopa Instantánea Ramen + Condimento',
      unidad: 'pza',
      costoUnitario: 15.00,
      stockActual: 48,
      stockMaximo: 72,
      puntoReorden: 12,
      loteRecompra: 48,
      estacionKey: 'raw_anaquel_ramen',
      colorHex: '#ef4444',
      forma3D: 'ramen_cup'
    }
  ],

  imperia_uniformes: [
    {
      id: 'mat_stock_clinico_taller',
      nombre: 'Uniformes Clínicos / Filipinas (Stock Taller Imperia)',
      unidad: 'prenda',
      costoUnitario: 260.00,
      stockActual: 65,
      stockMaximo: 120,
      puntoReorden: 15,
      loteRecompra: 40,
      estacionKey: 'raw_rack_clinico',
      colorHex: '#0ea5e9',
      forma3D: 'garment_rack'
    },
    {
      id: 'mat_stock_permachef',
      nombre: 'Filipinas y Mandiles PermaChef (Compra Reventa)',
      unidad: 'prenda',
      costoUnitario: 560.00,
      stockActual: 35,
      stockMaximo: 60,
      puntoReorden: 8,
      loteRecompra: 25,
      estacionKey: 'raw_rack_gourmet',
      colorHex: '#10b981',
      forma3D: 'garment_rack'
    },
    {
      id: 'mat_stock_clinik',
      nombre: 'Juegos Quirúrgicos Clinik Premium (Compra Reventa)',
      unidad: 'juego',
      costoUnitario: 950.00,
      stockActual: 25,
      stockMaximo: 50,
      puntoReorden: 6,
      loteRecompra: 20,
      estacionKey: 'raw_rack_premium',
      colorHex: '#6366f1',
      forma3D: 'garment_rack'
    },
    {
      id: 'mat_bolsa_empaque_imp',
      nombre: 'Bolsas Boutique y Ganchos Imperia',
      unidad: 'pza',
      costoUnitario: 4.50,
      stockActual: 200,
      stockMaximo: 300,
      puntoReorden: 40,
      loteRecompra: 150,
      estacionKey: 'raw_mostrador_empaque',
      colorHex: '#34d399',
      forma3D: 'bag_stack'
    }
  ],

  papeleria_imperiarte: [
    {
      id: 'mat_papel_bond_carta',
      nombre: 'Hojas Papel Bond Blancura 95% (Carta/Oficio)',
      unidad: 'hoja',
      costoUnitario: 0.25,
      stockActual: 3500,
      stockMaximo: 5000,
      puntoReorden: 500,
      loteRecompra: 2500,
      estacionKey: 'raw_estante_papel',
      colorHex: '#f8fafc',
      forma3D: 'paper_ream'
    },
    {
      id: 'mat_toner_cmyk',
      nombre: 'Tóner Láser CMYK Xerox DocuColor',
      unidad: 'carga',
      costoUnitario: 1.80,
      stockActual: 800,
      stockMaximo: 1200,
      puntoReorden: 150,
      loteRecompra: 600,
      estacionKey: 'raw_estante_toner',
      colorHex: '#38bdf8',
      forma3D: 'toner_box'
    },
    {
      id: 'mat_pliego_bateria_marquilla',
      nombre: 'Pliegos Cartón Batería / Marquilla / Foamboard (Reventa)',
      unidad: 'pliego',
      costoUnitario: 24.00,
      stockActual: 140,
      stockMaximo: 250,
      puntoReorden: 30,
      loteRecompra: 100,
      estacionKey: 'raw_rack_pliegos',
      colorHex: '#cbd5e1',
      forma3D: 'board_rack'
    }
  ],

  bordados_veracruz: [
    {
      id: 'mat_hilo_bordado',
      nombre: 'Conos de Hilo Poliéster Bordado Industrial',
      unidad: 'prenda_eq',
      costoUnitario: 5.00,
      stockActual: 300,
      stockMaximo: 500,
      puntoReorden: 60,
      loteRecompra: 250,
      estacionKey: 'raw_estante_hilos',
      colorHex: '#f43f5e',
      forma3D: 'thread_cones'
    },
    {
      id: 'mat_pelon_estabilizador',
      nombre: 'Pelón Estabilizador y Entretela Bordado',
      unidad: 'tramo',
      costoUnitario: 3.00,
      stockActual: 320,
      stockMaximo: 500,
      puntoReorden: 60,
      loteRecompra: 250,
      estacionKey: 'raw_mesa_bastidores',
      colorHex: '#e2e8f0',
      forma3D: 'fabric_roll'
    }
  ],

  taller_costura: [
    {
      id: 'mat_rollo_gabardina_antifluidos',
      nombre: 'Tela Gabardina / Antifluidos Stretch (Metros)',
      unidad: 'm',
      costoUnitario: 85.00,
      stockActual: 180,
      stockMaximo: 300,
      puntoReorden: 40,
      loteRecompra: 150,
      estacionKey: 'raw_mesa_corte_telas',
      colorHex: '#3b82f6',
      forma3D: 'fabric_roll'
    },
    {
      id: 'mat_avios_costura',
      nombre: 'Hilos, Botones, Cierres y Elásticos Industriales',
      unidad: 'kit_prenda',
      costoUnitario: 18.00,
      stockActual: 200,
      stockMaximo: 350,
      puntoReorden: 40,
      loteRecompra: 150,
      estacionKey: 'raw_estante_avios',
      colorHex: '#a855f7',
      forma3D: 'box_stack'
    }
  ],

  taller_publi_imperia: [
    {
      id: 'mat_taza_blanca_11oz',
      nombre: 'Taza Blanca Sublimación 11oz AAA',
      unidad: 'pza',
      costoUnitario: 26.00,
      stockActual: 120,
      stockMaximo: 240,
      puntoReorden: 30,
      loteRecompra: 108,
      estacionKey: 'raw_estante_blanks',
      colorHex: '#ffffff',
      forma3D: 'mug_box'
    },
    {
      id: 'mat_playera_gorra_blank',
      nombre: 'Playeras y Gorras Lisas para Estampado',
      unidad: 'pza',
      costoUnitario: 55.00,
      stockActual: 110,
      stockMaximo: 200,
      puntoReorden: 25,
      loteRecompra: 80,
      estacionKey: 'raw_estante_blanks',
      colorHex: '#fb923c',
      forma3D: 'garment_stack'
    },
    {
      id: 'mat_transfer_dtf_vinil',
      nombre: 'Hoja Sublimación / Film DTF / Pliego Vinil Textil',
      unidad: 'hoja',
      costoUnitario: 15.00,
      stockActual: 250,
      stockMaximo: 400,
      puntoReorden: 50,
      loteRecompra: 200,
      estacionKey: 'raw_mesa_impresion',
      colorHex: '#ec4899',
      forma3D: 'paper_ream'
    },
    {
      id: 'mat_termo_acrilico_laser',
      nombre: 'Termo Acero Inox / Placa Acrílico o MDF Láser',
      unidad: 'pza',
      costoUnitario: 85.00,
      stockActual: 50,
      stockMaximo: 100,
      puntoReorden: 10,
      loteRecompra: 40,
      estacionKey: 'raw_estante_blanks',
      colorHex: '#14b8a6',
      forma3D: 'thermos_box'
    }
  ]
};

// ============================================================================
// 2. MAPEO DE PRODUCTOS CON SU TIPO OPERATIVO, PROCESO Y RECETA DE INSUMOS (BOM)
// ============================================================================
export const PRODUCTOS_OPERATIVOS_EXTENDIDOS = {
  hawaiian_paradise: [
    {
      id: 'hp_raspado',
      procesoId: 'hp_raspado',
      nombre: 'Raspado de Limón Clásico Hawaiian',
      saboresDisponibles: ['Limón', 'Tamarindo', 'Fresa', 'Mango', 'Piña Colada'],
      saborDefault: 'Limón',
      tipoOperacion: 'PREPARADO_AL_MOMENTO',
      precioVenta: 45.00,
      costoMateriales: 9.00,
      pesoEnMix: 22,
      equiposInvolucrados: ['hp_tpv', 'hp_raspadora'],
      bom: [
        { insumoId: 'mat_hielo_bloque', cantidad: 0.25 },
        { insumoId: 'mat_jarabe_limon', cantidad: 0.06 },
        { insumoId: 'mat_vaso_12oz', cantidad: 1 },
        { insumoId: 'mat_popote_cuchara', cantidad: 1 }
      ]
    },
    {
      id: 'hp_crepa',
      procesoId: 'hp_crepa',
      nombre: 'Crepa Dulce o Salada Recién Hecha',
      tipoOperacion: 'PREPARADO_AL_MOMENTO',
      precioVenta: 75.00,
      costoMateriales: 22.00,
      pesoEnMix: 22,
      equiposInvolucrados: ['hp_tpv', 'hp_crepera'],
      bom: [
        { insumoId: 'mat_masa_crepa', cantidad: 1 },
        { insumoId: 'mat_relleno_gourmet', cantidad: 1 }
      ]
    },
    {
      id: 'hp_marquesita',
      procesoId: 'hp_marquesita',
      nombre: 'Marquesita Tradicional Queso de Bola',
      tipoOperacion: 'PREPARADO_AL_MOMENTO',
      precioVenta: 65.00,
      costoMateriales: 18.00,
      pesoEnMix: 18,
      equiposInvolucrados: ['hp_tpv', 'hp_marquesitera'],
      bom: [
        { insumoId: 'mat_masa_crepa', cantidad: 1 },
        { insumoId: 'mat_relleno_gourmet', cantidad: 0.8 }
      ]
    },
    {
      id: 'hp_smoothie',
      procesoId: 'hp_smoothie',
      nombre: 'Smoothie Frutal / Frappé Ninja',
      tipoOperacion: 'PREPARADO_AL_MOMENTO',
      precioVenta: 60.00,
      costoMateriales: 16.00,
      pesoEnMix: 14,
      equiposInvolucrados: ['hp_tpv', 'hp_licuadora'],
      bom: [
        { insumoId: 'mat_pulpa_fruta', cantidad: 1 },
        { insumoId: 'mat_hielo_bloque', cantidad: 0.20 },
        { insumoId: 'mat_vaso_12oz', cantidad: 1 },
        { insumoId: 'mat_popote_cuchara', cantidad: 1 }
      ]
    },
    {
      id: 'hp_espresso_americano',
      procesoId: 'hp_espresso_americano',
      nombre: 'Café Espresso / Americano Barista',
      tipoOperacion: 'PREPARADO_AL_MOMENTO',
      precioVenta: 40.00,
      costoMateriales: 7.00,
      pesoEnMix: 8,
      equiposInvolucrados: ['hp_tpv', 'hp_breville'],
      bom: [
        { insumoId: 'mat_cafe_grano', cantidad: 0.018 },
        { insumoId: 'mat_vaso_12oz', cantidad: 1 }
      ]
    },
    {
      id: 'hp_cappuccino_latte',
      procesoId: 'hp_latte',
      nombre: 'Cappuccino / Latte Espumado al Vapor',
      tipoOperacion: 'PREPARADO_AL_MOMENTO',
      precioVenta: 55.00,
      costoMateriales: 14.00,
      pesoEnMix: 10,
      equiposInvolucrados: ['hp_tpv', 'hp_breville'],
      bom: [
        { insumoId: 'mat_cafe_grano', cantidad: 0.018 },
        { insumoId: 'mat_leche_barista', cantidad: 0.22 },
        { insumoId: 'mat_vaso_12oz', cantidad: 1 }
      ]
    },
    {
      id: 'hp_bano_maria_esquites',
      procesoId: 'hp_bano_maria_servicio',
      nombre: 'Esquites Calientes en Baño María',
      tipoOperacion: 'PREPARADO_AL_MOMENTO',
      precioVenta: 45.00,
      costoMateriales: 12.00,
      pesoEnMix: 4,
      equiposInvolucrados: ['hp_tpv', 'hp_bano_maria'],
      bom: [
        { insumoId: 'mat_elote_esquite', cantidad: 1 },
        { insumoId: 'mat_vaso_12oz', cantidad: 1 },
        { insumoId: 'mat_popote_cuchara', cantidad: 1 }
      ]
    },
    {
      id: 'hp_ramen_tetera',
      procesoId: 'hp_ramen_tetera',
      nombre: 'Sopa Instantánea Ramen Caliente',
      tipoOperacion: 'PREPARADO_AL_MOMENTO',
      precioVenta: 45.00,
      costoMateriales: 15.00,
      pesoEnMix: 2,
      equiposInvolucrados: ['hp_tpv', 'hp_tetera'],
      bom: [
        { insumoId: 'mat_vaso_ramen', cantidad: 1 },
        { insumoId: 'mat_popote_cuchara', cantidad: 1 }
      ]
    }
  ],

  imperia_uniformes: [
    {
      id: 'imp_uniforme_clinico_completo',
      procesoId: 'imp_uniforme_clinico_completo',
      nombre: 'Uniforme Clínico Medicina (Estante Medicina + Probador)',
      tipoOperacion: 'COMPRA_Y_REVENTA',
      requiereProbador: true,
      precioVenta: 650.00,
      costoMateriales: 420.00,
      pesoEnMix: 20,
      equiposInvolucrados: ['imp_tpv', 'imp_terminal'],
      bom: [
        { insumoId: 'mat_stock_clinico_taller', cantidad: 1 },
        { insumoId: 'mat_bolsa_empaque_imp', cantidad: 1 }
      ]
    },
    {
      id: 'imp_chef_gastronomia',
      procesoId: 'imp_chef_gastronomia',
      nombre: 'Filipina / Mandil Gastronomía + Bordado (Estante Gastronomía)',
      tipoOperacion: 'COMPRA_Y_REVENTA',
      requiereProbador: true,
      precioVenta: 590.00,
      costoMateriales: 360.00,
      pesoEnMix: 16,
      equiposInvolucrados: ['imp_tpv', 'imp_terminal'],
      bom: [
        { insumoId: 'mat_stock_permachef', cantidad: 1 },
        { insumoId: 'mat_bolsa_empaque_imp', cantidad: 1 }
      ]
    },
    {
      id: 'imp_conjunto_enfermeria',
      procesoId: 'imp_conjunto_enfermeria',
      nombre: 'Conjunto Enfermería Blanco (Estante Enfermería + Probador)',
      tipoOperacion: 'COMPRA_Y_REVENTA',
      requiereProbador: true,
      precioVenta: 680.00,
      costoMateriales: 430.00,
      pesoEnMix: 15,
      equiposInvolucrados: ['imp_tpv', 'imp_terminal'],
      bom: [
        { insumoId: 'mat_stock_clinico_taller', cantidad: 1 },
        { insumoId: 'mat_bolsa_empaque_imp', cantidad: 1 }
      ]
    },
    {
      id: 'imp_uniforme_escolar',
      procesoId: 'imp_uniforme_escolar',
      nombre: 'Uniforme Escolar Completo (Estante Escolares + Bordado)',
      tipoOperacion: 'COMPRA_Y_REVENTA',
      requiereProbador: false,
      precioVenta: 420.00,
      costoMateriales: 230.00,
      pesoEnMix: 14,
      equiposInvolucrados: ['imp_tpv', 'imp_terminal'],
      bom: [
        { insumoId: 'mat_stock_clinico_taller', cantidad: 1 },
        { insumoId: 'mat_bolsa_empaque_imp', cantidad: 1 }
      ]
    },
    {
      id: 'imp_camisola_industrial',
      procesoId: 'imp_camisola_industrial',
      nombre: 'Camisola / Overol Industrial (Estante Industriales)',
      tipoOperacion: 'FABRICACION_INTERNA_Y_PEDIDOS',
      requiereProbador: true,
      precioVenta: 740.00,
      costoMateriales: 440.00,
      pesoEnMix: 13,
      equiposInvolucrados: ['imp_tpv', 'imp_terminal'],
      bom: [
        { insumoId: 'mat_stock_clinico_taller', cantidad: 1 },
        { insumoId: 'mat_bolsa_empaque_imp', cantidad: 1 }
      ]
    },
    {
      id: 'imp_polo_proveedor',
      procesoId: 'imp_polo_proveedor',
      nombre: 'Playera Polo / Camisa Cotexa-Euro-Jasbec (Estante Proveedores)',
      tipoOperacion: 'COMPRA_Y_REVENTA',
      requiereProbador: false,
      precioVenta: 340.00,
      costoMateriales: 185.00,
      pesoEnMix: 12,
      equiposInvolucrados: ['imp_tpv', 'imp_terminal'],
      bom: [
        { insumoId: 'mat_playera_gorra_blank', cantidad: 1 },
        { insumoId: 'mat_bolsa_empaque_imp', cantidad: 1 }
      ]
    },
    {
      id: 'imp_pedido_b2b_empresa',
      procesoId: 'imp_pedido_b2b_empresa',
      nombre: 'Pedido Empresarial B2B Personalizado (Envía a Taller + Bordados)',
      tipoOperacion: 'FABRICACION_INTERNA_Y_PEDIDOS',
      requiereProbador: false,
      precioVenta: 4800.00,
      costoMateriales: 2450.00,
      pesoEnMix: 10,
      equiposInvolucrados: ['imp_tpv', 'imp_terminal'],
      bom: [
        { insumoId: 'mat_stock_clinico_taller', cantidad: 4 },
        { insumoId: 'mat_bolsa_empaque_imp', cantidad: 4 }
      ]
    }
  ],

  papeleria_imperiarte: [
    {
      id: 'pap_copia_bn',
      procesoId: 'pap_copia_bn',
      nombre: 'Juego de 15 Fotocopias / Impresiones B/N (DocuColor)',
      tipoOperacion: 'PREPARADO_AL_MOMENTO',
      precioVenta: 30.00,
      costoMateriales: 6.75,
      pesoEnMix: 45,
      equiposInvolucrados: ['pap_tpv', 'pap_docucolor'],
      bom: [
        { insumoId: 'mat_papel_bond_carta', cantidad: 15 },
        { insumoId: 'mat_toner_cmyk', cantidad: 1 }
      ]
    },
    {
      id: 'pap_impresion_color',
      procesoId: 'pap_impresion_color',
      nombre: 'Set 8 Impresiones Láser Color CMYK (DocuColor)',
      tipoOperacion: 'PREPARADO_AL_MOMENTO',
      precioVenta: 64.00,
      costoMateriales: 17.60,
      pesoEnMix: 30,
      equiposInvolucrados: ['pap_tpv', 'pap_docucolor'],
      bom: [
        { insumoId: 'mat_papel_bond_carta', cantidad: 8 },
        { insumoId: 'mat_toner_cmyk', cantidad: 3 }
      ]
    },
    {
      id: 'pap_bateria_2mm',
      procesoId: 'pap_venta_mostrador',
      nombre: 'Pliegos Cartón Batería Pinto / Marquilla (Reventa)',
      tipoOperacion: 'COMPRA_Y_REVENTA',
      precioVenta: 65.00,
      costoMateriales: 28.00,
      pesoEnMix: 25,
      equiposInvolucrados: ['pap_tpv'],
      bom: [
        { insumoId: 'mat_pliego_bateria_marquilla', cantidad: 1 }
      ]
    }
  ],

  bordados_veracruz: [
    {
      id: 'bv_escudo_aemco',
      procesoId: 'bv_escudo_aemco',
      nombre: 'Lote 4 Bordados Escudo Pecho (AEMCO 220V -> Entrega Imperia)',
      tipoOperacion: 'FABRICACION_INTERNA_Y_PEDIDOS',
      precioVenta: 240.00,
      costoMateriales: 32.00,
      pesoEnMix: 60,
      equiposInvolucrados: ['bv_aemco_220'],
      bom: [
        { insumoId: 'mat_hilo_bordado', cantidad: 4 },
        { insumoId: 'mat_pelon_estabilizador', cantidad: 4 }
      ]
    },
    {
      id: 'bv_nombre_melco',
      procesoId: 'bv_nombre_melco',
      nombre: 'Bordado Personalizado Nombre/Logo (Melco EMC -> Entrega Imperia)',
      tipoOperacion: 'FABRICACION_INTERNA_Y_PEDIDOS',
      precioVenta: 145.00,
      costoMateriales: 22.00,
      pesoEnMix: 40,
      equiposInvolucrados: ['bv_melco_emc'],
      bom: [
        { insumoId: 'mat_hilo_bordado', cantidad: 2 },
        { insumoId: 'mat_pelon_estabilizador', cantidad: 2 }
      ]
    }
  ],

  taller_costura: [
    {
      id: 'tc_filipina_chef',
      procesoId: 'tc_filipina_chef',
      nombre: 'Confección Filipina Médica / Chef (Secuencia Completa -> Imperia)',
      tipoOperacion: 'FABRICACION_INTERNA_Y_PEDIDOS',
      precioVenta: 480.00,
      costoMateriales: 160.00,
      pesoEnMix: 60,
      equiposInvolucrados: ['tc_cortadora', 'tc_overlock_5h', 'tc_rectas_singer', 'tc_collaretera_singer', 'tc_plancha_vapor'],
      bom: [
        { insumoId: 'mat_rollo_gabardina_antifluidos', cantidad: 1.6 },
        { insumoId: 'mat_avios_costura', cantidad: 1 }
      ]
    },
    {
      id: 'tc_bata_recta',
      procesoId: 'tc_bata_recta',
      nombre: 'Confección Prenda Recta Industrial + Planchado Intermedio',
      tipoOperacion: 'FABRICACION_INTERNA_Y_PEDIDOS',
      precioVenta: 410.00,
      costoMateriales: 135.00,
      pesoEnMix: 40,
      equiposInvolucrados: ['tc_cortadora', 'tc_rectas_singer', 'tc_plancha_vapor'],
      bom: [
        { insumoId: 'mat_rollo_gabardina_antifluidos', cantidad: 1.3 },
        { insumoId: 'mat_avios_costura', cantidad: 1 }
      ]
    }
  ],

  taller_publi_imperia: [
    {
      id: 'pi_sub_tazas',
      procesoId: 'pi_sub_tazas',
      nombre: 'Taza Sublimada Personalizada 11oz',
      tipoOperacion: 'FABRICACION_INTERNA_Y_PEDIDOS',
      precioVenta: 95.00,
      costoMateriales: 32.00,
      pesoEnMix: 25,
      equiposInvolucrados: ['pi_pc_diseno', 'pi_epson', 'pi_plancha_tazas'],
      bom: [
        { insumoId: 'mat_taza_blanca_11oz', cantidad: 1 },
        { insumoId: 'mat_transfer_dtf_vinil', cantidad: 1 }
      ]
    },
    {
      id: 'pi_dtf_playeras',
      procesoId: 'pi_dtf_playeras',
      nombre: 'Playera DTF (Combi/Promox -> 160°C 5m + 3x 15s/20s)',
      tipoOperacion: 'FABRICACION_INTERNA_Y_PEDIDOS',
      precioVenta: 220.00,
      costoMateriales: 85.00,
      pesoEnMix: 30,
      equiposInvolucrados: ['pi_pc_diseno', 'pi_plancha_plana'],
      bom: [
        { insumoId: 'mat_playera_gorra_blank', cantidad: 1 },
        { insumoId: 'mat_transfer_dtf_vinil', cantidad: 1 }
      ]
    },
    {
      id: 'pi_vinil_textil_euro',
      procesoId: 'pi_vinil_textil_euro',
      nombre: 'Vinil Textil Euro (Plotter + Depilado + 140°C + 3x 20s/20s)',
      tipoOperacion: 'FABRICACION_INTERNA_Y_PEDIDOS',
      precioVenta: 195.00,
      costoMateriales: 70.00,
      pesoEnMix: 20,
      equiposInvolucrados: ['pi_pc_diseno', 'pi_plancha_plana'],
      bom: [
        { insumoId: 'mat_playera_gorra_blank', cantidad: 1 },
        { insumoId: 'mat_transfer_dtf_vinil', cantidad: 1 }
      ]
    },
    {
      id: 'pi_sublimacion_plana',
      procesoId: 'pi_sublimacion_plana',
      nombre: 'Sublimación Plana > Carta (Imagen Impresa 200°C 5m + 60s)',
      tipoOperacion: 'FABRICACION_INTERNA_Y_PEDIDOS',
      precioVenta: 260.00,
      costoMateriales: 90.00,
      pesoEnMix: 15,
      equiposInvolucrados: ['pi_pc_diseno', 'pi_plancha_plana'],
      bom: [
        { insumoId: 'mat_playera_gorra_blank', cantidad: 1 },
        { insumoId: 'mat_transfer_dtf_vinil', cantidad: 1 }
      ]
    },
    {
      id: 'pi_lote_b2b_playeras',
      procesoId: 'pi_lote_b2b_playeras',
      nombre: 'Lote B2B Empresarial (50 Playeras DTF -> Cajas Almacén Publi)',
      tipoOperacion: 'FABRICACION_INTERNA_Y_PEDIDOS',
      precioVenta: 6800.00,
      costoMateriales: 2900.00,
      pesoEnMix: 10,
      equiposInvolucrados: ['pi_pc_diseno', 'pi_plancha_plana'],
      bom: [
        { insumoId: 'mat_playera_gorra_blank', cantidad: 10 },
        { insumoId: 'mat_transfer_dtf_vinil', cantidad: 10 }
      ]
    }
  ]
};
