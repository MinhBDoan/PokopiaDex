import { useState } from "react";
import { pokopiaCatalog } from "../data/pokemon";

function IconList({ items }: {
  items: { name: string; iconUrl?: string | null }[] | null;
}) {
  if (!items?.length) return <>Not recorded</>;
  return (
    <ul>
      {items.map((item, index) => (
        <li key={`${item.name}-${index}`}>
          {item.iconUrl && (
            <img src={item.iconUrl} alt="" width={24} height={24}
              style={{ verticalAlign: "middle", objectFit: "contain" }} />
          )}{" "}{item.name}
        </li>
      ))}
    </ul>
  );
}

export default function PokedexView() {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const selectedPokemon = pokopiaCatalog.find(
    (mon) => mon.slug === selectedSlug
  );

  return (
    <div className="pokedex-view">
      {/* Left panel: clickable Pokémon tiles */}
      <section className="pokedex-icon-grid" aria-label="Pokémon list">
        {pokopiaCatalog.map((mon) => (
          <button
            key={mon.slug}
            type="button"
            onClick={() => setSelectedSlug(mon.slug)}
            aria-pressed={selectedSlug === mon.slug}
          >
            <span className="pokedex-icon-slot" aria-hidden="true">
              {mon.imageUrl ? <img src={mon.imageUrl} alt="" loading="lazy" /> : "—"}
            </span>
            <span>{mon.name}</span>
          </button>
        ))}
      </section>

      {/* Right panel: details for the selected Pokémon */}
      <section className="pokedex-details-screen" aria-label="Pokémon details">
        {selectedPokemon ? (
          <>
            <h2>{selectedPokemon.name}</h2>
            {selectedPokemon.imageUrl && (
              <img src={selectedPokemon.imageUrl} alt="" width={96} height={96}
                style={{ objectFit: "contain" }} />
            )}
            <dl>
              <dt>Pokopia Pokédex</dt><dd>#{selectedPokemon.localNumber}</dd>
              <dt>National Pokédex</dt><dd>{selectedPokemon.nationalNumber ?? "Not recorded"}</dd>
              <dt>Types</dt><dd><IconList items={selectedPokemon.types} /></dd>
              <dt>Specialties</dt><dd><IconList items={selectedPokemon.specialties} /></dd>
              <dt>Height</dt><dd>{selectedPokemon.height ?? "Not recorded"}</dd>
              <dt>Weight</dt><dd>{selectedPokemon.weight ?? "Not recorded"}</dd>
              <dt>Ideal environment</dt><dd>{selectedPokemon.idealEnvironment ?? "Not recorded"}</dd>
              <dt>Classification</dt><dd>{selectedPokemon.classification ?? "Not recorded"}</dd>
              <dt>Habitats</dt><dd><IconList items={selectedPokemon.habitats} /></dd>
              <dt>Climates</dt><dd><IconList items={selectedPokemon.climates} /></dd>
              <dt>Time availability</dt><dd><IconList items={selectedPokemon.timeAvailability} /></dd>
              <dt>Spawn zones</dt><dd>{selectedPokemon.spawnZones?.join(", ") || "Not recorded"}</dd>
              <dt>Previous evolution</dt><dd>{selectedPokemon.previousEvolution?.name ?? "Not recorded"}</dd>
              <dt>Next evolution</dt><dd>{selectedPokemon.nextEvolution?.name ?? "Not recorded"}</dd>
            </dl>
          </>
        ) : (
          <p>Select a Pokémon to see its details.</p>
        )}
      </section>
    </div>
  );
}
