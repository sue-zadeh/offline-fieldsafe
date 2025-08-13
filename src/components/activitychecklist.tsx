import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { saveOfflineItem, getCachedChecklists, storeOfflineActivityData, getOfflineActivityData, cacheActivityAssignments, getCachedActivityAssignments } from '../utils/localDB'

interface Checklist {
  id: number
  description: string
}

interface ActivityChecklistProps {
  activityId: number
  activityName?: string
  projectId?: string
}

const ActivityChecklist: React.FC<ActivityChecklistProps> = ({
  activityId,
}) => {
  const [unassignedChecklists, setUnassignedChecklists] = useState<Checklist[]>(
    []
  )
  const [activityChecklists, setActivityChecklists] = useState<Checklist[]>([])
  const [selectedChecklists, setSelectedChecklists] = useState<number[]>([])
  const [checklistNotes, setChecklistNotes] = useState('')
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  const [, setProjectName] = useState<string>('') // Store project name

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

  // Fetch checklist notes (online and offline)
  useEffect(() => {
    const fetchChecklistNotes = async () => {
      try {
        if (navigator.onLine) {
          // Online: try to get from server first
          try {
            const res = await axios.get(`/api/activity_checklist/notes/${activityId}`)
            if (res.data.notes) {
              setChecklistNotes(res.data.notes)
              return
            }
          } catch (err) {
            console.log('Error fetching online notes, checking offline storage:', err)
          }
        }
        
        // Offline or server error: check offline storage
        const offlineNotes = await getOfflineActivityData(activityId, 'checklist_notes')
        if (offlineNotes && offlineNotes.length > 0) {
          // Get the most recent notes
          const latestNotes = offlineNotes[offlineNotes.length - 1]
          setChecklistNotes(latestNotes.notes || '')
        }
      } catch (err) {
        console.error('Error fetching checklist notes:', err)
      }
    }

    if (activityId) {
      fetchChecklistNotes()
    }
  }, [activityId])

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

  // 1) Fetch unassigned checklists
  useEffect(() => {
    const fetchUnassignedChecklists = async () => {
      if (!navigator.onLine) {
        // Offline mode: get from cache
        try {
          let allChecklists = await getCachedChecklists()
          
          // If no cached checklists, use fallback data
          if (allChecklists.length === 0) {
            console.log('No cached checklists found, using fallback data')
            allChecklists = [
              { id: 1, description: 'All vehicle/driver licences/rego current' },
              { id: 2, description: 'Weather checked, appropriate clothing' },
              { id: 3, description: 'Correct PPE available' },
              { id: 4, description: 'First Aid kit stocked and on site' },
              { id: 5, description: 'Pre-existing medical conditions checked' },
              { id: 6, description: 'Risk assessment checked and shared completed' },
            ]
          }
          
          // Filter out assigned ones if we have activity checklists info
          const unassigned = allChecklists.filter(checklist => 
            !activityChecklists.some(ac => ac.id === checklist.id)
          )
          setUnassignedChecklists(unassigned)
        } catch (err) {
          console.error('Error loading cached checklists:', err)
          // Use fallback checklist data
          const fallbackChecklists = [
            { id: 1, description: 'All vehicle/driver licences/rego current' },
            { id: 2, description: 'Weather checked, appropriate clothing' },
            { id: 3, description: 'Correct PPE available' },
            { id: 4, description: 'First Aid kit stocked and on site' },
            { id: 5, description: 'Pre-existing medical conditions checked' },
            { id: 6, description: 'Risk assessment checked and shared completed' },
          ]
          setUnassignedChecklists(fallbackChecklists)
        }
        return
      }

      try {
        const res = await axios.get(`/api/unassigned_checklist/${activityId}`)
        setUnassignedChecklists(res.data)
      } catch (err) {
        console.error('Error fetching unassigned checklists:', err)
        // Fallback to cache if network fails
        try {
          let allChecklists = await getCachedChecklists()
          
          // If no cached checklists, use fallback data
          if (allChecklists.length === 0) {
            console.log('No cached checklists found, using fallback data')
            allChecklists = [
              { id: 1, description: 'All vehicle/driver licences/rego current' },
              { id: 2, description: 'Weather checked, appropriate clothing' },
              { id: 3, description: 'Correct PPE available' },
              { id: 4, description: 'First Aid kit stocked and on site' },
              { id: 5, description: 'Pre-existing medical conditions checked' },
              { id: 6, description: 'Risk assessment checked and shared completed' },
            ]
          }
          
          const unassigned = allChecklists.filter(checklist => 
            !activityChecklists.some(ac => ac.id === checklist.id)
          )
          setUnassignedChecklists(unassigned)
        } catch (cacheErr) {
          console.error('Error loading cached checklists:', cacheErr)
          // Use fallback checklist data as final resort
          const fallbackChecklists = [
            { id: 1, description: 'All vehicle/driver licences/rego current' },
            { id: 2, description: 'Weather checked, appropriate clothing' },
            { id: 3, description: 'Correct PPE available' },
            { id: 4, description: 'First Aid kit stocked and on site' },
            { id: 5, description: 'Pre-existing medical conditions checked' },
            { id: 6, description: 'Risk assessment checked and shared completed' },
          ]
          setUnassignedChecklists(fallbackChecklists)
        }
      }
    }

    if (activityId) {
      fetchUnassignedChecklists()
    }
  }, [activityId, activityChecklists])

  // Fetch assigned checklists
  useEffect(() => {
    const fetchActivityChecklists = async () => {
      if (!activityId) return
      
      console.log(`🔍 Loading checklists for activity ${activityId}, online: ${navigator.onLine}`)
      
      try {
        let assignedChecklists: Checklist[] = []
        
        if (navigator.onLine) {
          // Online: get from server
          try {
            const res = await axios.get(`/api/activity_checklist/${activityId}`)
            assignedChecklists = res.data
            console.log(`✅ Loaded ${assignedChecklists.length} checklists from server`)
            
            // Cache server data for offline viewing
            await cacheActivityAssignments(activityId, 'checklists', assignedChecklists)
            console.log(`💾 Cached ${assignedChecklists.length} checklists for offline viewing`)
          } catch (err) {
            console.log('❌ Server request failed, trying cached data:', err)
            // If server fails, try cached historical data
            assignedChecklists = await getCachedActivityAssignments(activityId, 'checklists')
            console.log(`📚 Loaded ${assignedChecklists.length} checklists from cache`)
          }
        } else {
          // Offline: load cached historical data first
          assignedChecklists = await getCachedActivityAssignments(activityId, 'checklists')
          console.log(`📚 Offline: Loaded ${assignedChecklists.length} historical checklists from cache`)
        }
        
        // Always load offline assignments and merge them
        const offlineAssignments: Checklist[] = await getOfflineActivityData(activityId, 'checklists')
        console.log(`📦 Found ${offlineAssignments.length} offline checklist assignments`)
        
        // Merge cached/server and offline data (avoid duplicates)
        const allAssignedIds = new Set(assignedChecklists.map(c => c.id))
        const offlineOnlyChecklists = offlineAssignments.filter((c: Checklist) => !allAssignedIds.has(c.id))
        
        const finalAssignments = [...assignedChecklists, ...offlineOnlyChecklists]
        console.log(`📊 Total checklist assignments: ${finalAssignments.length} (${assignedChecklists.length} historical + ${offlineOnlyChecklists.length} offline-only)`)
        setActivityChecklists(finalAssignments)
        
      } catch (err) {
        console.error('❌ Error fetching activity checklists:', err)
        // Final fallback to only offline data
        try {
          const offlineAssignments: Checklist[] = await getOfflineActivityData(activityId, 'checklists')
          console.log(`🔄 Final fallback: Using ${offlineAssignments.length} offline checklist assignments`)
          setActivityChecklists(offlineAssignments)
        } catch (offlineErr) {
          console.error('❌ Error loading offline checklist assignments:', offlineErr)
          setActivityChecklists([])
        }
      }
    }

    if (activityId) {
      fetchActivityChecklists()
    }
  }, [activityId])

  const handleSaveNotes = async () => {
    if (!navigator.onLine) {
      // Offline mode: queue for sync and store locally
      await saveOfflineItem({
        type: 'activity_checklist_notes',
        data: {
          activity_id: activityId,
          notes: checklistNotes,
        },
        synced: false,
        timestamp: Date.now()
      })
      
      // Store in offline activity data for persistence
      await storeOfflineActivityData(activityId, 'checklist_notes', [{ notes: checklistNotes, timestamp: Date.now() }])
      
      alert('Checklist notes saved offline and will sync when online!')
      return
    }

    try {
      const res = await axios.post('/api/activity_checklist/notes', {
        activity_id: activityId,
        notes: checklistNotes,
      })
      alert(res.data.message || 'Checklist notes saved!')
    } catch (err) {
      console.error('Error saving notes:', err)
      // Fallback to offline
      await saveOfflineItem({
        type: 'activity_checklist_notes',
        data: {
          activity_id: activityId,
          notes: checklistNotes,
        },
        synced: false,
        timestamp: Date.now()
      })
      
      // Store in offline activity data for persistence
      await storeOfflineActivityData(activityId, 'checklist_notes', [{ notes: checklistNotes, timestamp: Date.now() }])
      
      alert('Network error - notes saved offline and will sync when online!')
    }
  }

  // Add selected checklists to the activity
  const handleAddChecklists = async () => {
    if (selectedChecklists.length === 0) return
    
    if (!navigator.onLine) {
      // Offline mode: queue for sync and update local state
      await saveOfflineItem({
        type: 'activity_checklist_assignment',
        data: {
          activity_id: activityId,
          checklist_ids: selectedChecklists,
        },
        synced: false,
        timestamp: Date.now()
      })

      // Update local state optimistically
      const selectedChecklistItems = unassignedChecklists.filter(checklist =>
        selectedChecklists.includes(checklist.id)
      )
      setActivityChecklists(prev => [...prev, ...selectedChecklistItems])
      
      // Store offline assignments for persistence
      await storeOfflineActivityData(activityId, 'checklists', [...activityChecklists, ...selectedChecklistItems])
      
      setUnassignedChecklists(prev => 
        prev.filter(checklist => !selectedChecklists.includes(checklist.id))
      )
      setSelectedChecklists([])
      alert('Checklists added offline and will sync when online!')
      return
    }

    try {
      await axios.post('/api/activity_checklist', {
        activity_id: activityId,
        checklist_ids: selectedChecklists,
      })

      const assignedRes = await axios.get(
        `/api/activity_checklist/${activityId}`
      )
      setActivityChecklists(assignedRes.data)

      setSelectedChecklists([])
    } catch (err) {
      console.error('Error assigning checklists to activity:', err)
      // Fallback to offline mode
      await saveOfflineItem({
        type: 'activity_checklist_assignment',
        data: {
          activity_id: activityId,
          checklist_ids: selectedChecklists,
        },
        synced: false,
        timestamp: Date.now()
      })

      // Update local state optimistically
      const selectedChecklistItems = unassignedChecklists.filter(checklist =>
        selectedChecklists.includes(checklist.id)
      )
      setActivityChecklists(prev => [...prev, ...selectedChecklistItems])
      
      // Store offline assignments for persistence
      await storeOfflineActivityData(activityId, 'checklists', [...activityChecklists, ...selectedChecklistItems])
      
      setUnassignedChecklists(prev => 
        prev.filter(checklist => !selectedChecklists.includes(checklist.id))
      )
      setSelectedChecklists([])
      alert('Network error - checklists added offline and will sync when online!')
    }
  }

  // Remove a checklist from the activity
  const handleRemoveChecklist = async (acId: number) => {
    if (!navigator.onLine) {
      alert('Remove functionality is not available offline. Please try again when online.')
      return
    }

    const checklistToRemove = activityChecklists.find((c) => c.id === acId)
    if (!checklistToRemove) return

    const confirmRemoval = window.confirm(
      `Remove "${checklistToRemove.description}" from this activity?`
    )
    if (!confirmRemoval) return

    try {
      await axios.delete(`/api/activity_checklist/${acId}`)
      setActivityChecklists((prev) => prev.filter((item) => item.id !== acId))
    } catch (err) {
      console.error('Error removing checklist from activity:', err)
    }
  }

  return (
    <div>
      <h3 className="fw-bold p-2 fs-4" style={{ color: '#0094B6' }}>
        <h5 className="my-3 fw-bold"></h5>
      </h3>
      <h4 className="fw-bold pb-4 text-center" style={{ color: '#0094B6' }}>
        Assign items from Checklist to Activity
      </h4>
      {isOffline && (
        <div className="alert alert-warning text-center mb-3" role="alert">
          <strong>Offline Mode:</strong> You can add checklists and save notes offline. Remove functionality is disabled.
        </div>
      )}
      {/* <p className="fw-bold p-2 fs-4" style={{ color: '#0094B6' }}>
        Selected Project: {projectName}
      </p> */}
      <div className="d-flex flex-column align-items-center">
        <h5 style={{ marginBottom: '1rem' }}>
          Hold Ctrl/Cmd to select multiple
        </h5>

        {/* Available (Unassigned) Checklists */}
        <div className="mb-3 w-50">
          <h5 style={{ color: '#0094B6' }}>Available Checklist Items</h5>
          <select
            className="form-select"
            multiple
            value={selectedChecklists.map(String)}
            onChange={(e) => {
              const selectedOptions = Array.from(e.target.selectedOptions).map(
                (opt) => Number(opt.value)
              )
              setSelectedChecklists(selectedOptions)
            }}
          >
            {unassignedChecklists.length > 0 ? (
              unassignedChecklists.map((checklist) => (
                <option key={checklist.id} value={checklist.id}>
                  {checklist.description}
                </option>
              ))
            ) : (
              <option disabled>No available checklist items</option>
            )}
          </select>

          <button
            className="btn btn-primary btn-sm mt-2"
            style={{ backgroundColor: '#0094B6' }}
            onClick={handleAddChecklists}
            disabled={selectedChecklists.length === 0}
          >
            Add Selected Checklists
          </button>
        </div>

        {/* Already Assigned Checklists */}
        <table
          className="table table-striped table-hover btn-sm"
          style={{ width: '80%' }}
        >
          <thead>
            <tr>
              <th>Description</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {activityChecklists.map((c) => (
              <tr key={c.id}>
                <td>{c.description}</td>
                <td>
                  <button
                    className="btn btn-danger btn-sm rounded"
                    style={{ backgroundColor: '#D37B40' }}
                    onClick={() => handleRemoveChecklist(c.id)}
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

      <div className="mt-4 text-center">
        <label className="form-label fw-bold">Checklist Notes:</label>
        <div className="d-flex justify-content-center">
          <textarea
            className="form-control mb-2 w-50 justify-content-center"
            rows={3}
            placeholder="Write any notes/issues related to the checklist..."
            value={checklistNotes}
            onChange={(e) => setChecklistNotes(e.target.value)}
          />
        </div>
        <button
          className="btn btn-primary"
          style={{ backgroundColor: '#0094b6' }}
          onClick={handleSaveNotes}
        >
          Save Notes
        </button>
      </div>
    </div>
  )
}

export default ActivityChecklist
