import { headers } from "next/headers";
import { prisma } from "@/lib/db/client";
import { resolveHost } from "@/lib/auth/context";
import { enterContext } from "@/lib/db/tenant-context";
import { DataTableToolbar } from "@/components/data-table-toolbar";
import { RolesTable } from "@/app/(platform)/(dashboard)/role-templates/table";

export default async function TenantRolesPage() {
  const h = await headers();
  const ctx = resolveHost(h.get("host"));
  if (ctx.mode !== "tenant") return null;
  const tenant = await prisma.tenant.findUnique({ where: { slug: ctx.slug } });
  if (!tenant) return null;
  enterContext({ mode: "tenant-admin", tenantId: tenant.id });
  const roles = await prisma.roleTemplate.findMany({
    where: { scope: "TENANT", tenantId: tenant.id },
    orderBy: [{ isSystem: "desc" }, { name: "asc" }],
    select: { id: true, name: true, isSystem: true, permissions: true, createdAt: true },
  });
  const rows = roles.map((r) => ({
    ...r,
    permissionCount: r.permissions.length,
    createdAt: r.createdAt.toISOString(),
  }));
  return (
    <div>
      <DataTableToolbar title="Role templates" createHref="/admin/role-templates/new" createLabel="New role" />
      <RolesTable data={rows} />
    </div>
  );
}
