import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col px-6 sm:px-10">
      <div className="mt-8 flex flex-col items-end text-right sm:mt-10">
        <p className="text-page-title text-ink motion-safe:animate-fade-rise-in-1">
          물 수 (<span className="font-serif-kr">水</span>)
        </p>
        <p className="text-page-title text-ink motion-safe:animate-fade-rise-in-2">
          깃 우 (<span className="font-serif-kr">羽</span>)
        </p>
        <p className="mt-2 text-body text-muted motion-safe:animate-fade-rise-in-3">
          물처럼 흐르고 새처럼 가볍게 머무는
          <br />
          작은 공간 ‘수우’ 입니다.
        </p>
      </div>
      <div className="mb-12 mt-auto flex flex-col items-start gap-8 sm:mb-16">
        <Link
          href="/menu"
          aria-label="주류 메뉴 보기"
          className="transition-transform duration-200 hover:scale-105 active:scale-95 motion-safe:animate-fade-rise-in-4"
        >
          <Image
            src="/brand/sauce_01.svg"
            alt=""
            width={200}
            height={192}
            className="w-40 sm:w-52"
          />
        </Link>
        <p className="text-body-small text-muted motion-safe:animate-fade-rise-in-5">
          수우의 주류는 음식 곁에 자연스럽게 놓이는 술들입니다.
          <br />
          가볍게 한 잔부터, 긴 밤을 함께 보낼 술까지 준비해두었습니다.
        </p>
      </div>
    </div>
  );
}
