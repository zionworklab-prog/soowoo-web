"use client";

import { useEffect, useState } from "react";
import type { Review } from "@/lib/types";

const TOKENS_KEY = "soowoo-review-tokens";

function readTokens(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(TOKENS_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveToken(id: string, token: string) {
  const tokens = readTokens();
  tokens[id] = token;
  localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
}

function removeToken(id: string) {
  const tokens = readTokens();
  delete tokens[id];
  localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
}

function Stars({
  value,
  onChange,
}: {
  value: number;
  onChange?: (value: number) => void;
}) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          aria-label={`${n}점`}
          className={`text-body-small leading-none ${
            n <= value ? "text-brand" : "text-hairline"
          } ${onChange ? "cursor-pointer" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export function ReviewSection({ slug }: { slug: string }) {
  const [reviews, setReviews] = useState<Review[] | null>(null);
  // reviews가 fetch로 채워지기 전까지는 화면에 반영되지 않으므로, 이 지연 초기화는
  // 서버 렌더와 클라이언트 첫 렌더 사이에 표시 결과 차이를 만들지 않는다.
  const [tokens, setTokens] = useState<Record<string, string>>(() =>
    typeof window === "undefined" ? {} : readTokens()
  );
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/reviews?slug=${encodeURIComponent(slug)}`)
      .then((res) => res.json())
      .then((data) => setReviews(data.reviews ?? []))
      .catch(() => setReviews([]));
  }, [slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, name, rating, content }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "후기 등록에 실패했습니다.");
      }
      const { id, deleteToken } = await res.json();
      saveToken(id, deleteToken);
      setTokens(readTokens());
      setReviews((prev) => [
        { id, slug, name: name.trim() || "익명", rating, content, createdTime: new Date().toISOString() },
        ...(prev ?? []),
      ]);
      setName("");
      setContent("");
      setRating(5);
    } catch (err) {
      setError(err instanceof Error ? err.message : "후기 등록에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    const token = tokens[id];
    if (!token) return;
    const res = await fetch(`/api/reviews/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deleteToken: token }),
    });
    if (res.ok) {
      removeToken(id);
      setTokens(readTokens());
      setReviews((prev) => prev?.filter((r) => r.id !== id) ?? null);
    }
  }

  return (
    <div className="mt-8 flex flex-col gap-4">
      <p className="text-caption text-muted">손님 후기{reviews ? ` (${reviews.length})` : ""}</p>

      {reviews === null ? (
        <p className="text-body-small text-muted">불러오는 중…</p>
      ) : reviews.length === 0 ? (
        <p className="text-body-small text-muted">아직 등록된 후기가 없습니다.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {reviews.map((review) => (
            <li key={review.id} className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-body-small text-ink">{review.name}</span>
                  <Stars value={review.rating} />
                </div>
                {tokens[review.id] && (
                  <button
                    type="button"
                    onClick={() => handleDelete(review.id)}
                    className="text-caption text-muted underline underline-offset-2 hover:text-ink"
                  >
                    삭제
                  </button>
                )}
              </div>
              <p className="text-body-small leading-[1.7] text-ink">{review.content}</p>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-3">
        <Stars value={rating} onChange={setRating} />
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름 (선택)"
          maxLength={40}
          className="w-32 border-b border-hairline bg-transparent pb-1 text-body-small text-ink outline-none placeholder:text-muted focus:border-ink"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="이 술은 어떠셨나요?"
          rows={3}
          maxLength={1000}
          required
          className="w-full resize-none border border-hairline bg-transparent p-3 text-body-small text-ink outline-none placeholder:text-muted focus:border-ink"
        />
        {error && <p className="text-caption text-error">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-fit bg-ink px-5 py-2 text-button tracking-[0.04em] text-white transition-colors hover:bg-black disabled:opacity-50"
        >
          {submitting ? "등록 중…" : "후기 남기기"}
        </button>
      </form>
    </div>
  );
}
