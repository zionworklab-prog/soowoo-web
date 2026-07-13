import type { Drink } from "@/lib/types";
import { DrinkImagePlaceholder } from "@/components/DrinkImagePlaceholder";

function Line({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex gap-2">
      <dt className="w-14 shrink-0 text-body-small text-muted">{label}</dt>
      <dd className="text-body-small text-ink">{value}</dd>
    </div>
  );
}

export function DrinkDetailContent({ drink }: { drink: Drink }) {
  const meta = [drink.category, drink.type && drink.type !== drink.category ? drink.type : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex w-full flex-col gap-6 bg-canvas text-ink">
      <DrinkImagePlaceholder imageUrl={drink.imageUrl} className="aspect-[3/4] w-full" />

      <div className="flex flex-col gap-4 px-6 pb-8 sm:px-8">
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

        <dl className="flex flex-col gap-1.5">
          <Line label="가격" value={drink.price} />
          <Line label="도수" value={drink.abv} />
          <Line label="지역" value={drink.region} />
          <Line label="산도" value={drink.acidity} />
          <Line label="주도" value={drink.sakeDegree} />
          <Line label="정미보합" value={drink.riceMilling} />
        </dl>

        {drink.tastingNotes && (
          <div className="flex flex-col gap-1">
            <p className="text-caption text-muted">테이스팅 노트</p>
            <p className="text-body text-ink">{drink.tastingNotes}</p>
          </div>
        )}

        {drink.pairing && (
          <div className="flex flex-col gap-1">
            <p className="text-caption text-muted">추천 페어링</p>
            <p className="text-body text-ink">{drink.pairing}</p>
          </div>
        )}
      </div>
    </div>
  );
}
