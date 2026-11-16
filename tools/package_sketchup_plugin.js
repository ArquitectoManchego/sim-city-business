// tools/package_sketchup_plugin.js
// Empaqueta el plugin de SketchUp en formato .rbz (compatible con Extension Manager de SketchUp 2018 a 2026)
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const pluginDir = path.join(projectRoot, 'public', 'plugins');
const rbFile = path.join(pluginDir, 'simcity_business.rb');
const subDir = path.join(pluginDir, 'simcity_business');
const zipFile = path.join(pluginDir, 'simcity_business.zip');
const rbzFile = path.join(pluginDir, 'simcity_business.rbz');

console.log('[Packaging] Generando archivo de extensión SketchUp .rbz...');

if (!fs.existsSync(rbFile)) {
  console.error(`Error: No existe el archivo base: ${rbFile}`);
  process.exit(1);
}
if (!fs.existsSync(subDir)) {
  console.error(`Error: No existe el directorio de soporte: ${subDir}`);
  process.exit(1);
}

// Eliminar archivos anteriores si existen
if (fs.existsSync(zipFile)) fs.unlinkSync(zipFile);
if (fs.existsSync(rbzFile)) fs.unlinkSync(rbzFile);

try {
  // En Windows PowerShell:
  const psCmd = `Compress-Archive -Path '${rbFile}','${subDir}' -DestinationPath '${zipFile}' -Force`;
  execSync(`powershell -NoProfile -Command "${psCmd}"`, { stdio: 'inherit' });

  if (fs.existsSync(zipFile)) {
    fs.renameSync(zipFile, rbzFile);
    const stats = fs.statSync(rbzFile);
    console.log(`[Packaging] ¡Éxito! Archivo creado: ${rbzFile} (${(stats.size / 1024).toFixed(2)} KB)`);
  } else {
    throw new Error('No se generó el archivo ZIP intermedio.');
  }
} catch (err) {
  console.error('[Packaging] Fallo al empaquetar con PowerShell. Probando método alternativo...', err);
  process.exit(1);
}
