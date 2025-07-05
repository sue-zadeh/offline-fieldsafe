import type { User } from '../types/user'

export function mergeByEmail(online: User[], offline: User[]): User[] {
  const emailMap = new Map<string, User>()

  // Prioritize online data (assuming it's most updated)
  for (const user of online) {
    const key = user.email.trim().toLowerCase()
    emailMap.set(key, user)
  }

  for (const user of offline) {
    const key = user.email.trim().toLowerCase()
    // Only add offline user if not already present
    if (!emailMap.has(key)) {
      emailMap.set(key, user)
    }
  }

  return Array.from(emailMap.values())
}
