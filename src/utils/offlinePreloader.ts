// src/utils/offlinePreloader.ts
import axios from 'axios'
import { 
  cacheVolunteers, 
  cacheActivities, 
  cacheProjects, 
  cacheStaff, 
  cacheRisks, 
  cacheHazards 
} from './localDB'

export const preloadDataForOffline = async (): Promise<void> => {
  if (!navigator.onLine) {
    console.log('🔄 Offline: Skipping data preload')
    return
  }

  console.log('🔄 Preloading data for offline use...')

  try {
    // Load and cache volunteers
    const volunteersRes = await axios.get('/api/volunteers', {
      params: { role: 'Volunteer' }
    })
    await cacheVolunteers(volunteersRes.data)
    console.log('✅ Cached volunteers')

    // Load and cache activities
    const activitiesRes = await axios.get('/api/activities')
    await cacheActivities(activitiesRes.data)
    console.log('✅ Cached activities')

    // Load and cache projects
    const projectsRes = await axios.get('/api/projects')
    await cacheProjects(projectsRes.data)
    console.log('✅ Cached projects')

    // Load and cache staff
    const staffRes = await axios.get('/api/staff')
    await cacheStaff(staffRes.data)
    console.log('✅ Cached staff')

    // Load and cache risks
    const risksRes = await axios.get('/api/risks')
    await cacheRisks(risksRes.data)
    console.log('✅ Cached risks')

    // Load and cache hazards
    const siteHazardsRes = await axios.get('/api/site_hazards')
    const activityHazardsRes = await axios.get('/api/activity_people_hazards')
    
    const allHazards = [
      ...siteHazardsRes.data.map((h: any) => ({ ...h, type: 'site' })),
      ...activityHazardsRes.data.map((h: any) => ({ ...h, type: 'activity' }))
    ]
    await cacheHazards(allHazards)
    console.log('✅ Cached hazards')

    console.log('✅ Data preload completed successfully')
  } catch (error) {
    console.warn('⚠️ Some data failed to preload:', error)
  }
}

// Check if we have essential offline data
export const hasEssentialOfflineData = async (): Promise<boolean> => {
  try {
    const { getCachedVolunteers, getCachedActivities, getCachedProjects } = await import('./localDB')
    
    const [volunteers, activities, projects] = await Promise.all([
      getCachedVolunteers(),
      getCachedActivities(), 
      getCachedProjects()
    ])

    return volunteers.length > 0 && activities.length > 0 && projects.length > 0
  } catch (error) {
    console.error('Error checking offline data:', error)
    return false
  }
}
