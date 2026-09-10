"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

// 아이콘마다 원본 비율이 달라(가로로 넓은 것/좁고 긴 것) 같은 높이로 맞추면
// 폭이 좁은 것들이 유독 작아 보인다. 그래서 좁은 아이콘 쪽 높이를 조금 더 키운다.
// yStart는 "왼쪽 1열로 포개진" 초기 상태의 세로 오프셋(px, 고정). 가로(x) 오프셋은
// 그리드 열 너비가 반응형이라 고정값을 쓸 수 없어 런타임에 실제 위치를 측정해 구한다.
const BIRD_ICONS = [
  { key: "home", src: "/brand/nav-icons/home.svg", heightClass: "h-7 sm:h-8", yStart: 0 },
  { key: "drinks", src: "/brand/nav-icons/drinks.svg", heightClass: "h-5 sm:h-6", yStart: 72 },
  { key: "playlist", src: "/brand/nav-icons/playlist.svg", heightClass: "h-7 sm:h-8", yStart: 144 },
  { key: "location", src: "/brand/nav-icons/location.svg", heightClass: "h-5 sm:h-6", yStart: 216 },
];

// 스크롤 위치에 프레임마다 픽셀 단위로 맞추는 스크럽 방식은 아무리 최적화해도
// (매 프레임 JS로 transform을 계산) 순수 CSS 트랜지션만큼 매끄럽기 어렵다 —
// 아이폰 실기기에서 계속 뚝뚝 끊겨 보인다는 피드백으로, "스크롤을 조금이라도
// 시작하면 그 뒤로는 CSS 트랜지션이 한 번에 부드럽게 펼쳐지는" 방식으로 바꿔본다.
// 페이지 로드 즉시 재생되는 것(자동재생)은 여전히 원하지 않으므로, 아주 약간의
// 스크롤이 실제로 있어야 시작한다. 대신 한 번 펼쳐지면 되돌리지 않는다(위로
// 스크롤해도 다시 접히지 않음) — 스크럽 방식과 가장 크게 달라지는 지점.
const TRIGGER_SCROLL_Y = 24;
const REVEAL_MS = 700;
const REVEAL_EASING = "cubic-bezier(0.16, 1, 0.3, 1)";
const STAGGER_MS = 70;

export function BirdIconRow() {
  const gridRef = useRef<HTMLDivElement>(null);
  const wrapperRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // 데스크탑에서는 이 컴포넌트 자체가 CSS로 숨겨지고(app/page.tsx 참고) 사이드바의
    // 정적 새 목록이 그 자리를 대신한다.
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    if (isDesktop) return;

    const grid = gridRef.current;
    if (!grid) return;

    // 그리드가 실제로 렌더링된 뒤, 각 아이콘의 왼쪽 끝을 0번(홈) 아이콘의 왼쪽 끝에
    // 맞추는 데 필요한 픽셀 이동량을 측정한다. 반응형 레이아웃에서도 항상 정확히
    // 같은 x좌표(왼쪽 1열)로 모이게 하기 위함 — % 기반 계산은 grid gap 때문에
    // 아이콘마다 미세하게 어긋난다.
    const base = wrapperRefs.current[0]?.getBoundingClientRect().left ?? 0;
    const xStart = wrapperRefs.current.map((el) => (el ? base - el.getBoundingClientRect().left : 0));
    // 포개진 상태일 때 마지막 아이콘이 아래까지 내려가므로, 그 시각적 높이만큼
    // min-height를 확보해 아래 글귀와 겹치지 않게 한다.
    const stackedHeight = Math.max(
      ...BIRD_ICONS.map((icon, i) => icon.yStart + (wrapperRefs.current[i]?.offsetHeight ?? 0))
    );

    BIRD_ICONS.forEach((icon, i) => {
      wrapperRefs.current[i]?.style.setProperty("transform", `translate(${xStart[i]}px, ${icon.yStart}px)`);
    });
    grid.style.minHeight = `${stackedHeight}px`;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      BIRD_ICONS.forEach((_, i) => {
        wrapperRefs.current[i]?.style.setProperty("transform", "translate(0px, 0px)");
      });
      grid.style.minHeight = "0px";
      return;
    }

    let revealed = false;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      grid.style.transition = `min-height ${REVEAL_MS}ms ${REVEAL_EASING}`;
      grid.style.minHeight = "0px";
      BIRD_ICONS.forEach((_, i) => {
        const el = wrapperRefs.current[i];
        if (!el) return;
        el.style.transition = `transform ${REVEAL_MS}ms ${REVEAL_EASING} ${i * STAGGER_MS}ms`;
        el.style.transform = "translate(0px, 0px)";
      });
      window.removeEventListener("scroll", handleScroll);
    };
    const handleScroll = () => {
      if (window.scrollY > TRIGGER_SCROLL_Y) reveal();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div ref={gridRef} className="flex items-start justify-between">
      {BIRD_ICONS.map((icon, i) => (
        <div
          key={icon.key}
          ref={(el) => {
            wrapperRefs.current[i] = el;
          }}
          className="flex items-center"
        >
          <Image src={icon.src} alt="" width={40} height={40} className={`w-auto ${icon.heightClass}`} />
        </div>
      ))}
    </div>
  );
}
