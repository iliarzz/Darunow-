import { type Address } from "./types";

export function validateAddressBase(a: Address): string[] {
  const errs: string[] = [];
  if (!a?.geo?.lat || !a?.geo?.lng) errs.push("لوکیشن معتبر نیست.");
  if (!a?.admin?.city) errs.push("شهر را وارد کن.");
  if (!a?.details?.alley) errs.push("کوچه را وارد کن.");
  if (!a?.details?.plaque) errs.push("پلاک را وارد کن.");
  return errs;
}

export function validateAddressForPrescription(a: Address): string[] {
  // strict rules for prescriptions (must be precise)
  return validateAddressBase(a);
}
