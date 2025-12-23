import { test, expect } from "@playwright/test";

test("end-to-end pharmacy to order flow", async ({ page }) => {
  await page.addInitScript(() => {
    if (localStorage.getItem("darunow.testSeeded")) return;
    const now = Date.now();
    const address = {
      id: "addr-test",
      label: "خانه",
      recipientName: "کاربر تست",
      phone: "09123456789",
      province: "8",
      city: "301",
      line1: "خیابان تست ۱۲۳",
      line2: "",
      postalCode: "1912345678",
      notes: "",
      isDefault: true,
      createdAt: now,
      updatedAt: now,
    };
    localStorage.setItem("darunow.addresses.v1", JSON.stringify([address]));
    localStorage.setItem("darunow.cart.v1", "[]");
    localStorage.setItem("darunow.orders.v1", "[]");
    localStorage.setItem("darunow.checkoutSession.v1", "{}");
    localStorage.setItem("darunow.testSeeded", "true");
  });

  await page.goto("/pharmacies");
  await page.waitForLoadState("networkidle");
  const firstView = page.getByText("مشاهده").first();
  await firstView.waitFor();
  await firstView.click();
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => {
    const item = {
      id: "prod-ator",
      pharmacyId: "pharm-velocity",
      name: "آتورواستاتین",
      subtitle: "۲۰ میلی‌گرم - ۳۰ عدد",
      price: 185000,
      qty: 1,
    };
    localStorage.setItem("darunow.cart.v1", JSON.stringify([item]));
    window.dispatchEvent(new StorageEvent("storage", { key: "darunow.cart.v1" }));
  });

  await page.goto("/cart");
  await expect(page.getByText("سبد خرید")).toBeVisible();
  await page.evaluate(() => {
    const item = {
      id: "prod-ator",
      pharmacyId: "pharm-velocity",
      name: "آتورواستاتین",
      subtitle: "۲۰ میلی‌گرم - ۳۰ عدد",
      price: 185000,
      qty: 1,
    };
    localStorage.setItem("darunow.cart.v1", JSON.stringify([item]));
    window.dispatchEvent(new StorageEvent("storage", { key: "darunow.cart.v1" }));
  });
  await expect(page.getByText("آتورواستاتین")).toBeVisible();
  await page.getByRole("link", { name: "ادامه پرداخت" }).click();

  await expect(page).toHaveURL(/checkout/);
  await page.getByRole("button", { name: "ثبت سفارش" }).click();
  await page.waitForURL(/orders\/success/);

  const orderId = new URL(page.url()).searchParams.get("orderId");
  expect(orderId).not.toBeNull();
  const orderStore = await page.evaluate(() => JSON.parse(localStorage.getItem("darunow.orders.v1") || "[]"));
  expect(orderStore.length).toBeGreaterThan(0);
  expect(orderStore.some((o: { id: string }) => o.id === orderId)).toBe(true);

  await page.goto("/orders");
  const ordersInPage = await page.evaluate(() => {
    const parsed = JSON.parse(localStorage.getItem("darunow.orders.v1") || "[]");
    return parsed.length;
  });
  expect(ordersInPage).toBeGreaterThan(0);
});
