import { readFile } from "node:fs/promises";
import { saveSnapshot } from "./source-records.mjs";
import { existsSync } from "node:fs";

const sourceUrl = "https://pokopiamap.com/paint";
const normalize = (name) => name.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .toLowerCase().replace(/[^a-z0-9]/g, "");

try {
  const response = await fetch(sourceUrl, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const html = await response.text();
  // Read the public page's serialized data without executing page scripts.
  const stream = [...html.matchAll(/self\.__next_f\.push\((\[.*?\])\)<\/script>/gs)]
    .map((match) => JSON.parse(match[1])[1] || "").join("");
  let catalog;
  function visit(value) {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value.paintableItems) && Array.isArray(value.finishPreviews)) catalog = value;
    for (const child of Object.values(value)) visit(child);
  }
  for (const line of stream.split("\n")) {
    let value;
    try { value = JSON.parse(line.slice(line.indexOf(":") + 1)); } catch { continue; }
    visit(value);
  }
  if (!catalog?.finishPreviews.length) throw new Error("Paint catalog not found; page format may have changed");
  const items = JSON.parse(await readFile(new URL("../src/data/items.generated.json", import.meta.url)));
  const finishes = new Map([
    ...catalog.colors.map((color) => ["color:" + color.slug, {
      name: color.name, materials: color.materials,
    }]),
    ...catalog.patterns.map((pattern) => ["pattern:" + pattern.id, {
      name: `Pattern ${pattern.index}`, materials: pattern.materials,
    }]),
  ]);
  const mappings = catalog.paintableItems.map((paintable) => {
    const matches = items.filter((item) => normalize(item.name.en) === normalize(paintable.canonicalName));
    return { ...paintable, itemId: matches.length === 1 ? matches[0].id : null };
  });
  const previews = catalog.finishPreviews.map((preview) => {
    const finish = finishes.get(preview.finishType + ":" + preview.finishId);
    if (!finish || !Number.isInteger(preview.area) || !preview.image.startsWith("https://")) {
      throw new Error("Unexpected paint preview");
    }
    return { ...preview, name: finish.name, materials: finish.materials };
  });
  // The public paint viewer builds pattern-image URLs with this same convention.
  for (const furniture of catalog.patternFurniture) {
    for (const pattern of catalog.patterns) {
      previews.push({
        finishType: "pattern", finishId: pattern.id, itemSlug: furniture.itemSlug, area: 1,
        image: `https://paint-assets.pokopiamap.com/v1/patterns/${furniture.patternAssetSlug}_${String(pattern.index).padStart(3, "0")}.webp`,
        name: `Pattern ${pattern.index}`, materials: pattern.materials,
      });
    }
  }
  // Keep using local copies on subsequent data refreshes.
  for (const preview of previews) {
    const source = preview.image;
    const local = "/images/paint" + new URL(source).pathname;
    if (existsSync(new URL("../public" + local, import.meta.url))) {
      preview.sourceImageUrl = source;
      preview.image = local;
    }
  }
  const output = { sourceUrl, importedAt: new Date().toISOString(), items: mappings, previews };
  await saveSnapshot("paint", output);
  console.log(`Imported ${mappings.length} paintable items and ${previews.length} previews`);
  console.log("Unmatched items:", mappings.filter((item) => !item.itemId).map((item) => item.canonicalName));
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
