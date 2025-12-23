import { safeScope } from "@/lib/consent";

export type ConversationActor =
  | { type: "user"; id: string }
  | { type: "provider"; id: string; orgId?: string; consentScope?: unknown };

export function providerMessagingAllowed(scope: unknown): boolean {
  const normalized = safeScope(scope);
  // Accept either explicit messaging scope or broader provider phr/rx scopes.
  const providerScope = normalized.provider as Record<string, unknown> | undefined;
  if (!providerScope) return false;
  if (providerScope.messaging === true) return true;
  if (Array.isArray(providerScope.phr) && providerScope.phr.includes("messages")) return true;
  if (providerScope.rx === true) return true;
  return false;
}

export function canAccessConversation(actor: ConversationActor, conversation: { userId: string }): boolean {
  if (actor.type === "user") return actor.id === conversation.userId;
  return providerMessagingAllowed(actor.consentScope);
}
