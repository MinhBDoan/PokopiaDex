import { mkdir, readFile, writeFile } from "node:fs/promises";

const privateDirectory = new URL("../private/", import.meta.url);
const sourcesFile = new URL("asset-sources.json", privateDirectory);
const fields = new Set(["sourceUrl", "sourceImageUrl"]);

async function readSources() {
  try { return JSON.parse(await readFile(sourcesFile, "utf8")); }
  catch (error) { if (error.code === "ENOENT") return {}; throw error; }
}

export async function saveSnapshot(dataset, data) {
  const sources = await readSources();
  const records = sources[dataset] ?? {};
  function strip(value, path = []) {
    if (Array.isArray(value)) return value.map((item, index) => strip(item, [...path, index]));
    if (!value || typeof value !== "object") return value;
    return Object.fromEntries(Object.entries(value).flatMap(([key, item]) => {
      if (fields.has(key)) {
        records[JSON.stringify([...path, key])] = item;
        return [];
      }
      return [[key, strip(item, [...path, key])]];
    }));
  }
  const clean = strip(data);
  sources[dataset] = records;
  await mkdir(privateDirectory, { recursive: true });
  // Save provenance first so a write failure cannot silently discard it.
  await writeFile(sourcesFile, JSON.stringify(sources, null, 2) + "\n");
  await writeFile(new URL(`../src/data/${dataset}.generated.json`, import.meta.url),
    JSON.stringify(clean, null, 2) + "\n");
}

export async function restoreSources(dataset, data) {
  const sources = await readSources();
  const restored = structuredClone(data);
  for (const [encodedPath, value] of Object.entries(sources[dataset] ?? {})) {
    const path = JSON.parse(encodedPath);
    let target = restored;
    for (const key of path.slice(0, -1)) target = target?.[key];
    if (target && typeof target === "object") target[path.at(-1)] = value;
  }
  return restored;
}
