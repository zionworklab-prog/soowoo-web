import Link from "next/link";
import Image from "next/image";
import { OrderDisclaimer } from "@/components/OrderDisclaimer";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-24 text-center sm:px-10">
      <Image
        src="/brand/logo_symbol.svg"
        alt=""
        width={69}
        height={38}
        className="opacity-80"
      />
      <div className="flex flex-col gap-4">
        <h1 className="font-serif text-3xl font-medium tracking-tight sm:text-4xl">
          izakaya 수우
        </h1>
        <p className="max-w-md font-serif text-sm leading-7 text-ink/70 sm:text-base">
          수우가 준비한 사케, 소주, 전통주를 미리 둘러보세요.
          <br />
          방문하시기 전, 오늘의 술을 골라보는 시간이 되길 바랍니다.
        </p>
      </div>
      <Link
        href="/menu"
        className="border border-ink/30 px-8 py-3 font-mono text-xs transition-colors hover:bg-ink hover:text-cream"
      >
        메뉴 둘러보기
      </Link>
      <div className="w-full max-w-sm">
        <OrderDisclaimer />
      </div>
    </div>
  );
}
