"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "홈", icon: "/brand/nav-icons/home.svg", heightClass: "h-7" },
  { href: "/menu", label: "주류", icon: "/brand/nav-icons/drinks.svg", heightClass: "h-5" },
  { href: "/playlist", label: "플레이리스트", icon: "/brand/nav-icons/playlist.svg", heightClass: "h-7" },
  { href: "/location", label: "위치", icon: "/brand/nav-icons/location.svg", heightClass: "h-5" },
];

// 데스크탑 전용 좌측 사이드바. 모바일의 스크롤 연동 새 애니메이션과 달리, 여기서는
// 새 4개가 처음부터 왼쪽 정렬로 고정된 채 움직이지 않는다 — 오른쪽 콘텐츠를
// 스크롤해도 계속 같은 자리에 보인다.
export function SiteSidebar() {
  const pathname = usePathname();

  // 이미 있는 페이지의 링크(로고 포함, 로고는 항상 "/")를 다시 눌렀을 때는
  // Next.js가 같은 경로로는 아무 반응도 하지 않아 "눌렀는데 반응이 없다"고
  // 느껴진다 — 맨 위로 스크롤시켜 클릭에 대한 눈에 보이는 피드백을 준다.
  const scrollToTopIfCurrent = (href: string) => () => {
    if (pathname === href) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between border-r border-hairline px-8 py-10 md:flex">
      <div className="flex flex-col gap-10">
        <Link href="/" onClick={scrollToTopIfCurrent("/")} className="inline-flex items-center gap-3">
          <Image src="/brand/logo_kor.svg" alt="수우" width={88} height={41} priority />
        </Link>

        <nav className="flex flex-col gap-6">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={scrollToTopIfCurrent(item.href)}
                className={`flex items-center gap-3 transition-colors ${
                  active ? "text-ink" : "text-muted hover:text-ink"
                }`}
              >
                <span className="flex w-24 shrink-0 justify-start">
                  <Image
                    src={item.icon}
                    alt=""
                    width={32}
                    height={32}
                    className={`w-auto max-w-none shrink-0 ${item.heightClass}`}
                    aria-hidden="true"
                  />
                </span>
                <span className="text-body">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
