/**
 * Modal de Importación y Catalogación de Modelos 3D de SketchUp (.skp, .glb, .gltf, .dae, .obj).
 * Permite identificar cada modelo como Piso, Muro, Bloque de Colisión, Equipo Eléctrico,
 * Accesorio, Materia Prima o Medidor CFE y ubicarlo en cualquiera de los negocios.
 */

import React, { useState } from 'react';
import { X, Upload, Box, Layers, Cpu, Package, Trash2, CheckCircle2 } from 'lucide-react';
import { useSceneEditorStore } from '../../store/useSceneEditorStore.js';
import { useGameStore, NEGOCIOS_ACTIVOS_IDS, EQUIPOS_OPERATIVOS_BASE } from '../../store/useGameStore.js';
import { NEGOCIOS_ZONES_3D } from '../../engine/ChoreographyRegistry.js';
import { MATERIAS_PRIMAS_POR_NEGOCIO } from '../../shared/catalogoProductosInsumos.js';
import { MODEL_TAG_CATEGORIES, loadUser3DModelFile, createSketchUpProxyMesh } from '../../services/skpModelLoader.js';

export default function SketchUpImporterModal() {
  const isOpen = useSceneEditorStore((s) => s.isImporterModalOpen);
  const setOpen = useSceneEditorStore((s) => s.setImporterModalOpen);
  const customModels3D = useSceneEditorStore((s) => s.customModels3D);
  const addCustomModel3D = useSceneEditorStore((s) => s.addCustomModel3D);
  const removeCustomModel3D = useSceneEditorStore((s) => s.removeCustomModel3D);
  const focusedNegocioId = useGameStore((s) => s.focusedNegocioId);

  const [selectedNegocio, setSelectedNegocio] = useState(
    NEGOCIOS_ZONES_3D[focusedNegocioId] ? focusedNegocioId : 'hawaiian_paradise'
  );
  const [tagCategory, setTagCategory] = useState('EQUIPMENT');
  const [nombreModelo, setNombreModelo] = useState('');
  const [linkedEquipoKey, setLinkedEquipoKey] = useState('hp_raspadora');
  const [linkedInsumoId, setLinkedInsumoId] = useState('mat_hielo_bloque');
  const [localX, setLocalX] = useState(0);
  const [localZ, setLocalZ] = useState(-1.5);
  const [rotationDeg, setRotationDeg] = useState(0);
  const [width, setWidth] = useState(1.1);
  const [depth, setDepth] = useState(0.9);
  const [height, setHeight] = useState(1.2);
  const [loadingFile, setLoadingFile] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  if (!isOpen) return null;

  const equiposDelNegocio = Object.values(EQUIPOS_OPERATIVOS_BASE).filter(
    (e) => e.negocioId === selectedNegocio
  );
  const insumosDelNegocio = MATERIAS_PRIMAS_POR_NEGOCIO[selectedNegocio] || [];

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoadingFile(true);
    setStatusMsg(null);
    try {
      const loaded = await loadUser3DModelFile(file);
      const cleanName = nombreModelo.trim() || file.name.replace(/\.[^.]+$/, '');
      addCustomModel3D({
        id: `skp_${Date.now()}`,
        nombre: cleanName,
        fileName: file.name,
        format: loaded.format,
        negocioId: selectedNegocio,
        tagCategory,
        linkedEquipoKey: tagCategory === 'EQUIPMENT' ? linkedEquipoKey : null,
        linkedInsumoId: tagCategory === 'RAW_MATERIAL' ? linkedInsumoId : null,
        localX: parseFloat(localX) || 0,
        localY: 0,
        localZ: parseFloat(localZ) || 0,
        rotationDeg: parseFloat(rotationDeg) || 0,
        width: parseFloat(width) || 1.1,
        depth: parseFloat(depth) || 0.9,
        height: parseFloat(height) || 1.2,
        object3D: loaded.object3D
      });
      setStatusMsg(`✅ Modelo "${cleanName}" (${loaded.format}) integrado en ${NEGOCIOS_ZONES_3D[selectedNegocio].nombre}.`);
      setNombreModelo('');
    } catch (err) {
      setStatusMsg(`⚠️ ${err.message}`);
    } finally {
      setLoadingFile(false);
    }
  };

  const handleAddParametricSkpBlock = () => {
    const cleanName = nombreModelo.trim() || `Componente SketchUp (${tagCategory})`;
    const tagInfo = MODEL_TAG_CATEGORIES.find((t) => t.id === tagCategory);
    const proxyObj = createSketchUpProxyMesh(cleanName, tagInfo?.color || '#14b8a6');
    addCustomModel3D({
      id: `skp_block_${Date.now()}`,
      nombre: cleanName,
      fileName: `${cleanName}.skp`,
      format: 'Bloque SketchUp Paramétrico',
      negocioId: selectedNegocio,
      tagCategory,
      linkedEquipoKey: tagCategory === 'EQUIPMENT' ? linkedEquipoKey : null,
      linkedInsumoId: tagCategory === 'RAW_MATERIAL' ? linkedInsumoId : null,
      localX: parseFloat(localX) || 0,
      localY: 0,
      localZ: parseFloat(localZ) || 0,
      rotationDeg: parseFloat(rotationDeg) || 0,
      width: parseFloat(width) || 1.1,
      depth: parseFloat(depth) || 0.9,
      height: parseFloat(height) || 1.2,
      object3D: proxyObj
    });
    setStatusMsg(`✅ Bloque SKP "${cleanName}" agregado a ${NEGOCIOS_ZONES_3D[selectedNegocio].nombre}.`);
    setNombreModelo('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Importador de Modelos 3D SketchUp (`.skp`, `.dae`, `.glb`, `.obj`)
              </h2>
              <p className="text-xs text-slate-400">
                Identifica modelos 3D como Piso, Muros, Bloques de Colisión, Equipos Eléctricos, Accesorios o Materia Prima
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {statusMsg && (
            <div className="p-3 rounded-xl bg-teal-950/80 border border-teal-500/40 text-teal-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Selección de Negocio y Nombre */}
            <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                1. Local Comercial Destino
              </label>
              <select
                value={selectedNegocio}
                onChange={(e) => setSelectedNegocio(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
              >
                {NEGOCIOS_ACTIVOS_IDS.map((nId) => (
                  <option key={nId} value={nId}>
                    {NEGOCIOS_ZONES_3D[nId].nombre} ({NEGOCIOS_ZONES_3D[nId].subtitulo})
                  </option>
                ))}
              </select>

              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 pt-1">
                Nombre o Etiqueta del Modelo 3D
              </label>
              <input
                type="text"
                value={nombreModelo}
                onChange={(e) => setNombreModelo(e.target.value)}
                placeholder="Ej. Máquina Raspados SKP / Mostrador / Bloque Hielo..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>

            {/* Clasificación Semántica del Modelo */}
            <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                2. Identificar Tipo de Elemento en el Juego
              </label>
              <select
                value={tagCategory}
                onChange={(e) => setTagCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
              >
                {MODEL_TAG_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>

              {tagCategory === 'EQUIPMENT' && (
                <div>
                  <label className="block text-xs text-amber-300 font-medium mb-1">
                    Vincular con Aparato Eléctrico de Eléctrico Alacio:
                  </label>
                  <select
                    value={linkedEquipoKey}
                    onChange={(e) => setLinkedEquipoKey(e.target.value)}
                    className="w-full bg-slate-900 border border-amber-500/40 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    {equiposDelNegocio.map((eq) => (
                      <option key={eq.key} value={eq.key}>
                        {eq.nombre} ({eq.wattsNominal}W — {eq.medidorId.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {tagCategory === 'RAW_MATERIAL' && (
                <div>
                  <label className="block text-xs text-sky-300 font-medium mb-1">
                    Vincular con Materia Prima / Stock del Negocio:
                  </label>
                  <select
                    value={linkedInsumoId}
                    onChange={(e) => setLinkedInsumoId(e.target.value)}
                    className="w-full bg-slate-900 border border-sky-500/40 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    {insumosDelNegocio.map((ins) => (
                      <option key={ins.id} value={ins.id}>
                        {ins.nombre} (${ins.costoUnitario}/{ins.unidad})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Coordenadas y Dimensiones de Colisión */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              3. Posición Local en el Negocio y Caja de Colisión (Metros)
            </label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Pos X (m)</span>
                <input
                  type="number"
                  step="0.2"
                  value={localX}
                  onChange={(e) => setLocalX(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white"
                />
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Pos Z (m)</span>
                <input
                  type="number"
                  step="0.2"
                  value={localZ}
                  onChange={(e) => setLocalZ(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white"
                />
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Rotación (°)</span>
                <input
                  type="number"
                  step="15"
                  value={rotationDeg}
                  onChange={(e) => setRotationDeg(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white"
                />
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Ancho X (m)</span>
                <input
                  type="number"
                  step="0.1"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white"
                />
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Fondo Z (m)</span>
                <input
                  type="number"
                  step="0.1"
                  value={depth}
                  onChange={(e) => setDepth(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white"
                />
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Alto Y (m)</span>
                <input
                  type="number"
                  step="0.1"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white"
                />
              </div>
            </div>
          </div>

          {/* Botones de Carga de Archivo 3D */}
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs cursor-pointer transition shadow-lg">
              <Upload className="w-4 h-4" />
              <span>{loadingFile ? 'Cargando modelo 3D...' : 'Subir Archivo .SKP / .DAE / .GLB / .OBJ'}</span>
              <input
                type="file"
                accept=".skp,.glb,.gltf,.dae,.obj"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            <button
              onClick={handleAddParametricSkpBlock}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-semibold text-xs transition"
            >
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Crear Bloque 3D Paramétrico Rápido</span>
            </button>
          </div>

          {/* Lista de Modelos 3D agregados */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Modelos 3D Personalizados en Escena ({customModels3D.length})
            </h3>
            {customModels3D.length === 0 ? (
              <div className="text-xs text-slate-500 bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 text-center">
                Los locales ya cuentan con todos los equipos de Eléctrico Alacio modelados en 3D. Puedes subir tus propios archivos `.skp` / `.glb` / `.dae` aquí para reemplazar o agregar maquinaria, pisos, muros o accesorios.
              </div>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {customModels3D.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-white">{m.nombre}</span>
                      <span className="ml-2 px-2 py-0.5 rounded bg-slate-800 text-teal-300 text-[10px]">
                        {m.tagCategory}
                      </span>
                      <span className="ml-2 text-slate-400">
                        {NEGOCIOS_ZONES_3D[m.negocioId]?.nombre} • ({m.localX}m, {m.localZ}m)
                      </span>
                    </div>
                    <button
                      onClick={() => removeCustomModel3D(m.id)}
                      className="p-1.5 text-rose-400 hover:bg-rose-950/60 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
