import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/db/client";
import { resolveHost } from "@/lib/auth/context";

/**
 * Client-area layout. Centralizes the host→tenant resolution and enforces
 * tenant lifecycle: a suspended/archived tenant shows the maintenance screen
 * for all client routes (PRD §13). Session redirects are handled by proxy.ts.
 */
export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const h = await headers();
  const ctx = resolveHost(h.get("host"));
  if (ctx.mode !== "tenant") redirect("/auth/login");

  const tenant = await prisma.tenant.findUnique({
    where: { slug: ctx.slug },
    select: { status: true },
  });
  if (!tenant) redirect("/auth/login");
  if (tenant.status !== "ACTIVE") redirect("/maintenance");

  return <>{children}</>;
}
