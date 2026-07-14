import type { Drink } from "@/lib/types";
import { DrinkImagePlaceholder } from "@/components/DrinkImagePlaceholder";
import { ReviewSection } from "@/components/ReviewSection";

function Line({
  label,
  value,
  emptyFallback,
}: {
  label: string;
  value?: string;
  emptyFallback?: string;
}) {
  const display = value || emptyFallback;
  if (!display) return null;
  return (
    <>
      <dt className="text-body-small text-muted">{label}</dt>
      <dd className={`text-body-small ${value ? "text-ink" : "text-muted"}`}>{display}</dd>
    </>
  );
}

export function DrinkDetailContent({ drink }: { drink: Drink }) {
  const meta = [drink.category, drink.type && drink.type !== drink.category ? drink.type : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex w-full flex-col gap-6 bg-canvas text-ink">
      <DrinkImagePlaceholder imageUrl={drink.imageUrl} className="aspect-square w-full" />

      <div className="flex flex-col px-6 pb-10 sm:px-8">
        <div className="flex flex-col gap-1">
          <p className="text-caption text-muted">
            {meta}
            {drink.soldOut ? " · 품절" : ""}
          </p>
          <h1 className="text-section text-ink">{drink.name}</h1>
          {drink.description && (
            <p className="text-body text-muted">{drink.description}</p>
          )}
        </div>

        <hr className="my-4 border-t border-hairline" />

        {/* 라벨 열은 실제로 표시되는 가장 긴 라벨 폭에만 맞춰져 값과의 간격이 최소로 유지된다. */}
        <dl className="grid grid-cols-[max-content_1fr] gap-x-2 gap-y-1.5">
          <Line label="가격" value={drink.price} />
          <Line label="도수" value={drink.abv} />
          <Line label="지역" value={drink.region} />
          <Line label="산도" value={drink.acidity} emptyFallback="비공개" />
          <Line label="주도" value={drink.sakeDegree} emptyFallback="비공개" />
          <Line label="정미보합" value={drink.riceMilling} />
        </dl>

        {drink.tastingNotes && (
          <div className="mt-8 flex flex-col gap-1">
            <p className="text-caption text-muted">테이스팅 노트</p>
            <p className="text-body leading-[1.7] text-ink">{drink.tastingNotes}</p>
          </div>
        )}

        {drink.pairing && (
          <div className="mt-6 flex flex-col gap-1">
            <p className="text-caption text-muted">추천 페어링</p>
            <p className="text-body leading-[1.7] text-ink">{drink.pairing}</p>
          </div>
        )}

        <hr className="mt-12 border-t border-hairline" />

        <ReviewSection slug={drink.slug} />
      </div>
    </div>
  );
}
