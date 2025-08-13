import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { saveOfflineItem, storeOfflineActivityData, getOfflineActivityData, cacheActivityAssignments, getCachedActivityAssignments } from '../utils/localDB'

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
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

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


  // ============ On Load, fetch project objectives & predator data ============
  useEffect(() => {
    if (!activityId) return
    loadObjectives()
    loadPredatorData()
    loadPredatorRecords()
  }, [activityId])

  const loadObjectives = async () => {
    console.log(`🔍 Loading objectives for activity ${activityId}, online: ${navigator.onLine}`)
    
    try {
      let objectivesData: IProjectObjective[] = []
      
      if (navigator.onLine) {
        try {
          // First, get the project ID for this activity
          const activityRes = await axios.get(`/api/activities/${activityId}`)
          const projectId = activityRes.data.project_id
          console.log(`🎯 Activity ${activityId} belongs to project ${projectId}`)
          
          // Then, get ALL project objectives and their activity-specific values
          const res = await axios.get(`/api/project_objectives_with_activity_values?projectId=${projectId}&activityId=${activityId}`)
          objectivesData = res.data || []
          console.log(`✅ Loaded ${objectivesData.length} project objectives from server`)
          
          // Cache server data for offline viewing
          await cacheActivityAssignments(activityId, 'objectives', objectivesData)
          console.log(`💾 Cached ${objectivesData.length} objectives for offline viewing`)
        } catch (err) {
          console.log('❌ Server request failed, trying fallback API:', err)
          // Fallback to original API if new one doesn't exist yet
          try {
            const res = await axios.get(`/api/activity_outcome/${activityId}`)
            objectivesData = res.data.objectives || []
            console.log(`✅ Loaded ${objectivesData.length} objectives from fallback API`)
            
            // Cache server data for offline viewing
            await cacheActivityAssignments(activityId, 'objectives', objectivesData)
            console.log(`💾 Cached ${objectivesData.length} objectives for offline viewing`)
          } catch (fallbackErr) {
            console.log('❌ Fallback API also failed, trying cached data:', fallbackErr)
            // If server fails, try cached historical data
            objectivesData = await getCachedActivityAssignments(activityId, 'objectives')
            console.log(`📚 Loaded ${objectivesData.length} objectives from cache`)
          }
        }
      } else {
        // Offline: load cached historical data first
        objectivesData = await getCachedActivityAssignments(activityId, 'objectives')
        console.log(`📚 Offline: Loaded ${objectivesData.length} historical objectives from cache`)
      }
      
      // Always load offline assignments and merge them
      const offlineObjectives: IProjectObjective[] = await getOfflineActivityData(activityId, 'objectives')
      console.log(`📦 Found ${offlineObjectives.length} offline objective assignments`)
      
      // Merge cached/server and offline data (avoid duplicates)
      const allObjectiveIds = new Set(objectivesData.map(o => o.activityObjectiveId || o.objective_id))
      const offlineOnlyObjectives = offlineObjectives.filter((o: IProjectObjective) => 
        !allObjectiveIds.has(o.activityObjectiveId || o.objective_id)
      )
      
      const finalObjectives = [...objectivesData, ...offlineOnlyObjectives]
      console.log(`📊 Total objectives: ${finalObjectives.length} (${objectivesData.length} historical + ${offlineOnlyObjectives.length} offline-only)`)
      setObjectives(finalObjectives)
      
    } catch (err) {
      console.error('❌ Error loading project objectives:', err)
      // Final fallback to only offline data
      try {
        const offlineObjectives: IProjectObjective[] = await getOfflineActivityData(activityId, 'objectives')
        console.log(`🔄 Final fallback: Using ${offlineObjectives.length} offline objectives`)
        setObjectives(offlineObjectives)
      } catch (offlineErr) {
        console.error('❌ Error loading offline objectives:', offlineErr)
        alert('Failed to load project objectives.')
      }
    }
  }

  const loadPredatorData = async () => {
    try {
      if (navigator.onLine) {
        const res = await axios.get<IPredatorOption[]>('/api/predator')
        setPredatorList(res.data)
      } else {
        // In offline mode, you might want to cache predator options too
        // For now, we'll show empty if offline and no cache
        setPredatorList([])
      }
    } catch (err) {
      console.error('Error fetching predator list:', err)
      if (navigator.onLine) {
        alert('Failed to load predator list.')
      }
    }
  }

  const loadPredatorRecords = async () => {
    console.log(`🔍 Loading predator records for activity ${activityId}, online: ${navigator.onLine}`)
    
    try {
      let predatorData: IPredatorRecord[] = []
      
      if (navigator.onLine) {
        try {
          const res = await axios.get<IPredatorRecord[]>(`/api/activity_predator/${activityId}`)
          predatorData = res.data
          console.log(`✅ Loaded ${predatorData.length} predator records from server`)
          
          // Cache server data for offline viewing
          await cacheActivityAssignments(activityId, 'predator_records', predatorData)
          console.log(`💾 Cached ${predatorData.length} predator records for offline viewing`)
        } catch (err) {
          console.log('❌ Server request failed, trying cached data:', err)
          // If server fails, try cached historical data
          predatorData = await getCachedActivityAssignments(activityId, 'predator_records')
          console.log(`📚 Loaded ${predatorData.length} predator records from cache`)
        }
      } else {
        // Offline: load cached historical data first
        predatorData = await getCachedActivityAssignments(activityId, 'predator_records')
        console.log(`📚 Offline: Loaded ${predatorData.length} historical predator records from cache`)
      }
      
      // Always load offline assignments and merge them
      const offlinePredatorRecords: IPredatorRecord[] = await getOfflineActivityData(activityId, 'predator_records')
      console.log(`📦 Found ${offlinePredatorRecords.length} offline predator record assignments`)
      
      // Merge cached/server and offline data (avoid duplicates)
      const allRecordIds = new Set(predatorData.map(p => p.id))
      const offlineOnlyRecords = offlinePredatorRecords.filter((p: IPredatorRecord) => !allRecordIds.has(p.id))
      
      const finalRecords = [...predatorData, ...offlineOnlyRecords]
      console.log(`📊 Total predator records: ${finalRecords.length} (${predatorData.length} historical + ${offlineOnlyRecords.length} offline-only)`)
      setPredatorRecords(finalRecords)
      
    } catch (err) {
      console.error('❌ Error fetching predator records:', err)
      // Final fallback to only offline data
      try {
        const offlinePredatorRecords: IPredatorRecord[] = await getOfflineActivityData(activityId, 'predator_records')
        console.log(`🔄 Final fallback: Using ${offlinePredatorRecords.length} offline predator records`)
        setPredatorRecords(offlinePredatorRecords)
      } catch (offlineErr) {
        console.error('❌ Error loading offline predator records:', offlineErr)
        alert('Failed to load predator records.')
      }
    }
  }

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
    // Find the original objective in our state
    const originalObj = objectives.find(
      (o) => o.activityObjectiveId === activityObjectiveId
    )
    
    if (!originalObj) {
      alert('Objective not found')
      return
    }

    // Check if this is an existing activity_objective (has real activityObjectiveId) 
    // or a new one (activityObjectiveId equals objective_id, meaning no activity_objectives entry exists)
    const isExistingActivityObjective = originalObj.activityObjectiveId !== originalObj.objective_id
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
      if (navigator.onLine) {
        if (isExistingActivityObjective) {
          // UPDATE existing activity_objectives entry
          console.log(`💾 Updating existing activity objective ${activityObjectiveId}`)
          await axios.put(`/api/activity_objectives/${activityObjectiveId}`, {
            amount: editAmount ? Number(editAmount) : null,
          })
        } else {
          // CREATE new activity_objectives entry
          console.log(`✨ Creating new activity objective for objective ${originalObj.objective_id}`)
          await axios.post('/api/activity_objectives_for_existing', {
            activity_id: activityId,
            objective_id: originalObj.objective_id,
            amount: editAmount ? Number(editAmount) : null,
          })
        }
        
        // Re-fetch the objectives for this activity
        await loadObjectives()
        alert('Saved successfully!')
      } else {
        // Offline mode - save for later sync
        if (isExistingActivityObjective) {
          // Save UPDATE for existing
          await saveOfflineItem({
            type: 'activity_objective_update',
            data: {
              activity_objective_id: activityObjectiveId,
              amount: editAmount ? Number(editAmount) : null,
              timestamp: Date.now()
            },
            synced: false,
            timestamp: Date.now()
          })
        } else {
          // Save INSERT for new
          await saveOfflineItem({
            type: 'activity_objective_create',
            data: {
              activity_id: activityId,
              objective_id: originalObj.objective_id,
              amount: editAmount ? Number(editAmount) : null,
              timestamp: Date.now()
            },
            synced: false,
            timestamp: Date.now()
          })
        }

        // Update local state immediately
        const updatedObjectives = objectives.map(obj => 
          obj.activityObjectiveId === activityObjectiveId 
            ? { ...obj, amount: editAmount ? Number(editAmount) : null }
            : obj
        )
        setObjectives(updatedObjectives)
        
        // Store updated objectives offline for persistence
        await storeOfflineActivityData(activityId, 'objectives', updatedObjectives)
        
        alert('Objective saved offline and will sync when online!')
      }
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
      if (navigator.onLine) {
        await axios.post('/api/activity_objectives_direct', {
          activity_id: activityId,
          title: newObjectiveTitle.trim(),
          measurement: newObjectiveMeasurement.trim(),
        })
        
        // Refresh
        await loadObjectives()
        setNewObjectiveTitle('')
        setNewObjectiveMeasurement('')
        alert('Objective added successfully!')
      } else {
        // Offline mode - save for later sync
        await saveOfflineItem({
          type: 'activity_objective_update',
          data: {
            activity_id: activityId,
            title: newObjectiveTitle.trim(),
            measurement: newObjectiveMeasurement.trim(),
            is_new: true,
            timestamp: Date.now()
          },
          synced: false,
          timestamp: Date.now()
        })

        // Add to local state immediately for display
        const tempId = Date.now() // Temporary ID for offline
        const newObjective: IProjectObjective = {
          activityObjectiveId: tempId,
          objective_id: tempId,
          title: newObjectiveTitle.trim(),
          measurement: newObjectiveMeasurement.trim(),
          amount: null
        }
        
        const updatedObjectives = [...objectives, newObjective]
        setObjectives(updatedObjectives)
        
        // Store updated objectives offline for persistence
        await storeOfflineActivityData(activityId, 'objectives', updatedObjectives)
        
        setNewObjectiveTitle('')
        setNewObjectiveMeasurement('')
        alert('Objective saved offline and will sync when online!')
      }
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
      if (navigator.onLine) {
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
        await loadPredatorRecords()
        resetPredatorForm()
      } else {
        // Offline mode - save for later sync
        await saveOfflineItem({
          type: 'activity_predator',
          data: {
            activity_id: activityId,
            predator_id: selectedPredatorId,
            measurement: pMeasurement,
            rats,
            possums,
            mustelids,
            hedgehogs,
            others,
            othersDescription,
            is_edit: !!editingPredId,
            predator_record_id: editingPredId,
            timestamp: Date.now()
          },
          synced: false,
          timestamp: Date.now()
        })

        // Update local state immediately for display
        const predatorSubType = predatorList.find(p => p.id === selectedPredatorId)?.sub_type || 'Unknown'
        if (!editingPredId) {
          // Add new record
          const tempId = Date.now() // Temporary ID for offline
          const newRecord: IPredatorRecord = {
            id: tempId,
            activity_id: activityId,
            predator_id: selectedPredatorId,
            sub_type: predatorSubType,
            measurement: pMeasurement,
            rats,
            possums,
            mustelids,
            hedgehogs,
            others,
            others_description: othersDescription,
          }
          
          const updatedRecords = [...predatorRecords, newRecord]
          setPredatorRecords(updatedRecords)
          
          // Store updated records offline for persistence
          await storeOfflineActivityData(activityId, 'predator_records', updatedRecords)
        } else {
          // Update existing record
          const updatedRecords = predatorRecords.map(record => 
            record.id === editingPredId 
              ? { 
                  ...record, 
                  predator_id: selectedPredatorId,
                  sub_type: predatorSubType,
                  measurement: pMeasurement,
                  rats,
                  possums,
                  mustelids,
                  hedgehogs,
                  others,
                  others_description: othersDescription,
                }
              : record
          )
          setPredatorRecords(updatedRecords)
          
          // Store updated records offline for persistence
          await storeOfflineActivityData(activityId, 'predator_records', updatedRecords)
        }

        alert(!editingPredId ? 'Predator record saved offline and will sync when online!' : 'Predator record updated offline and will sync when online!')
        resetPredatorForm()
      }
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
    if (!navigator.onLine) {
      alert('Delete functionality is not available in offline mode. Please try again when online.')
      return
    }
    
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
        {isOffline && (
          <div className="alert alert-warning text-center mb-3" role="alert">
            <strong>Offline Mode:</strong> You can view historical data and add/edit outcomes offline. Changes will sync when online.
          </div>
        )}
        
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
                              disabled={isOffline}
                              title={isOffline ? 'Delete functionality not available offline' : ''}
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
                              disabled={isOffline}
                              title={isOffline ? 'Delete functionality not available offline' : ''}
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
                            disabled={isOffline}
                            title={isOffline ? 'Delete functionality not available offline' : ''}
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
