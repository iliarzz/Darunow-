export type Pharmacy = {
  id: string;
  slug: string;
  name: string;
  isOpen: boolean;
  deliveryEtaMin: number;
  deliveryEtaMax: number;
  tags: string[];
  rating: number;
  addressShort: string;
  coverStyle: "gradient" | "glass" | "pattern";
};

export type Product = {
  id: string;
  pharmacyId: string;
  nameFa: string;
  dosageFa: string;
  priceToman: number;
  rxRequired: boolean;
  stock: number;
  descriptionFa: string;
  warningsFa: string[];
  categoryFa: string;
};

export type PrescriptionStatus = "فعال" | "بررسی‌شده" | "ردشده";

export type Prescription = {
  id: string;
  ownerId: string;
  status: PrescriptionStatus;
  createdAt: string;
  doctorName?: string;
  fileType: "image" | "pdf";
  previewUrlMock: string;
};

export type AccessGrant = {
  id: string;
  prescriptionId: string;
  pharmacyId: string;
  orderId: string;
  scope: "view";
  expiresAt: string;
};

export type CartItem = {
  productId: string;
  qty: number;
};

export type OrderStatus =
  | "ثبت شد"
  | "در انتظار تایید نسخه"
  | "تایید نسخه"
  | "آماده‌سازی"
  | "ارسال"
  | "تحویل شد"
  | "لغو شد"
  | "در حال بازگشت"
  | "بازگشت شد";

export type Order = {
  id: string;
  pharmacyId: string;
  items: CartItem[];
  status: OrderStatus;
  totalToman: number;
  createdAt: string;
  addressId?: string;
  rxAttached?: {
    prescriptionId: string;
    grantId: string;
  };
};

export type Address = {
  id: string;
  label: "خانه" | "کار" | "سایر";
  title?: string;
  full: string;
  provinceId: string;
  cityId: string;
  postalCode?: string;
  notes?: string;
  locationHint?: string;
  isDefault?: boolean;
};

export type InsuranceProvider = "تأمین اجتماعی" | "بیمه سلامت" | "نیروهای مسلح" | "آزاد" | "سایر";

export type InsuranceInfo = {
  provider: InsuranceProvider;
  insuranceNumber?: string;
  expiry?: string;
};

export type ProfileInfo = {
  fullName?: string;
  nationalId?: string;
  phone?: string;
  insurance?: InsuranceInfo;
  notifications?: boolean;
};
