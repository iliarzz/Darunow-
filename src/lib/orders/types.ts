// Portal-first order domain. Legacy consumer types are accommodated via unions to avoid breaking existing screens.

export type OrderType = "STANDARD" | "PRESCRIPTION" | "standard" | "prescription";

export type OrderStatus =
  | "PLACED"
  | "PHARMACY_REVIEW"
  | "PHARMACY_ACCEPTED"
  | "PHARMACY_REJECTED"
  | "PREPARING"
  | "READY_FOR_DISPATCH"
  | "DISPATCHED"
  | "DELIVERED"
  | "CANCELED";

export type PaymentMethod = "ONLINE_SHAPARAK" | "COD_CARD_READER" | "CARD_TO_CARD" | "online_shaparak" | "cod_card_reader" | "card_to_card";
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "COD";

export type OrderItem = {
  id: string;
  name: string;
  qty: number;
  unitPrice: number; // toman
  requiresPrescription?: boolean;
  // Legacy fields kept optional to avoid breaking consumer code.
  price?: number;
  subtitle?: string;
};

export type SubstitutionProposal = {
  id: string;
  originalItemId: string;
  suggestedName: string;
  suggestedUnitPrice: number;
  reason?: string; // e.g., "ناموجود"
  status?: "DRAFT" | "SENT_TO_CUSTOMER" | "APPROVED" | "REJECTED";
};

export type Prescription = {
  id: string;
  imageUrls: string[];
  noteToPharmacist?: string;
  reviewStatus?: "PENDING_REVIEW" | "NEED_CLARIFICATION" | "APPROVED" | "REJECTED" | "FULFILLED";
  reviewedBy?: string;
  reviewedAt?: number;
};

export type AuditEvent = {
  id: string;
  at: number;
  actorId: string;
  actorName: string;
  action: string;
  meta?: Record<string, any>;
};

export type Order = {
  id: string;
  type: OrderType;
  status: OrderStatus;

  createdAt: number;
  updatedAt: number;

  pharmacyId: string;
  pharmacyName: string;

  customerName: string;
  customerPhone?: string;
  customerPhoneMasked?: string;

  deliveryAddressText: string; // from address.display.formatted or subtitle
  deliveryLat?: number;
  deliveryLng?: number;

  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;

  items: OrderItem[];
  substitutions: SubstitutionProposal[];

  etaMinutes?: number; // pharmacy sets
  internalNote?: string; // pharmacy-only note

  prescription?: Prescription; // only if type="PRESCRIPTION"
  total: number; // toman (computed)
  audit: AuditEvent[];
};
