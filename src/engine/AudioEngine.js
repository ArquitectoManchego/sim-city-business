/**
 * Motor de Audio Ambiental, Receptor Bluetooth / Spotify Connect y Efectos de Máquinas (Web Audio API).
 * - Siempre inicia música ambiental en la tienda al primer gesto del usuario (o en modo auto-resume).
 * - Permite vincular la cuenta de Spotify del celular mediante Spotify Connect (Web Playback SDK)
 *   registrando un dispositivo "SIM CITY BUSINESS • Bocina BT" (MAC SC:B2:4A:90:1F:E8),
 *   o reproducir cualquier playlist/álbum/canción de Spotify directamente.
 * - Sintetiza en tiempo real el sonido real de cada máquina SOLO mientras está operando,
 *   el rechinido específico de la plancha de calor al abrir/cerrar, la campanita de puerta,
 *   murmullo de cafetería/clientes hablando y lavado de trastes.
 */

const STORAGE_KEY = 'sim_city_audio_bt_prefs_v1';

export const BLUETOOTH_DEVICE_INFO = {
  deviceName: 'SIM CITY BUSINESS • Bocina BT',
  macAddress: 'SC:B2:4A:90:1F:E8',
  protocol: 'A2DP / AVRCP • Spotify Connect Bridge',
  defaultSpotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DXdxcBWuJkbcy'
};

const LOFI_CHORDS = [
  [261.63, 329.63, 392.0, 493.88, 587.33], // Cmaj9
  [220.0, 261.63, 329.63, 392.0, 493.88],  // Am9
  [174.61, 220.0, 261.63, 329.63, 392.0],  // Fmaj9
  [196.0, 246.94, 293.66, 349.23, 440.0]   // G13
];

class SimAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.musicGain = null;
    this.ambientGain = null;
    this.sfxGain = null;
    this.noiseBuffer = null;

    this.prefs = this.loadPrefs();
    this.initialized = false;
    this.unlocked = false;

    // Estado de reproducción de música Bluetooth / Spotify
    this.btConnected = true;
    this.spotifyMode = this.prefs.spotifyMode || 'auto_lofi'; // 'auto_lofi' | 'spotify_embed' | 'spotify_connect'
    this.spotifyConnectStatus = 'En espera (Bluetooth listo)';
    this.spotifyPlayer = null;
    this.spotifyDeviceId = null;

    // Loops continuos controlados por tick
    this.activeLoops = {}; // key -> { gainNode, stopFn }
    this.lastChordTime = 0;
    this.chordIndex = 0;
    this.lastMachineTickTime = 0;
    this.lastDoorChimeTime = 0;
    this.lastFlatPressOpenState = {};
    this.prevClientCountByNeg = {};

    // Telemetría en vivo para el modal
    this.liveAudioState = {
      focusedNegocioId: 'hawaiian_paradise',
      activeSounds: [],
      unlocked: false
    };
    this.listeners = new Set();

    // Auto-desbloqueo al primer clic o tecla en la app
    if (typeof window !== 'undefined') {
      const unlockHandler = () => {
        this.ensureUnlocked();
        window.removeEventListener('pointerdown', unlockHandler);
        window.removeEventListener('keydown', unlockHandler);
      };
      window.addEventListener('pointerdown', unlockHandler, { once: true });
      window.addEventListener('keydown', unlockHandler, { once: true });
    }
  }

  loadPrefs() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return {
      muted: false,
      musicVolume: 0.32,
      ambientVolume: 0.45,
      sfxVolume: 0.68,
      spotifyMode: 'auto_lofi',
      spotifyUrl: BLUETOOTH_DEVICE_INFO.defaultSpotifyUrl,
      spotifyClientId: '',
      spotifyAccessToken: ''
    };
  }

  savePrefs() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.prefs));
    } catch {
      // ignore
    }
    this.notify();
  }

  subscribe(cb) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  notify() {
    this.listeners.forEach((cb) => cb(this.getSnapshot()));
  }

  getSnapshot() {
    return {
      ...this.prefs,
      btConnected: this.btConnected,
      spotifyConnectStatus: this.spotifyConnectStatus,
      spotifyDeviceId: this.spotifyDeviceId,
      unlocked: this.unlocked,
      focusedNegocioId: this.liveAudioState.focusedNegocioId,
      activeSounds: this.liveAudioState.activeSounds
    };
  }

  ensureContext() {
    if (this.ctx) return this.ctx;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    this.ctx = new AudioCtx();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.prefs.muted ? 0 : 1;
    this.masterGain.connect(this.ctx.destination);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = this.prefs.musicVolume;
    this.musicGain.connect(this.masterGain);

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.value = this.prefs.ambientVolume;
    this.ambientGain.connect(this.masterGain);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = this.prefs.sfxVolume;
    this.sfxGain.connect(this.masterGain);

    // Buffer de ruido blanco reutilizable (2 segundos)
    const sampleRate = this.ctx.sampleRate;
    const length = sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
    this.initialized = true;
    return this.ctx;
  }

  async ensureUnlocked() {
    const ctx = this.ensureContext();
    if (!ctx) return false;
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {
        return false;
      }
    }
    this.unlocked = ctx.state === 'running';
    this.notify();
    return this.unlocked;
  }

  setVolume(channel, value) {
    const v = Math.max(0, Math.min(1, Number(value) || 0));
    if (channel === 'music') {
      this.prefs.musicVolume = v;
      if (this.musicGain && this.ctx) this.musicGain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.05);
    } else if (channel === 'ambient') {
      this.prefs.ambientVolume = v;
      if (this.ambientGain && this.ctx) this.ambientGain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.05);
    } else if (channel === 'sfx') {
      this.prefs.sfxVolume = v;
      if (this.sfxGain && this.ctx) this.sfxGain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.05);
    }
    this.savePrefs();
  }

  toggleMute() {
    this.prefs.muted = !this.prefs.muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.prefs.muted ? 0 : 1, this.ctx.currentTime, 0.05);
    }
    this.savePrefs();
  }

  setSpotifyConfig(partial) {
    this.prefs = { ...this.prefs, ...partial };
    this.spotifyMode = this.prefs.spotifyMode;
    this.savePrefs();
  }

  /**
   * Conecta Spotify Web Playback SDK para que la tienda aparezca en el Spotify del celular
   * como "SIM CITY BUSINESS • Bocina BT".
   */
  async connectSpotifyWebPlayback(token) {
    if (!token || !token.trim()) return;
    const cleanToken = token.trim();
    this.setSpotifyConfig({ spotifyAccessToken: cleanToken, spotifyMode: 'spotify_connect' });
    this.spotifyConnectStatus = 'Conectando receptor Spotify BT...';
    this.notify();

    if (!window.Spotify) {
      await new Promise((resolve) => {
        window.onSpotifyWebPlaybackSDKReady = resolve;
        const script = document.createElement('script');
        script.src = 'https://sdk.scdn.co/spotify-player.js';
        script.async = true;
        document.body.appendChild(script);
      });
    }

    if (this.spotifyPlayer) {
      try {
        this.spotifyPlayer.disconnect();
      } catch {
        // ignore
      }
    }

    const player = new window.Spotify.Player({
      name: BLUETOOTH_DEVICE_INFO.deviceName,
      getOAuthToken: (cb) => cb(cleanToken),
      volume: this.prefs.musicVolume
    });

    player.addListener('ready', ({ device_id }) => {
      this.spotifyDeviceId = device_id;
      this.spotifyConnectStatus = `Conectado en tu celular como "${BLUETOOTH_DEVICE_INFO.deviceName}"`;
      this.notify();
    });
    player.addListener('not_ready', () => {
      this.spotifyConnectStatus = 'Dispositivo Bluetooth en espera';
      this.notify();
    });
    player.addListener('authentication_error', ({ message }) => {
      this.spotifyConnectStatus = `Error Token Spotify: ${message}`;
      this.notify();
    });

    this.spotifyPlayer = player;
    await player.connect();
  }

  /**
   * Música ambiental Bluetooth automática (acordes cálidos Lo-Fi / Bossa para tiendas)
   */
  tickBackgroundMusic(nowSec) {
    if (!this.unlocked || !this.ctx || this.prefs.muted) return;
    if (this.prefs.spotifyMode !== 'auto_lofi') return;
    if (this.prefs.musicVolume <= 0.01) return;

    if (nowSec - this.lastChordTime < 2.6) return;
    this.lastChordTime = nowSec;

    const chord = LOFI_CHORDS[this.chordIndex % LOFI_CHORDS.length];
    this.chordIndex++;

    const t = this.ctx.currentTime;
    chord.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq * (idx === 0 ? 0.5 : 1), t);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(880, t);

      const peak = idx === 0 ? 0.09 : 0.042;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(peak, t + 0.18 + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(t + idx * 0.03);
      osc.stop(t + 2.55);
    });
  }

  /**
   * Dispara efectos puntuales (campanita de puerta, rechinido de plancha de calor, etc.)
   */
  playDoorBellWithCreak() {
    if (!this.unlocked || !this.ctx || this.prefs.muted) return;
    const t = this.ctx.currentTime;
    if (t - this.lastDoorChimeTime < 1.2) return;
    this.lastDoorChimeTime = t;

    // 1. Campanita de puerta de tienda (dos notas brillantes)
    [1567.98, 2093.0].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + i * 0.11);
      g.gain.setValueAtTime(0.001, t + i * 0.11);
      g.gain.linearRampToValueAtTime(0.14, t + i * 0.11 + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.11 + 0.75);
      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(t + i * 0.11);
      osc.stop(t + i * 0.11 + 0.8);
    });

    // 2. Pequeño rechinido de puerta
    const creakOsc = this.ctx.createOscillator();
    const creakGain = this.ctx.createGain();
    creakOsc.type = 'sawtooth';
    creakOsc.frequency.setValueAtTime(340, t);
    creakOsc.frequency.linearRampToValueAtTime(260, t + 0.18);
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 620;
    bp.Q.value = 6;
    creakGain.gain.setValueAtTime(0.001, t);
    creakGain.gain.linearRampToValueAtTime(0.035, t + 0.04);
    creakGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    creakOsc.connect(bp);
    bp.connect(creakGain);
    creakGain.connect(this.sfxGain);
    creakOsc.start(t);
    creakOsc.stop(t + 0.22);
  }

  /**
   * Rechinido metálico característico de la plancha de calor al abrir o cerrar
   */
  playHeatPressCreak(isClosing) {
    if (!this.unlocked || !this.ctx || this.prefs.muted) return;
    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const bp = this.ctx.createBiquadFilter();
    const g = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'triangle';
    if (isClosing) {
      osc1.frequency.setValueAtTime(640, t);
      osc1.frequency.exponentialRampToValueAtTime(380, t + 0.28);
      osc2.frequency.setValueAtTime(1180, t);
      osc2.frequency.exponentialRampToValueAtTime(790, t + 0.26);
    } else {
      osc1.frequency.setValueAtTime(390, t);
      osc1.frequency.exponentialRampToValueAtTime(690, t + 0.30);
      osc2.frequency.setValueAtTime(780, t);
      osc2.frequency.exponentialRampToValueAtTime(1240, t + 0.28);
    }

    bp.type = 'bandpass';
    bp.frequency.value = 850;
    bp.Q.value = 7;

    g.gain.setValueAtTime(0.001, t);
    g.gain.linearRampToValueAtTime(0.11, t + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);

    osc1.connect(bp);
    osc2.connect(bp);
    bp.connect(g);
    g.connect(this.sfxGain);
    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.36);
    osc2.stop(t + 0.36);
  }

  /**
   * Pulsos cortos rítmicos de máquina, habla, trastes o ambiente cada ~160ms según estado activo
   */
  playPulseSound(kind) {
    if (!this.unlocked || !this.ctx || !this.noiseBuffer || this.prefs.muted) return;
    const t = this.ctx.currentTime;

    if (kind === 'sewing_industrial') {
      // Traqueteo rápido de máquina de coser recta / overlock / collaretera
      for (let i = 0; i < 3; i++) {
        const dt = i * 0.055;
        const src = this.ctx.createBufferSource();
        src.buffer = this.noiseBuffer;
        const bp = this.ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 1600 + (i % 2) * 350;
        bp.Q.value = 3.5;
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0.001, t + dt);
        g.gain.linearRampToValueAtTime(0.09, t + dt + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dt + 0.04);
        src.connect(bp);
        bp.connect(g);
        g.connect(this.sfxGain);
        src.start(t + dt);
        src.stop(t + dt + 0.045);
      }
      return;
    }

    if (kind === 'embroidery_head') {
      // Bordadora industrial multi-aguja
      for (let i = 0; i < 2; i++) {
        const dt = i * 0.075;
        const osc = this.ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(210 + i * 35, t + dt);
        const lp = this.ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 900;
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0.001, t + dt);
        g.gain.linearRampToValueAtTime(0.055, t + dt + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dt + 0.05);
        osc.connect(lp);
        lp.connect(g);
        g.connect(this.sfxGain);
        osc.start(t + dt);
        osc.stop(t + dt + 0.055);
      }
      return;
    }

    if (kind === 'ice_shaver') {
      // Motor raspadora + triturado granular de hielo
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = 112;
      const lp = this.ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 380;
      const gOsc = this.ctx.createGain();
      gOsc.gain.setValueAtTime(0.045, t);
      gOsc.gain.exponentialRampToValueAtTime(0.001, t + 0.17);
      osc.connect(lp);
      lp.connect(gOsc);
      gOsc.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.18);

      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      const hp = this.ctx.createBiquadFilter();
      hp.type = 'bandpass';
      hp.frequency.value = 3400;
      hp.Q.value = 1.6;
      const gN = this.ctx.createGain();
      gN.gain.setValueAtTime(0.075, t);
      gN.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
      src.connect(hp);
      hp.connect(gN);
      gN.connect(this.sfxGain);
      src.start(t);
      src.stop(t + 0.17);
      return;
    }

    if (kind === 'blender') {
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = 235 + Math.random() * 18;
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 650;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.08, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.connect(bp);
      bp.connect(g);
      g.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.19);
      return;
    }

    if (kind === 'espresso_steam' || kind === 'crepe_sizzle') {
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = kind === 'espresso_steam' ? 3100 : 4200;
      bp.Q.value = 1.4;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(kind === 'espresso_steam' ? 0.085 : 0.025, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      src.connect(bp);
      bp.connect(g);
      g.connect(this.sfxGain);
      src.start(t);
      src.stop(t + 0.19);
      return;
    }

    if (kind === 'washing_dishes') {
      // Chorro de agua + tintineo ocasional de loza/vasos
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 1350;
      bp.Q.value = 1.2;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.055, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      src.connect(bp);
      bp.connect(g);
      g.connect(this.sfxGain);
      src.start(t);
      src.stop(t + 0.19);
      if (Math.random() < 0.35) {
        const clink = this.ctx.createOscillator();
        const cg = this.ctx.createGain();
        clink.type = 'sine';
        clink.frequency.value = 2400 + Math.random() * 900;
        cg.gain.setValueAtTime(0.03, t);
        cg.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
        clink.connect(cg);
        cg.connect(this.sfxGain);
        clink.start(t);
        clink.stop(t + 0.1);
      }
      return;
    }

    if (kind === 'people_talking' || kind === 'cafe_ambience') {
      // Murmullo formante suave de personas hablando / cafetería
      const isCafe = kind === 'cafe_ambience';
      if (Math.random() > (isCafe ? 0.45 : 0.65)) return;
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      const baseF = 135 + Math.random() * 110;
      osc.frequency.setValueAtTime(baseF, t);
      osc.frequency.linearRampToValueAtTime(baseF * (0.92 + Math.random() * 0.18), t + 0.14);
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 520 + Math.random() * 380;
      bp.Q.value = 4.5;
      const g = this.ctx.createGain();
      const targetBus = isCafe ? this.ambientGain : this.sfxGain;
      const vol = isCafe ? 0.028 : 0.042;
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(vol, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      osc.connect(bp);
      bp.connect(g);
      g.connect(targetBus);
      osc.start(t);
      osc.stop(t + 0.17);
      return;
    }

    if (kind === 'printer_xerox' || kind === 'cutter_disc' || kind === 'laser_cnc') {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = kind === 'cutter_disc' ? 320 : kind === 'laser_cnc' ? 460 : 190;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.032, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.17);
    }
  }

  /**
   * Sincroniza en tiempo real todos los sonidos del local enfocado por la cámara.
   * Los sonidos de otros locales quedan estrictamente silenciados.
   */
  updateFromSimulation(nowSec, focusedNegocioId, gameState, trainingState) {
    this.tickBackgroundMusic(nowSec);
    if (!gameState) return;

    if (this.liveAudioState.focusedNegocioId !== focusedNegocioId) {
      this.liveAudioState.activeSounds = [];
      this.liveAudioState.focusedNegocioId = focusedNegocioId;
    }

    if (!focusedNegocioId || focusedNegocioId === 'ALL_CONSORCIO') {
      this.liveAudioState.activeSounds = [];
      return;
    }

    // 1. Detectar entrada de nuevos clientes en locales públicos -> Campanita de puerta
    ['hawaiian_paradise', 'imperia_uniformes', 'papeleria_imperiarte'].forEach((negId) => {
      const len = (gameState.clientesColaPorNegocio?.[negId] || []).length;
      const prev = this.prevClientCountByNeg[negId] ?? len;
      if (len > prev && negId === focusedNegocioId) {
        this.playDoorBellWithCreak();
      }
      this.prevClientCountByNeg[negId] = len;
    });

    // 2. Detectar apertura/cierre de plancha de calor (pi_plancha_plana) -> Rechinido real (solo en publi_impresos)
    if (focusedNegocioId === 'publi_impresos') {
      const flatPressRuntime = gameState.equiposRuntime?.pi_plancha_plana;
      const isFlatPressWorking = Boolean(
        flatPressRuntime?.encendido ||
          (trainingState?.isTrainingMode && trainingState?.selectedNegocioId === 'publi_impresos')
      );
      if (
        this.lastFlatPressOpenState.pi_plancha_plana !== undefined &&
        this.lastFlatPressOpenState.pi_plancha_plana !== isFlatPressWorking
      ) {
        this.playHeatPressCreak(isFlatPressWorking);
      }
      this.lastFlatPressOpenState.pi_plancha_plana = isFlatPressWorking;
    }

    // 3. Evaluar sonidos activos cada ~170ms en el negocio enfocado
    if (nowSec - this.lastMachineTickTime < 0.17) return;
    this.lastMachineTickTime = nowSec;

    const activeSounds = [];
    const empList = gameState.empleadosListaPorNegocio?.[focusedNegocioId] || [];
    const cola = gameState.clientesColaPorNegocio?.[focusedNegocioId] || [];
    const post = gameState.clientesPostCompraPorNegocio?.[focusedNegocioId] || [];

    // Ambiente de cafetería en Hawaiian Paradise si hay clientes
    if (focusedNegocioId === 'hawaiian_paradise' && cola.length + post.length > 0) {
      this.playPulseSound('cafe_ambience');
      activeSounds.push('Ambiente Cafetería');
    }

    // Revisar empleados trabajando en el negocio enfocado
    empList.forEach((emp, idx) => {
      if (!emp) return;
      let anim = emp.animacionActual;
      let stepCod = emp.recetaActual?.pasos?.[emp.pasoActualIndex]?.codigo || '';
      let eqKey = emp.recetaActual?.pasos?.[emp.pasoActualIndex]?.equipoKey || '';

      if (idx === 0 && trainingState?.isTrainingMode && trainingState?.selectedNegocioId === focusedNegocioId) {
        const rec = trainingState.recetasEntrenadas?.[trainingState.selectedProductId];
        const st = rec?.pasos?.[trainingState.activeStepIndex];
        anim = st?.animacionVendedor || anim;
        stepCod = st?.codigo || stepCod;
        eqKey = st?.equipoKey || eqKey;
      }

      if (anim === 'OPEN_STORE') {
        this.playDoorBellWithCreak();
        activeSounds.push('Puerta / Campanita');
      }
      if (anim === 'TALK_CLIENT') {
        this.playPulseSound('people_talking');
        activeSounds.push('Conversación con Cliente');
      }
      if (stepCod === 'WASH_HANDS' || stepCod === 'WASH_DISHES' || anim === 'WASH_DISHES') {
        this.playPulseSound('washing_dishes');
        activeSounds.push('Lavado de Trastes / Agua');
      }

      // Sonidos de máquinas SOLO mientras operan activamente
      if (eqKey === 'hp_raspadora' && (anim === 'CRANK_LEFT_HANDLE' || stepCod === 'PUSH_LEVER_SHAVE_ICE' || stepCod === 'SHAVE_ICE')) {
        this.playPulseSound('ice_shaver');
        activeSounds.push('Raspadora de Hielo');
      } else if (eqKey === 'hp_licuadora' && anim === 'WAIT_COOKING') {
        this.playPulseSound('blender');
        activeSounds.push('Licuadora Ninja');
      } else if (eqKey === 'hp_breville' && (anim === 'WAIT_COOKING' || stepCod === 'STEAM_MILK_FOAM' || stepCod === 'EXTRACT_AND_STEAM_MILK')) {
        this.playPulseSound('espresso_steam');
        activeSounds.push('Cafetera Espresso / Vapor');
      } else if (eqKey === 'hp_crepera' && (anim === 'POUR_BATTER' || anim === 'WAIT_COOKING')) {
        this.playPulseSound('crepe_sizzle');
        activeSounds.push('Crepera (Plancha Caliente)');
      } else if (
        (eqKey === 'tc_rectas_singer' || eqKey === 'tc_overlock_5h' || eqKey === 'tc_collaretera_singer') &&
        anim === 'SEW_MACHINE'
      ) {
        this.playPulseSound('sewing_industrial');
        activeSounds.push('Máquina de Coser Industrial');
      } else if (eqKey === 'tc_cortadora' && anim === 'CUT_FABRIC') {
        this.playPulseSound('cutter_disc');
        activeSounds.push('Cortadora de Tela');
      } else if (eqKey === 'tc_plancha_vapor' && anim === 'IRON_PRESS') {
        this.playPulseSound('espresso_steam');
        activeSounds.push('Plancha de Vapor');
      } else if ((eqKey === 'bv_aemco_220' || eqKey === 'bv_melco_emc') && anim === 'WAIT_COOKING') {
        this.playPulseSound('embroidery_head');
        activeSounds.push('Bordadora Multi-Aguja');
      } else if ((eqKey === 'pi_epson' || eqKey === 'pap_docucolor') && (anim === 'WAIT_COOKING' || anim === 'OPERATE_TPV')) {
        this.playPulseSound('printer_xerox');
        activeSounds.push('Impresora / Escáner');
      } else if (eqKey === 'pi_atomstack' && anim === 'WAIT_COOKING') {
        this.playPulseSound('laser_cnc');
        activeSounds.push('Láser CNC');
      }
    });

    this.liveAudioState.activeSounds = Array.from(new Set(activeSounds));
  }
}

export const audioEngine = new SimAudioEngine();
