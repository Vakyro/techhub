import { test, expect } from "@playwright/test"

const EMAIL = process.env.TEST_EMAIL ?? ""
const PASSWORD = process.env.TEST_PASSWORD ?? ""

test.skip(!EMAIL || !PASSWORD, "Requiere TEST_EMAIL y TEST_PASSWORD en el entorno")

test("login — selección de tipo y acceso", async ({ page }) => {
  await page.goto("/iniciar-sesion")
  await page.waitForLoadState("networkidle")
  await page.waitForTimeout(1500)

  // Pantalla de selección de tipo de usuario
  await expect(page.getByText("Selecciona tu tipo de cuenta")).toBeVisible()
  await page.waitForTimeout(1000)

  // Elegir "Usuario"
  await page.getByText("Usuario").first().click()
  await page.waitForTimeout(1000)

  // Formulario visible
  const emailInput = page.locator("#email")
  const passwordInput = page.locator("#password")
  await expect(emailInput).toBeVisible()

  // Ingresar credenciales
  await emailInput.fill(EMAIL)
  await page.waitForTimeout(600)
  await passwordInput.fill(PASSWORD)
  await page.waitForTimeout(600)

  // Submit
  await page.getByRole("button", { name: /iniciar sesión/i }).click()
  await page.waitForLoadState("networkidle")
  await page.waitForTimeout(2000)

  // Confirmar redirección al home
  await expect(page).toHaveURL("/")
  await page.waitForTimeout(1500)
})
