import { mkdir, readFile, stat, writeFile, rename } from "node:fs/promises";
import { setTimeout as pause } from "node:timers/promises";
import { restoreSources, saveSnapshot } from "./source-records.mjs";

const dataUrl = new URL("../src/data/paint.generated.json", import.meta.url);
const publicRoot = new URL("../public/", import.meta.url);
const paint = await restoreSources("paint", JSON.parse(await readFile(dataUrl, "utf8")));
const entries = [...new Map(paint.previews.map((preview) => {
  const source = preview.sourceImageUrl ?? preview.image;
  const url = new URL(source);
  if (url.origin !== "https://paint-assets.pokopiamap.com" ||
      !/^\/v1\/[a-z0-9_()/-]+\.webp$/.test(url.pathname)) throw new Error("Unexpected image URL");
  return [source, { source, local: "/images/paint" + url.pathname }];
})).values()];
let completed = 0;
let bytes = 0;
const failures = [];
const queue = entries.values();

async function download() {
  for (const entry of queue) {
    const target = new URL(entry.local.slice(1), publicRoot);
    try {
      const existing = await stat(target).catch(() => null);
      if (existing?.size) {
        bytes += existing.size;
      } else {
        let buffer;
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            const response = await fetch(entry.source, { signal: AbortSignal.timeout(30000) });
            if (response.status === 429 || response.status === 403) {
              throw new Error("Access limited; stop and try again later");
            }
            if (!response.ok) throw new Error("HTTP " + response.status);
            buffer = Buffer.from(await response.arrayBuffer());
            if (buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WEBP") {
              throw new Error("Response is not WebP");
            }
            break;
          } catch (error) {
            if (/Access limited/.test(error.message)) throw error;
            if (attempt === 2) throw error;
            await pause(1000 * (attempt + 1));
          }
        }
        await mkdir(new URL("./", target), { recursive: true });
        const temporary = new URL(target.href + ".part");
        await writeFile(temporary, buffer);
        await rename(temporary, target);
        bytes += buffer.length;
        await pause(100);
      }
    } catch (error) {
      failures.push({ source: entry.source, error: error.message });
      if (/Access limited/.test(error.message)) throw error;
    }
    completed++;
    if (completed % 500 === 0) console.log(`${completed}/${entries.length} processed; ${failures.length} failures`);
  }
}
try {
  await Promise.all(Array.from({ length: 8 }, download));
  if (failures.length) {
    console.error(JSON.stringify(failures, null, 2));
    throw new Error("Some images are missing; rerun to retry. Catalog remains unchanged.");
  }
  const paths = new Map(entries.map((entry) => [entry.source, entry.local]));
  for (const preview of paint.previews) {
    preview.sourceImageUrl ??= preview.image;
    preview.image = paths.get(preview.sourceImageUrl);
  }
  await saveSnapshot("paint", paint);
  console.log(`Saved ${entries.length} images (${(bytes / 1e6).toFixed(1)} MB). Catalog now uses local paths.`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
