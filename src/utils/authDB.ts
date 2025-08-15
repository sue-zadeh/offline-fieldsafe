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
  createdOffline?: boolean // Mark if created while offline
  timestamp?: number // When created
}

export const saveOfflineCredentials = async (data: OfflineCredential) => {
  const db = await getAuthDB()
  await db.put(STORE_NAME, {
    ...data,
    timestamp: data.timestamp || Date.now()
  })
}

export const getOfflineCredential = async (email: string) => {
  const db = await getAuthDB()
  return await db.get(STORE_NAME, email)
}

// New function: Create offline account
export const createOfflineAccount = async (
  email: string, 
  password: string, 
  firstname: string, 
  lastname: string,
  role: string = 'volunteer'
) => {
  const db = await getAuthDB()
  
  // Check if account already exists
  const existing = await db.get(STORE_NAME, email)
  if (existing) {
    throw new Error('Account already exists')
  }
  
  // Create new offline account
  const newAccount: OfflineCredential = {
    email,
    password,
    firstname,
    lastname,
    role,
    createdOffline: true,
    timestamp: Date.now()
  }
  
  await db.put(STORE_NAME, newAccount)
  return newAccount
}

// Get all offline-created accounts (for admin purposes)
export const getOfflineAccounts = async () => {
  const db = await getAuthDB()
  const tx = db.transaction(STORE_NAME, 'readonly')
  const store = tx.objectStore(STORE_NAME)
  const all = await store.getAll()
  return all.filter(account => account.createdOffline)
}
