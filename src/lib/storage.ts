const memoryStore = new Map<string, string>();
const subscribers = new Map<string, Set<() => void>>();

export function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function safeJsonStringify(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
}

export function versionedKey(base: string, version = "v1"): string {
  return `${base}.${version}`;
}

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getItem(key: string): string | null {
  const storage = getStorage();
  if (!storage) {
    return memoryStore.get(key) ?? null;
  }
  try {
    return storage.getItem(key);
  } catch {
    return memoryStore.get(key) ?? null;
  }
}

export function setItem(key: string, value: string | null): void {
  const storage = getStorage();
  if (!storage) {
    if (value === null) {
      memoryStore.delete(key);
    } else {
      memoryStore.set(key, value);
    }
    notify(key);
    return;
  }
  try {
    if (value === null) {
      storage.removeItem(key);
    } else {
      storage.setItem(key, value);
    }
  } catch {
    if (value === null) {
      memoryStore.delete(key);
    } else {
      memoryStore.set(key, value);
    }
  }
  notify(key);
}

export function subscribe(key: string, listener: () => void): () => void {
  const storage = getStorage();
  const current = subscribers.get(key) ?? new Set<() => void>();
  current.add(listener);
  subscribers.set(key, current);

  if (storage && current.size === 1) {
    const handler = (event: StorageEvent) => {
      if (event.key === key) notify(key);
    };
    window.addEventListener("storage", handler);
    const cleanup = () => window.removeEventListener("storage", handler);
    return () => {
      current.delete(listener);
      if (current.size === 0) {
        subscribers.delete(key);
        cleanup();
      }
    };
  }

  return () => {
    current.delete(listener);
    if (current.size === 0) {
      subscribers.delete(key);
    }
  };
}

export function notify(key: string): void {
  subscribers.get(key)?.forEach((listener) => listener());
}

export function generateId(prefix: string): string {
  const base = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  return `${prefix}-${base}`;
}
