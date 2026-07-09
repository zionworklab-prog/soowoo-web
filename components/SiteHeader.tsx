import Link from "next/link";
import Image from "next/image";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-ink/10 bg-cream/95 px-6 py-4 backdrop-blur sm:px-10">
      <Link href="/" className="flex items-center gap-3">
        <Image src="/brand/logo_kor.svg" alt="수우" width={56} height={26} priority />
      </Link>
      <nav className="flex items-center gap-6 font-mono text-xs uppercase tracking-widest text-ink/70">
        <Link href="/menu" className="transition-colors hover:text-ink">
          Menu
        </Link>
      </nav>
    </header>
  );
}
