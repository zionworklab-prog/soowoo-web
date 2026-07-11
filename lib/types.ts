export type DrinkCategory = "사케" | "소주" | "전통주";

export interface Drink {
  slug: string;
  name: string;
  category: DrinkCategory;
  type?: string;
  region?: string;
  sakeDegree?: string;
  acidity?: string;
  abv?: string;
  riceMilling?: string;
  price?: string;
  description?: string;
  tastingNotes?: string;
  pairing?: string;
  sortOrder: number;
  imageUrl?: string;
  soldOut?: boolean;
  featured?: boolean;
}
