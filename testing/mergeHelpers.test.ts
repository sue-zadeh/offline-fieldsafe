import { test, expect } from '@playwright/test'

// Mock merge function for testing
function mergeByEmail(online: any[], offline: any[]) {
  const result = [...online]
  
  offline.forEach(offlineItem => {
    const onlineIndex = result.findIndex(onlineItem => onlineItem.email === offlineItem.email)
    if (onlineIndex >= 0) {
      // Merge offline changes into online data
      result[onlineIndex] = { ...result[onlineIndex], ...offlineItem }
    } else {
      // Add new offline item
      result.push(offlineItem)
    }
  })
  
  return result
}

test('should merge offline changes correctly', async () => {
  const online = [
    { id: 1, email: 'test@example.com', firstname: 'A', lastname: 'User' }
  ]
  
  const offline = [
    { id: 1, email: 'test@example.com', firstname: 'A_updated', lastname: 'User' }
  ]

  const result = mergeByEmail(online, offline)
  expect(result[0].firstname).toBe('A_updated')
})
