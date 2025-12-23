import { useEffect, useState } from "react";
import { useHydrated } from "@/lib/useHydrated";

export function useNotificationsCount() {
  const hydrated = useHydrated();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/notifications?summary=1");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          const unread = Number(data.unread ?? 0);
          const total = Number(data.total ?? 0);
          setCount(Number.isNaN(unread) ? total : unread);
        }
      } catch {
        // ignore
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [hydrated]);

  return count;
}
