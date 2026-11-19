import { useRef, useState, type DragEvent } from 'react';
import type { OrganizePokemon } from '../data/pokemon';
import './OrganizeView.css';

type Props = {
  pokemon: OrganizePokemon[];
  regions: string[];
  onAssign: (pokemonId: string, region: string | null) => void;
};

const DRAG_FORMAT = 'application/x-pokopiadex-pokemon';

function SpecialtyIcon({ src }: { src?: string | null }) {
  if (!src) return null;
  return <img key={src} src={src} alt="" draggable={false} loading="lazy" onError={event => { event.currentTarget.hidden = true; }} />;
}

function Artwork({ pokemon, large = false }: { pokemon: OrganizePokemon; large?: boolean }) {
  const src = pokemon.entry?.imageUrl ?? pokemon.spriteUrl;
  const [failedSource, setFailedSource] = useState<string | undefined>();
  return (
    <span className={`organizer-art${large ? ' organizer-art-large' : ''}`}>
      {src && failedSource !== src ? (
        <img src={src} alt="" loading="lazy" draggable={false} onError={() => setFailedSource(src)} />
      ) : (
        <span className="organizer-art-fallback" aria-label="Artwork unavailable">?</span>
      )}
    </span>
  );
}

function TypeBadges({ pokemon }: { pokemon: OrganizePokemon }) {
  const types = pokemon.entry?.types?.length
    ? pokemon.entry.types.map(type => type.name)
    : pokemon.type.split('/').map(type => type.trim()).filter(Boolean);
  return (
    <div className="type-badges">
      {types.map(type => (
        <span key={type} className={`type-badge type-${type.toLowerCase()}`}>{type}</span>
      ))}
    </div>
  );
}

export default function OrganizeView({ pokemon, regions, onAssign }: Props) {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  // The ref is synchronous, so drop validation never relies on a pending render.
  const activeDrag = useRef<string | null>(null);
  const firstRegionButton = useRef<HTMLButtonElement>(null);
  const selected = pokemon.find(mon => mon.id === selectedId);
  const query = search.trim().toLowerCase();
  const visiblePokemon = pokemon.filter(mon => mon.name.toLowerCase().includes(query));
  const assignedCount = pokemon.filter(mon => mon.assignedRegion !== null).length;

  function assign(id: string, region: string | null) {
    const mon = pokemon.find(item => item.id === id);
    if (!mon || (region !== null && !regions.includes(region)) || mon.assignedRegion === region) return;
    onAssign(id, region);
    setMessage(region ? `${mon.name} assigned to ${region}.` : `${mon.name} is now unassigned.`);
  }

  function clearDrag() {
    activeDrag.current = null;
    setDropTarget(null);
  }

  function startDrag(event: DragEvent<HTMLDivElement>, id: string) {
    activeDrag.current = id;
    event.dataTransfer.setData(DRAG_FORMAT, id);
    event.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(event: DragEvent<HTMLElement>, region: string) {
    if (!activeDrag.current || !event.dataTransfer.types.includes(DRAG_FORMAT)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setDropTarget(region);
  }

  function handleDragLeave(event: DragEvent<HTMLElement>, region: string) {
    if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) return;
    setDropTarget(current => current === region ? null : current);
  }

  function handleDrop(event: DragEvent<HTMLElement>, region: string) {
    event.preventDefault();
    event.stopPropagation();
    const id = event.dataTransfer.getData(DRAG_FORMAT);
    const validSource = activeDrag.current === id;
    clearDrag();
    if (!id || !validSource || !pokemon.some(mon => mon.id === id)) return;
    setSelectedId(id);
    setMessage('');
    assign(id, region);
  }

  function renderEntry(mon: OrganizePokemon) {
    return (
      <div key={mon.id} className={`organizer-entry${selectedId === mon.id ? ' is-selected' : ''}`}>
        <button
          type="button"
          className="organizer-entry-select"
          aria-label={`Select ${mon.name}`}
          aria-pressed={selectedId === mon.id}
          onClick={() => { setSelectedId(mon.id); setMessage(''); }}
        >
          <Artwork pokemon={mon} />
          <span className="organizer-entry-copy">
            <strong>{mon.name}</strong>
            <span>{mon.assignedRegion ?? 'Unassigned'}</span>
          </span>
        </button>
        {selectedId === mon.id && (
          <button
            type="button"
            className="organizer-assign-shortcut"
            aria-label={`Choose region for ${mon.name}`}
            onClick={() => firstRegionButton.current?.focus()}
          >Assign</button>
        )}
        <div
          className="organizer-grip"
          draggable
          aria-label={`Drag ${mon.name}`}
          title={`Drag ${mon.name} to a region, or select it to use the assignment buttons`}
          onDragStart={event => startDrag(event, mon.id)}
        >
          <span aria-hidden="true">⠿</span>
        </div>
      </div>
    );
  }

  return (
    <div className="organizer" onDragEnd={clearDrag}>
      <header className="organizer-heading">
        <div>
          <p className="organizer-kicker">Your island, organized</p>
          <h2>Find a place for every Pokémon.</h2>
          <p>Select a Pokémon, then choose its region. You can change it anytime.</p>
        </div>
        <div className="organizer-tally"><strong>{assignedCount}</strong><span>of {pokemon.length} assigned</span></div>
      </header>

      <div className="organizer-workspace">
        <section
          aria-label="Pokémon catalog"
          className="organizer-panel organizer-catalog"
        >
          <div className="organizer-panel-heading">
            <h3>Pokémon catalog</h3>
            <span className="organizer-count">{pokemon.length}</span>
          </div>
          <label className="organizer-search">
            <span>Search Pokémon</span>
            <input type="search" placeholder="Find a Pokémon…" value={search} onChange={event => setSearch(event.target.value)} />
          </label>
          <p className="organizer-list-meta">{visiblePokemon.length} Pokémon · includes assigned Pokémon</p>
          <div className="organizer-catalog-list" tabIndex={0} role="group" aria-label="Scrollable Pokémon list">
            {visiblePokemon.length ? visiblePokemon.map(renderEntry) : (
              <div className="organizer-empty">
                <h4>No Pokémon match “{search.trim()}”</h4>
                <p>Try another name or clear your search.</p>
                <button type="button" onClick={() => setSearch('')}>Clear search</button>
              </div>
            )}
          </div>
          <p className="organizer-panel-note">Drag a grip onto a region to move a Pokémon. Use Unassign to remove its assignment.</p>
        </section>

        <section className="organizer-panel organizer-detail" aria-label="Selected Pokémon">
          {selected ? (
            <>
              <div className="organizer-selected-heading">
                <Artwork pokemon={selected} large />
                <div>
                  <p className="organizer-kicker">{selected.entry?.localNumber ? `Pokopia No. ${selected.entry.localNumber}` : 'Selected Pokémon'}</p>
                  <h3>{selected.name}</h3>
                  <TypeBadges pokemon={selected} />
                </div>
              </div>
              <div className="organizer-specialties">
                <h4>Specialties</h4>
                {selected.entry?.specialties?.length ? (
                  <div className="specialty-icons">
                    {selected.entry.specialties.map(specialty => (
                      <span key={specialty.name} className="type-badge specialty-badge"><SpecialtyIcon src={specialty.iconUrl} />{specialty.name}</span>
                    ))}
                  </div>
                ) : <p>Not recorded</p>}
              </div>
            </>
          ) : (
            <div className="organizer-welcome">
              <span className="organizer-welcome-mark" aria-hidden="true">↖</span>
              <p className="organizer-kicker">Start with a Pokémon</p>
              <h3>Choose your next resident.</h3>
              <p>Select a Pokémon from the catalog to see its specialties and choose where it belongs.</p>
              <span className="organizer-welcome-tip">One click to select. One click to assign.</span>
            </div>
          )}
          <div className="organizer-assignment">
            {selected && <p className="organizer-current">Current region <strong>{selected.assignedRegion ?? 'Unassigned'}</strong></p>}
            <h4>Choose a region</h4>
            <p className="organizer-panel-note organizer-drop-hint">
              {selected ? 'Click to assign the selected Pokémon, or drop a Pokémon here.' : 'Drag a Pokémon onto a region, or select one to enable click assignment.'}
            </p>
            <div className="organizer-region-buttons">
              {regions.map((region, index) => (
                <button
                  ref={index === 0 ? firstRegionButton : undefined}
                  key={region}
                  type="button"
                  aria-pressed={selected?.assignedRegion === region}
                  aria-disabled={!selected || undefined}
                  className={dropTarget === region ? 'organizer-drop-active' : undefined}
                  onClick={() => { if (selected) assign(selected.id, region); }}
                  onDragOver={event => handleDragOver(event, region)}
                  onDragLeave={event => handleDragLeave(event, region)}
                  onDrop={event => handleDrop(event, region)}
                >
                  <span>{region}</span>
                  <span aria-hidden="true">{selected?.assignedRegion === region ? '✓' : '↗'}</span>
                </button>
              ))}
            </div>
            {selected && <button className="organizer-unassign" type="button" disabled={selected.assignedRegion === null} onClick={() => assign(selected.id, null)}>Unassign</button>}
            <p className="organizer-panel-note">Assignments save automatically in this browser.</p>
          </div>
        </section>
      </div>

      <p className="organizer-status" role="status" aria-live="polite">{message}</p>

      <section className="organizer-collections" aria-label="Organized Pokémon">
        <div className="organizer-collections-heading">
          <div><p className="organizer-kicker">A place to call home</p><h3>Your regions</h3></div>
          <span>{regions.length} regions</span>
        </div>
        {regions.map(region => {
          const residents = pokemon.filter(mon => mon.assignedRegion === region);
          // Derived from assignments: moves and resets update the summary automatically.
          const specialtyCounts = new Map<string, { count: number; iconUrl?: string | null }>();
          let unknownSpecialties = 0;
          for (const mon of residents) {
            const names = new Set(
              (mon.entry?.specialties ?? []).map(specialty => specialty.name.trim()).filter(Boolean)
            );
            if (names.size === 0) unknownSpecialties += 1;
            for (const name of names) {
              const existing = specialtyCounts.get(name);
              const iconUrl = existing?.iconUrl ?? mon.entry?.specialties?.find(specialty => specialty.name.trim() === name)?.iconUrl;
              specialtyCounts.set(name, { count: (existing?.count ?? 0) + 1, iconUrl });
            }
          }
          const specialties = [...specialtyCounts].sort(([a], [b]) => a.localeCompare(b));
          return (
            <section
              key={region}
              aria-label={`${region} collection`}
              className={`organizer-panel organizer-region${dropTarget === region ? ' organizer-drop-active' : ''}`}
              onDragOver={event => handleDragOver(event, region)}
              onDragLeave={event => handleDragLeave(event, region)}
              onDrop={event => handleDrop(event, region)}
            >
              <div className="organizer-panel-heading">
                <h4>{region}</h4>
                <span className="organizer-count">{residents.length} Pokémon</span>
              </div>
              <div className="organizer-region-specialties" role="group" aria-label={`${region} specialties`}>
                <h5>Specialties</h5>
                {specialties.length ? (
                  <>
                    <ul className="organizer-specialty-list">
                      {specialties.map(([name, { count, iconUrl }]) => (
                        <li key={name}>
                          <span className="type-badge specialty-badge">
                            <SpecialtyIcon src={iconUrl} />
                            <span>{name}</span>
                            <span
                              className="organizer-specialty-count"
                              aria-label={`${count} Pokémon ${count === 1 ? 'provides' : 'provide'} ${name}`}
                              title={`${count} Pokémon ${count === 1 ? 'provides' : 'provide'} ${name}`}
                            >{count}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                    {unknownSpecialties > 0 && <p>Specialties not recorded for {unknownSpecialties} assigned Pokémon.</p>}
                  </>
                ) : (
                  <p>{residents.length ? 'No specialties recorded for these Pokémon.' : 'Assign Pokémon to see available specialties.'}</p>
                )}
              </div>
              {residents.length ? (
                <div className="organizer-residents" tabIndex={0} role="group" aria-label={`${region} Pokémon list`}>{residents.map(renderEntry)}</div>
              ) : (
                <p className="organizer-region-empty">No Pokémon assigned yet. Choose a Pokémon above or drop one here.</p>
              )}
            </section>
          );
        })}
      </section>
    </div>
  );
}
