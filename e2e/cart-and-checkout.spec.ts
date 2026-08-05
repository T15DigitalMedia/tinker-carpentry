import { test, expect, type Page } from "@playwright/test";

// These tests exercise the storefront against whatever product data is in the
// configured Supabase project. Rather than assuming fixtures exist, each test
// skips itself when the precondition it needs (an in-stock product, an item
// in the cart) isn't there. Seed at least one active, in-stock product to get
// full coverage instead of skips.

async function openFirstAvailableProduct(page: Page) {
  await page.goto("/shop");

  const productLink = page.locator('a[href^="/shop/"]').filter({ has: page.locator("h3") });
  const count = await productLink.count();
  test.skip(count === 0, "No products found in the shop — seed at least one active product to run this test.");

  await productLink.first().click();
  await expect(page).toHaveURL(/\/shop\/.+/);
}

test("adding a product to the cart opens the drawer with that item", async ({ page }) => {
  await openFirstAvailableProduct(page);

  const addToCart = page.getByRole("button", { name: "Add to cart" });
  const outOfStock = await page.getByRole("button", { name: "Out of stock" }).count();
  test.skip(outOfStock > 0, "First product is out of stock — seed an in-stock product to run this test.");

  const productName = await page.getByRole("heading", { level: 1 }).innerText();
  await addToCart.click();

  const cartDrawer = page.getByRole("dialog", { name: "Your cart" });
  await expect(cartDrawer).toBeVisible();
  await expect(cartDrawer.getByText(productName)).toBeVisible();
  await expect(page.getByRole("button", { name: /Open cart, 1 item/ })).toBeVisible();
});

test("quantity controls and remove update the cart", async ({ page }) => {
  await openFirstAvailableProduct(page);

  const outOfStock = await page.getByRole("button", { name: "Out of stock" }).count();
  test.skip(outOfStock > 0, "First product is out of stock — seed an in-stock product to run this test.");

  await page.getByRole("button", { name: "Add to cart" }).click();
  const cartDrawer = page.getByRole("dialog", { name: "Your cart" });
  await expect(cartDrawer).toBeVisible();

  const increaseButton = cartDrawer.getByRole("button", { name: /Increase quantity of/ });
  const canIncrease = await increaseButton.isEnabled();
  test.skip(!canIncrease, "Only one unit in stock — can't test increasing quantity further.");

  await increaseButton.click();
  await expect(page.getByRole("button", { name: /Open cart, 2 items/ })).toBeVisible();

  await cartDrawer.getByRole("button", { name: "Remove" }).click();
  await expect(cartDrawer.getByText("Your cart is empty.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Open cart" })).toBeVisible();
});

test("checkout redirects to a Stripe-hosted session", async ({ page }) => {
  await openFirstAvailableProduct(page);

  const outOfStock = await page.getByRole("button", { name: "Out of stock" }).count();
  test.skip(outOfStock > 0, "First product is out of stock — seed an in-stock product to run this test.");

  await page.getByRole("button", { name: "Add to cart" }).click();

  const cartDrawer = page.getByRole("dialog", { name: "Your cart" });
  await cartDrawer.getByRole("button", { name: "Checkout" }).click();

  // We only confirm the redirect lands on Stripe Checkout — no card details
  // are entered, so no payment is ever attempted.
  await page.waitForURL(/checkout\.stripe\.com/, { timeout: 15_000 });
  expect(page.url()).toContain("checkout.stripe.com");
});
