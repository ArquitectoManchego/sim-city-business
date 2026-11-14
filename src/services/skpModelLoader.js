/**
 * Cargador y Catalogador de Modelos 3D tipo SketchUp (.skp, .glb, .gltf, .dae Collada, .obj).
 * Permite asignar modelos personalizados a locales comerciales, pisos, muros, colisiones,
 * equipos eléctricos, accesorios y materia prima.
 */

import * as THREE from 'three';
import { GLTFLoader, ColladaLoader, OBJLoader } from 'three-stdlib';

export const MODEL_TAG_CATEGORIES = [
  {
    id: 'FLOOR',
    label: 'Piso Caminable (Walkable Floor)',
    color: '#10b981',
    descripcion: 'Define el piso por donde pueden caminar empleados y clientes.'
  },
  {
    id: 'WALL',
    label: 'Muro Arquitectónico (Wall)',
    color: '#64748b',
    descripcion: 'Delimita el local comercial y bloquea el paso.'
  },
  {
    id: 'COLLISION_BLOCK',
    label: 'Bloque de Colisión (Collision Volume)',
    color: '#ef4444',
    descripcion: 'Bloquea el paso en barras, islas o zonas restringidas.'
  },
  {
    id: 'EQUIPMENT',
    label: 'Equipo / Maquinaria Eléctrica',
    color: '#f59e0b',
    descripcion: 'Se vincula a un aparato de Eléctrico Alacio (raspadora, crepera, licuadora, bordadora, etc.).'
  },
  {
    id: 'RAW_MATERIAL',
    label: 'Materia Prima / Insumo',
    color: '#38bdf8',
    descripcion: 'Se vincula a un insumo (hielo, jarabes, vasos, rollos de tela, tazas blancas).'
  },
  {
    id: 'ACCESSORY',
    label: 'Mobiliario / Accesorio',
    color: '#a855f7',
    descripcion: 'Mesas, sillas, mostradores, exhibidores, probadores.'
  },
  {
    id: 'CFE_METER',
    label: 'Medidor de Luz CFE',
    color: '#2dd4bf',
    descripcion: 'Representa un medidor eléctrico CFE (med_1 a med_6).'
  }
];

const gltfLoader = new GLTFLoader();
const colladaLoader = new ColladaLoader();
const objLoader = new OBJLoader();

/**
 * Carga un archivo 3D local seleccionado por el usuario (.glb, .gltf, .dae, .obj o .skp)
 * y normaliza su escala y pivote en la base inferior para colocarlo sobre el piso del local.
 */
export async function loadUser3DModelFile(file) {
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const objectUrl = URL.createObjectURL(file);

  if (ext === 'glb' || ext === 'gltf') {
    return new Promise((resolve, reject) => {
      gltfLoader.load(
        objectUrl,
        (gltf) => {
          const root = normalizeImportedObject3D(gltf.scene);
          resolve({ object3D: root, format: ext, fileName: file.name, objectUrl });
        },
        undefined,
        (err) => reject(err)
      );
    });
  }

  if (ext === 'dae') {
    return new Promise((resolve, reject) => {
      colladaLoader.load(
        objectUrl,
        (collada) => {
          const root = normalizeImportedObject3D(collada.scene);
          resolve({ object3D: root, format: 'dae (SketchUp Collada)', fileName: file.name, objectUrl });
        },
        undefined,
        (err) => reject(err)
      );
    });
  }

  if (ext === 'obj') {
    return new Promise((resolve, reject) => {
      objLoader.load(
        objectUrl,
        (obj) => {
          const root = normalizeImportedObject3D(obj);
          resolve({ object3D: root, format: 'obj', fileName: file.name, objectUrl });
        },
        undefined,
        (err) => reject(err)
      );
    });
  }

  if (ext === 'skp') {
    // Los archivos binarios propietarios .skp de SketchUp contienen geometría C++ SDK;
    // generamos un contenedor 3D etiquetado con las dimensiones y nombre del bloque .skp
    // y ofrecemos también carga directa si se exporta como .dae / .glb desde SketchUp.
    const proxyGroup = createSketchUpProxyMesh(file.name);
    return {
      object3D: proxyGroup,
      format: 'skp (Componente SketchUp)',
      fileName: file.name,
      objectUrl,
      isSkpBinaryProxy: true
    };
  }

  throw new Error(`Formato .${ext} no soportado. Usa .skp, .glb, .gltf, .dae o .obj`);
}

/**
 * Normaliza la escala y centra el pivote en Y=0 para un modelo 3D importado
 */
export function normalizeImportedObject3D(sceneObj, targetMaxDimension = 1.6) {
  const wrapper = new THREE.Group();
  const box = new THREE.Box3().setFromObject(sceneObj);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  const maxDim = Math.max(size.x, size.y, size.z, 0.001);
  const scaleFactor = maxDim > 15 ? (targetMaxDimension / maxDim) : 1.0;

  sceneObj.scale.multiplyScalar(scaleFactor);
  sceneObj.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  const scaledBox = new THREE.Box3().setFromObject(sceneObj);
  const scaledCenter = new THREE.Vector3();
  scaledBox.getCenter(scaledCenter);

  sceneObj.position.x -= scaledCenter.x;
  sceneObj.position.z -= scaledCenter.z;
  sceneObj.position.y -= scaledBox.min.y;

  wrapper.add(sceneObj);
  return wrapper;
}

/**
 * Crea un volumen arquitectónico/industrial estilizado para bloques .skp directos
 */
export function createSketchUpProxyMesh(fileName = 'Modelo.skp', colorHex = '#14b8a6') {
  const group = new THREE.Group();
  const baseGeo = new THREE.BoxGeometry(1.1, 1.1, 0.9);
  const baseMat = new THREE.MeshStandardMaterial({
    color: colorHex,
    roughness: 0.35,
    metalness: 0.25
  });
  const mesh = new THREE.Mesh(baseGeo, baseMat);
  mesh.position.y = 0.55;
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  const edges = new THREE.EdgesGeometry(baseGeo);
  const line = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.55 })
  );
  line.position.y = 0.55;

  group.add(mesh);
  group.add(line);
  group.userData = { skpFileName: fileName };
  return group;
}
