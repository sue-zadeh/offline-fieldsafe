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

//==== activity pages
export function mergeByKey(
  online: any[],
  offline: any[],
  key: string = 'id'
): any[] {
  const mergedMap = new Map<string, any>()

  for (const item of online) {
    mergedMap.set(item[key], item)
  }

  for (const item of offline) {
    mergedMap.set(item[key], item) // offline item replaces online if key matches
  }

  return Array.from(mergedMap.values())
}
