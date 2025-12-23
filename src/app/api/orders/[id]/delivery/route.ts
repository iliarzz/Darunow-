import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureDeliveryForOrder, getDeliverySnapshot } from "@/lib/delivery/service";
import { getAdminSession, getSessionUser } from "@/lib/auth";
import { withApiContext } from "@/observability/api";
import { AppError } from "@/observability/errors";
import { setActorContext, setOrderContext } from "@/observability/requestContext";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const GET = withApiContext(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const admin = await getAdminSession(req);
  const opsKey = process.env.OPS_ADMIN_KEY;
  const providedKey = req.headers.get("x-ops-key") ?? req.nextUrl.searchParams.get("opsKey");

  const selectOrder = async () =>
    prisma.order.findUnique({
      where: { id: params.id },
      select: { id: true, pharmacyId: true, addressId: true, userId: true },
    });

  if (admin || (opsKey && providedKey === opsKey)) {
    const order = await selectOrder();
    if (!order) throw new AppError("order not found", { status: 404, code: "order_not_found" });
    if (admin) {
      setActorContext("admin", admin.session.userId);
    } else if (opsKey && providedKey === opsKey) {
      setActorContext("admin", "ops-key");
    }
    setOrderContext(order.id);
    await ensureDeliveryForOrder({
      orderId: order.id,
      pickupPharmacyId: order.pharmacyId,
      dropoffAddressId: order.addressId,
    });
    const delivery = await getDeliverySnapshot(order.id);
    return NextResponse.json({ delivery });
  }

  const user = await getSessionUser(req);
  if (!user) throw new AppError("unauthorized", { status: 401, publicMessage: "ابتدا وارد حساب شوید." });
  const order = await prisma.order.findFirst({
    where: { id: params.id, userId: user.id },
    select: { id: true, pharmacyId: true, addressId: true },
  });
  if (!order) {
    throw new AppError("order not found", { status: 404, publicMessage: "سفارش یافت نشد." });
  }
  setActorContext("user", user.id);
  setOrderContext(order.id);
  await ensureDeliveryForOrder({
    orderId: order.id,
    pickupPharmacyId: order.pharmacyId,
    dropoffAddressId: order.addressId,
  });
  const delivery = await getDeliverySnapshot(order.id);
  return NextResponse.json({ delivery });
});
