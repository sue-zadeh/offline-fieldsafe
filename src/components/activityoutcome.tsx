import React, { useState, useEffect } from 'react'
import axios from 'axios'

interface ActivityOutcomeProps {
  activityId: number
  activityName: string
}

interface IProjectObjective {
  activityObjectiveId: number
  objective_id: number
  title: string
  measurement: string
  amount: number | null
}

interface IPredatorOption {
  id: number
  sub_type: string
}

interface IPredatorRecord {
  id: number
  activity_id: number
  predator_id: number
  sub_type: string
  measurement: number | null
  rats: number
  possums: number
  mustelids: number
  hedgehogs: number
  others: number
  others_description?: string
}

const ActivityOutcome: React.FC<ActivityOutcomeProps> = ({ activityId }) => {
  // ============ Objectives State ============
  const [objectives, setObjectives] = useState<IProjectObjective[]>([])
  const [editingObjId, setEditingObjId] = useState<number | null>(null)
  const [editAmount, setEditAmount] = useState('')

  // ============ Predator State ============
  const [predatorList, setPredatorList] = useState<IPredatorOption[]>([])
  const [predatorRecords, setPredatorRecords] = useState<IPredatorRecord[]>([])
  const [editingPredId, setEditingPredId] = useState<number | null>(null)

  const [selectedPredatorId, setSelectedPredatorId] = useState<number | null>(
    null
  )
  const [pMeasurement, setPMeasurement] = useState<number | null>(null)
  const [rats, setRats] = useState(0)
  const [possums, setPossums] = useState(0)
  const [mustelids, setMustelids] = useState(0)
  const [hedgehogs, setHedgehogs] = useState(0)
  const [others, setOthers] = useState(0)
  const [othersDescription, setOthersDescription] = useState('')

  const [newObjectiveTitle, setNewObjectiveTitle] = useState('')
const [newObjectiveMeasurement, setNewObjectiveMeasurement] = useState('')


  // ============ On Load, fetch project objectives & predator data ============
  useEffect(() => {
    if (!activityId) return

    // Load objectives for this activity
    axios
      .get(`/api/activity_outcome/${activityId}`)
      .then((res) => {
        setObjectives(res.data.objectives || [])
      })
      .catch((err) => {
        console.error('Error loading project objectives:', err)
        alert('Failed to load project objectives.')
      })

    // fetch the predator list
    axios
      .get<IPredatorOption[]>('/api/predator')
      .then((res) => setPredatorList(res.data))
      .catch((err) => {
        console.error('Error fetching predator list:', err)
        alert('Failed to load predator list.')
      })

    // fetch activity's existing predator records
    axios
      .get<IPredatorRecord[]>(`/api/activity_predator/${activityId}`)
      .then((res) => {
        setPredatorRecords(res.data)
      })
      .catch((err) => {
        console.error('Error fetching predator records:', err)
        alert('Failed to load predator records.')
      })
  }, [activityId])

  // Filter out any “Establishing Predator Control” objective
  const filteredObjectives = objectives.filter(
    (obj) => obj.title.toLowerCase() !== 'establishing predator control'
  )

  // Do we show the Predator Control section?
  const hasPredatorControl = objectives.some(
    (obj) => obj.title.toLowerCase() === 'establishing predator control'
  )

  // ============ Objective Edit Handlers ============
  // Pass the entire objective so we can fill editing state from it
  const handleEditObjective = (obj: IProjectObjective) => {
    setEditingObjId(obj.activityObjectiveId)
    setEditAmount(obj.amount !== null ? String(obj.amount) : '')
  }

  const handleSaveObjective = async (activityObjectiveId: number) => {
    //  No change: first should Find the original objective in our state
    const originalObj = objectives.find(
      (o) => o.activityObjectiveId === activityObjectiveId
    )
    // convert `null` to an empty string, or number -> string
    const originalAmountStr =
      originalObj?.amount != null ? String(originalObj.amount) : ''

    //Then, If user didn’t change anything, confirm
    if (originalAmountStr === editAmount) {
      const proceedAnyway = window.confirm(
        "You haven't made any changes to the amount. Save anyway?"
      )
      if (!proceedAnyway) {
        return // user clicked "Cancel"
      }
    }

    try {
      await axios.put(`/api/activity_objectives/${activityObjectiveId}`, {
        amount: editAmount ? Number(editAmount) : null,
      })
      // Re-fetch the objectives for this activity
      const resp = await axios.get(`/api/activity_outcome/${activityId}`)
      setObjectives(resp.data.objectives || [])
      alert('Saved successfully!')
    } catch (err) {
      console.error('Error saving objective:', err)
      alert('Failed to save objective.')
    }
    setEditingObjId(null)
    setEditAmount('')
  }

  const handleCancelObjective = () => {
    setEditingObjId(null)
    setEditAmount('')
  }

  const handleAddNewObjective = async () => {
    if (!newObjectiveTitle.trim() || !newObjectiveMeasurement.trim()) {
      alert('Please enter title and measurement.')
      return
    }
  
    try {
      await axios.post('/api/activity_objectives_direct', {
        activity_id: activityId,
        title: newObjectiveTitle.trim(),
        measurement: newObjectiveMeasurement.trim(),
      })
  
      // Refresh
      const resp = await axios.get(`/api/activity_outcome/${activityId}`)
      setObjectives(resp.data.objectives || [])
      setNewObjectiveTitle('')
      setNewObjectiveMeasurement('')
      alert('Objective added successfully!')
    } catch (err) {
      console.error(err)
      alert('Failed to add objective.')
    }
  }
  

  // ============ Predator Add/Edit ============

  const resetPredatorForm = () => {
    setEditingPredId(null)
    setSelectedPredatorId(null)
    setPMeasurement(null)
    setRats(0)
    setPossums(0)
    setMustelids(0)
    setHedgehogs(0)
    setOthers(0)
    setOthersDescription('')
  }

  const handleSavePredator = async () => {
    if (!selectedPredatorId) {
      alert('Please select a Predator sub_type.')
      return
    }
    try {
      if (!editingPredId) {
        // POST
        await axios.post('/api/activity_predator', {
          activity_id: activityId,
          predator_id: selectedPredatorId,
          measurement: pMeasurement,
          rats,
          possums,
          mustelids,
          hedgehogs,
          others,
          othersDescription,
        })
        alert('Predator record added successfully!')
      } else {
        // PUT
        await axios.put(`/api/activity_predator/${editingPredId}`, {
          activity_id: activityId,
          predator_id: selectedPredatorId,
          measurement: pMeasurement,
          rats,
          possums,
          mustelids,
          hedgehogs,
          others,
          othersDescription,
        })
        alert('Predator record updated successfully!')
      }

      // Reload after save
      const resp = await axios.get<IPredatorRecord[]>(
        `/api/activity_predator/${activityId}`
      )
      setPredatorRecords(resp.data)
      resetPredatorForm()
    } catch (err) {
      console.error('Error saving predator record:', err)
      alert('Failed to save predator record.')
    }
  }

  const handleEditPredator = (rec: IPredatorRecord) => {
    setEditingPredId(rec.id)
    setSelectedPredatorId(rec.predator_id)
    setPMeasurement(rec.measurement)
    setRats(rec.rats)
    setPossums(rec.possums)
    setMustelids(rec.mustelids)
    setHedgehogs(rec.hedgehogs)
    setOthers(rec.others)
    setOthersDescription(rec.others_description || '')
  }

  const handleDeletePredator = async (id: number) => {
    if (!window.confirm('Delete this predator record?')) return
    try {
      await axios.delete(`/api/activity_predator/${id}`)
      setPredatorRecords((prev) => prev.filter((p) => p.id !== id))
      alert('Predator record deleted successfully!')
    } catch (err) {
      console.error('Error deleting predator record:', err)
      alert('Failed to delete predator record.')
    }
  }

  // Group the predator records by sub_type
  const trapsEstablishedRecords = predatorRecords.filter(
    (r) => r.sub_type.toLowerCase() === 'traps established'
  )
  const trapsCheckedRecords = predatorRecords.filter(
    (r) => r.sub_type.toLowerCase() === 'traps checked'
  )
  const catchesRecords = predatorRecords.filter(
    (r) => r.sub_type.toLowerCase() === 'catches'
  )

  // Color pallette
  const btnOceanBlue = { backgroundColor: '#0094B6', color: '#fff' }
  const btnKaraka = { backgroundColor: '#D37B40', color: '#fff' }
  const btnForest = { backgroundColor: '#738C40', color: '#fff' }
  const btnSky = { backgroundColor: '#76D6E2', color: '#fff' }

  return (
    <div>
      <div className="container-fluid px-2 py-2">
        {/* Main Outcome Table (filteredObjectives) */}
        <h4 className="my-4 text-center" style={{ color: '#0094B6' }}>
          Activity Outcome
        </h4>

        <div className="d-flex justify-content-center">
          <div className="table-responsive" style={{ maxWidth: '100%' }}>
            <table className="table table-striped table-bordered table-hover">
              <thead>
                <tr>
                  <th>Objective Title</th>
                  <th className="text-center">Default Measurement</th>
                  <th className="text-center">Amount / Value</th>
                  <th className="text-center" style={{ width: '160px' }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredObjectives.map((obj) => {
                  const isEditing = editingObjId === obj.activityObjectiveId
                  return (
                    <tr key={obj.activityObjectiveId}>
                      <td>{obj.title}</td>
                      <td className="text-center">{obj.measurement}</td>
                      <td className="text-center">
                        {isEditing ? (
                          <input
                            type="number"
                            style={{ textAlign: 'center' }}
                            className="form-control form-control-sm"
                            min={0}
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                          />
                        ) : (
                          obj.amount ?? ''
                        )}
                      </td>
                      <td className="text-center">
                        {isEditing ? (
                          <>
                            <button
                              className="btn btn-sm me-1"
                              style={{ ...btnForest, width: '70px' }}
                              onClick={() =>
                                handleSaveObjective(obj.activityObjectiveId)
                              }
                            >
                              Save
                            </button>
                            <button
                              className="btn btn-sm"
                              style={{ ...btnSky, width: '70px' }}
                              onClick={handleCancelObjective}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            className="btn btn-sm"
                            style={{ ...btnOceanBlue, width: '70px' }}
                            onClick={() => handleEditObjective(obj)}
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {filteredObjectives.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center">
                      No objectives found (excluding Predator Control).
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
  <tr>
    <td>
      <input
        type="text"
        className="form-control form-control-sm"
        placeholder="Objective title..."
        value={newObjectiveTitle}
        onChange={(e) => setNewObjectiveTitle(e.target.value)}
      />
    </td>
    <td>
      <input
        type="text"
        className="form-control form-control-sm text-center"
        placeholder="Measurement"
        value={newObjectiveMeasurement}
        onChange={(e) => setNewObjectiveMeasurement(e.target.value)}
      />
    </td>
    <td colSpan={2} className="text-center">
      <button
        className="btn btn-sm"
        style={{ ...btnOceanBlue, width: '90px' }}
        onClick={handleAddNewObjective}
      >
        + Add
      </button>
    </td>
  </tr>
</tfoot>

            </table>
          </div>
        </div>

        {/* Predator Control (only if user included "Establishing Predator Control") */}
        {hasPredatorControl && (
          <>
            <h5 className="mt-4" style={{ color: '#0094B6' }}>
              Predator Control Details
            </h5>
            <h6>Add or track trap checks, established traps, or catches.</h6>

            {/* Predator Add/Edit Form */}
            <div className="card p-3 mb-3 shadow">
              <h4 className="text-center" style={{ color: '#0094B6' }}>
                {editingPredId ? 'Edit' : 'Add'} Predator Control Record
              </h4>
              <div className="row justify-content-center mb-2">
                <div className="col-6 col-md-4">
                  <label className="form-label">Sub-Objective</label>
                  <select
                    className="form-select form-select-sm"
                    value={selectedPredatorId ?? ''}
                    onChange={(e) =>
                      setSelectedPredatorId(
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                  >
                    <option value="">-- select one --</option>
                    {predatorList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.sub_type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-6 col-md-4">
                  <label className="form-label">Measurement </label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={pMeasurement ?? ''}
                    min={0}
                    onChange={(e) =>
                      setPMeasurement(
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                  />
                </div>
              </div>

              {/* Show species fields if sub_type === 'catches' */}
              {(() => {
                const predObj = predatorList.find(
                  (p) => p.id === selectedPredatorId
                )
                if (predObj && predObj.sub_type.toLowerCase() === 'catches') {
                  return (
                    <div className="row mb-2">
                      <div className="col">
                        <label className="form-label">Rats</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={rats}
                          min={0}
                          onChange={(e) => setRats(Number(e.target.value))}
                        />
                      </div>
                      <div className="col">
                        <label className="form-label">Possums</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={possums}
                          min={0}
                          onChange={(e) => setPossums(Number(e.target.value))}
                        />
                      </div>
                      <div className="col">
                        <label className="form-label">Mustelids</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={mustelids}
                          min={0}
                          onChange={(e) => setMustelids(Number(e.target.value))}
                        />
                      </div>
                      <div className="col">
                        <label className="form-label">Hedgehogs</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={hedgehogs}
                          min={0}
                          onChange={(e) => setHedgehogs(Number(e.target.value))}
                        />
                      </div>
                      <div className="col">
                        <label className="form-label">Others (#)</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={others}
                          min={0}
                          onChange={(e) => setOthers(Number(e.target.value))}
                        />
                      </div>
                      <div className="col">
                        <label className="form-label">Others (Species)</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={othersDescription}
                          onChange={(e) => setOthersDescription(e.target.value)}
                        />
                      </div>
                    </div>
                  )
                }
                return null
              })()}

              <div className="text-center mt-2">
                <button
                  className="btn btn-sm me-2"
                  style={{ ...btnOceanBlue, width: '90px' }}
                  onClick={handleSavePredator}
                >
                  {editingPredId ? 'Update' : 'Add'}
                </button>
                {editingPredId && (
                  <button
                    className="btn btn-sm"
                    style={{ ...btnSky, width: '90px' }}
                    onClick={resetPredatorForm}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            {/* Traps Established & Traps Checked side-by-side */}
            <div className="row">
              <div className="col-md-6">
                <h6 className="text-center fw-bold">Traps Established</h6>
                <div className="table-responsive mb-4">
                  <table className="table table-striped table-hover table-bordered">
                    <thead>
                      <tr>
                        <th className="text-center" style={{ width: '50%' }}>
                          Measurement
                        </th>
                        <th className="text-center" style={{ width: '50%' }}>
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {trapsEstablishedRecords.map((r) => (
                        <tr key={r.id}>
                          <td className="text-center">{r.measurement ?? ''}</td>
                          <td className="text-center">
                            <button
                              className="btn btn-sm me-1"
                              style={btnOceanBlue}
                              onClick={() => handleEditPredator(r)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm"
                              style={btnKaraka}
                              onClick={() => handleDeletePredator(r.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                      {trapsEstablishedRecords.length === 0 && (
                        <tr>
                          <td colSpan={2} className="text-center">
                            No records yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="col-md-6">
                <h6 className="text-center fw-bold">Traps Checked</h6>
                <div className="table-responsive mb-4">
                  <table className="table table-striped table-hover table-bordered">
                    <thead>
                      <tr>
                        <th className="text-center" style={{ width: '50%' }}>
                          Measurement
                        </th>
                        <th className="text-center" style={{ width: '50%' }}>
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {trapsCheckedRecords.map((r) => (
                        <tr key={r.id}>
                          <td className="text-center">{r.measurement ?? ''}</td>
                          <td className="text-center">
                            <button
                              className="btn btn-sm me-1"
                              style={btnOceanBlue}
                              onClick={() => handleEditPredator(r)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm"
                              style={btnKaraka}
                              onClick={() => handleDeletePredator(r.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                      {trapsCheckedRecords.length === 0 && (
                        <tr>
                          <td colSpan={2} className="text-center">
                            No records yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Catches below */}
            <h6 className="text-center fw-bold">Catches</h6>
            <div className="d-flex justify-content-center mb-4">
              <div className="table-responsive" style={{ maxWidth: '100%' }}>
                <table className="table table-striped table-bordered table-hover">
                  <thead>
                    <tr>
                      <th className="text-center">Rats</th>
                      <th className="text-center">Possums</th>
                      <th className="text-center">Mustelids</th>
                      <th className="text-center">Hedgehogs</th>
                      <th className="text-center">Others (#)</th>
                      <th className="text-center">Others (Species)</th>
                      <th className="text-center" style={{ width: '150px' }}>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {catchesRecords.map((r) => (
                      <tr key={r.id}>
                        <td className="text-center">{r.rats}</td>
                        <td className="text-center">{r.possums}</td>
                        <td className="text-center">{r.mustelids}</td>
                        <td className="text-center">{r.hedgehogs}</td>
                        <td className="text-center">{r.others}</td>
                        <td className="text-center">
                          {r.others_description || ''}
                        </td>
                        <td className="text-center">
                          <button
                            className="btn btn-sm me-1"
                            style={btnOceanBlue}
                            onClick={() => handleEditPredator(r)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm"
                            style={btnKaraka}
                            onClick={() => handleDeletePredator(r.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {catchesRecords.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center">
                          No records yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ActivityOutcome
