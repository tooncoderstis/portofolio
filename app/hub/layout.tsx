import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { LogoutButton } from "@/components/hub/logout-button";
import { EnableNotifications } from "@/components/hub/enable-notifications";
import { getVapidPublicKey } from "@/lib/hub/push";
import { isOwner } from "@/lib/hub/session";

export const dynamic = "force-dynamic";

const hubNav = [
  { href: "/hub", label: "Proyek" },
  { href: "/hub/notifications", label: "Notifikasi" },
];

export default async function HubLayout({ children }: { children: ReactNode }) {
  if (!(await isOwner())) redirect("/login");

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <nav className="flex items-center gap-1">
          {hubNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground hover:text-foreground rounded-md px-3 py-1.5 text-sm transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <EnableNotifications publicKey={getVapidPublicKey()} />
          <LogoutButton />
        </div>
      </div>
      {children}
    </main>
  );
}
