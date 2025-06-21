import { openDB } from 'idb'
import axios from 'axios'

export interface OfflineItem {
  id?: number
  type: string
  data: any
  synced?: boolean
  timestamp?: number
}

const DB_NAME = 'FieldSafeDB'
const DB_VERSION = 1
const STORE_OFFLINE = 'offline-data'
const STORE_SYNCED = 'synced'

export async function getDB() {
  return await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_OFFLINE)) {
        db.createObjectStore(STORE_OFFLINE, {
          keyPath: 'id',
          autoIncrement: true,
        })
      }
      if (!db.objectStoreNames.contains(STORE_SYNCED)) {
        db.createObjectStore(STORE_SYNCED, {
          keyPath: 'id',
        })
      }
    },
  })
}

export async function saveOfflineItem(item: OfflineItem) {
  const db = await getDB()
  await db.add(STORE_OFFLINE, {
    ...item,
    synced: false,
    timestamp: Date.now(),
  })
}

export const queueOffline = saveOfflineItem

export async function getSyncedItems(): Promise<OfflineItem[]> {
  const db = await getDB()
  return await db.getAll(STORE_OFFLINE)
}

export async function replayQueue() {
  const db = await getDB()
  const all = await db.getAll('offline-data')

  for (const item of all) {
    try {
      if (!item.synced) {
        await axios.post('/api/volunteers', item.data)

        // ✅ FIRST move to "synced" store
        await db.put('synced', { ...item, synced: true })

        // ✅ THEN delete from offline-data
        await db.delete('offline-data', item.id)

        console.log('✅ Synced and moved to "synced" store:', item)
      }
    } catch (err) {
      console.warn('⚠️ Sync failed for:', item, err)
    }
  }
}
