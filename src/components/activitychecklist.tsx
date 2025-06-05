import React, { useState, useEffect } from 'react'
import axios from 'axios'

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

  const [, setProjectName] = useState<string>('') // Store project name

  // Fetch checklist notes
  useEffect(() => {
    axios
      .get(`/api/activity_checklist/notes/${activityId}`)
      .then((res) => {
        if (res.data.notes) {
          setChecklistNotes(res.data.notes)
        }
      })
      .catch((err) => console.error('Error fetching checklist notes:', err))
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
      try {
        const res = await axios.get(`/api/unassigned_checklist/${activityId}`)
        setUnassignedChecklists(res.data)
      } catch (err) {
        console.error('Error fetching unassigned checklists:', err)
      }
    }

    if (activityId) {
      fetchUnassignedChecklists()
    }
  }, [activityId, activityChecklists])

  // Fetch assigned checklists
  useEffect(() => {
    const fetchActivityChecklists = async () => {
      try {
        const res = await axios.get(`/api/activity_checklist/${activityId}`)
        setActivityChecklists(res.data)
      } catch (err) {
        console.error('Error fetching activity checklists:', err)
      }
    }

    if (activityId) {
      fetchActivityChecklists()
    }
  }, [activityId])

  const handleSaveNotes = () => {
    axios
      .post('/api/activity_checklist/notes', {
        activity_id: activityId,
        notes: checklistNotes,
      })
      .then((res) => alert(res.data.message || 'Checklist notes saved!'))
      .catch((err) => console.error('Error saving notes:', err))
  }

  // Add selected checklists to the activity
  const handleAddChecklists = async () => {
    if (selectedChecklists.length === 0) return
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
    }
  }

  // Remove a checklist from the activity
  const handleRemoveChecklist = async (acId: number) => {
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
