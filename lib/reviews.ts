import { Client } from "@notionhq/client";
import type { PageObjectResponse, RichTextItemResponse } from "@notionhq/client";
import type { Review } from "./types";

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const REVIEWS_DATABASE_ID = process.env.NOTION_REVIEWS_DATABASE_ID;

export function isReviewsConfigured(): boolean {
  return Boolean(NOTION_TOKEN && REVIEWS_DATABASE_ID);
}

function getClient(): Client {
  if (!NOTION_TOKEN) throw new Error("NOTION_TOKEN is not set");
  return new Client({ auth: NOTION_TOKEN });
}

// 실제 Notion "수우 리뷰" DB 컬럼명. README의 리뷰 DB 설정 안내와 맞춰뒀다.
const FIELDS = {
  title: "이름",
  slug: "술슬러그",
  name: "작성자",
  rating: "평점",
  content: "내용",
  deleteToken: "삭제토큰",
} as const;

let cachedDataSourceId: string | undefined;

async function resolveDataSourceId(client: Client): Promise<string> {
  if (cachedDataSourceId) return cachedDataSourceId;
  if (!REVIEWS_DATABASE_ID) throw new Error("NOTION_REVIEWS_DATABASE_ID is not set");
  const database = await client.databases.retrieve({ database_id: REVIEWS_DATABASE_ID });
  const dataSourceId =
    "data_sources" in database ? database.data_sources[0]?.id : undefined;
  if (!dataSourceId) throw new Error("Reviews database has no data source");
  cachedDataSourceId = dataSourceId;
  return dataSourceId;
}

function plainText(rich: RichTextItemResponse[] | undefined): string {
  if (!rich) return "";
  return rich.map((t) => t.plain_text).join("").normalize("NFC");
}

function richTextOf(page: PageObjectResponse, key: string): string {
  const prop = page.properties[key];
  return prop?.type === "rich_text" ? plainText(prop.rich_text) : "";
}

function pageToReview(page: PageObjectResponse): Review {
  const ratingProp = page.properties[FIELDS.rating];
  return {
    id: page.id,
    slug: richTextOf(page, FIELDS.slug),
    name: richTextOf(page, FIELDS.name) || "익명",
    rating: ratingProp?.type === "number" ? (ratingProp.number ?? 0) : 0,
    content: richTextOf(page, FIELDS.content),
    createdTime: page.created_time,
  };
}

export async function listReviews(slug: string): Promise<Review[]> {
  const client = getClient();
  const dataSourceId = await resolveDataSourceId(client);
  const reviews: Review[] = [];
  let cursor: string | undefined;
  do {
    const response = await client.dataSources.query({
      data_source_id: dataSourceId,
      filter: { property: FIELDS.slug, rich_text: { equals: slug } },
      sorts: [{ timestamp: "created_time", direction: "descending" }],
      start_cursor: cursor,
    });
    for (const page of response.results) {
      if ("properties" in page) reviews.push(pageToReview(page as PageObjectResponse));
    }
    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (cursor);
  return reviews;
}

export async function createReview(input: {
  slug: string;
  name: string;
  rating: number;
  content: string;
}): Promise<{ id: string; deleteToken: string }> {
  const client = getClient();
  const dataSourceId = await resolveDataSourceId(client);
  const deleteToken = crypto.randomUUID();
  const name = input.name.trim() || "익명";

  const page = await client.pages.create({
    parent: { type: "data_source_id", data_source_id: dataSourceId },
    properties: {
      [FIELDS.title]: { title: [{ text: { content: `${name} · ${input.slug}` } }] },
      [FIELDS.slug]: { rich_text: [{ text: { content: input.slug } }] },
      [FIELDS.name]: { rich_text: [{ text: { content: name } }] },
      [FIELDS.rating]: { number: input.rating },
      [FIELDS.content]: { rich_text: [{ text: { content: input.content } }] },
      [FIELDS.deleteToken]: { rich_text: [{ text: { content: deleteToken } }] },
    },
  });

  return { id: page.id, deleteToken };
}

export async function deleteReview(id: string, deleteToken: string): Promise<boolean> {
  if (!deleteToken) return false;
  const client = getClient();
  const page = await client.pages.retrieve({ page_id: id });
  if (!("properties" in page)) return false;
  const stored = richTextOf(page as PageObjectResponse, FIELDS.deleteToken);
  if (!stored || stored !== deleteToken) return false;
  await client.pages.update({ page_id: id, in_trash: true });
  return true;
}
