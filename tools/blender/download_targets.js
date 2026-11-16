import https from 'https';
import fs from 'fs';
import path from 'path';

const TARGET_LIST = [
  // Macro / Gender
  'macrodetails/caucasian-female-young.target.gz',
  'macrodetails/caucasian-male-young.target.gz',
  'macrodetails/african-female-young.target.gz',
  'macrodetails/african-male-young.target.gz',
  'macrodetails/asian-female-young.target.gz',
  'macrodetails/asian-male-young.target.gz',
  'macrodetails/caucasian-female-child.target.gz',
  'macrodetails/caucasian-male-child.target.gz',

  // Breast / Bust
  'breast/breast-volume-vert-up.target.gz',
  'breast/breast-volume-vert-down.target.gz',
  'breast/breast-point-incr.target.gz',
  'breast/breast-point-decr.target.gz',
  'breast/breast-dist-incr.target.gz',
  'breast/breast-dist-decr.target.gz',
  'breast/breast-trans-up.target.gz',
  'breast/breast-trans-down.target.gz',

  // Torso / Waist / V-Shape
  'torso/measure-waist-circ-decr.target.gz',
  'torso/measure-waist-circ-incr.target.gz',
  'torso/measure-bust-circ-incr.target.gz',
  'torso/torso-vshape-incr.target.gz',
  'torso/torso-muscle-pectoral-incr.target.gz',
  'torso/torso-muscle-dorsi-incr.target.gz',

  // Buttocks / Hips / Stomach
  'buttocks/buttocks-volume-incr.target.gz',
  'buttocks/buttocks-volume-decr.target.gz',
  'hip/hip-scale-horiz-incr.target.gz',
  'hip/hip-scale-horiz-decr.target.gz',
  'hip/hip-scale-depth-incr.target.gz',
  'stomach/stomach-tone-incr.target.gz',
  'stomach/stomach-pregnant-incr.target.gz',

  // Arms & Legs Muscle
  'arms/l-upperarm-muscle-incr.target.gz',
  'arms/r-upperarm-muscle-incr.target.gz',
  'arms/l-lowerarm-muscle-incr.target.gz',
  'arms/r-lowerarm-muscle-incr.target.gz',
  'legs/l-upperleg-muscle-incr.target.gz',
  'legs/r-upperleg-muscle-incr.target.gz',
  'legs/l-lowerleg-muscle-incr.target.gz',
  'legs/r-lowerleg-muscle-incr.target.gz',

  // Face & Head
  'chin/chin-prominent-incr.target.gz',
  'chin/chin-width-incr.target.gz',
  'chin/chin-width-decr.target.gz',
  'cheek/l-cheek-volume-incr.target.gz',
  'cheek/r-cheek-volume-incr.target.gz',
  'cheek/l-cheek-volume-decr.target.gz',
  'cheek/r-cheek-volume-decr.target.gz',
  'nose/nose-curve-concave.target.gz',
  'nose/nose-curve-convex.target.gz',
  'nose/nose-flaring-incr.target.gz',
  'nose/nose-flaring-decr.target.gz',
  'mouth/mouth-cupidsbow-incr.target.gz',
  'mouth/mouth-lowerlip-height-incr.target.gz'
];

const BASE_URL = 'https://raw.githubusercontent.com/makehumancommunity/mpfb2/master/src/mpfb/data/targets/';
const OUT_DIR = path.resolve('tools/blender/mpfb_data/targets');

async function downloadFile(relPath) {
  const dest = path.join(OUT_DIR, relPath);
  const dir = path.dirname(dest);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  if (fs.existsSync(dest) && fs.statSync(dest).size > 100) {
    return; // already downloaded
  }

  const url = BASE_URL + relPath;
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        console.warn(`Failed ${res.statusCode} for ${relPath}`);
        res.resume();
        resolve(null);
        return;
      }
      const stream = fs.createWriteStream(dest);
      res.pipe(stream);
      stream.on('finish', () => {
        stream.close();
        resolve(dest);
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log(`Starting download of ${TARGET_LIST.length} targets...`);
  for (let i = 0; i < TARGET_LIST.length; i++) {
    const p = TARGET_LIST[i];
    await downloadFile(p);
    if ((i + 1) % 5 === 0 || i === TARGET_LIST.length - 1) {
      console.log(`Progress: ${i + 1}/${TARGET_LIST.length}`);
    }
  }
  console.log('All targets downloaded successfully!');
}

main();
