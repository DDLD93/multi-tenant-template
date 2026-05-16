import { headers } from "next/headers";
import { prisma } from "@/lib/db/client";
import { resolveHost } from "@/lib/auth/context";
import { enterContext } from "@/lib/db/tenant-context";
import { PageHeader, Card } from "@/components/shell";

export default async function AdminOverviewPage() {
  const h = await headers();
  const ctx = resolveHost(h.get("host"));
  if (ctx.mode !== "tenant") return null;
  const tenant = await prisma.tenant.findUnique({ where: { slug: ctx.slug } });
  if (!tenant) return null;
  enterContext({ mode: "tenant-admin", tenantId: tenant.id });

  const [userCount, clientCount, recent] = await Promise.all([
    prisma.tenantUser.count({ where: { tenantId: tenant.id } }),
    prisma.client.count({ where: { tenantId: tenant.id } }),
    prisma.activityLog.findMany({
      where: { tenantId: tenant.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <div>
      <PageHeader title="Overview" />
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <div className="text-xs uppercase text-stone-500">Users</div>
          <div className="mt-1 text-2xl font-semibold">{userCount}</div>
        </Card>
        <Card>
          <div className="text-xs uppercase text-stone-500">Clients</div>
          <div className="mt-1 text-2xl font-semibold">{clientCount}</div>
        </Card>
      </div>
      <h2 className="mt-8 mb-2 text-sm font-semibold uppercase text-stone-500">Recent activity</h2>
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
