import { writeFile } from "node:fs/promises";

const fields = [
  "localNumber", "nationalNumber", "name", "slug", "types", "specialties",
  "height", "weight", "idealEnvironment", "classification", "habitats",
  "climates", "timeAvailability", "spawnZones", "previousEvolution",
  "nextEvolution", "imageUrl",
];

const args = process.argv.slice(2);
const write = args.includes("--write");
const all = args.includes("--all");
const slugs = [...new Set(args.filter((arg) => !["--write", "--all"].includes(arg)))];
const baseUrl = "https://pokopiapi.com/api/v1/pokemon";

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { "Accept-Language": "en" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.json();
}

function makeRecord(data) {
  if (typeof data?.name !== "string" || typeof data?.slug !== "string") {
    throw new Error("Response did not contain a Pokémon record");
  }
  // Keep nested objects intact so names, icon URLs, and habitat rarity survive.
  const details = Object.fromEntries(
    fields.map((field) => [field, data[field] ?? null]),
  );
  return {
    ...details,
    sourceUrl: `${baseUrl}/${encodeURIComponent(data.slug)}?lang=en`,
    verifiedInGame: false,
  };
}

async function fetchAll() {
  const records = [];
  let totalPages = 1;
  let total;
  for (let page = 1; page <= totalPages; page++) {
    const { data, pagination } = await fetchJson(
      `${baseUrl}?lang=en&limit=100&page=${page}`,
    );
    if (!Array.isArray(data) || pagination?.page !== page ||
        !Number.isInteger(pagination.totalPages) || pagination.totalPages < 1 ||
        !Number.isInteger(pagination.total) || pagination.total < 1) {
      throw new Error(`Invalid pagination on page ${page}`);
    }
    if (page === 1) {
      totalPages = pagination.totalPages;
      total = pagination.total;
    } else if (pagination.total !== total || pagination.totalPages !== totalPages) {
      throw new Error("API roster changed during import; try again");
    }
    records.push(...data.map(makeRecord));
  }
  if (records.length !== total || new Set(records.map((record) => record.slug)).size !== total) {
    throw new Error("API returned missing or duplicate records; no snapshot written");
  }
  return records;
}

try {
  if (all && slugs.length) throw new Error("Use --all without individual Pokémon slugs");
  const records = all ? await fetchAll() : [];
  if (!all) {
    for (const slug of slugs.length ? slugs : ["bulbasaur"]) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
        throw new Error(`Invalid Pokémon slug: ${slug}`);
      }
      records.push(makeRecord(await fetchJson(`${baseUrl}/${slug}?lang=en`)));
    }
  }

  const json = JSON.stringify(records, null, 2) + "\n";
  if (write) {
    // This file is a snapshot of the requested slugs. Corrections live separately.
    const output = new URL("../src/data/pokopia.generated.json", import.meta.url);
    await writeFile(output, json, "utf8");
    console.log(`Wrote ${records.length} record(s) to src/data/pokopia.generated.json`);
  } else {
    process.stdout.write(json);
  }
} catch (error) {
  console.error(`Pokopia import failed: ${error.message}`);
  process.exitCode = 1;
}
