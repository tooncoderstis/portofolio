import type { Metadata, Viewport } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { InstallPrompt } from "@/components/pwa/install-prompt";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { SiteNav } from "@/components/site-nav";
import { ThemeProvider } from "@/components/theme-provider";
import { getProfile } from "@/lib/content";

import "./globals.css";

const nav = [
  { href: "/", label: "Beranda" },
  { href: "/about", label: "Tentang" },
  { href: "/projects", label: "Proyek" },
  { href: "/hub", label: "Hub" },
];

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1220" },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const { frontmatter } = await getProfile();

  return {
    title: {
      default: `${frontmatter.name} — ${frontmatter.role}`,
      template: `%s — ${frontmatter.name}`,
    },
    description: frontmatter.tagline,
    applicationName: frontmatter.name,
    appleWebApp: {
      capable: true,
      title: frontmatter.name,
      statusBarStyle: "default",
    },
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
              <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
                <Link href="/" className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-semibold tracking-tight">
                    {profile.name}
                  </span>
                  <span className="text-muted-foreground truncate text-xs">
                    {profile.role}
                  </span>
                </Link>
                <SiteNav items={nav} />
              </div>
            </header>
            <div className="flex-1">{children}</div>
            <footer className="border-border/60 text-muted-foreground border-t py-8 text-center text-xs">
              Data live via GitHub · WakaTime · Umami · MonkeyType
            </footer>
          </div>
          <InstallPrompt />
          <ServiceWorkerRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
