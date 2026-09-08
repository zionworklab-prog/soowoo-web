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

// 스크롤로 애니메이션을 "조작"할 수 있게, 아이콘 줄을 화면에 sticky로 고정해두고
// 그 동안만 스크롤이 진행되게 하는 여유 구간(px). 이게 없으면 아이콘 줄이 화면
// 밖으로 스크롤되어 나가버려서 애니메이션이 다 끝나기 전에 잘려 보인다.
const PIN_HEIGHT = 360;
// 고정된 채로 있을 때 뷰포트 위쪽과의 여백. 헤더에 바짝 붙어 답답해 보이지 않게
// 헤더 높이보다 여유를 넉넉히 둔다.
const STICKY_TOP = 110;

// 고정 구간(scrollable) 중 실제로 움직이는 데 쓰는 비율. 나머지는 "다 펼쳐진 채로
// 잠깐 멈춰 있는" 홀드 구간 — 완성된 모습을 볼 시간 없이 바로 스크롤이 이어지던
// 문제를 고치기 위함. 펼쳐지는 동작 자체를 짧고 빠르게 끝내고, 남는 여유를
// 최대한 홀드 쪽에 몰아줘서 "다 붙어있는 시간"을 늘린다.
const ANIMATE_FRACTION = 0.6;
// 애니메이션 구간 중 세로 정렬(같은 줄 맞추기)에 쓰는 비율. 세로/가로가 동시에
// 같은 속도로 움직이면 중간에 대각선으로 지나가는 것처럼 보여서, 세로를 먼저
// 빠르게 끝내고 나머지는 가로로만 퍼지게 분리했다.
const Y_FRACTION = 0.45;

// 스크롤량에 선형으로 그대로 비례하면 다소 기계적으로 느껴져서, 진행도 자체를
// 이 곡선(ease-out)에 통과시켜 시작은 빠르고 끝에서 부드럽게 감속하도록 한다.
// 여전히 스크롤 위치에만 의존하는 순수 함수라 "스크롤에 직접 연동, 자동재생
// 없음" 원칙은 그대로 지킨다 — 시간 기반 보간이나 스프링이 아니다.
function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function BirdIconRow() {
  const pinRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const wrapperRefs = useRef<(HTMLDivElement | null)[]>([]);
  const xStartRef = useRef<number[]>([0, 0, 0, 0]);
  // 새가 포개진 상태를 담기 위해 그리드가 확보해둔 높이(stacked)와, 한 줄로 다
  // 펼쳐졌을 때 실제로 필요한 높이(collapsed)의 차이. 이 컴포넌트 자신의 실제
  // 레이아웃 크기는 절대 건드리지 않는다 — 건드리면 sticky의 네이티브 고정 해제
  // 시점이 우리 진행도 계산과 어긋난다(이전에 겪은 버그). 대신 바로 다음 형제
  // 요소(문단)를 yProgress에 맞춰 transform으로 끌어올려서, 다 펼쳐졌을 때 문단이
  // 훨씬 가까워 보이게 한다.
  const gridHeightsRef = useRef({ stacked: 0, collapsed: 0 });
  const ticking = useRef(false);
  // 스크롤 애니메이션에 필요한 여유 공간(PIN_HEIGHT)을 처음부터 예약해두면 페이지
  // 진입 직후(스크롤 0) 새 아래에 빈 여백이 그대로 보인다. 이 섹션이 페이지 맨 위,
  // 첫 화면 안에 있어서 "화면 밖에 있을 때 미리 펼쳐두기"도, "스크롤 시작 시점에
  // 한 번에 펼치기"도 둘 다 문단이 화면에 보이는 채로 훅 밀려나 보인다 — 그래서
  // 아예 한 번에 펼치지 않고, 스크롤 초반 RAMP_DISTANCE 구간에 걸쳐 스크롤량에
  // 정비례해서 점진적으로 늘어나게 한다(아이콘 이동과 같은 원리). sticky가 실제로
  // 고정되는 지점보다 먼저 다 늘어나 있어야 하므로 그보다 확실히 짧게 잡는다.
  const RAMP_DISTANCE = 120;

  useEffect(() => {
    // 그리드가 실제로 렌더링된 뒤, 각 아이콘의 왼쪽 끝을 0번(홈) 아이콘의 왼쪽 끝에
    // 맞추는 데 필요한 픽셀 이동량을 측정한다. 반응형 레이아웃에서도 항상 정확히
    // 같은 x좌표(왼쪽 1열)로 모이게 하기 위함 — % 기반 계산은 grid gap 때문에
    // 아이콘마다 미세하게 어긋나(대각선처럼 보이는 원인) 이 방식으로 바꿨다.
    function measureStartX() {
      const base = wrapperRefs.current[0]?.getBoundingClientRect().left;
      if (base == null) return;
      xStartRef.current = wrapperRefs.current.map((el) => {
        if (!el) return 0;
        return base - el.getBoundingClientRect().left;
      });
    }

    function measureGridHeights() {
      const heights = wrapperRefs.current.map((el) => el?.offsetHeight ?? 0);
      const stacked = Math.max(
        ...BIRD_ICONS.map((icon, i) => icon.yStart + heights[i]),
        gridRef.current?.offsetHeight ?? 0
      );
      const collapsed = Math.max(...heights, 1);
      gridHeightsRef.current = { stacked, collapsed };
    }

    // 페이지 구조상 문단은 BirdIconRow의 형제가 아니라, BirdIconRow를 감싼 래퍼
    // div의 다음 형제로 렌더링된다 (app/page.tsx 참고). ref를 문단까지 넘길 필요
    // 없이 이 상대적 위치로 직접 찾는다.
    function getPullTarget(): HTMLElement | null {
      const wrapper = pinRef.current?.parentElement;
      const next = wrapper?.nextElementSibling;
      return next instanceof HTMLElement ? next : null;
    }

    // 데스크탑에서는 이 컴포넌트 자체가 CSS로 숨겨지고(app/page.tsx 참고) 사이드바의
    // 정적 새 목록이 그 자리를 대신한다. 화면에 보이지 않는데도 스크롤 리스너를
    // 붙이거나 다음 형제(문단)에 불필요한 transform을 적용하지 않도록 여기서 완전히
    // 건너뛴다.
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    if (isDesktop) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    measureStartX();
    measureGridHeights();

    if (prefersReducedMotion) {
      BIRD_ICONS.forEach((_, i) => {
        wrapperRefs.current[i]?.style.setProperty("transform", "translate(0px, 0px)");
      });
      const pullTarget = getPullTarget();
      if (pullTarget) {
        const { stacked, collapsed } = gridHeightsRef.current;
        pullTarget.style.transform = `translateY(-${stacked - collapsed}px)`;
      }
      return;
    }

    const applyProgress = () => {
      const pin = pinRef.current;
      const sticky = stickyRef.current;
      if (!pin || !sticky) return;

      const rampProgress = Math.min(1, Math.max(0, window.scrollY / RAMP_DISTANCE));
      const naturalHeight = sticky.offsetHeight;
      pin.style.height = `${naturalHeight + (PIN_HEIGHT - naturalHeight) * rampProgress}px`;

      const pinTop = pin.getBoundingClientRect().top;
      const scrollable = Math.max(1, PIN_HEIGHT - sticky.offsetHeight);
      const rawProgress = Math.min(1, Math.max(0, (STICKY_TOP - pinTop) / scrollable));
      const animProgress = Math.min(1, rawProgress / ANIMATE_FRACTION);
      const yProgress = easeOutCubic(Math.min(1, animProgress / Y_FRACTION));
      const xProgress = easeOutCubic(animProgress);

      const pullTarget = getPullTarget();
      if (pullTarget) {
        const { stacked, collapsed } = gridHeightsRef.current;
        pullTarget.style.transform = `translateY(-${(stacked - collapsed) * yProgress}px)`;
      }

      BIRD_ICONS.forEach((icon, i) => {
        const el = wrapperRefs.current[i];
        if (!el) return;
        const x = xStartRef.current[i] * (1 - xProgress);
        const y = icon.yStart * (1 - yProgress);
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      ticking.current = false;
    };

    const handleScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(applyProgress);
      }
    };
    const handleResize = () => {
      measureStartX();
      measureGridHeights();
      applyProgress();
    };

    applyProgress();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div ref={pinRef} className="relative">
      <div ref={stickyRef} className="sticky" style={{ top: STICKY_TOP }}>
        {/* 포개진 상태일 때 마지막 아이콘이 아래까지 내려가므로, 그 시각적 높이만큼
            min-height를 확보해 아래 글귀와 겹치지 않게 한다. */}
        <div ref={gridRef} className="grid min-h-[248px] grid-cols-4 items-start gap-4 sm:min-h-[252px] sm:gap-6">
          {BIRD_ICONS.map((icon, i) => (
            <div
              key={icon.key}
              ref={(el) => {
                wrapperRefs.current[i] = el;
              }}
              className="flex items-center justify-start"
            >
              <Image src={icon.src} alt="" width={40} height={40} className={`w-auto ${icon.heightClass}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
