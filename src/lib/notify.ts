import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function createNotification(input: {
  userId: string;
  type: string;
  title: string;
  body: string;
  meta?: unknown;
}) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      metaJson: input.meta as Prisma.InputJsonValue,
    },
  });
}
