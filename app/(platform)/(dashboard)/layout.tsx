import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { getSession, readSessionToken } from "@/lib/auth/session";
import { AppShell, type NavItem } from "@/components/shell";

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Overview" },
  { href: "/tenants", label: "Tenants" },
  { href: "/users", label: "Users" },
  { href: "/role-templates", label: "Roles" },
  { href: "/activity", label: "Activity" },
  { href: "/settings", label: "Settings" },
];

export default async function PlatformDashboardLayout({ children }: { children: React.ReactNode }) {
  const token = await readSessionToken("PLATFORM");
  const session = await getSession(token);
  if (!session || session.userType !== "PLATFORM") redirect("/auth/login");
  if (session.scope === "MUST_CHANGE_PASSWORD") redirect("/auth/change-password");

  const user = await prisma.platformUser.findUnique({
    where: { id: session.userId },
    select: { email: true, firstName: true, lastName: true },
  });
  if (!user) redirect("/auth/login");
  const label = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email;

  return (
    <AppShell title="Platform" nav={NAV} userLabel={label} logoutEndpoint="/api/auth/logout">
      {children}
    </AppShell>
  );
}
