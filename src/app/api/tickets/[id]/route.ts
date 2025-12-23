import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession, getSessionUser } from "@/lib/auth";
import { mapTicketToDto } from "@/lib/server-mappers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminSession(req);
  const opsKey = process.env.OPS_ADMIN_KEY;
  const provided = req.headers.get("x-ops-key") ?? req.nextUrl.searchParams.get("opsKey");
  if (admin || (opsKey && provided === opsKey)) {
    const ticket = await prisma.ticket.findUnique({ where: { id: params.id }, include: { replies: true } });
    if (!ticket) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(mapTicketToDto(ticket));
  }
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const ticket = await prisma.ticket.findFirst({
    where: { id: params.id, userId: user.id },
    include: { replies: true },
  });
  if (!ticket) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(mapTicketToDto(ticket));
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { text } = await req.json().catch(() => ({}));
  if (!text) return NextResponse.json({ error: "text required" }, { status: 400 });
  const ticket = await prisma.ticket.findFirst({ where: { id: params.id, userId: user.id } });
  if (!ticket) return NextResponse.json({ error: "not found" }, { status: 404 });
  await prisma.ticketReply.create({
    data: {
      ticketId: ticket.id,
      from: "user",
      text,
    },
  });
  await prisma.ticket.update({
    where: { id: ticket.id },
    data: { status: "open" },
  });
  const updated = await prisma.ticket.findUnique({
    where: { id: ticket.id },
    include: { replies: true },
  });
  return NextResponse.json(mapTicketToDto(updated!));
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminSession(req);
  const opsKey = process.env.OPS_ADMIN_KEY;
  const provided = req.headers.get("x-ops-key") ?? req.nextUrl.searchParams.get("opsKey");
  if (!admin && opsKey && provided !== opsKey) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { status } = await req.json().catch(() => ({}));
  if (!status) return NextResponse.json({ error: "status required" }, { status: 400 });
  const ticket = await prisma.ticket.update({
    where: { id: params.id },
    data: { status },
    include: { replies: true },
  });
  return NextResponse.json(mapTicketToDto(ticket));
}
