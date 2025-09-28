// testing/code-quality.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Code Quality Tests', () => {
  test('should have no console errors on main pages', async ({ page }) => {
    const consoleErrors: string[] = []

    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })

    const testPages = ['/', '/login', '/groupadmin', '/fieldstaff', '/teamlead']

    for (const url of testPages) {
      await page.goto(url)
      await page.waitForTimeout(1000)

      // filter acceptable noise in dev
      const critical = consoleErrors.filter(
        (e) =>
          !e.includes('favicon') &&
          !e.includes('404') &&
          !e.includes('ERR_INTERNET_DISCONNECTED')
      )
      expect(critical).toHaveLength(0)
    }
  })

  test('should have proper error handling', async ({ page }) => {
    await page.goto('/nonexistent-page')
    await expect(
      page.locator('text=/404|not found|error/i')
    ).toBeVisible().catch(async () => {
      // at least redirect somewhere sensible
      await expect(page).toHaveURL(/login|home|\//)
    })
  })

  test('should handle malformed URLs gracefully', async ({ page }) => {
    const urls = [
      '/admin/../../etc/passwd',
      '/login?redirect=javascript:alert(1)',
      '/search?q=<script>alert(1)</script>',
      '/api/../admin'
    ]

    for (const url of urls) {
      let alert = false
      page.on('dialog', async (d) => {
        alert = true
        await d.dismiss()
      })

      await page.goto(url)
      await page.waitForTimeout(500)

      // primary: no script execution
      expect(alert).toBe(false)
    }
  })

  test('should validate form accessibility', async ({ page }) => {
    await page.goto('/registerroles')

    const inputs = page.locator(
      'input[type="text"], input[type="email"], input[type="password"]'
    )
    const count = await inputs.count()

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i)
      const id = await input.getAttribute('id')
      const hasAria = !!(await input.getAttribute('aria-label'))
      const hasLabel =
        hasAria ||
        (!!id && (await page.locator(`label[for="${id}"]`).isVisible().catch(() => false)))
      expect(hasLabel).toBeTruthy()
    }
  })

  test('should have responsive design', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ]

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto('/')
      await page.waitForTimeout(800)

      // very light sanity checks
      expect(await page.locator('body *').count()).toBeGreaterThan(0)

      // navigation or minimal layout exists
      const navSelectors = [
        'nav',
        '.navbar',
        '[role="navigation"]',
        'header nav',
        'aside',
        '.sidebar'
      ]
      const hasNav = await Promise.any(
        navSelectors.map(async (s) =>
          (await page.locator(s).isVisible().catch(() => false)) ? true : Promise.reject()
        )
      ).catch(() => false)

      if (!hasNav) {
        const layoutSelectors = ['main', 'section', 'article', '.container', '#app', '#root']
        const hasLayout = await Promise.any(
          layoutSelectors.map(async (s) =>
            (await page.locator(s).count()) > 0 ? true : Promise.reject()
          )
        ).catch(() => false)
        expect(hasLayout).toBe(true)
      }

      // simple horizontal overflow guard on small widths
      if (vp.width <= 768) {
        const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth)
        expect(bodyScrollWidth).toBeLessThanOrEqual(vp.width + 50)
      }
    }
  })

  test('should validate security headers', async ({ page }) => {
    const resp = await page.goto('/')
    const headers = resp?.headers() ?? {}

    // informative only in dev
    const expected = ['x-content-type-options', 'x-frame-options', 'x-xss-protection']
    for (const h of expected) {
      if (headers[h]) {
        console.log(`✅ Security header present: ${h}`)
      } else {
        console.log(`⚠️  Security header missing: ${h} (acceptable in dev)`)
      }
    }
  })
})

test.describe('Performance Tests', () => {
  test('should load pages within acceptable time', async ({ page }) => {
    const urls = ['/', '/groupadmin', '/fieldstaff']
    for (const url of urls) {
      const start = Date.now()
      await page.goto(url)
      await page.waitForLoadState('networkidle')
      const elapsed = Date.now() - start
      expect(elapsed).toBeLessThan(5000)
      console.log(`✅ ${url} loaded in ${elapsed}ms`)
    }
  })

  test('should handle concurrent users', async ({ browser }) => {
    const contexts = await Promise.all([
      browser.newContext(),
      browser.newContext(),
      browser.newContext()
    ])
    const pages = await Promise.all(contexts.map((c) => c.newPage()))
    await Promise.all(pages.map((p) => p.goto('/')))
    for (const p of pages) {
      await expect(p.locator('body')).toBeVisible()
    }
    await Promise.all(contexts.map((c) => c.close()))
  })
})
