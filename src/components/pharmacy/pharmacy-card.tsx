"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Pharmacy } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MediaPlaceholder } from "@/components/ui/MediaPlaceholder";
import { SpeedLines } from "@/components/brand/SpeedLines";
import { ShieldCheck, Star } from "lucide-react";
import { useFavorites, toggleFavorite } from "@/stores/favorites";
import { track } from "@/lib/track";
import Link from "next/link";

export const PharmacyCard = memo(function PharmacyCard({
  pharmacy,
  index,
  ratingLeft = false,
  rtl = false,
}: {
  pharmacy: Pharmacy;
  index: number;
  ratingLeft?: boolean;
  rtl?: boolean;
}) {
  const favorites = useFavorites();
  const isFavorite = favorites.pharmacyIds.includes(pharmacy.id);
  const rating = pharmacy.rating.toLocaleString("fa-IR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const tagNodes: React.ReactNode[] = [];
  let verificationRendered = false;

  pharmacy.tags.slice(0, 2).forEach((tag) => {
    if (!verificationRendered && tag.includes("تحویل مطمئن")) {
      tagNodes.push(<VerificationPill key="verified" />);
      verificationRendered = true;
    } else {
      tagNodes.push(
        <span key={tag} className={cn("rounded-full bg-surface-3 px-3 py-1 text-[12px]")}>
          {tag}
        </span>,
      );
    }
  });

  if (!verificationRendered) {
    tagNodes.push(<VerificationPill key="verified" />);
  }
  if (pharmacy.tags.length > 3) {
    tagNodes.push(
      <span key="more" className="rounded-full bg-surface-3 px-3 py-1 text-[12px] text-muted">
        +{pharmacy.tags.length - 2}
      </span>,
    );
  }
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className="h-full">
      <Link href={`/pharmacies/${pharmacy.slug}`} className="block h-full">
        <Card interactive dir={rtl ? "rtl" : undefined} className={cn("h-full overflow-hidden", rtl && "text-right")}>
          <button
            className="absolute start-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full border border-divider bg-surface-2 text-primary-900 shadow-xs hover:bg-surface-3"
            onClick={async (e) => {
              e.preventDefault();
              await toggleFavorite(pharmacy.id);
              track("favorite_toggle", { pharmacyId: pharmacy.id, favorite: !isFavorite });
            }}
            aria-label="افزودن به علاقه‌مندی"
          >
            <Star className={cn("h-4 w-4", isFavorite ? "fill-current" : "")} />
          </button>
          <MediaPlaceholder aspect="wide" className="rounded-none border-0">
            <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-accent-200/80 via-surface-2 to-surface-1 text-primary-900">
              <span className="text-xl font-bold">{pharmacy.name.slice(0, 2)}</span>
              <SpeedLines className="absolute end-2 top-2 h-6 w-10 text-accent-200/80" />
            </div>
          </MediaPlaceholder>
          <CardContent className="space-y-3">
            <div
              className={cn(
                "flex items-center gap-2",
                ratingLeft ? "items-start justify-start" : "justify-between",
              )}
            >
              {ratingLeft && (
                <Badge variant="info" className="rounded-full px-2 py-1 text-[12px]">
                  {rating} ★
                </Badge>
              )}
              <div className="space-y-1">
                <p className="text-[15px] font-semibold text-primary-900">{pharmacy.name}</p>
                <p className="text-sm text-muted line-clamp-1">{pharmacy.addressShort}</p>
              </div>
              {!ratingLeft && (
                <Badge variant="info" className="rounded-full px-2 py-1 text-[12px]">
                  {rating} ★
                </Badge>
              )}
            </div>
            <div
              className={cn(
                "flex flex-wrap items-center gap-2",
                ratingLeft && "justify-start",
              )}
            >
              <Badge variant={pharmacy.isOpen ? "success" : "warning"}>
                {pharmacy.isOpen ? "باز" : "بسته"}
              </Badge>
              <Badge variant="neutral">
                {pharmacy.deliveryEtaMin.toLocaleString("fa-IR")} تا {pharmacy.deliveryEtaMax.toLocaleString("fa-IR")} دقیقه
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2 text-[12px] text-muted">
              {tagNodes}
            </div>
            <Button variant="secondary" size="sm" className="w-full">
              مشاهده
            </Button>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
});

export function VerificationPill() {
  return (
    <span
      className="grid h-9 w-9 place-items-center rounded-full border border-divider bg-surface-2 text-primary-900"
      title="تایید شده توسط دارونَو"
      aria-label="تایید شده توسط دارونَو"
    >
      <ShieldCheck className="h-4 w-4" />
    </span>
  );
}
