import { useSyncExternalStore } from "react";
import { z } from "zod";
import {
  generateId,
  getItem,
  safeJsonParse,
  safeJsonStringify,
  setItem,
  subscribe,
  versionedKey,
} from "@/lib/storage";
import type { Ticket } from "@/lib/types-v2";

const STORAGE_KEY = versionedKey("darunow.tickets", "v1");
let cachedTickets: Ticket[] = [];
let lastRaw: string | null = null;
let initialized = false;

const replySchema = z.object({
  at: z.number(),
  from: z.enum(["user", "support"]),
  text: z.string(),
});

const ticketSchema: z.ZodType<Ticket> = z.object({
  id: z.string(),
  createdAt: z.number(),
  status: z.enum(["open", "answered", "closed"]),
  subject: z.string(),
  message: z.string(),
  orderId: z.string().optional(),
  replies: z.array(replySchema),
});

const ticketListSchema = z.array(ticketSchema);

function readTickets(): Ticket[] {
  const raw = getItem(STORAGE_KEY);
  if (raw === lastRaw && initialized) return cachedTickets;
  lastRaw = raw;
  const parsed = ticketListSchema.safeParse(safeJsonParse<Ticket[]>(raw, []));
  cachedTickets = parsed.success ? sortTickets(parsed.data) : [];
  initialized = true;
  return cachedTickets;
}

function writeTickets(list: Ticket[]): void {
  cachedTickets = sortTickets(list);
  initialized = true;
  lastRaw = safeJsonStringify(cachedTickets);
  setItem(STORAGE_KEY, lastRaw);
}

function sortTickets(list: Ticket[]): Ticket[] {
  return [...list].sort((a, b) => b.createdAt - a.createdAt);
}

export function listTickets(): Ticket[] {
  return readTickets();
}

export function getTicket(id: string): Ticket | undefined {
  return readTickets().find((t) => t.id === id);
}

export function createTicket(
  input: Omit<Ticket, "id" | "createdAt" | "replies" | "status"> & Partial<Pick<Ticket, "status" | "replies">>,
): Ticket {
  const record: Ticket = {
    ...input,
    id: generateId("tkt"),
    createdAt: Date.now(),
    status: input.status ?? "open",
    replies: input.replies ?? [],
  };
  const existing = readTickets();
  writeTickets([record, ...existing]);
  return record;
}

export function addTicketReply(id: string, from: "user" | "support", text: string): Ticket | undefined {
  const existing = readTickets();
  let updated: Ticket | undefined;
  const next = existing.map((ticket) => {
    if (ticket.id !== id) return ticket;
    updated = {
      ...ticket,
      status: from === "support" ? "answered" : ticket.status,
      replies: [...ticket.replies, { at: Date.now(), from, text }],
    };
    return updated;
  });
  if (!updated) return undefined;
  writeTickets(next);
  return updated;
}

export function updateTicketStatus(id: string, status: Ticket["status"]): Ticket | undefined {
  const existing = readTickets();
  let updated: Ticket | undefined;
  const next = existing.map((ticket) => {
    if (ticket.id !== id) return ticket;
    updated = { ...ticket, status };
    return updated;
  });
  if (!updated) return undefined;
  writeTickets(next);
  return updated;
}

export function useTickets(): Ticket[] {
  return useSyncExternalStore(
    (listener) => subscribe(STORAGE_KEY, listener),
    () => listTickets(),
    () => [],
  );
}

export function useTicket(id?: string): Ticket | undefined {
  const tickets = useTickets();
  if (!id) return undefined;
  return tickets.find((t) => t.id === id);
}
