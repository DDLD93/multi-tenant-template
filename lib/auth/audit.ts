import { prisma } from "@/lib/db/client";
import type { ActorType } from "@/lib/generated/prisma/enums";

export type AuditInput = {
  actorType: ActorType;
  actorId: string | null;
  action: string;
  tenantId: string | null;
  targetType?: string | null;
  targetId?: string | null;
  before?: unknown;
  after?: unknown;
  ip?: string | null;
  userAgent?: string | null;
};

export async function audit(input: AuditInput): Promise<void> {
  await prisma.activityLog.create({
    data: {
      actorType: input.actorType,
      actorId: input.actorId ?? null,
      action: input.action,
      tenantId: input.tenantId,
      targetType: input.targetType ?? null,
      targetId: input.targetId ?? null,
      beforeJson: input.before === undefined ? null : (input.before as object),
      afterJson: input.after === undefined ? null : (input.after as object),
      ip: input.ip ?? null,
      userAgent: input.userAgent ?? null,
    },
  });
}

export function requestMeta(req: Request): { ip: string | null; userAgent: string | null } {
  const ua = req.headers.get("user-agent");
  const xf = req.headers.get("x-forwarded-for");
  const ip = xf ? xf.split(",")[0].trim() : null;
  return { ip, userAgent: ua };
}
