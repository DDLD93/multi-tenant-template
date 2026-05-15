import { headers } from "next/headers";
import { prisma } from "@/lib/db/client";
import { getSession, readSessionToken } from "@/lib/auth/session";
import {
  PERMISSIONS,
  hasPermission,
  type PermissionKey,
  type PlatformActor,
  type TenantActor,
  type ClientActor,
} from "@/lib/auth/permissions";

export class AuthError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function requirePlatformActor(permission?: PermissionKey): Promise<PlatformActor> {
  const token = await readSessionToken("PLATFORM");
  const session = await getSession(token);
  if (!session || session.userType !== "PLATFORM") {
    throw new AuthError(401, "Authentication required.");
  }
  if (session.scope !== "FULL") {
    throw new AuthError(401, "Must complete password change.");
  }
  const user = await prisma.platformUser.findUnique({
    where: { id: session.userId },
  });
  if (!user || user.status !== "ACTIVE") throw new AuthError(401, "User not found or inactive.");

  const actor: PlatformActor = {
    kind: "platform",
    userId: user.id,
    isSuperAdmin: user.isSuperAdmin,
    permissions: new Set(user.permissions),
  };
  if (permission && !hasPermission(actor, permission)) {
    throw new AuthError(403, "Forbidden.");
  }
  return actor;
}

export async function requireTenantActor(permission?: PermissionKey): Promise<TenantActor> {
  const token = await readSessionToken("TENANT");
  const session = await getSession(token);
  if (!session || session.userType !== "TENANT" || !session.tenantId) {
    throw new AuthError(401, "Authentication required.");
  }
  if (session.scope !== "FULL") {
    throw new AuthError(401, "Must complete password change.");
  }
  const user = await prisma.tenantUser.findUnique({
    where: { id: session.userId },
  });
  if (!user || user.status !== "ACTIVE" || user.tenantId !== session.tenantId) {
    throw new AuthError(401, "User not found or inactive.");
  }

  const actor: TenantActor = {
    kind: "tenant",
    userId: user.id,
    tenantId: user.tenantId,
    isOwner: user.isOwner,
    permissions: new Set(user.permissions),
  };
  if (permission && !hasPermission(actor, permission)) {
    throw new AuthError(403, "Forbidden.");
  }
  return actor;
}

export async function requireClientActor(): Promise<ClientActor> {
  const token = await readSessionToken("CLIENT");
  const session = await getSession(token);
  if (!session || session.userType !== "CLIENT" || !session.tenantId) {
    throw new AuthError(401, "Authentication required.");
  }
  if (session.scope !== "FULL") {
    throw new AuthError(401, "Must complete password change.");
  }
  const client = await prisma.client.findUnique({ where: { id: session.userId } });
  if (!client || client.status !== "ACTIVE" || client.tenantId !== session.tenantId) {
    throw new AuthError(401, "Client not found or inactive.");
  }
  return { kind: "client", clientId: client.id, tenantId: client.tenantId };
}

export async function resolvedHostMode(): Promise<{ mode: string; tenantId: string | null }> {
  const h = await headers();
  return {
    mode: h.get("x-app-mode") ?? "platform",
    tenantId: h.get("x-tenant-id"),
  };
}

export { PERMISSIONS };
