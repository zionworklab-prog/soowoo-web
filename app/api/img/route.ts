import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";

// Notion이 파일을 올려두는 S3 버킷만 허용한다 (임의 URL 프록시 방지).
const ALLOWED_HOST = "prod-files-secure.s3.us-west-2.amazonaws.com";

const CACHE_DIR = path.join(os.tmpdir(), "soowoo-image-cache");

// 서명 쿼리는 1시간마다 바뀌므로, 경로(pathname)만으로 원본을 식별한다.
function cacheKey(pathname: string): string {
  return createHash("sha256").update(pathname).digest("hex").slice(0, 32);
}

async function readCache(file: string): Promise<Buffer | null> {
  try {
    return await readFile(file);
  } catch {
    return null;
  }
}

async function writeCache(file: string, data: Buffer | Uint8Array) {
  // 동시 요청이 같은 파일을 쓰다 깨진 캐시를 읽지 않도록, 임시 파일에 쓰고 교체한다.
  const tmp = `${file}.${process.pid}.${Math.random().toString(36).slice(2)}.tmp`;
  await writeFile(tmp, data);
  await rename(tmp, file);
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const src = params.get("src");
  const width = Math.min(Math.max(Number(params.get("w")) || 384, 16), 1920);
  const quality = Math.min(Math.max(Number(params.get("q")) || 75, 30), 90);

  if (!src) {
    return new Response("src is required", { status: 400 });
  }
  let srcUrl: URL;
  try {
    srcUrl = new URL(src);
  } catch {
    return new Response("invalid src", { status: 400 });
  }
  if (srcUrl.protocol !== "https:" || srcUrl.hostname !== ALLOWED_HOST) {
    return new Response("src not allowed", { status: 400 });
  }

  await mkdir(CACHE_DIR, { recursive: true });
  const key = cacheKey(srcUrl.pathname);
  const variantFile = path.join(CACHE_DIR, `${key}-w${width}-q${quality}.webp`);
  const originalFile = path.join(CACHE_DIR, `${key}-original`);

  const headers = {
    "Content-Type": "image/webp",
    "Cache-Control": "public, max-age=31536000, immutable",
  };

  const cachedVariant = await readCache(variantFile);
  if (cachedVariant) {
    return new Response(new Uint8Array(cachedVariant), { headers });
  }

  let original = await readCache(originalFile);
  if (!original) {
    const upstream = await fetch(srcUrl);
    if (!upstream.ok) {
      return new Response("upstream fetch failed", { status: 502 });
    }
    original = Buffer.from(await upstream.arrayBuffer());
    await writeCache(originalFile, original);
  }

  const resized = await sharp(original)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality })
    .toBuffer();
  await writeCache(variantFile, resized);

  return new Response(new Uint8Array(resized), { headers });
}
