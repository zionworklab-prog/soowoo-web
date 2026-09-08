"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

type Photo = { src: string; width: number; height: number };

// 술 메뉴 카드와 같은 스크롤 리빌: 화면에 들어오면 살짝 떠오르며 나타난다.
function RevealPhoto({ photo }: { photo: Photo }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`w-full shrink-0 overflow-hidden transition-all duration-700 ease-out motion-reduce:transition-none ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-3 opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100"
      }`}
    >
      <Image
        src={photo.src}
        alt=""
        width={photo.width}
        height={photo.height}
        sizes="(min-width: 768px) 700px, 100vw"
        className="h-auto w-full object-cover"
      />
    </div>
  );
}

// 뷰포트와 상관없이 세로로 한 줄씩 쌓는다. 데스크탑에서도 콘텐츠 칼럼 폭이
// 넉넉하지 않아(사이드바 옆), 가로 스크롤보다 큰 이미지를 세로로 쭉 보여주는
// 쪽이 참고 레퍼런스(로고·메뉴·이미지 2단 구성)와도 맞다.
export function PhotoRow({ photos }: { photos: Photo[] }) {
  return (
    <div className="flex flex-col gap-3">
      {photos.map((photo) => (
        <RevealPhoto key={photo.src} photo={photo} />
      ))}
    </div>
  );
}
