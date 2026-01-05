import { type Address, type AddressDisplay } from "./types";

export function buildAddressDisplay(a: Omit<Address, "display">): AddressDisplay {
  const titleMap = {
    home: "خانه",
    work: "محل کار",
    dorm: "خوابگاه",
    other: "آدرس",
  } as const;

  const parts = [
    a.admin.city,
    a.admin.area,
    a.details.street ? `خیابان ${a.details.street}` : undefined,
    a.details.alley ? `کوچه ${a.details.alley}` : undefined,
    a.details.plaque ? `پلاک ${a.details.plaque}` : undefined,
    a.details.unit ? `واحد ${a.details.unit}` : undefined,
  ].filter(Boolean) as string[];

  const subtitle = parts.slice(0, 4).join("، ");

  const formattedLines = [
    parts.join("، "),
    a.details.floor ? `طبقه: ${a.details.floor}` : undefined,
    a.details.building ? `ساختمان: ${a.details.building}` : undefined,
    a.details.doorbell ? `زنگ: ${a.details.doorbell}` : undefined,
    a.details.postalCode ? `کدپستی: ${a.details.postalCode}` : undefined,
    a.details.notes ? `یادداشت پیک: ${a.details.notes}` : undefined,
  ].filter(Boolean) as string[];

  return {
    title: titleMap[a.label],
    subtitle,
    formatted: formattedLines.join("\n"),
  };
}
