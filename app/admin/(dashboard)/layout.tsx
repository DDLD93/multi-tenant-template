import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/db/client";
import { getSession, readSessionToken } from "@/lib/auth/session";
import { resolveHost } from "@/lib/auth/context";
import { AppShell, type NavItem } from "@/components/shell";

const NAV: NavItem[] = [
  { href: "/admin/dashboard", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/role-templates", label: "Roles" },
  { href: "/admin/templates", label: "Templates" },
  { href: "/admin/activity", label: "Activity" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const ctx = resolveHost(h.get("host"));
  if (ctx.mode !== "tenant") redirect("/admin/auth/login");

  const token = await readSessionToken("TENANT");
  const session = await getSession(token);
  if (!session || session.userType !== "TENANT") redirect("/admin/auth/login");
  if (session.scope === "MUST_CHANGE_PASSWORD") redirect("/admin/auth/change-password");

  const user = await prisma.tenantUser.findUnique({
    where: { id: session.userId },
    select: { email: true, firstName: true, lastName: true, tenantId: true },
  });
  if (!user) redirect("/admin/auth/login");

  const tenant = await prisma.tenant.findUnique({
    where: { id: user.tenantId },
    select: { name: true },
  });

  const label = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email;
  return (
    <AppShell
      title={tenant?.name ?? "Tenant"}
      nav={NAV}
      userLabel={label}
      logoutEndpoint="/api/auth/logout"
      logoutRedirect="/admin/auth/login"
      logoutContext="tenant-admin"
    >
      {children}
    </AppShell>
  );
}
