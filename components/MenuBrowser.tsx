"use client";

import { useMemo, useState } from "react";
import type { Drink, DrinkCategory } from "@/lib/types";
import { DrinkCard } from "@/components/DrinkCard";
import { DrinkModal } from "@/components/DrinkModal";

type SortOption = "default" | "price-asc" | "price-desc" | "featured";

const SORT_LABELS: Record<SortOption, string> = {
  default: "기본순",
  "price-asc": "가격 낮은순",
  "price-desc": "가격 높은순",
  featured: "추천순",
};

function sortDrinks(drinks: Drink[], sort: SortOption): Drink[] {
  if (sort === "default") return drinks;
  const sorted = [...drinks];
  if (sort === "price-asc" || sort === "price-desc") {
    sorted.sort((a, b) => {
      if (a.priceValue == null) return 1;
      if (b.priceValue == null) return -1;
      return sort === "price-asc" ? a.priceValue - b.priceValue : b.priceValue - a.priceValue;
    });
  } else if (sort === "featured") {
    sorted.sort((a, b) => Number(b.featured) - Number(a.featured));
  }
  return sorted;
}

export function MenuBrowser({
  grouped,
  categoryOrder,
}: {
  grouped: Record<DrinkCategory, Drink[]>;
  categoryOrder: DrinkCategory[];
}) {
  const [filter, setFilter] = useState<DrinkCategory | null>(null);
  const [sort, setSort] = useState<SortOption>("default");
  const [selected, setSelected] = useState<Drink | null>(null);

  const drinks = useMemo(() => {
    const base =
      filter === null ? categoryOrder.flatMap((category) => grouped[category]) : grouped[filter];
    return sortDrinks(base, sort);
  }, [filter, sort, grouped, categoryOrder]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-section font-light tracking-[0.02em] text-ink">주류</h1>

      <div className="flex items-center justify-between">
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

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="border-b border-hairline bg-transparent pb-1 text-caption text-muted outline-none hover:text-ink"
        >
          {(Object.keys(SORT_LABELS) as SortOption[]).map((option) => (
            <option key={option} value={option}>
              {SORT_LABELS[option]}
            </option>
          ))}
        </select>
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
