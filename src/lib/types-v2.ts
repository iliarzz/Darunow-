import type { DeliveryOption, Invoice, PaymentMethod as CheckoutPaymentMethod, PaymentStatus } from "./payments/types";

export type AddressLabel = "خانه" | "کار" | "سایر";

export type Address = {
  id: string;
  label: AddressLabel;
  recipientName: string;
  phone: string;
  province: string;
  city: string;
  line1: string;
  line2?: string;
  postalCode?: string;
  notes?: string;
  isDefault: boolean;
  createdAt: number;
  updatedAt: number;
};

export type PaymentMethodType = "online" | "cod" | "card";

export type PaymentMethod = {
  id: string;
  type: PaymentMethodType;
  label: string;
  last4?: string;
  isDefault: boolean;
  createdAt: number;
};

export type CheckoutPrefs = {
  substitution: "none" | "similarAllowed" | "askMe";
  preferredDeliveryType: "express" | "scheduled";
};

export type Coupon = {
  code: string;
  discountType: "percent" | "fixed";
  value: number;
};

export type AppliedCoupon = {
  code: string;
  discountType: "percent" | "fixed";
  value: number;
};

export type OrderStatus =
  | "created"
  | "rx_received"
  | "rx_review"
  | "needs_fix"
  | "approved"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refund_requested"
  | "refunding"
  | "refunded";

export type OrderItem = {
  name: string;
  qty: number;
  price: number;
  productId?: string;
  pharmacyId?: string;
  subtitle?: string;
};

export type Order = {
  id: string;
  createdAt: number;
  pharmacyId?: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal?: number;
  deliveryFee?: number;
  total: number;
  discount: number;
  payable: number;
  addressId: string;
  deliverySlotId?: string;
  paymentType: PaymentMethodType;
  paymentMethodCode?: CheckoutPaymentMethod;
  paymentStatus?: PaymentStatus;
  paymentIntentId?: string;
  paymentRefId?: string;
  substitution: CheckoutPrefs["substitution"];
  deliveryOption?: DeliveryOption;
  invoice?: Invoice;
  serviceFee?: number;
  couponCode?: string;
  noteToCourier?: string;
  notes?: string;
  timeline: { status: OrderStatus; at: number }[];
};

export type DeliveryStatusV2 =
  | "unassigned"
  | "offered"
  | "accepted"
  | "picked_up"
  | "enroute"
  | "arrived"
  | "delivered"
  | "failed"
  | "cancelled";

export type DeliveryEvent = {
  type: "assigned" | "accepted" | "picked_up" | "location" | "arrived" | "delivered" | "failed" | "note";
  at: number;
  meta?: Record<string, unknown>;
};

export type DeliveryLocationPing = {
  courierId: string;
  lat: number;
  lng: number;
  speed?: number | null;
  heading?: number | null;
  accuracy?: number | null;
  at: number;
};

export type DeliverySummary = {
  id: string;
  orderId: string;
  courierId?: string | null;
  status: DeliveryStatusV2;
  pickupPharmacyId: string;
  dropoffAddressId: string;
  etaMin?: number | null;
  etaMax?: number | null;
  distanceKm?: number | null;
  events: DeliveryEvent[];
  lastPing?: DeliveryLocationPing;
};

export type TicketStatus = "open" | "answered" | "closed";

export type Ticket = {
  id: string;
  createdAt: number;
  status: TicketStatus;
  subject: string;
  message: string;
  orderId?: string;
  replies: { at: number; from: "user" | "support" | "pharmacy"; text: string }[];
};

export type PatientProfile = {
  fullName?: string;
  age?: number;
  allergies?: string[];
  chronicMeds?: string[];
  notes?: string;
  updatedAt: number;
};

export type Reminder = {
  id: string;
  title: string;
  dosage?: string;
  times: string[];
  days: number[];
  enabled: boolean;
  createdAt: number;
};
