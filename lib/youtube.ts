import { unstable_cache } from "next/cache";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const API_BASE = "https://www.googleapis.com/youtube/v3";

export type PlaylistVideo = {
  videoId: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  duration: string;
};

type RawPlaylistItem = {
  videoId: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
};

function parseDuration(iso: string): string {
  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso);
  if (!match) return "";
  const h = Number(match[1] || 0);
  const m = Number(match[2] || 0);
  const s = Number(match[3] || 0);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

async function fetchPlaylistItems(playlistId: string): Promise<RawPlaylistItem[]> {
  if (!YOUTUBE_API_KEY) throw new Error("YOUTUBE_API_KEY is not set");

  const items: RawPlaylistItem[] = [];
  let pageToken: string | undefined;
  do {
    const url = new URL(`${API_BASE}/playlistItems`);
    url.searchParams.set("part", "snippet");
    url.searchParams.set("maxResults", "50");
    url.searchParams.set("playlistId", playlistId);
    url.searchParams.set("key", YOUTUBE_API_KEY);
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`YouTube playlistItems request failed: ${res.status}`);
    const data = await res.json();

    for (const item of data.items ?? []) {
      const snippet = item.snippet;
      const videoId = snippet?.resourceId?.videoId;
      if (!videoId || snippet.title === "Private video" || snippet.title === "Deleted video") {
        continue;
      }
      items.push({
        videoId,
        title: snippet.title,
        thumbnail: snippet.thumbnails?.medium?.url ?? snippet.thumbnails?.default?.url ?? "",
        channelTitle: snippet.videoOwnerChannelTitle ?? snippet.channelTitle ?? "",
      });
    }
    pageToken = data.nextPageToken;
  } while (pageToken);

  return items;
}

// playlistItems.list는 재생 시간을 주지 않아, 영상 id를 모아 videos.list로 따로 조회한다.
async function fetchDurations(videoIds: string[]): Promise<Map<string, string>> {
  const durations = new Map<string, string>();
  for (let i = 0; i < videoIds.length; i += 50) {
    const chunk = videoIds.slice(i, i + 50);
    const url = new URL(`${API_BASE}/videos`);
    url.searchParams.set("part", "contentDetails");
    url.searchParams.set("id", chunk.join(","));
    url.searchParams.set("key", YOUTUBE_API_KEY!);

    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`YouTube videos request failed: ${res.status}`);
    const data = await res.json();

    for (const item of data.items ?? []) {
      durations.set(item.id, parseDuration(item.contentDetails?.duration ?? ""));
    }
  }
  return durations;
}

async function fetchYoutubePlaylist(playlistId: string): Promise<PlaylistVideo[]> {
  const items = await fetchPlaylistItems(playlistId);
  const durations = await fetchDurations(items.map((item) => item.videoId));
  return items.map((item) => ({ ...item, duration: durations.get(item.videoId) ?? "" }));
}

export const getYoutubePlaylist = unstable_cache(
  fetchYoutubePlaylist,
  ["soowoo-youtube-playlist"],
  { revalidate: 3600, tags: ["youtube-playlist"] }
);
