import { z } from "zod";
import { headers } from "next/headers";
import { prisma } from "@/lib/db/client";
import { issueOtp } from "@/lib/auth/otp";
import { resolveHost } from "@/lib/auth/context";
import { ok } from "@/lib/api/respond";
import { handleError, DomainError } from "@/lib/api/errors";
import { requireCsrf } from "@/lib/api/csrf-guard";

const Body = z.object({ email: z.email() });

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const { email } = Body.parse(await request.json());
    const h = await headers();
    const ctx = resolveHost(h.get("host"));
    if (ctx.mode !== "tenant") {
      throw new DomainError(400, "no_tenant", "OTP is only available in tenant context.");
    }
    const tenant = await prisma.tenant.findUnique({ where: { slug: ctx.slug } });
    if (!tenant) throw new DomainError(404, "not_found", "Unknown tenant.");
    if (tenant.status !== "ACTIVE") throw new DomainError(403, "tenant_blocked", "Tenant is not active.");

    const existing = await prisma.client.findUnique({
      where: { tenantId_email: { tenantId: tenant.id, email: email.toLowerCase() } },
    });
    const purpose = existing ? "CLIENT_LOGIN" : "CLIENT_SIGNUP";
    const result = await issueOtp({
      identifier: email.toLowerCase(),
      purpose,
      tenantId: tenant.id,
      tenantName: tenant.name,
    });
    if (!result.sent) {
      throw new DomainError(429, "rate_limited", "Too many OTP requests. Try again later.");
    }
    return ok({ sent: true });
  } catch (e) {
    return handleError(e);
  }
}
