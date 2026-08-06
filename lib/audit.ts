import { prisma } from "@/lib/db";
import type { ManagementAction } from "@/lib/permissions";

export async function writeAudit(
  actorId: string,
  action: ManagementAction,
  targetId?: string,
): Promise<void> {
  await prisma.auditLog.create({
    data: { actorId, action, targetId },
  });
}
