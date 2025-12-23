"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PharmacyCard } from "@/components/pharmacy/pharmacy-card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { SearchBar } from "@/components/ui/search-bar";
import { Chip } from "@/components/ui/chip";
import { api } from "@/lib/api";
import type { Pharmacy } from "@/lib/types";

type Props = { initialPharmacies: Pharmacy[] };

const filterChips: { key: string; label: string; predicate: (p: Pharmacy) => boolean }[] = [
  { key: "night", label: "شبانه‌روزی", predicate: (p) => p.tags.some((t) => t.includes("شبانه‌روزی")) },
  { key: "fast", label: "ارسال سریع", predicate: (p) => p.tags.some((t) => t.includes("سریع")) },
  { key: "near", label: "نزدیک‌ترین", predicate: (p) => p.tags.some((t) => t.includes("نزدیک")) },
  { key: "rating", label: "امتیاز بالا", predicate: (p) => p.rating >= 4.6 },
  { key: "insurance", label: "بیمه", predicate: (p) => p.tags.some((t) => t.includes("بیمه")) },
];

export function PharmaciesContent({ initialPharmacies }: Props) {
  const search = useSearchParams();
  const [list, setList] = useState<Pharmacy[]>(initialPharmacies);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<string[]>([]);

  useEffect(() => {
    const q = search?.get("q");
    if (q) setQuery(q);
    if (search?.get("focus") === "search") {
      setTimeout(() => {
        const input = document.querySelector<HTMLInputElement>("input[type='text']");
        input?.focus();
      }, 0);
    }
  }, [search]);

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchList = () => {
    setLoading(true);
    setError(null);
    api
      .listPharmacies()
      .then((data) => {
        const next = (data?.length ? data : initialPharmacies).slice(0, 10);
        setList(next);
        setLoading(false);
      })
      .catch(() => {
        setList(initialPharmacies);
        setError("بارگذاری فهرست ناموفق بود.");
        setLoading(false);
      });
  };

  const filtered = useMemo(() => {
    const term = query.trim();
    return list.filter((p) => {
      const matchesQuery =
        term === "" || p.name.includes(term) || p.tags.some((t) => t.includes(term)) || p.addressShort.includes(term);
      const passesFilters = filters.every((f) => filterChips.find((chip) => chip.key === f)?.predicate(p));
      return matchesQuery && passesFilters;
    });
  }, [filters, list, query]);

  const toggleFilter = (key: string) =>
    setFilters((prev) => (prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]));

  return (
    <Suspense fallback={<PharmacySkeleton />}>
      <div className="space-y-4 pb-16">
        <div className="space-y-1">
          <h1 className="text-[20px] font-bold text-primary-900">جستجوی داروخانه</h1>
          <p className="text-sm text-muted">با فیلترهای شبانه‌روزی، ارسال سریع و بیمه سریع‌تر پیدا کن.</p>
        </div>

        <Card className="space-y-3 border border-border bg-surface-1 p-4">
          <SearchBar value={query} onChange={setQuery} onClear={() => setQuery("")} placeholder="نام داروخانه یا دارو…" />
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {filterChips.map((chip) => (
              <Chip key={chip.key} selected={filters.includes(chip.key)} onClick={() => toggleFilter(chip.key)}>
                {chip.label}
              </Chip>
            ))}
            <Button variant="ghost" size="sm" icon={<RefreshCw className="h-4 w-4" />} onClick={() => setFilters([])}>
              حذف فیلتر
            </Button>
          </div>
        </Card>

        {error && <ErrorState description="مشکلی پیش اومد. دوباره تلاش کنیم؟" onRetry={fetchList} details={error} />}

        {filtered.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((ph, idx) => (
              <PharmacyCard key={ph.id} pharmacy={ph} index={idx} />
            ))}
          </div>
        ) : loading ? (
          <PharmacySkeleton />
        ) : (
          <EmptyState
            title="نتیجه‌ای پیدا نشد."
            description="فیلترها را پاک کن یا عبارت دیگری امتحان کن."
            action={{
              label: "ارسال نسخه",
              href: "/prescriptions/new",
            }}
          />
        )}

        {loading && filtered.length > 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-surface-2 p-3">
            <p className="text-xs text-muted">در حال به‌روزرسانی فهرست...</p>
          </div>
        )}
      </div>
    </Suspense>
  );
}

export function PharmacySkeleton() {
  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="space-y-3 border border-border p-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </Card>
      ))}
    </div>
  );
}
