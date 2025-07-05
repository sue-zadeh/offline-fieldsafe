import axios from 'axios'
import { openDB } from 'idb'

const DB_NAME = 'FieldSafeDB'
const STORE_NAME = 'offline-data'

export interface OfflineItem {
  type: 'volunteer' | 'activity'
  data: any
  synced: boolean
  timestamp: number
}

// Get DB instance
export const getLocalDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'timestamp' })
      }
    },
  })
}

// Save unsynced item
export const saveOfflineItem = async (item: OfflineItem) => {
  const db = await getLocalDB()
  await db.put(STORE_NAME, item)
}

// Save online-fetched (synced) volunteers
export const saveSyncedItems = async (items: OfflineItem[]) => {
  const db = await getLocalDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  const store = tx.objectStore(STORE_NAME)

  // Clear old synced data first
  const allItems = await store.getAll()
  for (const item of allItems) {
    if (item.synced === true) {
      await store.delete(item.id)
    }
  }

  // Save new synced items
  for (const item of items) {
    await store.put(item)
  }

  await tx.done
}

// Get all
export const getAllItems = async (): Promise<OfflineItem[]> => {
  const db = await getLocalDB()
  return await db.getAll(STORE_NAME)
}

// Get only synced
export const getSyncedItems = async (): Promise<OfflineItem[]> => {
  const all = await getAllItems()
  return all.filter((item) => item.synced)
}

// Get only unsynced
export const getUnsyncedItems = async (): Promise<OfflineItem[]> => {
  const all = await getAllItems()
  return all.filter((item) => !item.synced)
}

// Replay unsynced queue (sync with server)
export const replayQueue = async () => {
  const unsynced = await getUnsyncedItems()
  const db = await getLocalDB()

  for (const item of unsynced) {
    if (item.type === 'volunteer') {
      try {
        await axios.post('/api/volunteers', item.data)
        await db.put(STORE_NAME, {
          ...item,
          synced: true,
          timestamp: item.timestamp,
        })
        console.log('✅ Synced volunteer:', item.data.email)
      } catch (err) {
        console.warn('⚠️ Failed to sync volunteer:', item.data.email)
      }
    }
  }
}

// Clear all data (used for debug or reset)
export const clearOfflineData = async () => {
  const db = await getLocalDB()
  await db.clear(STORE_NAME)
  console.log('✅ Cleared all offline data')
}

// Delete single item by timestamp
export const deleteOfflineItem = async (timestamp: number) => {
  const db = await getLocalDB()
  await db.delete(STORE_NAME, timestamp)
  console.log(`✅ Deleted offline item with timestamp: ${timestamp}`)
}

// Helpers
export const getOfflineVolunteers = async (): Promise<any[]> => {
  const db = await getLocalDB()
  const allItems = await db.getAll(STORE_NAME)
  return allItems
    .filter((item) => item.type === 'volunteer')
    .map((item) => item.data)
}

export const getOfflineActivities = async (): Promise<any[]> => {
  const db = await getLocalDB()
  const allItems = await db.getAll(STORE_NAME)
  return allItems
    .filter((item) => item.type === 'activity')
    .map((item) => item.data)
}
export const getOfflineItemByTimestamp = async (
  timestamp: number
): Promise<OfflineItem | undefined> => {
  const db = await getLocalDB()
  return await db.get(STORE_NAME, timestamp)
}
const DELETE_STORE_NAME = 'deleteQueue'

const getDeleteDB = () =>
  openDB('DeleteDB', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(DELETE_STORE_NAME)) {
        db.createObjectStore(DELETE_STORE_NAME, { keyPath: 'id' })
      }
    },
  })

export const queueDelete = async (id: number) => {
  const db = await getDeleteDB()
  await db.put(DELETE_STORE_NAME, { id })
}

export const getQueuedDeletes = async () => {
  const db = await getDeleteDB()
  return await db.getAll(DELETE_STORE_NAME)
}
export const deleteQueuedItem = async (id: number) => {
  const db = await getDeleteDB()
  await db.delete('deleteQueue', id)
}
