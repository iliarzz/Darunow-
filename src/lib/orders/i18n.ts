import type { OrderStatus, Prescription } from "./types";

export type PrescriptionReviewStatus = NonNullable<Prescription["reviewStatus"]>;

const orderStatusMap: Record<OrderStatus, string> = {
  PLACED: "ثبت شد",
  PHARMACY_REVIEW: "در انتظار تایید داروخانه",
  PHARMACY_ACCEPTED: "تایید داروخانه",
  PHARMACY_REJECTED: "رد شد",
  PREPARING: "آماده‌سازی",
  READY_FOR_DISPATCH: "آماده ارسال",
  DISPATCHED: "ارسال شد",
  DELIVERED: "تحویل شد",
  CANCELED: "لغو شد",
};

const rxStatusMap: Record<PrescriptionReviewStatus, string> = {
  PENDING_REVIEW: "در انتظار بررسی",
  NEED_CLARIFICATION: "نیاز به توضیح",
  APPROVED: "تایید شده",
  REJECTED: "رد شده",
  FULFILLED: "تکمیل شد",
};

export function orderStatusFa(status: OrderStatus): string {
  return orderStatusMap[status] ?? status;
}

export function rxStatusFa(status: PrescriptionReviewStatus): string {
  return rxStatusMap[status] ?? status;
}
