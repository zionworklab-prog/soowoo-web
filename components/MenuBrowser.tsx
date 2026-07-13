"use client";

import { useState } from "react";
import type { Drink, DrinkCategory } from "@/lib/types";
import { DrinkIndexRow } from "@/components/DrinkIndexRow";
import { DrinkModal } from "@/components/DrinkModal";

export function MenuBrowser({
  grouped,
  categoryOrder,
}: {
  grouped: Record<DrinkCategory, Drink[]>;
  categoryOrder: DrinkCategory[];
}) {
  const [selected, setSelected] = useState<Drink | null>(null);

  return (
    <>
      {categoryOrder.map((category) => {
        const drinks = grouped[category];
        if (drinks.length === 0) return null;
        return (
          <section key={category} className="flex flex-col gap-2">
            <h2 className="font-mono text-xs text-ink/50">{category}</h2>
            <div>
              {drinks.map((drink, i) => (
                <DrinkIndexRow
                  key={drink.slug}
                  drink={drink}
                  index={i}
                  onSelect={setSelected}
                />
              ))}
            </div>
          </section>
        );
      })}

      <DrinkModal drink={selected} onClose={() => setSelected(null)} />
    </>
  );
}
