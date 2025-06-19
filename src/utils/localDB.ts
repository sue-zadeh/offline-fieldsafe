// src/utils/localDB.ts
import { openDB, DBSchema } from 'idb'

/* ------------------------------------------------------------------ */
/* 1  Constants                                                        */
/* ------------------------------------------------------------------ */
export const STORE_NAME = 'offline-data'
const DB_NAME = 'FieldSafe'
const DB_VERSION = 2 // bump to trigger upgrade()

/* ------------------------------------------------------------------ */
/* 2  Value type stored in IndexedDB                                   */
/* ------------------------------------------------------------------ */
export interface OfflineItem {
  id?: number
  type: string // e.g. 'volunteer'
  data: any
  synced: number // 0 = not yet synced, 1 = synced
  timestamp: number
}

/* ------------------------------------------------------------------ */
/* 3  DBSchema (TypeScript only)                                       */
/* ------------------------------------------------------------------ */
interface FieldSafeDB extends DBSchema {
  'offline-data': {
    key: number
    value: OfflineItem
    indexes: { synced: number } // index key is a number
  }
}

/* ------------------------------------------------------------------ */
/* 4  Open / upgrade the database                                      */
/* ------------------------------------------------------------------ */
function getDB() {
  return openDB<FieldSafeDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        })
        store.createIndex('synced', 'synced')
      } else {
        const store = db
          .transaction(STORE_NAME, 'versionchange')
          .objectStore(STORE_NAME)
        if (!store.indexNames.contains('synced')) {
          store.createIndex('synced', 'synced')
        }
      }
    },
  })
}

/* ------------------------------------------------------------------ */
/* 5  Helpers                                                          */
/* ------------------------------------------------------------------ */

/** Save a form submission while offline */
export async function saveOfflineItem(
  item: Omit<OfflineItem, 'id' | 'synced' | 'timestamp'>
) {
  const db = await getDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  await tx.store.add({
    ...item,
    synced: 0, // 0 ⇒ not yet synced
    timestamp: Date.now(),
  })
  await tx.done
}

/** Get everything that still needs to be pushed */
export async function getSyncedItems(): Promise<OfflineItem[]> {
  const db = await getDB()
  const tx = db.transaction(STORE_NAME, 'readonly')
  return tx.store.index('synced').getAll(0) // 0 ⇒ unsynced
}

/** Delete items once they’ve been successfully pushed */
export async function clearSyncedItems(): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  for (
    let cur = await tx.store.index('synced').openCursor(0);
    cur;
    cur = await cur.continue()
  ) {
    await cur.delete()
  }
  await tx.done
}
