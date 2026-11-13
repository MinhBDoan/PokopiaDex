import { lazy, Suspense, useEffect, useState } from "react";
import "./App.css";
import { loadOrganizePokemon, regions, type OrganizePokemon } from "./data/pokemon";
import PokedexView from "./components/PokedexView";
const ItemsView = lazy(() => import("./components/ItemsView"));

type Tab = "organize" | "pokedex" | "items" | "regions" | "settings";

const STORAGE_KEY = "pokopiadex-pokemon";

function App() {
  const [activeTab, setActiveTab] = useState<Tab>("organize");
  const [pokemon, setPokemon] = useState(() => loadOrganizePokemon(localStorage.getItem(STORAGE_KEY)));

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pokemon.filter((mon) => mon.assignedRegion !== null).map(({ id, assignedRegion }) => ({ id, assignedRegion }))));
  }, [pokemon]);

  function assignPokemonToRegion(pokemonId: string, region: string | null) {
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

    setPokemon(loadOrganizePokemon(null));
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

          <button className={activeTab === "items" ? "active" : ""}
            onClick={() => setActiveTab("items")}>
            Items
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
  <PokedexView />
)}

          {activeTab === "items" && (
            <Suspense fallback={<p>Loading items…</p>}><ItemsView /></Suspense>
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
  pokemon: OrganizePokemon[];
  regions: string[];
  onAssign: (pokemonId: string, region: string | null) => void;
};

function OrganizeView({ pokemon, regions, onAssign }: OrganizeViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const unassignedPokemon = pokemon.filter((mon) => mon.assignedRegion === null);

  const filteredUnassignedPokemon = unassignedPokemon.filter(
    (mon) =>
      mon.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  return (
    <div
      className="organize-view"
      onDragEnd={() => setDropTarget(null)}
      onDropCapture={() => setDropTarget(null)}
    >
      <section
        className={`pokemon-pool${dropTarget === "unassigned" ? " drop-target" : ""}`}
        onDragLeave={(event) => {
          if (
            event.relatedTarget instanceof Node &&
            event.currentTarget.contains(event.relatedTarget)
          ) {
            return;
          }

          setDropTarget(null);
        }}
        onDragOver={(event) => {
          if (
            event.dataTransfer.types.includes(
              "application/x-pokopiadex-pokemon"
            )
          ) {
            event.preventDefault();
            event.dataTransfer.dropEffect = "move";
            setDropTarget("unassigned");
          }
        }}
        onDrop={(event) => {
          event.preventDefault();

          const draggedId = event.dataTransfer.getData(
            "application/x-pokopiadex-pokemon"
          );

          if (!draggedId) {
            return;
          }

          const pokemonId = draggedId;
          const draggedPokemon = pokemon.find(
            (mon) => mon.id === pokemonId
          );

          if (!draggedPokemon || draggedPokemon.assignedRegion === null) {
            return;
          }

          onAssign(pokemonId, null);
          setSearchTerm("");
        }}
      >
        <h2>Unassigned Pokémon</h2>
        <input
          type="search"
          aria-label="Search unassigned Pokémon"
          placeholder="Search Pokémon by name..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        <div className="pokemon-grid">
          {filteredUnassignedPokemon.map((mon) => (
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
            <div
              className={`region-column${dropTarget === region ? " drop-target" : ""}`}
              key={region}
              onDragLeave={(event) => {
                if (
                  event.relatedTarget instanceof Node &&
                  event.currentTarget.contains(event.relatedTarget)
                ) {
                  return;
                }

                setDropTarget(null);
              }}
              onDragOver={(event) => {
                if (
                  event.dataTransfer.types.includes(
                    "application/x-pokopiadex-pokemon"
                  )
                ) {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                  setDropTarget(region);
                }
              }}
              onDrop={(event) => {
                event.preventDefault();

                const draggedId = event.dataTransfer.getData(
                  "application/x-pokopiadex-pokemon"
                );

                if (!draggedId) {
                  return;
                }

                const pokemonId = draggedId;
                const draggedPokemon = pokemon.find(
                  (mon) => mon.id === pokemonId
                );

                if (!draggedPokemon || draggedPokemon.assignedRegion === region) {
                  return;
                }

                onAssign(pokemonId, region);
              }}
            >
              <h2>{region} ({assignedPokemon.length} Pokémon)</h2>

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
  pokemon: OrganizePokemon;
  regions: string[];
  onAssign: (pokemonId: string, region: string | null) => void;
};

function PokemonCard({ pokemon, regions, onAssign }: PokemonCardProps) {
  const entry = pokemon.entry;
  const spriteUrl = entry?.imageUrl ?? pokemon.spriteUrl;
  const types = entry?.types?.length
    ? entry.types
    : pokemon.type.split("/").map((type) => ({ name: type.trim(), iconUrl: null }));
  const specialtyIcons = entry?.specialties ?? [];

  return (
    <article
      className="pokemon-card"
      draggable
      onDragStart={(event) => {
        if (
          event.target instanceof Element &&
          event.target.closest("select")
        ) {
          event.preventDefault();
          return;
        }

        event.dataTransfer.setData(
          "application/x-pokopiadex-pokemon",
          String(pokemon.id)
        );
        event.dataTransfer.effectAllowed = "move";
      }}
    >

      {entry?.localNumber && (
        <span className="pokemon-number-badge">#{entry.localNumber}</span>
      )}

      {spriteUrl && (
        <img
          src={spriteUrl} loading="lazy"
          alt={pokemon.name}
          className="pokemon-sprite"
          draggable={false}
        />
      )}

      <div>
        <h3>{entry?.name ?? pokemon.name}</h3>
        <div className="type-badges">
          {types.map(({ name: typeName, iconUrl }) => {

            return (
              <span
                key={typeName}
                className={`type-badge type-${typeName.toLowerCase()}`}
              >
                {iconUrl && <img src={iconUrl} alt="" draggable={false} />}
                {typeName}
              </span>
            );
          })}
        </div>
        {specialtyIcons.length > 0 && (
          <div className="specialty-icons" role="group" aria-label="Specialties">
            {specialtyIcons.map(({ name, iconUrl }) => (
              <span key={name} className="type-badge specialty-badge">{iconUrl && <img src={iconUrl} alt="" draggable={false} />}{name}</span>
            ))}
          </div>
        )}
      </div>

      <select
        draggable={false}
        onPointerDown={(event) => event.stopPropagation()}
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
