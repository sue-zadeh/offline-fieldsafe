// src/utils/dataPreloader.ts
import axios from 'axios'
import { cacheProjects, cacheActivities } from './localDB'

/**
 * Preloads essential data for offline use
 * Call this after successful login when online
 */
export async function preloadEssentialData() {
  if (!navigator.onLine) {
    console.log('⏸️ Skipping data preload - offline mode')
    return
  }

  console.log('🔄 Starting data preload for offline use...')

  try {
    // Preload projects
    const projectsRes = await axios.get('/api/projects')
    await cacheProjects(projectsRes.data)
    console.log('✅ Projects cached:', projectsRes.data.length)

    // Preload user's activities  
    const activitiesRes = await axios.get('/api/activities')
    await cacheActivities(activitiesRes.data)
    console.log('✅ Activities cached:', activitiesRes.data.length)

    console.log('🎉 Data preload completed successfully')
  } catch (error) {
    console.warn('⚠️ Data preload failed:', error)
    // Don't throw - this is optional enhancement
  }
}

/**
 * Preloads data in the background without blocking UI
 */
export function preloadEssentialDataAsync() {
  setTimeout(() => {
    preloadEssentialData().catch(err => 
      console.warn('Background data preload failed:', err)
    )
  }, 1000) // Wait 1 second after login to start preloading
}

/**
 * Check if user has been online before and preload if needed
 * Call this on app startup
 */
export function preloadIfFirstOnlineSession() {
  if (!navigator.onLine) return
  
  const hasPreloaded = localStorage.getItem('dataPreloaded')
  if (!hasPreloaded) {
    console.log('🔄 First online session detected - preloading data...')
    preloadEssentialDataAsync()
    localStorage.setItem('dataPreloaded', 'true')
  }
}
