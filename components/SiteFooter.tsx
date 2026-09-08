"use client";

import { usePathname } from "next/navigation";

const CATCHTABLE_URL = "https://app.catchtable.co.kr/ct/shop/soowoo?from=share&type=DINING";
const INSTAGRAM_URL = "https://www.instagram.com/oden_soowoo?igsh=dHoxdmlpMWg5bTMy";

export function SiteFooter() {
  const pathname = usePathname();
  const showFooter = pathname === "/" || pathname.startsWith("/menu");
  if (!showFooter) return null;

  return (
    <footer className="mx-auto mt-16 w-full max-w-[1180px] px-6 py-12 sm:px-10 sm:py-16">
      <div className="flex flex-col justify-between gap-10 text-body text-ink sm:flex-row">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex gap-6">
              <span className="w-20 shrink-0 text-muted">영업시간</span>
              <span>18:00 - 01:00</span>
            </div>
            <div className="flex gap-6">
              <span className="w-20 shrink-0 text-muted">마지막 주문</span>
              <span>23:30</span>
            </div>
            <p className="mt-2">매주 일요일 휴무, 매달 첫 째주 월요일 휴무.</p>
          </div>

          <div className="mt-4 flex flex-col gap-1">
            <p className="text-muted">위치</p>
            <p>경기 시흥시 서울대학로278번길 70 1층 A동 114호</p>
            <p>15011</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <a href={CATCHTABLE_URL} target="_blank" rel="noopener noreferrer" className="w-fit text-brand hover:opacity-70">
            예약 및 캐치테이블 바로가기 ↗
          </a>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="w-fit text-brand hover:opacity-70">
            인스타그램 ↗
          </a>
        </div>
      </div>
    </footer>
  );
}
