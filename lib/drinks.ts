import type { Drink, DrinkCategory } from "./types";
import { mockDrinks } from "./mock-drinks";
import { getNotionDrinks, isNotionConfigured } from "./notion";

export const CATEGORY_ORDER: DrinkCategory[] = ["사케", "고구마 소츄", "보리 소츄"];

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
    "고구마 소츄": [],
    "보리 소츄": [],
  };
  for (const drink of drinks) {
    grouped[drink.category].push(drink);
  }
  for (const category of CATEGORY_ORDER) {
    grouped[category].sort((a, b) => {
      // "고구마 소츄" 카테고리 안에서는 종류가 말차소츄인 항목을 뒤로 보낸다.
      const aIsMatcha = a.type?.includes("말차") ? 1 : 0;
      const bIsMatcha = b.type?.includes("말차") ? 1 : 0;
      if (aIsMatcha !== bIsMatcha) return aIsMatcha - bIsMatcha;
      return a.sortOrder - b.sortOrder;
    });
  }
  return grouped;
}
