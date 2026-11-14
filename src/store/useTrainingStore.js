/**
 * Store del "Modo Entrenamiento del Trabajador" (Worker Training & Energy Debugging Mode).
 * Permite observar paso a paso al empleado fabricar o vender cada producto, pedir propuestas a la IA
 * y micro-administrar con Sliders el tiempo que está encendida cada máquina eléctrica.
 */

import { create } from 'zustand';
import { RECETAS_COREOGRAFICAS_DETALLADAS } from '../engine/ChoreographyRegistry.js';
import { PRODUCTOS_OPERATIVOS_EXTENDIDOS } from '../shared/catalogoProductosInsumos.js';
import { proponerProcesoConIA } from '../services/geminiProcessPlanner.js';
import { simCitySyncService } from '../services/firebaseSync.js';

export const useTrainingStore = create((set, get) => ({
  isTrainingMode: false,
  selectedNegocioId: 'hawaiian_paradise',
  selectedProductId: 'hp_raspado',
  activeStepIndex: 0,
  stepElapsedSec: 0,
  isPlayingDemo: true,
  isGeneratingAI: false,
  lastSavedMessage: null,

  // Diccionario de recetas entrenadas (inicializado con el catálogo canónico detallado)
  recetasEntrenadas: structuredClone(RECETAS_COREOGRAFICAS_DETALLADAS),

  setTrainingMode: (active, negocioId = null, productId = null) => {
    set((state) => {
      const nextNeg = negocioId || state.selectedNegocioId || 'hawaiian_paradise';
      const prods = PRODUCTOS_OPERATIVOS_EXTENDIDOS[nextNeg] || PRODUCTOS_OPERATIVOS_EXTENDIDOS.hawaiian_paradise;
      const nextProd = productId || (prods.some(p => p.id === state.selectedProductId) ? state.selectedProductId : prods[0]?.id) || 'hp_raspado';
      return {
        isTrainingMode: active,
        selectedNegocioId: nextNeg,
        selectedProductId: nextProd,
        activeStepIndex: 0,
        stepElapsedSec: 0,
        isPlayingDemo: true
      };
    });
  },

  selectNegocioForTraining: (negocioId) => {
    const prods = PRODUCTOS_OPERATIVOS_EXTENDIDOS[negocioId] || PRODUCTOS_OPERATIVOS_EXTENDIDOS.hawaiian_paradise;
    const firstProdId = prods[0]?.id || 'hp_raspado';
    set({
      selectedNegocioId: negocioId,
      selectedProductId: firstProdId,
      activeStepIndex: 0,
      stepElapsedSec: 0
    });
  },

  selectProductForTraining: (productId) => {
    set((state) => {
      // Si el producto aún no tiene copia individual en recetasEntrenadas, clonarlo desde la plantilla del negocio
      const nextRecetas = { ...state.recetasEntrenadas };
      if (!nextRecetas[productId]) {
        const fallbackKey = Object.keys(RECETAS_COREOGRAFICAS_DETALLADAS).find(
          k => RECETAS_COREOGRAFICAS_DETALLADAS[k].negocioId === state.selectedNegocioId
        ) || 'hp_raspado';
        const allProds = PRODUCTOS_OPERATIVOS_EXTENDIDOS[state.selectedNegocioId] || [];
        const prodMeta = allProds.find(p => p.id === productId);
        nextRecetas[productId] = {
          ...structuredClone(RECETAS_COREOGRAFICAS_DETALLADAS[fallbackKey]),
          id: productId,
          nombreProducto: prodMeta?.nombre || productId,
          precioVenta: prodMeta?.precioVenta || 50
        };
      }
      return {
        selectedProductId: productId,
        recetasEntrenadas: nextRecetas,
        activeStepIndex: 0,
        stepElapsedSec: 0
      };
    });
  },

  loadRecetasFromCloud: (remoteRecetas) => {
    if (!remoteRecetas || typeof remoteRecetas !== 'object') return;
    set((state) => ({
      recetasEntrenadas: {
        ...state.recetasEntrenadas,
        ...remoteRecetas
      }
    }));
  },

  setStepIndex: (idx) => set({ activeStepIndex: idx, stepElapsedSec: 0 }),
  togglePlayDemo: () => set((s) => ({ isPlayingDemo: !s.isPlayingDemo })),

  /**
   * Avanza el reloj del demo en Modo Entrenamiento
   */
  tickTrainingDemo: (deltaRealSec) => {
    const state = get();
    if (!state.isTrainingMode || !state.isPlayingDemo) return;
    const receta = state.recetasEntrenadas[state.selectedProductId] || RECETAS_COREOGRAFICAS_DETALLADAS.hp_raspado;
    if (!receta || !receta.pasos || receta.pasos.length === 0) return;

    const currentStep = receta.pasos[state.activeStepIndex] || receta.pasos[0];
    const targetDur = Math.max(1.0, parseFloat(currentStep.duracionSegundos) || 3.0);
    const nextElapsed = state.stepElapsedSec + deltaRealSec;

    if (nextElapsed >= targetDur) {
      const nextIdx = (state.activeStepIndex + 1) % receta.pasos.length;
      set({ activeStepIndex: nextIdx, stepElapsedSec: 0 });
    } else {
      set({ stepElapsedSec: nextElapsed });
    }
  },

  /**
   * Actualiza mediante Slider la duración en segundos de un paso específico
   */
  updateStepDurationSlider: (productId, stepId, newSeconds) => {
    const val = Math.max(0.5, parseFloat(newSeconds) || 1.0);
    set((state) => {
      const actual = state.recetasEntrenadas[productId] || structuredClone(RECETAS_COREOGRAFICAS_DETALLADAS.hp_raspado);
      const nuevosPasos = actual.pasos.map((p) =>
        p.id === stepId ? { ...p, duracionSegundos: val } : p
      );
      return {
        recetasEntrenadas: {
          ...state.recetasEntrenadas,
          [productId]: { ...actual, pasos: nuevosPasos }
        }
      };
    });
  },

  /**
   * Actualiza mediante Slider el factor de potencia o el auto-apagado de la máquina en un paso
   */
  updateStepMachineSettings: (productId, stepId, changes) => {
    set((state) => {
      const actual = state.recetasEntrenadas[productId] || structuredClone(RECETAS_COREOGRAFICAS_DETALLADAS.hp_raspado);
      const nuevosPasos = actual.pasos.map((p) =>
        p.id === stepId ? { ...p, ...changes } : p
      );
      return {
        recetasEntrenadas: {
          ...state.recetasEntrenadas,
          [productId]: { ...actual, pasos: nuevosPasos }
        }
      };
    });
  },

  /**
   * Solicita a la IA que proponga/optimice los tiempos y pasos del producto actual
   */
  generateAIProposalForCurrentProduct: async (objetivo = 'equilibrado', equiposLocal = [], insumosLocal = []) => {
    const state = get();
    const prods = PRODUCTOS_OPERATIVOS_EXTENDIDOS[state.selectedNegocioId] || [];
    const prod = prods.find(p => p.id === state.selectedProductId) || prods[0] || { id: 'hp_raspado', nombre: 'Raspado de Limón' };

    set({ isGeneratingAI: true, lastSavedMessage: null });
    try {
      const propuesta = await proponerProcesoConIA({
        producto: prod,
        negocioId: state.selectedNegocioId,
        equiposDisponibles: equiposLocal,
        insumosDisponibles: insumosLocal,
        objetivoOptimizacion: objetivo
      });

      set((s) => ({
        isGeneratingAI: false,
        activeStepIndex: 0,
        stepElapsedSec: 0,
        recetasEntrenadas: {
          ...s.recetasEntrenadas,
          [state.selectedProductId]: propuesta
        },
        lastSavedMessage: `🤖 Receta propuesta por ${propuesta.generadoPor || 'IA'} aplicada.`
      }));
    } catch (err) {
      set({ isGeneratingAI: false });
    }
  },

  /**
   * Guarda el entrenamiento actual y lo sincroniza bidireccionalmente con Eléctrico Alacio en Firestore
   */
  saveTrainingToElectricoAlacio: async () => {
    const state = get();
    await simCitySyncService.saveRecetasEntrenadas('consorcio_general', state.recetasEntrenadas);
    set({
      lastSavedMessage: '✅ Entrenamiento guardado y sincronizado con Eléctrico Alacio (Firestore).'
    });
    setTimeout(() => {
      set({ lastSavedMessage: null });
    }, 4000);
  }
}));
