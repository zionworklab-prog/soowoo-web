"use client";

import { useEffect, useRef, useState } from "react";
import type { Drink } from "@/lib/types";
import { DrinkImagePlaceholder } from "@/components/DrinkImagePlaceholder";

export function DrinkCard({
  drink,
  onSelect,
}: {
  drink: Drink;
  onSelect: (drink: Drink) => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [visible, setVisible] = useState(false);

  // 스크롤로 카드가 뷰포트에 들어올 때 서서히 떠오르듯 나타나는 인터랙션.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => onSelect(drink)}
      className={`group flex flex-col text-left transition-all duration-700 ease-out motion-reduce:transition-none ${
        visible
          ? `translate-y-0 ${drink.soldOut ? "opacity-50" : "opacity-100"}`
          : "translate-y-3 opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100"
      }`}
    >
      <div className="relative">
        <DrinkImagePlaceholder
          imageRef={drink.imageRef}
          sizes="(min-width: 1180px) 380px, (min-width: 640px) 33vw, 50vw"
          className="aspect-square w-full overflow-hidden"
        />
        {drink.limitedEdition && (
          <span className="absolute left-1.5 top-1.5 border border-brand/20 bg-canvas/90 px-1 py-px text-[9px] tracking-[0.02em] text-brand">
            여름 한정주
          </span>
        )}
      </div>
      <span className="mt-3 break-keep text-body-small text-ink group-hover:underline sm:text-subheading">
        {drink.name}
      </span>
      {drink.description && (
        <span className="mt-0.5 line-clamp-1 text-[10px] text-muted">{drink.description}</span>
      )}
      <span className="mt-3 text-caption text-muted sm:text-body-small">
        {drink.priceSummary}
        {drink.soldOut ? " · 품절" : ""}
      </span>
    </button>
  );
}
