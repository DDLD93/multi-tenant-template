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
    throw new DomainError(
      410,
      "otp_removed",
      "Email code sign-in is no longer available. Use email and password, or register for a new account."
    );
  } catch (e) {
    return handleError(e);
  }
}
