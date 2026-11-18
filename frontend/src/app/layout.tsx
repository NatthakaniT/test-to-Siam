import type { Metadata } from "next";
import Link from "next/link";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";

const font = Noto_Sans_Thai({ variable: "--font-thai", subsets: ["thai", "latin"] });

export const metadata: Metadata = {
  title: "ระบบขายสินค้าและคำสั่งซื้อ",
  description: "จัดการสินค้าและคำสั่งซื้อ",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body className={`${font.variable} font-sans antialiased`}>
        <header className="border-b border-gray-200 bg-white">
          <nav className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">
            <Link href="/products" className="mr-auto text-lg font-bold">
              ร้านค้า
            </Link>
            <Link href="/products" className="py-2 hover:text-blue-600">สินค้า</Link>
            <Link href="/orders" className="py-2 hover:text-blue-600">คำสั่งซื้อ</Link>
            <Link href="/orders/new" className="py-2 font-medium text-blue-600">+ สั่งซื้อ</Link>
          </nav>
        </header>
        <main className="mx-auto max-w-3xl p-4">{children}</main>
      </body>
    </html>
  );
}
