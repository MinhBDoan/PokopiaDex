export type PokopiaDetails = {
  pokopiaDexNumber: string;
  specialties: string[];
  habitats: string[];
  verifiedInGame: boolean;
};

// Keyed by the existing Pokémon ID. Artwork stays in pokemon.ts.
export const pokopiaDetails: Partial<Record<number, PokopiaDetails>> = {
  1: {
    pokopiaDexNumber: "001",
    specialties: ["Grow"],
    habitats: ["Tall Grass"],
    verifiedInGame: false,
  },
};
