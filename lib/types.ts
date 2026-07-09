export type DrinkCategory = "사케" | "소주" | "전통주";

export interface Drink {
  slug: string;
  name: string;
  category: DrinkCategory;
  type?: string;
  region?: string;
  brewery?: string;
  acidity?: string;
  abv?: string;
  price?: string;
  description?: string;
  tastingNotes?: string;
  pairing?: string;
  sortOrder: number;
  imageUrl?: string;
}
