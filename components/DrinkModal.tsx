"use client";

import { useEffect } from "react";
import type { Drink } from "@/lib/types";
import { DrinkDetailContent } from "@/components/DrinkDetailContent";

export function DrinkModal({
  drink,
  onClose,
}: {
  drink: Drink | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!drink) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [drink, onClose]);

  if (!drink) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center border border-cream/30 bg-ink/60 font-mono text-sm text-cream/80 hover:text-cream"
        >
          ✕
        </button>
        <DrinkDetailContent drink={drink} />
      </div>
    </div>
  );
}
