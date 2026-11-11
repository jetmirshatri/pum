import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { brotliCompress, constants, gzip } from 'node:zlib';

// Run after Vite completes every RSC build phase. Compress only browser output,
// including copied public assets; analysis passes do not write those files.
const outputDirectory = fileURLToPath(
  new URL('../build/client/', import.meta.url)
);
const brotli = promisify(brotliCompress);
const compressGzip = promisify(gzip);
const threshold = 10240;
const eligible = /\.(html|xml|css|json|js|mjs|svg|yaml|yml|toml)$/;
let written = 0;

async function compressDirectory(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await compressDirectory(path);
      continue;
    }
    if (!entry.isFile() || !eligible.test(entry.name)) continue;
    const source = await readFile(path);
    if (source.byteLength < threshold) continue;
    const outputs = await Promise.all([
      brotli(source, {
        params: { [constants.BROTLI_PARAM_QUALITY]: 11 }
      }),
      compressGzip(source, { level: constants.Z_BEST_COMPRESSION })
    ]);
    for (const [index, suffix] of ['.br', '.gz'].entries()) {
      const compressed = outputs[index];
      if (compressed.byteLength >= source.byteLength) continue;
      await writeFile(path + suffix, compressed);
      written++;
    }
  }
}

await compressDirectory(outputDirectory);
console.log(`[vitex] wrote ${written} compressed browser assets`);
