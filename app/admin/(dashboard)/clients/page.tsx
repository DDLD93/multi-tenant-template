import { headers } from "next/headers";
import { prisma } from "@/lib/db/client";
import { resolveHost } from "@/lib/auth/context";
import { enterContext } from "@/lib/db/tenant-context";
import { DataTableToolbar } from "@/components/data-table-toolbar";
import { ClientsTable } from "./table";

export default async function ClientsPage() {
  const h = await headers();
  const ctx = resolveHost(h.get("host"));
  if (ctx.mode !== "tenant") return null;
  const tenant = await prisma.tenant.findUnique({ where: { slug: ctx.slug } });
  if (!tenant) return null;
  enterContext({ mode: "tenant-admin", tenantId: tenant.id });
  const clients = await prisma.client.findMany({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      status: true,
      lastLoginAt: true,
    },
  });
  const rows = clients.map((c) => ({
    ...c,
    lastLoginAt: c.lastLoginAt?.toISOString() ?? null,
  }));
  return (
    <div>
      <DataTableToolbar title="Clients" createHref="/admin/clients/new" createLabel="New client" />
      <ClientsTable data={rows} />
    </div>
  );
}
