const tomanFormatter = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 0, useGrouping: true });

export function formatToman(amount: number): string {
  const normalized = Number.isFinite(amount) ? amount : 0;
  const rounded = Math.round(normalized);
  const formatted = tomanFormatter.format(rounded);
  return `${formatted} تومان`;
}
