import React, { useState, useEffect } from 'react'
import axios from 'axios'

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

  // Fetch unassigned staff for the activity
  useEffect(() => {
    const fetchUnassignedStaff = async () => {
      try {
        const res = await axios.get(`/api/unassigned_staff/${activityId}`)
        setUnassignedStaff(res.data) // Unassigned staff for the dropdown
      } catch (err) {
        console.error('Error fetching unassigned staff:', err)
      }
    }

    fetchUnassignedStaff()
  }, [activityId, activityStaffs]) // Re-fetch unassigned staff whenever activityStaffs change

  // Fetch staff already assigned to the activity
  useEffect(() => {
    const fetchActivityStaffs = async () => {
      try {
        const res = await axios.get(`/api/activity_staff/${activityId}`)
        setActivityStaffs(res.data) // Staff assigned to the activity
      } catch (err) {
        console.error('Error fetching activity staffs:', err)
      }
    }

    fetchActivityStaffs()
  }, [activityId])

  // Add staff to the activity
  const handleAddStaff = async (staffId: number | null) => {
    if (!staffId) return

    try {
      await axios.post('/api/activity_staff', {
        activity_id: activityId,
        staff_id: staffId,
      })
      // Refresh the activity staff list
      const res = await axios.get(`/api/activity_staff/${activityId}`)
      setActivityStaffs(res.data)
      // Reset dropdowns
      // setSelectedGroupAdmin(null)
      setSelectedFieldStaff(null)
      setSelectedTeamLeader(null)
    } catch (err) {
      console.error('Error assigning staff to activity:', err)
    }
  }

  // Remove staff from the activity
  const handleRemoveStaff = async (id: number) => {
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
