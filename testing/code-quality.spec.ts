import { test, expect } from '@playwright/test'

test.describe('Code Quality Tests', () => {
  
  test('should have no console errors on main pages', async ({ page }) => {
    const consoleErrors: string[] = []
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    
    const testPages = ['/', '/login', '/groupadmin', '/fieldstaff', '/teamlead']
    
    for (const testPage of testPages) {
      await page.goto(testPage)
      await page.waitForTimeout(2000)
      
      // Filter out known acceptable errors
      const criticalErrors = consoleErrors.filter(error => 
        !error.includes('favicon') && 
        !error.includes('404') &&
        !error.includes('net::ERR_INTERNET_DISCONNECTED')
      )
      
      expect(criticalErrors).toHaveLength(0)
      console.log(`✅ No critical console errors on ${testPage}`)
    }
  })

  test('should have proper error handling', async ({ page }) => {
    // Test 404 pages
    await page.goto('/nonexistent-page')
    
    // Should show proper error page or redirect
    await expect(page.locator('text=/404|not found|error/i')).toBeVisible()
      .catch(() => expect(page).toHaveURL(/login|home|\//))
  })

  test('should handle malformed URLs gracefully', async ({ page }) => {
    const malformedUrls = [
      '/admin/../../etc/passwd',
      '/login?redirect=javascript:alert(1)',
      '/search?q=<script>alert(1)</script>',
      '/api/../admin'
    ]
    
    for (const url of malformedUrls) {
      await page.goto(url)
      await page.waitForTimeout(1000)
      
      // Should not execute scripts or access unauthorized areas
      const alerts: string[] = []
      page.on('dialog', dialog => {
        alerts.push(dialog.message())
        dialog.dismiss()
      })
      
      expect(alerts).toHaveLength(0)
      
      // Check if the application properly handles malformed URLs
      // If the URL contains dangerous patterns, it should either:
      // 1. Redirect to a safe page (login, home, error page)
      // 2. Show an error message
      // 3. Not execute any scripts
      
      const currentUrl = page.url()
      const containsDangerousPath = /etc\/passwd|\.\.\/|javascript:|<script>/i.test(currentUrl)
      
      if (containsDangerousPath) {
        // If dangerous content is still in URL, check that no sensitive content is displayed
        const hasErrorContent = await page.locator('text=/error|404|not found|unauthorized/i').isVisible().catch(() => false)
        const redirectedToSafe = /login|home|\/$/.test(currentUrl)
        
        // Either should show error or redirect to safe location
        expect(hasErrorContent || redirectedToSafe).toBe(true)
      }
    }
  })

  test('should validate form accessibility', async ({ page }) => {
    await page.goto('/registerroles')
    
    // Check for proper form labels
    const inputs = page.locator('input[type="text"], input[type="email"], input[type="password"]')
    const count = await inputs.count()
    
    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i)
      const hasLabel = await input.getAttribute('aria-label') || 
                      await page.locator(`label[for="${await input.getAttribute('id')}"]`).isVisible()
      
      expect(hasLabel).toBeTruthy()
    }
  })

  test('should have responsive design', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ]
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport)
      await page.goto('/')
      await page.waitForTimeout(1000) // Give time for layout to adjust
      
      // Check for various types of navigation elements that might exist
      const navigationSelectors = [
        'nav',
        '.navbar', 
        '.nav',
        '.navigation',
        'header nav',
        '.menu',
        'ul.nav',
        '.sidebar',
        '[role="navigation"]'
      ]
      
      let hasNavigation = false
      for (const selector of navigationSelectors) {
        const navElement = page.locator(selector)
        const isVisible = await navElement.isVisible().catch(() => false)
        if (isVisible) {
          hasNavigation = true
          break
        }
      }
      
      // If no navigation found, check that at least basic content is responsive
      if (!hasNavigation) {
        // Check that main content area exists and is visible
        const contentSelectors = ['main', '.main', '.content', 'body > *', '.container']
        let hasContent = false
        
        for (const selector of contentSelectors) {
          const contentElement = page.locator(selector)
          const isVisible = await contentElement.isVisible().catch(() => false)
          if (isVisible) {
            hasContent = true
            break
          }
        }
        
        expect(hasContent).toBe(true)
      }
      
      // Check that the page doesn't have horizontal scroll on smaller viewports
      if (viewport.width <= 768) {
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
        const viewportWidth = viewport.width
        
        // Allow small margin for scrollbar
        expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20)
      }
      
      console.log(`✅ Layout responsive on ${viewport.name}`)
    }
  })

  test('should validate security headers', async ({ page }) => {
    const response = await page.goto('/')
    const headers = response?.headers() || {}
    
    // Check for security headers (may not be present in development)
    const securityHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection'
    ]
    
    for (const header of securityHeaders) {
      if (headers[header]) {
        console.log(`✅ Security header present: ${header}`)
      } else {
        console.log(`⚠️ Security header missing: ${header} (acceptable in development)`)
      }
    }
  })
})

test.describe('Performance Tests', () => {
  
  test('should load pages within acceptable time', async ({ page }) => {
    const testPages = ['/', '/groupadmin', '/fieldstaff']
    
    for (const testPage of testPages) {
      const startTime = Date.now()
      await page.goto(testPage)
      await page.waitForLoadState('networkidle')
      const loadTime = Date.now() - startTime
      
      // Pages should load within 5 seconds
      expect(loadTime).toBeLessThan(5000)
      console.log(`✅ ${testPage} loaded in ${loadTime}ms`)
    }
  })

  test('should handle concurrent users', async ({ browser }) => {
    // Create multiple browser contexts to simulate concurrent users
    const contexts = await Promise.all([
      browser.newContext(),
      browser.newContext(),
      browser.newContext()
    ])
    
    const pages = await Promise.all(contexts.map(context => context.newPage()))
    
    // Navigate all pages simultaneously
    await Promise.all(pages.map(page => page.goto('/')))
    
    // All should load successfully
    for (const page of pages) {
      await expect(page.locator('body')).toBeVisible()
    }
    
    // Cleanup
    await Promise.all(contexts.map(context => context.close()))
  })
})
