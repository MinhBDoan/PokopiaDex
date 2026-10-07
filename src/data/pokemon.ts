export type Pokemon = {
  id: number;
  name: string;
  type: string;
  assignedRegion: string | null;
  spriteUrl?: string;
};

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
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",
  },
  {
    id: 4,
    name: "Charmander",
    type: "Fire",
    assignedRegion: null,
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png",
  },
  {
    id: 7,
    name: "Squirtle",
    type: "Water",
    assignedRegion: null,
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png",
  },
  {
    id: 25,
    name: "Pikachu",
    type: "Electric",
    assignedRegion: null,
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
  },
  {
    id: 133,
    name: "Eevee",
    type: "Normal",
    assignedRegion: null,
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png",
  },
];