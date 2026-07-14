import { Client } from "@notionhq/client";
import type {
  PageObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client";
import { unstable_cache } from "next/cache";
import type { Drink, DrinkCategory } from "./types";
import { slugify } from "./slugify";

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

export function isNotionConfigured(): boolean {
  return Boolean(NOTION_TOKEN && NOTION_DATABASE_ID);
}

function getClient(): Client {
  if (!NOTION_TOKEN) {
    throw new Error("NOTION_TOKEN is not set");
  }
  return new Client({ auth: NOTION_TOKEN });
}

// 하나의 데이터베이스는 하나 이상의 "데이터 소스"를 가질 수 있다 (Notion API 2025-09 이후).
// database_id로 첫 번째 데이터 소스 id를 조회한 뒤, 그 id로 실제 행(row)을 쿼리한다.
async function resolveDataSourceId(client: Client): Promise<string> {
  if (!NOTION_DATABASE_ID) {
    throw new Error("NOTION_DATABASE_ID is not set");
  }
  const database = await client.databases.retrieve({
    database_id: NOTION_DATABASE_ID,
  });
  const dataSourceId =
    "data_sources" in database ? database.data_sources[0]?.id : undefined;
  if (!dataSourceId) {
    throw new Error("Notion database has no data source");
  }
  return dataSourceId;
}

async function fetchAllPages(
  client: Client,
  dataSourceId: string
): Promise<PageObjectResponse[]> {
  const pages: PageObjectResponse[] = [];
  let cursor: string | undefined;
  do {
    const response = await client.dataSources.query({
      data_source_id: dataSourceId,
      start_cursor: cursor,
    });
    for (const page of response.results) {
      if ("properties" in page) {
        pages.push(page as PageObjectResponse);
      }
    }
    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (cursor);
  return pages;
}

function plainText(rich: RichTextItemResponse[] | undefined): string {
  if (!rich) return "";
  return rich.map((t) => t.plain_text).join("");
}

// scripts/inspect-notion.ts로 확인한 실제 soowoo-drink DB 컬럼명.
const FIELD_CANDIDATES = {
  name: ["이름", "Name", "제품명"],
  category: ["종류", "카테고리", "Category"],
  region: ["지역", "Region", "산지"],
  sakeDegreeNumber: ["주도"],
  sakeDegreeText: ["주도(日本酒度)"],
  acidity: ["산도", "Acidity"],
  abv: ["도수", "ABV"],
  riceMilling: ["정미보합"],
  description: ["설명(한줄)", "설명", "Description"],
  tastingNotes: ["상세설명", "테이스팅노트", "테이스팅 노트"],
  pairing: ["추천 페어링", "추천페어링", "페어링"],
  sortOrder: ["정렬순서", "정렬 순서", "Sort"],
  image: ["이미지", "Image", "사진"],
  visible: ["노출"],
  soldOut: ["품절"],
  featured: ["추천메뉴"],
  limitedEdition: ["한정주"],
  glassOnSale: ["잔 판매"],
  glassPrice: ["잔 가격"],
  bottleOnSale: ["병 판매"],
  bottlePrice: ["병 가격"],
  tokkuriOnSale: ["도쿠리 판매"],
  tokkuriPrice: ["도쿠리 가격"],
} as const;

type NotionProperty = PageObjectResponse["properties"][string];

function findProperty(
  page: PageObjectResponse,
  candidates: readonly string[]
): NotionProperty | undefined {
  const entries = Object.entries(page.properties);
  for (const candidate of candidates) {
    const match = entries.find(
      ([key]) => key.trim().toLowerCase() === candidate.trim().toLowerCase()
    );
    if (match) return match[1];
  }
  return undefined;
}

function prop(page: PageObjectResponse, candidates: readonly string[]) {
  return findProperty(page, candidates);
}

function propertyToText(p: NotionProperty | undefined): string {
  if (!p) return "";
  const raw = (() => {
    switch (p.type) {
      case "title":
        return plainText(p.title);
      case "rich_text":
        return plainText(p.rich_text);
      case "select":
        return p.select?.name ?? "";
      case "multi_select":
        return p.multi_select.map((o) => o.name).join(", ");
      case "number":
        return p.number != null ? String(p.number) : "";
      case "url":
        return p.url ?? "";
      default:
        return "";
    }
  })();
  // 자모가 분리된 형태(NFD)로 저장된 한글이 있어 항상 완성형(NFC)으로 정규화한다.
  return raw.normalize("NFC");
}

function propertyToNumber(p: NotionProperty | undefined): number | undefined {
  if (!p) return undefined;
  if (p.type === "number") return p.number ?? undefined;
  const parsed = Number(propertyToText(p));
  return Number.isFinite(parsed) && propertyToText(p) !== "" ? parsed : undefined;
}

function propertyToBoolean(p: NotionProperty | undefined): boolean {
  return p?.type === "checkbox" ? p.checkbox : false;
}

function propertyToImageUrl(p: NotionProperty | undefined): string | undefined {
  if (!p || p.type !== "files") return undefined;
  const file = p.files[0];
  if (!file) return undefined;
  if (file.type === "file") return file.file.url;
  if (file.type === "external") return file.external.url;
  return undefined;
}

function formatWon(n: number): string {
  return `${n.toLocaleString("ko-KR")}원`;
}

// 잔 / 병 / 도쿠리 각각 판매 여부(checkbox) + 가격(number)이 따로 있어 하나의 표시용 문자열로 합친다.
function extractPrice(page: PageObjectResponse): string | undefined {
  const options: Array<{
    label: string;
    onSale: readonly string[];
    price: readonly string[];
  }> = [
    { label: "잔", onSale: FIELD_CANDIDATES.glassOnSale, price: FIELD_CANDIDATES.glassPrice },
    { label: "병", onSale: FIELD_CANDIDATES.bottleOnSale, price: FIELD_CANDIDATES.bottlePrice },
    { label: "도쿠리", onSale: FIELD_CANDIDATES.tokkuriOnSale, price: FIELD_CANDIDATES.tokkuriPrice },
  ];
  const parts: string[] = [];
  for (const option of options) {
    const onSale = propertyToBoolean(prop(page, option.onSale));
    const price = propertyToNumber(prop(page, option.price));
    if (onSale && price != null) {
      parts.push(`${option.label} ${formatWon(price)}`);
    }
  }
  return parts.length ? parts.join(" · ") : undefined;
}

// 카드 목록에는 병·잔 가격까지만 보여준다 (도쿠리는 상세 팝업에서만).
function extractPriceSummary(page: PageObjectResponse): string | undefined {
  const options: Array<{
    label: string;
    onSale: readonly string[];
    price: readonly string[];
  }> = [
    { label: "병", onSale: FIELD_CANDIDATES.bottleOnSale, price: FIELD_CANDIDATES.bottlePrice },
    { label: "잔", onSale: FIELD_CANDIDATES.glassOnSale, price: FIELD_CANDIDATES.glassPrice },
  ];
  const parts: string[] = [];
  for (const option of options) {
    const onSale = propertyToBoolean(prop(page, option.onSale));
    const price = propertyToNumber(prop(page, option.price));
    if (onSale && price != null) {
      parts.push(`${option.label} ${formatWon(price)}`);
    }
  }
  return parts.length ? parts.join(" · ") : undefined;
}

// 가격순 정렬용 대표 숫자 값 (병 > 잔 우선순위는 extractPriceSummary와 동일하게 맞춘다).
function extractPriceValue(page: PageObjectResponse): number | undefined {
  const options: Array<{ onSale: readonly string[]; price: readonly string[] }> = [
    { onSale: FIELD_CANDIDATES.bottleOnSale, price: FIELD_CANDIDATES.bottlePrice },
    { onSale: FIELD_CANDIDATES.glassOnSale, price: FIELD_CANDIDATES.glassPrice },
    { onSale: FIELD_CANDIDATES.tokkuriOnSale, price: FIELD_CANDIDATES.tokkuriPrice },
  ];
  for (const option of options) {
    const onSale = propertyToBoolean(prop(page, option.onSale));
    const price = propertyToNumber(prop(page, option.price));
    if (onSale && price != null) return price;
  }
  return undefined;
}

// 숫자형 "주도"가 있으면 우선 사용(+/- 부호를 붙여 일본주도 표기 관례를 따른다),
// 없으면 텍스트형 "주도(日本酒度)"를 그대로 쓴다.
function extractSakeDegree(page: PageObjectResponse): string | undefined {
  const num = propertyToNumber(prop(page, FIELD_CANDIDATES.sakeDegreeNumber));
  if (num != null) return num > 0 ? `+${num}` : String(num);
  const text = propertyToText(prop(page, FIELD_CANDIDATES.sakeDegreeText));
  return text || undefined;
}

function extractAbv(page: PageObjectResponse): string | undefined {
  const num = propertyToNumber(prop(page, FIELD_CANDIDATES.abv));
  return num != null ? `${num}도` : undefined;
}

function extractRiceMilling(page: PageObjectResponse): string | undefined {
  const num = propertyToNumber(prop(page, FIELD_CANDIDATES.riceMilling));
  return num != null ? `${num}%` : undefined;
}

// Notion "종류" 값을 사이트 상단 카테고리로 합친다.
// "말차소츄"도 "고구마 소츄" 카테고리에 포함하되, 목록에서는 고구마소츄 항목이 먼저,
// 말차소츄 항목이 뒤에 오도록 lib/drinks.ts에서 종류(rawCategory) 기준으로 다시 정렬한다.
// 전통주는 더 이상 노출하지 않는다 (일치하는 분기가 없으면 자동으로 제외됨).
function mapToTopCategory(rawCategory: string): DrinkCategory | null {
  if (rawCategory.includes("고구마") || rawCategory.includes("말차")) return "고구마 소츄";
  if (rawCategory.includes("보리")) return "보리 소츄";
  if (rawCategory.includes("사케")) return "사케";
  return null;
}

function pageToDrink(page: PageObjectResponse, index: number): Drink | null {
  const visible = propertyToBoolean(prop(page, FIELD_CANDIDATES.visible));
  if (!visible) return null;

  const rawCategory = propertyToText(prop(page, FIELD_CANDIDATES.category));
  const category = mapToTopCategory(rawCategory);
  if (!category) return null;

  const name = propertyToText(prop(page, FIELD_CANDIDATES.name)) || "이름 없음";
  const sortOrder = propertyToNumber(prop(page, FIELD_CANDIDATES.sortOrder)) ?? index;

  const idSuffix = page.id.replace(/-/g, "").slice(-8);

  return {
    // 같은 워크스페이스에서 만들어진 페이지들은 id 앞부분이 서로 같을 수 있어
    // 뒤쪽(랜덤 구간)을 슬러그 접미사로 쓴다.
    slug: `${slugify(name)}-${idSuffix}`,
    name,
    category,
    type: rawCategory || undefined,
    region: propertyToText(prop(page, FIELD_CANDIDATES.region)) || undefined,
    sakeDegree: extractSakeDegree(page),
    acidity: propertyToText(prop(page, FIELD_CANDIDATES.acidity)) || undefined,
    abv: extractAbv(page),
    riceMilling: extractRiceMilling(page),
    price: extractPrice(page),
    priceSummary: extractPriceSummary(page),
    priceValue: extractPriceValue(page),
    description: propertyToText(prop(page, FIELD_CANDIDATES.description)) || undefined,
    tastingNotes: propertyToText(prop(page, FIELD_CANDIDATES.tastingNotes)) || undefined,
    pairing: propertyToText(prop(page, FIELD_CANDIDATES.pairing)) || undefined,
    sortOrder,
    imageUrl: propertyToImageUrl(prop(page, FIELD_CANDIDATES.image)),
    soldOut: propertyToBoolean(prop(page, FIELD_CANDIDATES.soldOut)),
    featured: propertyToBoolean(prop(page, FIELD_CANDIDATES.featured)),
    limitedEdition: propertyToBoolean(prop(page, FIELD_CANDIDATES.limitedEdition)),
  };
}

async function fetchDrinksFromNotion(): Promise<Drink[]> {
  const client = getClient();
  const dataSourceId = await resolveDataSourceId(client);
  const pages = await fetchAllPages(client, dataSourceId);
  return pages
    .map((page, i) => pageToDrink(page, i))
    .filter((d): d is Drink => d !== null)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export const getNotionDrinks = unstable_cache(
  fetchDrinksFromNotion,
  ["soowoo-drinks"],
  { revalidate: 3600, tags: ["drinks"] }
);
