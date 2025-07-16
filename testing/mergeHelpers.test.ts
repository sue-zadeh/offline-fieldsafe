import { test, expect } from '@playwright/test'
import { mergeByEmail } from '../src/utils/mergeHelpers'
import type { User } from '../src/types/user'

test('should merge offline changes correctly', () => {
  const online: User[] = [
    { id: 1,
       email: 'a@example.com',
       firstname: 'A',
       lastname: '',
       phone: '',
       emergencyContact: '',
       emergencyContactNumber: '',
        role: 'Volunteer'
}
  ]
  const offline: User[] = [
    { id: 1, email: 'a@example.com',
       firstname: 'A_updated',
       lastname: '',
       phone: '',
        emergencyContact: '',
         emergencyContactNumber: '',
          role: 'Volunteer'
}
  ]

  const result = mergeByEmail(online, offline)
  expect(result[0].firstname).toBe('A_updated')
})
