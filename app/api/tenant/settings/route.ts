import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { requireTenantActor, PERMISSIONS } from "@/lib/auth/guards";
import { audit, requestMeta } from "@/lib/auth/audit";
import { ok } from "@/lib/api/respond";
import { handleError } from "@/lib/api/errors";
import { requireCsrf } from "@/lib/api/csrf-guard";

const PatchBody = z.object({
  name: z.string().min(1).max(200).optional(),
  settings: z.record(z.string(), z.unknown()).optional(),
});

export async function GET() {
  try {
    const actor = await requireTenantActor(PERMISSIONS.TENANT_SETTINGS_READ.key);
    const tenant = await prisma.tenant.findUnique({ where: { id: actor.tenantId } });
    return ok({ tenant });
  } catch (e) {
    return handleError(e);
  }
}

export async function PATCH(request: Request) {
  try {
    await requireCsrf(request);
    const actor = await requireTenantActor(PERMISSIONS.TENANT_SETTINGS_WRITE.key);
    const body = PatchBody.parse(await request.json());
    const meta = requestMeta(request);
    const before = await prisma.tenant.findUnique({ where: { id: actor.tenantId } });
    const updated = await prisma.tenant.update({
      where: { id: actor.tenantId },
      data: {
        ...(body.name ? { name: body.name } : {}),
        ...(body.settings ? { settingsJson: body.settings as object } : {}),
      },
    });
    await audit({
      actorType: "TENANT_USER",
      actorId: actor.userId,
      action: "tenant.update_settings",
      tenantId: actor.tenantId,
      targetType: "Tenant",
      targetId: actor.tenantId,
      before: { name: before?.name, settingsJson: before?.settingsJson } as object,
      after: { name: updated.name, settingsJson: updated.settingsJson } as object,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });
    return ok({ tenant: updated });
  } catch (e) {
    return handleError(e);
  }
}
