/**
 * Controles Inferiores Minimizables con Animación Mac Genie:
 * 1. Panel "Simular Cliente Ahora" (minimizable con flecha hacia icono de dock).
 * 2. Panel "Log de Simulación y Stats en Vivo" (minimizable con flecha hacia botón).
 */

import React, { useState } from 'react';
import {
  Terminal,
  UserPlus,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { useGameStore, NEGOCIOS_ACTIVOS_IDS } from '../../store/useGameStore.js';
import { NEGOCIOS_ZONES_3D } from '../../engine/ChoreographyRegistry.js';
import { PRODUCTOS_OPERATIVOS_EXTENDIDOS } from '../../shared/catalogoProductosInsumos.js';
import GeniePanel from '../ui/GeniePanel.jsx';

export default function LiveStatsTickerLog() {
  const liveLogs = useGameStore((s) => s.liveLogs);
  const focusedNegocioId = useGameStore((s) => s.focusedNegocioId);
  const setFocusedNegocioId = useGameStore((s) => s.setFocusedNegocioId);
  const spawnCustomerNow = useGameStore((s) => s.spawnCustomerNow);

  const [filterNegocio, setFilterNegocio] = useState('ALL');
  const [isSimBarMinimized, setIsSimBarMinimized] = useState(false);
  const [isLogMinimized, setIsLogMinimized] = useState(false);

  const activeNegForButtons = NEGOCIOS_ZONES_3D[focusedNegocioId]
    ? focusedNegocioId
    : 'hawaiian_paradise';
  const productosRapidos = PRODUCTOS_OPERATIVOS_EXTENDIDOS[activeNegForButtons] || [];

  const logsFiltrados =
    filterNegocio === 'ALL'
      ? liveLogs
      : liveLogs.filter((l) => l.negocioId === filterNegocio || l.negocioId === 'consorcio');

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 p-3 flex flex-col lg:flex-row items-end justify-between gap-2.5">
      {/* 1. Panel "Simular Cliente Ahora" minimizable con animación tipo Mac Genie */}
      <div className="pointer-events-auto max-w-full lg:max-w-[58%] flex items-end">
        <GeniePanel
          isMinimized={isSimBarMinimized}
          origin="bottom left"
          direction="bottom"
          renderDockIcon={() => (
            <button
              onClick={() => setIsSimBarMinimized(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950/90 hover:bg-slate-900 border border-teal-500/50 text-teal-300 text-xs font-bold shadow-xl backdrop-blur-md transition"
              title="Restaurar panel Simular Cliente Ahora"
            >
              <UserPlus className="w-4 h-4 text-teal-400" />
              <span>Simular Cliente</span>
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950/90 border border-slate-800 rounded-xl px-3.5 py-2 backdrop-blur-md shadow-xl">
            <div className="flex items-center gap-2 text-xs">
              <UserPlus className="w-4 h-4 text-teal-400 shrink-0" />
              <span className="font-bold text-white">
                Simular Cliente Ahora en{' '}
                <span className="text-amber-400">{NEGOCIOS_ZONES_3D[activeNegForButtons].nombre}</span>:
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {productosRapidos.map((prod) => (
                <button
                  key={prod.id}
                  onClick={() => {
                    setFocusedNegocioId(activeNegForButtons);
                    spawnCustomerNow(activeNegForButtons, prod.id);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-teal-950 border border-slate-700 hover:border-teal-500/60 text-slate-200 hover:text-teal-200 text-[11px] font-semibold transition flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>{prod.nombre}</span>
                  <span className="text-emerald-400 font-mono">(${prod.precioVenta})</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsSimBarMinimized(true)}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition"
              title="Esconder panel hacia icono"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </GeniePanel>
      </div>

      {/* 2. Panel "Log de Simulación y Stats en Vivo" minimizable con flechita tipo Mac Genie */}
      <div className="pointer-events-auto w-full lg:w-[460px] flex justify-end items-end">
        <GeniePanel
          isMinimized={isLogMinimized}
          origin="bottom right"
          direction="bottom"
          className="w-full"
          renderDockIcon={() => (
            <button
              onClick={() => setIsLogMinimized(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950/90 hover:bg-slate-900 border border-teal-500/50 text-teal-300 text-xs font-bold shadow-xl backdrop-blur-md transition"
              title="Mostrar Log de Simulación y Stats en Vivo"
            >
              <Terminal className="w-4 h-4 text-teal-400" />
              <span>Log en Vivo ({liveLogs.length})</span>
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}
        >
          <div className="bg-slate-950/92 border border-slate-800 rounded-xl flex flex-col h-44 w-full overflow-hidden shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-teal-300 truncate">
                <Terminal className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Log de Simulación y Stats en Vivo</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <select
                  value={filterNegocio}
                  onChange={(e) => setFilterNegocio(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-[10px] text-slate-300"
                >
                  <option value="ALL">Todos los Negocios</option>
                  {NEGOCIOS_ACTIVOS_IDS.map((nId) => (
                    <option key={nId} value={nId}>
                      {NEGOCIOS_ZONES_3D[nId].nombre}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setIsLogMinimized(true)}
                  className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                  title="Minimizar Log en Vivo"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2.5 space-y-1 font-mono text-[11px]">
              {logsFiltrados.map((log) => (
                <div
                  key={log.id}
                  className={`leading-snug px-2 py-1 rounded border ${
                    log.tipo === 'sale'
                      ? 'bg-emerald-950/35 border-emerald-500/30 text-emerald-200'
                      : log.tipo === 'daily_close'
                        ? 'bg-indigo-950/50 border-indigo-500/40 text-indigo-200 font-semibold'
                        : log.tipo === 'energy'
                          ? 'bg-amber-950/35 border-amber-500/30 text-amber-200'
                          : log.tipo === 'stock'
                            ? 'bg-sky-950/35 border-sky-500/30 text-sky-200'
                            : 'bg-slate-900/50 border-slate-800/70 text-slate-300'
                  }`}
                >
                  <span className="text-slate-500 mr-1.5">
                    [{log.fechaStr} {log.horaStr}]
                  </span>
                  <span>{log.mensaje}</span>
                </div>
              ))}
            </div>
          </div>
        </GeniePanel>
      </div>
    </div>
  );
}
