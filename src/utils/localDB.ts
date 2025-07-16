// src/utils/localDB.ts

import { openDB } from 'idb'
import type { User } from '../types/user'

const DB_NAME = 'FieldSafeDB'
const VOLUNTEER_STORE = 'volunteers'
const ACTIVITY_STORE = 'activities'
const OFFLINE_QUEUE = 'offline-queue'

export type OfflineItem = {
  id: number
  type: 'volunteer' | 'activity' | 'volunteer_delete'
  data: any
  synced: boolean
  timestamp: number
}

const EDIT_QUEUE_KEY = 'volunteerEditQueue'

export const getDB = async () => {
  return openDB(DB_NAME, 2, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        db.createObjectStore(OFFLINE_QUEUE, { keyPath: 'id', autoIncrement: true })
        db.createObjectStore(VOLUNTEER_STORE, { keyPath: 'id' })
      }
      if (oldVersion < 2) {
        db.createObjectStore(ACTIVITY_STORE, { keyPath: 'id' })
      }
    },
  })
}

export const cacheVolunteers = async (volunteers: User[]) => {
  const db = await getDB()
  const tx = db.transaction(VOLUNTEER_STORE, 'readwrite')
  const store = tx.objectStore(VOLUNTEER_STORE)
  await Promise.all(volunteers.map((v) => store.put(v)))
  await tx.done
}

export const getCachedVolunteers = async (): Promise<User[]> => {
  const db = await getDB()
  return db.getAll(VOLUNTEER_STORE)
}

export const cacheActivities = async (activities: any[]) => {
  const db = await getDB()
  const tx = db.transaction(ACTIVITY_STORE, 'readwrite')
  const store = tx.objectStore(ACTIVITY_STORE)
  await Promise.all(activities.map((a) => store.put(a)))
  await tx.done
}

export const getCachedActivities = async (): Promise<any[]> => {
  const db = await getDB()
  return db.getAll(ACTIVITY_STORE)
}

export const saveOfflineItem = async (item: Omit<OfflineItem, 'id'>) => {
  const db = await getDB()
  const id = Date.now()
  await db.put(OFFLINE_QUEUE, { ...item, id })
}

export const getUnsyncedItems = async (): Promise<OfflineItem[]> => {
  const db = await getDB()
  return (await db.getAll(OFFLINE_QUEUE)).filter((item) => !item.synced)
}

export const getSyncedItems = async (): Promise<OfflineItem[]> => {
  const db = await getDB()
  return (await db.getAll(OFFLINE_QUEUE)).filter((item) => item.synced)
}

export const removeSyncedItems = async () => {
  const db = await getDB()
  const tx = db.transaction(OFFLINE_QUEUE, 'readwrite')
  const store = tx.objectStore(OFFLINE_QUEUE)
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
  const item = await db.get(OFFLINE_QUEUE, id)
  if (item) {
    await db.put(OFFLINE_QUEUE, { ...item, synced: true })
  }
}

export const deleteOfflineItem = async (id: number) => {
  const db = await getDB()
  await db.delete(OFFLINE_QUEUE, id)
}

// Replays queue on reconnect
export const replayQueue = async () => {
  const unsynced = await getUnsyncedItems()
  for (const item of unsynced) {
    try {
      let endpoint: string
      let method = 'POST'
      if (item.type === 'volunteer') {
        endpoint = '/api/volunteers'
      } else if (item.type === 'activity') {
        endpoint = '/api/activities'
      } else if (item.type === 'volunteer_delete') {
        endpoint = `/api/volunteers/${item.data.id}`
        method = 'DELETE'
      } else {
        continue
      }

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: method === 'POST' ? JSON.stringify(item.data) : undefined,
      })

      if (res.ok) {
        await markItemSynced(item.id)
        if (item.type === 'volunteer') {
          const data = await res.json()
          await cacheVolunteers([data])
        }
        if (item.type === 'activity') {
          const data = await res.json()
          await cacheActivities([data])
        }
      }
    } catch (err) {
      console.warn(`❌ Sync failed for ${item.type}:`, err)
    }
  }
}

// Queue helpers for edit/delete
export const queueVolunteerUpdate = (user: User) => {
  const existing = JSON.parse(localStorage.getItem(EDIT_QUEUE_KEY) || '[]')
  localStorage.setItem(EDIT_QUEUE_KEY, JSON.stringify([...existing, user]))
}

export const getQueuedUpdates = (): User[] => {
  return JSON.parse(localStorage.getItem(EDIT_QUEUE_KEY) || '[]')
}

export const clearQueuedUpdates = () => {
  localStorage.removeItem(EDIT_QUEUE_KEY)
}
