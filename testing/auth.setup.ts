import { chromium, expect } from '@playwright/test'
import path from 'path'

async function loginAndSave(
  email: string,
  password: string,
  stateFile: string
) {
  const browser = await chromium.launch()
  const page = await browser.newPage({ baseURL: 'http://localhost:5000' })

  await page.goto('/login') // If login is '/', change here.
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  await page.click('button[type="submit"]')

  // Wait for a sign of being logged in (navbar, logout, user menu…)
  await expect(page.locator('text=/logout|sign.*out/i')).toBeVisible()

  await page.context().storageState({ path: stateFile })
  await browser.close()
}

export default async () => {
  const dir = path.join(process.cwd(), 'playwright', '.auth')
  // ensure dir exists
  await (await import('fs/promises')).mkdir(dir, { recursive: true })

  await loginAndSave(
    'admin@test.com',
    'AdminPass123!',
    path.join(dir, 'admin.json')
  )
  await loginAndSave(
    'lead@test.com',
    'LeadPass123!',
    path.join(dir, 'lead.json')
  )
  await loginAndSave(
    'field@test.com',
    'FieldPass123!',
    path.join(dir, 'field.json')
  )
}
