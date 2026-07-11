import Link from "next/link";
import type { Drink } from "@/lib/types";

export function DrinkIndexRow({ drink, index }: { drink: Drink; index: number }) {
  return (
    <Link
      href={`/menu/${drink.slug}`}
      className={`group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-4 border-b border-ink/10 py-4 transition-colors hover:bg-sand/15 sm:grid-cols-[3rem_1fr_8rem_auto] ${drink.soldOut ? "opacity-40" : ""}`}
    >
      <span className="font-mono text-xs text-ink/40">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="font-serif text-base text-ink group-hover:underline sm:text-lg">
        {drink.name}
        {drink.soldOut && (
          <span className="ml-2 font-mono text-[10px] text-ink/50">품절</span>
        )}
      </span>
      <span className="hidden font-mono text-xs text-ink/50 sm:block">
        {drink.type !== drink.category ? drink.type : ""}
      </span>
      <span className="font-mono text-xs text-ink/70 sm:text-sm">
        {drink.abv ? `${drink.abv} · ` : ""}
        {drink.price}
      </span>
    </Link>
  );
}
