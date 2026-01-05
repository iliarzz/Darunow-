export type AddressLabel = "home" | "work" | "dorm" | "other";

export type GeoPoint = {
  lat: number;
  lng: number;
  accuracyM?: number;
  source: "gps" | "map_pin" | "manual";
};

export type AddressDetails = {
  street?: string;
  alley?: string;        // REQUIRED for precision delivery
  plaque?: string;       // REQUIRED
  unit?: string;
  floor?: string;
  building?: string;
  entrance?: string;
  doorbell?: string;
  postalCode?: string;
  notes?: string;
};

export type AddressAdmin = {
  city: string;          // REQUIRED
  province?: string;
  area?: string;
  district?: string;
};

export type AddressDisplay = {
  title: string;         // "خانه"
  subtitle: string;      // one-line summary for TopLocationBar
  formatted: string;     // multi-line for receipts
};

export type Address = {
  id: string;
  label: AddressLabel;
  isDefault: boolean;
  geo: GeoPoint;         // REQUIRED ALWAYS in map-first model
  admin: AddressAdmin;   // city required
  details: AddressDetails;

  place?: {
    provider: "google" | "mapbox";
    placeId?: string;
    name?: string;
    formattedAddress?: string;
  };

  display: AddressDisplay;

  createdAt: number;
  updatedAt: number;
};

export type AddressDraft = {
  geo?: GeoPoint; // set after map pick
  label?: AddressLabel;
  admin?: Partial<AddressAdmin>;
  details?: Partial<AddressDetails>;
  returnUrl?: string;
  startedAt: number;
};
