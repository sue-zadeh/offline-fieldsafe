// src/utils/localDB.ts

import { openDB } from 'idb'
import type { User } from '../types/user'

const DB_NAME = 'FieldSafeDB'
const DB_VERSION = 5  // Incremented for new stores

const VOLUNTEER_STORE = 'volunteers'
const ACTIVITY_STORE = 'activities'
const PROJECT_STORE = 'projects'
const STAFF_STORE = 'staff'
const RISK_STORE = 'risks'
const HAZARD_STORE = 'hazards'
const CHECKLIST_STORE = 'checklists'
const RISK_CONTROLS_STORE = 'riskControls'
const RISK_CONTROLS_FOR_TITLE_STORE = 'riskControlsForTitle'
const OFFLINE_QUEUE = 'offline-queue'
const OFFLINE_DATA = 'offline-data'
const SYNCED_DATA = 'synced-data'
const EDIT_QUEUE_KEY = 'volunteerEditQueue'

export type OfflineItem = {
  id: number
  type: 'volunteer' | 'activity' | 'volunteer_delete' | 'activity_volunteer_assignment' | 'activity_staff_assignment' | 'activity_risk' | 'activity_hazard' | 'activity_checklist_assignment' | 'activity_checklist_notes' | 'activity_complete' | 'activity_objective_update' | 'activity_objective_create' | 'activity_predator'
  data: any
  synced: boolean
  timestamp: number
}

export const getDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(OFFLINE_QUEUE)) {
        db.createObjectStore(OFFLINE_QUEUE, {
          keyPath: 'id',
          autoIncrement: true,
        })
      }
      if (!db.objectStoreNames.contains(VOLUNTEER_STORE)) {
        db.createObjectStore(VOLUNTEER_STORE, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(ACTIVITY_STORE)) {
        db.createObjectStore(ACTIVITY_STORE, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(PROJECT_STORE)) {
        db.createObjectStore(PROJECT_STORE, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(STAFF_STORE)) {
        db.createObjectStore(STAFF_STORE, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(RISK_STORE)) {
        db.createObjectStore(RISK_STORE, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(HAZARD_STORE)) {
        db.createObjectStore(HAZARD_STORE, { keyPath: 'id' })
      }

      if (!db.objectStoreNames.contains(CHECKLIST_STORE)) {
        db.createObjectStore(CHECKLIST_STORE, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(RISK_CONTROLS_STORE)) {
        db.createObjectStore(RISK_CONTROLS_STORE, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(RISK_CONTROLS_FOR_TITLE_STORE)) {
        db.createObjectStore(RISK_CONTROLS_FOR_TITLE_STORE, { keyPath: 'riskTitleId' })
      }
      if (!db.objectStoreNames.contains(OFFLINE_DATA)) {
        db.createObjectStore(OFFLINE_DATA, { keyPath: 'timestamp' })
      }
      if (!db.objectStoreNames.contains(SYNCED_DATA)) {
        db.createObjectStore(SYNCED_DATA, { keyPath: 'timestamp' })
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

export async function cacheActivities(activities: any[]) {
  const db = await getDB()
  const tx = db.transaction(ACTIVITY_STORE, 'readwrite')
  const store = tx.objectStore(ACTIVITY_STORE)
  await store.clear()
  for (const activity of activities) {
    await store.put(activity)
  }
  await tx.done
}

export async function getCachedActivities() {
  const db = await getDB()
  const tx = db.transaction(ACTIVITY_STORE, 'readonly')
  const store = tx.objectStore(ACTIVITY_STORE)
  return await store.getAll()
}

export async function getOfflineItem(type: string, id: string | number) {
  const db = await getDB()
  if (type === 'activity') {
    const tx = db.transaction(ACTIVITY_STORE, 'readonly')
    const store = tx.objectStore(ACTIVITY_STORE)
    return await store.get(Number(id))
  }
  return null
}

export async function getAllOfflineItems(type: string) {
  const db = await getDB()
  if (type === 'activity') {
    const tx = db.transaction(ACTIVITY_STORE, 'readonly')
    const store = tx.objectStore(ACTIVITY_STORE)
    return await store.getAll()
  }
  return []
}

export const saveOfflineItem = async (item: Omit<OfflineItem, 'id'>) => {
  const db = await getDB()
  const id = Date.now()
  const offlineItem = { ...item, id }
  
  // Save to offline queue
  await db.put(OFFLINE_QUEUE, offlineItem)
  
  // IMPORTANT: Also store activities directly in the activity store for immediate retrieval
  if (item.type === 'activity' && item.data) {
    const activityData = {
      ...item.data,
      id: item.data.id || id, // Use provided ID or generate one
      offline: true,
      timestamp: Date.now()
    }
    
    // Store in activity store so getCachedActivity can find it
    const activityTx = db.transaction(ACTIVITY_STORE, 'readwrite')
    const activityStore = activityTx.objectStore(ACTIVITY_STORE)
    await activityStore.put(activityData)
    await activityTx.done
    
    // Also store in localStorage as backup
    localStorage.setItem(`offline_activity_${activityData.id}`, JSON.stringify(activityData))
    
    console.log('📝 Stored offline activity:', activityData.id, activityData)
  }
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
      } else if (item.type === 'activity_volunteer_assignment') {
        endpoint = '/api/activity_volunteer'
      } else if (item.type === 'activity_staff_assignment') {
        endpoint = '/api/activity_staff'
      } else if (item.type === 'activity_risk') {
        endpoint = '/api/activity_risks'
      } else if (item.type === 'activity_hazard') {
        if (item.data.hazard_type === 'site') {
          endpoint = '/api/activity_site_hazards'
          item.data.site_hazard_id = item.data.hazard_id
          delete item.data.hazard_id
          delete item.data.hazard_type
        } else {
          endpoint = '/api/activity_activity_people_hazards'
          item.data.activity_people_hazard_id = item.data.hazard_id
          delete item.data.hazard_id
          delete item.data.hazard_type
        }
      } else if (item.type === 'activity_checklist_assignment') {
        endpoint = '/api/activity_checklist'
      } else if (item.type === 'activity_checklist_notes') {
        endpoint = '/api/activity_checklist/notes'
      } else if (item.type === 'activity_complete') {
        endpoint = '/api/activities/complete'
      } else if (item.type === 'activity_objective_update') {
        endpoint = `/api/activity_objectives/${item.data.activity_objective_id}`
        method = 'PUT'
      } else if (item.type === 'activity_predator') {
        endpoint = '/api/activity_predator'
      } else {
        continue
      }

      // For offline activities, clean up the data before syncing
      let dataToSync = { ...item.data }
      if (item.type === 'activity') {
        // Remove offline-specific fields
        delete dataToSync.offline
        delete dataToSync.created_offline
        delete dataToSync.timestamp
        // Remove temporary ID for new activities
        if (dataToSync.id && dataToSync.id > 1000000000000) { // Timestamp-based ID
          delete dataToSync.id
        }
      }

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: method !== 'DELETE' ? JSON.stringify(dataToSync) : undefined,
      })

      if (res.ok) {
        await markItemSynced(item.id)
        
        if (item.type === 'volunteer') {
          const data = await res.json()
          await cacheVolunteers([data])
        }
        if (item.type === 'activity') {
          const data = await res.json()
          console.log('✅ Activity synced successfully, updating cache:', data)
          
          // Update the activity store with the server response
          await cacheActivity(data)
          
          // Remove the old offline activity if it had a temporary ID
          if (item.data.id && item.data.id > 1000000000000) {
            const db = await getDB()
            const tx = db.transaction(ACTIVITY_STORE, 'readwrite')
            const store = tx.objectStore(ACTIVITY_STORE)
            await store.delete(item.data.id)
            await tx.done
            console.log('🧹 Removed temporary offline activity:', item.data.id)
          }
        }
        console.log(`✅ Synced ${item.type} item`)
      } else {
        console.warn(`❌ Failed to sync ${item.type} item: ${res.status}`)
      }
    } catch (err) {
      console.warn(`❌ Sync failed for ${item.type}:`, err)
    }
  }
}

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

export async function cacheActivity(activity: any) {
  const db = await getDB()
  const tx = db.transaction(ACTIVITY_STORE, 'readwrite')
  const store = tx.objectStore(ACTIVITY_STORE)
  await store.put(activity)
  await tx.done
}

export async function getCachedActivity(activityId: number) {
  console.log('🔍 Looking for cached activity:', activityId)
  
  const db = await getDB()
  const tx = db.transaction(ACTIVITY_STORE, 'readonly')
  const store = tx.objectStore(ACTIVITY_STORE)
  
  // Try to get from IndexedDB first
  let activity = await store.get(activityId)
  if (activity) {
    console.log('✅ Found activity in IndexedDB:', activity)
    return activity
  }
  
  // Try string version of ID
  activity = await store.get(String(activityId))
  if (activity) {
    console.log('✅ Found activity in IndexedDB (string ID):', activity)
    return activity
  }
  
  // Try localStorage backup
  const localStorageKeys = [
    `offline_activity_${activityId}`,
    `activity_${activityId}`,
    `pendingActivity_${activityId}`,
    `newActivity_${activityId}`
  ]
  
  for (const key of localStorageKeys) {
    try {
      const stored = localStorage.getItem(key)
      if (stored) {
        const parsed = JSON.parse(stored)
        console.log('✅ Found activity in localStorage:', key, parsed)
        return parsed
      }
    } catch (e) {
      console.warn('⚠️ Failed to parse localStorage key:', key)
    }
  }
  
  // Search through all activities in the store
  const allActivities = await store.getAll()
  for (const act of allActivities) {
    if (act.id == activityId || act.id == String(activityId)) {
      console.log('✅ Found activity by searching all:', act)
      return act
    }
  }
  
  // Last resort: check offline queue
  try {
    const queueTx = db.transaction(OFFLINE_QUEUE, 'readonly')
    const queueStore = queueTx.objectStore(OFFLINE_QUEUE)
    const allItems = await queueStore.getAll()
    
    for (const item of allItems) {
      if (item.type === 'activity' && item.data && (item.data.id == activityId || item.data.id == String(activityId))) {
        console.log('✅ Found activity in offline queue:', item.data)
        return item.data
      }
    }
  } catch (e) {
    console.warn('⚠️ Failed to search offline queue:', e)
  }
  
  console.log('❌ Activity not found anywhere:', activityId)
  return null
}

// Add a new function to ensure offline activities are properly stored
export async function storeOfflineActivity(activityData: any) {
  console.log('💾 Storing offline activity:', activityData)
  
  const db = await getDB()
  const activityId = activityData.id || Date.now()
  
  const completeActivity = {
    ...activityData,
    id: activityId,
    offline: true,
    created_offline: true,
    timestamp: Date.now()
  }
  
  // Store in activity store
  const tx = db.transaction(ACTIVITY_STORE, 'readwrite')
  const store = tx.objectStore(ACTIVITY_STORE)
  await store.put(completeActivity)
  await tx.done
  
  // Store in localStorage as backup
  localStorage.setItem(`offline_activity_${activityId}`, JSON.stringify(completeActivity))
  
  // Also add to offline queue for syncing
  await saveOfflineItem({
    type: 'activity',
    data: completeActivity,
    synced: false,
    timestamp: Date.now()
  })
  
  console.log('✅ Offline activity stored successfully:', activityId)
  return completeActivity
}

export async function cacheProjects(projects: any[]) {
  const db = await getDB()
  const tx = db.transaction(PROJECT_STORE, 'readwrite')
  const store = tx.objectStore(PROJECT_STORE)
  await store.clear()
  for (const project of projects) {
    await store.put(project)
  }
  await tx.done
}

export async function getCachedProjects() {
  const db = await getDB()
  const tx = db.transaction(PROJECT_STORE, 'readonly')
  const store = tx.objectStore(PROJECT_STORE)
  return await store.getAll()
}

// Staff caching functions
export async function cacheStaff(staff: any[]) {
  const db = await getDB()
  const tx = db.transaction(STAFF_STORE, 'readwrite')
  const store = tx.objectStore(STAFF_STORE)
  await store.clear()
  for (const person of staff) {
    await store.put(person)
  }
  await tx.done
}

export async function getCachedStaff() {
  const db = await getDB()
  const tx = db.transaction(STAFF_STORE, 'readonly')
  const store = tx.objectStore(STAFF_STORE)
  return await store.getAll()
}

// Risk caching functions
export async function cacheRisks(risks: any[]) {
  const db = await getDB()
  const tx = db.transaction(RISK_STORE, 'readwrite')
  const store = tx.objectStore(RISK_STORE)
  await store.clear()
  for (const risk of risks) {
    await store.put(risk)
  }
  await tx.done
}

export async function getCachedRisks() {
  const db = await getDB()
  const tx = db.transaction(RISK_STORE, 'readonly')
  const store = tx.objectStore(RISK_STORE)
  return await store.getAll()
}

// Hazard caching functions  
export async function cacheHazards(hazards: any[]) {
  const db = await getDB()
  const tx = db.transaction(HAZARD_STORE, 'readwrite')
  const store = tx.objectStore(HAZARD_STORE)
  await store.clear()
  for (const hazard of hazards) {
    await store.put(hazard)
  }
  await tx.done
}

export async function getCachedHazards() {
  const db = await getDB()
  const tx = db.transaction(HAZARD_STORE, 'readonly')
  const store = tx.objectStore(HAZARD_STORE)
  return await store.getAll()
}

// Checklist caching functions  
export async function cacheChecklists(checklists: any[]) {
  const db = await getDB()
  const tx = db.transaction(CHECKLIST_STORE, 'readwrite')
  const store = tx.objectStore(CHECKLIST_STORE)
  await store.clear()
  for (const checklist of checklists) {
    await store.put(checklist)
  }
  await tx.done
}

export async function getCachedChecklists() {
  const db = await getDB()
  const tx = db.transaction(CHECKLIST_STORE, 'readonly')
  const store = tx.objectStore(CHECKLIST_STORE)
  return await store.getAll()
}

// Offline activity data management
export async function storeOfflineActivityData(activityId: number, dataType: string, data: any[]) {
  const db = await getDB()
  const tx = db.transaction(OFFLINE_DATA, 'readwrite')
  const store = tx.objectStore(OFFLINE_DATA)
  const key = `activity_${activityId}_${dataType}`
  await store.put({
    timestamp: key,
    data: data,
    activityId: activityId,
    type: dataType
  })
  await tx.done
}

export async function getOfflineActivityData(activityId: number, dataType: string) {
  const db = await getDB()
  const tx = db.transaction(OFFLINE_DATA, 'readonly')
  const store = tx.objectStore(OFFLINE_DATA)
  const key = `activity_${activityId}_${dataType}`
  const result = await store.get(key)
  return result ? result.data : []
}

// Cache server data for activity assignments (for offline viewing of historical data)
export async function cacheActivityAssignments(activityId: number, dataType: string, data: any[]) {
  const db = await getDB()
  const tx = db.transaction(SYNCED_DATA, 'readwrite')
  const store = tx.objectStore(SYNCED_DATA)
  const key = `activity_${activityId}_${dataType}_cached`
  await store.put({
    timestamp: key,
    data: data,
    activityId: activityId,
    type: dataType,
    cached: true,
    lastUpdated: Date.now()
  })
  await tx.done
}

// Get cached server data for activity assignments
export async function getCachedActivityAssignments(activityId: number, dataType: string) {
  const db = await getDB()
  const tx = db.transaction(SYNCED_DATA, 'readonly')
  const store = tx.objectStore(SYNCED_DATA)
  const key = `activity_${activityId}_${dataType}_cached`
  const result = await store.get(key)
  return result ? result.data : []
}

// Cache all risk controls
export async function cacheAllRiskControls(data: any[]) {
  const db = await getDB()
  const tx = db.transaction(RISK_CONTROLS_STORE, 'readwrite')
  const store = tx.objectStore(RISK_CONTROLS_STORE)
  await store.clear()
  for (const item of data) {
    await store.add(item)
  }
  await tx.done
}

export async function getCachedAllRiskControls(): Promise<any[]> {
  try {
    const db = await getDB()
    const tx = db.transaction(RISK_CONTROLS_STORE, 'readonly')
    const store = tx.objectStore(RISK_CONTROLS_STORE)
    return await store.getAll()
  } catch {
    return []
  }
}

// Cache risk controls for specific risk title
export async function cacheRiskControlsForTitle(riskTitleId: number, data: any[]) {
  const db = await getDB()
  const tx = db.transaction(RISK_CONTROLS_FOR_TITLE_STORE, 'readwrite')
  const store = tx.objectStore(RISK_CONTROLS_FOR_TITLE_STORE)
  // Store with composite key
  await store.put({ riskTitleId, controls: data, timestamp: Date.now() })
  await tx.done
}

export async function getCachedRiskControlsForTitle(riskTitleId: number): Promise<any[]> {
  try {
    const db = await getDB()
    const tx = db.transaction(RISK_CONTROLS_FOR_TITLE_STORE, 'readonly')
    const store = tx.objectStore(RISK_CONTROLS_FOR_TITLE_STORE)
    const result = await store.get(riskTitleId)
    return result ? result.controls : []
  } catch {
    return []
  }
}