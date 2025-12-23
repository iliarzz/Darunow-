type ProviderScope = {
  rx?: boolean;
  phr?: string[];
};

type PharmacyScope = {
  rx?: boolean;
};

export type ConsentScope = {
  provider?: ProviderScope;
  pharmacy?: PharmacyScope;
  [key: string]: unknown;
};

function normalizeScope(raw: unknown): ConsentScope {
  if (!raw || typeof raw !== "object") return {};
  const scope = raw as ConsentScope;
  return {
    provider: scope.provider,
    pharmacy: scope.pharmacy,
  };
}

export function hasRxAccess(rawScope: unknown, actor: "provider" | "pharmacy"): boolean {
  const scope = normalizeScope(rawScope);
  if (actor === "provider") return Boolean(scope.provider?.rx);
  if (actor === "pharmacy") return Boolean(scope.pharmacy?.rx);
  return false;
}

export function hasPhrAccess(rawScope: unknown, sections: string[] = []): boolean {
  const scope = normalizeScope(rawScope);
  if (!scope.provider?.phr || !Array.isArray(scope.provider.phr)) return false;
  if (sections.length === 0) return true;
  return sections.every((section) => scope.provider?.phr?.includes(section));
}

export function safeScope(raw: unknown): ConsentScope {
  return normalizeScope(raw);
}
