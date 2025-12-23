import { NextResponse } from "next/server";
import { mockStore } from "@/lib/mock/store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pharmacyId = searchParams.get("pharmacyId");
  const all = mockStore.listProducts();
  const filtered = pharmacyId ? all.filter((p) => p.pharmacyId === pharmacyId) : all;
  return NextResponse.json(filtered);
}
