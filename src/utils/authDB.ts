import { openDB } from 'idb'

const DB_NAME = 'AuthDB'
const STORE_NAME = 'credentials'

const getAuthDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'email' })
      }
    },
  })
}

interface OfflineCredential {
  email: string
  password: string
  firstname: string
  lastname: string
  role: string
}

export const saveOfflineCredentials = async (data: OfflineCredential) => {
  const db = await getAuthDB()
  await db.put(STORE_NAME, data)
}

export const getOfflineCredential = async (email: string) => {
  const db = await getAuthDB()
  return await db.get(STORE_NAME, email)
}
