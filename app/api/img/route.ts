import { unstable_cache } from "next/cache";
import sharp from "sharp";
import { resolveDrinkImageUrl } from "@/lib/notion";

// Notion이 파일을 올려두는 S3 버킷만 허용한다 (임의 URL 프록시 방지).
const ALLOWED_HOST = "prod-files-secure.s3.us-west-2.amazonaws.com";

// 콜드 스타트 직후 캐시가 비어있으면 한 페이지의 이미지 여러 개가 동시에
// 노션 조회 + S3 다운로드 + sharp 리사이즈를 각각 수행하게 되어 기본 제한
// 시간(플랫폼 기본값)을 넘기기 쉽다. 여유를 더 준다.
export const maxDuration = 30;

// 예전엔 os.tmpdir()의 로컬 디스크에 캐싱했는데, 이건 서버리스 인스턴스마다
// 따로 존재한다 — 인스턴스가 새로 뜰 때마다(오래 방치되었다가 재접속하거나,
// 트래픽이 몰려 인스턴스가 늘어날 때) 캐시가 텅 빈 상태로 시작해 이미지 처리를
// 처음부터 다시 하다 실패하는 게 "가끔 이미지가 안 뜨는" 원인이었다.
// unstable_cache는 이 프로젝트에서 술 목록/이미지 URL 조회에 이미 쓰고 있는
// Next.js Data Cache를 쓰는데, 이건 인스턴스 하나에 갇혀있지 않고 배포/요청
// 전체에서 공유된다 — 그래서 처리된 이미지 바이트 자체를 여기 담아두면 한 번만
// 성공적으로 처리되면 그 뒤로는 어느 인스턴스가 요청을 받아도 캐시를 그대로
// 재사용한다.
const getCachedImageVariant = unstable_cache(
  async (ref: string, width: number, quality: number): Promise<string | null> => {
    const freshUrl = await resolveDrinkImageUrl(ref);
    if (!freshUrl) return null;

    let srcUrl: URL;
    try {
      srcUrl = new URL(freshUrl);
    } catch {
      return null;
    }
    if (srcUrl.protocol !== "https:" || srcUrl.hostname !== ALLOWED_HOST) {
      return null;
    }

    // 타임아웃 없이 두면 S3 응답이 늦어질 때 플랫폼 함수 제한 시간까지 요청이
    // 걸려있다가 그대로 죽어버리므로, 그보다 먼저 끊어서 최소한 실패를 감지한다.
    const upstream = await fetch(srcUrl, { signal: AbortSignal.timeout(8000) });
    if (!upstream.ok) return null;

    const original = Buffer.from(await upstream.arrayBuffer());
    const resized = await sharp(original)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();

    return resized.toString("base64");
  },
  ["soowoo-drink-image-variant"],
  { revalidate: 60 * 60 * 24 * 30, tags: ["drink-image-bytes"] }
);

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const ref = params.get("ref");
  const width = Math.min(Math.max(Number(params.get("w")) || 384, 16), 1920);
  const quality = Math.min(Math.max(Number(params.get("q")) || 75, 30), 90);

  if (!ref) {
    return new Response("ref is required", { status: 400 });
  }

  let base64: string | null;
  try {
    base64 = await getCachedImageVariant(ref, width, quality);
  } catch {
    return new Response("failed to load image", { status: 502 });
  }
  if (!base64) {
    return new Response("image not found", { status: 404 });
  }

  return new Response(new Uint8Array(Buffer.from(base64, "base64")), {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
