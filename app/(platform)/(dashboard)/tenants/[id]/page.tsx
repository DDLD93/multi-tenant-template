import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { requirePlatformPage } from "@/lib/auth/page-guards";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { PageHeader, Card } from "@/components/shell";
import { TenantActions } from "./actions";

export default async function TenantDrilldownPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePlatformPage(PERMISSIONS.PLATFORM_TENANTS_READ.key);
  const { id } = await params;
  const tenant = await prisma.tenant.findUnique({
    where: { id },
    include: {
      _count: { select: { users: true, clients: true } },
    },
  });
  if (!tenant) notFound();

  const recent = await prisma.activityLog.findMany({
    where: { tenantId: id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div>
      <PageHeader title={tenant.name} />
      <Card className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase text-stone-500">Slug / Status</div>
            <div className="mt-1 font-mono text-sm">{tenant.slug}</div>
            <div className="mt-1 text-sm">{tenant.status}</div>
          </div>
          <TenantActions tenantId={tenant.id} status={tenant.status} />
        </div>
      </Card>
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <div className="text-xs uppercase text-stone-500">Tenant users</div>
          <div className="mt-1 text-2xl font-semibold">{tenant._count.users}</div>
        </Card>
        <Card>
          <div className="text-xs uppercase text-stone-500">Clients</div>
          <div className="mt-1 text-2xl font-semibold">{tenant._count.clients}</div>
        </Card>
      </div>
      <h2 className="mt-8 mb-2 text-sm font-semibold uppercase text-stone-500">Activity</h2>
      <Card>
        <ul className="divide-y divide-stone-100 text-sm">
          {recent.length === 0 ? (
            <li className="py-3 text-stone-500">No activity yet.</li>
          ) : (
            recent.map((l) => (
              <li key={l.id} className="flex justify-between py-2">
                <span className="font-mono text-xs">{l.action}</span>
                <span className="text-xs text-stone-500">{l.createdAt.toISOString()}</span>
              </li>
            ))
          )}
        </ul>
      </Card>
    </div>
  );
}
