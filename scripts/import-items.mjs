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
  const html = await (await get(origin + "/items")).text();
  const chunks = [...new Set([...html.matchAll(/src="([^"]*\/_next\/static\/chunks\/[^"]+\.js[^"]*)"/g)]
    .map((match) => match[1].replaceAll("&amp;", "&")))];
  let items;
  let recipes;
  for (const chunk of chunks) {
    const source = await (await get(new URL(chunk, origin))).text();
    for (const match of source.matchAll(/JSON.parse\('((?:\\.|[^'\\])*)'\)/gs)) {
      const data = JSON.parse(decodeString(match[1]));
      if (Array.isArray(data.items)) {
        items = data.items;
      }
      if (Array.isArray(data.recipes) && data.recipes.some((recipe) => recipe.itemId && recipe.materials)) recipes = data.recipes;
    }
    if (items) break;
  }
  if (!items?.length) throw new Error("Item catalog not found; website format may have changed");
  if (!recipes?.length) throw new Error("Crafting recipes not found; website format may have changed");
  if (new Set(items.map((item) => item.id)).size !== items.length) {
    throw new Error("Duplicate item IDs");
  }
  const normalized = items.map((item) => ({
    ...item,
    description: typeof item.description === "string" ? item.description : item.description?.en ?? "",
    howToObtain: Array.isArray(item.howToObtain) ? item.howToObtain : [],
    sourceImageUrl: item.imageUrl ? new URL(item.imageUrl, origin).href : null,
    imageUrl: item.imageUrl ? `/images/items/${item.id}.png` : null,
    sourceUrl: origin + "/items",
  }));
  if (process.argv.includes("--images")) {
    const directory = new URL("../public/images/items/", import.meta.url);
    await mkdir(directory, { recursive: true });
    const pending = normalized.entries();
    async function downloadIcons() {
    for (const [index, item] of pending) {
      if (!/^I\d+$/.test(item.id)) throw new Error("Unexpected item ID");
      if (!item.sourceImageUrl) continue;
      try { await access(new URL(item.id + ".png", directory)); continue; } catch { /* Download missing files. */ }
      const response = await get(item.sourceImageUrl);
      if (!response.headers.get("content-type")?.startsWith("image/")) {
        throw new Error(`Invalid image: ${item.id}`);
      }
      await writeFile(new URL(item.id + ".png", directory),
        new Uint8Array(await response.arrayBuffer()));
      if (index % 100 === 0) console.log(`Downloaded ${index + 1}/${items.length} icons`);
      await pause(150);
    }
    }
    await Promise.all(Array.from({ length: 4 }, () => downloadIcons()));
  }
  await writeFile(new URL("../src/data/items.generated.json", import.meta.url),
    JSON.stringify(normalized, null, 2) + "\n");
  await writeFile(new URL("../src/data/recipes.generated.json", import.meta.url),
    JSON.stringify(recipes, null, 2) + "\n");
  console.log(`Imported ${items.length} items`);
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
