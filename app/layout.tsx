import type { Metadata } from "next";
import { Noto_Serif_KR, IBM_Plex_Mono } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.css";

const notoSerifKr = Noto_Serif_KR({
  variable: "--font-noto-serif-kr",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "이자카야 수우 | 술 메뉴",
  description:
    "이자카야 수우에서 만나볼 수 있는 사케, 소주, 전통주를 미리 둘러보세요. 방문 전 참고용 안내이며 온라인 주문은 지원하지 않습니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${notoSerifKr.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-cream text-ink">
        <SiteHeader />
        <main className="flex flex-1 flex-col">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
