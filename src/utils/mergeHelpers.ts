// src/utils/mergeHelpers.ts

import type { User } from '../types/user'

export function mergeByEmail(online: User[], offline: User[]): User[] {
  const emailMap = new Map<string, User>()

  // Prefer online copy first
  for (const user of online) {
    const key = user.email.trim().toLowerCase()
    emailMap.set(key, user)
  }

  // Add offline if not present
  for (const user of offline) {
    const key = user.email.trim().toLowerCase()
    if (!emailMap.has(key)) {
      emailMap.set(key, user)
    }
  }

  return Array.from(emailMap.values())
}
