import Link from "next/link";
import Image from "next/image";
import { NavDrawer } from "@/components/NavDrawer";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-hairline bg-canvas/95 px-6 py-2 backdrop-blur sm:px-10">
      <Link href="/" className="inline-flex items-center gap-3">
        <Image src="/brand/logo_kor.svg" alt="수우" width={64} height={30} priority />
      </Link>
      <NavDrawer />
    </header>
  );
}
