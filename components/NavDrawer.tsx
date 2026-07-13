"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";

const NAV_ITEMS = [
  { href: "/", label: "홈" },
  { href: "/menu", label: "주류" },
];

function CloseIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={22} height={22} fill="none" aria-hidden="true" className={className}>
      <path
        d="M6 6L18 18M18 6L6 18"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function NavDrawer() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- portal은 hydration mismatch를 피하려 mount 이후에만 렌더링해야 한다.
    setMounted(true);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
        aria-expanded={open}
        className="relative z-50 flex h-12 w-12 items-center justify-center text-ink transition-transform duration-150 active:scale-90"
      >
        <Image
          src="/brand/logo_symbol.svg"
          alt=""
          width={69}
          height={38}
          className={`absolute w-11 transition-all duration-300 ease-out ${
            open ? "scale-0 opacity-0" : "scale-100 opacity-100"
          }`}
        />
        <CloseIcon
          className={`absolute transition-all duration-300 ease-out ${
            open ? "scale-100 opacity-100" : "scale-0 opacity-0"
          }`}
        />
      </button>

      {mounted &&
        createPortal(
          <div
            className={`fixed inset-0 z-40 bg-canvas transition-opacity duration-300 ${
              open ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <nav className="flex h-full flex-col items-start justify-center gap-6 px-8 sm:px-10">
              {NAV_ITEMS.map((item, i) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  style={{ transitionDelay: open ? `${i * 40}ms` : "0ms" }}
                  className={`text-section font-light tracking-[0.02em] text-ink transition-all duration-300 ease-out hover:text-muted ${
                    open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>,
          document.body
        )}
    </>
  );
}
