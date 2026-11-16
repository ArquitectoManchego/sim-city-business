/**
 * Controles Inferiores Minimizables con Animación Mac Genie:
 * 1. Panel "Simular Cliente Ahora" (minimizable con flecha hacia icono de dock).
 * 2. Panel "Log de Simulación y Stats en Vivo" (minimizable con flecha hacia botón).
 */

import React, { useState, useMemo } from 'react';
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

function seleccionarProductosRapidos(lista = [], max = 10) {
  if (lista.length <= max) return lista;
  const seleccionados = [];
  const usados = new Set();
  const categoriasVistas = new Set();
  const racksVistos = new Set();

  // 1. Priorizar variedad por categoría / mueble (ideal para catálogos grandes como ImperiArte)
  for (const prod of lista) {
    if (seleccionados.length >= max) break;
    const cat = prod.categoria || prod.tipoOperacion || 'general';
    const rack = prod.rackKey || prod.linea || prod.id;
    if (!categoriasVistas.has(cat) || !racksVistos.has(rack)) {
      seleccionados.push(prod);
      usados.add(prod.id);
      categoriasVistas.add(cat);
      racksVistos.add(rack);
    }
  }

  // 2. Completar hasta max con distribución uniforme sobre el resto del catálogo
  if (seleccionados.length < max) {
    const paso = Math.max(1, Math.floor(lista.length / max));
    for (let i = 0; i < lista.length && seleccionados.length < max; i += paso) {
      const prod = lista[i];
      if (!usados.has(prod.id)) {
        seleccionados.push(prod);
        usados.add(prod.id);
      }
    }
  }

  // 3. Relleno final si aún faltan
  for (const prod of lista) {
    if (seleccionados.length >= max) break;
    if (!usados.has(prod.id)) {
      seleccionados.push(prod);
      usados.add(prod.id);
    }
  }

  return seleccionados;
}

export default function LiveStatsTickerLog() {
  const liveLogs = useGameStore((s) => s.liveLogs);
  const focusedNegocioId = useGameStore((s) => s.focusedNegocioId);
  const setFocusedNegocioId = useGameStore((s) => s.setFocusedNegocioId);
  const spawnCustomerNow = useGameStore((s) => s.spawnCustomerNow);
  const empleadosListaPorNegocio = useGameStore((s) => s.empleadosListaPorNegocio);
  const addEmployeeToNegocio = useGameStore((s) => s.addEmployeeToNegocio);
  const removeEmployeeFromNegocio = useGameStore((s) => s.removeEmployeeFromNegocio);
  const setEmployeeLunchSlot = useGameStore((s) => s.setEmployeeLunchSlot);
  const gerenteState = useGameStore((s) => s.gerenteState);
  const commandManagerAction = useGameStore((s) => s.commandManagerAction);
  const triggerFamiliaVisit = useGameStore((s) => s.triggerFamiliaVisit);
  const setCasStudioOpen = useGameStore((s) => s.setCasStudioOpen);

  const [filterNegocio, setFilterNegocio] = useState('ALL');
  const [isSimBarMinimized, setIsSimBarMinimized] = useState(false);
  const [isLogMinimized, setIsLogMinimized] = useState(false);

  const activeNegForButtons = NEGOCIOS_ZONES_3D[focusedNegocioId]
    ? focusedNegocioId
    : 'hawaiian_paradise';
  const productosRapidos = useMemo(
    () => seleccionarProductosRapidos(PRODUCTOS_OPERATIVOS_EXTENDIDOS[activeNegForButtons] || [], 10),
    [activeNegForButtons]
  );
  const empleadosActivos = empleadosListaPorNegocio?.[activeNegForButtons] || [];

  const logsFiltrados =
    filterNegocio === 'ALL'
      ? liveLogs
      : liveLogs.filter((l) => l.negocioId === filterNegocio || l.negocioId === 'consorcio');

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 p-3 flex flex-col lg:flex-row items-end justify-between gap-2.5">
      {/* 1. Panel "Simular Cliente Ahora + Staff/Comida + Gerente/Familia" minimizable */}
      <div className="pointer-events-auto max-w-full lg:max-w-[62%] flex items-end">
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
              <span>Simular Cliente / Staff</span>
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}
        >
          <div className="flex flex-col gap-1.5 bg-slate-950/92 border border-slate-800 rounded-xl px-3.5 py-2 backdrop-blur-md shadow-xl">
            {/* Fila A: Simular Cliente + Botón Minimizar */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs">
                <UserPlus className="w-4 h-4 text-teal-400 shrink-0" />
                <span className="font-bold text-white">
                  Simular en{' '}
                  <span className="text-amber-400">{NEGOCIOS_ZONES_3D[activeNegForButtons].nombre}</span>:
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1">
                {productosRapidos.map((prod) => (
                  <button
                    key={prod.id}
                    onClick={() => {
                      setFocusedNegocioId(activeNegForButtons);
                      spawnCustomerNow(activeNegForButtons, prod.id);
                    }}
                    className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-teal-950 border border-slate-700 hover:border-teal-500/60 text-slate-200 hover:text-teal-200 text-[10px] font-semibold transition flex items-center gap-1"
                  >
                    <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                    <span className="truncate max-w-[165px]">{prod.nombre}</span>
                    <span className="text-emerald-400 font-mono">(${prod.precioVenta})</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setIsSimBarMinimized(true)}
                className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition"
                title="Esconder panel hacia icono"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Fila B: Multi-Empleado (+ Agregar Empleado / Hora Comida 1-2 ó 2-3 PM) + Gerente + Familia */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800/80 text-[10px]">
              <button
                data-testid="add-employee-btn"
                onClick={() => addEmployeeToNegocio(activeNegForButtons)}
                disabled={empleadosActivos.length >= 4}
                className="px-2 py-0.5 rounded bg-emerald-600/25 hover:bg-emerald-600/40 border border-emerald-500/50 text-emerald-200 font-bold disabled:opacity-40 transition"
              >
                + Agregar Empleado ({empleadosActivos.length}/4)
              </button>
              {empleadosActivos.length > 1 && (
                <button
                  onClick={() => removeEmployeeFromNegocio(activeNegForButtons)}
                  className="px-1.5 py-0.5 rounded bg-rose-950/50 hover:bg-rose-900/60 border border-rose-500/40 text-rose-200 font-bold"
                >
                  − Quitar
                </button>
              )}

              {empleadosActivos.map((empItem, i) => (
                <div
                  key={empItem.id}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300"
                >
                  <button
                    onClick={() => setCasStudioOpen(true, empItem.sims2Id)}
                    className="hover:text-cyan-300 font-semibold underline decoration-dotted"
                    title="Personalizar en The Sims 2 CAS"
                  >
                    #{i + 1}
                  </button>
                  <select
                    value={empItem.lunchStartHour || 13}
                    onChange={(e) => setEmployeeLunchSlot(activeNegForButtons, empItem.id, e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded px-1 py-0 text-[10px] text-amber-300"
                    title="Elección de Hora de Comida (1–2 PM o 2–3 PM)"
                  >
                    <option value={13}>🍽️ 1–2 PM</option>
                    <option value={14}>🍽️ 2–3 PM</option>
                  </select>
                </div>
              ))}

              <span className="text-slate-600">|</span>

              <button
                data-testid="mgr-supervise-btn"
                onClick={() => commandManagerAction(activeNegForButtons, 'SUPERVISE')}
                className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/50 text-amber-200 font-bold transition"
                title={gerenteState?.textoAccion}
              >
                👑 Gerente → Aquí
              </button>
              <button
                data-testid="mgr-office-btn"
                onClick={() => commandManagerAction('oficinas_consorcio', 'DESIGN_PC')}
                className="px-2 py-0.5 rounded bg-sky-500/20 hover:bg-sky-500/35 border border-sky-400/50 text-sky-200 font-bold transition"
              >
                🏢 Gerente → Oficina
              </button>
              <button
                data-testid="family-hawaiian-btn"
                onClick={() => triggerFamiliaVisit(true)}
                className="px-2 py-0.5 rounded bg-pink-500/20 hover:bg-pink-500/35 border border-pink-400/50 text-pink-200 font-bold transition"
              >
                👨‍👩‍👧‍👦 Familia Comer Hawaiian
              </button>
              <button
                data-testid="family-office-btn"
                onClick={() => triggerFamiliaVisit(false)}
                className="px-2 py-0.5 rounded bg-purple-500/20 hover:bg-purple-500/35 border border-purple-400/50 text-purple-200 font-bold transition"
              >
                📺 Familia Oficina TV+Clima
              </button>
            </div>
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
