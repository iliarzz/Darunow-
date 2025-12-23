import { DeliveryEventType, DeliveryStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { realtime, realtimeChannels, realtimeEvents } from "@/lib/realtime";
import { AppError } from "@/observability/errors";
import { logEvent } from "@/observability/logger";
import { assertDeliveryStatusTransition, isDeliveryTerminal, orderStatusForDelivery } from "./status";

// Keep only recent courier pings; override minutes via DELIVERY_LOCATION_RETENTION_MINUTES.
const LOCATION_RETENTION_MINUTES_RAW = Number(process.env.DELIVERY_LOCATION_RETENTION_MINUTES ?? 180);
const LOCATION_RETENTION_MINUTES =
  Number.isFinite(LOCATION_RETENTION_MINUTES_RAW) && LOCATION_RETENTION_MINUTES_RAW > 0
    ? LOCATION_RETENTION_MINUTES_RAW
    : 180;

type Actor =
  | { actorType: "admin" | "user" | "pharmacy"; actorId: string }
  | { actorType: "system"; actorId?: string };

export type DeliverySnapshot = {
  id: string;
  orderId: string;
  courierId: string | null;
  status: DeliveryStatus;
  pickupPharmacyId: string;
  dropoffAddressId: string;
  etaMin?: number | null;
  etaMax?: number | null;
  distanceKm?: number | null;
  events: { type: DeliveryEventType; at: number; meta?: any }[];
  lastPing?: {
    courierId: string;
    lat: number;
    lng: number;
    speed?: number | null;
    heading?: number | null;
    accuracy?: number | null;
    at: number;
  };
};

function eventTypeForStatus(status: DeliveryStatus): DeliveryEventType {
  switch (status) {
    case "accepted":
      return "accepted";
    case "picked_up":
      return "picked_up";
    case "arrived":
      return "arrived";
    case "delivered":
      return "delivered";
    case "failed":
      return "failed";
    case "unassigned":
    case "offered":
    case "enroute":
    case "cancelled":
    default:
      return "note";
  }
}

export async function ensureDeliveryForOrder(input: {
  orderId: string;
  pickupPharmacyId: string;
  dropoffAddressId?: string | null;
  etaMin?: number | null;
  etaMax?: number | null;
  distanceKm?: number | null;
}) {
  if (!input.dropoffAddressId) return null;
  const existing = await prisma.delivery.findUnique({ where: { orderId: input.orderId } });
  if (existing) return existing;
  return prisma.delivery.create({
    data: {
      orderId: input.orderId,
      pickupPharmacyId: input.pickupPharmacyId,
      dropoffAddressId: input.dropoffAddressId,
      etaMin: input.etaMin ?? null,
      etaMax: input.etaMax ?? null,
      distanceKm: input.distanceKm ?? null,
    },
  });
}

async function persistTimelineEvent(deliveryId: string, type: DeliveryEventType, meta?: Record<string, unknown>) {
  await prisma.deliveryEvent.create({
    data: {
      deliveryId,
      type,
      metaJson: meta as Prisma.InputJsonValue,
    },
  });
}

export async function transitionDeliveryStatus(input: {
  deliveryId: string;
  nextStatus: DeliveryStatus;
  actor?: Actor;
  courierId?: string | null;
  meta?: Record<string, unknown>;
}) {
  const delivery = await prisma.delivery.findUnique({
    where: { id: input.deliveryId },
    include: { order: true },
  });
  if (!delivery) {
    throw new AppError("delivery not found", { status: 404, code: "delivery_not_found" });
  }
  assertDeliveryStatusTransition(delivery.status, input.nextStatus);

  const updated = await prisma.delivery.update({
    where: { id: delivery.id },
    data: {
      status: input.nextStatus,
      courierId: input.courierId ?? delivery.courierId,
    },
  });

  const eventType = eventTypeForStatus(input.nextStatus);
  await persistTimelineEvent(updated.id, eventType, { ...input.meta, status: input.nextStatus });

  const mappedOrderStatus = orderStatusForDelivery(input.nextStatus);
  if (mappedOrderStatus && delivery.order) {
    const now = Date.now();
    const timeline = Array.isArray(delivery.order.timeline) ? (delivery.order.timeline as any[]) : [];
    const nextTimeline = [...timeline.filter((t) => t?.status !== mappedOrderStatus), { status: mappedOrderStatus, at: now }].sort(
      (a, b) => (a?.at ?? 0) - (b?.at ?? 0),
    );
    await prisma.order.update({
      where: { id: delivery.order.id },
      data: { status: mappedOrderStatus, timeline: nextTimeline },
    });
  }

  if (input.actor && input.actor.actorType !== "system") {
    await logAudit({
      actorType: input.actor.actorType,
      actorId: input.actor.actorId,
      action: "delivery_status_change",
      entityType: "delivery",
      entityId: delivery.id,
      before: { status: delivery.status },
      after: { status: input.nextStatus },
    });
  }

  realtime().publish(
    realtimeChannels.order(delivery.orderId),
    realtimeEvents.deliveryStatusChanged,
    {
      deliveryId: delivery.id,
      orderId: delivery.orderId,
      status: input.nextStatus,
    },
  );
  if (updated.courierId) {
    realtime().publish(
      realtimeChannels.courier(updated.courierId),
      realtimeEvents.deliveryStatusChanged,
      { deliveryId: delivery.id, status: input.nextStatus },
    );
  }

  logEvent("delivery.status_changed", {
    deliveryId: delivery.id,
    orderId: delivery.orderId,
    from: delivery.status,
    to: input.nextStatus,
  });

  return updated;
}

export async function recordLocationPing(input: {
  deliveryId: string;
  courierId: string;
  lat: number;
  lng: number;
  speed?: number | null;
  heading?: number | null;
  accuracy?: number | null;
}) {
  const delivery = await prisma.delivery.findUnique({ where: { id: input.deliveryId } });
  if (!delivery) {
    throw new AppError("delivery not found", { status: 404, code: "delivery_not_found" });
  }
  if (isDeliveryTerminal(delivery.status)) {
    throw new AppError("delivery inactive", { status: 400, code: "delivery_inactive" });
  }
  if (!(await prisma.courier.findUnique({ where: { id: input.courierId } }))) {
    throw new AppError("courier not found", { status: 404, code: "courier_not_found" });
  }
  if (delivery.courierId && delivery.courierId !== input.courierId) {
    throw new AppError("courier mismatch", { status: 403, code: "courier_mismatch" });
  }

  const ping = await prisma.locationPing.create({
    data: {
      deliveryId: delivery.id,
      courierId: input.courierId,
      lat: input.lat,
      lng: input.lng,
      speed: input.speed ?? null,
      heading: input.heading ?? null,
      accuracy: input.accuracy ?? null,
    },
  });

  const cutoff = new Date(Date.now() - LOCATION_RETENTION_MINUTES * 60 * 1000);
  await prisma.locationPing.deleteMany({
    where: { deliveryId: delivery.id, createdAt: { lt: cutoff } },
  });

  await prisma.courier.update({
    where: { id: input.courierId },
    data: { lastSeenAt: new Date(), status: "busy" },
  });

  realtime().publish(
    realtimeChannels.order(delivery.orderId),
    realtimeEvents.courierLocationUpdated,
    {
      deliveryId: delivery.id,
      courierId: input.courierId,
      lat: ping.lat,
      lng: ping.lng,
      speed: ping.speed,
      heading: ping.heading,
      accuracy: ping.accuracy,
      at: ping.createdAt.getTime(),
    },
  );

  logEvent("delivery.location_ping", {
    deliveryId: delivery.id,
    courierId: input.courierId,
    at: ping.createdAt.toISOString(),
  });

  return ping;
}

export async function getDeliverySnapshot(orderId: string): Promise<DeliverySnapshot | null> {
  const delivery = await prisma.delivery.findUnique({
    where: { orderId },
    include: {
      events: { orderBy: { createdAt: "asc" } },
      pings: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  if (!delivery) return null;

  const lastPing = delivery.pings[0];

  return {
    id: delivery.id,
    orderId: delivery.orderId,
    courierId: delivery.courierId,
    status: delivery.status,
    pickupPharmacyId: delivery.pickupPharmacyId,
    dropoffAddressId: delivery.dropoffAddressId,
    etaMin: delivery.etaMin,
    etaMax: delivery.etaMax,
    distanceKm: delivery.distanceKm,
    events: delivery.events
      .filter((event) => event.type !== "location")
      .map((event) => ({
        type: event.type,
        at: event.createdAt.getTime(),
        meta: event.metaJson ?? undefined,
      })),
    lastPing: lastPing
      ? {
          courierId: lastPing.courierId,
          lat: lastPing.lat,
          lng: lastPing.lng,
          speed: lastPing.speed,
          heading: lastPing.heading,
          accuracy: lastPing.accuracy,
          at: lastPing.createdAt.getTime(),
        }
      : undefined,
  };
}
