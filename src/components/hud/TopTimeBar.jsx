/**
 * Barra Superior de Control del Tiempo, Velocidades (0x, 1x, 10x, 60x, 600x [1h=6s],
 * Saltos de Día/Semana/Mes/Año), Selector de Negocios, Medidor CFE y Accesos a Modos de Juego.
 */

import React from 'react';
import {
  Pause,
  Play,
  FastForward,
  Zap,
  Calendar,
  BarChart3,
  Sliders,
  FileText,
  Package,
  Megaphone,
  Box,
  ShieldAlert,
  Gauge,
  Building2
} from 'lucide-react';
import { useGameStore, NEGOCIOS_ACTIVOS_IDS } from '../../store/useGameStore.js';
import { useTrainingStore } from '../../store/useTrainingStore.js';
import { useSceneEditorStore } from '../../store/useSceneEditorStore.js';
import { NEGOCIOS_ZONES_3D } from '../../engine/ChoreographyRegistry.js';
import { evaluarCondicionesDemanda } from '../../engine/CustomerSpawner.js';

export default function TopTimeBar() {
  const simTimeMs = useGameStore((s) => s.simTimeMs);
  const diasSimuladosCount = useGameStore((s) => s.diasSimuladosCount);
  const timeScale = useGameStore((s) => s.timeScale);
  const setTimeScale = useGameStore((s) => s.setTimeScale);
  const simulateMacroPeriod = useGameStore((s) => s.simulateMacroPeriod);
  const focusedNegocioId = useGameStore((s) => s.focusedNegocioId);
  const setFocusedNegocioId = useGameStore((s) => s.setFocusedNegocioId);
  const setFocusedMedidorId = useGameStore((s) => s.setFocusedMedidorId);
  const campanasActivas = useGameStore((s) => s.campanasActivas);
  const escenarioGlobal = useGameStore((s) => s.escenarioGlobal);
  const equiposRuntime = useGameStore((s) => s.equiposRuntime);
  const cloudConnected = useGameStore((s) => s.cloudConnected);

  const setKpiModalOpen = useGameStore((s) => s.setKpiModalOpen);
  const setCfeReceiptModalOpen = useGameStore((s) => s.setCfeReceiptModalOpen);
  const setInventoryDrawerOpen = useGameStore((s) => s.setInventoryDrawerOpen);
  const setMarketingModalOpen = useGameStore((s) => s.setMarketingModalOpen);

  const setTrainingMode = useTrainingStore((s) => s.setTrainingMode);
  const setImporterModalOpen = useSceneEditorStore((s) => s.setImporterModalOpen);
  const setCollisionToolOpen = useSceneEditorStore((s) => s.setCollisionToolOpen);
  const isCollisionToolOpen = useSceneEditorStore((s) => s.isCollisionToolOpen);

  const simDate = new Date(simTimeMs);
  const cond = evaluarCondicionesDemanda(simDate, campanasActivas, escenarioGlobal);

  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const fechaFormateada = `${diasSemana[simDate.getDay()]} ${String(simDate.getDate()).padStart(2, '0')} ${meses[simDate.getMonth()]} ${simDate.getFullYear()}`;
  const horaFormateada = `${String(simDate.getHours()).padStart(2, '0')}:${String(simDate.getMinutes()).padStart(2, '0')}:${String(simDate.getSeconds()).padStart(2, '0')}`;

  // Calcular potencia eléctrica instantánea total en vivo
  const totalWattsAhora = Object.values(equiposRuntime).reduce(
    (acc, eq) => acc + (eq.wattsActuales || 0),
    0
  );

  const speedButtons = [
    { scale: 0, label: 'Pausa', icon: Pause },
    { scale: 1, label: '1x Tiempo Real', icon: Play },
    { scale: 10, label: '10x', icon: FastForward },
    { scale: 60, label: '60x (1m/s)', icon: FastForward },
    { scale: 600, label: '600x (1h=6s)', icon: Zap }
  ];

  return (
    <header className="pointer-events-auto relative z-20 bg-slate-950/90 border-b border-slate-800/90 backdrop-blur-md px-3 py-2 flex flex-col gap-2 shadow-xl">
      {/* Fila 1: Reloj, Clima/Quincena, Controles de Velocidad y Saltos de Tiempo Macro */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Identidad, Reloj y Estado Ambiental */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 pr-2 border-r border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-amber-500 flex items-center justify-center text-slate-950 font-black text-sm shadow">
              3D
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-extrabold text-xs tracking-wide text-white">
                  SIM CITY BUSINESS
                </span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                    cloudConnected
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {cloudConnected ? '⚡ Sync Eléctrico Alacio' : 'Local Mode'}
                </span>
              </div>
              <div className="text-[10px] text-slate-400">
                Consorcio Gallegos González • Día #{diasSimuladosCount}
              </div>
            </div>
          </div>

          {/* Reloj Digital y Badges de Condiciones */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1">
            <Calendar className="w-3.5 h-3.5 text-teal-400" />
            <div className="font-mono text-xs">
              <span className="font-bold text-white">{fechaFormateada}</span>
              <span className="mx-1.5 text-slate-600">|</span>
              <span className="font-bold text-teal-300">{horaFormateada}</span>
            </div>
            {cond.esQuincena && (
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                💵 Quincena (+38%)
              </span>
            )}
            {cond.eventoPrincipal && (
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold hidden xl:inline">
                🎉 {cond.eventoPrincipal.nombre}
              </span>
            )}
          </div>
        </div>

        {/* Botones de Velocidad en Tiempo Real y Alta Velocidad (1h = 6s) */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          {speedButtons.map((btn) => {
            const Icon = btn.icon;
            const active = timeScale === btn.scale;
            return (
              <button
                key={btn.scale}
                onClick={() => setTimeScale(btn.scale)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                  active
                    ? 'bg-teal-500 text-slate-950 shadow'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{btn.label}</span>
              </button>
            );
          })}

          <div className="h-4 w-px bg-slate-700 mx-1" />

          {/* Botones de Simulación Macro (1 Hora, 1 Día, 1 Semana, 1 Mes, 1 Año) */}
          {[
            { id: 'hour', label: '+1 Hora' },
            { id: 'day', label: '+1 Día' },
            { id: 'week', label: '+1 Semana' },
            { id: 'month', label: '+1 Mes' },
            { id: 'year', label: '+1 Año' }
          ].map((macro) => (
            <button
              key={macro.id}
              onClick={() => simulateMacroPeriod(macro.id)}
              className="px-2 py-1 rounded-lg bg-indigo-950/80 hover:bg-indigo-800 border border-indigo-500/40 text-indigo-200 text-[10px] font-bold transition"
              title={`Simular ${macro.label} y registrar resultados en el Log`}
            >
              {macro.label}
            </button>
          ))}
        </div>

        {/* Indicador de Carga Eléctrica Instantánea y Accesos Rápidos */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setKpiModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow transition"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Visión de Stats / KPIs ({(totalWattsAhora / 1000).toFixed(2)} kW)</span>
          </button>

          <button
            onClick={() =>
              setTrainingMode(
                true,
                NEGOCIOS_ZONES_3D[focusedNegocioId] ? focusedNegocioId : 'hawaiian_paradise'
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow transition"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Entrenar Trabajador (Sliders)</span>
          </button>

          <button
            onClick={() => setCfeReceiptModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-200 font-bold text-xs transition"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>Recibo CFE</span>
          </button>
        </div>
      </div>

      {/* Fila 2: Navegación 3D por Local Comercial, Medidor CFE y Herramientas SketchUp / Stock */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/70">
        {/* Píldoras de Enfoque de Cámara a cada Negocio */}
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => setFocusedNegocioId('ALL_CONSORCIO')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
              focusedNegocioId === 'ALL_CONSORCIO'
                ? 'bg-slate-200 text-slate-950'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Building2 className="w-3 h-3" />
            <span>Vista General (6 Negocios)</span>
          </button>

          {NEGOCIOS_ACTIVOS_IDS.map((nId) => {
            const z = NEGOCIOS_ZONES_3D[nId];
            const active = focusedNegocioId === nId;
            return (
              <button
                key={nId}
                onClick={() => setFocusedNegocioId(nId)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition border ${
                  active
                    ? 'bg-slate-800 text-white border-teal-400 shadow'
                    : 'bg-slate-900/70 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: z.colorHex }}
                />
                <span>{z.nombre}</span>
              </button>
            );
          })}

          <button
            onClick={() => setFocusedMedidorId('med_3')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition border ${
              focusedNegocioId === 'CFE_METER_INSPECT'
                ? 'bg-teal-500 text-slate-950 border-teal-300'
                : 'bg-slate-900 text-teal-300 border-teal-500/40 hover:bg-slate-800'
            }`}
          >
            <Gauge className="w-3 h-3" />
            <span>🔍 Ver Medidor de Luz 3D</span>
          </button>
        </div>

        {/* Herramientas de Inventario, Campañas, Modelos SketchUp (.skp) y Colisiones */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setInventoryDrawerOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-sky-300 text-[11px] font-semibold transition"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Stock Materia Prima</span>
          </button>

          <button
            onClick={() => setMarketingModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-pink-300 text-[11px] font-semibold transition"
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Campañas y Fechas</span>
          </button>

          <button
            onClick={() => setImporterModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-300 text-[11px] font-semibold transition"
          >
            <Box className="w-3.5 h-3.5" />
            <span>Modelos .SKP / 3D</span>
          </button>

          <button
            onClick={() => setCollisionToolOpen(!isCollisionToolOpen)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition ${
              isCollisionToolOpen
                ? 'bg-rose-600 text-white border-rose-400'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-rose-300'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Pisos, Muros y Colisiones</span>
          </button>
        </div>
      </div>
    </header>
  );
}
