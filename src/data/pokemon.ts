import importedPokemon from "./pokopia.generated.json";

// Reference data is independent of the organizer's saved assignments.
export const pokopiaCatalog = importedPokemon;
export type PokopiaEntry = (typeof pokopiaCatalog)[number];

export type Pokemon = {
  id: number;
  name: string;
  type: string;
  assignedRegion: string | null;
  spriteUrl?: string;
};

export type OrganizePokemon = Omit<Pokemon, "id"> & {
  id: string;
  entry?: PokopiaEntry;
};

export function loadOrganizePokemon(saved: string | null): OrganizePokemon[] {
  const catalog = pokopiaCatalog.map((entry) => ({
    id: entry.slug,
    name: entry.name,
    type: entry.types?.map(({ name }) => name).join(" / ") || "Unknown",
    spriteUrl: entry.imageUrl ?? undefined,
    entry,
  }));
  const ids = new Set(catalog.map(({ id }) => id));
  const legacyIds = new Map(starterPokemon.map((mon) => {
    const slug = mon.name.toLowerCase();
    return [mon.id, ids.has(slug) ? slug : `legacy:${mon.id}`] as const;
  }));
  const assignments = new Map<string, string>();
  try {
    const data = saved ? JSON.parse(saved) : null;
    if (Array.isArray(data)) {
      for (const item of data) {
        if (typeof item?.assignedRegion !== "string") continue;
        const id = typeof item.id === "number" ? legacyIds.get(item.id) : item.id;
        if (typeof id === "string") assignments.set(id, item.assignedRegion);
      }
    }
  } catch {
    // If saved data is unreadable, start with an unassigned catalog.
  }
  return [
    ...catalog.map((mon) => ({ ...mon, assignedRegion: assignments.get(mon.id) ?? null })),
    ...starterPokemon.flatMap((mon) => {
      const id = `legacy:${mon.id}`;
      const assignedRegion = assignments.get(id);
      return assignedRegion === undefined ? [] : [{ ...mon, id, assignedRegion }];
    }),
  ];
}

export const regions = [
  "Withered Wastelands",
  "Rocky Ridges",
  "Bleak Beach",
  "Sparkling Skylands",
  "Palette Town",
  "Bubbly Basin",
];

export const starterPokemon: Pokemon[] = [
  {
    id: 1,
    name: "Bulbasaur",
    type: "Grass",
    assignedRegion: null,
    spriteUrl: "/images/pokemon/bulbasaur.png",
  },
  {
    id: 2,
    name: "Ivysaur",
    type: "Grass",
    assignedRegion: null,
    spriteUrl: "/images/pokemon/ivysaur.png",
  },
  {
    id: 3,
    name: "Venusaur",
    type: "Grass",
    assignedRegion: null,
    spriteUrl: "/images/pokemon/venusaur.png",
  },
  {
    id: 4,
    name: "Charmander",
    type: "Fire",
    assignedRegion: null,
    spriteUrl: "/images/pokemon/charmander.png",
  },
  {
    id: 5,
    name: "Charmeleon",
    type: "Fire",
    assignedRegion: null,
    spriteUrl: "/images/pokemon/charmeleon.png",
  },
  {
    id: 6,
    name: "Charizard",
    type: "Fire / Flying",
    assignedRegion: null,
    spriteUrl: "/images/pokemon/charizard.png",
  },
  {
    id: 7,
    name: "Squirtle",
    type: "Water",
    assignedRegion: null,
    spriteUrl: "/images/pokemon/squirtle.png",
  },
  {
    id: 8,
    name: "Wartortle",
    type: "Water",
    assignedRegion: null,
    spriteUrl: "/images/pokemon/wartortle.png",
  },
  {
    id: 9,
    name: "Blastoise",
    type: "Water",
    assignedRegion: null,
    spriteUrl: "/images/pokemon/blastoise.png",
  },
  {
    id: 16,
    name: "Pidgey",
    type: "Normal / Flying",
    assignedRegion: null,
    spriteUrl: "/images/pokemon/pidgey.png",
  },
  {
    id: 17,
    name: "Pidgeotto",
    type: "Normal / Flying",
    assignedRegion: null,
    spriteUrl: "/images/pokemon/pidgeotto.png",
  },
  {
    id: 18,
    name: "Pidgeot",
    type: "Normal / Flying",
    assignedRegion: null,
    spriteUrl: "/images/pokemon/pidgeot.png",
  },
  {
    id: 23,
    name: "Ekans",
    type: "Poison",
    assignedRegion: null,
    spriteUrl: "/images/pokemon/ekans.png",
  },
  {
    id: 24,
    name: "Arbok",
    type: "Poison",
    assignedRegion: null,
    spriteUrl: "/images/pokemon/arbok.png",
  },
  {
    id: 25,
    name: "Pikachu",
    type: "Electric",
    assignedRegion: null,
    spriteUrl: "/images/pokemon/pikachu.png",
  },
  {
    id: 26,
    name: "Raichu",
    type: "Electric",
    assignedRegion: null,
    spriteUrl: "/images/pokemon/raichu.png",
  },
  {
    id: 35,
    name: "Clefairy",
    type: "Fairy",
    assignedRegion: null,
    spriteUrl: "/images/pokemon/clefairy.png",
  },
  {
    id: 36,
    name: "Clefable",
    type: "Fairy",
    assignedRegion: null,
    spriteUrl: "/images/pokemon/clefable.png",
  },
  {
    id: 133,
    name: "Eevee",
    type: "Normal",
    assignedRegion: null,
    spriteUrl: "/images/pokemon/eevee.png",
  },
  {
    id: 39,
    name: "Jigglypuff",
    type: "Normal / Fairy",
    assignedRegion: null,
    spriteUrl: "/images/pokemon/jigglypuff.png",
  },
  {
    id: 10,
    name: "Caterpie",
    type: "Bug",
    assignedRegion: null,
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10.png",
  },
  
  {
    id: 19,
    name: "Rattata",
    type: "Normal",
    assignedRegion: null,
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/19.png",
  },
  
  {
    id: 27,
    name: "Sandshrew",
    type: "Ground",
    assignedRegion: null,
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/27.png",
  },
  
  {
    id: 37,
    name: "Vulpix",
    type: "Fire",
    assignedRegion: null,
    spriteUrl: "/images/pokemon/vulpix.png",
  },
  {
    id: 41,
    name: "Zubat",
    type: "Poison / Flying",
    assignedRegion: null,
    spriteUrl: "/images/pokemon/zubat.png",
  },
  {
    id: 43,
    name: "Oddish",
    type: "Grass / Poison",
    assignedRegion: null,
    spriteUrl: "/images/pokemon/oddish.png",
  },
  {
    id: 50,
    name: "Diglett",
    type: "Ground",
    assignedRegion: null,
    spriteUrl: "/images/pokemon/diglett.png",
  },
  {
    id: 52,
    name: "Meowth",
    type: "Normal",
    assignedRegion: null,
    spriteUrl: "/images/pokemon/meowth.png",
  },
  {
    id: 54,
    name: "Psyduck",
    type: "Water",
    assignedRegion: null,
    spriteUrl: "/images/pokemon/psyduck.png",
  },
  {
    id: 66,
    name: "Machop",
    type: "Fighting",
    assignedRegion: null,
    spriteUrl: "/images/pokemon/machop.png",
  },
  {
    id: 92,
    name: "Gastly",
    type: "Ghost / Poison",
    assignedRegion: null,
    spriteUrl: "/images/pokemon/gastly.png",
  }
];
