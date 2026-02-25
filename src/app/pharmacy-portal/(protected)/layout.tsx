import type { ReactNode } from "react";
import { ProtectedPortalShell } from "@/components/portal/ProtectedPortalShell";

export default function PharmacyPortalProtectedLayout({ children }: { children: ReactNode }) {
  return <ProtectedPortalShell>{children}</ProtectedPortalShell>;
}
