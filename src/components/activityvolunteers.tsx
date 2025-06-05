import React, { useState, useEffect } from 'react'
import axios from 'axios'

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
        const res = await axios.get(`/api/unassigned_volunteer/${activityId}`)
        setUnassignedVolunteers(res.data)
      } catch (err) {
        console.error('Error fetching unassigned volunteers:', err)
      }
    }

    fetchUnassignedVolunteers()
  }, [activityId, activityVolunteers])

  // Fetch volunteers already assigned to the activity
  useEffect(() => {
    const fetchActivityVolunteers = async () => {
      try {
        const res = await axios.get(`/api/activity_volunteer/${activityId}`)
        setActivityVolunteers(res.data)
      } catch (err) {
        console.error('Error fetching activity volunteers:', err)
      }
    }

    fetchActivityVolunteers()
  }, [activityId])

  // Add selected volunteers to the activity
  const handleAddVolunteers = async () => {
    if (selectedVolunteers.length === 0) return

    try {
      await axios.post('/api/activity_volunteer', {
        activity_id: activityId,
        volunteer_ids: selectedVolunteers,
      })

      // Refresh the list of assigned volunteers
      const res = await axios.get(`/api/activity_volunteer/${activityId}`)
      setActivityVolunteers(res.data)
      setSelectedVolunteers([])
    } catch (err) {
      console.error('Error assigning volunteers to activity:', err)
    }
  }

  // Remove a volunteer from the activity
  const handleRemoveVolunteer = async (id: number) => {
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
