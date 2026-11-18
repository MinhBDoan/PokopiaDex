import { lazy, Suspense, useEffect, useState } from "react";
import "./App.css";
import { loadOrganizePokemon, regions } from "./data/pokemon";
import PokedexView from "./components/PokedexView";
import OrganizeView from "./components/OrganizeView";
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
