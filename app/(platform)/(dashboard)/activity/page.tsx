import { prisma } from "@/lib/db/client";
import { PageHeader } from "@/components/shell";
import { ActivityTable } from "./table";

export default async function PlatformActivityPage() {
  const rows = await prisma.activityLog.findMany({
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
      <PageHeader title="System activity" />
      <ActivityTable data={data} />
    </div>
  );
}
