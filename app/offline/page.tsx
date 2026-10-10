import type { Metadata } from "next";
import Link from "next/link";

import { RetryButton } from "@/components/pwa/retry-button";

export const metadata: Metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-4 py-16 text-center sm:px-6 sm:py-24">
      <p className="text-muted-foreground text-sm font-medium">Mode offline</p>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Tidak ada koneksi internet
      </h1>
      <p className="text-muted-foreground max-w-md">
        Halaman ini belum tersimpan. Sambungkan kembali ke internet, lalu coba
        lagi.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <RetryButton />
        <Link
          href="/"
          className="text-sm font-medium underline underline-offset-4"
        >
          Kembali ke beranda
        </Link>
      </div>
    </main>
  );
}
