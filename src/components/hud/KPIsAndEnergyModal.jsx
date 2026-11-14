/**
 * Modal "Visión de Stats": Dashboard de KPIs Financieros, Ventas por Producto,
 * Consumo Eléctrico Actual, Estado de Aparatos Conectados e Interruptores Manuales ON/OFF.
 */

import React, { useState } from 'react';
import {
  X,
  BarChart3,
  Zap,
  Power,
  DollarSign,
  TrendingUp,
  Cpu,
  Calendar,
  Sliders
} from 'lucide-react';
import { useGameStore, NEGOCIOS_ACTIVOS_IDS } from '../../store/useGameStore.js';
import { useTrainingStore } from '../../store/useTrainingStore.js';
import { NEGOCIOS_ZONES_3D } from '../../engine/ChoreographyRegistry.js';
import { PRODUCTOS_OPERATIVOS_EXTENDIDOS } from '../../shared/catalogoProductosInsumos.js';
import { calcularNominaNegocio } from '../../shared/nominaYTurnosNegocios.js';

export default function KPIsAndEnergyModal() {
  const isOpen = useGameStore((s) => s.isKpiModalOpen);
  const setOpen = useGameStore((s) => s.setKpiModalOpen);
  const statsPorNegocio = useGameStore((s) => s.statsPorNegocio);
  const equiposRuntime = useGameStore((s) => s.equiposRuntime);
  const setEquipmentControlMode = useGameStore((s) => s.setEquipmentControlMode);
  const historialDiario = useGameStore((s) => s.historialDiario);
  const diasSimuladosCount = useGameStore((s) => s.diasSimuladosCount);
  const setTrainingMode = useTrainingStore((s) => s.setTrainingMode);

  const [activeTab, setActiveTab] = useState('kpis'); // 'kpis' | 'appliances' | 'daily_history'
  const [selectedNegocioFilter, setSelectedNegocioFilter] = useState('ALL');

  if (!isOpen) return null;

  // Totales Consolidados del Consorcio
  let ingresosConsorcio = 0;
  let costoInsumosConsorcio = 0;
  let kwhConsorcio = 0;
  let ventasConsorcio = 0;

  NEGOCIOS_ACTIVOS_IDS.forEach((nId) => {
    const st = statsPorNegocio[nId];
    ingresosConsorcio += st.ingresosTotales || 0;
    costoInsumosConsorcio += st.costoInsumosTotales || 0;
    kwhConsorcio += st.kwhAcumulados || 0;
    ventasConsorcio += st.ventasTotales || 0;
  });

  const costoLuzEstimado = kwhConsorcio * 3.35;
  const utilidadOperativa = ingresosConsorcio - costoInsumosConsorcio - costoLuzEstimado;
  const margenPct = ingresosConsorcio > 0 ? (utilidadOperativa / ingresosConsorcio) * 100 : 0;

  const listaEquipos = Object.values(equiposRuntime).filter(
    (eq) => selectedNegocioFilter === 'ALL' || eq.negocioId === selectedNegocioFilter
  );

  const wattsActivosTotales = listaEquipos.reduce((acc, eq) => acc + (eq.wattsActuales || 0), 0);
  const equiposEncendidosCount = listaEquipos.filter((eq) => (eq.wattsActuales || 0) > 0).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div style={{ transformOrigin: 'top right' }} className="genie-enter-top bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Visión de Stats, KPIs Financieros y Control de Aparatos Eléctricos
              </h2>
              <p className="text-xs text-slate-400">
                Monitoreo consolidado en tiempo real ({diasSimuladosCount} días simulados) • Sincronizado con Eléctrico Alacio
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {[
              { id: 'kpis', label: '📊 KPIs y Ventas por Negocio' },
              { id: 'appliances', label: `⚡ Aparatos Conectados (${equiposEncendidosCount} ON)` },
              { id: 'daily_history', label: '📅 Ingresos por Día' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  activeTab === tab.id
                    ? 'bg-teal-500 text-slate-950 shadow'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}

            <button
              onClick={() => setOpen(false)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Tarjetas Superiores de KPIs Globales */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="text-[11px] text-slate-400 uppercase font-semibold">Ingresos Totales</div>
              <div className="text-xl font-extrabold text-emerald-400 font-mono mt-1">
                ${ingresosConsorcio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">{ventasConsorcio} ventas cerradas</div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="text-[11px] text-slate-400 uppercase font-semibold">Costo Materia Prima</div>
              <div className="text-xl font-extrabold text-sky-400 font-mono mt-1">
                ${costoInsumosConsorcio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Insumos y reabastecimiento</div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="text-[11px] text-slate-400 uppercase font-semibold">Consumo Eléctrico</div>
              <div className="text-xl font-extrabold text-amber-400 font-mono mt-1">
                {kwhConsorcio.toFixed(2)} kWh
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Costo CFE est.: ${costoLuzEstimado.toFixed(2)}
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="text-[11px] text-slate-400 uppercase font-semibold">Potencia Actual</div>
              <div className="text-xl font-extrabold text-teal-400 font-mono mt-1">
                {wattsActivosTotales.toLocaleString()} W
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {(wattsActivosTotales / 1000).toFixed(2)} kW instantáneos
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/40">
              <div className="text-[11px] text-emerald-300 uppercase font-semibold">Utilidad Bruta / Margen</div>
              <div className="text-xl font-extrabold text-white font-mono mt-1">
                ${utilidadOperativa.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">
                Margen Operativo: {margenPct.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* PESTAÑA 1: KPIs Y PRODUCTOS VENDIDOS POR NEGOCIO */}
          {activeTab === 'kpis' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {NEGOCIOS_ACTIVOS_IDS.map((negId) => {
                const zone = NEGOCIOS_ZONES_3D[negId];
                const st = statsPorNegocio[negId];
                const nominaInfo = calcularNominaNegocio({ negocioId: negId });
                const prodsCatalogo = PRODUCTOS_OPERATIVOS_EXTENDIDOS[negId] || [];
                const utilidadNeg = st.ingresosTotales - st.costoInsumosTotales - st.kwhAcumulados * 3.35;

                return (
                  <div
                    key={negId}
                    className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: zone.colorHex }}
                        />
                        <div>
                          <h3 className="text-sm font-bold text-white">{zone.nombre}</h3>
                          <p className="text-[11px] text-slate-400">{zone.subtitulo}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setOpen(false);
                          setTrainingMode(true, negId);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-bold flex items-center gap-1"
                      >
                        <Sliders className="w-3 h-3" />
                        Entrenar Tiempos
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div className="bg-slate-900 p-2 rounded-lg">
                        <span className="text-[10px] text-slate-400 block">Ingresos Hoy</span>
                        <span className="font-mono font-bold text-emerald-400">
                          ${st.ingresosHoy.toFixed(2)}
                        </span>
                      </div>
                      <div className="bg-slate-900 p-2 rounded-lg">
                        <span className="text-[10px] text-slate-400 block">Acumulado</span>
                        <span className="font-mono font-bold text-white">
                          ${st.ingresosTotales.toFixed(2)}
                        </span>
                      </div>
                      <div className="bg-slate-900 p-2 rounded-lg">
                        <span className="text-[10px] text-slate-400 block">Ventas / Luz</span>
                        <span className="font-mono font-bold text-amber-300">
                          {st.ventasTotales} • {st.kwhAcumulados.toFixed(2)}kWh
                        </span>
                      </div>
                      <div className="bg-slate-900 p-2 rounded-lg">
                        <span className="text-[10px] text-slate-400 block">Utilidad</span>
                        <span className="font-mono font-bold text-teal-300">
                          ${utilidadNeg.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Desglose de Productos Vendidos */}
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Desglose de Productos Vendidos:
                      </div>
                      <div className="space-y-1">
                        {prodsCatalogo.map((prod) => {
                          const cant = st.productosVendidosCount[prod.id] || 0;
                          return (
                            <div
                              key={prod.id}
                              className="flex items-center justify-between text-xs bg-slate-900/60 px-2.5 py-1 rounded border border-slate-800/60"
                            >
                              <span className="text-slate-200 truncate">{prod.nombre}</span>
                              <div className="flex items-center gap-3 font-mono shrink-0">
                                <span className="text-sky-300 font-bold">{cant} u.</span>
                                <span className="text-emerald-400">
                                  ${(cant * prod.precioVenta).toFixed(0)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/70">
                      <span>
                        Plantilla Nómina: {nominaInfo.totalEmpleados} empleado(s) (${nominaInfo.totalGastoLaboral.toFixed(0)}/mes)
                      </span>
                      {negId === 'imperia_uniformes' && (
                        <span className="text-rose-300">
                          Probador sin compra: {st.clientesSinCompra}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* PESTAÑA 2: MONITOR DE APARATOS CONECTADOS E INTERRUPTORES ON/OFF */}
          {activeTab === 'appliances' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-300">
                  Juega con encender (`ON`), apagar (`OFF`) o dejar en automático por receta (`AUTO`) cualquier aparato eléctrico para ver cuánto consume en tiempo real.
                </div>
                <select
                  value={selectedNegocioFilter}
                  onChange={(e) => setSelectedNegocioFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                >
                  <option value="ALL">Todos los Locales ({Object.keys(equiposRuntime).length} equipos)</option>
                  {NEGOCIOS_ACTIVOS_IDS.map((nId) => (
                    <option key={nId} value={nId}>
                      {NEGOCIOS_ZONES_3D[nId].nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {listaEquipos.map((eq) => {
                  const isWorking = eq.wattsActuales > 0;
                  const minutosEncendido = (eq.segundosEncendidoTotal / 60).toFixed(1);
                  return (
                    <div
                      key={eq.key}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition ${
                        isWorking
                          ? 'bg-slate-950 border-teal-500/60 shadow-md'
                          : 'bg-slate-950/60 border-slate-800'
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                              isWorking ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'
                            }`}
                          />
                          <span className="text-xs font-bold text-white truncate">{eq.nombre}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2">
                          <span className="text-teal-300 font-semibold">
                            {NEGOCIOS_ZONES_3D[eq.negocioId]?.nombre}
                          </span>
                          <span>•</span>
                          <span className="font-mono text-amber-300">
                            {eq.wattsActuales}W / {eq.wattsNominal}W nom.
                          </span>
                          <span>•</span>
                          <span className="font-mono">
                            {minutosEncendido} min ON ({eq.kwhAcumulados.toFixed(3)} kWh)
                          </span>
                          <span>•</span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono">
                            {eq.medidorId.toUpperCase()} (Fase {eq.fase})
                          </span>
                        </div>
                      </div>

                      {/* Botones Manuales ON / AUTO / OFF */}
                      <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0">
                        {[
                          { mode: 'MANUAL_ON', label: 'ON', activeClass: 'bg-emerald-500 text-slate-950' },
                          { mode: 'AUTO', label: 'AUTO', activeClass: 'bg-sky-500 text-slate-950' },
                          { mode: 'MANUAL_OFF', label: 'OFF', activeClass: 'bg-rose-600 text-white' }
                        ].map((b) => (
                          <button
                            key={b.mode}
                            onClick={() => setEquipmentControlMode(eq.key, b.mode)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition ${
                              eq.controlMode === b.mode
                                ? b.activeClass
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {b.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PESTAÑA 3: HISTORIAL DE INGRESOS POR DÍA DE CADA NEGOCIO */}
          {activeTab === 'daily_history' && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 text-xs font-bold text-white">
                Registro Histórico de Ingresos por Día y por Unidad de Negocio ({historialDiario.length} cierres diarios)
              </div>
              {historialDiario.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  Usa los botones <strong>+1 Día</strong>, <strong>+1 Semana</strong>, <strong>+1 Mes</strong> o <strong>+1 Año</strong> en la barra superior para poblar la tabla histórica de cierres diarios.
                </div>
              ) : (
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                        <th className="py-2.5 px-3">Fecha</th>
                        {NEGOCIOS_ACTIVOS_IDS.map((nId) => (
                          <th key={nId} className="py-2.5 px-3">
                            {NEGOCIOS_ZONES_3D[nId].nombre}
                          </th>
                        ))}
                        <th className="py-2.5 px-3 text-emerald-400">Total Día</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70 font-mono">
                      {historialDiario.map((row, idx) => {
                        const totalFila = NEGOCIOS_ACTIVOS_IDS.reduce(
                          (acc, nId) => acc + (row.porNegocio[nId]?.ingresos || 0),
                          0
                        );
                        return (
                          <tr key={idx} className="hover:bg-slate-900/50">
                            <td className="py-2 px-3 font-bold text-white">{row.fecha}</td>
                            {NEGOCIOS_ACTIVOS_IDS.map((nId) => (
                              <td key={nId} className="py-2 px-3 text-slate-300">
                                ${(row.porNegocio[nId]?.ingresos || 0).toFixed(0)}{' '}
                                <span className="text-[10px] text-slate-500">
                                  ({row.porNegocio[nId]?.ventas || 0}v)
                                </span>
                              </td>
                            ))}
                            <td className="py-2 px-3 font-bold text-emerald-400">
                              ${totalFila.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
