import { Buffer } from "node:buffer";
import { expect, test } from "@playwright/test";

const pixel = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

const makeProduct = () => ({
  _id: "product-1",
  title: "Clean Oxford Shirt",
  description: "A simple cotton shirt.",
  images: [{ url: pixel }],
  verient: [
    { price: { basePrice: 1299, currency: "INR" }, stock: { basePrice: 8, currency: "INR" }, attributes: { size: "M", color: "Blue" } },
    { price: { basePrice: 1399, currency: "INR" }, stock: { basePrice: 3, currency: "INR" }, attributes: { size: "L", color: "Blue" } },
  ],
});

const json = (route, body, status = 200) =>
  route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });

test("catalog loads products, sorts them and fits a mobile viewport", async ({ page }) => {
  const first = makeProduct();
  const second = {
    ...makeProduct(), _id: "product-2", title: "Everyday Tee",
    verient: [{ ...makeProduct().verient[0], price: { basePrice: 799, currency: "INR" } }],
  };
  await page.route("**/api/product/all", (route) => json(route, { success: true, data: [first, second] }));
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Products" })).toBeVisible();
  await expect(page.getByText("2 products")).toBeVisible();
  await page.getByLabel("Sort by").selectOption("low");
  await expect(page.locator("article h2").first()).toHaveText("Everyday Tee");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("catalog retries after a failed request", async ({ page }) => {
  let attempts = 0;
  await page.route("**/api/product/all", (route) => {
    attempts += 1;
    if (attempts <= 2) return json(route, { message: "Temporary error" }, 500);
    return json(route, { success: true, data: [makeProduct()] });
  });
  await page.goto("/");
  await expect(page.getByRole("alert")).toContainText("Temporary error");
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByText("1 product")).toBeVisible();
  expect(attempts).toBe(3);
});

test("seller publishes a product and validation focuses the errors", async ({ page }) => {
  let createdBody = "";
  await page.route("**/api/product/all-by-seller", (route) => json(route, { success: true, data: [] }));
  await page.route("**/api/product/create", async (route) => {
    createdBody = (await route.request().postData()) ?? "";
    const product = makeProduct();
    product.title = "Black Overshirt";
    return json(route, { success: true, product });
  });
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/seller/new");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

  await page.getByRole("button", { name: "Publish product" }).click();
  const summary = page.getByRole("alert").first();
  await expect(summary).toBeFocused();
  await expect(summary).toContainText("Enter a title");

  await page.getByLabel("Title").fill("Black Overshirt");
  await page.getByLabel("Description").fill("A clean heavyweight layer.");
  await page.getByLabel("Size").fill("M");
  await page.getByLabel("Color").fill("Black");
  await page.getByLabel("Price (INR)").fill("1499");
  await page.getByLabel("Stock").fill("12");
  await page.getByLabel("Images").setInputFiles({ name: "shirt.png", mimeType: "image/png", buffer: Buffer.from("product-image") });
  await page.getByRole("button", { name: "Publish product" }).click();

  await expect(page).toHaveURL(/\/seller$/);
  await expect(page.getByRole("status")).toContainText("Product published");
  await expect(page.getByText("Black Overshirt")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(createdBody).toContain("Black Overshirt");
  expect(createdBody).toContain("stockAmount");
});

test("seller edits title, every variant price and replaces images", async ({ page }) => {
  let product = makeProduct();
  const changedVariants = [];
  let imageReplaced = false;
  await page.route("**/api/product/all-by-seller", (route) => json(route, { success: true, data: [product] }));
  await page.route("**/api/product/update-title/product-1", async (route) => {
    product = { ...product, title: (await route.request().postDataJSON()).title };
    return json(route, { success: true, data: product });
  });
  await page.route("**/api/product/update-price/product-1", async (route) => {
    const body = await route.request().postDataJSON();
    changedVariants.push(body.variantIndex);
    product = { ...product, verient: product.verient.map((variant, index) =>
      index === body.variantIndex ? { ...variant, price: { ...variant.price, basePrice: body.priceAmount } } : variant) };
    return json(route, { success: true, data: product });
  });
  await page.route("**/api/product/update-image/product-1", (route) => {
    imageReplaced = true;
    return json(route, { success: true, data: product });
  });

  await page.goto("/seller/product-1/edit");
  await page.getByLabel("Title").fill("Updated Oxford Shirt");
  await page.getByLabel("Price (INR)").nth(0).fill("1499");
  await page.getByLabel("Price (INR)").nth(1).fill("1599");
  await page.getByLabel("Replace images").setInputFiles({ name: "replacement.png", mimeType: "image/png", buffer: Buffer.from("new-image") });
  await page.getByRole("button", { name: "Save changes" }).click();

  await expect(page).toHaveURL(/\/seller$/);
  await expect(page.getByRole("status")).toContainText("Product updated");
  await expect(page.getByText("Updated Oxford Shirt")).toBeVisible();
  expect(changedVariants).toEqual([0, 1]);
  expect(imageReplaced).toBe(true);
});

test("failed edit remains open with the entered value", async ({ page }) => {
  await page.route("**/api/product/all-by-seller", (route) => json(route, { success: true, data: [makeProduct()] }));
  await page.route("**/api/product/update-title/product-1", (route) => json(route, { message: "Title update failed" }, 500));
  await page.goto("/seller/product-1/edit");
  await page.getByLabel("Title").fill("Unsaved title");
  await page.getByRole("button", { name: "Save changes" }).click();

  await expect(page).toHaveURL(/\/edit$/);
  await expect(page.getByRole("alert")).toContainText("Title update failed");
  await expect(page.getByLabel("Title")).toHaveValue("Unsaved title");
});

test("delete reports an error and succeeds on retry", async ({ page }) => {
  let attempts = 0;
  await page.route("**/api/product/all-by-seller", (route) => json(route, { success: true, data: [makeProduct()] }));
  await page.route("**/api/product/product-1", (route) => {
    attempts += 1;
    return attempts === 1 ? json(route, { message: "Delete failed" }, 500) : json(route, { success: true });
  });
  await page.goto("/seller");
  await page.getByRole("button", { name: "Delete Clean Oxford Shirt" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Delete" }).click();
  await expect(dialog.getByRole("alert")).toContainText("Delete failed");
  await dialog.getByRole("button", { name: "Delete" }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole("status")).toContainText("Product deleted");
  await expect(page.getByText("No products yet")).toBeVisible();
});
