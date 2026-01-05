export type PaymentMethod = "online_shaparak" | "cod_card_reader" | "card_to_card";

export type PaymentStatus =
  | "INITIATED"
  | "REDIRECTED"
  | "RETURNED"
  | "VERIFYING"
  | "SUCCESS"
  | "FAILED"
  | "CANCELED"
  | "EXPIRED";

export type DeliveryOption = "express" | "standard" | "scheduled";

export type Invoice = {
  itemsTotal: number;
  deliveryFee: number;
  serviceFee: number;
  discount: number;
  payableTotal: number;
  currency: "TOMAN";
};

export type CheckoutDraft = {
  deliveryOption: DeliveryOption;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  noteToCourier?: string;
};
