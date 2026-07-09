import Link from "next/link";
import { notFound } from "next/navigation";
import { getDrinkBySlug } from "@/lib/drinks";
import { DrinkImagePlaceholder } from "@/components/DrinkImagePlaceholder";

export const revalidate = 3600;

function Field({
  label,
  value,
  full = false,
}: {
  label: string;
  value?: string;
  full?: boolean;
}) {
  if (!value) return null;
  return (
    <div
      className={`flex flex-col gap-1 border-t border-cream/15 py-3 ${full ? "col-span-full" : ""}`}
    >
      <dt className="font-mono text-[10px] text-cream/45">
        {label}
      </dt>
      <dd className="font-serif text-sm text-cream/90">{value}</dd>
    </div>
  );
}

export default async function DrinkDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const drink = await getDrinkBySlug(slug);
  if (!drink) notFound();

  return (
    <div className="flex flex-1 flex-col bg-ink text-cream">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-6 py-12 sm:px-10 sm:py-16">
        <Link
          href="/menu"
          className="font-mono text-[11px] text-cream/50 hover:text-cream"
        >
          ← 메뉴로 돌아가기
        </Link>

        <DrinkImagePlaceholder
          category={drink.category}
          imageUrl={drink.imageUrl}
          className="aspect-[4/3] w-full"
        />

        <div className="flex flex-col gap-3">
          <span className="font-mono text-xs text-cream/50">
            {drink.category}
            {drink.type ? ` · ${drink.type}` : ""}
          </span>
          <h1 className="font-serif text-2xl font-medium sm:text-3xl">
            {drink.name}
          </h1>
          {drink.description && (
            <p className="font-serif text-sm leading-7 text-cream/80 sm:text-base">
              {drink.description}
            </p>
          )}
        </div>

        <dl className="grid grid-cols-2 gap-x-8 sm:grid-cols-3">
          <Field label="가격" value={drink.price} />
          <Field label="도수" value={drink.abv} />
          <Field label="산도" value={drink.acidity} />
          <Field label="지역" value={drink.region} />
          <Field label="주도" value={drink.brewery} />
          <Field label="테이스팅 노트" value={drink.tastingNotes} full />
          <Field label="추천 페어링" value={drink.pairing} full />
        </dl>
      </div>
    </div>
  );
}
