"use client";

import { useEffect } from "react";
import type { Drink } from "@/lib/types";
import { DrinkDetailContent } from "@/components/DrinkDetailContent";

function CloseIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={15}
      height={15}
      fill="none"
      aria-hidden="true"
      className={className}
    >
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-md"
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
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center text-[#bebebe]/70 transition-colors hover:text-[#bebebe]"
        >
          {/* 옅은 그림자는 밝은 사진 배경 위에서 X가 묻히지 않게 하는 최소한의 대비 장치 */}
          <CloseIcon className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]" />
        </button>
        <DrinkDetailContent drink={drink} />
      </div>
    </div>
  );
}
