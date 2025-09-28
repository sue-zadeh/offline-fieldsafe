import { test, expect } from '@playwright/test'

test.describe('API Security Tests (No Browser)', () => {
  
  test('should validate API endpoints respond correctly', async ({ request }) => {
    // Test API endpoints directly without browser
    const response = await request.get('/api/staff')
    expect(response.status()).toBe(200)
  })

  test('should prevent SQL injection in API', async ({ request }) => {
    const response = await request.post('/api/login', {
      data: {
        email: "admin'; DROP TABLE staff; --",
        password: 'password'
      }
    })
    
    // Should not return success or cause errors
    expect(response.status()).not.toBe(200)
  })
})
