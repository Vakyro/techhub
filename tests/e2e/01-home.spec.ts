import { test, expect } from "@playwright/test"

test("homepage — navegación completa", async ({ page }) => {
  await page.goto("/")
  await page.waitForLoadState("networkidle")

  // Hero section
  await expect(page.getByText("makers de Tijuana")).toBeVisible()
  await page.waitForTimeout(1500)

  // Scroll a productos destacados
  await page.evaluate(() => window.scrollBy({ top: 500, behavior: "smooth" }))
  await page.waitForTimeout(1500)

  // Scroll a categorías
  await page.evaluate(() => window.scrollBy({ top: 600, behavior: "smooth" }))
  await page.waitForTimeout(1500)

  // Scroll a stats
  await page.evaluate(() => window.scrollBy({ top: 600, behavior: "smooth" }))
  await page.waitForTimeout(1500)

  // Scroll a features
  await page.evaluate(() => window.scrollBy({ top: 600, behavior: "smooth" }))
  await page.waitForTimeout(1500)

  // Scroll a partners
  await page.evaluate(() => window.scrollBy({ top: 600, behavior: "smooth" }))
  await page.waitForTimeout(2000)

  // Scroll de vuelta arriba
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }))
  await page.waitForTimeout(1500)
})
