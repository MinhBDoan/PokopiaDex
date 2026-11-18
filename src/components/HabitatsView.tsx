import { useState } from "react";
import importedHabitats from "../data/habitats.generated.json";
import items from "../data/items.generated.json";
import { pokopiaCatalog } from "../data/pokemon";

type Habitat = {
  id: string;
  name: { en: string };
  imageUrl: string | null;
  requiredItems: { itemName: string; quantity: number; itemId: string | null; materialId?: string }[];
  pokemonNames: string[];
  description: string;
  location?: string;
};
const habitats: Habitat[] = importedHabitats;
const pageSize = 60;
const normalize = (name: string) => name.trim().toLowerCase();
const itemsByName = new Map(items.map((item) => [normalize(item.name.en), item]));
const itemsById = new Map(items.map((item) => [item.id, item]));
const pokemonByName = new Map(pokopiaCatalog.map((mon) => [normalize(mon.name), mon]));

export default function HabitatsView() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = habitats.find((habitat) => habitat.id === selectedId);
  const query = normalize(search);
  const filtered = habitats.filter((habitat) =>
    normalize(habitat.name.en).includes(query) ||
    habitat.pokemonNames.some((name) => normalize(name).includes(query)));
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pages - 1);

  return (
    <section aria-labelledby="habitats-title">
      <h2 id="habitats-title">Habitats</h2>
      <div className="items-controls">
        <label>Search habitats or Pokémon
          <input type="search" placeholder="Search by habitat or Pokémon name…"
            value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} />
        </label>
      </div>
      <p role="status">{filtered.length} habitats</p>
      <div className="items-browser">
        <div>
          <div className="items-grid">
            {filtered.slice(currentPage * pageSize, (currentPage + 1) * pageSize).map((habitat) => (
              <button type="button" className="item-tile" key={habitat.id}
                aria-pressed={selectedId === habitat.id} onClick={() => setSelectedId(habitat.id)}>
                {habitat.imageUrl && <img src={habitat.imageUrl} alt="" width={80} height={64} loading="lazy" />}
                <span>{habitat.name.en}</span>
              </button>
            ))}
          </div>
          {!filtered.length && <p>No habitats match your search.</p>}
          <nav className="items-pagination" aria-label="Habitat pages">
            <button disabled={!currentPage} onClick={() => setPage(currentPage - 1)}>Previous</button>
            <span>Page {currentPage + 1} of {pages}</span>
            <button disabled={currentPage + 1 >= pages} onClick={() => setPage(currentPage + 1)}>Next</button>
          </nav>
        </div>
        <section className="item-details-screen" aria-label="Habitat details">
          {selected ? (
            <>
              {selected.imageUrl && <img className="habitat-preview" src={selected.imageUrl} alt={selected.name.en} />}
              <h3>{selected.name.en}</h3>
              {selected.description && <p>{selected.description}</p>}
              {selected.location && <p>Location: {selected.location}</p>}
              <h4>Required materials</h4>
              {selected.requiredItems.length ? (
                <ul className="ingredient-list">
                  {selected.requiredItems.map((material, index) => {
                    const item = (material.itemId ? itemsById.get(material.itemId) : undefined)
                      ?? itemsByName.get(normalize(material.itemName));
                    return <li key={index}>
                      {item?.imageUrl && <img src={item.imageUrl} alt="" width={32} height={32} />}
                      <span>{material.itemName} ×{material.quantity}</span>
                    </li>;
                  })}
                </ul>
              ) : <p>No materials recorded.</p>}
              <h4>Attracted Pokémon</h4>
              {selected.pokemonNames.length ? (
                <ul className="ingredient-list">
                  {selected.pokemonNames.map((name) => {
                    const mon = pokemonByName.get(normalize(name));
                    return <li key={name}>
                      {mon?.imageUrl && <img src={mon.imageUrl} alt="" width={40} height={40} loading="lazy" />}
                      <span>{name}</span>
                    </li>;
                  })}
                </ul>
              ) : <p>No Pokémon recorded.</p>}
            </>
          ) : <p>Select a habitat to see its details.</p>}
        </section>
      </div>
    </section>
  );
}
