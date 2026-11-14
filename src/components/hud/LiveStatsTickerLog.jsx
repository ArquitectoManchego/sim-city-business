/**
 * Panel Permanente en Pantalla: Tarjetas de Stats por cada Negocio (Ingresos por Día,
 * Ventas, Productos Vendidos, Consumo Eléctrico), Botones de Simulación Directa de Clientes
 * y Consola de Log de Texto en Tiempo Real.
 */

import React, { useState } from 'react';
import {
  Terminal,
  DollarSign,
  ShoppingBag,
  Zap,
  UserPlus,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { useGameStore, NEGOCIOS_ACTIVOS_IDS } from '../../store/useGameStore.js';
import { NEGOCIOS_ZONES_3D } from '../../engine/ChoreographyRegistry.js';
import { PRODUCTOS_OPERATIVOS_EXTENDIDOS } from '../../shared/catalogoProductosInsumos.js';

export default function LiveStatsTickerLog() {
  const statsPorNegocio = useGameStore((s) => s.statsPorNegocio);
  const equiposRuntime = useGameStore((s) => s.equiposRuntime);
  const liveLogs = useGameStore((s) => s.liveLogs);
  const focusedNegocioId = useGameStore((s) => s.focusedNegocioId);
  const setFocusedNegocioId = useGameStore((s) => s.setFocusedNegocioId);
  const spawnCustomerNow = useGameStore((s) => s.spawnCustomerNow);

  const [filterNegocio, setFilterNegocio] = useState('ALL');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const activeNegForButtons = NEGOCIOS_ZONES_3D[focusedNegocioId]
    ? focusedNegocioId
    : 'hawaiian_paradise';
  const productosRapidos = PRODUCTOS_OPERATIVOS_EXTENDIDOS[activeNegForButtons] || [];

  // Calcular Watts instantáneos por negocio
  const wattsPorNegocio = {};
  NEGOCIOS_ACTIVOS_IDS.forEach((id) => {
    wattsPorNegocio[id] = 0;
  });
  Object.values(equiposRuntime).forEach((eq) => {
    if (wattsPorNegocio[eq.negocioId] !== undefined) {
      wattsPorNegocio[eq.negocioId] += eq.wattsActuales || 0;
    }
  });

  const logsFiltrados =
    filterNegocio === 'ALL'
      ? liveLogs
      : liveLogs.filter((l) => l.negocioId === filterNegocio || l.negocioId === 'consorcio');

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 p-3 flex flex-col gap-2">
      {/* Barra de Disparo Rápido de Clientes / Ventas Paso a Paso en el Local Enfocado */}
      <div className="pointer-events-auto flex flex-wrap items-center justify-between gap-2 bg-slate-950/90 border border-slate-800 rounded-xl px-3.5 py-2 backdrop-blur-md shadow-lg">
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
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs flex items-center gap-1"
        >
          {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          <span className="text-[11px] font-semibold">{isCollapsed ? 'Expandir Stats' : 'Compactar'}</span>
        </button>
      </div>

      {!isCollapsed && (
        <div className="pointer-events-auto grid grid-cols-1 lg:grid-cols-12 gap-2.5">
          {/* Bloque Izquierdo (7 cols): Espacio de Stats en Vivo para Cada Negocio */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {NEGOCIOS_ACTIVOS_IDS.map((negId) => {
              const zone = NEGOCIOS_ZONES_3D[negId];
              const st = statsPorNegocio[negId];
              const wattsNow = wattsPorNegocio[negId] || 0;
              const isSelected = focusedNegocioId === negId;

              return (
                <div
                  key={negId}
                  onClick={() => setFocusedNegocioId(negId)}
                  className={`cursor-pointer p-2.5 rounded-xl border backdrop-blur-md transition ${
                    isSelected
                      ? 'bg-slate-900/95 border-teal-400 shadow-lg'
                      : 'bg-slate-950/90 border-slate-800/90 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: zone.colorHex }}
                      />
                      <span className="text-xs font-bold text-white truncate">{zone.nombre}</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0">
                      {wattsNow}W
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-[11px] mt-1.5">
                    <div className="bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800/80">
                      <div className="text-[9px] text-slate-400 uppercase">Hoy / Total</div>
                      <div className="font-mono font-bold text-emerald-400 truncate">
                        ${st.ingresosHoy.toFixed(0)}{' '}
                        <span className="text-slate-400 font-normal">
                          / ${st.ingresosTotales.toFixed(0)}
                        </span>
                      </div>
                    </div>
                    <div className="bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800/80">
                      <div className="text-[9px] text-slate-400 uppercase">Ventas / Luz</div>
                      <div className="font-mono font-bold text-sky-300 truncate">
                        {st.ventasTotales} vts{' '}
                        <span className="text-amber-300 font-normal">
                          • {st.kwhAcumulados.toFixed(2)}kWh
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bloque Derecho (5 cols): Log de Texto en Vivo (Fecha, Ingresos por Día, Ventas y Eventos) */}
          <div className="lg:col-span-5 bg-slate-950/95 border border-slate-800 rounded-xl flex flex-col h-44 overflow-hidden shadow-xl">
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-bold text-teal-300">
                <Terminal className="w-3.5 h-3.5" />
                <span>Log de Simulación y Stats en Vivo</span>
              </div>
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
        </div>
      )}
    </div>
  );
}
