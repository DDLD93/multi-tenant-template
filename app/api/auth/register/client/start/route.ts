import { z } from "zod";
import { headers } from "next/headers";
import { prisma } from "@/lib/db/client";
import { resolveHost } from "@/lib/auth/context";
import { hashOpaqueToken, newOpaqueToken } from "@/lib/auth/tokens";
import { sendEmail } from "@/lib/email/send";
import { clientRegistrationEmail } from "@/lib/email/templates";
import { tenantHttpOrigin } from "@/lib/url/tenant";
import { ok } from "@/lib/api/respond";
import { handleError, DomainError } from "@/lib/api/errors";
import { requireCsrf } from "@/lib/api/csrf-guard";

const Body = z.object({ email: z.email() });

const REG_TTL_MS = 1000 * 60 * 60 * 24;

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const { email } = Body.parse(await request.json());
    const h = await headers();
    const ctx = resolveHost(h.get("host"));
    if (ctx.mode !== "tenant") {
      throw new DomainError(400, "no_tenant", "Registration is only available on a tenant workspace URL.");
    }
    const tenant = await prisma.tenant.findUnique({ where: { slug: ctx.slug } });
    if (!tenant || tenant.status !== "ACTIVE") {
      throw new DomainError(403, "tenant_blocked", "Workspace is not available.");
    }
    const normalized = email.toLowerCase();
    const existing = await prisma.client.findUnique({
      where: { tenantId_email: { tenantId: tenant.id, email: normalized } },
    });
    if (existing) {
      return ok({ sent: true });
    }

    const raw = newOpaqueToken();
    const tokenHash = hashOpaqueToken(raw);
    const expiresAt = new Date(Date.now() + REG_TTL_MS);

    await prisma.clientRegistrationToken.deleteMany({
      where: { tenantId: tenant.id, email: normalized, consumedAt: null },
    });
    await prisma.clientRegistrationToken.create({
      data: { tokenHash, tenantId: tenant.id, email: normalized, expiresAt },
    });

    const link = `${tenantHttpOrigin(tenant.slug)}/auth/register/complete?token=${encodeURIComponent(raw)}`;
    await sendEmail({
      to: normalized,
      subject: `Complete registration — ${tenant.name}`,
      html: clientRegistrationEmail({ tenantName: tenant.name, link }),
    });
    return ok({ sent: true });
  } catch (e) {
    return handleError(e);
  }
}
