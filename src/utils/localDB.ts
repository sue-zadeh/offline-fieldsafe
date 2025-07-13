import { openDB } from 'idb'

const DB_NAME = 'FieldSafeDB'
const VOLUNTEER_STORE = 'volunteers'
const ACTIVITY_STORE = 'activities'
const OFFLINE_QUEUE = 'offline-queue'

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

export type Activity = {
  id: number
  activity_name: string
  activity_date: string
  projectName?: string
  projectLocation: string
  status: string
  createdBy?: string
}

export type OfflineItem = {
  id: number
  type: 'volunteer' | 'activity' | 'volunteer_delete'
  data: any
  synced: boolean
  timestamp: number
}

export const getDB = async () => {
  return openDB(DB_NAME, 2, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        db.createObjectStore(OFFLINE_QUEUE, {
          keyPath: 'id',
          autoIncrement: true,
        })
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
  return await db.getAll(VOLUNTEER_STORE)
}

export const cacheActivities = async (activities: Activity[]) => {
  const db = await getDB()
  const tx = db.transaction(ACTIVITY_STORE, 'readwrite')
  const store = tx.objectStore(ACTIVITY_STORE)
  await Promise.all(activities.map((a) => store.put(a)))
  await tx.done
}

export const getCachedActivities = async (): Promise<Activity[]> => {
  const db = await getDB()
  return await db.getAll(ACTIVITY_STORE)
}

export const saveOfflineItem = async (item: Omit<OfflineItem, 'id'>) => {
  const db = await getDB()
  const id = Date.now()
  await db.put(OFFLINE_QUEUE, { ...item, id })
}

export const getSyncedItems = async (): Promise<OfflineItem[]> => {
  const db = await getDB()
  return (await db.getAll(OFFLINE_QUEUE)).filter((item) => item.synced)
}

export const getUnsyncedItems = async (): Promise<OfflineItem[]> => {
  const db = await getDB()
  return (await db.getAll(OFFLINE_QUEUE)).filter((item) => !item.synced)
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
        if (item.type === 'volunteer' || item.type === 'activity') {
          const data = await res.json()
          if (item.type === 'volunteer') {
            await cacheVolunteers([data])
          } else if (item.type === 'activity') {
            await cacheActivities([data])
          }
        }
      }
    } catch (err) {
      console.warn(`❌ Sync failed for ${item.type}:`, err)
    }
  }
}
