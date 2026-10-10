import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { EnableNotifications } from "@/components/hub/enable-notifications";
import { HubNav } from "@/components/hub/hub-nav";
import { LogoutButton } from "@/components/hub/logout-button";
import { getVapidPublicKey } from "@/lib/hub/push";
import { isOwner } from "@/lib/hub/session";

export const dynamic = "force-dynamic";

const hubNav = [
  { href: "/hub", label: "Proyek" },
  { href: "/hub/ideas", label: "Ide" },
  { href: "/hub/notifications", label: "Notifikasi" },
];

export default async function HubLayout({ children }: { children: ReactNode }) {
  if (!(await isOwner())) redirect("/login");

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <HubNav items={hubNav} />
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <EnableNotifications publicKey={getVapidPublicKey()} />
          <LogoutButton />
        </div>
      </div>
      {children}
    </main>
  );
}
