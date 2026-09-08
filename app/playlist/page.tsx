import type { Metadata } from "next";

const PLAYLIST_ID = "PLIZimEuLDMBAxUCwahwcAogr8TWRjlqzg";
const PLAYLIST_URL = `https://www.youtube.com/playlist?list=${PLAYLIST_ID}`;

export const metadata: Metadata = {
  title: "플레이리스트 | 이자카야 수우",
};

export default function PlaylistPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-8 px-6 py-12 sm:px-10 sm:py-16">
      <h1 className="text-section font-light tracking-[0.02em] text-ink">플레이리스트</h1>

      <div className="flex flex-col gap-2">
        <p className="text-body text-ink">수우에서 흘러나오는 음악입니다.</p>
        <a
          href={PLAYLIST_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="w-fit bg-ink px-5 py-2 text-button tracking-[0.04em] text-white transition-colors hover:bg-black"
        >
          유튜브에서 보기 ↗
        </a>
      </div>

      <div className="aspect-video w-full overflow-hidden bg-surface">
        <iframe
          src={`https://www.youtube.com/embed/videoseries?list=${PLAYLIST_ID}`}
          className="h-full w-full border-0"
          loading="lazy"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="수우 플레이리스트"
        />
      </div>
    </div>
  );
}
