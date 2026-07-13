import type { Drink } from "@/lib/types";
import { DrinkImagePlaceholder } from "@/components/DrinkImagePlaceholder";

export function DrinkCard({
  drink,
  onSelect,
}: {
  drink: Drink;
  onSelect: (drink: Drink) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(drink)}
      className={`group flex flex-col gap-1.5 text-left ${drink.soldOut ? "opacity-50" : ""}`}
    >
      <DrinkImagePlaceholder
        imageUrl={drink.imageUrl}
        className="relative aspect-[3/4] w-full overflow-hidden"
      />
      <span className="text-subheading text-ink group-hover:underline">{drink.name}</span>
      <span className="text-price text-muted">
        {drink.priceSummary}
        {drink.soldOut ? " · 품절" : ""}
      </span>
    </button>
  );
}
