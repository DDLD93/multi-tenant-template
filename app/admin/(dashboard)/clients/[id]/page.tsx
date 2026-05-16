import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/db/client";
import { resolveHost } from "@/lib/auth/context";
import { enterContext } from "@/lib/db/tenant-context";
import { PageHeader, Card } from "@/components/shell";
import { ClientResetPasswordAction } from "./reset-action";

export default async function ClientDetailPage({
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
  enterContext({ mode: "tenant-admin", tenantId: tenant.id });
  const client = await prisma.client.findUnique({ where: { id } });
  if (!client || client.tenantId !== tenant.id) notFound();
  return (
    <div>
      <PageHeader title={`${client.firstName ?? ""} ${client.lastName ?? ""}`.trim() || client.email} />
      <Card>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <dt className="text-stone-500">Email</dt>
          <dd>{client.email}</dd>
          <dt className="text-stone-500">First name</dt>
          <dd>{client.firstName ?? "—"}</dd>
          <dt className="text-stone-500">Last name</dt>
          <dd>{client.lastName ?? "—"}</dd>
          <dt className="text-stone-500">Other name</dt>
          <dd>{client.otherName ?? "—"}</dd>
          <dt className="text-stone-500">Phone</dt>
          <dd>{client.phone ?? "—"}</dd>
          <dt className="text-stone-500">Status</dt>
          <dd>{client.status}</dd>
          <dt className="text-stone-500">Created</dt>
          <dd>{client.createdAt.toISOString()}</dd>
          <dt className="text-stone-500">Last login</dt>
          <dd>{client.lastLoginAt?.toISOString() ?? "—"}</dd>
        </dl>
        <ClientResetPasswordAction clientId={client.id} />
      </Card>
    </div>
  );
}
