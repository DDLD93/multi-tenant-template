import { z } from "zod";
import { prisma } from "@/lib/db/client";
import {
  hashPassword,
  verifyPassword,
  validatePolicy,
  assertNotReused,
  recordPassword,
} from "@/lib/auth/password";
import {
  createSession,
  getSession,
  readSessionToken,
  revokeAllSessionsForUser,
} from "@/lib/auth/session";
import { audit, requestMeta } from "@/lib/auth/audit";
import { ok } from "@/lib/api/respond";
import { handleError, DomainError } from "@/lib/api/errors";
import { requireCsrf } from "@/lib/api/csrf-guard";

const Body = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const { currentPassword, newPassword } = Body.parse(await request.json());
    const meta = requestMeta(request);

    const platformToken = await readSessionToken("PLATFORM");
    const tenantToken = await readSessionToken("TENANT");
    const session =
      (await getSession(platformToken)) ?? (await getSession(tenantToken));
    if (!session) throw new DomainError(401, "unauthorized", "Authentication required.");

    const policy = validatePolicy(newPassword);
    if (!policy.ok) throw new DomainError(400, "weak_password", policy.reason);

    if (session.userType === "PLATFORM") {
      const user = await prisma.platformUser.findUnique({ where: { id: session.userId } });
      if (!user) throw new DomainError(401, "unauthorized", "User not found.");
      if (!(await verifyPassword(user.passwordHash, currentPassword))) {
        throw new DomainError(401, "invalid_credentials", "Current password incorrect.");
      }
      const reuse = await assertNotReused("PLATFORM", user.id, newPassword);
      if (!reuse.ok) throw new DomainError(400, "password_reused", "Cannot reuse a recent password.");

      const newHash = await hashPassword(newPassword);
      await prisma.platformUser.update({
        where: { id: user.id },
        data: { passwordHash: newHash, mustChangePassword: false },
      });
      await recordPassword("PLATFORM", user.id, newHash);
      await revokeAllSessionsForUser("PLATFORM", user.id);
      await createSession({
        userId: user.id,
        userType: "PLATFORM",
        tenantId: null,
        scope: "FULL",
        ip: meta.ip,
        userAgent: meta.userAgent,
      });
      await audit({
        actorType: "PLATFORM_USER",
        actorId: user.id,
        action: "auth.change_password",
        tenantId: null,
        targetType: "PlatformUser",
        targetId: user.id,
        ip: meta.ip,
        userAgent: meta.userAgent,
      });
      return ok({ redirect: "/dashboard" });
    }

    if (session.userType === "TENANT") {
      const user = await prisma.tenantUser.findUnique({ where: { id: session.userId } });
      if (!user) throw new DomainError(401, "unauthorized", "User not found.");
      if (!(await verifyPassword(user.passwordHash, currentPassword))) {
        throw new DomainError(401, "invalid_credentials", "Current password incorrect.");
      }
      const reuse = await assertNotReused("TENANT", user.id, newPassword);
      if (!reuse.ok) throw new DomainError(400, "password_reused", "Cannot reuse a recent password.");

      const newHash = await hashPassword(newPassword);
      await prisma.tenantUser.update({
        where: { id: user.id },
        data: { passwordHash: newHash, mustChangePassword: false },
      });
      await recordPassword("TENANT", user.id, newHash);
      await revokeAllSessionsForUser("TENANT", user.id);
      await createSession({
        userId: user.id,
        userType: "TENANT",
        tenantId: user.tenantId,
        scope: "FULL",
        ip: meta.ip,
        userAgent: meta.userAgent,
      });
      await audit({
        actorType: "TENANT_USER",
        actorId: user.id,
        action: "auth.change_password",
        tenantId: user.tenantId,
        targetType: "TenantUser",
        targetId: user.id,
        ip: meta.ip,
        userAgent: meta.userAgent,
      });
      return ok({ redirect: "/admin/dashboard" });
    }

    throw new DomainError(400, "not_supported", "Clients use OTP, not passwords.");
  } catch (e) {
    return handleError(e);
  }
}
