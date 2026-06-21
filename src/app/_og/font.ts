import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

// Korean font loader for next/og (Satori) in the NODEJS runtime. The article OG
// routes prerender at build time and run on the node runtime (getNewsBySlug
// uses node:fs), so we read the bundled Pretendard from `public/` via fs rather
// than fetch(new URL(...)) (which can't resolve a relative asset URL at build).
let cached: ArrayBuffer | null = null;

export async function loadPretendard(): Promise<ArrayBuffer> {
  if (cached) return cached;
  const buf = await readFile(join(process.cwd(), 'public', 'Pretendard-Bold.otf'));
  const data = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  cached = data;
  return data;
}
