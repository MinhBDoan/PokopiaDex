import { useState } from "react";
import importedItems from "../data/items.generated.json";
import recipes from "../data/recipes.generated.json";

type Item = {
  id: string;
  name: { en: string };
  category: string;
  description: string;
  imageUrl: string | null;
  howToObtain: string[];
  favoriteTags: string[];
};
const items: Item[] = importedItems;

const pageSize = 60;
const categories = [...new Set(items.map((item) => item.category))].sort();

export default function ItemsView() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = items.find((item) => item.id === selectedId);
  const selectedRecipes = recipes.filter((recipe) => recipe.itemId === selectedId);
  const filtered = items.filter((item) =>
    (!category || item.category === category) &&
    item.name.en.toLowerCase().includes(search.trim().toLowerCase()));
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pages - 1);

  return (
    <section aria-labelledby="items-title">
      <h2 id="items-title">Items</h2>
      <div className="items-controls">
        <label>Search items
          <input type="search" value={search} placeholder="Search by name…"
            onChange={(event) => { setSearch(event.target.value); setPage(0); }} />
        </label>
        <label>Category
          <select value={category} onChange={(event) => {
            setCategory(event.target.value); setPage(0);
          }}>
            <option value="">All categories</option>
            {categories.map((name) => <option key={name}>{name}</option>)}
          </select>
        </label>
      </div>
      <p role="status">{filtered.length} items</p>
      <div className="items-browser">
      <div>
      <div className="items-grid">
        {filtered.slice(currentPage * pageSize, (currentPage + 1) * pageSize).map((item) => (
          <button type="button" className="item-tile" key={item.id}
            aria-pressed={selectedId === item.id}
            onClick={() => setSelectedId(item.id)}>
            {item.imageUrl && <img src={item.imageUrl} alt="" loading="lazy" width={64} height={64} />}
            <span>{item.name.en}</span>
          </button>
        ))}
      </div>
      {filtered.length === 0 && <p>No items match your search.</p>}
      <nav className="items-pagination" aria-label="Item pages">
        <button disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>Previous</button>
        <span>Page {currentPage + 1} of {pages}</span>
        <button disabled={currentPage + 1 >= pages} onClick={() => setPage(currentPage + 1)}>Next</button>
      </nav>
      </div>
      <section className="item-details-screen" aria-label="Item details">
        {selected ? (
          <>
            {selected.imageUrl && <img src={selected.imageUrl} alt="" width={112} height={112} />}
            <h3>{selected.name.en}</h3>
            <span className="type-badge">{selected.category}</span>
            <p>{selected.description || "Description not available."}</p>
            <h4>How to obtain</h4>
            {selected.howToObtain.length ? (
              <ul>{selected.howToObtain.map((hint, index) => <li key={index}>{hint}</li>)}</ul>
            ) : <p>Obtain information not available.</p>}
            <h4>Crafting materials</h4>
            {selectedRecipes.length ? selectedRecipes.map((recipe) => (
              <div key={recipe.id}>
                <ul className="ingredient-list">
                  {recipe.materials.map((material, index) => {
                    const ingredient = items.find((item) => item.id === material.itemId);
                    return (
                      <li key={index}>
                        {ingredient?.imageUrl && <img src={ingredient.imageUrl} alt="" width={32} height={32} />}
                        <span>{ingredient?.name.en ?? material.itemId} ×{material.quantity}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )) : <p>No crafting recipe recorded.</p>}
            <h4>Pokémon favorite tags</h4>
            {selected.favoriteTags.length ? (
              <div className="type-badges">
                {selected.favoriteTags.map((tag) => <span className="type-badge favorite-tag-badge" key={tag}>{tag}</span>)}
              </div>
            ) : <p>No favorite tags recorded.</p>}
          </>
        ) : <p>Select an item to see its details.</p>}
      </section>
      </div>
    </section>
  );
}
