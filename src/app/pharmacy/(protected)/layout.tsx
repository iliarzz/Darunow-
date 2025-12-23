"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getPharmacySessionFromCookie } from "@/lib/auth";
import { AppShell } from "@/components/shell/app-shell";

export default async function PharmacyProtectedLayout({ children }: { children: React.ReactNode }) {
  const cookieToken = cookies().get("pharmacy_session")?.value;
  const session = await getPharmacySessionFromCookie(cookieToken);
  if (!session) {
    redirect("/pharmacy/login");
  }
  return <AppShell>{children}</AppShell>;
}
