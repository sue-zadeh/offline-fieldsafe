import React, { useState, useEffect, FormEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios, { AxiosError } from 'axios'
import {
  Table,
  Form,
  Button,
  Alert,
  Card,
  Row,
  Col,
  ListGroup,
} from 'react-bootstrap'

interface Objective {
  id: number
  title: string
  measurement: string
  dateStart?: string
  dateEnd?: string
}

interface AddObjectivesProps {
  isSidebarOpen: boolean
  onNewObjectiveCreated?: () => void
  onObjectivesChanged?: () => void
  onObjectivesEdited?: () => void
  // Project integration props
  projectFormData?: any
  selectedObjectives?: number[]
  onObjectivesSelectionChange?: (objectives: number[]) => void
}

const AddObjectives: React.FC<AddObjectivesProps> = ({
  isSidebarOpen,
  onNewObjectiveCreated,
  onObjectivesChanged,
  onObjectivesEdited,
  projectFormData,
  selectedObjectives = [],
  onObjectivesSelectionChange,
}) => {
  const navigate = useNavigate()
  const location = useLocation()

  const [objectives, setObjectives] = useState<Objective[]>([])
  const [title, setTitle] = useState('')
  const [measurement, setMeasurement] = useState('')
  const [notification, setNotification] = useState<string | null>(null)

  // For editing an existing objective
  const [editObj, setEditObj] = useState<Objective | null>(null)

  // For project objective selection
  const [localSelectedObjectives, setLocalSelectedObjectives] = useState<
    number[]
  >([])

  // Initialize localSelectedObjectives only once when component mounts
  useEffect(() => {
    const projectData = projectFormData || location.state?.projectFormData

    if (projectData && projectData.selectedObjectives) {
      console.log(
        '🎯 Initializing from project data:',
        projectData.selectedObjectives
      )
      setLocalSelectedObjectives(projectData.selectedObjectives)
    } else if (selectedObjectives && selectedObjectives.length > 0) {
      console.log('🎯 Initializing from props:', selectedObjectives)
      setLocalSelectedObjectives(selectedObjectives)
    } else {
      console.log('🎯 Initializing with empty array')
      setLocalSelectedObjectives([])
    }
  }, []) // Remove dependencies to prevent re-running

  useEffect(() => {
    fetchObjectives()
  }, [])

  const fetchObjectives = async () => {
    try {
      const res = await axios.get('/api/objectives')
      setObjectives(res.data)
    } catch (err) {
      console.error('Error fetching objectives:', err)
      setNotification('Failed to load objectives.')
    }
  }

  // Handle objective selection for project
  const toggleObjectiveSelection = (objId: number) => {
    setLocalSelectedObjectives((prev) => {
      const isSelected = prev.includes(objId)
      const newSelection = isSelected
        ? prev.filter((id) => id !== objId)
        : [...prev, objId]

      // Update parent component if callback exists
      if (onObjectivesSelectionChange) {
        onObjectivesSelectionChange(newSelection)
      }

      return newSelection
    })
  }

  // Handle project save with objectives
  const handleProjectSave = async () => {
    const projectData = projectFormData || location.state?.projectFormData
    if (!projectData) {
      setNotification(
        'No project data found. Please return to project details.'
      )
      return
    }

    try {
      // Build FormData for project submission
      const formData = new FormData()
      formData.append('name', projectData.name)
      formData.append('location', projectData.location)
      formData.append('startDate', projectData.startDate)
      formData.append('status', projectData.status)
      const adminId = localStorage.getItem('adminId')
      if (adminId) {
        formData.append('createdBy', adminId)
      }
      formData.append('emergencyServices', projectData.emergencyServices)
      formData.append(
        'localMedicalCenterAddress',
        projectData.localMedicalCenterAddress
      )
      formData.append(
        'localMedicalCenterPhone',
        projectData.localMedicalCenterPhone
      )
      formData.append('localHospital', projectData.localHospital)
      formData.append('primaryContactName', projectData.primaryContactName)
      formData.append('primaryContactPhone', projectData.primaryContactPhone)
      formData.append('objectives', JSON.stringify(localSelectedObjectives))

      if (projectData.imageFile) formData.append('image', projectData.imageFile)
      if (projectData.inductionFile)
        formData.append('inductionFile', projectData.inductionFile)

      if (projectData.isEdit && projectData.projectId) {
        // Update existing project
        await axios.put(`/api/projects/${projectData.projectId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        setNotification('Project updated successfully!')
      } else {
        // Create new project
        await axios.post('/api/projects', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        setNotification('Project created successfully!')
      }

      // Navigate to search projects page
      setTimeout(() => {
        navigate('/searchproject', {
          state: {
            redirectTo:
              projectData.status === 'archived'
                ? 'archiveprojects'
                : 'activeprojects',
          },
        })
      }, 1500)
    } catch (err) {
      const axiosErr = err as AxiosError<{ message: string }>
      if (axiosErr.response?.status === 400) {
        setNotification('Project name already exists. Please choose another.')
      } else {
        console.error('Error saving project:', err)
        setNotification('Failed to save project.')
      }
    }
  }

  // Handle save as new project
  const handleProjectSaveAsNew = async () => {
    const projectData = projectFormData || location.state?.projectFormData
    if (!projectData) {
      setNotification(
        'No project data found. Please return to project details.'
      )
      return
    }

    try {
      // Build FormData for new project
      const formData = new FormData()
      formData.append('name', projectData.name)
      formData.append('location', projectData.location)
      formData.append('startDate', projectData.startDate)
      formData.append('status', projectData.status)
      const adminId = localStorage.getItem('adminId')
      if (adminId) {
        formData.append('createdBy', adminId)
      }
      formData.append('emergencyServices', projectData.emergencyServices)
      formData.append(
        'localMedicalCenterAddress',
        projectData.localMedicalCenterAddress
      )
      formData.append(
        'localMedicalCenterPhone',
        projectData.localMedicalCenterPhone
      )
      formData.append('localHospital', projectData.localHospital)
      formData.append('primaryContactName', projectData.primaryContactName)
      formData.append('primaryContactPhone', projectData.primaryContactPhone)
      formData.append('objectives', JSON.stringify(localSelectedObjectives))

      if (projectData.imageFile) formData.append('image', projectData.imageFile)
      if (projectData.inductionFile)
        formData.append('inductionFile', projectData.inductionFile)

      await axios.post('/api/projects', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setNotification('Project saved as new project successfully!')

      setTimeout(() => {
        navigate('/searchproject', {
          state: {
            redirectTo: 'activeprojects',
          },
        })
      }, 1500)
    } catch (err) {
      const axiosErr = err as AxiosError<{ message: string }>
      if (axiosErr.response?.status === 400) {
        setNotification('Project name already exists. Please choose another.')
      } else {
        console.error('Error saving project as new:', err)
        setNotification('Failed to save project as new.')
      }
    }
  }

  // Get project data for display
  const projectData = projectFormData || location.state?.projectFormData
  const selectedObjectivesText = objectives
    .filter((obj) => localSelectedObjectives.includes(obj.id))
    .map((o) => `${o.title} (${o.measurement})`)
    .join(', ')

  // auto-clear notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  // ADD NEW OBJECTIVE
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    // If the user is currently editing an objective, block creating a new one
    if (editObj) {
      setNotification('Finish or cancel editing before adding a new objective.')
      return
    }
    if (!title.trim() || !measurement.trim()) {
      setNotification('Please fill in both Title and Measurement.')
      return
    }

    try {
      await axios.post('/api/objectives', {
        title: title.trim(),
        measurement: measurement.trim(),
      })
      setNotification('Objective added successfully!')

      setTitle('')
      setMeasurement('')
      fetchObjectives()
      // Call the parent's callback so the parent can re-fetch
      if (onNewObjectiveCreated) {
        onNewObjectiveCreated()
      }
    } catch (err: any) {
      console.error('Error adding objective:', err.response?.data || err)
      setNotification(err.response?.data?.message || 'Failed to add objective.')
    }
  }

  // EDIT MODE
  const handleEditClick = (obj: Objective) => {
    setEditObj({ ...obj })
  }

  const handleEditCancel = () => {
    setEditObj(null)
  }

  const handleEditSave = async () => {
    if (!editObj) return
    const { id, title, measurement } = editObj
    if (!title.trim() || !measurement.trim()) {
      setNotification('Please fill in both Title and Measurement for editing.')
      return
    }

    try {
      await axios.put(`/api/objectives/${id}`, {
        title: title.trim(),
        measurement: measurement.trim(),
      })
      setNotification('Objective updated successfully!')
      setEditObj(null)
      fetchObjectives()
      onObjectivesEdited?.()
    } catch (err: any) {
      console.error('Error updating objective:', err.response?.data || err)
      setNotification(
        err.response?.data?.message || 'Failed to update objective.'
      )
    }
  }

  // DELETE
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this objective?')) {
      return
    }

    try {
      await axios.delete(`/api/objectives/${id}`)
      setNotification('Objective deleted successfully!')

      // To updates the child’s local objective list
      fetchObjectives()
      // tell the parent to re-fetch
      onObjectivesChanged?.()
    } catch (err: any) {
      console.error('Error deleting objective:', err.response?.data || err)
      setNotification(
        err.response?.data?.message || 'Failed to delete objective.'
      )
    }
  }

  return (
    <div
      className={`container-fluid ${
        isSidebarOpen ? 'content-expanded' : 'content-collapsed'
      }`}
      style={{
        transition: 'margin 0.3s ease',
        paddingTop: '1rem',
        paddingBottom: '2rem',
      }}
    >
      {/* Project Information Section - Only show if in project mode */}
      {projectData && (
        <div className="mb-4">
          <Card className="border-primary">
            <Card.Header style={{ backgroundColor: '#0094B6', color: 'white' }}>
              <h4 className="mb-0">
                {projectData.isEdit ? 'Edit Project:' : 'Create Project:'}{' '}
                {projectData.name}
              </h4>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={8}>
                  <p>
                    <strong>Location:</strong> {projectData.location}
                  </p>
                  <p>
                    <strong>Start Date:</strong> {projectData.startDate}
                  </p>
                  <p>
                    <strong>Primary Contact:</strong>{' '}
                    {projectData.primaryContactName} (
                    {projectData.primaryContactPhone})
                  </p>
                </Col>
                <Col md={4}>
                  <p>
                    <strong>Status:</strong> {projectData.status}
                  </p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </div>
      )}

      <h2
        className="fw-bold mb-4"
        style={{
          color: '#0094B6',
          marginTop: projectData ? '1rem' : '2rem',
          textAlign: 'center',
        }}
      >
        {projectData ? 'Select Project Objectives' : 'Manage Objectives'}
      </h2>

      {notification && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            zIndex: 9999,
          }}
        >
          <Alert variant="info" className="text-center m-0 rounded-0">
            {notification}
          </Alert>
        </div>
      )}

      <Row className="g-4 px-3">
        {/* Left: Project Objective Selection - Only show if in project mode */}
        {projectData && (
          <Col xs={12} md={4}>
            <Card
              className="border-0 h-100"
              style={{ backgroundColor: '#f8f9fa' }}
            >
              <Card.Header
                className="border-0"
                style={{ backgroundColor: '#e9ecef', padding: '0.5rem' }}
              >
                <div className="text-center">
                  <small
                    className="fw-bold d-block"
                    style={{ fontSize: '0.75rem', color: '#495057' }}
                  >
                    📋 Select Project
                  </small>
                  <small
                    className="fw-bold"
                    style={{ fontSize: '0.75rem', color: '#495057' }}
                  >
                    Objectives
                  </small>
                </div>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Choose Objectives</Form.Label>
                  {objectives.length === 0 ? (
                    <Alert variant="warning" className="text-center">
                      No objectives available. Create some first.
                    </Alert>
                  ) : (
                    <ListGroup
                      style={{ maxHeight: '300px', overflowY: 'auto' }}
                    >
                      {objectives.map((obj) => (
                        <ListGroup.Item
                          key={obj.id}
                          action
                          active={localSelectedObjectives.includes(obj.id)}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            toggleObjectiveSelection(obj.id)
                          }}
                          className="d-flex justify-content-between align-items-center"
                          style={{
                            cursor: 'pointer',
                            fontSize: '0.9em',
                            padding: '0.75rem',
                            border: '1px solid #dee2e6',
                            marginBottom: '2px',
                          }}
                        >
                          {obj.title} ({obj.measurement})
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                </Form.Group>

                <div className="mb-3">
                  <Form.Label>Selected Summary:</Form.Label>
                  <div
                    style={{
                      backgroundColor: '#e9ecef',
                      padding: '10px',
                      borderRadius: '4px',
                      minHeight: '50px',
                      fontSize: '0.9em',
                    }}
                  >
                    {selectedObjectivesText || <em>None selected</em>}
                  </div>
                </div>

                {/* Project Action Buttons */}
                <div className="d-flex flex-column gap-2">
                  {projectData.isEdit ? (
                    <>
                      <Button
                        variant="primary"
                        onClick={handleProjectSave}
                        style={{ backgroundColor: '#0094B6' }}
                      >
                        💾 Save Changes
                      </Button>
                      <Button
                        variant="warning"
                        onClick={handleProjectSaveAsNew}
                      >
                        📝 Save as New
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="success"
                      onClick={handleProjectSave}
                      style={{ backgroundColor: '#28a745' }}
                    >
                      ✅ Create Project
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    onClick={() => {
                      // Navigate back with current project data and selected objectives
                      navigate('/addproject', {
                        state: {
                          projectFormData:
                            projectFormData || location.state?.projectFormData,
                          selectedObjectives: localSelectedObjectives,
                          activeTab: 'details',
                        },
                      })
                    }}
                  >
                    ← Back to Details
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        )}

        {/* Middle: Add New Objective Form */}
        <Col xs={12} md={projectData ? 4 : 6}>
          <Card
            className="border-0 h-100"
            style={{ backgroundColor: '#f8f9fa' }}
          >
            <Card.Header
              className="border-0"
              style={{ backgroundColor: '#e9ecef', padding: '0.5rem' }}
            >
              <div className="text-center">
                <small
                  className="fw-bold d-block"
                  style={{ fontSize: '0.75rem', color: '#495057' }}
                >
                  ➕ Create New
                </small>
                <small
                  className="fw-bold"
                  style={{ fontSize: '0.75rem', color: '#495057' }}
                >
                  Objective
                </small>
              </div>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="objectiveTitle">
                  <Form.Label>Objective Title</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter a new objective"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="measurement">
                  <Form.Label>Measurement</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Units, e.g. 'Hours', 'm²'..."
                    value={measurement}
                    onChange={(e) => setMeasurement(e.target.value)}
                    required
                  />
                </Form.Group>

                <Button
                  type="submit"
                  className="w-100 mt-2"
                  style={{ backgroundColor: '#76D6E2', color: '#1A1A1A' }}
                  disabled={editObj !== null}
                >
                  {editObj ? '✏️ Finish editing first' : '+ Add Objective'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Right: Objectives Management */}
        <Col xs={12} md={projectData ? 4 : 6}>
          <Card
            className="border-0 h-100"
            style={{ backgroundColor: '#f8f9fa' }}
          >
            <Card.Header
              className="border-0"
              style={{ backgroundColor: '#e9ecef', padding: '0.5rem' }}
            >
              <div className="text-center">
                <small
                  className="fw-bold d-block"
                  style={{ fontSize: '0.75rem', color: '#495057' }}
                >
                  📝 Manage
                </small>
                <small
                  className="fw-bold"
                  style={{ fontSize: '0.75rem', color: '#495057' }}
                >
                  Objectives
                </small>
              </div>
            </Card.Header>
            <Card.Body style={{ padding: '0.5rem' }}>
              {objectives.length === 0 ? (
                <p className="text-muted text-center my-3">
                  No objectives created yet.
                </p>
              ) : (
                <div
                  className="table-responsive"
                  style={{ maxHeight: '500px', overflowY: 'auto' }}
                >
                  <Table bordered hover striped size="sm" className="mb-0">
                    <thead style={{ backgroundColor: '#e9ecef' }}>
                      <tr>
                        <th className="text-center" style={{ width: '30px' }}>
                          #
                        </th>
                        <th>Title</th>
                        <th>Units</th>
                        <th className="text-center" style={{ width: '100px' }}>
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {objectives.map((obj, index) => {
                        const isEditing = editObj && editObj.id === obj.id
                        return (
                          <tr key={obj.id}>
                            <td className="text-center">{index + 1}</td>
                            <td>
                              {isEditing ? (
                                <Form.Control
                                  type="text"
                                  value={editObj.title}
                                  onChange={(e) =>
                                    setEditObj((prev) =>
                                      prev
                                        ? { ...prev, title: e.target.value }
                                        : null
                                    )
                                  }
                                />
                              ) : (
                                <small>{obj.title}</small>
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <Form.Control
                                  type="text"
                                  value={editObj.measurement}
                                  onChange={(e) =>
                                    setEditObj((prev) =>
                                      prev
                                        ? {
                                            ...prev,
                                            measurement: e.target.value,
                                          }
                                        : null
                                    )
                                  }
                                />
                              ) : (
                                <small>{obj.measurement}</small>
                              )}
                            </td>
                            <td className="text-center">
                              {isEditing ? (
                                <div className="d-flex gap-1">
                                  <Button
                                    style={{ backgroundColor: '#738c40' }}
                                    className="text-white"
                                    variant="success"
                                    size="sm"
                                    onClick={handleEditSave}
                                  >
                                    ✓
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={handleEditCancel}
                                  >
                                    ✕
                                  </Button>
                                </div>
                              ) : (
                                <div className="d-flex gap-1">
                                  <Button
                                    style={{ backgroundColor: '#0094b6' }}
                                    className="text-light"
                                    variant="info"
                                    size="sm"
                                    onClick={() => handleEditClick(obj)}
                                  >
                                    ✏️
                                  </Button>
                                  <Button
                                    style={{
                                      backgroundColor: '#D37B49',
                                      color: 'white',
                                    }}
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleDelete(obj.id)}
                                  >
                                    🗑️
                                  </Button>
                                </div>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default AddObjectives
