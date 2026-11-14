/**
 * Panel de Materia Prima, Costos de Insumos, Stock Actual y Gasto por Producto (BOM).
 */

import React, { useState } from 'react';
import { X, Package, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useGameStore, NEGOCIOS_ACTIVOS_IDS } from '../../store/useGameStore.js';
import { NEGOCIOS_ZONES_3D } from '../../engine/ChoreographyRegistry.js';
import { PRODUCTOS_OPERATIVOS_EXTENDIDOS } from '../../shared/catalogoProductosInsumos.js';

export default function InventoryStockDrawer() {
  const isOpen = useGameStore((s) => s.isInventoryDrawerOpen);
  const setOpen = useGameStore((s) => s.setInventoryDrawerOpen);
  const inventarioPorNegocio = useGameStore((s) => s.inventarioPorNegocio);
  const restockInsumo = useGameStore((s) => s.restockInsumo);
  const autoRestockEnabled = useGameStore((s) => s.autoRestockEnabled);
  const setAutoRestockEnabled = useGameStore((s) => s.setAutoRestockEnabled);
  const focusedNegocioId = useGameStore((s) => s.focusedNegocioId);

  const [selectedNegocio, setSelectedNegocio] = useState(
    NEGOCIOS_ZONES_3D[focusedNegocioId] ? focusedNegocioId : 'hawaiian_paradise'
  );

  if (!isOpen) return null;

  const insumos = inventarioPorNegocio[selectedNegocio] || [];
  const productos = PRODUCTOS_OPERATIVOS_EXTENDIDOS[selectedNegocio] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Materia Prima, Costos de Insumos, Stock y Recetas (BOM)
              </h2>
              <p className="text-xs text-slate-400">
                Control de existencias, cómo se gasta cada insumo por venta y reabastecimiento
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Selector de Negocio y Toggle de Auto-Reabastecimiento */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="flex flex-wrap items-center gap-1.5">
              {NEGOCIOS_ACTIVOS_IDS.map((nId) => (
                <button
                  key={nId}
                  onClick={() => setSelectedNegocio(nId)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    selectedNegocio === nId
                      ? 'bg-sky-500 text-slate-950'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
                  }`}
                >
                  {NEGOCIOS_ZONES_3D[nId].nombre}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700">
              <input
                type="checkbox"
                checked={autoRestockEnabled}
                onChange={(e) => setAutoRestockEnabled(e.target.checked)}
                className="accent-teal-500 rounded"
              />
              <span>Auto-Reabastecer al llegar al Punto de Reorden</span>
            </label>
          </div>

          {/* Grid de Materia Prima y Stock Actual */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Inventario de Materia Prima en {NEGOCIOS_ZONES_3D[selectedNegocio].nombre}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {insumos.map((item) => {
                const pct = Math.min(100, Math.round((item.stockActual / Math.max(1, item.stockMaximo)) * 100));
                const isLow = item.stockActual <= item.puntoReorden;

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border ${
                      isLow ? 'bg-rose-950/30 border-rose-500/60' : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: item.colorHex }}
                          />
                          <span className="text-sm font-bold text-white">{item.nombre}</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Costo Unitario:{' '}
                          <strong className="text-emerald-400 font-mono">
                            ${item.costoUnitario.toFixed(2)} / {item.unidad}
                          </strong>{' '}
                          • Punto Reorden: {item.puntoReorden} {item.unidad}
                        </div>
                      </div>

                      <button
                        onClick={() => restockInsumo(selectedNegocio, item.id)}
                        className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1 shrink-0 transition"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Comprar (+{item.loteRecompra})</span>
                      </button>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className={isLow ? 'text-rose-400 font-bold' : 'text-sky-300 font-bold'}>
                          Stock Actual: {item.stockActual} {item.unidad}
                        </span>
                        <span className="text-slate-500">
                          Máx: {item.stockMaximo} {item.unidad} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            isLow ? 'bg-rose-500' : 'bg-sky-400'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tabla de Productos: Qué se prepara, qué se revende, qué se fabrica y qué materia prima consume */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Catálogo de Productos, Clasificación Operativa y Gasto de Materia Prima por Venta
            </h3>
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                    <th className="py-2.5 px-3">Producto</th>
                    <th className="py-2.5 px-3">Modalidad</th>
                    <th className="py-2.5 px-3">Precio Venta</th>
                    <th className="py-2.5 px-3">Costo Insumos</th>
                    <th className="py-2.5 px-3">Materia Prima Consumida por Unidad (BOM)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {productos.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-900/50">
                      <td className="py-2.5 px-3 font-bold text-white">{p.nombre}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.tipoOperacion === 'PREPARADO_AL_MOMENTO'
                              ? 'bg-amber-500/20 text-amber-300'
                              : p.tipoOperacion === 'COMPRA_Y_REVENTA'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-purple-500/20 text-purple-300'
                          }`}
                        >
                          {p.tipoOperacion}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">
                        ${p.precioVenta.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-sky-300">
                        ${p.costoMateriales.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">
                        {(p.bom || []).map((b, i) => {
                          const metaIns = insumos.find((ins) => ins.id === b.insumoId);
                          return (
                            <span
                              key={i}
                              className="inline-block mr-2 mb-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[11px]"
                            >
                              {b.cantidad} {metaIns?.unidad || 'u.'} de{' '}
                              <strong>{metaIns?.nombre || b.insumoId}</strong>
                            </span>
                          );
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
