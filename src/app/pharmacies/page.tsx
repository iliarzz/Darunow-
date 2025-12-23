import { Suspense } from "react";
import { seedPharmacies } from "@/lib/mock/seed";
import { PharmaciesContent, PharmacySkeleton } from "./pharmacies-content";

export default function PharmaciesPage() {
  const initialPharmacies = seedPharmacies.slice(0, 10);
  return (
    <Suspense fallback={<PharmacySkeleton />}>
      <PharmaciesContent initialPharmacies={initialPharmacies} />
    </Suspense>
  );
}
