"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pill, FileText, HeartPulse, Stethoscope } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { SearchBar } from "@/components/ui/search-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { MediaPlaceholder } from "@/components/ui/MediaPlaceholder";
import { EmptyState } from "@/components/ui/EmptyState";
import { SpeedLines } from "@/components/brand/SpeedLines";
import { PharmacyCard } from "@/components/pharmacy/pharmacy-card";
import { api } from "@/lib/api";
import type { Pharmacy } from "@/lib/types";
import { useFavorites } from "@/stores/favorites";
import { seedPharmacies } from "@/lib/mock/seed";
import { useHydrated } from "@/lib/useHydrated";

const quickActions = [
  { label: "سفارش دارو", icon: Pill, href: "/pharmacies" },
  { label: "ارسال نسخه", icon: FileText, href: "/prescriptions/new" },
  { label: "مشاوره پزشک", icon: Stethoscope, href: "/profile", soon: true },
  { label: "آزمایش در منزل", icon: HeartPulse, href: "/profile", soon: true },
];

const categories = ["شبانه‌روزی", "ارسال سریع", "نزدیک‌ترین", "امتیاز بالا", "بیمه"];

export default function Home() {
  const router = useRouter();
  const favorites = useFavorites();
  const [query, setQuery] = useState("");
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [allPharmacies, setAllPharmacies] = useState<Pharmacy[]>(seedPharmacies);
  const [loading, setLoading] = useState(true);
  const hydrated = useHydrated();

  useEffect(() => {
    api.listPharmacies().then((data) => {
      setPharmacies(data.slice(0, 3));
      setAllPharmacies(data);
      setLoading(false);
    });
  }, []);

  const handleSearch = () => {
    router.push(`/pharmacies?focus=search&q=${encodeURIComponent(query)}`);
  };

  const favoriteCards = useMemo(
    () =>
      allPharmacies.filter((ph) => favorites.pharmacyIds.includes(ph.id)).slice(0, 5),
    [allPharmacies, favorites.pharmacyIds],
  );

  return (
    <div className="space-y-6 pb-16">
      <Card className="relative overflow-hidden border border-border bg-surface-1 p-5">
        <div className="absolute left-4 top-4">
          <SpeedLines className="h-6 w-14 text-accent-200/70" />
        </div>
        <div className="space-y-4">
          <h1 className="text-[22px] font-bold text-primary-900">سلام، امروز چی لازم داری؟</h1>
          <SearchBar value={query} onChange={setQuery} onClear={() => setQuery("")} placeholder="دارو، داروخانه یا خدمت..." />
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={handleSearch}>
              شروع جستجو
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/orders">پیگیری سفارش</Link>
            </Button>
          </div>
        </div>
      </Card>

      <Card className="space-y-3 border border-border bg-surface-1 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-semibold">میانبرها</h2>
          <SpeedLines className="h-4 w-10 text-accent-200/80" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickActions.map((action) => (
            <Link key={action.label} href={action.href} className="group flex flex-col gap-2 rounded-[14px] border border-border bg-surface-2 p-3 transition hover:border-primary-700/50">
              <div className="flex items-center justify-between gap-2">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-accent-200/60 text-primary-800">
                  <action.icon className="h-4 w-4" />
                </div>
                {action.soon && <span className="text-[11px] text-muted">به‌زودی</span>}
              </div>
              <p className="text-sm font-semibold text-primary-900">{action.label}</p>
            </Link>
          ))}
        </div>
      </Card>

      <MediaPlaceholder aspect="banner" className="border border-border" />

      {hydrated && favoriteCards.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-semibold text-primary-900">محبوب‌های شما</h2>
            <span className="text-xs text-muted">بازدید سریع</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {favoriteCards.map((ph, idx) => (
              <PharmacyCard key={ph.id} pharmacy={ph} index={idx} />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-primary-900">دسته‌بندی‌ها</h2>
          <span className="text-xs text-muted">انتخاب سریع</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <Chip key={cat} onClick={() => setQuery(cat)}>
              {cat}
            </Chip>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-primary-900">داروخانه‌های نزدیک</h2>
          <Button asChild variant="ghost" size="sm" iconAfter={<ArrowLeft className="h-4 w-4" />}>
            <Link href="/pharmacies">مشاهده همه</Link>
          </Button>
        </div>
        {loading ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Card key={idx} className="space-y-3 border border-border p-3">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-36" />
              </Card>
            ))}
          </div>
        ) : pharmacies.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {pharmacies.map((ph, idx) => (
              <PharmacyCard key={ph.id} pharmacy={ph} index={idx} />
            ))}
          </div>
        ) : (
          <EmptyState title="هنوز داروخانه‌ای این نزدیکی نیست." description="به زودی فهرست کامل نمایش داده می‌شود." />
        )}
      </div>
    </div>
  );
}
