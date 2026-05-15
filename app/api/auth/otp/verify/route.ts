import { z } from "zod";
import { headers } from "next/headers";
import { prisma } from "@/lib/db/client";
import { verifyOtp } from "@/lib/auth/otp";
import { createSession } from "@/lib/auth/session";
import { resolveHost } from "@/lib/auth/context";
import { audit, requestMeta } from "@/lib/auth/audit";
import { ok } from "@/lib/api/respond";
import { handleError, DomainError } from "@/lib/api/errors";
import { requireCsrf } from "@/lib/api/csrf-guard";

const Body = z.object({
  email: z.email(),
  code: z.string().regex(/^\d{6}$/),
});

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const { email, code } = Body.parse(await request.json());
    const meta = requestMeta(request);
    const h = await headers();
    const ctx = resolveHost(h.get("host"));
    if (ctx.mode !== "tenant") {
      throw new DomainError(400, "no_tenant", "OTP is only available in tenant context.");
    }
    const tenant = await prisma.tenant.findUnique({ where: { slug: ctx.slug } });
    if (!tenant || tenant.status !== "ACTIVE") {
      throw new DomainError(403, "tenant_blocked", "Tenant is not active.");
    }
    const normalized = email.toLowerCase();
    const existing = await prisma.client.findUnique({
      where: { tenantId_email: { tenantId: tenant.id, email: normalized } },
    });
    const purpose = existing ? "CLIENT_LOGIN" : "CLIENT_SIGNUP";
    const result = await verifyOtp({ identifier: normalized, code, purpose });
    if (!result.ok) {
      throw new DomainError(401, `otp_${result.reason}`, "Code is invalid or expired.");
    }
    const client = existing
      ? await prisma.client.update({
          where: { id: existing.id },
          data: { lastLoginAt: new Date() },
        })
      : await prisma.client.create({
          data: { tenantId: tenant.id, email: normalized, lastLoginAt: new Date() },
        });

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
      action: existing ? "auth.client_login" : "auth.client_signup",
      tenantId: tenant.id,
      targetType: "Client",
      targetId: client.id,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    const profile = (client.profileJson as Record<string, unknown> | null) ?? {};
    const profileIncomplete = !profile.name;
    return ok({ redirect: profileIncomplete ? "/profile" : "/dashboard" });
  } catch (e) {
    return handleError(e);
  }
}
