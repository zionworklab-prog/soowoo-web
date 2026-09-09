"use client";

import { useState } from "react";
import Image from "next/image";

export function DrinkImagePlaceholder({
  imageRef,
  sizes,
  className = "",
}: {
  imageRef?: string;
  sizes?: string;
  className?: string;
}) {
  // 콜드 스타트 직후 /api/img가 일시적으로 실패할 수 있다 — 그대로 두면 브라우저
  // 기본 깨진 이미지 아이콘이 보이므로, 실패 시 이미지가 없을 때와 같은
  // 플레이스홀더로 대신 보여준다.
  const [failed, setFailed] = useState(false);

  if (imageRef && !failed) {
    return (
      <div className={`relative overflow-hidden bg-surface ${className}`}>
        <Image src={imageRef} alt="" fill sizes={sizes} className="object-cover" onError={() => setFailed(true)} />
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center bg-surface ${className}`}>
      <Image
        src="/brand/sauce_02.svg"
        alt=""
        width={96}
        height={82}
        className="h-auto w-1/3 min-w-12 opacity-40"
      />
    </div>
  );
}
