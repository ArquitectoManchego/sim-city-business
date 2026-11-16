/**
 * SketchupBridgeModal.jsx
 * Modal de Integración Bidireccional con Trimble SketchUp (2018 - 2026).
 * Permite exportar la maqueta 3D completa (locales, corte arquitectónico, navmesh,
 * colisiones, mobiliario y personajes), descargar el plugin .rbz e importar
 * automáticamente los cambios realizados en SketchUp.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Download,
  Upload,
  RefreshCw,
  Box,
  Layers,
  Scissors,
  CheckCircle2,
  AlertTriangle,
  FolderDown,
  Info,
  ExternalLink,
  Shield,
  Zap
} from 'lucide-react';
import { useSceneEditorStore } from '../../store/useSceneEditorStore.js';
import {
  buildSketchupSceneData,
  downloadSketchupSceneFile,
  importFromSketchupPayload
} from '../../services/sketchupExporter.js';

export default function SketchupBridgeModal() {
  const isOpen = useSceneEditorStore((s) => s.isSketchupBridgeModalOpen);
  const setOpen = useSceneEditorStore((s) => s.setSketchupBridgeModalOpen);
  const lastSyncTime = useSceneEditorStore((s) => s.lastSketchupSyncTime);
  const setLastSyncTime = useSceneEditorStore((s) => s.setLastSketchupSyncTime);

  // Opciones de exportación
  const [corteArquitectonico, setCorteArquitectonico] = useState(true);
  const [alturaCorte, setAlturaCorte] = useState(1.20);
  const [incluirPersonajes, setIncluirPersonajes] = useState(true);
  const [incluirEquipos, setIncluirEquipos] = useState(true);
  const [incluirColisiones, setIncluirColisiones] = useState(true);
  const [incluirPisoCaminable, setIncluirPisoCaminable] = useState(true);

  // Estado de sincronización y mensajes
  const [syncStatus, setSyncStatus] = useState({ type: null, text: '' });
  const [isCheckingSync, setIsCheckingSync] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Escuchar eventos en vivo desde Vite HMR (si estamos en entorno de desarrollo)
  useEffect(() => {
    if (typeof import.meta !== 'undefined' && import.meta.hot) {
      const handleHotSync = (payload) => {
        if (payload?.data) {
          try {
            const res = importFromSketchupPayload(payload.data);
            setLastSyncTime(new Date().toLocaleTimeString());
            setSyncStatus({
              type: 'success',
              text: `¡Sincronización automática en vivo! Se importaron ${res.totalBloques} bloques de colisión desde Trimble SketchUp.`
            });
          } catch (err) {
            console.error('Error importando sincronización live:', err);
          }
        }
      };

      import.meta.hot.on('sketchup-sync-event', handleHotSync);
      return () => {
        import.meta.hot.off('sketchup-sync-event', handleHotSync);
      };
    }
  }, [setLastSyncTime]);

  // Si no está abierto el modal, no renderizar
  if (!isOpen) return null;

  // Manejar exportación de archivo .scb
  const handleExportSketchup = () => {
    try {
      const res = downloadSketchupSceneFile({
        corteArquitectonico,
        alturaCorte,
        incluirPersonajes,
        incluirEquipos,
        incluirColisiones,
        incluirPisoCaminable
      });
      setSyncStatus({
        type: 'success',
        text: `¡Archivo "${res.fileName}" generado con éxito! Contiene ${res.countLocales} locales y ${res.countBloques} bloques de colisión listos para SketchUp.`
      });
    } catch (err) {
      setSyncStatus({
        type: 'error',
        text: `Error al generar archivo para SketchUp: ${err.message}`
      });
    }
  };

  // Descargar el paquete del plugin .rbz
  const handleDownloadPlugin = () => {
    const a = document.createElement('a');
    a.href = '/plugins/simcity_business.rbz';
    a.download = 'simcity_business.rbz';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Comprobar manualmente sincronización con el servidor local
  const handleCheckLiveSync = async () => {
    setIsCheckingSync(true);
    setSyncStatus({ type: null, text: '' });
    try {
      const res = await fetch('/api/sketchup-sync');
      if (res.ok) {
        const data = await res.json();
        const importRes = importFromSketchupPayload(data);
        const timeNow = new Date().toLocaleTimeString();
        setLastSyncTime(timeNow);
        setSyncStatus({
          type: 'success',
          text: `Sincronización exitosa: ${importRes.totalBloques} bloques de colisión actualizados desde SketchUp (${timeNow}).`
        });
      } else if (res.status === 404) {
        setSyncStatus({
          type: 'info',
          text: 'Servidor local activo. Aún no se han enviado datos desde el botón "Exportar a Proyecto" de SketchUp.'
        });
      } else {
        setSyncStatus({
          type: 'warning',
          text: 'No se pudo contactar el sincronizador local. Utiliza la importación manual de archivo .scb.'
        });
      }
    } catch (err) {
      setSyncStatus({
        type: 'warning',
        text: 'Servidor de sincronización local no disponible en producción. Utiliza el selector de archivo o arrastra tu archivo .scb.'
      });
    } finally {
      setIsCheckingSync(false);
    }
  };

  // Procesar archivo cargado (.scb o .json)
  const processImportFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        const res = importFromSketchupPayload(json);
        const timeNow = new Date().toLocaleTimeString();
        setLastSyncTime(timeNow);
        setSyncStatus({
          type: 'success',
          text: `¡Importación completada! Se actualizaron ${res.totalBloques} bloques en los locales: ${res.negociosAfectados.join(', ')}.`
        });
      } catch (err) {
        setSyncStatus({
          type: 'error',
          text: `Error al procesar archivo de SketchUp: ${err.message}`
        });
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processImportFile(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl text-slate-100 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* ENCABEZADO */}
        <div className="px-6 py-4 bg-gradient-to-r from-red-950/80 via-slate-900 to-amber-950/80 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-600/20 border border-red-500/40 text-red-400">
              <Box className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Conexión Trimble SketchUp 3D
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                  SU 2018 - 2026
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Flujo bidireccional: exporta la maqueta 3D, edita en SketchUp y sincroniza en tiempo real.
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENIDO PRINCIPAL CON SCROLL */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">

          {/* BANNER DE NOTIFICACIÓN DE ESTADO */}
          {syncStatus.text && (
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                syncStatus.type === 'success'
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                  : syncStatus.type === 'error'
                  ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                  : syncStatus.type === 'warning'
                  ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                  : 'bg-blue-950/40 border-blue-500/50 text-blue-200'
              }`}
            >
              {syncStatus.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />}
              {syncStatus.type === 'error' && <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />}
              {syncStatus.type === 'warning' && <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />}
              {syncStatus.type === 'info' && <Info className="w-5 h-5 shrink-0 mt-0.5 text-blue-400" />}
              <span className="text-xs leading-relaxed">{syncStatus.text}</span>
            </div>
          )}

          {/* TARJETA 1: PLUGIN OFICIAL PARA SKETCHUP (.RBZ) */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/70">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">Plugin Oficial: Sim City Business Extension</span>
                  <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Listo (.rbz)
                  </span>
                </div>
                <p className="text-xs text-slate-400 max-w-xl">
                  Añade una barra de 6 herramientas a SketchUp: importador automático, convertidor a Bloques de Colisión, convertidor a Piso Caminable (NavMesh), corte arquitectónico y botón de sincronización directa a la app.
                </p>
              </div>
              <button
                onClick={handleDownloadPlugin}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 font-semibold text-white flex items-center justify-center gap-2 shadow-lg shadow-red-900/40 transition-all shrink-0 text-xs"
              >
                <FolderDown className="w-4 h-4" />
                Descargar Plugin (.rbz)
              </button>
            </div>

            {/* Pasos de instalación */}
            <div className="mt-3 pt-3 border-t border-slate-700/60 grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] text-slate-300">
              <div className="flex items-start gap-1.5">
                <span className="font-bold text-red-400">1.</span>
                <span>En SketchUp abre <b>Ventana &gt; Administrador de Extensiones</b>.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="font-bold text-red-400">2.</span>
                <span>Clic en <b>Instalar extensión</b> y selecciona el archivo <code>simcity_business.rbz</code>.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="font-bold text-red-400">3.</span>
                <span>Aparecerá la barra "Sim City Business 3D". ¡Listo para usar!</span>
              </div>
            </div>
          </div>

          {/* GRID: EXPORTAR A SKETCHUP & IMPORTAR DESDE SKETCHUP */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* COLUMNA IZQUIERDA: EXPORTAR MAQUETA */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Download className="w-4 h-4 text-amber-400" />
                  <h3 className="font-semibold text-white text-sm">
                    1. Exportar Escena 3D a SketchUp
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Configura los componentes que deseas incluir en la exportación:
                </p>

                <div className="space-y-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  {/* Corte arquitectónico */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={corteArquitectonico}
                        onChange={(e) => setCorteArquitectonico(e.target.checked)}
                        className="rounded border-slate-600 text-red-600 focus:ring-red-500"
                      />
                      <span>Corte Arquitectónico de Muros ({alturaCorte}m)</span>
                    </label>
                    <span className="text-[10px] text-amber-400 font-mono">1.20m</span>
                  </div>

                  {/* Piso Caminable */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={incluirPisoCaminable}
                        onChange={(e) => setIncluirPisoCaminable(e.target.checked)}
                        className="rounded border-slate-600 text-red-600 focus:ring-red-500"
                      />
                      <span>Piso Caminable / Aceras (NavMesh)</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Layer NavMesh</span>
                  </div>

                  {/* Bloques de colisión */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={incluirColisiones}
                        onChange={(e) => setIncluirColisiones(e.target.checked)}
                        className="rounded border-slate-600 text-red-600 focus:ring-red-500"
                      />
                      <span>Bloques de Colisión (Mobiliario)</span>
                    </label>
                    <span className="text-[10px] text-rose-400">Editables en SU</span>
                  </div>

                  {/* Mobiliario y Equipos */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={incluirEquipos}
                        onChange={(e) => setIncluirEquipos(e.target.checked)}
                        className="rounded border-slate-600 text-red-600 focus:ring-red-500"
                      />
                      <span>Mobiliario y Equipamiento Funcional</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Cajas, vitrinas</span>
                  </div>

                  {/* Personajes 3D */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={incluirPersonajes}
                        onChange={(e) => setIncluirPersonajes(e.target.checked)}
                        className="rounded border-slate-600 text-red-600 focus:ring-red-500"
                      />
                      <span>Personajes 3D (Empleados / Familia)</span>
                    </label>
                    <span className="text-[10px] text-purple-400">Malla 3D + Ropa</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleExportSketchup}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 font-semibold text-white flex items-center justify-center gap-2 shadow-lg shadow-amber-950/50 transition-all text-xs"
              >
                <Download className="w-4 h-4" />
                Exportar Escena (.scb) para SketchUp
              </button>
            </div>

            {/* COLUMNA DERECHA: SINCRONIZAR E IMPORTAR */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-emerald-400" />
                    <h3 className="font-semibold text-white text-sm">
                      2. Sincronizar desde SketchUp
                    </h3>
                  </div>
                  {lastSyncTime && (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {lastSyncTime}
                    </span>
                  )}
                </div>

                {/* Sincronización en vivo automática */}
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 mb-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      Sincronización Directa HTTP
                    </span>
                    <button
                      onClick={handleCheckLiveSync}
                      disabled={isCheckingSync}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 border border-slate-700 flex items-center gap-1 transition-colors"
                    >
                      <RefreshCw className={`w-3 h-3 ${isCheckingSync ? 'animate-spin' : ''}`} />
                      Comprobar
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Al presionar <b>"Exportar a Proyecto"</b> en la barra de SketchUp, los cambios se envían automáticamente a este simulador sin necesidad de recargar la página.
                  </p>
                </div>

                {/* Dropzone para archivo manual */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                    isDragging
                      ? 'border-emerald-500 bg-emerald-950/20'
                      : 'border-slate-700 hover:border-slate-500 bg-slate-900/40'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".scb,.json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) processImportFile(file);
                    }}
                  />
                  <Upload className="w-6 h-6 text-slate-400" />
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-slate-300">
                      Arrastra tu archivo <b>.scb</b> o haz clic para examinar
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Formato de intercambio de SketchUp Sim City (.scb / .json)
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 text-center">
                Las colisiones modificadas se guardan de inmediato en la nube y recalculan el NavMesh.
              </div>
            </div>

          </div>

        </div>

        {/* PIE DEL MODAL */}
        <div className="px-6 py-3.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Motor de Intercambio 3D Sim City Business v2.0</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
