/**
 * Store de Edición Espacial 3D, Modelos SketchUp (.skp/.glb/.dae),
 * Definición de Piso, Muros, Bloques de Colisión y Visualización de NavMesh.
 */

import { create } from 'zustand';
import { DEFAULT_COLLISION_BLOCKS_POR_NEGOCIO } from '../engine/NavMeshGrid.js';
import { simCitySyncService } from '../services/firebaseSync.js';

export const useSceneEditorStore = create((set, get) => ({
  showNavMesh: false,
  showCollisionBlocks: false,
  cutawayWalls: true, // Muros frontales semi-abiertos estilo Sims / Tycoon para ver el interior
  editorTool: 'VIEW', // 'VIEW' | 'ADD_COLLISION' | 'TOGGLE_FLOOR_WALL'
  isImporterModalOpen: false,
  isCollisionToolOpen: false,
  isSketchupBridgeModalOpen: false,
  lastSketchupSyncTime: null,

  // Bloques de colisión editables por negocio
  collisionBlocksByNegocio: structuredClone(DEFAULT_COLLISION_BLOCKS_POR_NEGOCIO),

  // Modelos 3D (.skp, .glb, .dae, .obj) agregados por el usuario
  customModels3D: [],

  // Configuración de capas de piso y muros por local
  layerSettingsByNegocio: {
    hawaiian_paradise: { floorHeight: 0, wallHeight: 3.2, floorColor: '#1e293b', wallColor: '#334155' },
    imperia_uniformes: { floorHeight: 0, wallHeight: 3.2, floorColor: '#0f172a', wallColor: '#1e293b' },
    papeleria_imperiarte: { floorHeight: 0, wallHeight: 3.2, floorColor: '#172554', wallColor: '#1e3a8a' },
    bordados_veracruz: { floorHeight: 0, wallHeight: 3.2, floorColor: '#1f1224', wallColor: '#3b1d38' },
    taller_costura: { floorHeight: 0, wallHeight: 3.2, floorColor: '#1e1b4b', wallColor: '#312e81' },
    taller_publi_imperia: { floorHeight: 0, wallHeight: 3.2, floorColor: '#082f49', wallColor: '#0c4a6e' }
  },

  toggleNavMesh: () => set((s) => ({ showNavMesh: !s.showNavMesh })),
  toggleCollisionBlocks: () => set((s) => ({ showCollisionBlocks: !s.showCollisionBlocks })),
  toggleCutawayWalls: () => set((s) => ({ cutawayWalls: !s.cutawayWalls })),
  setEditorTool: (tool) => set({ editorTool: tool }),
  setImporterModalOpen: (open) => set({ isImporterModalOpen: open }),
  setCollisionToolOpen: (open) => set({ isCollisionToolOpen: open }),
  setSketchupBridgeModalOpen: (open) => set({ isSketchupBridgeModalOpen: open }),
  setLastSketchupSyncTime: (time) => set({ lastSketchupSyncTime: time }),

  loadEscenaConfigFromCloud: (escena3DConfig) => {
    if (!escena3DConfig) return;
    set((state) => ({
      collisionBlocksByNegocio: escena3DConfig.collisionBlocksByNegocio || state.collisionBlocksByNegocio,
      layerSettingsByNegocio: escena3DConfig.layerSettingsByNegocio || state.layerSettingsByNegocio,
      customModels3D: Array.isArray(escena3DConfig.customModels3D) ? escena3DConfig.customModels3D : state.customModels3D
    }));
  },

  addCollisionBlock: (negocioId, blockData) => {
    set((state) => {
      const currentList = state.collisionBlocksByNegocio[negocioId] || [];
      const newBlock = {
        id: `col_${negocioId}_${Date.now()}`,
        label: blockData.label || 'Bloque de Colisión',
        tagType: blockData.tagType || 'COLLISION_BLOCK',
        x: parseFloat(blockData.x) || 0,
        z: parseFloat(blockData.z) || 0,
        w: Math.max(0.3, parseFloat(blockData.w) || 1.2),
        d: Math.max(0.3, parseFloat(blockData.d) || 1.2),
        h: Math.max(0.4, parseFloat(blockData.h) || 1.1),
        color: blockData.color || '#ef4444'
      };
      const updated = {
        ...state.collisionBlocksByNegocio,
        [negocioId]: [...currentList, newBlock]
      };
      simCitySyncService.saveEscena3DConfig('consorcio_general', {
        collisionBlocksByNegocio: updated,
        layerSettingsByNegocio: state.layerSettingsByNegocio,
        customModels3D: state.customModels3D.map(({ object3D, ...rest }) => rest)
      });
      return { collisionBlocksByNegocio: updated };
    });
  },

  updateCollisionBlock: (negocioId, blockId, changes) => {
    set((state) => {
      const list = (state.collisionBlocksByNegocio[negocioId] || []).map((b) =>
        b.id === blockId ? { ...b, ...changes } : b
      );
      const updated = { ...state.collisionBlocksByNegocio, [negocioId]: list };
      simCitySyncService.saveEscena3DConfig('consorcio_general', {
        collisionBlocksByNegocio: updated,
        layerSettingsByNegocio: state.layerSettingsByNegocio,
        customModels3D: state.customModels3D.map(({ object3D, ...rest }) => rest)
      });
      return { collisionBlocksByNegocio: updated };
    });
  },

  removeCollisionBlock: (negocioId, blockId) => {
    set((state) => {
      const list = (state.collisionBlocksByNegocio[negocioId] || []).filter((b) => b.id !== blockId);
      const updated = { ...state.collisionBlocksByNegocio, [negocioId]: list };
      simCitySyncService.saveEscena3DConfig('consorcio_general', {
        collisionBlocksByNegocio: updated,
        layerSettingsByNegocio: state.layerSettingsByNegocio,
        customModels3D: state.customModels3D.map(({ object3D, ...rest }) => rest)
      });
      return { collisionBlocksByNegocio: updated };
    });
  },

  resetCollisionBlocksToDefault: (negocioId) => {
    set((state) => {
      const updated = {
        ...state.collisionBlocksByNegocio,
        [negocioId]: structuredClone(DEFAULT_COLLISION_BLOCKS_POR_NEGOCIO[negocioId] || [])
      };
      return { collisionBlocksByNegocio: updated };
    });
  },

  addCustomModel3D: (modelMeta) => {
    set((state) => {
      const nextModels = [...state.customModels3D, modelMeta];
      // Si el modelo importado se etiquetó como COLLISION_BLOCK, EQUIPMENT o WALL, agregar su huella de colisión
      let updatedBlocks = state.collisionBlocksByNegocio;
      if (['COLLISION_BLOCK', 'WALL', 'EQUIPMENT'].includes(modelMeta.tagCategory)) {
        const negId = modelMeta.negocioId || 'hawaiian_paradise';
        const curList = updatedBlocks[negId] || [];
        updatedBlocks = {
          ...updatedBlocks,
          [negId]: [
            ...curList,
            {
              id: `col_skp_${modelMeta.id}`,
              label: `[SKP] ${modelMeta.nombre}`,
              tagType: modelMeta.tagCategory,
              x: modelMeta.localX || 0,
              z: modelMeta.localZ || 0,
              w: modelMeta.width || 1.1,
              d: modelMeta.depth || 1.1,
              h: modelMeta.height || 1.2,
              color: modelMeta.tagCategory === 'WALL' ? '#64748b' : '#f59e0b'
            }
          ]
        };
      }
      return {
        customModels3D: nextModels,
        collisionBlocksByNegocio: updatedBlocks
      };
    });
  },

  removeCustomModel3D: (modelId) => {
    set((state) => ({
      customModels3D: state.customModels3D.filter((m) => m.id !== modelId)
    }));
  }
}));
