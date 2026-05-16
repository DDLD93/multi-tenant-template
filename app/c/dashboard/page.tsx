import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/db/client";
import { getSession, readSessionToken } from "@/lib/auth/session";
import { resolveHost } from "@/lib/auth/context";
import { enterContext } from "@/lib/db/tenant-context";
import { PageHeader, Card } from "@/components/shell";
import { LogoutButton } from "@/components/logout-button";

export default async function ClientDashboardPage() {
  const h = await headers();
  const ctx = resolveHost(h.get("host"));
  if (ctx.mode !== "tenant") redirect("/auth/login");
  const token = await readSessionToken("CLIENT");
  const session = await getSession(token);
  if (!session || session.userType !== "CLIENT") redirect("/auth/login");
  if (session.scope === "MUST_CHANGE_PASSWORD") redirect("/auth/change-password");
  enterContext({ mode: "tenant-client", tenantId: session.tenantId });
  const client = await prisma.client.findUnique({ where: { id: session.userId } });
  const tenant = await prisma.tenant.findUnique({ where: { slug: ctx.slug } });
  if (!client || !tenant) redirect("/auth/login");

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-8">
      <PageHeader
        title={`Welcome to ${tenant.name}`}
        action={
          <LogoutButton
            endpoint="/api/auth/logout"
            postLogoutPath="/auth/login"
            logoutContext="client"
          />
        }
      />
      <Card>
        <div className="text-xs uppercase text-stone-500">Signed in as</div>
        <div className="mt-1 text-sm">{client.email}</div>
      </Card>
      <Card>
        <h2 className="text-sm font-semibold uppercase text-stone-500">Your account</h2>
        <p className="mt-2 text-sm text-stone-600">
          This is the client area for {tenant.name}. Tenant-defined modules will appear here.
        </p>
      </Card>
    </div>
  );
}
