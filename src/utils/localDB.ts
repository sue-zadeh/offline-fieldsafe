import { openDB } from 'idb'

export interface OfflineItem {
  id?: number
  type: string
  data: any
  synced?: boolean
  timestamp?: number
}

const DB_NAME = 'FieldSafeDB'
const STORE_NAME = 'offline-data'

// Open database and store
async function getDB() {
  return await openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        })
      }
    },
  })
}

// Save data locally when offline
export async function saveOfflineItem(item: OfflineItem) {
  const db = await getDB()
  await db.add(STORE_NAME, {
    ...item,
    synced: false,
    timestamp: Date.now(),
  })
}

export const queueOffline = saveOfflineItem

// Get all offline items
export async function getSyncedItems(): Promise<OfflineItem[]> {
  const db = await getDB()
  return await db.getAll(STORE_NAME)
}

// Remove item after syncing
export async function deleteOfflineItem(id: number) {
  const db = await getDB()
  await db.delete(STORE_NAME, id)
}

// Sync all unsynced data when back online
export async function replayQueue() {
  const items = await getSyncedItems()
  for (const row of items) {
    try {
      await fetch(`/api/${row.type}s`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(row.data),
      })
      await deleteOfflineItem(row.id!)
      console.log(`✅ Synced ${row.type} [ID: ${row.id}]`)
    } catch (err) {
      console.warn(`❌ Failed to sync ${row.type} [ID: ${row.id}]`, err)
    }
  }
}
