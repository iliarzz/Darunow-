"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Pharmacy } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MediaPlaceholder } from "@/components/ui/MediaPlaceholder";
import { SpeedLines } from "@/components/brand/SpeedLines";
import { Star } from "lucide-react";
import { useFavorites, toggleFavorite } from "@/stores/favorites";
import { track } from "@/lib/track";

export function PharmacyCard({ pharmacy, index }: { pharmacy: Pharmacy; index: number }) {
  const favorites = useFavorites();
  const isFavorite = favorites.pharmacyIds.includes(pharmacy.id);
  const rating = pharmacy.rating.toLocaleString("fa-IR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="h-full"
    >
      <Card interactive className="h-full overflow-hidden">
        <button
          className="absolute left-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-surface-1/90 text-primary-800 shadow-xs hover:bg-surface-3"
          onClick={() => {
            toggleFavorite(pharmacy.id);
            track("favorite_toggle", { pharmacyId: pharmacy.id, favorite: !isFavorite });
          }}
          aria-label="افزودن به علاقه‌مندی"
        >
          <Star className={cn("h-4 w-4", isFavorite ? "fill-primary-800" : "")} />
        </button>
        <MediaPlaceholder aspect="wide" className="rounded-none border-0">
          <div className="absolute inset-0">
            <SpeedLines className="absolute right-2 top-2 h-6 w-10 text-accent-200/80" />
          </div>
        </MediaPlaceholder>
        <CardContent className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[15px] font-semibold text-primary-900">{pharmacy.name}</p>
              <p className="text-sm text-muted line-clamp-1">{pharmacy.addressShort}</p>
            </div>
            <Badge variant="info" className="px-2 py-1 text-[12px]">
              {rating} ★
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={pharmacy.isOpen ? "success" : "warning"}>
              {pharmacy.isOpen ? "باز" : "بسته"}
            </Badge>
            <Badge variant="neutral">
              {pharmacy.deliveryEtaMin.toLocaleString("fa-IR")} تا {pharmacy.deliveryEtaMax.toLocaleString("fa-IR")} دقیقه
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2 text-[12px] text-muted">
            {pharmacy.tags.slice(0, 3).map((tag) => (
              <span key={tag} className={cn("rounded-full bg-surface-3 px-3 py-1")}>
                {tag}
              </span>
            ))}
          </div>
          <Button asChild variant="secondary" size="sm" className="w-full">
            <Link href={`/pharmacies/${pharmacy.slug}`}>مشاهده</Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
