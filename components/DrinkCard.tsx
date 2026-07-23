"use client";

import { useEffect, useRef, useState } from "react";
import type { Drink } from "@/lib/types";
import { DrinkImagePlaceholder } from "@/components/DrinkImagePlaceholder";

// 텍스트 글자(›)는 폰트에 따라 세로 중심이 미묘하게 어긋나 보여서,
// 항상 정확히 가운데 오도록 SVG로 그린다.
function ChevronIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={12} height={12} fill="none" aria-hidden="true" className={className}>
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

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
      <span className="mt-3 flex items-center gap-1">
        <span className="min-w-0 truncate text-body-small text-ink group-hover:underline sm:text-subheading">
          {drink.name}
        </span>
        <ChevronIcon className="shrink-0 text-muted" />
      </span>
      {drink.description && (
        <span className="mt-0.5 line-clamp-2 text-[10px] text-muted">{drink.description}</span>
      )}
      <span className="mt-3 text-caption text-muted sm:text-body-small">
        {drink.priceSummary}
        {drink.soldOut ? " · 품절" : ""}
      </span>
    </button>
  );
}
