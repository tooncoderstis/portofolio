import Link from "next/link";

import { AutoRefresh } from "@/components/hub/auto-refresh";
import { MarkReadButton } from "@/components/hub/mark-read-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/format";
import { listNotifications } from "@/lib/hub/store";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const notifications = await listNotifications(100);
  const unread = notifications.filter((item) => !item.read).length;

  return (
    <div className="space-y-8">
      <AutoRefresh intervalMs={20_000} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Notifikasi</h1>
          <p className="text-muted-foreground text-sm">
            {unread > 0
              ? `${unread} notifikasi belum dibaca.`
              : "Semua notifikasi sudah dibaca."}
          </p>
        </div>
        {unread > 0 ? <MarkReadButton /> : null}
      </div>

      <Card>
        <CardContent className="pt-6">
          {notifications.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Belum ada notifikasi. Notifikasi muncul saat sebuah fase
              dilaporkan selesai.
            </p>
          ) : (
            <ul className="divide-border divide-y">
              {notifications.map((item) => (
                <li key={item.id} className="flex items-start gap-3 py-3">
                  {!item.read ? (
                    <span
                      className="bg-primary mt-2 size-2 shrink-0 rounded-full"
                      aria-label="belum dibaca"
                    />
                  ) : (
                    <span className="mt-2 size-2 shrink-0 rounded-full" />
                  )}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{item.title}</span>
                      {item.phaseId ? (
                        <Badge variant="secondary">{item.phaseId}</Badge>
                      ) : null}
                    </div>
                    {item.body ? (
                      <p className="text-muted-foreground text-sm">
                        {item.body}
                      </p>
                    ) : null}
                    <div className="text-muted-foreground flex items-center gap-2 text-xs">
                      <Link
                        href={`/hub/${item.project}`}
                        className="hover:underline"
                      >
                        {item.project}
                      </Link>
                      <span>· {formatRelativeTime(item.createdAt)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
