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

// 실제 Notion 컬럼명이 아래 후보들과 다르면 scripts/inspect-notion.ts 결과를 보고 조정한다.
const FIELD_CANDIDATES = {
  name: ["이름", "Name", "제품명"],
  category: ["카테고리", "Category", "분류"],
  type: ["종류", "Type", "세부종류"],
  region: ["지역", "Region", "산지"],
  brewery: ["주도", "Brewery", "양조장"],
  acidity: ["산도", "Acidity"],
  abv: ["도수", "ABV", "도수(%)"],
  price: ["가격", "Price"],
  description: ["설명", "Description", "소개"],
  tastingNotes: ["테이스팅노트", "테이스팅 노트", "Tasting Notes"],
  pairing: ["추천페어링", "추천 페어링", "페어링", "Pairing"],
  sortOrder: ["정렬순서", "정렬 순서", "Sort", "Order"],
  image: ["이미지", "Image", "사진"],
} as const;

function findProperty(
  page: PageObjectResponse,
  candidates: readonly string[]
) {
  const entries = Object.entries(page.properties);
  for (const candidate of candidates) {
    const match = entries.find(
      ([key]) => key.trim().toLowerCase() === candidate.trim().toLowerCase()
    );
    if (match) return match[1];
  }
  return undefined;
}

function propertyToText(prop: PageObjectResponse["properties"][string] | undefined): string {
  if (!prop) return "";
  switch (prop.type) {
    case "title":
      return plainText(prop.title);
    case "rich_text":
      return plainText(prop.rich_text);
    case "select":
      return prop.select?.name ?? "";
    case "multi_select":
      return prop.multi_select.map((o) => o.name).join(", ");
    case "number":
      return prop.number != null ? String(prop.number) : "";
    case "url":
      return prop.url ?? "";
    default:
      return "";
  }
}

function propertyToNumber(prop: PageObjectResponse["properties"][string] | undefined): number | undefined {
  if (!prop) return undefined;
  if (prop.type === "number") return prop.number ?? undefined;
  const text = propertyToText(prop);
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function propertyToImageUrl(prop: PageObjectResponse["properties"][string] | undefined): string | undefined {
  if (!prop || prop.type !== "files") return undefined;
  const file = prop.files[0];
  if (!file) return undefined;
  if (file.type === "file") return file.file.url;
  if (file.type === "external") return file.external.url;
  return undefined;
}

// Notion의 카테고리 값(예: "고구마 소주", "보리 소주")을 사이트 상단 카테고리로 합친다.
// "동해 소주"처럼 이름에 '소주'가 들어가도 카테고리가 "전통주"면 전통주로 남는다 —
// 아래는 이름이 아니라 카테고리 필드 값만 보고 판단한다.
function mapToTopCategory(rawCategory: string): DrinkCategory | null {
  if (rawCategory.includes("소주") || rawCategory.includes("소츄")) return "소주";
  if (rawCategory.includes("사케")) return "사케";
  if (rawCategory.includes("전통주")) return "전통주";
  return null;
}

function pageToDrink(page: PageObjectResponse, index: number): Drink | null {
  const rawCategory = propertyToText(findProperty(page, FIELD_CANDIDATES.category));
  const category = mapToTopCategory(rawCategory);
  if (!category) return null;

  const name = propertyToText(findProperty(page, FIELD_CANDIDATES.name)) || "이름 없음";
  const sortOrder =
    propertyToNumber(findProperty(page, FIELD_CANDIDATES.sortOrder)) ?? index;

  return {
    slug: `${slugify(name)}-${page.id.slice(0, 8)}`,
    name,
    category,
    type: propertyToText(findProperty(page, FIELD_CANDIDATES.type)) || rawCategory || undefined,
    region: propertyToText(findProperty(page, FIELD_CANDIDATES.region)) || undefined,
    brewery: propertyToText(findProperty(page, FIELD_CANDIDATES.brewery)) || undefined,
    acidity: propertyToText(findProperty(page, FIELD_CANDIDATES.acidity)) || undefined,
    abv: propertyToText(findProperty(page, FIELD_CANDIDATES.abv)) || undefined,
    price: propertyToText(findProperty(page, FIELD_CANDIDATES.price)) || undefined,
    description: propertyToText(findProperty(page, FIELD_CANDIDATES.description)) || undefined,
    tastingNotes: propertyToText(findProperty(page, FIELD_CANDIDATES.tastingNotes)) || undefined,
    pairing: propertyToText(findProperty(page, FIELD_CANDIDATES.pairing)) || undefined,
    sortOrder,
    imageUrl: propertyToImageUrl(findProperty(page, FIELD_CANDIDATES.image)),
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
