import { test, expect } from "@playwright/test"

test("productos — catálogo, búsqueda y filtros", async ({ page }) => {
  await page.goto("/productos")
  await page.waitForLoadState("networkidle")
  await page.waitForTimeout(1500)

  // Vista del catálogo cargado
  await expect(page.locator("h1, h2").first()).toBeVisible()
  await page.waitForTimeout(1000)

  // Buscar un componente
  const searchInput = page.getByPlaceholder("Buscar productos...")
  await searchInput.first().click()
  await page.waitForTimeout(500)
  await searchInput.first().fill("arduino")
  await page.waitForTimeout(1500)

  // Limpiar búsqueda
  await searchInput.first().clear()
  await page.waitForTimeout(800)
  await searchInput.first().fill("sensor")
  await page.waitForTimeout(1500)

  // Limpiar y mostrar todo
  await searchInput.first().clear()
  await page.keyboard.press("Enter")
  await page.waitForTimeout(1500)

  // Cambiar a vista lista si existe
  const listViewBtn = page.locator('[aria-label*="lista"], button').filter({ hasText: /lista/i }).first()
  if (await listViewBtn.isVisible().catch(() => false)) {
    await listViewBtn.click()
    await page.waitForTimeout(1000)
  }

  // Scroll por el catálogo
  await page.evaluate(() => window.scrollBy({ top: 600, behavior: "smooth" }))
  await page.waitForTimeout(1000)
  await page.evaluate(() => window.scrollBy({ top: 600, behavior: "smooth" }))
  await page.waitForTimeout(1500)

  // Hacer click en el primer producto
  const firstProduct = page.locator("a[href*='/producto/']").first()
  if (await firstProduct.isVisible().catch(() => false)) {
    await firstProduct.click()
    await page.waitForLoadState("networkidle")
    await page.waitForTimeout(2000)
  }
})
