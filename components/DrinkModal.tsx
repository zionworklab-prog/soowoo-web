"use client";

import { useEffect } from "react";
import type { Drink } from "@/lib/types";
import { DrinkDetailContent } from "@/components/DrinkDetailContent";

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width={13} height={13} fill="none" aria-hidden="true">
      <path
        d="M6 6L18 18M18 6L6 18"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[2px] bg-canvas shadow-[0_4px_24px_rgba(0,0,0,0.16)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-[2px] border border-hairline bg-canvas text-ink hover:bg-surface"
        >
          <CloseIcon />
        </button>
        <DrinkDetailContent drink={drink} />
      </div>
    </div>
  );
}
