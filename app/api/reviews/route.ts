import { NextRequest, NextResponse } from "next/server";
import { createReview, isReviewsConfigured, listReviews } from "@/lib/reviews";

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }
  if (!isReviewsConfigured()) {
    return NextResponse.json({ reviews: [] });
  }
  const reviews = await listReviews(slug);
  return NextResponse.json({ reviews });
}

export async function POST(request: NextRequest) {
  if (!isReviewsConfigured()) {
    return NextResponse.json({ error: "리뷰 기능이 아직 설정되지 않았습니다." }, { status: 503 });
  }

  const body = await request.json();
  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 40) : "";
  const content = typeof body.content === "string" ? body.content.trim().slice(0, 1000) : "";
  const rating = Number(body.rating);

  if (!slug || !content || !Number.isFinite(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "입력값이 올바르지 않습니다." }, { status: 400 });
  }

  const result = await createReview({ slug, name, rating, content });
  return NextResponse.json(result, { status: 201 });
}
