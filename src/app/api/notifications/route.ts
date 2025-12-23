import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const summary = req.nextUrl.searchParams.get("summary") === "1";
  const markRead = req.nextUrl.searchParams.get("markRead") === "1";

  if (summary) {
    const [total, unread] = await Promise.all([
      prisma.notification.count({ where: { userId: user.id } }),
      prisma.notification.count({ where: { userId: user.id, readAt: null } }),
    ]);
    return NextResponse.json({ total, unread });
  }

  if (markRead) {
    await prisma.notification.updateMany({
      where: { userId: user.id, readAt: null },
      data: { readAt: new Date() },
    });
  }

  const notifications = await prisma.notification
    .findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    })
    .then((rows) =>
      rows.map((n) => ({
        ...n,
        createdAt: n.createdAt.getTime(),
        readAt: n.readAt?.getTime() ?? null,
      })),
    );
  return NextResponse.json(notifications);
}
