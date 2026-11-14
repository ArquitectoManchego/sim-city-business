/**
 * Puente Bidireccional en Tiempo Real entre SIM CITY BUSINESS 3D y Eléctrico Casa Alacio Pérez.
 * Conecta directamente con Firebase Firestore (projectId: "electrico-e2896", colección "proyectos_residenciales").
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import {
  dbService,
  DEFAULT_PROJECTS_LIST,
  DEFAULT_MEDIDORES_CONSORCIO,
  DEFAULT_MEDIDORES_6_CONSORCIO,
  generarSeedAparatos
} from '../shared/firebaseBase.js';
import { identificarNegocioDeAparato, extraerLocalYTipoLimpio } from '../shared/localHelpers.js';

export {
  dbService,
  DEFAULT_PROJECTS_LIST,
  DEFAULT_MEDIDORES_CONSORCIO,
  DEFAULT_MEDIDORES_6_CONSORCIO,
  generarSeedAparatos,
  identificarNegocioDeAparato,
  extraerLocalYTipoLimpio
};

const viteEnv = import.meta?.env || {};
const firebaseConfig = {
  apiKey: viteEnv.VITE_FIREBASE_API_KEY || "AIzaSyDesu5QCfn5XQLV1gVHopB2r9yCDITqTXg",
  authDomain: viteEnv.VITE_FIREBASE_AUTH_DOMAIN || "electrico-e2896.firebaseapp.com",
  projectId: viteEnv.VITE_FIREBASE_PROJECT_ID || "electrico-e2896",
  storageBucket: viteEnv.VITE_FIREBASE_STORAGE_BUCKET || "electrico-e2896.firebasestorage.app",
  messagingSenderId: viteEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || "395232750843",
  appId: viteEnv.VITE_FIREBASE_APP_ID || "1:395232750843:web:4c2550b4017b58c430e01e"
};

let dbInstance = null;
try {
  const existingApps = getApps();
  const app = existingApps.length > 0 ? existingApps[0] : initializeApp(firebaseConfig);
  dbInstance = getFirestore(app);
} catch (err) {
  console.warn('⚠️ Firebase Sync en modo local fallback:', err);
}

let lastWriteTs = 0;

export const simCitySyncService = {
  /**
   * Carga el estado integral desde Eléctrico Alacio (Firestore + LocalStorage fallback)
   */
  async loadConsorcioFullState(proyectoId = 'consorcio_general') {
    const [medidores, aparatos, escenariosPorNegocio] = await Promise.all([
      dbService.getMedidores(proyectoId),
      dbService.getAparatos(proyectoId),
      dbService.getEscenariosPorNegocio(proyectoId, {
        imperia_uniformes: 'medio',
        papeleria_imperiarte: 'medio',
        hawaiian_paradise: 'medio',
        bordados_veracruz: 'medio',
        taller_costura: 'medio',
        taller_publi_imperia: 'medio',
        oficinas_consorcio: 'medio'
      })
    ]);

    let recetasEntrenadas = null;
    let escena3DConfig = null;
    let estadoInventario = null;
    let telemetriaSim3D = null;

    if (dbInstance) {
      try {
        const snap = await getDoc(doc(dbInstance, 'proyectos_residenciales', proyectoId));
        if (snap.exists()) {
          const data = snap.data();
          recetasEntrenadas = data.recetasEntrenadasSim3D || null;
          escena3DConfig = data.escena3DConfig || null;
          estadoInventario = data.estadoInventarioSim3D || null;
          telemetriaSim3D = data.telemetriaSim3D || null;
        }
      } catch (e) {
        console.warn('Error leyendo extensiones 3D de Firestore:', e);
      }
    }

    if (!recetasEntrenadas) {
      try {
        const localRec = localStorage.getItem('simcity_recetas_entrenadas_' + proyectoId);
        if (localRec) recetasEntrenadas = JSON.parse(localRec);
      } catch (e) {}
    }

    if (!escena3DConfig) {
      try {
        const localEsc = localStorage.getItem('simcity_escena3d_config_' + proyectoId);
        if (localEsc) escena3DConfig = JSON.parse(localEsc);
      } catch (e) {}
    }

    return {
      proyectoId,
      medidores: Array.isArray(medidores) && medidores.length > 0 ? medidores : DEFAULT_MEDIDORES_CONSORCIO,
      aparatos: Array.isArray(aparatos) && aparatos.length > 0 ? aparatos : generarSeedAparatos(proyectoId),
      escenariosPorNegocio,
      recetasEntrenadas,
      escena3DConfig,
      estadoInventario,
      telemetriaSim3D
    };
  },

  /**
   * Sincroniza hacia Eléctrico Alacio las horas de operación reales o manuales de los aparatos eléctricos
   */
  async syncAparatosToElectricoAlacio(proyectoId, aparatosActualizados) {
    lastWriteTs = Date.now();
    return await dbService.guardarTodosLosAparatos(proyectoId, aparatosActualizados);
  },

  /**
   * Sincroniza las recetas y tiempos entrenados con Sliders hacia Firestore y Eléctrico Alacio
   */
  async saveRecetasEntrenadas(proyectoId, recetasEntrenadas, aparatosActualizados = null) {
    const ts = Date.now();
    lastWriteTs = ts;
    try {
      localStorage.setItem('simcity_recetas_entrenadas_' + proyectoId, JSON.stringify(recetasEntrenadas));
    } catch (e) {}

    if (aparatosActualizados && Array.isArray(aparatosActualizados)) {
      await dbService.guardarTodosLosAparatos(proyectoId, aparatosActualizados);
    }

    if (dbInstance) {
      try {
        await setDoc(doc(dbInstance, 'proyectos_residenciales', proyectoId), {
          recetasEntrenadasSim3D: recetasEntrenadas,
          recetasEntrenadasUpdatedAt: ts
        }, { merge: true });
      } catch (e) {
        console.warn('Error guardando recetasEntrenadasSim3D en Firestore:', e);
      }
    }
    return true;
  },

  /**
   * Guarda la configuración espacial 3D (pisos, muros, bloques de colisión y modelos .skp/.glb)
   */
  async saveEscena3DConfig(proyectoId, escena3DConfig) {
    const ts = Date.now();
    lastWriteTs = ts;
    try {
      localStorage.setItem('simcity_escena3d_config_' + proyectoId, JSON.stringify(escena3DConfig));
    } catch (e) {}

    if (dbInstance) {
      try {
        await setDoc(doc(dbInstance, 'proyectos_residenciales', proyectoId), {
          escena3DConfig,
          escena3DUpdatedAt: ts
        }, { merge: true });
      } catch (e) {
        console.warn('Error guardando escena3DConfig en Firestore:', e);
      }
    }
    return true;
  },

  /**
   * Sincroniza telemetría de ventas, ingresos y kWh acumulados por negocio y medidor con Eléctrico Alacio
   */
  async syncSimulationTelemetry(proyectoId, telemetria, escenariosPorNegocio = null) {
    const ts = Date.now();
    lastWriteTs = ts;
    if (dbInstance) {
      try {
        const payload = {
          telemetriaSim3D: {
            ...telemetria,
            updatedAt: ts
          }
        };
        if (escenariosPorNegocio) {
          payload.escenariosPorNegocio = escenariosPorNegocio;
          payload.escenariosUpdatedAt = ts;
        }
        await setDoc(doc(dbInstance, 'proyectos_residenciales', proyectoId), payload, { merge: true });
      } catch (e) {
        console.warn('Error sincronizando telemetría 3D con Firestore:', e);
      }
    }
    return true;
  },

  /**
   * Suscripción bidireccional en tiempo real: detecta cambios hechos en Eléctrico Alacio al instante
   */
  subscribeToElectricoAlacio(proyectoId, onUpdateCallback) {
    if (!dbInstance || !proyectoId) return () => {};
    const docRef = doc(dbInstance, 'proyectos_residenciales', proyectoId);
    return onSnapshot(docRef, (snap) => {
      if (!snap.exists() || snap.metadata.hasPendingWrites) return;
      const data = snap.data();
      const maxRemoteTs = Math.max(
        data.medidoresUpdatedAt || 0,
        data.aparatosUpdatedAt || 0,
        data.escenariosUpdatedAt || 0,
        data.recetasEntrenadasUpdatedAt || 0
      );
      if (maxRemoteTs > 0 && Math.abs(maxRemoteTs - lastWriteTs) < 1800) {
        return;
      }
      onUpdateCallback({
        medidores: data.medidores || null,
        aparatos: data.aparatosLista || null,
        escenariosPorNegocio: data.escenariosPorNegocio || null,
        recetasEntrenadas: data.recetasEntrenadasSim3D || null,
        escena3DConfig: data.escena3DConfig || null
      });
    }, (err) => {
      console.warn('Error en suscripción Firestore SimCity:', err);
    });
  }
};
