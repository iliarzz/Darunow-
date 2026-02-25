import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getPortalSessionFromRequest } from "@/lib/portal/route-auth";
import { listTickets } from "@/lib/portal/server-store";

function mapStatus(status: string) {
  if (status === "WAITING_CUSTOMER" || status === "PENDING_SUPPORT") return "WAITING";
  if (status === "RESOLVED") return "RESOLVED";
  return "OPEN";
}

export async function GET(req: NextRequest) {
  const auth = getPortalSessionFromRequest(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tickets = listTickets().map((ticket) => ({
    ...ticket,
    status: mapStatus(ticket.status),
  }));

  return NextResponse.json({ tickets });
}
