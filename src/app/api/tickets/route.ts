import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession, getSessionUser } from "@/lib/auth";
import { mapTicketToDto } from "@/lib/server-mappers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const admin = await getAdminSession(req);
  const opsKey = process.env.OPS_ADMIN_KEY;
  const provided = req.headers.get("x-ops-key") ?? req.nextUrl.searchParams.get("opsKey");
  if (admin || (opsKey && provided === opsKey)) {
    const tickets = await prisma.ticket.findMany({
      orderBy: { createdAt: "desc" },
      include: { replies: true },
    });
    return NextResponse.json(tickets.map(mapTicketToDto));
  }
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const tickets = await prisma.ticket.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { replies: true },
  });
  return NextResponse.json(tickets.map(mapTicketToDto));
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { subject, message, orderId } = await req.json().catch(() => ({}));
  if (!subject || !message) {
    return NextResponse.json({ error: "subject and message required" }, { status: 400 });
  }
  const created = await prisma.ticket.create({
    data: {
      userId: user.id,
      subject,
      message,
      orderId: orderId ?? null,
      replies: {
        create: [
          {
            from: "user",
            text: message,
          },
        ],
      },
    },
    include: { replies: true },
  });
  return NextResponse.json(mapTicketToDto(created), { status: 201 });
}
