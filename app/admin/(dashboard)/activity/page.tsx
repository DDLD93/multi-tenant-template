import { headers } from "next/headers";
import { prisma } from "@/lib/db/client";
import { resolveHost } from "@/lib/auth/context";
import { PageHeader } from "@/components/shell";
import { ActivityTable } from "@/app/(platform)/(dashboard)/activity/table";

export default async function TenantActivityPage() {
  const h = await headers();
  const ctx = resolveHost(h.get("host"));
  if (ctx.mode !== "tenant") return null;
  const tenant = await prisma.tenant.findUnique({ where: { slug: ctx.slug } });
  if (!tenant) return null;
  const rows = await prisma.activityLog.findMany({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  const data = rows.map((r) => ({
    id: r.id,
    tenantId: r.tenantId,
    actorType: r.actorType,
    actorId: r.actorId,
    action: r.action,
    targetType: r.targetType,
    targetId: r.targetId,
    ip: r.ip,
    createdAt: r.createdAt.toISOString(),
  }));
  return (
    <div>
      <PageHeader title="Activity" />
      <ActivityTable data={data} />
    </div>
  );
}
