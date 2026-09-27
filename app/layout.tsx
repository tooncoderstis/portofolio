import type { Metadata } from "next";
import type { ReactNode } from "react";

import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { site } from "@/lib/site";

import "./globals.css";

export const metadata: Metadata = {
  title: `${site.name} — ${site.role}`,
  description: site.tagline,
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
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
              <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold tracking-tight">
                    {site.name}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {site.role}
                  </span>
                </div>
                <ThemeToggle />
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
