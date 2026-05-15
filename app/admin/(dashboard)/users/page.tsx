import { headers } from "next/headers";
import { prisma } from "@/lib/db/client";
import { resolveHost } from "@/lib/auth/context";
import { DataTableToolbar } from "@/components/data-table-toolbar";
import { TenantUsersTable } from "./table";

export default async function TenantUsersPage() {
  const h = await headers();
  const ctx = resolveHost(h.get("host"));
  if (ctx.mode !== "tenant") return null;
  const tenant = await prisma.tenant.findUnique({ where: { slug: ctx.slug } });
  if (!tenant) return null;
  const users = await prisma.tenantUser.findMany({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      isOwner: true,
      status: true,
      lastLoginAt: true,
    },
  });
  const rows = users.map((u) => ({
    ...u,
    lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
  }));
  return (
    <div>
      <DataTableToolbar title="Users" createHref="/admin/users/new" createLabel="Invite user" />
      <TenantUsersTable data={rows} />
    </div>
  );
}
