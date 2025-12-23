import { redirect } from "next/navigation";

export default function PharmacyIndex() {
  redirect("/pharmacy/orders");
}
