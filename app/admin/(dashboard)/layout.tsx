import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db/client";
import { requireTenantPage } from "@/lib/auth/page-guards";
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
  const actor = await requireTenantPage();

  const user = await prisma.tenantUser.findUnique({
    where: { id: actor.userId },
    select: { email: true, firstName: true, lastName: true },
  });
  if (!user) redirect("/admin/auth/login");

  const tenant = await prisma.tenant.findUnique({
    where: { id: actor.tenantId },
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
