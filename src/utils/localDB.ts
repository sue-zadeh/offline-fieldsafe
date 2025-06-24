// src/utils/localDB.ts

import { openDB } from 'idb'

const DB_NAME = 'FieldSafeDB'
const STORE_NAME = 'offline-data'

// Define Role and User types
export type Role = 'Volunteer'

export type User = {
  id: number
  firstname: string
  lastname: string
  email: string
  phone: string
  emergencyContact: string
  emergencyContactNumber: string
  role: Role
}

export type OfflineItem = {
  id: number
  type: string
  data: any
  synced: boolean
  timestamp: number
}

export const getDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
      }
    },
  })
}

export const saveOfflineItem = async (item: Omit<OfflineItem, 'id'>) => {
  const db = await getDB()
  const id = Date.now()
  await db.put(STORE_NAME, { ...item, id })
}

export const getSyncedItems = async (): Promise<OfflineItem[]> => {
  const db = await getDB()
  return (await db.getAll(STORE_NAME)).filter((item) => item.synced)
}

export const getUnsyncedItems = async (): Promise<OfflineItem[]> => {
  const db = await getDB()
  return (await db.getAll(STORE_NAME)).filter((item) => !item.synced)
}

export const removeSyncedItems = async () => {
  const db = await getDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  const store = tx.objectStore(STORE_NAME)
  const all = await store.getAll()
  for (const item of all) {
    if (item.synced) {
      await store.delete(item.id)
    }
  }
  await tx.done
}

export const markItemSynced = async (id: number) => {
  const db = await getDB()
  const item = await db.get(STORE_NAME, id)
  if (item) {
    await db.put(STORE_NAME, { ...item, synced: true })
  }
}

export const deleteOfflineItem = async (id: number) => {
  const db = await getDB()
  await db.delete(STORE_NAME, id)
}

export const replayQueue = async () => {
  const unsynced = await getUnsyncedItems()

  for (const item of unsynced) {
    try {
      const res = await fetch('/api/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.data),
      })
      if (res.ok) {
        await markItemSynced(item.id)
      }
    } catch (err) {
      console.warn('❌ Sync failed:', err)
    }
  }
}
