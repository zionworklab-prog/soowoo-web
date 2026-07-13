import { CATEGORY_ORDER, getDrinksByCategory } from "@/lib/drinks";
import { OrderDisclaimer } from "@/components/OrderDisclaimer";
import { MenuBrowser } from "@/components/MenuBrowser";

export const revalidate = 3600;

export default async function MenuPage() {
  const grouped = await getDrinksByCategory();

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-12 px-6 py-12 sm:px-10 sm:py-16">
      <div className="flex flex-col gap-6">
        <h1 className="font-serif text-2xl font-medium sm:text-3xl">술 메뉴</h1>
        <OrderDisclaimer />
      </div>

      <MenuBrowser grouped={grouped} categoryOrder={CATEGORY_ORDER} />
    </div>
  );
}
