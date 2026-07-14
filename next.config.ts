import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Notion 원본이 수 MB라 내장 최적화 서버의 업스트림 7초 제한에 걸린다.
    // 자체 캐시 라우트(/api/img)를 쓰는 커스텀 로더로 대체한다.
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
  },
};

export default nextConfig;
