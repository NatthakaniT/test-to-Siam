import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import { DesktopNav, MobileNav } from "@/components/Nav";
import { IconReceipt } from "@/components/Icons";
import "./globals.css";

const font = IBM_Plex_Sans_Thai({
  variable: "--font-plex",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ร้านเครื่องเขียน",
  description: "จัดการสินค้าและคำสั่งซื้อของร้าน",
};

export const viewport: Viewport = { themeColor: "#ffffff" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body className={`${font.variable} font-sans antialiased`}>
        <header className="sticky top-0 z-10 border-b border-line bg-white/95 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
            <Link href="/products" className="flex items-center gap-2.5 font-semibold">
              <span className="grid size-9 place-items-center rounded-xl bg-brand text-white">
                <IconReceipt />
              </span>
              ร้านเครื่องเขียน
            </Link>
            <DesktopNav />
          </div>
        </header>
        <main className="mx-auto max-w-4xl px-4 pt-6 pb-28 md:pb-12">{children}</main>
        <MobileNav />
      </body>
    </html>
  );
}
