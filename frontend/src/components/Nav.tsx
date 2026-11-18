"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconBox, IconCartPlus, IconReceipt } from "@/components/Icons";

const links = [
  { href: "/products", label: "สินค้า", Icon: IconBox },
  { href: "/orders", label: "คำสั่งซื้อ", Icon: IconReceipt },
  { href: "/orders/new", label: "สั่งซื้อ", Icon: IconCartPlus },
];

function isActive(path: string, href: string) {
  if (href === "/orders") return path.startsWith("/orders") && path !== "/orders/new";
  return path.startsWith(href);
}

/** Top links, desktop only (rendered inside the header). */
export function DesktopNav() {
  const path = usePathname();

  return (
    <nav aria-label="เมนูหลัก" className="hidden gap-1 md:flex">
      {links.map(({ href, label, Icon }) => {
        const active = isActive(path, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 font-medium transition-colors duration-150 ${
              active ? "bg-brand-soft text-brand" : "text-muted hover:text-brand"
            }`}
          >
            <Icon />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * Bottom tab bar on phones (easier to reach with a thumb).
 * Must live outside the header: its backdrop-blur would make `fixed` relative to the header.
 */
export function MobileNav() {
  const path = usePathname();

  return (
    <nav
      aria-label="เมนูหลัก"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid grid-cols-3">
        {links.map(({ href, label, Icon }) => {
          const active = isActive(path, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex h-16 flex-col items-center justify-center gap-1 text-sm font-medium ${
                  active ? "text-brand" : "text-muted"
                }`}
              >
                <Icon className="size-6" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
