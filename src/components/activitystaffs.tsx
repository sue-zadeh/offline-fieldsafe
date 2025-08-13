import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { getCachedStaff, saveOfflineItem, storeOfflineActivityData, getOfflineActivityData, cacheActivityAssignments, getCachedActivityAssignments } from '../utils/localDB'

interface Staff {
  id: number
  firstname: string
  lastname: string
  phone: string
  role: string
}

interface StaffTabProps {
  activityId?: number
  activityName?: string
}

const ActivityStaffsTab: React.FC<StaffTabProps> = ({ activityId }) => {
  const [unassignedStaff, setUnassignedStaff] = useState<Staff[]>([])
  const [activityStaffs, setActivityStaffs] = useState<Staff[]>([])
  // const [selectedGroupAdmin, setSelectedGroupAdmin] = useState<number | null>(
  //   null
  // )
  const [selectedFieldStaff, setSelectedFieldStaff] = useState<number | null>(
    null
  )
  const [selectedTeamLeader, setSelectedTeamLeader] = useState<number | null>(
    null
  )
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

  // Fetch unassigned staff for the activity
  useEffect(() => {
    const fetchUnassignedStaff = async () => {
      try {
        if (navigator.onLine) {
          const res = await axios.get(`/api/unassigned_staff/${activityId}`)
          setUnassignedStaff(res.data) // Unassigned staff for the dropdown
        } else {
          // In offline mode, get all cached staff and filter out assigned ones
          const allStaff = await getCachedStaff()
          const availableStaff = allStaff.filter(staff => 
            staff.role !== 'Volunteer' && 
            !activityStaffs.some(assigned => assigned.id === staff.id)
          )
          setUnassignedStaff(availableStaff)
        }
      } catch (err) {
        console.error('Error fetching unassigned staff:', err)
        // Fallback to cached staff
        try {
          const allStaff = await getCachedStaff()
          const availableStaff = allStaff.filter(staff => 
            staff.role !== 'Volunteer' && 
            !activityStaffs.some(assigned => assigned.id === staff.id)
          )
          setUnassignedStaff(availableStaff)
        } catch (cacheErr) {
          console.error('Error loading cached staff:', cacheErr)
        }
      }
    }

    fetchUnassignedStaff()
  }, [activityId, activityStaffs]) // Re-fetch unassigned staff whenever activityStaffs change

  // Fetch staff already assigned to the activity
  useEffect(() => {
    const fetchActivityStaffs = async () => {
      if (!activityId) return
      
      console.log(`🔍 Loading staff for activity ${activityId}, online: ${navigator.onLine}`)
      
      try {
        let assignedStaff: Staff[] = []
        
        if (navigator.onLine) {
          // Online: get from server
          try {
            const res = await axios.get(`/api/activity_staff/${activityId}`)
            assignedStaff = res.data
            console.log(`✅ Loaded ${assignedStaff.length} staff from server`)
            
            // Cache server data for offline viewing
            await cacheActivityAssignments(activityId, 'staff', assignedStaff)
            console.log(`💾 Cached ${assignedStaff.length} staff for offline viewing`)
          } catch (err) {
            console.log('❌ Server request failed, trying cached data:', err)
            // If server fails, try cached historical data
            assignedStaff = await getCachedActivityAssignments(activityId, 'staff')
            console.log(`📚 Loaded ${assignedStaff.length} staff from cache`)
          }
        } else {
          // Offline: load cached historical data first
          assignedStaff = await getCachedActivityAssignments(activityId, 'staff')
          console.log(`📚 Offline: Loaded ${assignedStaff.length} historical staff from cache`)
        }
        
        // Always load offline assignments and merge them
        const offlineAssignments: Staff[] = await getOfflineActivityData(activityId, 'staff')
        console.log(`📦 Found ${offlineAssignments.length} offline staff assignments`)
        
        // Merge cached/server and offline data (avoid duplicates)
        const allAssignedIds = new Set(assignedStaff.map(s => s.id))
        const offlineOnlyStaff = offlineAssignments.filter((s: Staff) => !allAssignedIds.has(s.id))
        
        const finalAssignments = [...assignedStaff, ...offlineOnlyStaff]
        console.log(`📊 Total staff assignments: ${finalAssignments.length} (${assignedStaff.length} historical + ${offlineOnlyStaff.length} offline-only)`)
        setActivityStaffs(finalAssignments)
        
      } catch (err) {
        console.error('❌ Error fetching activity staffs:', err)
        // Final fallback to only offline data
        try {
          const offlineAssignments: Staff[] = await getOfflineActivityData(activityId, 'staff')
          console.log(`🔄 Final fallback: Using ${offlineAssignments.length} offline staff assignments`)
          setActivityStaffs(offlineAssignments)
        } catch (offlineErr) {
          console.error('❌ Error loading offline staff assignments:', offlineErr)
          setActivityStaffs([])
        }
      }
    }

    fetchActivityStaffs()
  }, [activityId])

  // Add staff to the activity
  const handleAddStaff = async (staffId: number | null) => {
    if (!staffId) return

    try {
      if (navigator.onLine) {
        await axios.post('/api/activity_staff', {
          activity_id: activityId,
          staff_id: staffId,
        })
        // Refresh the activity staff list
        const res = await axios.get(`/api/activity_staff/${activityId}`)
        setActivityStaffs(res.data)
        // Reset dropdowns
        setSelectedFieldStaff(null)
        setSelectedTeamLeader(null)
      } else {
        // Queue for offline sync
        await saveOfflineItem({
          type: 'activity_staff_assignment',
          data: {
            activity_id: activityId,
            staff_id: staffId,
          },
          synced: false,
          timestamp: Date.now(),
        })

        // Update local state immediately to show the addition
        const staffToAdd = unassignedStaff.find(s => s.id === staffId)
        if (staffToAdd) {
          setActivityStaffs(prev => [...prev, staffToAdd])
          
          // Store offline assignments for persistence
          await storeOfflineActivityData(activityId!, 'staff', [...activityStaffs, staffToAdd])
          
          // Remove from unassigned list
          setUnassignedStaff(prev => prev.filter(s => s.id !== staffId))
        }

        alert('Staff assignment saved offline and will sync when online!')
        setSelectedFieldStaff(null)
        setSelectedTeamLeader(null)
      }
    } catch (err) {
      console.error('Error assigning staff to activity:', err)
    }
  }

  // Remove staff from the activity
  const handleRemoveStaff = async (id: number) => {
    if (!navigator.onLine) {
      alert('Remove functionality is not available offline. Please try again when online.')
      return
    }

    const staffToRemove = activityStaffs.find((staff) => staff.id === id)
    if (!staffToRemove) return

    const confirmRemoval = window.confirm(
      `Are you sure you want to remove ${staffToRemove.firstname} ${staffToRemove.lastname} from this activity?`
    )
    if (!confirmRemoval) return

    try {
      await axios.delete(`/api/activity_staff/${id}`)
      setActivityStaffs((prev) => prev.filter((staff) => staff.id !== id))
    } catch (err) {
      console.error('Error removing staff from activity:', err)
    }
  }

  // Filter unassigned staff by role
  const filterUnassignedStaffByRole = (role: string) => {
    return unassignedStaff.filter((staff) => staff.role === role)
  }

  /////////// Rendering
  return (
    <div>
      <h4 className="pb-4 fw-bold text-center" style={{ color: '#0094B6' }}>
        Assign Staff to Activity
      </h4>
      {/* <h5 className="fw-bold p-2 fs-4" style={{ color: '#0094B6' }}>
        Activity: {activityName} || Project: {projectName}
      </h5> */}
      {/* Dropdowns for each staff type */}
      <div className="row mb-3 justify-content-center">
        {/* Group Admins */}
        {/* <div className="col-md-4">
          <h5>Group Admins</h5>
          <select
            className="form-select mb-2"
            value={selectedGroupAdmin || ''}
            onChange={(e) => setSelectedGroupAdmin(Number(e.target.value))}
          >
            <option value="">Select a Group Admin</option>
            {filterUnassignedStaffByRole('Group Admin').map((staff) => (
              <option key={staff.id} value={staff.id}>
                {`${staff.firstname} ${staff.lastname}`}
              </option>
            ))}
          </select>
          <button
            style={{ backgroundColor: '#0094B6' }}
            className="btn btn-primary btn-sm px-2"
            onClick={() => handleAddStaff(selectedGroupAdmin)}
            disabled={!selectedGroupAdmin}
          >
            Add Group Admin
          </button>
        </div> */}

        {/* Field Staff */}
        <div className="col-md-4">
          <h5>Field Staff</h5>
          <select
            className="form-select mb-2"
            value={selectedFieldStaff || ''}
            onChange={(e) => setSelectedFieldStaff(Number(e.target.value))}
          >
            <option value="">Select a Field Staff</option>
            {filterUnassignedStaffByRole('Field Staff').map((staff) => (
              <option key={staff.id} value={staff.id}>
                {`${staff.firstname} ${staff.lastname}`}
              </option>
            ))}
          </select>
          <button
            style={{ backgroundColor: '#0094B6' }}
            className="btn btn-primary btn-sm px-3"
            onClick={() => handleAddStaff(selectedFieldStaff)}
            disabled={!selectedFieldStaff}
          >
            Add Field Staff
          </button>
        </div>

        {/* Team Leaders */}
        <div className="col-md-4">
          <h5>Team Leaders</h5>
          <select
            className="form-select mb-2"
            value={selectedTeamLeader || ''}
            onChange={(e) => setSelectedTeamLeader(Number(e.target.value))}
          >
            <option value="">Select a Team Leader</option>
            {filterUnassignedStaffByRole('Team Leader').map((staff) => (
              <option key={staff.id} value={staff.id}>
                {`${staff.firstname} ${staff.lastname}`}
              </option>
            ))}
          </select>
          <button
            style={{ backgroundColor: '#0094B6' }}
            className="btn btn-primary btn-sm px-2"
            onClick={() => handleAddStaff(selectedTeamLeader)}
            disabled={!selectedTeamLeader}
          >
            Add Team Leader
          </button>
        </div>
      </div>
      {/* Table of assigned staff */}
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {activityStaffs.map((staff) => (
            <tr key={staff.id}>
              <td>{`${staff.firstname} ${staff.lastname}`}</td>
              <td>{staff.phone}</td>
              <td>{staff.role}</td>
              <td>
                <button
                  className="btn btn-danger btn-sm rounded"
                  style={{ backgroundColor: '#D37B40' }}
                  onClick={() => handleRemoveStaff(staff.id)}
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
  )
}

export default ActivityStaffsTab
