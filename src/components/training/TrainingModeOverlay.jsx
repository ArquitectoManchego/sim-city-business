/**
 * Interfaz del Modo de Juego "Entrenamiento del Trabajador" (Worker Training & Energy Debugging).
 * Permite observar al empleado 3D ejecutar paso a paso cada receta propuesta por la IA
 * y micro-administrar con Sliders el tiempo que permanece encendida cada máquina eléctrica.
 */

import React from 'react';
import {
  Sparkles,
  Play,
  Pause,
  Save,
  Sliders,
  Zap,
  Clock,
  CheckCircle2,
  X,
  Cpu,
  Package,
  SkipForward
} from 'lucide-react';
import { useTrainingStore } from '../../store/useTrainingStore.js';
import { useGameStore, NEGOCIOS_ACTIVOS_IDS, EQUIPOS_OPERATIVOS_BASE } from '../../store/useGameStore.js';
import { NEGOCIOS_ZONES_3D, RECETAS_COREOGRAFICAS_DETALLADAS } from '../../engine/ChoreographyRegistry.js';
import {
  PRODUCTOS_OPERATIVOS_EXTENDIDOS,
  MATERIAS_PRIMAS_POR_NEGOCIO
} from '../../shared/catalogoProductosInsumos.js';

export default function TrainingModeOverlay() {
  const isTrainingMode = useTrainingStore((s) => s.isTrainingMode);
  const setTrainingMode = useTrainingStore((s) => s.setTrainingMode);
  const selectedNegocioId = useTrainingStore((s) => s.selectedNegocioId);
  const selectNegocioForTraining = useTrainingStore((s) => s.selectNegocioForTraining);
  const selectedProductId = useTrainingStore((s) => s.selectedProductId);
  const selectProductForTraining = useTrainingStore((s) => s.selectProductForTraining);
  const activeStepIndex = useTrainingStore((s) => s.activeStepIndex);
  const stepElapsedSec = useTrainingStore((s) => s.stepElapsedSec);
  const isPlayingDemo = useTrainingStore((s) => s.isPlayingDemo);
  const togglePlayDemo = useTrainingStore((s) => s.togglePlayDemo);
  const setStepIndex = useTrainingStore((s) => s.setStepIndex);
  const recetasEntrenadas = useTrainingStore((s) => s.recetasEntrenadas);
  const updateStepDurationSlider = useTrainingStore((s) => s.updateStepDurationSlider);
  const updateStepMachineSettings = useTrainingStore((s) => s.updateStepMachineSettings);
  const generateAIProposal = useTrainingStore((s) => s.generateAIProposalForCurrentProduct);
  const isGeneratingAI = useTrainingStore((s) => s.isGeneratingAI);
  const saveTraining = useTrainingStore((s) => s.saveTrainingToElectricoAlacio);
  const lastSavedMessage = useTrainingStore((s) => s.lastSavedMessage);

  if (!isTrainingMode) return null;

  const productosDelNegocio = PRODUCTOS_OPERATIVOS_EXTENDIDOS[selectedNegocioId] || [];
  const equiposDelNegocio = Object.values(EQUIPOS_OPERATIVOS_BASE).filter(
    (e) => e.negocioId === selectedNegocioId
  );
  const insumosDelNegocio = MATERIAS_PRIMAS_POR_NEGOCIO[selectedNegocioId] || [];

  const recetaActual =
    recetasEntrenadas[selectedProductId] ||
    RECETAS_COREOGRAFICAS_DETALLADAS[selectedProductId] ||
    RECETAS_COREOGRAFICAS_DETALLADAS.hp_raspado;

  const pasos = recetaActual.pasos || [];
  const pasoActivo = pasos[activeStepIndex] || pasos[0];

  // Calcular métricas totales en vivo según los sliders actuales
  let totalSegundosReceta = 0;
  let totalSegundosMaquina = 0;
  let totalWhUnidad = 0;

  pasos.forEach((p) => {
    const dur = parseFloat(p.duracionSegundos) || 0;
    totalSegundosReceta += dur;
    if (p.equipoKey && p.estadoEquipo !== 'OFF') {
      totalSegundosMaquina += dur;
      const wEfectivos = (parseFloat(p.wattsNominales) || 0) * (parseFloat(p.factorPotencia) ?? 1.0);
      totalWhUnidad += (wEfectivos * dur) / 3600;
    }
  });

  const costoLuzUnitarioMxn = (totalWhUnidad / 1000) * 3.45; // Tarifa comercial/marginal promedio CFE
  const capacidadUnidadesHora = totalSegundosReceta > 0 ? Math.floor(3600 / totalSegundosReceta) : 0;

  return (
    <div className="pointer-events-none fixed inset-0 z-30 flex flex-col justify-between p-4">
      {/* Barra Superior del Modo Entrenamiento */}
      <div className="pointer-events-auto flex flex-wrap items-center justify-between gap-3 bg-slate-950/95 border border-amber-500/50 rounded-2xl px-5 py-3 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500 text-slate-950">
                Modo Entrenamiento del Trabajador
              </span>
              <span className="text-sm font-bold text-white">
                Depuración Paso a Paso de Procesos y Consumo de Máquinas
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Observa al empleado en 3D (Tiempo Real 1x) y ajusta con los sliders cuánto tiempo dura encendido cada equipo eléctrico
            </p>
          </div>
        </div>

        {/* Selectores de Negocio y Producto a Entrenar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedNegocioId}
            onChange={(e) => selectNegocioForTraining(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-white"
          >
            {NEGOCIOS_ACTIVOS_IDS.map((nId) => (
              <option key={nId} value={nId}>
                🏢 {NEGOCIOS_ZONES_3D[nId].nombre}
              </option>
            ))}
          </select>

          <select
            value={selectedProductId}
            onChange={(e) => selectProductForTraining(e.target.value)}
            className="bg-slate-900 border border-amber-500/50 rounded-xl px-3 py-1.5 text-xs font-semibold text-amber-200"
          >
            {productosDelNegocio.map((prod) => (
              <option key={prod.id} value={prod.id}>
                🎯 {prod.nombre} (${prod.precioVenta})
              </option>
            ))}
          </select>

          <button
            onClick={() => setTrainingMode(false)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition"
          >
            <X className="w-4 h-4" />
            <span>Salir al Juego</span>
          </button>
        </div>
      </div>

      {/* Zona Central: Panel Derecho de Sliders de Tiempos y Máquinas */}
      <div className="flex-1 flex justify-end items-stretch py-3 overflow-hidden">
        <div className="pointer-events-auto w-full max-w-md bg-slate-950/92 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-md flex flex-col overflow-hidden">
          {/* Resumen Energético y Operativo de la Receta */}
          <div className="p-4 bg-slate-900/90 border-b border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Receta Propuesta por IA & Sliders
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={isGeneratingAI}
                  onClick={() => generateAIProposal('equilibrado', equiposDelNegocio, insumosDelNegocio)}
                  className="px-2 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-400/40 text-indigo-200 text-[11px] font-semibold flex items-center gap-1 transition"
                  title="Pedir a la IA tiempos estándar ergonómicos"
                >
                  <Sparkles className="w-3 h-3" />
                  IA Base
                </button>
                <button
                  disabled={isGeneratingAI}
                  onClick={() => generateAIProposal('ahorro_energia', equiposDelNegocio, insumosDelNegocio)}
                  className="px-2 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-400/40 text-emerald-200 text-[11px] font-semibold flex items-center gap-1 transition"
                  title="Optimizar con IA para mínimo consumo eléctrico CFE"
                >
                  <Zap className="w-3 h-3" />
                  IA Ahorro Luz
                </button>
                <button
                  disabled={isGeneratingAI}
                  onClick={() => generateAIProposal('maxima_velocidad', equiposDelNegocio, insumosDelNegocio)}
                  className="px-2 py-1 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 border border-amber-400/40 text-amber-200 text-[11px] font-semibold flex items-center gap-1 transition"
                  title="Optimizar con IA para hora pico rápida"
                >
                  <Clock className="w-3 h-3" />
                  IA Rápido
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400">Tiempo Total</div>
                <div className="text-sm font-bold text-white">{totalSegundosReceta.toFixed(0)}s</div>
              </div>
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400">Máquina ON</div>
                <div className="text-sm font-bold text-amber-400">{totalSegundosMaquina.toFixed(0)}s</div>
              </div>
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400">Energía/Unid.</div>
                <div className="text-sm font-bold text-teal-400">{totalWhUnidad.toFixed(2)} Wh</div>
              </div>
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400">Costo Luz/U</div>
                <div className="text-sm font-bold text-emerald-400">${costoLuzUnitarioMxn.toFixed(3)}</div>
              </div>
            </div>

            {lastSavedMessage && (
              <div className="px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{lastSavedMessage}</span>
              </div>
            )}
          </div>

          {/* Lista de Pasos con Sliders de Tiempo y Potencia */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {pasos.map((paso, idx) => {
              const isCurrent = idx === activeStepIndex;
              const hasMachine = !!paso.equipoKey;
              const whPaso =
                hasMachine && paso.estadoEquipo !== 'OFF'
                  ? (((paso.wattsNominales || 0) * (paso.factorPotencia ?? 1.0) * (paso.duracionSegundos || 0)) / 3600)
                  : 0;

              return (
                <div
                  key={paso.id}
                  onClick={() => setStepIndex(idx)}
                  className={`p-3 rounded-xl border transition cursor-pointer ${
                    isCurrent
                      ? 'bg-amber-950/35 border-amber-500/80 shadow-lg'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 ${
                          isCurrent ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {paso.orden}
                      </span>
                      <span className="text-xs font-bold text-white leading-snug">{paso.titulo}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-300 shrink-0">
                      {Number(paso.duracionSegundos).toFixed(1)}s
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">{paso.descripcion}</p>

                  {/* Slider de Duración del Paso */}
                  <div className="space-y-1 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-300 font-medium">
                        {hasMachine ? '⚡ Tiempo de Máquina / Paso:' : '⏱️ Tiempo de Acción Manual:'}
                      </span>
                      <span className="text-teal-300 font-mono font-semibold">
                        {Number(paso.duracionSegundos).toFixed(1)} seg
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max={hasMachine ? '180' : '60'}
                      step="0.5"
                      value={paso.duracionSegundos}
                      onChange={(e) => updateStepDurationSlider(selectedProductId, paso.id, e.target.value)}
                      className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                    />

                    {/* Si el paso involucra una máquina eléctrica, mostrar Slider de Potencia y Toggle de Apagado */}
                    {hasMachine && (
                      <div className="pt-2 mt-2 border-t border-slate-800/80 space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="flex items-center gap-1 text-amber-300 font-semibold">
                            <Cpu className="w-3.5 h-3.5" />
                            {paso.equipoKey} ({paso.wattsNominales}W)
                          </span>
                          <span className="text-emerald-300 font-mono">
                            {whPaso.toFixed(2)} Wh
                          </span>
                        </div>

                        {paso.estadoEquipo !== 'OFF' && (
                          <div>
                            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                              <span>Factor de Carga / Potencia Activa</span>
                              <span>{Math.round((paso.factorPotencia ?? 1.0) * 100)}% ({Math.round((paso.wattsNominales || 0) * (paso.factorPotencia ?? 1.0))}W)</span>
                            </div>
                            <input
                              type="range"
                              min="0.1"
                              max="1.0"
                              step="0.05"
                              value={paso.factorPotencia ?? 1.0}
                              onChange={(e) =>
                                updateStepMachineSettings(selectedProductId, paso.id, {
                                  factorPotencia: parseFloat(e.target.value)
                                })
                              }
                              className="w-full accent-teal-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                            />
                          </div>
                        )}

                        <label className="flex items-center justify-between text-[11px] text-slate-300 pt-0.5 cursor-pointer">
                          <span>Apagar aparato al concluir este paso</span>
                          <input
                            type="checkbox"
                            checked={!!paso.apagarAlFinal}
                            onChange={(e) =>
                              updateStepMachineSettings(selectedProductId, paso.id, {
                                apagarAlFinal: e.target.checked
                              })
                            }
                            className="rounded accent-teal-500"
                          />
                        </label>
                      </div>
                    )}

                    {paso.insumoId && (
                      <div className="flex items-center gap-1.5 text-[10px] text-sky-300 pt-1">
                        <Package className="w-3 h-3" />
                        <span>
                          Materia prima consumida: <strong>{paso.insumoId}</strong> (-{paso.cantidadInsumo})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Botón de Guardado y Sincronización Bidireccional */}
          <div className="p-4 bg-slate-900 border-t border-slate-800">
            <button
              onClick={saveTraining}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-teal-500 hover:from-amber-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-lg transition"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Entrenamiento y Sincronizar con Eléctrico Alacio</span>
            </button>
          </div>
        </div>
      </div>

      {/* Barra Inferior: Timeline Cinemático Paso a Paso del Empleado */}
      <div className="pointer-events-auto bg-slate-950/95 border border-slate-800 rounded-2xl px-5 py-3 shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-2.5">
            <button
              onClick={togglePlayDemo}
              className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition"
            >
              {isPlayingDemo ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setStepIndex((activeStepIndex + 1) % pasos.length)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
              title="Siguiente Paso"
            >
              <SkipForward className="w-4 h-4" />
            </button>
            <div>
              <div className="text-xs font-bold text-white">
                Paso Activo {pasoActivo?.orden || 1} de {pasos.length}:{' '}
                <span className="text-amber-400">{pasoActivo?.titulo}</span>
              </div>
              <div className="text-[11px] text-slate-400">{pasoActivo?.descripcion}</div>
            </div>
          </div>

          <div className="text-right font-mono text-xs">
            <span className="text-teal-400 font-bold">{stepElapsedSec.toFixed(1)}s</span>
            <span className="text-slate-500"> / {Number(pasoActivo?.duracionSegundos || 1).toFixed(1)}s</span>
            <div className="text-[10px] text-slate-400">
              Capacidad: ~{capacidadUnidadesHora} {recetaActual.nombreProducto?.split(' ')[0]}/hora
            </div>
          </div>
        </div>

        {/* Píldoras de la Línea de Tiempo */}
        <div className="grid grid-cols-6 md:grid-cols-12 gap-1.5">
          {pasos.map((p, i) => {
            const active = i === activeStepIndex;
            const pct = active
              ? Math.min(100, (stepElapsedSec / Math.max(1, p.duracionSegundos)) * 100)
              : i < activeStepIndex
                ? 100
                : 0;
            return (
              <button
                key={p.id}
                onClick={() => setStepIndex(i)}
                className={`relative h-7 rounded-lg border text-[10px] font-bold overflow-hidden transition ${
                  active
                    ? 'border-amber-400 text-white bg-slate-900'
                    : 'border-slate-800 text-slate-400 bg-slate-900/50 hover:border-slate-700'
                }`}
                title={`${p.orden}. ${p.titulo} (${p.duracionSegundos}s)`}
              >
                <div
                  className={`absolute inset-y-0 left-0 transition-all duration-75 ${
                    active ? 'bg-amber-500/40' : 'bg-teal-500/20'
                  }`}
                  style={{ width: `${pct}%` }}
                />
                <span className="relative z-10 px-1 truncate block">
                  #{p.orden} {p.equipoKey ? '⚡' : ''}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
