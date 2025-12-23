const moneyFormatter = new Intl.NumberFormat("fa-IR-u-ca-persian", { maximumFractionDigits: 0 });
const dateFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { year: "numeric", month: "short", day: "numeric" });
const timeFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { hour: "2-digit", minute: "2-digit", hour12: false });
const digits = new Intl.NumberFormat("fa-IR-u-ca-persian");

const toDate = (value: Date | string | number) => (value instanceof Date ? value : new Date(value));

export function toFaDigits(value: string | number): string {
  if (value === undefined || value === null) return "";
  const normalized = typeof value === "number" ? value : Number.isNaN(Number(value)) ? String(value) : Number(value);
  return typeof normalized === "number" ? digits.format(normalized) : String(normalized).replace(/\d/g, (d) => digits.format(Number(d)));
}

export function formatMoney(value: number): string {
  return `${moneyFormatter.format(Math.round(value))} تومان`;
}

export function formatNumber(value: number): string {
  return digits.format(value);
}

export function formatDate(value: Date | string | number): string {
  return dateFormatter.format(toDate(value));
}

export function formatTime(value: Date | string | number): string {
  return timeFormatter.format(toDate(value));
}

export function formatOrderId(id: string): string {
  return id
    .split("-")
    .map((part) => (Number.isFinite(Number(part)) ? digits.format(Number(part)) : part))
    .join(" • ");
}
