import { openDB } from 'idb'

const DB_NAME = 'AuthDB'
const STORE_NAME = 'credentials'

export const getAuthDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'email' })
      }
    },
  })
}


export const saveOfflineCredentials = async (
  email: string,
  password: string
) => {
  const db = await getAuthDB()
  await db.put(STORE_NAME, { email, password })
}

export const getOfflineCredential = async (email: string) => {
  const db = await getAuthDB()
  return await db.get(STORE_NAME, email)
}
