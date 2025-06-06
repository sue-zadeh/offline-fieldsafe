// src/utils/localDB.ts
import { openDB } from 'idb';

const DB_NAME = 'FieldSafeDB';
const STORE_NAME = 'offline-data';

export async function getDB() {
  return await openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    }
  });
}

export async function saveOfflineItem(data: any) {
  const db = await getDB();
  await db.add(STORE_NAME, { ...data, synced: false, timestamp: Date.now() });
}

export async function getUnsyncedItems() {
  const db = await getDB();
  return await db.getAllFromIndex(STORE_NAME, 'id');
}

export async function clearSyncedItems() {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const allItems = await store.getAll();

  for (const item of allItems) {
    if (item.synced) {
      store.delete(item.id);
    }
  }

  await tx.done;
}
