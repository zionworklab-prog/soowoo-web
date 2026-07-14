import type { Metadata } from "next";

const ADDRESS = "경기 시흥시 서울대학로278번길 70 1층 제에이114호";
const NAVER_MAP_URL =
  "https://map.naver.com/p/search/%EC%88%98%EC%9A%B0/place/2071114655?placePath=/home?bk_query=%EC%88%98%EC%9A%B0&entry=pll&from=map&fromNxList=true&fromPanelNum=2&timestamp=202607140547&locale=ko&svcName=map_pcv5&searchText=%EC%88%98%EC%9A%B0&searchType=place&c=15.00,0,0,0,dh";

export const metadata: Metadata = {
  title: "위치 | 이자카야 수우",
};

export default function LocationPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-8 px-6 py-12 sm:px-10 sm:py-16">
      <h1 className="text-section font-light tracking-[0.02em] text-ink">위치</h1>

      <div className="flex flex-col gap-2">
        <p className="text-body text-ink">{ADDRESS}</p>
        <a
          href={NAVER_MAP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="w-fit bg-ink px-5 py-2 text-button tracking-[0.04em] text-white transition-colors hover:bg-black"
        >
          네이버 지도에서 보기 ↗
        </a>
      </div>

      <div className="aspect-[4/3] w-full overflow-hidden bg-surface sm:aspect-[16/9]">
        <iframe
          src={`https://www.google.com/maps?q=${encodeURIComponent(ADDRESS)}&output=embed`}
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="수우 위치 지도"
        />
      </div>
    </div>
  );
}
