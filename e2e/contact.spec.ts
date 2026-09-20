import { expect, test, type Page } from "@playwright/test";
import { expectPageBasics } from "./helpers";

const valid = {
  name: "Playwright Tester",
  email: "tester@example.com",
  message: "This is an automated end-to-end message from the test suite.",
};

async function fillForm(page: Page, values: Partial<typeof valid>) {
  if (values.name !== undefined) await page.getByLabel("Name").fill(values.name);
  if (values.email !== undefined) await page.getByLabel("Email").fill(values.email);
  if (values.message !== undefined) await page.getByLabel("Message").fill(values.message);
}

test.describe("contact page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/contact");
  });

  test("renders the page basics and a labelled form", async ({ page }) => {
    await expectPageBasics(page);
    await expect(page.getByTestId("contact-form")).toBeVisible();
    await expect(page.getByLabel("Name")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Message")).toBeVisible();
    await expect(page.getByTestId("contact-submit")).toBeEnabled();
  });

  test("an empty submit shows a validation alert per field and sends nothing", async ({ page }) => {
    let apiCalls = 0;
    await page.route("**/api/contact", (route) => {
      apiCalls += 1;
      return route.fulfill({ status: 200, json: { ok: true } });
    });

    await page.getByTestId("contact-submit").click();
    const errors = page.getByTestId("contact-error");
    await expect(errors).toHaveCount(3);
    await expect(errors.first()).toHaveAttribute("role", "alert");
    await expect(page.getByTestId("contact-success")).toHaveCount(0);
    expect(apiCalls).toBe(0);
  });

  test("an invalid email is reported while the other fields stay valid", async ({ page }) => {
    await fillForm(page, { ...valid, email: "not-an-email" });
    await page.getByTestId("contact-submit").click();
    await expect(page.getByTestId("contact-error")).toHaveCount(1);
    await expect(page.getByTestId("contact-success")).toHaveCount(0);
  });

  test("errors clear once the input is corrected", async ({ page }) => {
    await page.getByTestId("contact-submit").click();
    await expect(page.getByTestId("contact-error")).toHaveCount(3);
    await fillForm(page, valid);
    await page.getByTestId("contact-submit").click();
    await expect(page.getByTestId("contact-error")).toHaveCount(0);
  });

  test("a valid submission reaches the real API and shows the success state", async ({ page }) => {
    const requestPromise = page.waitForRequest("**/api/contact");
    const responsePromise = page.waitForResponse("**/api/contact");
    await fillForm(page, valid);
    await page.getByTestId("contact-submit").click();

    const request = await requestPromise;
    expect(request.method()).toBe("POST");
    expect(request.postDataJSON()).toEqual(valid);
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ ok: true });

    await expect(page.getByTestId("contact-success")).toBeVisible();
    await expect(page.getByTestId("contact-failure")).toHaveCount(0);
  });

  test("shows the failure state when the API responds 502", async ({ page }) => {
    await page.route("**/api/contact", (route) =>
      route.fulfill({ status: 502, contentType: "application/json", json: { ok: false } }),
    );
    await fillForm(page, valid);
    await page.getByTestId("contact-submit").click();

    await expect(page.getByTestId("contact-failure")).toBeVisible();
    await expect(page.getByTestId("contact-success")).toHaveCount(0);
    // Input is preserved so the visitor can retry.
    await expect(page.getByLabel("Name")).toHaveValue(valid.name);
  });

  test("shows the failure state when the request is aborted", async ({ page }) => {
    await page.route("**/api/contact", (route) => route.abort("failed"));
    await fillForm(page, valid);
    await page.getByTestId("contact-submit").click();
    await expect(page.getByTestId("contact-failure")).toBeVisible();
  });

  test("the API rejects an invalid payload directly with 400", async ({ request }) => {
    const response = await request.post("/api/contact", {
      data: { name: "", email: "x", message: "y" },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.errors).toBeTruthy();
  });
});
