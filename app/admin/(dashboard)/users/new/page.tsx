import { headers } from "next/headers";
import { prisma } from "@/lib/db/client";
import { resolveHost } from "@/lib/auth/context";
import { enterContext } from "@/lib/db/tenant-context";
import { PageHeader, Card } from "@/components/shell";
import { InviteTenantUserForm } from "./invite-form";

export default async function NewTenantUserPage() {
  const h = await headers();
  const ctx = resolveHost(h.get("host"));
  if (ctx.mode !== "tenant") return null;
  const tenant = await prisma.tenant.findUnique({ where: { slug: ctx.slug } });
  if (!tenant) return null;
  enterContext({ mode: "tenant-admin", tenantId: tenant.id });
  const roles = await prisma.roleTemplate.findMany({
    where: { scope: "TENANT", tenantId: tenant.id },
    orderBy: [{ isSystem: "desc" }, { name: "asc" }],
    select: { id: true, name: true },
  });
  return (
    <div>
      <PageHeader title="Invite user" />
      <Card>
        <InviteTenantUserForm roles={roles} />
      </Card>
    </div>
  );
}
