// testing/login-security.spec.ts
import { test, expect } from '@playwright/test'

// Test data for security validation
const INVALID_CREDENTIALS = [
  { email: '', password: '', description: 'empty credentials' },
  {
    email: 'admin',
    password: 'admin',
    description: 'weak default credentials',
  },
  {
    email: 'test@test.com',
    password: '123456',
    description: 'common weak password',
  },
  {
    email: 'invalid-email',
    password: 'password',
    description: 'invalid email format',
  },
  {
    email: 'user@domain',
    password: 'pass',
    description: 'incomplete email domain',
  },
  {
    email: 'sql@injection.com',
    password: "'; DROP TABLE staffs; --",
    description: 'SQL injection attempt',
  },
  {
    email: '<script>alert("xss")</script>@test.com',
    password: 'test',
    description: 'XSS attempt in email',
  },
  {
    email: 'test@example.com',
    password: '<script>alert("xss")</script>',
    description: 'XSS attempt in password',
  },
]

// Common selectors
const EMAIL = '#email, input[name="email"], input[type="email"]'
const PASSWORD = '#password, input[name="password"], input[type="password"]'
const SUBMIT =
  'button:has-text("Login"), button:has-text("Sign in"), .btn:has-text("Login"), .btn[type="submit"]'

test.describe('Login Security Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector(EMAIL)
  })

  test('should display login page correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/FieldSafe/i)
    await expect(page.locator(EMAIL)).toBeVisible()
    await expect(page.locator(PASSWORD)).toBeVisible()
    await expect(page.locator(SUBMIT)).toBeVisible()
  })

  test('should reject empty credentials', async ({ page }) => {
    await page.locator(SUBMIT).first().click()
    await expect(
      page.locator('text=Please enter your email and password.')
    ).toBeVisible()
  })

  test('should validate email format', async ({ page }) => {
    await page.fill(EMAIL, 'invalid-email')
    await page.fill(PASSWORD, 'password123')
    await page.locator(SUBMIT).first().click()
    await expect(page).toHaveURL(/\/($|login)/)
  })

  test('should prevent SQL injection attempts', async ({ page }) => {
    const payloads = [
      "'; DROP TABLE staffs; --",
      "' OR '1'='1",
      "admin'--",
      "' UNION SELECT * FROM staffs --",
    ]
    for (const p of payloads) {
      await page.fill(EMAIL, 'test@example.com')
      await page.fill(PASSWORD, p)
      await page.locator(SUBMIT).first().click()
      await expect(page).not.toHaveURL(/dashboard|admin|home/)
      await page.reload()
    }
  })

  test('should prevent XSS attacks', async ({ page }) => {
    const payloads = [
      '<script>alert("xss")</script>',
      '<img src="x" onerror="alert(1)">',
      'javascript:alert("xss")',
      '<svg onload="alert(1)">',
    ]
    for (const p of payloads) {
      let alertTriggered = false
      page.on('dialog', (d) => {
        alertTriggered = true
        d.dismiss()
      })
      await page.fill(EMAIL, 'test@test.com')
      await page.fill(PASSWORD, p)
      await page.locator(SUBMIT).first().click()
      await page.waitForTimeout(800)
      expect(alertTriggered).toBe(false)
      await page.reload()
    }
  })

  test('should test invalid credential combinations', async ({ page }) => {
    for (const cred of INVALID_CREDENTIALS) {
      await page.fill(EMAIL, cred.email)
      await page.fill(PASSWORD, cred.password)
      await page.locator(SUBMIT).first().click()
      await page.waitForTimeout(1000)
      await expect(page).not.toHaveURL(/dashboard|admin|home|group/)
      await page.reload()
    }
  })

  test('should handle network errors gracefully', async ({ page }) => {
    await page.route('**/api/**', (r) => r.abort())
    await page.fill(EMAIL, 'test@example.com')
    await page.fill(PASSWORD, 'password123')
    await page.locator(SUBMIT).first().click()

    // generic login failure message OR generic network error
    try {
      await expect(
        page.locator('text=/Login failed|unexpected error/i')
      ).toBeVisible()
    } catch {
      await expect(
        page.locator('text=/network.*error|connection.*failed|error/i')
      ).toBeVisible()
    }
  })
})
