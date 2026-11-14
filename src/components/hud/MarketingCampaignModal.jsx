/**
 * Modal de Campañas Publicitarias, Calendario de Fechas Especiales (CATALOGO_EVENTOS_MEXICO),
 * Días de Quincena y Selector de Escenarios de Demanda.
 */

import React from 'react';
import { X, Megaphone, Calendar, Sparkles, TrendingUp } from 'lucide-react';
import { useGameStore, NEGOCIOS_ACTIVOS_IDS } from '../../store/useGameStore.js';
import { NEGOCIOS_ZONES_3D } from '../../engine/ChoreographyRegistry.js';
import { CATALOGO_EVENTOS_MEXICO, MESES_INFO } from '../../shared/motorTemporadasYEventos.js';

export default function MarketingCampaignModal() {
  const isOpen = useGameStore((s) => s.isMarketingModalOpen);
  const setOpen = useGameStore((s) => s.setMarketingModalOpen);
  const campanasActivas = useGameStore((s) => s.campanasActivas);
  const toggleCampaign = useGameStore((s) => s.toggleCampaign);
  const updateCampaignIntensity = useGameStore((s) => s.updateCampaignIntensity);
  const escenarioGlobal = useGameStore((s) => s.escenarioGlobal);
  const setEscenarioGlobal = useGameStore((s) => s.setEscenarioGlobal);
  const setSimulationDateTime = useGameStore((s) => s.setSimulationDateTime);

  if (!isOpen) return null;

  const fechasRapidas = [
    { label: '💘 San Valentín (14 Feb - Quincena)', year: 2026, monthIdx: 1, day: 14, hour: 13 },
    { label: '🧒 Día del Niño (30 Abr - Quincena)', year: 2026, monthIdx: 3, day: 30, hour: 15 },
    { label: '💐 Día de las Madres (10 May - Calor Pico)', year: 2026, monthIdx: 4, day: 10, hour: 12 },
    { label: '💵 Quincena de Mayo Calor (15 May)', year: 2026, monthIdx: 4, day: 15, hour: 14 },
    { label: '🎒 Regreso a Clases (15 Ago - Quincena)', year: 2026, monthIdx: 7, day: 15, hour: 11 },
    { label: '💀 Día de Muertos (01 Nov)', year: 2026, monthIdx: 10, day: 1, hour: 17 },
    { label: '🎄 Temporada Navideña (15 Dic - Quincena)', year: 2026, monthIdx: 11, day: 15, hour: 16 }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Campañas Publicitarias, Fechas Especiales, Quincenas y Escenarios de Clientes
              </h2>
              <p className="text-xs text-slate-400">
                Configura las condiciones comerciales que determinan la cantidad y tipo de clientes en cada negocio
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

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Selector de Escenario Global de Demanda */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              1. Escenario Base de Afluencia de Clientes (Calibrado con Eléctrico Alacio)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'bajo', label: 'Bajo (20% Cap.)', desc: 'Temporada floja' },
                { id: 'tablas', label: 'Tablas (35% Cap.)', desc: 'Punto de equilibrio' },
                { id: 'medio', label: 'Medio / Bueno (50%)', desc: 'Flujo regular' },
                { id: 'alto', label: 'Alto (80% Cap.)', desc: 'Temporada fuerte' },
                { id: 'muy_alto', label: 'Muy Alto (95% Pico)', desc: 'Saturación máxima' }
              ].map((esc) => (
                <button
                  key={esc.id}
                  onClick={() => setEscenarioGlobal(esc.id)}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    escenarioGlobal === esc.id
                      ? 'bg-teal-500/20 border-teal-400 text-white shadow'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="text-xs font-bold">{esc.label}</div>
                  <div className="text-[10px] text-slate-400">{esc.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Saltos Rápidos a Fechas Especiales y Días de Quincena */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              2. Viajar a Fechas Especiales, Temporadas de Calor o Días de Quincena
            </label>
            <div className="flex flex-wrap gap-2">
              {fechasRapidas.map((f, i) => (
                <button
                  key={i}
                  onClick={() => setSimulationDateTime(f.year, f.monthIdx, f.day, f.hour, 0)}
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-indigo-950 border border-slate-700 hover:border-indigo-400 text-xs font-semibold text-slate-200 transition"
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Campañas Publicitarias por Negocio */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              3. Respuesta de los Clientes a Campañas Publicitarias por Negocio
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {NEGOCIOS_ACTIVOS_IDS.map((nId) => {
                const zone = NEGOCIOS_ZONES_3D[nId];
                const camp = campanasActivas[nId] || { activa: false, nombre: 'Campaña Local', intensidadPct: 30 };

                return (
                  <div
                    key={nId}
                    className={`p-4 rounded-xl border transition ${
                      camp.activa
                        ? 'bg-pink-950/20 border-pink-500/50'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div>
                        <div className="text-sm font-bold text-white">{zone.nombre}</div>
                        <div className="text-xs text-pink-300">{camp.nombre}</div>
                      </div>
                      <button
                        onClick={() => toggleCampaign(nId)}
                        className={`px-3 py-1 rounded-lg text-xs font-extrabold transition ${
                          camp.activa
                            ? 'bg-pink-500 text-slate-950'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {camp.activa ? 'CAMPAÑA ACTIVA' : 'INACTIVA'}
                      </button>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-slate-800/80 text-xs">
                      <div className="flex justify-between text-slate-300">
                        <span>Impulso de Afluencia de Clientes:</span>
                        <span className="font-mono font-bold text-emerald-400">
                          +{camp.intensidadPct}% clientes/hora
                        </span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="80"
                        step="5"
                        value={camp.intensidadPct}
                        onChange={(e) => updateCampaignIntensity(nId, e.target.value)}
                        className="w-full accent-pink-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
