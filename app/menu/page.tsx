import { CATEGORY_ORDER, getDrinksByCategory } from "@/lib/drinks";
import { OrderDisclaimer } from "@/components/OrderDisclaimer";
import { DrinkIndexRow } from "@/components/DrinkIndexRow";

export const revalidate = 3600;

export default async function MenuPage() {
  const grouped = await getDrinksByCategory();

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-12 px-6 py-12 sm:px-10 sm:py-16">
      <div className="flex flex-col gap-6">
        <h1 className="font-serif text-2xl font-medium sm:text-3xl">술 메뉴</h1>
        <OrderDisclaimer />
      </div>

      {CATEGORY_ORDER.map((category) => {
        const drinks = grouped[category];
        if (drinks.length === 0) return null;
        return (
          <section key={category} className="flex flex-col gap-2">
            <h2 className="font-mono text-xs text-ink/50">
              {category}
            </h2>
            <div>
              {drinks.map((drink, i) => (
                <DrinkIndexRow key={drink.slug} drink={drink} index={i} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
