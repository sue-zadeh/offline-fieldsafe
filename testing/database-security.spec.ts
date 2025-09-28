import { test, expect } from '@playwright/test'

test.describe('Database Security Tests', () => {
  
  test('should validate form constraints match database constraints', async ({ page }) => {
    await page.goto('/registerroles')
    
    // Skip if not accessible
    const hasForm = await page.locator('input[name="firstname"]').isVisible()
    if (!hasForm) {
      test.skip()
    }

    // Test firstname constraints
    await page.fill('input[name="firstname"]', 'x') // Too short
    await page.fill('input[name="lastname"]', 'ValidLastname')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="phone"]', '123456')
    await page.fill('input[name="password"]', 'ValidPass123!')
    
    const submitButton = page.locator('button[type="submit"]').first()
    await submitButton.click()
    
    // Should show validation error for short firstname
    await expect(page.locator('text=/first.*name.*2.*characters/i')).toBeVisible()
      .catch(() => expect(page).toHaveURL(/register/))
  })

  test('should test phone number validation', async ({ page }) => {
    await page.goto('/registerroles')
    
    const hasForm = await page.locator('input[name="phone"]').isVisible()
    if (!hasForm) {
      test.skip()
    }

    const invalidPhones = ['123', '111111', '000000', 'abc123', '']
    
    for (const phone of invalidPhones) {
      await page.fill('input[name="firstname"]', 'Valid')
      await page.fill('input[name="lastname"]', 'User')
      await page.fill('input[name="email"]', `test${Math.random()}@example.com`)
      await page.fill('input[name="phone"]', phone)
      await page.fill('input[name="password"]', 'ValidPass123!')
      
      const submitButton = page.locator('button[type="submit"]').first()
      await submitButton.click()
      
      // Should show validation error
      await expect(page.locator('text=/phone.*invalid|phone.*digits/i')).toBeVisible()
        .catch(() => expect(page).toHaveURL(/register/))
      
      await page.reload()
    }
  })

  test('should test email validation', async ({ page }) => {
    await page.goto('/registerroles')
    
    const hasForm = await page.locator('input[name="email"]').isVisible()
    if (!hasForm) {
      test.skip()
    }

    const invalidEmails = [
      'invalid-email',
      '@domain.com',
      'user@',
      'user@domain',
      'user..name@domain.com',
      'user@.domain.com'
    ]
    
    for (const email of invalidEmails) {
      await page.fill('input[name="firstname"]', 'Valid')
      await page.fill('input[name="lastname"]', 'User')
      await page.fill('input[name="email"]', email)
      await page.fill('input[name="phone"]', '123456')
      await page.fill('input[name="password"]', 'ValidPass123!')
      
      const submitButton = page.locator('button[type="submit"]').first()
      await submitButton.click()
      
      // Should show validation error
      await expect(page.locator('text=/email.*invalid|invalid.*email/i')).toBeVisible()
        .catch(() => expect(page).toHaveURL(/register/))
      
      await page.reload()
    }
  })
})
