import { test, expect } from "@playwright/test"

test("TechReels — navegación vertical de productos", async ({ page }) => {
  await page.goto("/reels")
  await page.waitForLoadState("networkidle")
  await page.waitForTimeout(2000)

  // Ver el primer reel
  await expect(page.locator("img, video").first()).toBeVisible({ timeout: 10000 })
  await page.waitForTimeout(2000)

  // Scroll al siguiente reel
  await page.evaluate(() => window.scrollBy({ top: window.innerHeight, behavior: "smooth" }))
  await page.waitForTimeout(2000)

  // Scroll al siguiente
  await page.evaluate(() => window.scrollBy({ top: window.innerHeight, behavior: "smooth" }))
  await page.waitForTimeout(2000)

  // Scroll al siguiente
  await page.evaluate(() => window.scrollBy({ top: window.innerHeight, behavior: "smooth" }))
  await page.waitForTimeout(2000)
})
