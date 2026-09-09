import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Notion 원본이 수 MB라 내장 최적화 서버의 업스트림 7초 제한에 걸린다.
    // 자체 캐시 라우트(/api/img)를 쓰는 커스텀 로더로 대체한다.
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
  },
  // next 패키지 자신도 내장 이미지 최적화용으로 sharp를 내부에 따로 갖고 있어서
  // (next/node_modules/sharp), 우리가 직접 의존하는 sharp와 버전이 다른 두 벌이
  // node_modules에 공존한다. Next.js가 서버리스 함수에 포함할 파일을 자동으로
  // 추적(file tracing)할 때 이 두 버전이 뒤섞여, 코드는 sharp 0.35.3의 로더를
  // 부르는데 실제로는 next 내부용(0.34.5)의 libvips .so만 번들에 들어가는 등
  // 버전이 어긋나 "Could not load the sharp module" 런타임 에러가 났다.
  // sharp를 외부 패키지로 명시하면 번들링/추적 대상에서 빼고 일반 Node.js
  // require로 그대로 불러오게 되어 이 혼선을 피할 수 있다.
  serverExternalPackages: ["sharp"],
};

export default nextConfig;
