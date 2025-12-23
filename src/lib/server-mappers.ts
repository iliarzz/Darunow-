import type { Order as OrderModel, OrderItem, Ticket, TicketReply } from "@prisma/client";
import type { Order, Ticket as TicketDto } from "@/lib/types-v2";

function normalizeTimeline(timeline: unknown, fallbackStatus: OrderModel["status"], fallbackDate: Date): {
  status: Order["status"];
  at: number;
}[] {
  if (Array.isArray(timeline)) {
    const parsed = timeline
      .map((t) => {
        if (!t || typeof t !== "object") return null;
        const status = (t as any).status;
        const at = Number((t as any).at);
        if (!status || Number.isNaN(at)) return null;
        return { status, at };
      })
      .filter(Boolean) as { status: Order["status"]; at: number }[];
    if (parsed.length > 0) return parsed.sort((a, b) => a.at - b.at);
  }
  return [{ status: fallbackStatus as Order["status"], at: fallbackDate.getTime() }];
}

export function mapOrderToDto(order: OrderModel & { orderItems: OrderItem[] }): Order {
  const totalBefore = order.subtotal + order.deliveryFee;
  return {
    id: order.id,
    createdAt: order.createdAt.getTime(),
    pharmacyId: order.pharmacyId,
    status: order.status as Order["status"],
    items: order.orderItems.map((item) => ({
      name: item.name,
      qty: item.qty,
      price: item.price,
      productId: item.productId ?? undefined,
      pharmacyId: order.pharmacyId,
      subtitle: item.subtitle ?? undefined,
    })),
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    total: totalBefore,
    discount: order.discount,
    payable: order.payable,
    addressId: order.addressId ?? "",
    deliverySlotId: order.deliverySlotId ?? undefined,
    paymentType: order.paymentType as Order["paymentType"],
    substitution: order.substitutionPref as Order["substitution"],
    notes: order.notes ?? undefined,
    timeline: normalizeTimeline(order.timeline, order.status, order.updatedAt),
  };
}

export function mapTicketToDto(
  ticket: Ticket & { replies: TicketReply[] },
): TicketDto {
  return {
    id: ticket.id,
    createdAt: ticket.createdAt.getTime(),
    status: ticket.status as TicketDto["status"],
    subject: ticket.subject,
    message: ticket.message,
    orderId: ticket.orderId ?? undefined,
    replies: ticket.replies
      .map((r) => ({
        at: r.createdAt.getTime(),
        from: r.from,
        text: r.text,
      }))
      .sort((a, b) => a.at - b.at),
  };
}
