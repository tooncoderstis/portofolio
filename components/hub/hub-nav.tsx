"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type HubNavItem = { href: string; label: string };

function isActive(pathname: string, href: string): boolean {
  if (href === "/hub") {
    return (
      pathname === "/hub" ||
      (pathname.startsWith("/hub/") &&
        !pathname.startsWith("/hub/ideas") &&
        !pathname.startsWith("/hub/notifications"))
    );
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function HubNav({ items }: { items: HubNavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="-mx-1 flex items-center gap-1 overflow-x-auto">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "shrink-0 rounded-md px-3 py-1.5 text-sm transition-colors",
            isActive(pathname, item.href)
              ? "bg-accent text-foreground font-medium"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
