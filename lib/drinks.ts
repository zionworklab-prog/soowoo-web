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
