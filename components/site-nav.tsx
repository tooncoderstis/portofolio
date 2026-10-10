"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string };

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <nav className="hidden items-center gap-1 md:flex">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm transition-colors",
              isActive(pathname, item.href)
                ? "text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-1">
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
          aria-controls="site-mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>

      {open ? (
        <nav
          id="site-mobile-nav"
          className="border-border bg-background absolute inset-x-0 top-full border-b shadow-sm md:hidden"
        >
          <div className="mx-auto w-full max-w-5xl px-4 py-2">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block rounded-md px-3 py-2.5 text-sm",
                  isActive(pathname, item.href)
                    ? "bg-accent text-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </>
  );
}
