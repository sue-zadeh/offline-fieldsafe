import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { getCachedVolunteers, saveOfflineItem, storeOfflineActivityData, getOfflineActivityData, cacheActivityAssignments, getCachedActivityAssignments } from '../utils/localDB'

interface Volunteer {
  id: number
  firstname: string
  lastname: string
  phone: string
  emergencyContact: string
  emergencyContactNumber: string
}

interface VolunteerTabProps {
  activityId: number
  activityName?: string
}

const ActivityVolunteerTab: React.FC<VolunteerTabProps> = ({ activityId }) => {
  const [unassignedVolunteers, setUnassignedVolunteers] = useState<Volunteer[]>(
    []
  )
  const [activityVolunteers, setActivityVolunteers] = useState<Volunteer[]>([])
  const [selectedVolunteers, setSelectedVolunteers] = useState<number[]>([])
  const [, setProjectName] = useState<string>('') // Store project name
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Fetch the project name for the activity
  useEffect(() => {
    const fetchProjectName = async () => {
      try {
        const res = await axios.get(`/api/activity_project/${activityId}`)
        setProjectName(res.data.projectName) // Assume the response includes projectName
      } catch (err) {
        console.error('Error fetching project name:', err)
      }
    }

    fetchProjectName()
  }, [activityId])

  // Fetch unassigned volunteers for the activity
  useEffect(() => {
    const fetchUnassignedVolunteers = async () => {
      try {
        if (navigator.onLine) {
          const res = await axios.get(`/api/unassigned_volunteer/${activityId}`)
          setUnassignedVolunteers(res.data)
        } else {
          // In offline mode, get all cached volunteers and filter out assigned ones
          const allVolunteers = await getCachedVolunteers()
          const availableVolunteers = allVolunteers.filter(volunteer => 
            volunteer.role === 'Volunteer' && 
            !activityVolunteers.some(assigned => assigned.id === volunteer.id)
          )
          setUnassignedVolunteers(availableVolunteers)
        }
      } catch (err) {
        console.error('Error fetching unassigned volunteers:', err)
        // Fallback to cached volunteers
        try {
          const allVolunteers = await getCachedVolunteers()
          const availableVolunteers = allVolunteers.filter(volunteer => 
            volunteer.role === 'Volunteer' && 
            !activityVolunteers.some(assigned => assigned.id === volunteer.id)
          )
          setUnassignedVolunteers(availableVolunteers)
        } catch (cacheErr) {
          console.error('Error loading cached volunteers:', cacheErr)
        }
      }
    }

    fetchUnassignedVolunteers()
  }, [activityId, activityVolunteers]) // Re-fetch unassigned volunteers whenever activityVolunteers change

  // Fetch volunteers already assigned to the activity
  useEffect(() => {
    const fetchActivityVolunteers = async () => {
      if (!activityId) return
      
      console.log(`🔍 Loading volunteers for activity ${activityId}, online: ${navigator.onLine}`)
      
      try {
        let assignedVolunteers: Volunteer[] = []
        
        if (navigator.onLine) {
          // Online: get from server
          try {
            const res = await axios.get(`/api/activity_volunteer/${activityId}`)
            assignedVolunteers = res.data
            console.log(`✅ Loaded ${assignedVolunteers.length} volunteers from server`)
            
            // Cache server data for offline viewing
            await cacheActivityAssignments(activityId, 'volunteers', assignedVolunteers)
            console.log(`💾 Cached ${assignedVolunteers.length} volunteers for offline viewing`)
          } catch (err) {
            console.log('❌ Server request failed, trying cached data:', err)
            // If server fails, try cached historical data
            assignedVolunteers = await getCachedActivityAssignments(activityId, 'volunteers')
            console.log(`📚 Loaded ${assignedVolunteers.length} volunteers from cache`)
          }
        } else {
          // Offline: load cached historical data first
          assignedVolunteers = await getCachedActivityAssignments(activityId, 'volunteers')
          console.log(`📚 Offline: Loaded ${assignedVolunteers.length} historical volunteers from cache`)
        }
        
        // Always load offline assignments and merge them
        const offlineAssignments: Volunteer[] = await getOfflineActivityData(activityId, 'volunteers')
        console.log(`📦 Found ${offlineAssignments.length} offline volunteer assignments`)
        
        // Merge cached/server and offline data (avoid duplicates)
        const allAssignedIds = new Set(assignedVolunteers.map(v => v.id))
        const offlineOnlyVolunteers = offlineAssignments.filter((v: Volunteer) => !allAssignedIds.has(v.id))
        
        const finalAssignments = [...assignedVolunteers, ...offlineOnlyVolunteers]
        console.log(`📊 Total volunteer assignments: ${finalAssignments.length} (${assignedVolunteers.length} historical + ${offlineOnlyVolunteers.length} offline-only)`)
        setActivityVolunteers(finalAssignments)
        
      } catch (err) {
        console.error('❌ Error fetching activity volunteers:', err)
        // Final fallback to only offline data
        try {
          const offlineAssignments = await getOfflineActivityData(activityId, 'volunteers')
          console.log(`🔄 Final fallback: Using ${offlineAssignments.length} offline volunteer assignments`)
          setActivityVolunteers(offlineAssignments)
        } catch (offlineErr) {
          console.error('❌ Error loading offline volunteer assignments:', offlineErr)
          setActivityVolunteers([])
        }
      }
    }

    fetchActivityVolunteers()
  }, [activityId])

  // Add selected volunteers to the activity
  const handleAddVolunteers = async () => {
    if (selectedVolunteers.length === 0) return

    try {
      if (navigator.onLine) {
        await axios.post('/api/activity_volunteer', {
          activity_id: activityId,
          volunteer_ids: selectedVolunteers,
        })

        // Refresh the list of assigned volunteers
        const res = await axios.get(`/api/activity_volunteer/${activityId}`)
        setActivityVolunteers(res.data)
        setSelectedVolunteers([])
      } else {
        // Queue for offline sync
        await saveOfflineItem({
          type: 'activity_volunteer_assignment',
          data: {
            activity_id: activityId,
            volunteer_ids: selectedVolunteers,
          },
          synced: false,
          timestamp: Date.now(),
        })

        // Update local state immediately to show the additions
        const volunteersToAdd = unassignedVolunteers.filter(v => 
          selectedVolunteers.includes(v.id)
        )
        setActivityVolunteers(prev => [...prev, ...volunteersToAdd])
        
        // Store offline assignments for persistence
        await storeOfflineActivityData(activityId, 'volunteers', [...activityVolunteers, ...volunteersToAdd])
        
        // Remove from unassigned list
        setUnassignedVolunteers(prev => 
          prev.filter(v => !selectedVolunteers.includes(v.id))
        )

        alert('Volunteer assignments saved offline and will sync when online!')
        setSelectedVolunteers([])
      }
    } catch (err) {
      console.error('Error assigning volunteers to activity:', err)
    }
  }

  // Remove a volunteer from the activity
  const handleRemoveVolunteer = async (id: number) => {
    if (!navigator.onLine) {
      alert('Remove functionality is not available offline. Please try again when online.')
      return
    }

    const volunteerToRemove = activityVolunteers.find((v) => v.id === id)
    if (!volunteerToRemove) return

    const confirmRemoval = window.confirm(
      `Are you sure you want to remove ${volunteerToRemove.firstname} ${volunteerToRemove.lastname} from this activity?`
    )
    if (!confirmRemoval) return

    try {
      await axios.delete(`/api/activity_volunteer/${id}`)
      setActivityVolunteers((prev) =>
        prev.filter((volunteer) => volunteer.id !== id)
      )
    } catch (err) {
      console.error('Error removing volunteer from activity:', err)
    }
  }

  return (
    <div>
      <h4 className="fw-bold pb-4 text-center" style={{ color: '#0094B6' }}>
        Assign Volunteers to Activity
      </h4>

      <h6 className=" text-center" style={{ marginBottom: '1rem' }}>
        Hold the Ctrl key (or Cmd key on Mac) to select multiple options.
      </h6>
      <div className="d-flex flex-column align-items-center">
        <div className="mb-3 w-50">
          <h5 style={{ color: '#0094B6' }}>Available Volunteers</h5>
          <select
            className="form-select"
            multiple
            value={selectedVolunteers.map(String)}
            onChange={(e) => {
              const selectedOptions = Array.from(e.target.selectedOptions).map(
                (opt) => Number(opt.value)
              )
              setSelectedVolunteers(selectedOptions)
            }}
          >
            {unassignedVolunteers.length > 0 ? (
              unassignedVolunteers.map((volunteer) => (
                <option key={volunteer.id} value={volunteer.id}>
                  {volunteer.firstname} {volunteer.lastname}
                </option>
              ))
            ) : (
              <option disabled>No available volunteers</option>
            )}
          </select>

          <button
            style={{ backgroundColor: '#0094B6' }}
            className="btn btn-primary btn-sm mt-2"
            onClick={handleAddVolunteers}
            disabled={selectedVolunteers.length === 0}
          >
            Add Selected Volunteers
          </button>
        </div>

        <table
          className="table table-striped table-hover btn-sm"
          style={{ width: '80%' }}
        >
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Phone</th>
              <th>Emergency Contact</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {activityVolunteers.map((volunteer) => (
              <tr key={volunteer.id}>
                <td>{`${volunteer.firstname} ${volunteer.lastname}`}</td>
                <td>{volunteer.phone}</td>
                <td>
                  {volunteer.emergencyContact} <br />
                  {volunteer.emergencyContactNumber}
                </td>
                <td>
                  <button
                    className="btn btn-danger btn-sm rounded"
                    style={{ backgroundColor: '#D37B40' }}
                    onClick={() => handleRemoveVolunteer(volunteer.id)}
                    disabled={isOffline}
                    title={isOffline ? 'Remove functionality not available offline' : ''}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ActivityVolunteerTab
