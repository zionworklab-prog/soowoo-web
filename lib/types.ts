export type DrinkCategory = "사케" | "고구마 소츄" | "보리 소츄";

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
  priceSummary?: string;
  priceValue?: number;
  description?: string;
  tastingNotes?: string;
  pairing?: string;
  sortOrder: number;
  imageUrl?: string;
  soldOut?: boolean;
  featured?: boolean;
  limitedEdition?: boolean;
}

export interface Review {
  id: string;
  slug: string;
  name: string;
  rating: number;
  content: string;
  createdTime: string;
}
