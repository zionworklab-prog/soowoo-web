import type { Drink } from "@/lib/types";
import { DrinkImagePlaceholder } from "@/components/DrinkImagePlaceholder";

export function DrinkIndexRow({
  drink,
  index,
  onSelect,
}: {
  drink: Drink;
  index: number;
  onSelect: (drink: Drink) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(drink)}
      className={`group grid w-full grid-cols-[2rem_3rem_1fr_7rem] items-center gap-4 border-b border-ink/10 py-3 text-left transition-colors hover:bg-sand/15 sm:grid-cols-[2.5rem_3.5rem_1fr_8rem_9rem] ${drink.soldOut ? "opacity-40" : ""}`}
    >
      <span className="font-mono text-xs text-ink/40">
        {String(index + 1).padStart(2, "0")}
      </span>
      <DrinkImagePlaceholder
        category={drink.category}
        imageUrl={drink.imageUrl}
        className="relative aspect-square w-12 shrink-0 overflow-hidden"
      />
      <span className="font-serif text-base text-ink group-hover:underline sm:text-lg">
        {drink.name}
        {drink.soldOut && (
          <span className="ml-2 font-mono text-[10px] text-ink/50">품절</span>
        )}
      </span>
      <span className="hidden font-mono text-xs text-ink/50 sm:block">
        {drink.type !== drink.category ? drink.type : ""}
      </span>
      <span className="text-right font-mono text-xs text-ink/70 sm:text-sm">
        {drink.price}
      </span>
    </button>
  );
}
