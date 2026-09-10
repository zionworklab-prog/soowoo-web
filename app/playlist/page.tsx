import type { Metadata } from "next";
import { getYoutubePlaylist } from "@/lib/youtube";

const PLAYLIST_ID = "PLIZimEuLDMBAxUCwahwcAogr8TWRjlqzg";
const PLAYLIST_URL = `https://www.youtube.com/playlist?list=${PLAYLIST_ID}`;

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "플레이리스트 | 이자카야 수우",
};

export default async function PlaylistPage() {
  let videos: Awaited<ReturnType<typeof getYoutubePlaylist>> = [];
  try {
    videos = await getYoutubePlaylist(PLAYLIST_ID);
  } catch (error) {
    console.error("[playlist] failed to load YouTube playlist", error);
  }

  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-8 px-6 py-12 sm:px-10 sm:py-16">
      <h1 className="text-section font-light tracking-[0.02em] text-ink">플레이리스트</h1>

      <div className="flex flex-col gap-2">
        <p className="text-body text-ink">수우에서 흘러나오는 음악입니다.</p>
        <p className="text-body text-ink">
          말이 없어도 어색하지 않은 밤을 위한 목록입니다. 안주가 나오고 술이 채워지는 동안, 그 틈을 자연스럽게 채워줍니다.
        </p>
        <a
          href={PLAYLIST_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="w-fit bg-ink px-5 py-2 text-button tracking-[0.04em] text-white transition-colors hover:bg-black"
        >
          유튜브에서 보기 ↗
        </a>
      </div>

      {videos.length > 0 ? (
        <div className="flex flex-col gap-3">
          <p className="text-caption text-muted">총 {videos.length}곡</p>
          <ul className="flex flex-col">
            {videos.map((video) => (
              <li key={video.videoId} className="border-b border-hairline last:border-b-0">
                <a
                  href={`https://www.youtube.com/watch?v=${video.videoId}&list=${PLAYLIST_ID}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 py-3 transition-opacity hover:opacity-70"
                >
                  <span className="relative h-[54px] w-24 shrink-0 overflow-hidden bg-surface">
                    {/* eslint-disable-next-line @next/next/no-img-element -- 외부(YouTube) 썸네일, 자체 최적화 파이프라인 대상이 아님 */}
                    <img src={video.thumbnail} alt="" className="h-full w-full object-cover" />
                    {video.duration && (
                      <span className="absolute bottom-1 right-1 bg-black/70 px-1 text-[10px] leading-none text-white">
                        {video.duration}
                      </span>
                    )}
                  </span>
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="truncate text-body text-ink">{video.title}</span>
                    {video.channelTitle && (
                      <span className="truncate text-body-small text-muted">{video.channelTitle}</span>
                    )}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : (
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
      )}
    </div>
  );
}
