import { prisma } from "@/lib/db/client";
import { DataTableToolbar } from "@/components/data-table-toolbar";
import { RolesTable } from "./table";

export default async function PlatformRolesPage() {
  const roles = await prisma.roleTemplate.findMany({
    where: { scope: "PLATFORM" },
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
      <DataTableToolbar title="Platform role templates" createHref="/role-templates/new" createLabel="New role" />
      <RolesTable data={rows} />
    </div>
  );
}
