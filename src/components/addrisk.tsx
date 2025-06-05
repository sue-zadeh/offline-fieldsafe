import React, { useState, useEffect } from 'react'
import Select from 'react-select'
import axios from 'axios'
import { Button, Form, Row, Col, Alert, ListGroup } from 'react-bootstrap'

interface Risk {
  id: number
  title: string
  isReadOnly: boolean
}

interface RiskControl {
  id: number
  risk_title_id: number
  control_text: string
  isReadOnly: boolean
}

interface AddRiskProps {
  isSidebarOpen: boolean
}

const AddRisk: React.FC<AddRiskProps> = ({ isSidebarOpen }) => {
  const [allRisks, setAllRisks] = useState<Risk[]>([])
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null)
  const [riskControls, setRiskControls] = useState<RiskControl[]>([])

  // For creating a new Risk + controls
  const [newRiskTitle, setNewRiskTitle] = useState('')
  const [newRiskControls, setNewRiskControls] = useState<string[]>([])

  // For editing notification, loading states
  const [notification, setNotification] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // For editing an existing control
  const [editingControlId, setEditingControlId] = useState<number | null>(null)
  const [editingControlText, setEditingControlText] = useState('')

  // For editing an existing risk title
  const [editingTitle, setEditingTitle] = useState(false)
  const [editingTitleText, setEditingTitleText] = useState('')

  // For adding a single new control to an existing risk
  const [showAddSingleControl, setShowAddSingleControl] = useState(false)
  const [newSingleControl, setNewSingleControl] = useState('')

  // Fetch all risk titles on first render
  useEffect(() => {
    fetchAllRisks()
  }, [])

  // Fetch all risk titles from server
  const fetchAllRisks = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/risks')
      setAllRisks(res.data)
    } catch (err: any) {
      console.error('Error fetching risks:', err.message)
      setNotification('Failed to load risks.')
    } finally {
      setLoading(false)
    }
  }

  // When user selects a risk from <select>, load its controls
  const handleSelectRisk = async (riskId: number) => {
    const foundRisk = allRisks.find((r) => r.id === riskId) || null
    setSelectedRisk(foundRisk)
    setRiskControls([])
    setShowAddSingleControl(false) // hide the single-control form if it was open
    if (!foundRisk) return

    try {
      const res = await axios.get(`/api/risks/${foundRisk.id}/controls`)
      setRiskControls(res.data)
    } catch (err) {
      console.error('Error fetching risk controls:', err)
      setNotification('Failed to load risk controls.')
    }
  }
  const riskOptions = allRisks.map((risk) => ({
    value: risk.id,
    label: risk.title + (risk.isReadOnly ? ' (Read-Only)' : ''),
  }))

  // ================  Creating a NEW risk with multiple controls  ================
  const handleCreateRisk = async () => {
    if (!newRiskTitle.trim()) {
      setNotification('Please provide a risk title.')
      return
    }
    // Ensure at least one control is non-empty
    if (newRiskControls.every((c) => !c.trim())) {
      setNotification('Please provide at least one control.')
      return
    }

    try {
      // Create the new risk title
      const riskRes = await axios.post('/api/risks', {
        title: newRiskTitle,
        isReadOnly: 0,
      })
      const newRiskId = riskRes.data.id

      // Create each control
      for (const ctrl of newRiskControls) {
        if (ctrl.trim()) {
          await axios.post(`/api/risks/${newRiskId}/controls`, {
            control_text: ctrl.trim(),
            isReadOnly: 0,
          })
        }
      }

      setNotification('New risk & controls created successfully!')
      setNewRiskTitle('')
      setNewRiskControls([])
      fetchAllRisks()
    } catch (err) {
      console.error('Error creating risk:', err)
      setNotification('Failed to create risk.')
    }
  }

  // Add another control input for a NEW risk creation
  const addNewControlInput = () => {
    setNewRiskControls((prev) => [...prev, ''])
  }

  // Handle text changes for a NEW risk's controls
  const handleControlChange = (value: string, index: number) => {
    setNewRiskControls((prev) => {
      const copy = [...prev]
      copy[index] = value
      return copy
    })
  }

  // ================  Editing or Deleting an EXISTING risk  ================
  const handleDeleteRisk = async (risk: Risk) => {
    if (risk.isReadOnly) {
      setNotification('Cannot delete a read-only risk.')
      return
    }
    if (!window.confirm(`Delete risk "${risk.title}"?`)) return

    try {
      await axios.delete(`/api/risks/${risk.id}`)
      setNotification(`Risk "${risk.title}" deleted.`)
      setSelectedRisk(null)
      setRiskControls([])
      fetchAllRisks()
    } catch (err) {
      console.error('Error deleting risk:', err)
      setNotification('Failed to delete risk.')
    }
  }

  // Toggle the risk title editing form
  const toggleEditTitle = () => {
    if (!selectedRisk) return
    setEditingTitle(!editingTitle)
    setEditingTitleText(selectedRisk.title) // preload current title
  }

  // Save edited risk title to DB
  const handleEditTitle = async () => {
    if (!selectedRisk || !editingTitleText.trim()) return
    /* Update the array in state (which it's done with fetchAllRisks())
   Also update the currently selected risk so the UI reflects the new title
*/

    try {
      await axios.put(`/api/risks/${selectedRisk.id}`, {
        title: editingTitleText.trim(),
      })
      setNotification('Risk title updated successfully!')
      // Immediately update the currently selected risk in local state
      setSelectedRisk((prev) =>
        prev ? { ...prev, title: editingTitleText.trim() } : null
      )
      // re-fetch everything
      fetchAllRisks()
      setEditingTitle(false)
    } catch (err) {
      console.error('Error editing title:', err)
      setNotification('Failed to edit title.')
    }
  }

  // ================  Adding / Editing / Deleting controls for EXISTING risk  ================
  const startEditControl = (ctrl: RiskControl) => {
    if (ctrl.isReadOnly) {
      setNotification('Cannot edit a read-only control.')
      return
    }
    setEditingControlId(ctrl.id)
    setEditingControlText(ctrl.control_text)
  }

  const handleSaveControlEdit = async () => {
    if (!editingControlId) return
    try {
      await axios.put(`/api/risk_controls/${editingControlId}`, {
        control_text: editingControlText.trim(),
      })
      setEditingControlId(null)
      setEditingControlText('')
      if (selectedRisk) handleSelectRisk(selectedRisk.id)
    } catch (err) {
      console.error('Error saving control:', err)
      setNotification('Failed to save control.')
    }
  }

  const handleDeleteControl = async (ctrl: RiskControl) => {
    if (ctrl.isReadOnly) {
      setNotification('Cannot delete a read-only control.')
      return
    }
    if (!window.confirm(`Delete control "${ctrl.control_text}"?`)) return

    try {
      await axios.delete(`/api/risk_controls/${ctrl.id}`)
      setNotification('Control deleted.')
      if (selectedRisk) handleSelectRisk(selectedRisk.id)
    } catch (err) {
      console.error('Error deleting control:', err)
      setNotification('Failed to delete control.')
    }
  }

  // Show/hide the input for adding a single control to the existing risk
  const handleAddRiskControl = () => {
    setShowAddSingleControl(!showAddSingleControl)
    setNewSingleControl('')
  }

  // Actually add a single new control to DB for the selected risk
  const handleSaveNewRiskControl = async () => {
    if (!selectedRisk) return
    if (!newSingleControl.trim()) {
      setNotification('Please enter some text for the new control.')
      return
    }

    try {
      await axios.post(`/api/risks/${selectedRisk.id}/controls`, {
        control_text: newSingleControl.trim(),
        isReadOnly: 0,
      })
      setNotification('New control added successfully!')
      setNewSingleControl('')
      setShowAddSingleControl(false)
      handleSelectRisk(selectedRisk.id) // Refresh controls
    } catch (err) {
      console.error('Error adding new control:', err)
      setNotification('Failed to add new control.')
    }
  }

  // Auto-clear notifications after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  return (
    <div
      className={`container-fluid ${
        isSidebarOpen ? 'content-expanded' : 'content-collapsed'
      }`}
    >
      <h2
        style={{ color: '#0094B6', fontWeight: 'bold', paddingBottom: '4rem' }}
      >
        Add / Edit Risks
      </h2>
      {notification && <Alert variant="info">{notification}</Alert>}
      {loading && <div>Loading...</div>}

      <Row>
        {/* ================= Column for Managing EXISTING Risks ================ */}

        <Col className="ml-2" md={6}>
          <h5 className="fs-5 fw-bold " style={{ color: '#0094B6' }}>
            Existing Risks
          </h5>

          <Select
            options={riskOptions}
            onChange={(option) => {
              if (!option) {
                // user cleared the dropdown
                setSelectedRisk(null)
                setRiskControls([])
                return
              }
              handleSelectRisk(Number(option.value))
            }}
            value={
              selectedRisk
                ? riskOptions.find((opt) => opt.value === selectedRisk.id) ||
                  null
                : null
            }
            placeholder="-- Select Risk --"
            styles={{
              option: (base) => ({
                ...base,
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
              }),
              control: (base) => ({
                ...base,
                maxWidth: '100%',
                whiteSpace: 'pre-wrap',
              }),
              menu: (base) => ({
                ...base,
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
              }),
            }}
          />

          {/* Show the selected risk’s details */}
          {selectedRisk && (
            <div style={{ marginBottom: '1.5rem' }}>
              {/* Show an EDIT TITLE button if not read-only */}
              {selectedRisk.isReadOnly ? (
                <h5
                  className="text-wrap p-1"
                  style={{
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    maxWidth: '100%',
                  }}
                >
                  {selectedRisk.title} (Read-Only)
                </h5>
              ) : (
                <>
                  {editingTitle ? (
                    <div
                      className="text-wrap p-1"
                      style={{
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        maxWidth: '100%',
                      }}
                    >
                      <Form.Control
                        value={editingTitleText}
                        onChange={(e) => setEditingTitleText(e.target.value)}
                      />
                      <Button
                        style={{ backgroundColor: '#738c40', color: 'white' }}
                        className="mr-8px mt-4px w-25 rounded"
                        onClick={handleEditTitle}
                        variant="success"
                        size="sm"
                      >
                        Save Title
                      </Button>
                      <Button
                        className="mt-4px fs-6 w-15 rounded "
                        onClick={() => setEditingTitle(false)}
                        variant="outline-secondary"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                      }}
                    >
                      <h5
                        className="text-wrap p-1"
                        style={{
                          whiteSpace: 'pre-wrap',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          maxWidth: '80%',
                        }}
                      >
                        {selectedRisk.title}
                      </h5>
                      <Button
                        style={{ backgroundColor: '#0094b6', color: 'white' }}
                        className="w-25 fs-6 mt-3 rounded"
                        variant="warning"
                        size="sm"
                        onClick={toggleEditTitle}
                      >
                        Edit Title
                      </Button>
                    </div>
                  )}
                </>
              )}

              {/* Risk Delete button if not read-only */}
              {!selectedRisk.isReadOnly && (
                <Button
                  style={{ backgroundColor: '#D37B49', color: 'white' }}
                  className="mt-2 fs-6 w-25 rounded"
                  variant="danger"
                  onClick={() => handleDeleteRisk(selectedRisk)}
                  size="sm"
                  // style={{ marginTop: '0.5rem' }}
                >
                  Delete Risk
                </Button>
              )}
            </div>
          )}

          {/* List of controls */}
          {selectedRisk && (
            <div
              style={{
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                maxWidth: '100%',
              }}
            >
              {/* =====Risk Controls Table with bullets==== */}
              <h5 className="">
                <b>Risk Controls</b>
              </h5>
              <ListGroup
                style={
                  {
                    // display: 'flex',
                    //   whiteSpace: 'pre-wrap',
                    //   wordWrap: 'break-word',
                    //   overflowWrap: 'break-word',
                    //   maxWidth: '100%',
                  }
                }
              >
                {riskControls.map((ctrl) => (
                  <ListGroup.Item
                    key={ctrl.id}
                    style={{
                      // display: 'flex',
                      // alignItems: 'flex-start',
                      whiteSpace: 'pre-wrap',
                      overflowWrap: 'break-word',
                      wordWrap: 'break-word',
                      wordBreak:
                        'break-word' /* for too long strings with no spaces */,
                    }}
                  >
                    {/*Bullet for risk control lists */}
                    <div style={{ display: 'flex', whiteSpace: 'pre-wrap' }}>
                      <span
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          fontSize: '1.60rem',
                          marginRight: '5px',
                        }}
                      >
                        •
                      </span>
                      {/* If editing this control */}
                      {editingControlId === ctrl.id ? (
                        <div style={{ flex: 1 }}>
                          <Form.Control
                            value={editingControlText}
                            onChange={(e) =>
                              setEditingControlText(e.target.value)
                            }
                            style={{ marginBottom: '6px' }}
                          />
                          <Button
                            className="rounded"
                            style={{
                              backgroundColor: '#738c40',
                              color: 'white',
                            }}
                            onClick={handleSaveControlEdit}
                            size="sm"
                            variant="success"
                          >
                            Save
                          </Button>
                        </div>
                      ) : (
                        <div style={{ flex: 1, whiteSpace: 'pre-wrap' }}>
                          {ctrl.control_text}
                          {/* Edit / Delete only if not read-only control */}
                          {!ctrl.isReadOnly && (
                            <div style={{ marginTop: '6px' }}>
                              <Button
                                className="fs-6 px-3 text-light rounded"
                                onClick={() => startEditControl(ctrl)}
                                variant="warning"
                                size="sm"
                                style={{
                                  backgroundColor: '#0094b6',
                                  marginRight: '4px',
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                style={{
                                  backgroundColor: '#D37B40',
                                  marginRight: '4px',
                                }}
                                className="fs-6 px-3"
                                onClick={() => handleDeleteControl(ctrl)}
                                variant="danger"
                                size="sm"
                              >
                                Delete
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>

              {/* Add new control to existing risk (only if not read-only) */}
              {!selectedRisk.isReadOnly && (
                <div style={{ marginTop: '1rem' }}>
                  <Button
                    className="fs-6 px-3"
                    style={{ backgroundColor: '#0094B6' }}
                    onClick={handleAddRiskControl}
                    size="sm"
                  >
                    {showAddSingleControl ? 'Cancel' : 'Add New Control'}
                  </Button>
                  {showAddSingleControl && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <Form.Control
                        type="text"
                        value={newSingleControl}
                        onChange={(e) => setNewSingleControl(e.target.value)}
                        placeholder="Enter new control text..."
                        style={{ marginBottom: '0.5rem' }}
                      />
                      <Button
                        className="fs-6 px-2 m-2"
                        onClick={handleSaveNewRiskControl}
                        size="sm"
                        variant="primary"
                      >
                        Save Control
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </Col>
        {/* ================= Column for Creating a NEW Risk ================ */}
        <Col
          md={6}
          style={{
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            maxWidth: '100%',
          }}
        >
          <h4
            style={{
              color: '#0094B6',
              fontWeight: 'bold',
              paddingBottom: '2rem',
              textAlign: 'center',
            }}
          >
            Create a New Risk
          </h4>
          <Form.Group
            className="mb-3"
            style={{
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              maxWidth: '100%',
            }}
          >
            <Form.Label
              className="fs-5 fw-bold px-5"
              style={{ color: '#0094B6' }}
            >
              Risk Title
            </Form.Label>
            <Form.Control
              type="text"
              value={newRiskTitle}
              onChange={(e) => setNewRiskTitle(e.target.value)}
              style={{
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                maxWidth: '100%',
              }}
            />
          </Form.Group>
          {newRiskControls.map((ctrl, i) => (
            <Form.Group key={i} className="mb-2">
              <Form.Label>Control #{i + 1}</Form.Label>
              <Form.Control
                type="text"
                value={ctrl}
                onChange={(e) => handleControlChange(e.target.value, i)}
                style={{
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  maxWidth: '100%',
                }}
              />
            </Form.Group>
          ))}
          <Button
            className="w-50 fs-6  mx-5 align-center justify-content-center rounded"
            style={{ backgroundColor: '#738c40', marginRight: '4px' }}
            onClick={addNewControlInput}
            variant="secondary"
            size="sm"
          >
            + Add Control
          </Button>{' '}
          <Button
            className="w-50 fs-6 mt-2 mx-5 rounded"
            style={{ backgroundColor: '#0094B6' }}
            onClick={handleCreateRisk}
            variant="primary"
            size="sm"
          >
            Create Risk
          </Button>
        </Col>
      </Row>
    </div>
  )
}

export default AddRisk
