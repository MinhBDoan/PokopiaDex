import { useState } from "react";
import paint from "../data/paint.generated.json";

export default function PaintVariations({ itemId }: { itemId: string }) {
  const entry = paint.items.find((item) => item.itemId === itemId);
  const previews = paint.previews.filter((preview) => preview.itemSlug === entry?.itemSlug);
  const areas = [...new Set(previews.map((preview) => preview.area))].sort((a, b) => a - b);
  const [area, setArea] = useState(areas[0] ?? 1);
  const [finishType, setFinishType] = useState("color");
  if (!entry) return null;

  const shown = previews.filter((preview) => (finishType === "pattern" || preview.area === area) && preview.finishType === finishType);
  return (
    <section className="paint-variations" aria-label="Painted variations">
      <h4>Painted variations</h4>
      <div className="items-controls">
        {areas.length > 1 && finishType === "color" && (
          <label>Paint area
            <select value={area} onChange={(event) => setArea(Number(event.target.value))}>
              {areas.map((number) => <option key={number} value={number}>Area {number}</option>)}
            </select>
          </label>
        )}
        <label>Finish
          <select value={finishType} onChange={(event) => setFinishType(event.target.value)}>
            <option value="color">Colors</option>
            {entry.patternSupported && <option value="pattern">Patterns</option>}
          </select>
        </label>
      </div>
      {entry.paintAreas > 1 && finishType === "color" && <p>Previews show one painted area at a time.</p>}
      {shown.length ? (
        <div className="paint-variation-grid">
          {shown.map((preview) => (
            <figure key={preview.finishId}>
              <img src={preview.image} alt={`${entry.canonicalName}: ${preview.name}, area ${area}`}
                width={112} height={112} loading="lazy" />
              <figcaption>
                <strong>{preview.name}</strong>
                <span>{preview.materials.map((material) =>
                  `${material.paintName} ×${material.quantity}`).join(", ")}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      ) : <p>No rendered previews recorded for this finish and paint area.</p>}
    </section>
  );
}
