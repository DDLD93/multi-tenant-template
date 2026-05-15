import { z } from "zod";
import { headers } from "next/headers";
import { prisma } from "@/lib/db/client";
import { resolveHost } from "@/lib/auth/context";
import { hashPassword, validatePolicy, recordPassword } from "@/lib/auth/password";
import { hashOpaqueToken } from "@/lib/auth/tokens";
import { createSession } from "@/lib/auth/session";
import { audit, requestMeta } from "@/lib/auth/audit";
import { clientProfileIncomplete } from "@/lib/auth/client-profile";
import { ok } from "@/lib/api/respond";
import { handleError, DomainError } from "@/lib/api/errors";
import { requireCsrf } from "@/lib/api/csrf-guard";

const Body = z.object({
  token: z.string().min(10),
  password: z.string().min(1),
  displayName: z.string().min(1).max(200),
});

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const { token, password, displayName } = Body.parse(await request.json());
    const meta = requestMeta(request);
    const h = await headers();
    const ctx = resolveHost(h.get("host"));
    if (ctx.mode !== "tenant") {
      throw new DomainError(400, "no_tenant", "Complete registration on your workspace URL.");
    }

    const policy = validatePolicy(password);
    if (!policy.ok) throw new DomainError(400, "weak_password", policy.reason);

    const tokenHash = hashOpaqueToken(token);
    const row = await prisma.clientRegistrationToken.findUnique({ where: { tokenHash } });
    if (!row || row.consumedAt || row.expiresAt.getTime() < Date.now()) {
      throw new DomainError(400, "invalid_token", "This link is invalid or has expired.");
    }

    const tenant = await prisma.tenant.findUnique({ where: { slug: ctx.slug } });
    if (!tenant || tenant.id !== row.tenantId) {
      throw new DomainError(400, "invalid_token", "Open this link on the same workspace you started from.");
    }
    if (tenant.status !== "ACTIVE") {
      throw new DomainError(403, "tenant_blocked", "Workspace is not active.");
    }

    const dup = await prisma.client.findUnique({
      where: { tenantId_email: { tenantId: row.tenantId, email: row.email } },
    });
    if (dup) {
      throw new DomainError(409, "already_registered", "An account with this email already exists. Sign in instead.");
    }

    const passwordHash = await hashPassword(password);
    const client = await prisma.$transaction(async (tx) => {
      const c = await tx.client.create({
        data: {
          tenantId: row.tenantId,
          email: row.email,
          passwordHash,
          mustChangePassword: false,
          profileJson: { name: displayName.trim() },
        },
      });
      await tx.clientRegistrationToken.update({
        where: { id: row.id },
        data: { consumedAt: new Date() },
      });
      return c;
    });

    await recordPassword("CLIENT", client.id, passwordHash);
    await createSession({
      userId: client.id,
      userType: "CLIENT",
      tenantId: tenant.id,
      scope: "FULL",
      ip: meta.ip,
      userAgent: meta.userAgent,
    });
    await audit({
      actorType: "CLIENT",
      actorId: client.id,
      action: "auth.client_signup",
      tenantId: tenant.id,
      targetType: "Client",
      targetId: client.id,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    const profileIncomplete = clientProfileIncomplete(client.profileJson);
    return ok({ redirect: profileIncomplete ? "/profile" : "/dashboard" });
  } catch (e) {
    return handleError(e);
  }
}
