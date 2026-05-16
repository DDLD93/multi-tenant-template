import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db/client";
import { getSession, readSessionToken } from "@/lib/auth/session";
import { resolveHost } from "@/lib/auth/context";
import { enterContext } from "@/lib/db/tenant-context";
import { parseTenantSettings, type ModuleKey } from "@/lib/tenant/settings";
import { AppShell, type NavItem } from "@/components/shell";

// `module: null` = always shown (Overview, Settings).
const NAV: Array<{ href: string; key: string; module: ModuleKey | null }> = [
  { href: "/admin/dashboard", key: "overview", module: null },
  { href: "/admin/users", key: "users", module: "users" },
  { href: "/admin/clients", key: "clients", module: "clients" },
  { href: "/admin/role-templates", key: "roles", module: "roles" },
  { href: "/admin/templates", key: "templates", module: "templates" },
  { href: "/admin/activity", key: "activity", module: "activity" },
  { href: "/admin/settings", key: "settings", module: null },
];

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const ctx = resolveHost(h.get("host"));
  if (ctx.mode !== "tenant") redirect("/admin/auth/login");

  const token = await readSessionToken("TENANT");
  const session = await getSession(token);
  if (!session || session.userType !== "TENANT") redirect("/admin/auth/login");
  if (session.scope === "MUST_CHANGE_PASSWORD") redirect("/admin/auth/change-password");

  enterContext({ mode: "tenant-admin", tenantId: session.tenantId });
  const user = await prisma.tenantUser.findUnique({
    where: { id: session.userId },
    select: { email: true, firstName: true, lastName: true, tenantId: true },
  });
  if (!user) redirect("/admin/auth/login");

  const tenant = await prisma.tenant.findUnique({
    where: { id: user.tenantId },
    select: { name: true, status: true, settingsJson: true },
  });
  if (!tenant || tenant.status !== "ACTIVE") redirect("/maintenance");

  const tNav = await getTranslations("nav");
  const enabled = parseTenantSettings(tenant?.settingsJson).enabledModules;
  const nav: NavItem[] = NAV.filter(
    (n) => n.module === null || enabled.includes(n.module)
  ).map((n) => ({ href: n.href, label: tNav(n.key) }));

  const label = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email;
  return (
    <AppShell
      title={tenant?.name ?? "Tenant"}
      nav={nav}
      userLabel={label}
      logoutEndpoint="/api/auth/logout"
      logoutRedirect="/admin/auth/login"
      logoutContext="tenant-admin"
    >
      {children}
    </AppShell>
  );
}
