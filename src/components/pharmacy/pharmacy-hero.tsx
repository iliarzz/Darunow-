"use client";

import { motion } from "framer-motion";
import { Clock, MapPin, ShieldCheck, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Pharmacy } from "@/lib/types";

export function PharmacyHero({ pharmacy }: { pharmacy: Pharmacy }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card shadow-soft">
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-brand/15 via-transparent to-brand2/20"
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <div className="relative grid gap-6 p-6 md:grid-cols-[1.5fr,1fr] md:items-center">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-brand" />
            <p className="text-sm font-semibold text-brand">امتیاز {pharmacy.rating.toFixed(1)} / ۵</p>
            {pharmacy.isOpen ? <Badge variant="success">باز</Badge> : <Badge variant="outline">بسته</Badge>}
          </div>
          <div>
            <h1 className="text-2xl font-bold leading-tight md:text-3xl">{pharmacy.name}</h1>
            <p className="text-sm text-muted">{pharmacy.addressShort}</p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-muted">
            <span className="inline-flex items-center gap-2 rounded-xl bg-white/60 px-3 py-2 shadow-inner backdrop-blur-md dark:bg-white/5">
              <Clock className="h-4 w-4" />
              بازه تحویل {pharmacy.deliveryEtaMin} تا {pharmacy.deliveryEtaMax} دقیقه
            </span>
            <span className="inline-flex items-center gap-2 rounded-xl bg-white/60 px-3 py-2 shadow-inner backdrop-blur-md dark:bg-white/5">
              <ShieldCheck className="h-4 w-4" />
              ارسال با پیک سرد
            </span>
            <span className="inline-flex items-center gap-2 rounded-xl bg-white/60 px-3 py-2 shadow-inner backdrop-blur-md dark:bg-white/5">
              <MapPin className="h-4 w-4" />
              {pharmacy.tags.slice(0, 2).join(" · ")}
            </span>
          </div>
        </div>
        <div className="relative h-52 w-full overflow-hidden rounded-2xl border border-white/10 shadow-inner bg-gradient-to-br from-brand/15 via-card to-brand2/15">
          <motion.div
            className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.35),transparent_40%)]"
            animate={{ scale: [1, 1.06, 1], rotate: [0, 4, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(0,0,0,0.06),transparent_60%)]" />
        </div>
      </div>
    </div>
  );
}
