import { NextRequest, NextResponse } from "next/server";
import { deleteReview, isReviewsConfigured } from "@/lib/reviews";

export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<"/api/reviews/[id]">
) {
  if (!isReviewsConfigured()) {
    return NextResponse.json({ error: "리뷰 기능이 아직 설정되지 않았습니다." }, { status: 503 });
  }

  const { id } = await ctx.params;
  const body = await request.json().catch(() => ({}));
  const deleteToken = typeof body.deleteToken === "string" ? body.deleteToken : "";

  const ok = await deleteReview(id, deleteToken);
  if (!ok) {
    return NextResponse.json({ error: "삭제 권한이 없습니다." }, { status: 403 });
  }
  return NextResponse.json({ ok: true });
}
