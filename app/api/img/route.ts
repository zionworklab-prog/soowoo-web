import { unstable_cache } from "next/cache";
import { fetchDrinkImageUrl } from "@/lib/notion";

// Notion이 파일을 올려두는 S3 버킷만 허용한다 (임의 URL 프록시 방지).
const ALLOWED_HOST = "prod-files-secure.s3.us-west-2.amazonaws.com";

// 콜드 스타트 직후 캐시가 비어있으면 한 페이지의 이미지 여러 개가 동시에
// 노션 조회 + S3 다운로드 + sharp 리사이즈를 각각 수행하게 되어 기본 제한
// 시간(플랫폼 기본값)을 넘기기 쉽다. 여유를 더 준다.
export const maxDuration = 30;

async function buildImageVariant(ref: string, width: number, quality: number): Promise<string | null> {
  const freshUrl = await fetchDrinkImageUrl(ref);
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
  // 모듈 최상단에서 정적으로 import하면, sharp의 네이티브 바이너리 로드가
  // 배포 환경에서 실패할 때 요청을 처리하기도 전에 라우트 전체(콜드 스타트)가
  // 죽어버려 try/catch로 잡을 수조차 없다 — 함수 안에서 동적으로 불러와
  // 실패해도 최소한 에러로 잡히게 한다.
  const { default: sharp } = await import("sharp");
  const resized = await sharp(original)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality })
    .toBuffer();

  return resized.toString("base64");
}

// 예전엔 os.tmpdir()의 로컬 디스크에 캐싱했는데, 이건 서버리스 인스턴스마다
// 따로 존재한다 — 인스턴스가 새로 뜰 때마다(오래 방치되었다가 재접속하거나,
// 트래픽이 몰려 인스턴스가 늘어날 때) 캐시가 텅 빈 상태로 시작해 이미지 처리를
// 처음부터 다시 하다 실패하는 게 "가끔 이미지가 안 뜨는" 원인이었다.
// unstable_cache는 이 프로젝트에서 술 목록/이미지 URL 조회에 이미 쓰고 있는
// Next.js Data Cache를 쓰는데, 이건 인스턴스 하나에 갇혀있지 않고 배포/요청
// 전체에서 공유된다 — 그래서 처리된 이미지 바이트 자체를 여기 담아두면 한 번만
// 성공적으로 처리되면 그 뒤로는 어느 인스턴스가 요청을 받아도 캐시를 그대로
// 재사용한다.
//
// fetchDrinkImageUrl(캐시되지 않은 원본 조회)을 쓴다 — resolveDrinkImageUrl은
// 이미 unstable_cache로 감싸져 있어서, 그걸 또 다른 unstable_cache 안에서
// 부르면 캐시 중첩이 된다. 이 함수 자체가 처리된 바이트를 30일간 캐시하므로
// 노션 조회는 캐시 미스일 때만(드물게) 실행되어, 5분 캐시 없이 매번 새로
// 조회해도 문제없다.
//
// unstable_cache(...) 호출 자체도 모듈 최상단이 아니라 요청이 들어왔을 때
// 처음 한 번만 만들고 재사용한다 — 혹시 이 래핑 자체가 실패하더라도
// 콜드 스타트(모듈 로드) 시점이 아니라 요청 처리 중 try/catch 안에서
// 일어나게 하기 위함이다.
let cached: typeof buildImageVariant | undefined;
function getCachedImageVariant(ref: string, width: number, quality: number) {
  if (!cached) {
    cached = unstable_cache(buildImageVariant, ["soowoo-drink-image-variant"], {
      revalidate: 60 * 60 * 24 * 30,
      tags: ["drink-image-bytes"],
    });
  }
  return cached(ref, width, quality);
}

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
  } catch (error) {
    // 프로덕션에선 클라이언트로 상세 에러가 안 나가니, 최소한 배포 로그에는
    // 원인이 남도록 기록한다.
    console.error("[/api/img] failed to build image variant", { ref, width, quality, error });
    // TEMP DEBUG: 원인을 알아내려고 잠깐 에러 내용을 응답에 그대로 노출한다.
    // 민감 정보가 없는 엔드포인트라 안전하며, 원인 확인 후 바로 되돌린다.
    const message = error instanceof Error ? `${error.name}: ${error.message}\n${error.stack}` : String(error);
    return new Response(message, { status: 502 });
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
