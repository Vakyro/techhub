import { test, expect } from "@playwright/test"

test("asistente IA — chat con recomendaciones", async ({ page }) => {
  await page.goto("/asistente")
  await page.waitForLoadState("networkidle")
  await page.waitForTimeout(1500)

  // Ver la interfaz del asistente
  const chatInput = page.locator("textarea, input[type='text']").last()
  await expect(chatInput).toBeVisible({ timeout: 10000 })
  await page.waitForTimeout(1000)

  // Primera consulta
  await chatInput.click()
  await chatInput.fill("Necesito un arduino para mi proyecto")
  await page.waitForTimeout(800)
  await page.keyboard.press("Enter")
  await page.waitForTimeout(4000)

  // Scroll para ver la respuesta
  await page.evaluate(() => window.scrollBy({ top: 300, behavior: "smooth" }))
  await page.waitForTimeout(2000)

  // Segunda consulta
  await chatInput.click()
  await chatInput.fill("sensores de temperatura")
  await page.waitForTimeout(800)
  await page.keyboard.press("Enter")
  await page.waitForTimeout(4000)

  // Ver las tarjetas de productos recomendados
  await page.evaluate(() => window.scrollBy({ top: 400, behavior: "smooth" }))
  await page.waitForTimeout(2000)
})
