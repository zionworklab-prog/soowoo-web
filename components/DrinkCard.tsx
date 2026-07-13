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
      className={`group flex flex-col text-left ${drink.soldOut ? "opacity-50" : ""}`}
    >
      <DrinkImagePlaceholder
        imageUrl={drink.imageUrl}
        className="relative aspect-[3/4] w-full overflow-hidden"
      />
      <span className="mt-3 text-body-small text-ink group-hover:underline sm:text-subheading">
        {drink.name}
      </span>
      <span className="mt-0.5 text-caption text-muted sm:text-body-small">
        {drink.priceSummary}
        {drink.soldOut ? " · 품절" : ""}
      </span>
    </button>
  );
}
