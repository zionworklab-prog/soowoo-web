import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center px-6 sm:px-10">
      <div className="mb-16 mt-auto flex flex-col items-center gap-6 sm:mb-20">
        <Link
          href="/menu"
          aria-label="주류 메뉴 보기"
          className="transition-transform duration-200 hover:scale-105 active:scale-95"
        >
          <Image
            src="/brand/sauce_01.svg"
            alt=""
            width={100}
            height={96}
            className="w-16 sm:w-20"
          />
        </Link>
        <p className="max-w-xs text-center text-body text-muted">
          수우의 주류는 음식 곁에 자연스럽게 놓이는 술들입니다.
          <br />
          가볍게 한 잔부터, 긴 밤을 함께 보낼 술까지 준비해두었습니다.
        </p>
      </div>
    </div>
  );
}
