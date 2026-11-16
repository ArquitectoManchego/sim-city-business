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

console.log('[Packaging] Generando/Verificando archivo de extensión SketchUp .rbz...');

if (!fs.existsSync(rbFile) || !fs.existsSync(subDir)) {
  console.warn('[Packaging] Archivos fuente del plugin no encontrados. Saltando paso de empaquetado.');
  process.exit(0);
}

let packed = false;

// 1. Intentar empaquetar según el sistema operativo
try {
  if (process.platform === 'win32') {
    if (fs.existsSync(zipFile)) fs.unlinkSync(zipFile);
    const psCmd = `Compress-Archive -Path '${rbFile}','${subDir}' -DestinationPath '${zipFile}' -Force`;
    execSync(`powershell -NoProfile -Command "${psCmd}"`, { stdio: 'ignore' });
    if (fs.existsSync(zipFile)) {
      if (fs.existsSync(rbzFile)) fs.unlinkSync(rbzFile);
      fs.renameSync(zipFile, rbzFile);
      packed = true;
    }
  } else {
    // Linux / Mac (e.g. Vercel build container)
    try {
      execSync(`cd "${pluginDir}" && zip -r "${zipFile}" simcity_business.rb simcity_business`, { stdio: 'ignore' });
      if (fs.existsSync(zipFile)) {
        if (fs.existsSync(rbzFile)) fs.unlinkSync(rbzFile);
        fs.renameSync(zipFile, rbzFile);
        packed = true;
      }
    } catch {
      // zip no disponible en el contenedor
    }
  }
} catch (err) {
  console.warn('[Packaging] Nota al empaquetar:', err.message);
}

// 2. Verificar existencia del archivo .rbz final
if (fs.existsSync(rbzFile)) {
  const stats = fs.statSync(rbzFile);
  console.log(`[Packaging] ¡Éxito! Archivo listo: ${rbzFile} (${(stats.size / 1024).toFixed(2)} KB)`);
  process.exit(0);
} else {
  console.warn('[Packaging] No se pudo generar .rbz en este entorno, pero el build continuará.');
  process.exit(0);
}
