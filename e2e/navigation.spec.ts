import { test, expect } from "@playwright/test";

test("homepage loads with header and footer", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Tinker Carpentry" })).toBeVisible();
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
});

test("header nav links to the shop page", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("banner").getByRole("link", { name: "Shop", exact: true }).click();
  await expect(page).toHaveURL(/\/shop$/);
  await expect(page.getByRole("heading", { level: 1, name: "Shop" })).toBeVisible();
});

test("cart toggle button is visible and starts empty", async ({ page }) => {
  await page.goto("/");
  const cartButton = page.getByRole("button", { name: "Open cart" });
  await expect(cartButton).toBeVisible();
});
