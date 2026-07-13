"use client";

import { useState } from "react";
import type { Drink, DrinkCategory } from "@/lib/types";
import { DrinkCard } from "@/components/DrinkCard";
import { DrinkModal } from "@/components/DrinkModal";

export function MenuBrowser({
  grouped,
  categoryOrder,
}: {
  grouped: Record<DrinkCategory, Drink[]>;
  categoryOrder: DrinkCategory[];
}) {
  const [filter, setFilter] = useState<DrinkCategory | null>(null);
  const [selected, setSelected] = useState<Drink | null>(null);

  const drinks =
    filter === null ? categoryOrder.flatMap((category) => grouped[category]) : grouped[filter];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-section font-light tracking-[0.02em] text-ink">주류</h1>
        <div className="flex flex-wrap gap-5">
          {categoryOrder.map((category) => {
            const active = filter === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setFilter(active ? null : category)}
                className={`border-b pb-0.5 text-body-small tracking-[0.02em] transition-colors ${
                  active
                    ? "border-ink text-ink"
                    : "border-transparent text-muted hover:text-ink"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-2 gap-y-8 sm:grid-cols-3 sm:gap-y-10">
        {drinks.map((drink) => (
          <DrinkCard key={drink.slug} drink={drink} onSelect={setSelected} />
        ))}
      </div>

      <DrinkModal drink={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
