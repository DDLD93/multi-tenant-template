import { headers } from "next/headers";
import { prisma } from "@/lib/db/client";
import { resolveHost } from "@/lib/auth/context";
import { PageHeader, Card } from "@/components/shell";
import { SettingsForm } from "./form";

export default async function TenantSettingsPage() {
  const h = await headers();
  const ctx = resolveHost(h.get("host"));
  if (ctx.mode !== "tenant") return null;
  const tenant = await prisma.tenant.findUnique({ where: { slug: ctx.slug } });
  if (!tenant) return null;
  return (
    <div>
      <PageHeader title="Settings" />
      <Card>
        <SettingsForm
          initial={{
            name: tenant.name,
            settingsJson: JSON.stringify(tenant.settingsJson ?? {}, null, 2),
          }}
        />
      </Card>
    </div>
  );
}
