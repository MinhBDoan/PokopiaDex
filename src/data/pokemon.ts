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
  {
    id: 39,
    name: "Jigglypuff",
    type: "Normal / Fairy",
    assignedRegion: null,
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/39.png",
  },
  {
    id: 10,
    name: "Caterpie",
    type: "Bug",
    assignedRegion: null,
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10.png",
  },
  {
    id: 16,
    name: "Pidgey",
    type: "Normal / Flying",
    assignedRegion: null,
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/16.png",
  },
  {
    id: 19,
    name: "Rattata",
    type: "Normal",
    assignedRegion: null,
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/19.png",
  },
  {
    id: 23,
    name: "Ekans",
    type: "Poison",
    assignedRegion: null,
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/23.png",
  },
  {
    id: 27,
    name: "Sandshrew",
    type: "Ground",
    assignedRegion: null,
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/27.png",
  },
  {
    id: 35,
    name: "Clefairy",
    type: "Fairy",
    assignedRegion: null,
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/35.png",
  },
  {
    id: 37,
    name: "Vulpix",
    type: "Fire",
    assignedRegion: null,
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/37.png",
  },
  {
    id: 41,
    name: "Zubat",
    type: "Poison / Flying",
    assignedRegion: null,
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/41.png",
  },
  {
    id: 43,
    name: "Oddish",
    type: "Grass / Poison",
    assignedRegion: null,
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/43.png",
  },
  {
    id: 50,
    name: "Diglett",
    type: "Ground",
    assignedRegion: null,
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/50.png",
  },
  {
    id: 52,
    name: "Meowth",
    type: "Normal",
    assignedRegion: null,
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/52.png",
  },
  {
    id: 54,
    name: "Psyduck",
    type: "Water",
    assignedRegion: null,
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/54.png",
  },
  {
    id: 66,
    name: "Machop",
    type: "Fighting",
    assignedRegion: null,
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/66.png",
  },
  {
    id: 92,
    name: "Gastly",
    type: "Ghost / Poison",
    assignedRegion: null,
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/92.png",
  }
];