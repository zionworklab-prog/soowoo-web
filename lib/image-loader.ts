"use client";

// Notion(S3) 이미지는 원본이 수 MB라 Next 내장 최적화 서버의 업스트림 7초 제한에
// 걸리기 쉽다. 대신 시간 제한 없이 받아 디스크에 캐시하는 자체 라우트(/api/img)로 보낸다.
export default function imageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  // 로컬 정적 에셋(로고, 플레이스홀더 SVG 등)은 변환 없이 그대로 사용한다.
  if (src.startsWith("/")) {
    return src;
  }
  return `/api/img?src=${encodeURIComponent(src)}&w=${width}&q=${quality ?? 75}`;
}
