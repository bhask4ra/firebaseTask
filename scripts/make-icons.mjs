// Genera pwa-192x192.png y pwa-512x512.png monocromaticos en public/.
// Fondo negro + checkmark blanco. Usa pngjs para no depender de canvas nativo.
import { PNG } from 'pngjs';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public');
mkdirSync(outDir, { recursive: true });

// Rutas (x,y) normalizadas [0..1] del checkmark que dibujamos.
// Dos trazos: (0.22, 0.54) -> (0.42, 0.72) -> (0.78, 0.32)
const path = [
  { from: [0.22, 0.54], to: [0.42, 0.72] },
  { from: [0.42, 0.72], to: [0.78, 0.32] }
];

function distanceToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(px - ax, py - ay);
  let t = ((px - ax) * dx + (py - ay) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + t * dx;
  const cy = ay + t * dy;
  return Math.hypot(px - cx, py - cy);
}

function makePng(size) {
  const png = new PNG({ width: size, height: size });
  const strokePx = Math.round(size * 0.11); // grosor del check

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) << 2;

      // fondo negro
      let r = 0x11, g = 0x11, b = 0x11, a = 0xff;

      // calcula distancia minima a los segmentos del checkmark
      let minDist = Infinity;
      for (const seg of path) {
        const d = distanceToSegment(
          x, y,
          seg.from[0] * size, seg.from[1] * size,
          seg.to[0] * size, seg.to[1] * size
        );
        if (d < minDist) minDist = d;
      }
      if (minDist <= strokePx / 2) {
        r = g = b = 0xff;
      }

      png.data[i] = r;
      png.data[i + 1] = g;
      png.data[i + 2] = b;
      png.data[i + 3] = a;
    }
  }
  return PNG.sync.write(png);
}

for (const size of [192, 512]) {
  const buf = makePng(size);
  const file = join(outDir, `pwa-${size}x${size}.png`);
  writeFileSync(file, buf);
  console.log('ok', file, buf.length, 'bytes');
}
