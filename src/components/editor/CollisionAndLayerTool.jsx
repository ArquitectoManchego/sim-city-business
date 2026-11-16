/**
 * Herramienta Interactiva para Definir y Depurar Pisos, Muros, Bloques de Colisión
 * y la Grilla de Caminata (NavMesh A*) de cada negocio en 3D.
 */

import React, { useState } from 'react';
import { ShieldAlert, Grid, Eye, PlusCircle, Trash2, RotateCcw, X, ChevronDown, ChevronUp, Box } from 'lucide-react';
import { useSceneEditorStore } from '../../store/useSceneEditorStore.js';
import { useGameStore, NEGOCIOS_ACTIVOS_IDS } from '../../store/useGameStore.js';
import { NEGOCIOS_ZONES_3D } from '../../engine/ChoreographyRegistry.js';
import GeniePanel from '../ui/GeniePanel.jsx';

export default function CollisionAndLayerTool() {
  const isOpen = useSceneEditorStore((s) => s.isCollisionToolOpen);
  const setOpen = useSceneEditorStore((s) => s.setCollisionToolOpen);
  const setSketchupBridgeModalOpen = useSceneEditorStore((s) => s.setSketchupBridgeModalOpen);
  const showNavMesh = useSceneEditorStore((s) => s.showNavMesh);
  const toggleNavMesh = useSceneEditorStore((s) => s.toggleNavMesh);
  const showCollisionBlocks = useSceneEditorStore((s) => s.showCollisionBlocks);
  const toggleCollisionBlocks = useSceneEditorStore((s) => s.toggleCollisionBlocks);
  const cutawayWalls = useSceneEditorStore((s) => s.cutawayWalls);
  const toggleCutawayWalls = useSceneEditorStore((s) => s.toggleCutawayWalls);
  const editorTool = useSceneEditorStore((s) => s.editorTool);
  const setEditorTool = useSceneEditorStore((s) => s.setEditorTool);
  const collisionBlocksByNegocio = useSceneEditorStore((s) => s.collisionBlocksByNegocio);
  const removeCollisionBlock = useSceneEditorStore((s) => s.removeCollisionBlock);
  const resetCollisionBlocksToDefault = useSceneEditorStore((s) => s.resetCollisionBlocksToDefault);

  const focusedNegocioId = useGameStore((s) => s.focusedNegocioId);
  const setFocusedNegocioId = useGameStore((s) => s.setFocusedNegocioId);
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isOpen) return null;

  const activeNegId = NEGOCIOS_ZONES_3D[focusedNegocioId] ? focusedNegocioId : 'hawaiian_paradise';
  const blocks = collisionBlocksByNegocio[activeNegId] || [];

  return (
    <div className="fixed top-24 right-4 z-40">
      <GeniePanel
        isMinimized={isMinimized}
        origin="top right"
        direction="top"
        renderDockIcon={() => (
          <button
            onClick={() => setIsMinimized(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/95 hover:bg-slate-800 border border-rose-500/50 text-rose-300 text-xs font-bold shadow-xl backdrop-blur-md"
          >
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Colisiones 3D</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        )}
      >
        <div className="w-80 bg-slate-900/95 border border-slate-700 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden flex flex-col max-h-[75vh]">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Pisos, Muros y Colisiones 3D
              </h3>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 text-slate-400 hover:text-white"
                title="Minimizar"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setEditorTool('VIEW');
                  setOpen(false);
                }}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

      <div className="p-3.5 space-y-3 overflow-y-auto text-xs">
        {/* Selector de Local */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 block mb-1">
            Local Comercial Activo:
          </label>
          <select
            value={activeNegId}
            onChange={(e) => setFocusedNegocioId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
          >
            {NEGOCIOS_ACTIVOS_IDS.map((id) => (
              <option key={id} value={id}>
                {NEGOCIOS_ZONES_3D[id].nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Botones de Visualización de Capas */}
        <div className="grid grid-cols-1 gap-2">
          <button
            onClick={toggleNavMesh}
            className={`flex items-center justify-between px-3 py-2 rounded-xl border font-medium transition ${
              showNavMesh
                ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <Grid className="w-4 h-4 text-emerald-400" />
              Mostrar Piso Caminable (NavMesh A*)
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/40">
              {showNavMesh ? 'ON' : 'OFF'}
            </span>
          </button>

          <button
            onClick={toggleCollisionBlocks}
            className={`flex items-center justify-between px-3 py-2 rounded-xl border font-medium transition ${
              showCollisionBlocks
                ? 'bg-rose-950/80 border-rose-500/60 text-rose-200'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Resaltar Bloques de Colisión
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/40">
              {showCollisionBlocks ? 'ON' : 'OFF'}
            </span>
          </button>

          <button
            onClick={toggleCutawayWalls}
            className={`flex items-center justify-between px-3 py-2 rounded-xl border font-medium transition ${
              cutawayWalls
                ? 'bg-sky-950/80 border-sky-500/60 text-sky-200'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-sky-400" />
              Corte Arquitectónico de Muros
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/40">
              {cutawayWalls ? 'ABIERTO' : 'CERRADO'}
            </span>
          </button>
        </div>

        {/* Herramienta de Clic en el Piso para Agregar Bloque de Colisión */}
        <div className="pt-1">
          <button
            onClick={() => setEditorTool(editorTool === 'ADD_COLLISION' ? 'VIEW' : 'ADD_COLLISION')}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-bold transition ${
              editorTool === 'ADD_COLLISION'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>
              {editorTool === 'ADD_COLLISION'
                ? 'Haz clic en el piso 3D para colocar colisión...'
                : 'Agregar Bloque de Colisión con Clic 3D'}
            </span>
          </button>
        </div>

        {/* Enlace al Plugin y Exportador de SketchUp */}
        <div className="pt-1">
          <button
            onClick={() => setSketchupBridgeModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-red-600/30 to-amber-600/30 hover:from-red-600/50 hover:to-amber-600/50 border border-red-500/60 text-red-200 text-xs font-bold transition shadow"
          >
            <Box className="w-4 h-4 text-red-400" />
            <span>📐 Abrir en Trimble SketchUp</span>
          </button>
        </div>

        {/* Lista de Bloques de Colisión del Local */}
        <div className="pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-slate-300">
              Bloques Activos ({blocks.length})
            </span>
            <button
              onClick={() => resetCollisionBlocksToDefault(activeNegId)}
              className="flex items-center gap-1 text-[11px] text-amber-400 hover:underline"
            >
              <RotateCcw className="w-3 h-3" />
              Restaurar
            </button>
          </div>
          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
            {blocks.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800"
              >
                <div className="truncate pr-2">
                  <div className="font-medium text-slate-200 truncate">{b.label}</div>
                  <div className="text-[10px] text-slate-500">
                    {b.tagType} • ({b.x}m, {b.z}m) • {b.w}×{b.d}m
                  </div>
                </div>
                <button
                  onClick={() => removeCollisionBlock(activeNegId, b.id)}
                  className="p-1 text-rose-400 hover:bg-rose-950 rounded"
                  title="Eliminar bloque de colisión"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
        </div>
        </div>
      </GeniePanel>
    </div>
  );
}
