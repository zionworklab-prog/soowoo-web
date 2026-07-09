import type { Drink, DrinkCategory } from "./types";
import { mockDrinks } from "./mock-drinks";
import { getNotionDrinks, isNotionConfigured } from "./notion";

export const CATEGORY_ORDER: DrinkCategory[] = ["사케", "소주", "전통주"];

export async function getAllDrinks(): Promise<Drink[]> {
  if (isNotionConfigured()) {
    return getNotionDrinks();
  }
  return mockDrinks;
}

export async function getDrinksByCategory(): Promise<
  Record<DrinkCategory, Drink[]>
> {
  const drinks = await getAllDrinks();
  const grouped: Record<DrinkCategory, Drink[]> = {
    사케: [],
    소주: [],
    전통주: [],
  };
  for (const drink of drinks) {
    grouped[drink.category].push(drink);
  }
  for (const category of CATEGORY_ORDER) {
    grouped[category].sort((a, b) => a.sortOrder - b.sortOrder);
  }
  return grouped;
}

export async function getDrinkBySlug(slug: string): Promise<Drink | undefined> {
  const drinks = await getAllDrinks();
  // 동적 라우트 params가 percent-encoding된 채로 들어오는 경우가 있어 디코딩 후 비교한다.
  const decoded = decodeURIComponent(slug);
  return drinks.find((d) => d.slug === decoded);
}
