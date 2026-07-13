import { CATEGORY_ORDER, getDrinksByCategory } from "@/lib/drinks";
import { MenuBrowser } from "@/components/MenuBrowser";

export const revalidate = 3600;

export default async function MenuPage() {
  const grouped = await getDrinksByCategory();

  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col px-6 py-12 sm:px-10 sm:py-16">
      <MenuBrowser grouped={grouped} categoryOrder={CATEGORY_ORDER} />
    </div>
  );
}
