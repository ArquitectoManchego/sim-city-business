import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';
import { X, RotateCcw, Sparkles, User, Sliders, Shirt, Ruler, Watch } from 'lucide-react';
import { useGameStore, NEGOCIOS_ACTIVOS_IDS } from '../../store/useGameStore.js';
import { NEGOCIOS_ZONES_3D } from '../../engine/ChoreographyRegistry.js';
import {
  SIMS2_SKIN_TONES,
  SIMS2_HAIR_STYLES,
  SIMS2_OUTFIT_TOP_STYLES,
  SIMS2_OUTFIT_BOTTOM_STYLES,
  SIMS2_FABRIC_TYPES,
  SIMS2_ETHNICITIES,
  SIMS2_GLUTE_SHAPES,
  SIMS2_BUST_SHAPES,
  SIMS2_BUST_CUPS,
  SIMS2_EYEBROW_SHAPES,
  SIMS2_ACCESSORIES_CATALOG,
  SIMS2_COMPLEXIONS,
  SIMS2_FACE_SLIDER_GROUPS,
  DEFAULT_FACE_SLIDERS,
  DEFAULT_BODY_MEASUREMENTS,
  preloadSims2Assets,
  createSims2ActorGroup,
  syncSims2ActorProfile,
  animateSims2Actor
} from '../canvas3d/Sims2AvatarLoader.js';

const COLOR_SWATCHES_EYE = ['#2c1e16', '#3d2817', '#1d4ed8', '#15803d', '#0d9488', '#6b7280', '#4c1d95'];
const COLOR_SWATCHES_HAIR = ['#111111', '#2b1b12', '#523421', '#8c5a32', '#d4a359', '#991b1b', '#e2e8f0', '#2563eb'];
const COLOR_SWATCHES_CLOTHES = ['#facc15', '#10b981', '#0ea5e9', '#3b82f6', '#a855f7', '#ec4899', '#f43f5e', '#f97316', '#1e293b', '#f8fafc'];

export default function Sims2CASModal() {
  const isCasStudioOpen = useGameStore((s) => s.isCasStudioOpen);
  const casTargetActorId = useGameStore((s) => s.casTargetActorId);
  const setCasStudioOpen = useGameStore((s) => s.setCasStudioOpen);
  const sims2AvataresConfig = useGameStore((s) => s.sims2AvataresConfig);
  const updateSims2AvatarConfig = useGameStore((s) => s.updateSims2AvatarConfig);
  const empleadosListaPorNegocio = useGameStore((s) => s.empleadosListaPorNegocio);

  const [activeTab, setActiveTab] = useState('genetica'); // 'genetica' | 'cuerpo' | 'rostro' | 'ropa' | 'aura'
  const [cameraFocusMode, setCameraFocusMode] = useState('full'); // 'full' | 'face'
  const canvasHostRef = useRef(null);
  const previewActorRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);

  // Construir lista completa de Sims editables (Gerente, Esposa, Alex, Bárbara y Empleados)
  const actorOptions = useMemo(() => {
    const list = [
      { id: 'gerente', label: '👑 Alex (Gerente General)' },
      { id: 'familia_esposa', label: '👩 Esposa (Familia)' },
      { id: 'familia_alex', label: '👦 Alex Jr. (12 años)' },
      { id: 'familia_barbara', label: '👧 Bárbara (8 años)' }
    ];
    NEGOCIOS_ACTIVOS_IDS.forEach((nId) => {
      const emps = empleadosListaPorNegocio[nId] || [];
      emps.forEach((e) => {
        if (e?.sims2Id) {
          list.push({
            id: e.sims2Id,
            label: `🧑‍💼 ${e.nombre} (${NEGOCIOS_ZONES_3D[nId]?.nombre?.split(' ')[0] || nId})`
          });
        }
      });
    });
    return list;
  }, [empleadosListaPorNegocio]);

  const selectedId = casTargetActorId || 'gerente';
  const profile = sims2AvataresConfig[selectedId] || sims2AvataresConfig.gerente;

  // Escena 3D dedicada del Visor Sims 2 Create-A-Sim
  useEffect(() => {
    if (!isCasStudioOpen || !canvasHostRef.current) return;
    const host = canvasHostRef.current;
    const width = Math.max(260, host.clientWidth || 340);
    const height = Math.max(360, host.clientHeight || 480);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0c2754');

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 40);
    camera.position.set(0, 1.35, 3.1);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.innerHTML = '';
    host.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 0.92, 0);
    controls.minDistance = 0.65;
    controls.maxDistance = 5.5;
    controlsRef.current = controls;

    // Iluminación estudio Create-A-Sim
    scene.add(new THREE.HemisphereLight('#e0f2fe', '#0f172a', 1.45));
    const keyLight = new THREE.DirectionalLight('#ffffff', 1.7);
    keyLight.position.set(2.5, 4.0, 3.2);
    keyLight.castShadow = true;
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight('#38bdf8', 0.9);
    rimLight.position.set(-2.5, 2.2, -2.5);
    scene.add(rimLight);

    // Pedestal circular giratorio clásico CAS
    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.95, 1.05, 0.08, 48),
      new THREE.MeshStandardMaterial({ color: '#1d4ed8', metalness: 0.45, roughness: 0.25 })
    );
    pedestal.position.y = -0.04;
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    const rim = new THREE.Mesh(
      new THREE.RingGeometry(0.92, 0.98, 48),
      new THREE.MeshBasicMaterial({ color: '#4ade80', side: THREE.DoubleSide })
    );
    rim.rotation.x = -Math.PI / 2;
    rim.position.y = 0.005;
    scene.add(rim);

    let rafId = 0;
    const t0 = performance.now();
    preloadSims2Assets().then(() => {
      const actor = createSims2ActorGroup(profile);
      previewActorRef.current = actor;
      scene.add(actor);
    });

    const tick = () => {
      rafId = requestAnimationFrame(tick);
      const nowSec = (performance.now() - t0) / 1000;
      if (previewActorRef.current) {
        animateSims2Actor(previewActorRef.current, 'IDLE_WAIT', false, nowSec);
      }
      controls.update();
      renderer.render(scene, camera);
    };
    rafId = requestAnimationFrame(tick);

    const handleResize = () => {
      if (!host) return;
      const w = Math.max(260, host.clientWidth);
      const h = Math.max(360, host.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      previewActorRef.current = null;
    };
  }, [isCasStudioOpen]);

  // Sincronizar en tiempo real cualquier cambio de slider / color / modelo en el visor 3D
  useEffect(() => {
    if (isCasStudioOpen && previewActorRef.current && profile) {
      syncSims2ActorProfile(previewActorRef.current, profile);
    }
  }, [isCasStudioOpen, profile]);

  // Alternar encuadre Cámara Cuerpo Completo vs Primer Plano Facial
  useEffect(() => {
    if (!cameraRef.current || !controlsRef.current) return;
    const headY = Math.max(1.05, ((profile?.heightCm || 170) / 100) * 0.88);
    if (cameraFocusMode === 'face') {
      cameraRef.current.position.set(0.15, headY + 0.04, 0.92);
      controlsRef.current.target.set(0, headY, 0);
    } else {
      cameraRef.current.position.set(0.35, 1.25, 2.95);
      controlsRef.current.target.set(0, 0.90, 0);
    }
    controlsRef.current.update();
  }, [cameraFocusMode, profile?.heightCm]);

  if (!isCasStudioOpen || !profile) return null;

  const patchProfile = (partial) => updateSims2AvatarConfig(selectedId, partial);
  const patchFaceSlider = (key, value) =>
    updateSims2AvatarConfig(selectedId, {
      faceSliders: { ...(profile.faceSliders || DEFAULT_FACE_SLIDERS), [key]: parseFloat(value) }
    });
  const patchAccessory = (accKey, val) =>
    updateSims2AvatarConfig(selectedId, {
      accessories: { ...(profile.accessories || DEFAULT_BODY_MEASUREMENTS.accessories), [accKey]: val }
    });

  const targetH = Math.max(1.15, (profile.heightCm || 170) / 100);
  const bmi = ((profile.weightKg || 70) / (targetH * targetH)).toFixed(1);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3">
      <div
        className="w-full max-w-6xl h-[88vh] rounded-2xl overflow-hidden shadow-2xl border-2 border-cyan-400/50 flex flex-col"
        style={{ background: 'linear-gradient(135deg, #0b2454 0%, #0f3a85 48%, #071938 100%)' }}
      >
        {/* Cabecera Estilo The Sims 2 Create-A-Sim */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-950/90 via-cyan-900/60 to-blue-950/90 border-b border-cyan-300/30">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/60 text-emerald-300 text-lg">
              💎
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold tracking-wide text-cyan-100 uppercase">
                The Sims 2 — Taller BodyShop & Create-A-Sim (CAS)
              </h2>
              <p className="text-[11px] text-cyan-300/80">
                Edición 3D Esquelética Real (67 Huesos + Morphs Corporales/Faciales + Medidas en Tiempo Real)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              data-testid="cas-actor-select"
              value={selectedId}
              onChange={(e) => setCasStudioOpen(true, e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-cyan-400/40 text-xs font-bold text-cyan-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              {actorOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => setCasStudioOpen(false)}
              className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/40 border border-rose-400/40 text-rose-200 transition"
              title="Cerrar Taller Sims 2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cuerpo Principal: Visor 3D + Controles CAS */}
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12">
          {/* Izquierda: Viewport 3D interactivo */}
          <div className="md:col-span-5 relative flex flex-col border-b md:border-b-0 md:border-r border-cyan-400/25 bg-[#091e42]">
            <div ref={canvasHostRef} className="flex-1 min-h-[300px] w-full cursor-grab active:cursor-grabbing" />

            {/* Botones de Cámara Full / Cara sobre el viewport */}
            <div className="absolute top-3 left-3 flex gap-1.5">
              <button
                onClick={() => setCameraFocusMode('full')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition ${
                  cameraFocusMode === 'full'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                    : 'bg-slate-900/80 text-cyan-100 border-cyan-400/30 hover:bg-slate-800'
                }`}
              >
                🧍 Cuerpo Completo
              </button>
              <button
                onClick={() => setCameraFocusMode('face')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition ${
                  cameraFocusMode === 'face'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                    : 'bg-slate-900/80 text-cyan-100 border-cyan-400/30 hover:bg-slate-800'
                }`}
              >
                🙂 Acercar Rostro
              </button>
            </div>

            {/* Tarjeta de ficha biométrica */}
            <div className="px-3.5 py-2.5 bg-slate-950/75 border-t border-cyan-400/20 flex items-center justify-between text-[11px] text-cyan-100">
              <div>
                <div className="font-bold text-emerald-300">{profile.displayName}</div>
                <div className="text-cyan-200/75">
                  Edad: {profile.age}a · {profile.heightCm} cm · {profile.weightKg} kg (IMC {bmi})
                </div>
              </div>
              <div className="text-right text-[10px] text-cyan-300/85">
                <div>Hombro {profile.shoulderCm}cm · Pecho {profile.bustCm}cm</div>
                <div>Cintura {profile.waistCm}cm · Cadera {profile.hipCm}cm</div>
              </div>
            </div>
          </div>

          {/* Derecha: Pestañas Sims 2 CAS */}
          <div className="md:col-span-7 flex flex-col min-h-0 bg-slate-950/55">
            {/* Tabs CAS */}
            <div className="flex flex-wrap gap-1 px-3 py-2 border-b border-cyan-400/20 bg-blue-950/60">
              {[
                { id: 'genetica', label: 'Genética y Cabello', icon: User },
                { id: 'cuerpo', label: 'Cuerpo, Músculos y Glúteos', icon: Ruler },
                { id: 'rostro', label: 'Etnia, Cejas y Rostro', icon: Sliders },
                { id: 'ropa', label: 'Prendas 3D y Telas', icon: Shirt },
                { id: 'accesorios', label: 'Accesorios 3D', icon: Watch },
                { id: 'aura', label: 'Aura y Plumbob', icon: Sparkles }
              ].map((t) => {
                const Icon = t.icon;
                const active = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    data-testid={`cas-tab-${t.id}`}
                    onClick={() => {
                      setActiveTab(t.id);
                      if (t.id === 'rostro') setCameraFocusMode('face');
                      if (t.id === 'cuerpo' || t.id === 'ropa') setCameraFocusMode('full');
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                      active
                        ? 'bg-cyan-500 text-slate-950 border-cyan-200 shadow-lg shadow-cyan-500/25'
                        : 'bg-slate-900/70 text-cyan-100 border-cyan-400/25 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Contenido de pestaña activa */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-cyan-50">
              {activeTab === 'genetica' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-cyan-300 mb-1">Chasis Esquelético GLB</label>
                      <select
                        value={profile.baseModel || 'male_casual'}
                        onChange={(e) => {
                          const m = e.target.value;
                          patchProfile({ baseModel: m, gender: m.includes('female') ? 'F' : 'M' });
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-cyan-400/30 text-xs font-semibold"
                      >
                        <option value="male_casual">Masculino Casual Veracruz (Polo / Jeans / Tenis)</option>
                        <option value="male_base">Masculino Base Rigged 67 Huesos (GLB)</option>
                        <option value="female_casual">Femenino Casual Veracruz (Polo / Jeans / Tenis)</option>
                        <option value="female_base">Femenino Base Rigged 67 Huesos (GLB)</option>
                        <option value="doctor_male">Médico / Especialista Clínico Masculino (Bata / Uniforme)</option>
                        <option value="doctor_female">Médico / Especialista Clínico Femenino (Bata / Uniforme)</option>
                        <option value="nurse_male">Enfermero Clínico / Quirúrgico (M)</option>
                        <option value="nurse_female">Enfermera Clínica / Quirúrgica (F)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-cyan-300 mb-1">
                        Edad del Sim: <span className="text-emerald-300">{profile.age} años</span>
                      </label>
                      <input
                        type="range"
                        min={6}
                        max={75}
                        value={profile.age ?? 30}
                        onChange={(e) => patchProfile({ age: Number(e.target.value) })}
                        className="w-full accent-cyan-400"
                      />
                    </div>
                  </div>

                  {/* Tonos de Piel S1-S4 Sims 2 + Hex */}
                  <div>
                    <label className="block text-[11px] font-bold text-cyan-300 mb-1.5">
                      Tonos de Piel The Sims 2 (S1–S4) o Color Personalizado
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      {SIMS2_SKIN_TONES.map((st) => (
                        <button
                          key={st.id}
                          onClick={() => patchProfile({ skinTone: st.id, skinColor: st.hex })}
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition ${
                            profile.skinTone === st.id
                              ? 'border-emerald-400 bg-emerald-500/20'
                              : 'border-cyan-400/25 bg-slate-900/70'
                          }`}
                        >
                          <span className="w-4 h-4 rounded-full border border-white/40" style={{ backgroundColor: st.hex }} />
                          {st.id}
                        </button>
                      ))}
                      <input
                        type="color"
                        value={profile.skinColor || '#d8a27c'}
                        onChange={(e) => patchProfile({ skinTone: 'CUSTOM', skinColor: e.target.value })}
                        className="w-8 h-8 rounded cursor-pointer bg-transparent border border-cyan-400/30"
                        title="Color de piel personalizado"
                      />
                    </div>
                  </div>

                  {/* Color de Ojos */}
                  <div>
                    <label className="block text-[11px] font-bold text-cyan-300 mb-1.5">Color de Ojos (Iris PBR)</label>
                    <div className="flex flex-wrap items-center gap-2">
                      {COLOR_SWATCHES_EYE.map((hex) => (
                        <button
                          key={hex}
                          onClick={() => patchProfile({ eyeColor: hex })}
                          className={`w-7 h-7 rounded-full border-2 transition ${
                            profile.eyeColor === hex ? 'border-emerald-400 scale-110' : 'border-white/30'
                          }`}
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                      <input
                        type="color"
                        value={profile.eyeColor || '#2c1e16'}
                        onChange={(e) => patchProfile({ eyeColor: e.target.value })}
                        className="w-8 h-8 rounded cursor-pointer bg-transparent border border-cyan-400/30"
                      />
                    </div>
                  </div>

                  {/* Estilo y Color de Cabello + Lentes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-cyan-300 mb-1">Estilo de Cabello</label>
                      <select
                        value={profile.hairStyle || 'nativo'}
                        onChange={(e) => patchProfile({ hairStyle: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-cyan-400/30 text-xs font-semibold"
                      >
                        {SIMS2_HAIR_STYLES.map((hs) => (
                          <option key={hs.id} value={hs.id}>
                            {hs.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-cyan-400/30 text-xs font-semibold cursor-pointer w-full">
                        <input
                          type="checkbox"
                          checked={Boolean(profile.hasGlasses)}
                          onChange={(e) =>
                            patchProfile({
                              hasGlasses: e.target.checked,
                              baseModel: e.target.checked && profile.baseModel === 'female_base' ? 'female_casual' : profile.baseModel
                            })
                          }
                          className="accent-emerald-400"
                        />
                        Incluir Lentes / Gafas (cuando modelo soporte)
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-cyan-300 mb-1.5">Tinte de Cabello</label>
                    <div className="flex flex-wrap items-center gap-2">
                      {COLOR_SWATCHES_HAIR.map((hex) => (
                        <button
                          key={hex}
                          onClick={() => patchProfile({ hairColor: hex })}
                          className={`w-7 h-7 rounded-full border-2 transition ${
                            profile.hairColor === hex ? 'border-emerald-400 scale-110' : 'border-white/30'
                          }`}
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                      <input
                        type="color"
                        value={profile.hairColor || '#1e1b18'}
                        onChange={(e) => patchProfile({ hairColor: e.target.value })}
                        className="w-8 h-8 rounded cursor-pointer bg-transparent border border-cyan-400/30"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'cuerpo' && (
                <div className="space-y-4">
                  {/* Complexión General */}
                  <div>
                    <label className="block text-[11px] font-bold text-cyan-300 mb-1.5">
                      Complexión Física (Morphs Fits & Fats Sims 2)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {SIMS2_COMPLEXIONS.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => patchProfile({ complexion: c.id })}
                          className={`px-2 py-2 rounded-lg border text-xs font-bold transition ${
                            profile.complexion === c.id
                              ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                              : 'bg-slate-900 text-cyan-100 border-cyan-400/30 hover:bg-slate-800'
                          }`}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Medidas Biométricas Principales en cm */}
                  <div className="p-3 rounded-xl bg-slate-900/65 border border-cyan-400/25 space-y-3">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-cyan-300">Medidas Biométricas (cm)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { key: 'heightCm', label: 'Estatura', min: 115, max: 200, unit: 'cm' },
                        { key: 'weightKg', label: 'Peso Corporal', min: 25, max: 135, unit: 'kg' },
                        { key: 'shoulderCm', label: 'Medida de Hombro', min: 30, max: 58, unit: 'cm' },
                        { key: 'bustCm', label: 'Medida de Pecho / Busto', min: 58, max: 130, unit: 'cm' },
                        { key: 'waistCm', label: 'Medida de Cintura', min: 48, max: 125, unit: 'cm' },
                        { key: 'hipCm', label: 'Medida de Cadera', min: 58, max: 135, unit: 'cm' }
                      ].map((m) => (
                        <div key={m.key} className="p-2.5 rounded-lg bg-slate-950/70 border border-cyan-400/20">
                          <div className="flex justify-between text-xs font-bold mb-1">
                            <span>{m.label}</span>
                            <span className="text-emerald-300">
                              {profile[m.key]} {m.unit}
                            </span>
                          </div>
                          <input
                            type="range"
                            data-testid={`cas-measure-${m.key}`}
                            min={m.min}
                            max={m.max}
                            step={1}
                            value={profile[m.key] ?? m.min}
                            onChange={(e) => patchProfile({ [m.key]: Number(e.target.value) })}
                            className="w-full accent-emerald-400"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Esculpir Musculatura y Extremidades */}
                  <div className="p-3 rounded-xl bg-slate-900/65 border border-cyan-400/25 space-y-3">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-cyan-300">
                      Musculatura y Definición de Extremidades
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { key: 'biceps', label: 'Bíceps (Brazos)', min: -0.5, max: 1.2, step: 0.05, def: 0.12 },
                        { key: 'forearms', label: 'Antebrazos', min: -0.5, max: 1.2, step: 0.05, def: 0.08 },
                        { key: 'quads', label: 'Cuádriceps (Muslos)', min: -0.5, max: 1.2, step: 0.05, def: 0.12 },
                        { key: 'calves', label: 'Chamorros / Gemelos', min: -0.5, max: 1.2, step: 0.05, def: 0.08 },
                        { key: 'abdomenMuscle', label: 'Definición Abdomen', min: 0.0, max: 1.2, step: 0.05, def: 0.18 }
                      ].map((sl) => {
                        const val = profile[sl.key] ?? sl.def;
                        return (
                          <div key={sl.key} className="p-2.5 rounded-lg bg-slate-950/70 border border-cyan-400/20">
                            <div className="flex justify-between text-xs font-bold mb-1">
                              <span>{sl.label}</span>
                              <span className="text-cyan-300">{Number(val).toFixed(2)}</span>
                            </div>
                            <input
                              type="range"
                              min={sl.min}
                              max={sl.max}
                              step={sl.step}
                              value={val}
                              onChange={(e) => patchProfile({ [sl.key]: parseFloat(e.target.value) })}
                              className="w-full accent-cyan-400"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Esculpir Glúteos y Curvatura Anatómica */}
                  <div className="p-3 rounded-xl bg-slate-900/65 border border-cyan-400/25 space-y-3">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-cyan-300">
                      Esculpir Glúteos y Curvatura Anatómica
                    </h4>
                    <div>
                      <label className="block text-[11px] font-bold text-cyan-200 mb-1.5">Forma Anatómica de Glúteos</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {SIMS2_GLUTE_SHAPES.map((g) => (
                          <button
                            key={g.id}
                            onClick={() => patchProfile({ glutesShape: g.id })}
                            className={`px-2 py-1.5 rounded-lg border text-xs font-semibold transition ${
                              (profile.glutesShape || 'redondo') === g.id
                                ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-bold'
                                : 'bg-slate-950 text-cyan-100 border-cyan-400/25 hover:bg-slate-800'
                            }`}
                          >
                            {g.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {[
                        { key: 'glutesVolume', label: 'Volumen General Glúteos', min: 0.0, max: 1.5, step: 0.05, def: 0.18 },
                        { key: 'glutesFat', label: 'Volumen Grasa en Glúteos', min: 0.0, max: 1.2, step: 0.05, def: 0.08 },
                        { key: 'glutesMuscle', label: 'Volumen Músculo en Glúteos', min: 0.0, max: 1.2, step: 0.05, def: 0.18 },
                        { key: 'glutesRoundness', label: 'Redondez de Glúteos', min: 0.0, max: 1.2, step: 0.05, def: 0.35 }
                      ].map((sl) => {
                        const val = profile[sl.key] ?? sl.def;
                        return (
                          <div key={sl.key} className="p-2.5 rounded-lg bg-slate-950/70 border border-cyan-400/20">
                            <div className="flex justify-between text-xs font-bold mb-1">
                              <span>{sl.label}</span>
                              <span className="text-emerald-300">{Number(val).toFixed(2)}</span>
                            </div>
                            <input
                              type="range"
                              min={sl.min}
                              max={sl.max}
                              step={sl.step}
                              value={val}
                              onChange={(e) => patchProfile({ [sl.key]: parseFloat(e.target.value) })}
                              className="w-full accent-emerald-400"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Esculpir Pecho y Busto */}
                  <div className="p-3 rounded-xl bg-slate-900/65 border border-cyan-400/25 space-y-3">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-cyan-300">
                      Esculpir Pecho y Busto (Copa y Silueta)
                    </h4>
                    <div>
                      <label className="block text-[11px] font-bold text-cyan-200 mb-1.5">Tamaño de Copa de Busto</label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {SIMS2_BUST_CUPS.map((cup) => (
                          <button
                            key={cup.id}
                            onClick={() => patchProfile({ bustCup: cup.id })}
                            className={`px-2 py-1.5 rounded-lg border text-xs font-semibold transition ${
                              (profile.bustCup || 'C') === cup.id
                                ? 'bg-emerald-500 text-slate-950 border-emerald-300 font-bold'
                                : 'bg-slate-950 text-cyan-100 border-cyan-400/25 hover:bg-slate-800'
                            }`}
                          >
                            {cup.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-cyan-200 mb-1.5">Forma Anatómica de Busto</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {SIMS2_BUST_SHAPES.map((b) => (
                          <button
                            key={b.id}
                            onClick={() => patchProfile({ bustShape: b.id })}
                            className={`px-2 py-1.5 rounded-lg border text-xs font-semibold transition ${
                              (profile.bustShape || 'semi_esfera') === b.id
                                ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-bold'
                                : 'bg-slate-950 text-cyan-100 border-cyan-400/25 hover:bg-slate-800'
                            }`}
                          >
                            {b.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'rostro' && (
                <div className="space-y-4">
                  {/* Forma de Rostro y Etnicidades */}
                  <div className="p-3 rounded-xl bg-slate-900/65 border border-cyan-400/25 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-cyan-300">
                        Forma de Rostro y Etnicidades (Geometría Ósea)
                      </h4>
                      <button
                        onClick={() => patchProfile({ faceSliders: { ...DEFAULT_FACE_SLIDERS } })}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 border border-cyan-400/30 text-[11px] font-bold"
                      >
                        <RotateCcw className="w-3 h-3" /> Restablecer Rostro
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {SIMS2_ETHNICITIES.map((eth) => (
                        <button
                          key={eth.id}
                          onClick={() => patchProfile({ ethnicity: eth.id })}
                          className={`px-2 py-1.5 rounded-lg border text-xs font-semibold transition ${
                            (profile.ethnicity || 'latino') === eth.id
                              ? 'bg-emerald-500 text-slate-950 border-emerald-300 font-bold'
                              : 'bg-slate-950 text-cyan-100 border-cyan-400/25 hover:bg-slate-800'
                          }`}
                        >
                          {eth.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Diseño y Forma de Cejas */}
                  <div className="p-3 rounded-xl bg-slate-900/65 border border-cyan-400/25 space-y-3">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-cyan-300">
                      Diseño, Grosor y Espesor de Cejas
                    </h4>
                    <div>
                      <label className="block text-[11px] font-bold text-cyan-200 mb-1.5">Forma de Cejas</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {SIMS2_EYEBROW_SHAPES.map((b) => (
                          <button
                            key={b.id}
                            onClick={() => patchProfile({ browShape: b.id })}
                            className={`px-2 py-1.5 rounded-lg border text-xs font-semibold transition ${
                              (profile.browShape || 'arqueadas') === b.id
                                ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-bold'
                                : 'bg-slate-950 text-cyan-100 border-cyan-400/25 hover:bg-slate-800'
                            }`}
                          >
                            {b.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="p-2.5 rounded-lg bg-slate-950/70 border border-cyan-400/20">
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span>Grosor de Cejas</span>
                          <span className="text-cyan-300">{(profile.browThickness ?? 0).toFixed(2)}</span>
                        </div>
                        <input
                          type="range"
                          min={-1}
                          max={1}
                          step={0.05}
                          value={profile.browThickness ?? 0}
                          onChange={(e) => patchProfile({ browThickness: parseFloat(e.target.value) })}
                          className="w-full accent-cyan-400"
                        />
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-950/70 border border-cyan-400/20">
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span>Espesor / Densidad de Cejas</span>
                          <span className="text-cyan-300">{(profile.browDensity ?? 0.3).toFixed(2)}</span>
                        </div>
                        <input
                          type="range"
                          min={-1}
                          max={1}
                          step={0.05}
                          value={profile.browDensity ?? 0.3}
                          onChange={(e) => patchProfile({ browDensity: parseFloat(e.target.value) })}
                          className="w-full accent-cyan-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 27 Sliders Faciales Paramétricos */}
                  {SIMS2_FACE_SLIDER_GROUPS.map((grp) => (
                    <div key={grp.group} className="p-3 rounded-xl bg-slate-900/65 border border-cyan-400/20 space-y-2.5">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-cyan-300">{grp.group}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                        {grp.sliders.map((sl) => {
                          const val = profile.faceSliders?.[sl.key] ?? 0;
                          return (
                            <div key={sl.key}>
                              <div className="flex justify-between text-[11px] font-semibold">
                                <span>{sl.label}</span>
                                <span className="text-cyan-300">{val.toFixed(2)}</span>
                              </div>
                              <input
                                type="range"
                                data-testid={`cas-face-${sl.key}`}
                                min={-1}
                                max={1}
                                step={0.05}
                                value={val}
                                onChange={(e) => patchFaceSlider(sl.key, e.target.value)}
                                className="w-full accent-cyan-400 h-1.5"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'ropa' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Prenda Superior 3D y Tela */}
                    <div className="p-3 rounded-xl bg-slate-900/75 border border-cyan-400/25 space-y-2.5">
                      <div>
                        <label className="block text-xs font-bold text-cyan-300 mb-1">
                          Prenda Superior 3D (Corte / Uniforme)
                        </label>
                        <select
                          value={profile.topStyle || 'polo'}
                          onChange={(e) => patchProfile({ topStyle: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-cyan-400/30 text-xs font-semibold"
                        >
                          {SIMS2_OUTFIT_TOP_STYLES.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-cyan-300 mb-1">
                          Tipo de Tela Superior
                        </label>
                        <select
                          value={profile.topFabric || 'algodon'}
                          onChange={(e) => patchProfile({ topFabric: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-cyan-400/30 text-xs font-semibold"
                        >
                          {SIMS2_FABRIC_TYPES.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-cyan-200 mb-1">Color de Prenda Superior</label>
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {COLOR_SWATCHES_CLOTHES.map((hex) => (
                            <button
                              key={hex}
                              onClick={() => patchProfile({ topColor: hex })}
                              className={`w-6 h-6 rounded-full border-2 ${profile.topColor === hex ? 'border-emerald-400 scale-110' : 'border-white/25'}`}
                              style={{ backgroundColor: hex }}
                            />
                          ))}
                          <input
                            type="color"
                            value={profile.topColor || '#3b82f6'}
                            onChange={(e) => patchProfile({ topColor: e.target.value })}
                            className="w-7 h-7 rounded cursor-pointer bg-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Prenda Inferior 3D y Tela */}
                    <div className="p-3 rounded-xl bg-slate-900/75 border border-cyan-400/25 space-y-2.5">
                      <div>
                        <label className="block text-xs font-bold text-cyan-300 mb-1">
                          Prenda Inferior 3D (Pantalón / Falda)
                        </label>
                        <select
                          value={profile.bottomStyle || 'jeans'}
                          onChange={(e) => patchProfile({ bottomStyle: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-cyan-400/30 text-xs font-semibold"
                        >
                          {SIMS2_OUTFIT_BOTTOM_STYLES.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-cyan-300 mb-1">
                          Tipo de Tela Inferior
                        </label>
                        <select
                          value={profile.bottomFabric || 'mezclilla'}
                          onChange={(e) => patchProfile({ bottomFabric: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-cyan-400/30 text-xs font-semibold"
                        >
                          {SIMS2_FABRIC_TYPES.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-cyan-200 mb-1">Color de Prenda Inferior</label>
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {['#1e293b', '#0f172a', '#1e3a8a', '#064e3b', '#3f3f46', '#78350f', '#f8fafc'].map((hex) => (
                            <button
                              key={hex}
                              onClick={() => patchProfile({ bottomColor: hex })}
                              className={`w-6 h-6 rounded-full border-2 ${profile.bottomColor === hex ? 'border-emerald-400 scale-110' : 'border-white/25'}`}
                              style={{ backgroundColor: hex }}
                            />
                          ))}
                          <input
                            type="color"
                            value={profile.bottomColor || '#1e293b'}
                            onChange={(e) => patchProfile({ bottomColor: e.target.value })}
                            className="w-7 h-7 rounded cursor-pointer bg-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/75 border border-cyan-400/25">
                    <label className="block text-xs font-bold text-cyan-300 mb-2">Color de Calzado</label>
                    <div className="flex items-center gap-2">
                      {['#0f172a', '#1c1917', '#451a03', '#f8fafc', '#1d4ed8', '#dc2626'].map((hex) => (
                        <button
                          key={hex}
                          onClick={() => patchProfile({ shoeColor: hex })}
                          className={`w-7 h-7 rounded-full border-2 ${profile.shoeColor === hex ? 'border-emerald-400 scale-110' : 'border-white/25'}`}
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                      <input
                        type="color"
                        value={profile.shoeColor || '#0f172a'}
                        onChange={(e) => patchProfile({ shoeColor: e.target.value })}
                        className="w-8 h-8 rounded cursor-pointer bg-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'accesorios' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-slate-900/65 border border-cyan-400/25 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-cyan-300">
                        Accesorios 3D Acoplados a Huesos del Esqueleto
                      </h4>
                      <span className="text-[11px] text-emerald-300 font-semibold">
                        Sincronizados en tiempo real a 60 FPS
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Reloj */}
                      <div className="p-2.5 rounded-lg bg-slate-950/70 border border-cyan-400/20 space-y-1">
                        <label className="block text-xs font-bold text-cyan-200">
                          ⌚ Reloj (Muñeca Izquierda)
                        </label>
                        <select
                          value={profile.accessories?.reloj || 'ninguno'}
                          onChange={(e) => patchAccessory('reloj', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-cyan-400/30 text-xs font-semibold text-cyan-50"
                        >
                          {SIMS2_ACCESSORIES_CATALOG.reloj.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Gorra / Sombrero */}
                      <div className="p-2.5 rounded-lg bg-slate-950/70 border border-cyan-400/20 space-y-1">
                        <label className="block text-xs font-bold text-cyan-200">
                          🧢 Gorra / Sombrero (Cabeza)
                        </label>
                        <select
                          value={profile.accessories?.gorra || 'ninguno'}
                          onChange={(e) => patchAccessory('gorra', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-cyan-400/30 text-xs font-semibold text-cyan-50"
                        >
                          {SIMS2_ACCESSORIES_CATALOG.gorra.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Lentes 3D */}
                      <div className="p-2.5 rounded-lg bg-slate-950/70 border border-cyan-400/20 space-y-1">
                        <label className="block text-xs font-bold text-cyan-200">
                          👓 Lentes 3D (Rostro)
                        </label>
                        <select
                          value={profile.accessories?.lentes || 'ninguno'}
                          onChange={(e) => patchAccessory('lentes', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-cyan-400/30 text-xs font-semibold text-cyan-50"
                        >
                          {SIMS2_ACCESSORIES_CATALOG.lentes.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Pulsera */}
                      <div className="p-2.5 rounded-lg bg-slate-950/70 border border-cyan-400/20 space-y-1">
                        <label className="block text-xs font-bold text-cyan-200">
                          📿 Pulsera (Muñeca Derecha)
                        </label>
                        <select
                          value={profile.accessories?.pulsera || 'ninguno'}
                          onChange={(e) => patchAccessory('pulsera', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-cyan-400/30 text-xs font-semibold text-cyan-50"
                        >
                          {SIMS2_ACCESSORIES_CATALOG.pulsera.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Collar */}
                      <div className="p-2.5 rounded-lg bg-slate-950/70 border border-cyan-400/20 space-y-1">
                        <label className="block text-xs font-bold text-cyan-200">
                          💎 Collar (Cuello)
                        </label>
                        <select
                          value={profile.accessories?.collar || 'ninguno'}
                          onChange={(e) => patchAccessory('collar', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-cyan-400/30 text-xs font-semibold text-cyan-50"
                        >
                          {SIMS2_ACCESSORIES_CATALOG.collar.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Aretes */}
                      <div className="p-2.5 rounded-lg bg-slate-950/70 border border-cyan-400/20 space-y-1">
                        <label className="block text-xs font-bold text-cyan-200">
                          ✨ Aretes (Orejas)
                        </label>
                        <select
                          value={profile.accessories?.aretes || 'ninguno'}
                          onChange={(e) => patchAccessory('aretes', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-cyan-400/30 text-xs font-semibold text-cyan-50"
                        >
                          {SIMS2_ACCESSORIES_CATALOG.aretes.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'aura' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-900/75 border border-cyan-400/25 space-y-3">
                    <label className="flex items-center gap-2.5 text-xs font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(profile.hasAura)}
                        onChange={(e) => patchProfile({ hasAura: e.target.checked })}
                        className="accent-amber-400 w-4 h-4"
                      />
                      Activar Aura Luminosa / Glow Distinguible (Gerente y Familia)
                    </label>
                    <label className="flex items-center gap-2.5 text-xs font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(profile.showPlumbob)}
                        onChange={(e) => patchProfile({ showPlumbob: e.target.checked })}
                        className="accent-emerald-400 w-4 h-4"
                      />
                      Mostrar Plumbob Flotante Sims 2 sobre el Sim
                    </label>
                    <div>
                      <label className="block text-[11px] font-bold text-cyan-300 mb-1.5">Color del Brillo / Aura</label>
                      <div className="flex items-center gap-2">
                        {['#facc15', '#f472b6', '#38bdf8', '#c084fc', '#4ade80', '#fb923c'].map((hex) => (
                          <button
                            key={hex}
                            onClick={() => patchProfile({ auraColor: hex })}
                            className={`w-7 h-7 rounded-full border-2 ${profile.auraColor === hex ? 'border-white scale-110' : 'border-white/30'}`}
                            style={{ backgroundColor: hex }}
                          />
                        ))}
                        <input
                          type="color"
                          value={profile.auraColor || '#facc15'}
                          onChange={(e) => patchProfile({ auraColor: e.target.value })}
                          className="w-8 h-8 rounded cursor-pointer bg-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
