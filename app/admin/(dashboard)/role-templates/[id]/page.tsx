import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/db/client";
import { resolveHost } from "@/lib/auth/context";
import { PageHeader, Card } from "@/components/shell";
import { ALL_TENANT_PERMISSION_KEYS } from "@/lib/auth/permissions";
import { RoleDetailEditor } from "@/app/(platform)/(dashboard)/role-templates/[id]/editor";

export default async function TenantRoleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const h = await headers();
  const ctx = resolveHost(h.get("host"));
  if (ctx.mode !== "tenant") notFound();
  const tenant = await prisma.tenant.findUnique({ where: { slug: ctx.slug } });
  if (!tenant) notFound();
  const role = await prisma.roleTemplate.findUnique({ where: { id } });
  if (!role || role.scope !== "TENANT" || role.tenantId !== tenant.id) notFound();
  return (
    <div>
      <PageHeader title={role.name} />
      <Card>
        <RoleDetailEditor
          id={role.id}
          name={role.name}
          isSystem={role.isSystem}
          initial={role.permissions}
          allPermissions={ALL_TENANT_PERMISSION_KEYS}
          endpoint={`/api/tenant/role-templates/${role.id}`}
        />
      </Card>
    </div>
  );
}
