import Image from "next/image";
import type { DrinkCategory } from "@/lib/types";

// 카테고리별로 살짝 다른 톤을 주되, 이미지가 없을 때도 카탈로그처럼 차분하게 보이도록
// (다크 상세페이지 배경 위에서도 밝은 카드로 또렷하게 보이도록 불투명 배경을 쓴다)
const BACKGROUND_BY_CATEGORY: Record<DrinkCategory, string> = {
  사케: "bg-sand/70",
  소주: "bg-sand",
  전통주: "bg-cream",
};

export function DrinkImagePlaceholder({
  category,
  imageUrl,
  className = "",
}: {
  category: DrinkCategory;
  imageUrl?: string;
  className?: string;
}) {
  if (imageUrl) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image src={imageUrl} alt="" fill className="object-cover" unoptimized />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center ${BACKGROUND_BY_CATEGORY[category]} ${className}`}
    >
      <Image
        src="/brand/sauce_02.svg"
        alt=""
        width={64}
        height={54}
        className="opacity-50"
      />
    </div>
  );
}
