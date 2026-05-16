import { headers } from "next/headers";
import { prisma } from "@/lib/db/client";
import { getTranslations } from "next-intl/server";
import { resolveHost } from "@/lib/auth/context";
import { parseTenantSettings } from "@/lib/tenant/settings";
import { publicUrlForKey, s3Configured } from "@/lib/storage/s3";
import { PageHeader, Card } from "@/components/shell";
import { SettingsForm } from "./form";

export default async function TenantSettingsPage() {
  const h = await headers();
  const ctx = resolveHost(h.get("host"));
  if (ctx.mode !== "tenant") return null;
  const tenant = await prisma.tenant.findUnique({ where: { slug: ctx.slug } });
  if (!tenant) return null;

  const settings = parseTenantSettings(tenant.settingsJson);
  const logoUrl =
    settings.logoKey && s3Configured() ? publicUrlForKey(settings.logoKey) : null;
  const t = await getTranslations("settings");

  return (
    <div>
      <PageHeader title={t("title")} />
      <Card>
        <SettingsForm
          initial={{ name: tenant.name, settings, logoUrl }}
          storageEnabled={s3Configured()}
        />
      </Card>
    </div>
  );
}
