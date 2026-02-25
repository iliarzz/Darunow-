import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getPortalSessionFromRequest } from "@/lib/portal/route-auth";
import { listSettlements } from "@/lib/portal/server-store";

export async function GET(req: NextRequest) {
  const auth = getPortalSessionFromRequest(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settlements = listSettlements();
  const download = req.nextUrl.searchParams.get("download") === "1";

  if (!download) {
    return NextResponse.json({ settlements });
  }

  const header = ["id", "period", "gross", "net", "fees", "refunds", "disputes", "status"];
  const rows = settlements.map((item) =>
    [
      item.id,
      item.period,
      item.gross,
      item.net,
      item.fees,
      item.refunds ?? 0,
      item.disputes ?? 0,
      item.status ?? "pending",
    ].join(","),
  );
  const csv = [header.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="settlements.csv"',
    },
  });
}
