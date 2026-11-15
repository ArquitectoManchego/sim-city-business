import React, { useEffect, useState } from 'react';
import {
  Bluetooth,
  Volume2,
  VolumeX,
  Music,
  Radio,
  Smartphone,
  X,
  CheckCircle2,
  Headphones
} from 'lucide-react';
import { audioEngine, BLUETOOTH_DEVICE_INFO } from '../../engine/AudioEngine.js';
import { ALL_ZONES_3D } from '../../engine/ChoreographyRegistry.js';

function parseSpotifyEmbedUrl(rawUrl) {
  if (!rawUrl) return null;
  const match = rawUrl.match(/open\.spotify\.com\/(track|album|playlist|artist|episode)\/([a-zA-Z0-9]+)/);
  if (match) {
    return `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator&theme=0`;
  }
  const uriMatch = rawUrl.match(/spotify:(track|album|playlist|artist):([a-zA-Z0-9]+)/);
  if (uriMatch) {
    return `https://open.spotify.com/embed/${uriMatch[1]}/${uriMatch[2]}?utm_source=generator&theme=0`;
  }
  return null;
}

export default function AudioBluetoothModal({ isOpen, onClose }) {
  const [snap, setSnap] = useState(() => audioEngine.getSnapshot());
  const [spotifyUrlInput, setSpotifyUrlInput] = useState(snap.spotifyUrl || BLUETOOTH_DEVICE_INFO.defaultSpotifyUrl);
  const [tokenInput, setTokenInput] = useState(snap.spotifyAccessToken || '');

  useEffect(() => {
    const unsub = audioEngine.subscribe(setSnap);
    const id = setInterval(() => setSnap(audioEngine.getSnapshot()), 600);
    return () => {
      unsub();
      clearInterval(id);
    };
  }, []);

  if (!isOpen) return null;

  const embedUrl = parseSpotifyEmbedUrl(snap.spotifyUrl);
  const focusedZoneName = ALL_ZONES_3D[snap.focusedNegocioId]?.nombre || snap.focusedNegocioId;

  const handleSaveSpotifyUrl = () => {
    audioEngine.ensureUnlocked();
    audioEngine.setSpotifyConfig({
      spotifyUrl: spotifyUrlInput.trim() || BLUETOOTH_DEVICE_INFO.defaultSpotifyUrl,
      spotifyMode: 'spotify_embed'
    });
  };

  const handleConnectSpotifyDevice = () => {
    audioEngine.ensureUnlocked();
    audioEngine.connectSpotifyWebPlayback(tokenInput);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-700/80 bg-slate-900 text-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/95">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400">
              <Bluetooth className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wide text-white flex items-center gap-2">
                Sistema de Audio & Receptor Bluetooth de Tienda
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {snap.unlocked ? 'ACTIVO' : 'TOCA PARA ACTIVAR'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Dispositivo: <span className="text-sky-300 font-medium">{BLUETOOTH_DEVICE_INFO.deviceName}</span> •{' '}
                <span className="font-mono text-[11px]">{BLUETOOTH_DEVICE_INFO.macAddress}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Estado espacial en vivo */}
          <div className="rounded-xl bg-slate-800/60 border border-slate-700/70 p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Headphones className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-xs text-slate-400">Escuchando ambiente 3D de:</div>
                <div className="text-sm font-semibold text-white">{focusedZoneName}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {snap.activeSounds?.length > 0 ? (
                snap.activeSounds.map((snd) => (
                  <span
                    key={snd}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30"
                  >
                    🔊 {snd}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">Silencio operativo (sin máquinas ruidosas activas)</span>
              )}
            </div>
          </div>

          {/* Mezclador de volumen */}
          <div className="rounded-xl bg-slate-800/40 border border-slate-700/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Mezclador de Audio en Tiendas
              </span>
              <button
                onClick={() => {
                  audioEngine.ensureUnlocked();
                  audioEngine.toggleMute();
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                  snap.muted
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-slate-700/60 text-slate-200 border-slate-600 hover:bg-slate-700'
                }`}
              >
                {snap.muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                {snap.muted ? 'Silenciado' : 'Sonido Activo'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">🎵 Música Bluetooth</span>
                  <span className="text-sky-300 font-mono">{Math.round(snap.musicVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.02"
                  value={snap.musicVolume}
                  onChange={(e) => {
                    audioEngine.ensureUnlocked();
                    audioEngine.setVolume('music', e.target.value);
                  }}
                  className="w-full accent-sky-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">☕ Ambiente Local</span>
                  <span className="text-emerald-300 font-mono">{Math.round(snap.ambientVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.02"
                  value={snap.ambientVolume}
                  onChange={(e) => {
                    audioEngine.ensureUnlocked();
                    audioEngine.setVolume('ambient', e.target.value);
                  }}
                  className="w-full accent-emerald-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">⚙️ Máquinas y Puerta</span>
                  <span className="text-amber-300 font-mono">{Math.round(snap.sfxVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.02"
                  value={snap.sfxVolume}
                  onChange={(e) => {
                    audioEngine.ensureUnlocked();
                    audioEngine.setVolume('sfx', e.target.value);
                  }}
                  className="w-full accent-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Selector de Fuente Bluetooth / Spotify */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Fuente de Música Ambiental (Spotify / Bluetooth)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                onClick={() => {
                  audioEngine.ensureUnlocked();
                  audioEngine.setSpotifyConfig({ spotifyMode: 'auto_lofi' });
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  snap.spotifyMode === 'auto_lofi'
                    ? 'bg-sky-500/20 border-sky-400 text-white'
                    : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-xs mb-1">
                  <Radio className="w-4 h-4 text-sky-400" />
                  Radio Tienda Auto
                </div>
                <p className="text-[11px] text-slate-400">
                  Suena automáticamente al abrir la app sin necesidad de login.
                </p>
              </button>

              <button
                onClick={() => {
                  audioEngine.ensureUnlocked();
                  audioEngine.setSpotifyConfig({ spotifyMode: 'spotify_embed' });
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  snap.spotifyMode === 'spotify_embed'
                    ? 'bg-emerald-500/20 border-emerald-400 text-white'
                    : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-xs mb-1">
                  <Music className="w-4 h-4 text-emerald-400" />
                  Playlist Spotify
                </div>
                <p className="text-[11px] text-slate-400">
                  Pega el enlace de tu playlist o canción de Spotify.
                </p>
              </button>

              <button
                onClick={() => {
                  audioEngine.ensureUnlocked();
                  audioEngine.setSpotifyConfig({ spotifyMode: 'spotify_connect' });
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  snap.spotifyMode === 'spotify_connect'
                    ? 'bg-green-500/20 border-green-400 text-white'
                    : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-xs mb-1">
                  <Smartphone className="w-4 h-4 text-green-400" />
                  Spotify Connect (Cel)
                </div>
                <p className="text-[11px] text-slate-400">
                  Aparece en tu celular como bocina Bluetooth Spotify.
                </p>
              </button>
            </div>

            {snap.spotifyMode === 'spotify_embed' && (
              <div className="rounded-xl bg-slate-800/60 border border-slate-700 p-3.5 space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={spotifyUrlInput}
                    onChange={(e) => setSpotifyUrlInput(e.target.value)}
                    placeholder="https://open.spotify.com/playlist/..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                  <button
                    onClick={handleSaveSpotifyUrl}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white"
                  >
                    Cargar Playlist
                  </button>
                </div>
                {embedUrl ? (
                  <iframe
                    title="Spotify Tienda Player"
                    src={embedUrl}
                    width="100%"
                    height="152"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    className="rounded-xl"
                  />
                ) : (
                  <p className="text-xs text-rose-400">Enlace de Spotify no reconocido. Usa un link de open.spotify.com.</p>
                )}
              </div>
            )}

            {snap.spotifyMode === 'spotify_connect' && (
              <div className="rounded-xl bg-slate-800/60 border border-slate-700 p-3.5 space-y-2.5">
                <div className="flex items-center gap-2 text-xs text-emerald-300">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Estado: {snap.spotifyConnectStatus}</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Pega tu Token OAuth de Spotify (scope <code className="text-slate-200">streaming</code>) para registrar{' '}
                  <strong className="text-white">{BLUETOOTH_DEVICE_INFO.deviceName}</strong> en la app de Spotify de tu celular y enviar música directo como Bluetooth:
                </p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="BQA... (Spotify OAuth Access Token)"
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-green-400"
                  />
                  <button
                    onClick={handleConnectSpotifyDevice}
                    className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-xs font-semibold text-white"
                  >
                    Emparejar BT
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
