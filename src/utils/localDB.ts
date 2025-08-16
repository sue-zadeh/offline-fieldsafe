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
  await db.put(OFFLINE_QUEUE, { ...item, id })
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
  console.log(`🔄 Starting sync for ${unsynced.length} unsynced items`)
  
  for (const item of unsynced) {
    try {
      let endpoint: string
      let method = 'POST'
      let requestBody = item.data
      
      if (item.type === 'volunteer') {
        endpoint = '/api/volunteers'
      } else if (item.type === 'activity') {
        endpoint = '/api/activities'
      } else if (item.type === 'volunteer_delete') {
        endpoint = `/api/volunteers/${item.data.id}`
        method = 'DELETE'
        requestBody = undefined
      } else if (item.type === 'activity_volunteer_assignment') {
        endpoint = '/api/activity_volunteer'
      } else if (item.type === 'activity_staff_assignment') {
        endpoint = '/api/activity_staff'
      } else if (item.type === 'activity_risk') {
        endpoint = '/api/activity_risks'
      } else if (item.type === 'activity_hazard') {
        // Determine endpoint based on hazard type and map field names
        if (item.data.hazard_type === 'site') {
          endpoint = '/api/activity_site_hazards'
          // Map hazard_id to site_hazard_id
          requestBody = { ...item.data }
          requestBody.site_hazard_id = requestBody.hazard_id
          delete requestBody.hazard_id
          delete requestBody.hazard_type
        } else {
          endpoint = '/api/activity_activity_people_hazards'
          // Map hazard_id to activity_people_hazard_id
          requestBody = { ...item.data }
          requestBody.activity_people_hazard_id = requestBody.hazard_id
          delete requestBody.hazard_id
          delete requestBody.hazard_type
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
        console.warn(`⚠️ Unknown sync type: ${item.type}`)
        continue
      }

      console.log(`🔄 Syncing ${item.type} to ${endpoint}`)

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: method !== 'GET' && requestBody ? JSON.stringify(requestBody) : undefined,
      })

      if (res.ok) {
        await markItemSynced(item.id)
        
        // Cache the response data for some types
        if (item.type === 'volunteer') {
          try {
            const data = await res.json()
            if (data && data.id) {
              await cacheVolunteers([data])
            }
          } catch (e) {
            console.warn('Could not cache volunteer response:', e)
          }
        }
        if (item.type === 'activity') {
          try {
            const data = await res.json()
            if (data && (data.activityId || data.id)) {
              // Server returns { activityId: xxx, message: ... } for new activities
              const activityForCache = { 
                ...requestBody, 
                id: data.activityId || data.id 
              }
              await cacheActivity(activityForCache)
            }
          } catch (e) {
            console.warn('Could not cache activity response:', e)
          }
        }
        
        console.log(`✅ Synced ${item.type} item successfully`)
      } else {
        const errorText = await res.text().catch(() => 'Unknown error')
        console.warn(`❌ Failed to sync ${item.type} item: ${res.status} - ${errorText}`)
      }
    } catch (err) {
      console.warn(`❌ Sync failed for ${item.type}:`, err)
    }
  }
  
  console.log('🔄 Sync queue replay completed')
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
  const db = await getDB()
  const tx = db.transaction(ACTIVITY_STORE, 'readonly')
  const store = tx.objectStore(ACTIVITY_STORE)
  return await store.get(activityId)
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