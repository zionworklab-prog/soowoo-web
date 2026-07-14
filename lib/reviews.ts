import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import type { Review } from "./types";

const DATABASE_URL = process.env.DATABASE_URL;

export function isReviewsConfigured(): boolean {
  return Boolean(DATABASE_URL);
}

function getSql(): NeonQueryFunction<boolean, boolean> {
  if (!DATABASE_URL) throw new Error("DATABASE_URL is not set");
  return neon(DATABASE_URL);
}

// 콜드 스타트마다 반복 실행되지 않도록 함수 인스턴스 생존 기간 동안만 캐시한다.
let schemaReady: Promise<void> | undefined;

function ensureSchema(sql: NeonQueryFunction<boolean, boolean>): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS reviews (
          id TEXT PRIMARY KEY,
          slug TEXT NOT NULL,
          name TEXT NOT NULL,
          rating INTEGER NOT NULL,
          content TEXT NOT NULL,
          delete_token TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS reviews_slug_idx ON reviews (slug)`;
    })();
  }
  return schemaReady;
}

type ReviewRow = {
  id: string;
  slug: string;
  name: string;
  rating: number;
  content: string;
  created_at: string;
};

function rowToReview(row: ReviewRow): Review {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    rating: row.rating,
    content: row.content,
    createdTime: new Date(row.created_at).toISOString(),
  };
}

export async function listReviews(slug: string): Promise<Review[]> {
  const sql = getSql();
  await ensureSchema(sql);
  const rows = (await sql`
    SELECT id, slug, name, rating, content, created_at
    FROM reviews
    WHERE slug = ${slug}
    ORDER BY created_at DESC
  `) as ReviewRow[];
  return rows.map(rowToReview);
}

export async function createReview(input: {
  slug: string;
  name: string;
  rating: number;
  content: string;
}): Promise<{ id: string; deleteToken: string }> {
  const sql = getSql();
  await ensureSchema(sql);
  const id = crypto.randomUUID();
  const deleteToken = crypto.randomUUID();
  const name = input.name.trim() || "익명";
  await sql`
    INSERT INTO reviews (id, slug, name, rating, content, delete_token)
    VALUES (${id}, ${input.slug}, ${name}, ${input.rating}, ${input.content}, ${deleteToken})
  `;
  return { id, deleteToken };
}

export async function deleteReview(id: string, deleteToken: string): Promise<boolean> {
  if (!deleteToken) return false;
  const sql = getSql();
  await ensureSchema(sql);
  const rows = (await sql`
    DELETE FROM reviews WHERE id = ${id} AND delete_token = ${deleteToken} RETURNING id
  `) as { id: string }[];
  return rows.length > 0;
}
