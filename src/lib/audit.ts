import { AuditActor, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function logAudit(input: {
  actorType: AuditActor;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actorType: input.actorType,
        actorId: input.actorId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        beforeJson: input.before as Prisma.InputJsonValue,
        afterJson: input.after as Prisma.InputJsonValue,
      },
    });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn("audit log failed", err);
    }
  }
}
