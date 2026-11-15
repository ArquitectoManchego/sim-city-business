import React, { useEffect, useState } from 'react';
import { useGameStore, NEGOCIOS_ACTIVOS_IDS } from './store/useGameStore.js';
import { useTrainingStore } from './store/useTrainingStore.js';
import { NEGOCIOS_ZONES_3D } from './engine/ChoreographyRegistry.js';
import GameCanvas3D from './components/canvas3d/GameCanvas3D.jsx';
import TopTimeBar from './components/hud/TopTimeBar.jsx';
import FloatingBusinessStatsBar from './components/hud/FloatingBusinessStatsBar.jsx';
import LiveStatsTickerLog from './components/hud/LiveStatsTickerLog.jsx';
import KPIsAndEnergyModal from './components/hud/KPIsAndEnergyModal.jsx';
import CFEReceiptModal from './components/hud/CFEReceiptModal.jsx';
import InventoryStockDrawer from './components/hud/InventoryStockDrawer.jsx';
import MarketingCampaignModal from './components/hud/MarketingCampaignModal.jsx';
import Sims2CASModal from './components/hud/Sims2CASModal.jsx';
import TrainingModeOverlay from './components/training/TrainingModeOverlay.jsx';
import SketchUpImporterModal from './components/editor/SketchUpImporterModal.jsx';
import CollisionAndLayerTool from './components/editor/CollisionAndLayerTool.jsx';
import GeniePanel from './components/ui/GeniePanel.jsx';
import { Zap, FileText, X, Activity, ChevronDown, ChevronUp } from 'lucide-react';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error?.message || 'Error inesperado en la aplicación' };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary capturó error en SIM CITY BUSINESS:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-screen h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-slate-900 border border-rose-500/40 rounded-2xl p-6 shadow-2xl">
            <h1 className="text-lg font-bold text-rose-400 mb-2">Error al inicializar SIM CITY BUSINESS 3D</h1>
            <p className="text-sm text-slate-300 mb-4">{this.state.errorMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold transition"
            >
              Recargar Simulador
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const initializeFromElectricoAlacio = useGameStore((s) => s.initializeFromElectricoAlacio);
  const focusedNegocioId = useGameStore((s) => s.focusedNegocioId);
  const setFocusedNegocioId = useGameStore((s) => s.setFocusedNegocioId);
  const statsPorNegocio = useGameStore((s) => s.statsPorNegocio);
  const equiposRuntime = useGameStore((s) => s.equiposRuntime);
  const setCfeReceiptModalOpen = useGameStore((s) => s.setCfeReceiptModalOpen);
  const setKpiModalOpen = useGameStore((s) => s.setKpiModalOpen);
  const isTrainingMode = useTrainingStore((s) => s.isTrainingMode);

  const [isMeterCardMinimized, setIsMeterCardMinimized] = useState(false);

  useEffect(() => {
    initializeFromElectricoAlacio();
  }, [initializeFromElectricoAlacio]);

  // Calcular telemetría instantánea cuando la cámara enfoca el medidor CFE
  const cfeTelemetry = React.useMemo(() => {
    let watts = 0;
    let kwhTotal = 0;
    let activeCount = 0;

    Object.values(equiposRuntime || {}).forEach((eq) => {
      const w = eq?.wattsActuales || 0;
      if (eq?.estado !== 'OFF' || w > 0) {
        watts += w;
        if (w > 0) activeCount++;
      }
    });

    Object.values(statsPorNegocio || {}).forEach((ns) => {
      kwhTotal += ns?.kwhAcumulados || 0;
    });

    return { watts, kwhTotal, activeCount };
  }, [equiposRuntime, statsPorNegocio]);

  const wattsPorNegocio = React.useMemo(() => {
    const mapa = {};
    NEGOCIOS_ACTIVOS_IDS.forEach((id) => {
      mapa[id] = 0;
    });
    Object.values(equiposRuntime || {}).forEach((eq) => {
      if (mapa[eq.negocioId] !== undefined) {
        mapa[eq.negocioId] += eq.wattsActuales || 0;
      }
    });
    return mapa;
  }, [equiposRuntime]);

  return (
    <AppErrorBoundary>
      <div className="relative flex flex-col w-screen h-screen overflow-hidden bg-slate-950 select-none">
        {/* Barra Superior de Manipulación de Tiempo y Vista General en Arco */}
        <TopTimeBar />

        {/* Escena 3D WebGL Principal + Tira Superior de Stats Flotantes en Puro Texto */}
        <div className="relative flex-1 min-h-0 w-full overflow-hidden">
          <GameCanvas3D />
          {!isTrainingMode && <FloatingBusinessStatsBar />}
        </div>

        {/* Herramienta Flotante de Capas, Muros y Bloques de Colisión */}
        <CollisionAndLayerTool />

        {/* Inspector Flotante de Medidores Digitales CFE en 3D (con animación Mac Genie) */}
        {focusedNegocioId === 'CFE_METER_INSPECT' && (
          <div className="fixed bottom-20 left-6 z-30">
            <GeniePanel
              isMinimized={isMeterCardMinimized}
              origin="bottom left"
              direction="bottom"
              renderDockIcon={() => (
                <button
                  onClick={() => setIsMeterCardMinimized(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/95 hover:bg-slate-800 border border-emerald-500/50 text-emerald-300 text-xs font-bold shadow-xl backdrop-blur-md"
                >
                  <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>Medidor CFE ({Math.round(cfeTelemetry.watts)} W)</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
              )}
            >
              <div className="w-80 bg-slate-900/95 backdrop-blur-xl border border-emerald-500/40 rounded-2xl shadow-2xl p-4 text-slate-100">
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
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setIsMeterCardMinimized(true)}
                      className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                      title="Minimizar telemetría"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setFocusedNegocioId('ALL_CONSORCIO')}
                      className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                      title="Salir de vista de medidor"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
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
                  {NEGOCIOS_ACTIVOS_IDS.slice(0, 4).map((negId) => {
                    const zona = NEGOCIOS_ZONES_3D[negId];
                    const st = statsPorNegocio?.[negId] || {};
                    const wattsNeg = wattsPorNegocio[negId] || 0;
                    return (
                      <div key={negId} className="flex items-center justify-between text-[11px] bg-slate-950/60 px-2.5 py-1.5 rounded-lg border border-slate-800/80">
                        <span className="text-slate-300 truncate max-w-[140px]">{zona?.nombre || negId}</span>
                        <span className="font-mono text-amber-300 font-semibold">
                          {Math.round(wattsNeg)} W · {(st.kwhAcumulados || 0).toFixed(2)} kWh
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setCfeReceiptModalOpen(true)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Abrir Recibo CFE
                  </button>
                  <button
                    onClick={() => setKpiModalOpen(true)}
                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                  >
                    Switches
                  </button>
                </div>
              </div>
            </GeniePanel>
          </div>
        )}

        {/* Controles Inferiores Minimizables: Simular Cliente Ahora y Log en Vivo */}
        {!isTrainingMode && <LiveStatsTickerLog />}

        {/* Modo Entrenamiento de Empleados con Sliders e IA */}
        <TrainingModeOverlay />

        {/* Modales de Gestión, KPIs, Recibo CFE, Inventario, Marketing e Importador SketchUp */}
        <SketchUpImporterModal />
        <KPIsAndEnergyModal />
        <CFEReceiptModal />
        <InventoryStockDrawer />
        <MarketingCampaignModal />
        <Sims2CASModal />
      </div>
    </AppErrorBoundary>
  );
}
