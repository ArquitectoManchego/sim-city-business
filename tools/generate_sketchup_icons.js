import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPNG(width, height, colorGenerator) {
  const bytesPerPixel = 4;
  const scanlineLength = width * bytesPerPixel;
  const rawData = Buffer.alloc((scanlineLength + 1) * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (scanlineLength + 1);
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * bytesPerPixel;
      const [r, g, b, a] = colorGenerator(x, y, width, height);
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth
  ihdr[9] = 6; // Color type (RGBA)
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace
  const ihdrChunk = createChunk('IHDR', ihdr);

  // IDAT chunk
  const idatChunk = createChunk('IDAT', compressedData);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(12 + len);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const crc = crc32(buf.slice(4, 8 + len));
  buf.writeUInt32BE(crc >>> 0, 8 + len);
  return buf;
}

// Standard CRC32
function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (-(crc & 1) & 0xedb88320);
    }
  }
  return (crc ^ -1) >>> 0;
}

const iconsDir = path.resolve('public/plugins/simcity_business/icons');
fs.mkdirSync(iconsDir, { recursive: true });

const iconConfigs = [
  // 1. Import (Blue tray with green arrow down)
  {
    name: 'import',
    gen: (x, y, w, h) => {
      const cx = w / 2, cy = h / 2;
      // Border / background circle
      const dist = Math.hypot(x - cx, y - cy);
      if (dist > w / 2 - 1) return [0, 0, 0, 0];
      // Arrow
      if (x >= cx - 2 && x <= cx + 1 && y <= cy + 1 && y >= 3) return [34, 197, 94, 255]; // green stem
      if (y >= cy && y <= cy + 4 && Math.abs(x - cx) <= (cy + 4 - y) * 1.5) return [34, 197, 94, 255]; // arrow head
      // Tray
      if (y >= h - 5 && y <= h - 3 && x >= 3 && x <= w - 4) return [59, 130, 246, 255]; // blue bar
      return [15, 23, 42, 220]; // slate dark bg
    }
  },
  // 2. Collision (Red brick cube)
  {
    name: 'collision',
    gen: (x, y, w, h) => {
      const cx = w / 2, cy = h / 2;
      const dist = Math.hypot(x - cx, y - cy);
      if (dist > w / 2 - 1) return [0, 0, 0, 0];
      // Red block
      if (x >= 4 && x <= w - 5 && y >= 4 && y <= h - 5) {
        if (x === 4 || x === w - 5 || y === 4 || y === h - 5) return [255, 255, 255, 230];
        return [239, 68, 68, 255]; // bright red
      }
      return [30, 41, 59, 220];
    }
  },
  // 3. Navmesh (Cyan grid / walking)
  {
    name: 'navmesh',
    gen: (x, y, w, h) => {
      const cx = w / 2, cy = h / 2;
      const dist = Math.hypot(x - cx, y - cy);
      if (dist > w / 2 - 1) return [0, 0, 0, 0];
      // Grid lines
      if ((x % 4 === 0 || y % 4 === 0) && x >= 4 && x <= w - 5 && y >= 4 && y <= h - 5) {
        return [6, 182, 212, 255]; // cyan
      }
      return [15, 23, 42, 230];
    }
  },
  // 4. Corte Arquitectonico (Amber dashed section line across wall)
  {
    name: 'corte',
    gen: (x, y, w, h) => {
      const cx = w / 2, cy = h / 2;
      const dist = Math.hypot(x - cx, y - cy);
      if (dist > w / 2 - 1) return [0, 0, 0, 0];
      // Wall
      if (x >= 5 && x <= w - 6 && y >= 4 && y <= h - 5) {
        // Section cut line in middle
        if (Math.abs(y - cy) <= 1) {
          if (x % 3 !== 0) return [245, 158, 11, 255]; // amber cut line
          return [0, 0, 0, 0];
        }
        return [100, 116, 139, 240];
      }
      return [15, 23, 42, 220];
    }
  },
  // 5. Export (Blue tray with amber arrow up)
  {
    name: 'export',
    gen: (x, y, w, h) => {
      const cx = w / 2, cy = h / 2;
      const dist = Math.hypot(x - cx, y - cy);
      if (dist > w / 2 - 1) return [0, 0, 0, 0];
      // Arrow pointing up
      if (x >= cx - 2 && x <= cx + 1 && y >= cy - 1 && y <= h - 4) return [245, 158, 11, 255];
      if (y <= cy && y >= cy - 4 && Math.abs(x - cx) <= (y - (cy - 4)) * 1.5) return [245, 158, 11, 255];
      // Tray
      if (y <= 4 && y >= 2 && x >= 3 && x <= w - 4) return [59, 130, 246, 255];
      return [15, 23, 42, 220];
    }
  },
  // 6. Sync (Yellow lightning bolt)
  {
    name: 'sync',
    gen: (x, y, w, h) => {
      const cx = w / 2, cy = h / 2;
      const dist = Math.hypot(x - cx, y - cy);
      if (dist > w / 2 - 1) return [0, 0, 0, 0];
      // Lightning bolt
      if ((x - y + w / 3 > 0 && x - y - 1 < 0) || (x - y + w / 2 > 0 && y > cy && x < cx + 3)) {
        return [250, 204, 21, 255]; // bright yellow
      }
      return [15, 23, 42, 240];
    }
  }
];

iconConfigs.forEach(cfg => {
  [16, 32].forEach(size => {
    const png = createPNG(size, size, cfg.gen);
    const filename = path.join(iconsDir, `${cfg.name}_${size}.png`);
    fs.writeFileSync(filename, png);
    console.log(`Generated: ${filename}`);
  });
});

console.log('All toolbar icons generated successfully!');
