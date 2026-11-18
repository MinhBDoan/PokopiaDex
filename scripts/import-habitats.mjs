import { access, mkdir, writeFile } from "node:fs/promises";
import { setTimeout as pause } from "node:timers/promises";

const origin = "https://pokopiaworld.org";
async function get(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return response;
}

// Decode data strings only. Never execute downloaded JavaScript.
function decodeString(value) {
  return value.replace(/\\(?:u[0-9a-fA-F]{4}|.|\n)/g, (escape) =>
    escape === "\\'" ? "'" : JSON.parse('"' + escape + '"'));
}

try {
  const html = await (await get(origin + "/habitats")).text();
  const chunks = [...new Set([...html.matchAll(/src="([^"]*\/_next\/static\/chunks\/[^"]+\.js[^"]*)"/g)]
    .map((match) => match[1].replaceAll("&amp;", "&")))];
  let habitats;
  let materials;
  
  for (const chunk of chunks) {
    const source = await (await get(new URL(chunk, origin))).text();
    for (const match of source.matchAll(/JSON.parse\('((?:\\.|[^'\\])*)'\)/gs)) {
      const data = JSON.parse(decodeString(match[1]));
      if (Array.isArray(data.habitats)) {
        habitats = data.habitats;
      }
      if (Array.isArray(data.materials)) materials = data.materials;

    }
    if (habitats && materials) break;
  }
  if (!habitats?.length) throw new Error("Habitat catalog not found; website format may have changed");

  if (new Set(habitats.map((item) => item.id)).size !== habitats.length) {
    throw new Error("Duplicate item IDs");
  }
  const normalized = habitats.map((item) => ({
    ...item,
    requiredItems: (item.requiredItems ?? []).map((required) => {
      const material = materials?.find((entry) => entry.id === required.materialId);
      return { ...required, itemName: required.itemName ?? material?.name?.en ?? required.materialId ?? "Unknown material",
        itemId: material?.itemId ?? null };
    }),
    description: typeof item.description === "string" ? item.description : item.description?.en ?? "",
    howToObtain: Array.isArray(item.howToObtain) ? item.howToObtain : [],
    sourceImageUrl: item.imageUrl ? new URL(item.imageUrl, origin).href : null,
    imageUrl: item.imageUrl ? `/images/habitats/${item.id}.webp` : null,
    sourceUrl: origin + "/habitats",
  }));
  if (process.argv.includes("--images")) {
    const directory = new URL("../public/images/habitats/", import.meta.url);
    await mkdir(directory, { recursive: true });
    const pending = normalized.entries();
    async function downloadIcons() {
    for (const [index, item] of pending) {
      if (!/^(?:E)?H\d+$/.test(item.id)) throw new Error("Unexpected habitat ID");
      if (!item.sourceImageUrl) continue;
      try { await access(new URL(item.id + ".webp", directory)); continue; } catch { /* Download missing files. */ }
      const response = await get(item.sourceImageUrl);
      if (!response.headers.get("content-type")?.startsWith("image/")) {
        throw new Error(`Invalid image: ${item.id}`);
      }
      await writeFile(new URL(item.id + ".webp", directory),
        new Uint8Array(await response.arrayBuffer()));
      if (index % 100 === 0) console.log(`Downloaded ${index + 1}/${habitats.length} icons`);
      await pause(150);
    }
    }
    await Promise.all(Array.from({ length: 4 }, () => downloadIcons()));
  }
  await writeFile(new URL("../src/data/habitats.generated.json", import.meta.url),
    JSON.stringify(normalized, null, 2) + "\n");
  if (materials) await writeFile(new URL("../src/data/habitat-materials.generated.json", import.meta.url),
    JSON.stringify(materials, null, 2) + "\n");

  console.log(`Imported ${habitats.length} habitats`);
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
