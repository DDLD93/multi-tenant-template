import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/db/client";
import { resolveHost } from "@/lib/auth/context";
import { PageHeader, Card } from "@/components/shell";
import { ALL_TENANT_PERMISSION_KEYS } from "@/lib/auth/permissions";
import { UserDetailActions } from "@/app/(platform)/(dashboard)/users/[id]/actions";

export default async function TenantUserDetailPage({
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
  const user = await prisma.tenantUser.findUnique({ where: { id } });
  if (!user || user.tenantId !== tenant.id) notFound();
  const roles = await prisma.roleTemplate.findMany({
    where: { scope: "TENANT", tenantId: tenant.id },
    orderBy: [{ isSystem: "desc" }, { name: "asc" }],
    select: { id: true, name: true },
  });
  return (
    <div>
      <PageHeader title={`${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email} />
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <h2 className="text-sm font-semibold uppercase text-stone-500">Profile</h2>
          <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <dt className="text-stone-500">Email</dt>
            <dd>{user.email}</dd>
            <dt className="text-stone-500">First name</dt>
            <dd>{user.firstName ?? "—"}</dd>
            <dt className="text-stone-500">Last name</dt>
            <dd>{user.lastName ?? "—"}</dd>
            <dt className="text-stone-500">Other name</dt>
            <dd>{user.otherName ?? "—"}</dd>
            <dt className="text-stone-500">Phone</dt>
            <dd>{user.phone ?? "—"}</dd>
            <dt className="text-stone-500">Status</dt>
            <dd>{user.status}</dd>
            <dt className="text-stone-500">Owner</dt>
            <dd>{user.isOwner ? "yes" : "no"}</dd>
          </dl>
        </Card>
        <Card>
          <h2 className="text-sm font-semibold uppercase text-stone-500">Permissions & actions</h2>
          <UserDetailActions
            userId={user.id}
            scope="tenant"
            permissions={user.permissions}
            allPermissions={ALL_TENANT_PERMISSION_KEYS}
            roles={roles}
            applyRoleEndpoint={`/api/tenant/users/${user.id}/apply-role`}
            permissionsEndpoint={`/api/tenant/users/${user.id}/permissions`}
            resetPasswordEndpoint={`/api/tenant/users/${user.id}/reset-password`}
          />
        </Card>
      </div>
    </div>
  );
}
