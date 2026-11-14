/**
 * Modal de Recibo de Luz CFE Simulado e Inspección de Medidores (med_1 a med_6).
 * Calcula tanto el consumo real acumulado hasta el minuto actual como la proyección mensual/bimestral
 * usando las tarifas escalonadas y MEM de simuladorCFE.js de Eléctrico Alacio.
 */

import React, { useState } from 'react';
import { X, FileText, Gauge, Zap, Eye } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore.js';
import { calcularCobroCFECompleto } from '../../shared/simuladorCFE.js';
import { NEGOCIOS_ZONES_3D } from '../../engine/ChoreographyRegistry.js';

export default function CFEReceiptModal() {
  const isOpen = useGameStore((s) => s.isCfeReceiptModalOpen);
  const setOpen = useGameStore((s) => s.setCfeReceiptModalOpen);
  const medidores = useGameStore((s) => s.medidores);
  const equiposRuntime = useGameStore((s) => s.equiposRuntime);
  const diasSimuladosCount = useGameStore((s) => s.diasSimuladosCount);
  const setFocusedMedidorId = useGameStore((s) => s.setFocusedMedidorId);

  const [selectedMedidor, setSelectedMedidor] = useState('ALL');
  const [modoProyeccion, setModoProyeccion] = useState('proyeccion_mes'); // 'proyeccion_mes' | 'acumulado_actual'

  if (!isOpen) return null;

  const equiposFiltrados = Object.values(equiposRuntime).filter(
    (eq) => selectedMedidor === 'ALL' || eq.medidorId === selectedMedidor
  );

  const kwhAcumuladosReales = equiposFiltrados.reduce(
    (acc, eq) => acc + (eq.kwhAcumulados || 0),
    0
  );
  const wattsInstantaneos = equiposFiltrados.reduce(
    (acc, eq) => acc + (eq.wattsActuales || 0),
    0
  );

  // Si aún se han simulado pocos minutos, proyectar el mes (30 días) combinando la tasa acumulada y la carga activa
  const factorDias = Math.max(0.05, diasSimuladosCount);
  const kwhProyectadosMes = Math.max(
    kwhAcumuladosReales * (30 / factorDias),
    (wattsInstantaneos / 1000) * 8.5 * 26
  );

  const kwhParaFactura =
    modoProyeccion === 'proyeccion_mes' ? kwhProyectadosMes : kwhAcumuladosReales;

  const desgloseCFE = calcularCobroCFECompleto(kwhParaFactura);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div style={{ transformOrigin: 'top right' }} className="genie-enter-top bg-slate-900 border border-emerald-500/40 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header estilo CFE */}
        <div className="flex items-center justify-between px-6 py-4 bg-emerald-950/90 border-b border-emerald-700/50">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-sm tracking-tighter">
              CFE
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Recibo de Luz CFE Simulado — Suministrador de Servicios Básicos
              </h2>
              <p className="text-xs text-emerald-200">
                Cálculo dinámico de facturación conforme a la simulación en curso y medidores de Eléctrico Alacio
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Controles de Selección de Medidor y Modo de Proyección */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Medidor CFE:</span>
              <button
                onClick={() => setSelectedMedidor('ALL')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  selectedMedidor === 'ALL'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-900 text-slate-300 border border-slate-700'
                }`}
              >
                Consolidado Consorcio
              </button>
              {medidores.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMedidor(m.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    selectedMedidor === m.id
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-900 text-slate-300 border border-slate-700'
                  }`}
                >
                  {m.nombre} ({m.id.toUpperCase()})
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setModoProyeccion('proyeccion_mes')}
                className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  modoProyeccion === 'proyeccion_mes'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-900 text-slate-400'
                }`}
              >
                Proyección Mes (30 días)
              </button>
              <button
                onClick={() => setModoProyeccion('acumulado_actual')}
                className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  modoProyeccion === 'acumulado_actual'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-900 text-slate-400'
                }`}
              >
                Acumulado Real ({diasSimuladosCount}d)
              </button>
            </div>
          </div>

          {/* Carátula Principal del Recibo CFE */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950 border border-emerald-500/40 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold uppercase text-emerald-400">Total a Pagar Estimado</div>
                <div className="text-3xl font-black text-white font-mono mt-2">
                  ${desgloseCFE.factura.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  <span className="text-xs text-slate-400 font-normal ml-1">MXN</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Subtotal Energía: ${desgloseCFE.factura.subtotal.toFixed(2)} + IVA (16%): ${desgloseCFE.factura.iva.toFixed(2)}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Consumo Facturado:</span>
                  <span className="font-mono font-bold text-amber-300">
                    {kwhParaFactura.toFixed(2)} kWh
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Demanda Instantánea:</span>
                  <span className="font-mono font-bold text-teal-300">
                    {wattsInstantaneos} W ({(wattsInstantaneos / 127).toFixed(1)} A)
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setOpen(false);
                  setFocusedMedidorId(selectedMedidor === 'ALL' ? 'med_3' : selectedMedidor);
                }}
                className="mt-4 w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Eye className="w-4 h-4" />
                <span>Acercarse al Medidor Físico en 3D</span>
              </button>
            </div>

            {/* Tabla de Escalones Tarifarios CFE */}
            <div className="md:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Desglose por Escalones Tarifarios CFE & Mercado Eléctrico Mayorista (MEM)
              </h3>
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2">Concepto / Escalón</th>
                    <th className="py-2 text-right">Consumo (kWh)</th>
                    <th className="py-2 text-right">Importe ($ MXN)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 font-mono">
                  <tr>
                    <td className="py-2 text-emerald-300 font-sans font-semibold">Escalón Básico</td>
                    <td className="py-2 text-right">{desgloseCFE.energia.basico.kwh.toFixed(2)}</td>
                    <td className="py-2 text-right">${desgloseCFE.energia.basico.costo.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-sky-300 font-sans font-semibold">Escalón Intermedio 1</td>
                    <td className="py-2 text-right">{desgloseCFE.energia.intermedio1.kwh.toFixed(2)}</td>
                    <td className="py-2 text-right">${desgloseCFE.energia.intermedio1.costo.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-amber-300 font-sans font-semibold">Escalón Intermedio 2</td>
                    <td className="py-2 text-right">{desgloseCFE.energia.intermedio2.kwh.toFixed(2)}</td>
                    <td className="py-2 text-right">${desgloseCFE.energia.intermedio2.costo.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-rose-400 font-sans font-semibold">Escalón Excedente</td>
                    <td className="py-2 text-right">{desgloseCFE.energia.excedente.kwh.toFixed(2)}</td>
                    <td className="py-2 text-right">${desgloseCFE.energia.excedente.costo.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>

              {/* Desglose de Equipos que más consumen en este recibo */}
              <div className="pt-2 border-t border-slate-800">
                <div className="text-[11px] font-bold uppercase text-slate-400 mb-2">
                  Participación por Aparato Eléctrico en este Medidor:
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {equiposFiltrados.map((eq) => (
                    <div
                      key={eq.key}
                      className="flex items-center justify-between text-xs bg-slate-900 px-3 py-1.5 rounded-lg"
                    >
                      <span className="text-slate-200 truncate">
                        {eq.nombre}{' '}
                        <span className="text-[10px] text-slate-400">
                          ({NEGOCIOS_ZONES_3D[eq.negocioId]?.nombre})
                        </span>
                      </span>
                      <span className="font-mono text-amber-300 shrink-0">
                        {eq.wattsActuales}W • {eq.kwhAcumulados.toFixed(3)} kWh
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
