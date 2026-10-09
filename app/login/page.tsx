import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/hub/login-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isOwner, isOwnerConfigured } from "@/lib/hub/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Masuk" };

export default async function LoginPage() {
  if (await isOwner()) redirect("/hub");

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col justify-center px-6 py-24">
      <Card>
        <CardHeader>
          <CardTitle>Masuk ke Hub</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isOwnerConfigured() ? (
            <LoginForm />
          ) : (
            <p className="text-muted-foreground text-sm">
              Server belum dikonfigurasi. Setel <code>HUB_PASSWORD_HASH</code>{" "}
              dan <code>HUB_SESSION_SECRET</code> pada environment.
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
