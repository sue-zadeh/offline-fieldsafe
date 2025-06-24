// src/utils/mergeHelpers.ts

// import { OfflineItem } from './localDB'

export interface MergeUser {
  email: string
  [key: string]: any
}

/**
 * Merges online + offline users by email.
 * Keeps all online users and also includes unsynced offline entries (even if email matches).
 */
export function mergeByEmail<T extends MergeUser>(
  online: T[],
  offline: T[]
): T[] {
  const onlineMap = new Map<string, T>()
  const result: T[] = []

  // Add online users to the map
  for (const user of online) {
    if (user.email) {
      onlineMap.set(user.email, user)
    }
  }

  // Add offline users that are unsynced or not present online
  for (const offUser of offline) {
    const existsOnline = onlineMap.has(offUser.email)
    const isUnsynced = !(offUser as any).synced

    if (!existsOnline || isUnsynced) {
      result.push(offUser)
    }
  }

  return [...online, ...result]
}
