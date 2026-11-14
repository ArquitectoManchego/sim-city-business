import React, { useEffect } from 'react';
import { useGameStore } from './store/useGameStore.js';
import { useTrainingStore } from './store/useTrainingStore.js';
import GameCanvas3D from './components/canvas3d/GameCanvas3D.jsx';
import TopTimeBar from './components/hud/TopTimeBar.jsx';
import LiveStatsTickerLog from './components/hud/LiveStatsTickerLog.jsx';
import KPIsAndEnergyModal from './components/hud/KPIsAndEnergyModal.jsx';
import CFEReceiptModal from './components/hud/CFEReceiptModal.jsx';
import InventoryStockDrawer from './components/hud/InventoryStockDrawer.jsx';
import MarketingCampaignModal from './components/hud/MarketingCampaignModal.jsx';
import TrainingModeOverlay from './components/training/TrainingModeOverlay.jsx';
import SketchUpImporterModal from './components/editor/SketchUpImporterModal.jsx';
import CollisionAndLayerTool from './components/editor/CollisionAndLayerTool.jsx';
import { Zap, FileText, X, Activity } from 'lucide-react';

export default function App() {
  const initializeFromElectricoAlacio = useGameStore(state => state.initializeFromElectricoAlacio);
  const focusedNegocioId = useGameStore(state => state.focusedNegocioId);
  const setFocusedNegocioId = useGameStore(state => state.setFocusedNegocioId);
  const negociosConfig = useGameStore(state => state.negociosConfig);
  const negocioStats = useGameStore(state => state.negocioStats);
  const applianceStates = useGameStore(state => state.applianceStates);
  const toggleModal = useGameStore(state => state.toggleModal);
  const isTrainingMode = useTrainingStore(state => state.isTrainingMode);

  useEffect(() => {
    initializeFromElectricoAlacio();
  }, [initializeFromElectricoAlacio]);

  // Calcular telemetría instantánea cuando la cámara enfoca el medidor CFE
  const cfeTelemetry = React.useMemo(() => {
    let watts = 0;
    let kwhTotal = 0;
    let activeCount = 0;

    Object.values(applianceStates).forEach(st => {
      if (st.isPoweredNow) {
        watts += st.potenciaActualW || 0;
        activeCount++;
      }
    });

    Object.values(negocioStats).forEach(ns => {
      kwhTotal += ns.kwhTotalAcumulado || 0;
    });

    return { watts, kwhTotal, activeCount };
  }, [applianceStates, negocioStats]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none">
      {/* Barra Superior de Manipulación de Tiempo y Accesos */}
      <TopTimeBar />

      {/* Escena 3D WebGL Principal */}
      <div className="w-full h-full pt-[56px]">
        <GameCanvas3D />
      </div>

      {/* Herramienta Flotante de Capas, Muros y Bloques de Colisión */}
      <CollisionAndLayerTool />

      {/* Inspector Flotante de Medidores Digitales CFE en 3D */}
      {focusedNegocioId === 'CFE_METER_INSPECT' && (
        <div className="fixed bottom-8 left-6 z-30 w-80 bg-slate-900/95 backdrop-blur-xl border border-emerald-500/40 rounded-2xl shadow-2xl p-4 text-slate-100">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Zap className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  Telemetría Medidor CFE
                </h3>
                <p className="text-[10px] text-slate-400">Lectura Digital Bidireccional en Vivo</p>
              </div>
            </div>
            <button
              onClick={() => setFocusedNegocioId('ALL')}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              title="Salir de vista de medidor"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-3 font-mono mb-3">
            <div className="flex items-center justify-between text-[10px] text-emerald-400/80 mb-1">
              <span>DEMANDA INSTANTÁNEA</span>
              <span className="flex items-center gap-1">
                <Activity className="w-3 h-3" /> {cfeTelemetry.activeCount} equipos ON
              </span>
            </div>
            <div className="text-2xl font-bold text-emerald-400 tracking-tight">
              {Math.round(cfeTelemetry.watts).toLocaleString('es-MX')} <span className="text-xs font-normal">W</span>
              <span className="text-xs text-slate-400 ml-2">
                ({(cfeTelemetry.watts / 1000).toFixed(2)} kW)
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Lectura Acumulada:</span>
              <span className="text-amber-300 font-bold">{cfeTelemetry.kwhTotal.toFixed(3)} kWh</span>
            </div>
          </div>

          <div className="space-y-1.5 mb-3">
            {negociosConfig.slice(0, 4).map(n => {
              const st = negocioStats[n.id] || {};
              return (
                <div key={n.id} className="flex items-center justify-between text-[11px] bg-slate-950/60 px-2.5 py-1.5 rounded-lg border border-slate-800/80">
                  <span className="text-slate-300 truncate max-w-[140px]">{n.nombre}</span>
                  <span className="font-mono text-amber-300 font-semibold">
                    {Math.round(st.potenciaActualW || 0)} W · {(st.kwhDia || 0).toFixed(2)} kWh/día
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => toggleModal('cfeModal')}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow"
            >
              <FileText className="w-3.5 h-3.5" />
              Abrir Recibo CFE
            </button>
            <button
              onClick={() => toggleModal('kpisModal')}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              Switches
            </button>
          </div>
        </div>
      )}

      {/* Panel Derecho Permanente de Stats por Negocio y Log en Vivo (se oculta cuando Modo Entrenamiento está activo) */}
      {!isTrainingMode && <LiveStatsTickerLog />}

      {/* Modo Entrenamiento de Empleados con Sliders e IA */}
      <TrainingModeOverlay />

      {/* Modales de Gestión, KPIs, Recibo CFE, Inventario, Marketing e Importador SketchUp */}
      <SketchUpImporterModal />
      <KPIsAndEnergyModal />
      <CFEReceiptModal />
      <InventoryStockDrawer />
      <MarketingCampaignModal />
    </div>
  );
}
