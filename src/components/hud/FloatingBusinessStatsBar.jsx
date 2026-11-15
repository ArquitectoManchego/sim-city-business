/**
 * Tira Superior de Stats Flotantes en Puro Texto (sin fondo, sin marco, de izquierda a derecha)
 * con botón STATS en el extremo izquierdo y animación tipo Mac Genie al ocultar/mostrar.
 */

import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import { useGameStore, NEGOCIOS_ACTIVOS_IDS } from '../../store/useGameStore.js';
import { NEGOCIOS_ZONES_3D } from '../../engine/ChoreographyRegistry.js';
import { calcularCobroCFECompleto } from '../../shared/simuladorCFE.js';
import GeniePanel from '../ui/GeniePanel.jsx';

export default function FloatingBusinessStatsBar() {
  const statsPorNegocio = useGameStore((s) => s.statsPorNegocio);
  const equiposRuntime = useGameStore((s) => s.equiposRuntime);
  const setFocusedNegocioId = useGameStore((s) => s.setFocusedNegocioId);
  const [statsVisible, setStatsVisible] = useState(true);

  // Calcular consumo actual en Watts por negocio
  const wattsPorNegocio = {};
  NEGOCIOS_ACTIVOS_IDS.forEach((id) => {
    wattsPorNegocio[id] = 0;
  });
  Object.values(equiposRuntime || {}).forEach((eq) => {
    if (wattsPorNegocio[eq.negocioId] !== undefined) {
      wattsPorNegocio[eq.negocioId] += eq.wattsActuales || 0;
    }
  });

  // Calcular consumo acumulado de todo el consorcio para reflejar la tarifa marginal CFE real
  const totalKwhMesConsorcio = NEGOCIOS_ACTIVOS_IDS.reduce(
    (acc, id) => acc + (statsPorNegocio[id]?.kwhMes ?? statsPorNegocio[id]?.kwhAcumulados ?? 0),
    0
  );
  const reciboConsorcio = calcularCobroCFECompleto(totalKwhMesConsorcio);
  const totalFactura = reciboConsorcio?.factura?.total || 0;
  const tarifaPromedioKwh =
    totalKwhMesConsorcio > 0 && totalFactura > 0
      ? totalFactura / totalKwhMesConsorcio
      : 1.164; // Tarifa básica 1C + 16% IVA por defecto cuando recién inicia

  return (
    <div className="pointer-events-none absolute top-2 inset-x-0 z-20 px-3 pt-1 flex items-start gap-4">
      {/* Botón STATS hasta la izquierda */}
      <button
        onClick={() => setStatsVisible((v) => !v)}
        className={`pointer-events-auto shrink-0 px-2.5 py-1 rounded-md text-[11px] font-black tracking-wider uppercase transition shadow-md ${
          statsVisible
            ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
            : 'bg-slate-900/90 text-amber-300 border border-amber-400/60 hover:bg-slate-800'
        }`}
        title={statsVisible ? 'Ocultar stats de negocios' : 'Mostrar stats de negocios'}
      >
        STATS
      </button>

      {/* Stats de cada negocio en puro texto flotante, de izquierda a derecha, con animación Mac Genie */}
      <GeniePanel
        isMinimized={!statsVisible}
        origin="top left"
        direction="top"
        className="flex-1 min-w-0"
      >
        <div className="flex flex-nowrap items-start justify-between gap-4 overflow-x-auto pb-1">
          {NEGOCIOS_ACTIVOS_IDS.map((negId) => {
            const zone = NEGOCIOS_ZONES_3D[negId];
            const st = statsPorNegocio[negId] || {};
            const wattsActuales = wattsPorNegocio[negId] || 0;
            const kwActual = (wattsActuales / 1000).toFixed(2);
            const kwhHoy = st.kwhHoy || 0;
            const kwhMes = st.kwhMes ?? st.kwhAcumulados ?? 0;

            const ventasProd = st.ventasHoy || 0;
            const dineroVentas = st.ingresosHoy || 0;
            const gananciaBruta = Math.max(0, dineroVentas - (st.costoInsumosHoy || 0));

            const costoHoyPesos = Math.round(kwhHoy * tarifaPromedioKwh);
            const costoTotalReciboPesos = Math.round(kwhMes * tarifaPromedioKwh);

            const totalKwText = kwhMes < 10 ? kwhMes.toFixed(1) : Math.round(kwhMes);

            return (
              <div
                key={negId}
                onClick={() => setFocusedNegocioId(negId)}
                className="pointer-events-auto cursor-pointer shrink-0 bg-transparent border-0 p-0 text-[11px] leading-[1.35] font-mono text-slate-100 select-none hover:opacity-90 transition-opacity"
                style={{
                  textShadow: '0 1px 3px rgba(0, 0, 0, 0.98), 0 0 8px rgba(0, 0, 0, 0.85)'
                }}
                title={`Clic para enfocar cámara en ${zone.nombre}`}
              >
                {/* NOMBRE DEL NEGOCIO */}
                <div
                  className="font-sans font-extrabold tracking-wide text-[11px] uppercase"
                  style={{ color: zone.colorHex }}
                >
                  {zone.nombre.toUpperCase()}
                </div>

                {/* Ventas: X prod, $dinero (amarillo tráfico), $ganancia (verde) */}
                <div className="whitespace-nowrap">
                  <span className="text-slate-200">Ventas: {ventasProd} prod, </span>
                  <span className="text-[#facc15] font-bold">
                    ${Math.round(dineroVentas).toLocaleString('es-MX')}
                  </span>
                  <span className="text-slate-300">, </span>
                  <span className="text-emerald-400 font-bold">
                    ${Math.round(gananciaBruta).toLocaleString('es-MX')}
                  </span>
                </div>

                {/* ⚡: Actual: Xkw/h, Total: Ykw */}
                <div className="whitespace-nowrap text-slate-200 flex items-center gap-0.5">
                  <Zap className="w-3 h-3 text-yellow-400 fill-yellow-400 shrink-0" />
                  <span>
                    : Actual: {kwActual}kw/h, Total: {totalKwText}kw
                  </span>
                </div>

                {/* $ ⚡: Hoy: $X Total: $Y */}
                <div className="whitespace-nowrap text-slate-200 flex items-center gap-0.5">
                  <span>$</span>
                  <Zap className="w-3 h-3 text-yellow-400 fill-yellow-400 shrink-0" />
                  <span>
                    : Hoy: ${costoHoyPesos.toLocaleString('es-MX')} Total: ${costoTotalReciboPesos.toLocaleString('es-MX')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </GeniePanel>
    </div>
  );
}
