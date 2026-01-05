export type Role = "OWNER" | "PHARMACIST" | "OPERATOR" | "FINANCE" | "SUPPORT";

export type Permission =
  | "ORDERS_VIEW"
  | "ORDERS_UPDATE_STATUS"
  | "ORDERS_ACCEPT_REJECT"
  | "PRESCRIPTIONS_REVIEW"
  | "CATALOG_MANAGE"
  | "INVENTORY_MANAGE"
  | "FINANCE_VIEW"
  | "SETTLEMENTS_VIEW"
  | "SUPPORT_VIEW"
  | "SUPPORT_REPLY"
  | "STAFF_MANAGE"
  | "SETTINGS_MANAGE";

export type RolePermissions = Record<Role, Permission[]>;
