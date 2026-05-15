import { prisma } from "@/lib/db/client";

const WINDOW_MS = 1000 * 60 * 15;
const MAX_FAILURES = 10;
const LOCKOUT_MS = 1000 * 60 * 15;

export type LoginScope = "platform" | "tenant-admin" | "tenant-client";

export async function recordLoginAttempt(
  identifier: string,
  scope: LoginScope,
  success: boolean,
  ip: string | null
): Promise<void> {
  await prisma.loginAttempt.create({
    data: { identifier, scope, success, ip: ip ?? null },
  });
}

export async function shouldLockAccount(
  identifier: string,
  scope: LoginScope
): Promise<boolean> {
  const since = new Date(Date.now() - WINDOW_MS);
  const recentFailures = await prisma.loginAttempt.count({
    where: { identifier, scope, success: false, createdAt: { gte: since } },
  });
  return recentFailures >= MAX_FAILURES;
}

export function computeLockoutUntil(): Date {
  return new Date(Date.now() + LOCKOUT_MS);
}

export function isLocked(lockedUntil: Date | null | undefined): boolean {
  if (!lockedUntil) return false;
  return lockedUntil.getTime() > Date.now();
}
