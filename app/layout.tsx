import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { getProfile } from "@/lib/content";

import "./globals.css";

const nav = [
  { href: "/", label: "Beranda" },
  { href: "/about", label: "Tentang" },
  { href: "/projects", label: "Proyek" },
];

export async function generateMetadata(): Promise<Metadata> {
  const { frontmatter } = await getProfile();

  return {
    title: {
      default: `${frontmatter.name} — ${frontmatter.role}`,
      template: `%s — ${frontmatter.name}`,
    },
    description: frontmatter.tagline,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const { frontmatter: profile } = await getProfile();

  return (
    <html lang="id" suppressHydrationWarning>
      <body className="bg-background text-foreground min-h-screen antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col">
            <header className="border-border/60 bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
              <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-4">
                <Link href="/" className="flex flex-col">
                  <span className="text-sm font-semibold tracking-tight">
                    {profile.name}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {profile.role}
                  </span>
                </Link>
                <nav className="flex items-center gap-1">
                  {nav.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-muted-foreground hover:text-foreground rounded-md px-3 py-1.5 text-sm transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <ThemeToggle />
                </nav>
              </div>
            </header>
            <div className="flex-1">{children}</div>
            <footer className="border-border/60 text-muted-foreground border-t py-8 text-center text-xs">
              Data live via GitHub · WakaTime · Umami · MonkeyType
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
