import type { Permission, Role, RolePermissions } from "./types";

export const ROLE_PERMISSIONS: RolePermissions = {
  OWNER: [
    "ORDERS_VIEW",
    "ORDERS_UPDATE_STATUS",
    "ORDERS_ACCEPT_REJECT",
    "PRESCRIPTIONS_REVIEW",
    "CATALOG_MANAGE",
    "INVENTORY_MANAGE",
    "FINANCE_VIEW",
    "SETTLEMENTS_VIEW",
    "SUPPORT_VIEW",
    "SUPPORT_REPLY",
    "STAFF_MANAGE",
    "SETTINGS_MANAGE",
  ],
  PHARMACIST: [
    "ORDERS_VIEW",
    "ORDERS_UPDATE_STATUS",
    "ORDERS_ACCEPT_REJECT",
    "PRESCRIPTIONS_REVIEW",
    "CATALOG_MANAGE",
    "INVENTORY_MANAGE",
    "SUPPORT_VIEW",
  ],
  OPERATOR: ["ORDERS_VIEW", "ORDERS_UPDATE_STATUS", "ORDERS_ACCEPT_REJECT", "SUPPORT_VIEW", "SUPPORT_REPLY"],
  FINANCE: ["FINANCE_VIEW", "SETTLEMENTS_VIEW", "ORDERS_VIEW"],
  SUPPORT: ["SUPPORT_VIEW", "SUPPORT_REPLY"],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  const allowed = ROLE_PERMISSIONS[role] ?? [];
  return allowed.includes(permission);
}
