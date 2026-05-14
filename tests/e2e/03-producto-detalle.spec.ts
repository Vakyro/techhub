import { test, expect } from "@playwright/test"

test("producto — detalle, imágenes y reseñas", async ({ page }) => {
  await page.goto("/productos")
  await page.waitForLoadState("networkidle")
  await page.waitForTimeout(1500)

  // Click al primer producto disponible
  const firstProduct = page.locator("a[href*='/producto/']").first()
  await expect(firstProduct).toBeVisible({ timeout: 10000 })
  await firstProduct.click()
  await page.waitForLoadState("networkidle")
  await page.waitForTimeout(1500)

  // Ver imagen principal
  const productImage = page.locator("img").first()
  await expect(productImage).toBeVisible()
  await page.waitForTimeout(1000)

  // Scroll a la descripción
  await page.evaluate(() => window.scrollBy({ top: 300, behavior: "smooth" }))
  await page.waitForTimeout(1000)

  // Scroll a reseñas / recomendaciones
  await page.evaluate(() => window.scrollBy({ top: 500, behavior: "smooth" }))
  await page.waitForTimeout(1500)

  // Scroll a recomendaciones IA
  await page.evaluate(() => window.scrollBy({ top: 500, behavior: "smooth" }))
  await page.waitForTimeout(1500)

  // Volver arriba
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }))
  await page.waitForTimeout(1000)
})
