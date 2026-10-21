import { useEffect, useState } from "react";
import "./App.css";
import { regions, starterPokemon, type Pokemon } from "./data/pokemon";

type Tab = "organize" | "pokedex" | "regions" | "settings";

const STORAGE_KEY = "pokopiadex-pokemon";

function App() {
  const [activeTab, setActiveTab] = useState<Tab>("organize");
  const [pokemon, setPokemon] = useState<Pokemon[]>(() => {
    const savedPokemon = localStorage.getItem(STORAGE_KEY);

    if (savedPokemon) {
      return JSON.parse(savedPokemon) as Pokemon[];
    }

    return starterPokemon;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pokemon));
  }, [pokemon]);

  function assignPokemonToRegion(pokemonId: number, region: string | null) {
    setPokemon((currentPokemon) =>
      currentPokemon.map((mon) =>
        mon.id === pokemonId ? { ...mon, assignedRegion: region } : mon
      )
    );
  }

  function resetSavedData() {
    const confirmed = window.confirm(
      "Reset all Pokémon assignments to their defaults? This cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    setPokemon(starterPokemon);
  }

  return (
    <main className="app-shell">
      <section className="pokedex-frame">
        <header className="pokedex-header">
          <div className="lens" />
          <div>
            <p className="eyebrow">Pokopia organizer</p>
            <h1>PokopiaDex</h1>
          </div>
        </header>

        <nav className="tabs">
          <button
            className={activeTab === "organize" ? "active" : ""}
            onClick={() => setActiveTab("organize")}
          >
            Organize
          </button>

          <button
            className={activeTab === "pokedex" ? "active" : ""}
            onClick={() => setActiveTab("pokedex")}
          >
            Pokedex
          </button>

          <button
            className={activeTab === "regions" ? "active" : ""}
            onClick={() => setActiveTab("regions")}
          >
            Regions
          </button>

          <button
            className={activeTab === "settings" ? "active" : ""}
            onClick={() => setActiveTab("settings")}
          >
            Settings
          </button>
        </nav>

        <section className="pokedex-screen">
          {activeTab === "organize" && (
            <OrganizeView
              pokemon={pokemon}
              regions={regions}
              onAssign={assignPokemonToRegion}
            />
          )}

          {activeTab === "pokedex" && (
            <Placeholder title="Pokedex data coming soon" />
          )}

          {activeTab === "regions" && (
            <Placeholder title="Pokopia regions coming soon" />
          )}

          {activeTab === "settings" && (
            <div className="placeholder-panel">
              <h2>Settings</h2>
              <p>Reset saved data to restore the default Pokémon assignments.</p>
              <button onClick={resetSavedData}>
                Reset Saved Data
              </button>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

type OrganizeViewProps = {
  pokemon: Pokemon[];
  regions: string[];
  onAssign: (pokemonId: number, region: string | null) => void;
};

function OrganizeView({ pokemon, regions, onAssign }: OrganizeViewProps) {
  const unassignedPokemon = pokemon.filter((mon) => mon.assignedRegion === null);

  return (
    <div className="organize-view">
      <section className="pokemon-pool">
        <h2>Unassigned Pokémon</h2>

        <div className="pokemon-grid">
          {unassignedPokemon.map((mon) => (
            <PokemonCard
              key={mon.id}
              pokemon={mon}
              regions={regions}
              onAssign={onAssign}
            />
          ))}
        </div>
      </section>

      <section className="region-board">
        {regions.map((region) => {
          const assignedPokemon = pokemon.filter(
            (mon) => mon.assignedRegion === region
          );

          return (
            <div className="region-column" key={region}>
              <h2>{region}</h2>

              <div className="pokemon-stack">
                {assignedPokemon.map((mon) => (
                  <PokemonCard
                    key={mon.id}
                    pokemon={mon}
                    regions={regions}
                    onAssign={onAssign}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}

type PokemonCardProps = {
  pokemon: Pokemon;
  regions: string[];
  onAssign: (pokemonId: number, region: string | null) => void;
};

function PokemonCard({ pokemon, regions, onAssign }: PokemonCardProps) {
  return (
    <article className="pokemon-card">
      {pokemon.spriteUrl && (
        <img src={pokemon.spriteUrl} alt={pokemon.name} className="pokemon-sprite" />
      )}

      <div>
        <h3>{pokemon.name}</h3>
        <div className="type-badges">
          {pokemon.type.split("/").map((type) => {
            const typeName = type.trim();

            return (
              <span
                key={typeName}
                className={`type-badge type-${typeName.toLowerCase()}`}
              >
                {typeName}
              </span>
            );
          })}
        </div>
      </div>

      <select
        value={pokemon.assignedRegion ?? ""}
        onChange={(event) =>
          onAssign(pokemon.id, event.target.value || null)
        }
      >
        <option value="">Unassigned</option>
        {regions.map((region) => (
          <option key={region} value={region}>
            {region}
          </option>
        ))}
      </select>
    </article>
  );
}

type PlaceholderProps = {
  title: string;
};

function Placeholder({ title }: PlaceholderProps) {
  return (
    <div className="placeholder-panel">
      <h2>{title}</h2>
      <p>This tab is reserved for a future PokopiaDex feature.</p>
    </div>
  );
}

export default App;