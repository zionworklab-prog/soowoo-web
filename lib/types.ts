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
  // Notion 파일 서명 URL은 1시간이면 만료되므로 URL 자체 대신 페이지 id를 저장해두고,
  // 실제 이미지 요청 시점(/api/img)에 항상 새로 서명된 URL을 받아온다.
  imageRef?: string;
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
