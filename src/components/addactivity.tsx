import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Form, Button, Row, Col, Card, Modal } from 'react-bootstrap'
import { GoogleMap, Marker } from '@react-google-maps/api'
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''

interface ProjectOption {
  id: number
  name: string
  location: string
}

interface ActivityData {
  id?: number
  activity_name: string
  project_id: number
  activity_date: string
  notes: string
  createdBy: string
  status: string
  projectLocation?: string
  projectName?: string
}

interface AddActivityProps {
  activityId?: number | null
  // If you need them in the child:
  initialActivityName?: string
  initialProjectName?: string
  onActivityUpdated?: (
    activityId: number,
    activityName: string,
    projectName: string
  ) => void
}
const containerStyle = {
  width: '100%',
  height: '220px',
}

const defaultCenter = { lat: -36.8485, lng: 174.7633 }

//storing the text we want for the "in progress" modal in this variable
const AddActivity: React.FC<AddActivityProps> = ({}) => {
  const navigate = useNavigate()
  const locState = useLocation().state as {
    activityId?: number
    fromSearch?: boolean
  }

  // The list of projects for the dropdown
  const [projects, setProjects] = useState<ProjectOption[]>([])

  // The activity object
  const [activity, setActivity] = useState<ActivityData>({
    activity_name: '',
    project_id: 0,
    activity_date: '',
    notes: '',
    createdBy: '',
    status: 'InProgress',
    projectLocation: '',
  })

  // readOnly mode vs. editing
  const [readOnly, setReadOnly] = useState(false)

  // This will handle the "in‐progress" pop‐up
  const [showModal, setShowModal] = useState(false)
  const [modalText, setModalText] = useState('') // We'll store dynamic text here

  // If we came from search => we skip the "in‐progress" modal
  const fromSearch = locState?.fromSearch
  // editing an activity
  const activityId = locState?.activityId

  // Map center
  const [mapCenter, setMapCenter] = useState(defaultCenter)
  const [markerPos, setMarkerPos] = useState(defaultCenter)

  // If user tries to open AddActivity with or without an existing activity:
  // Decide whether to show the “already in progress” or “choose from list” modal
  useEffect(() => {
    if (!fromSearch) {
      if (activityId) {
        // We do have an ID, so assume user was 'in progress,'
        // so show the "You already have an Activity Note in progress..." text
        setModalText(
          'You already have an Activity Note in progress. Would you like to start a new one?'
        )
        setShowModal(true)
      } else {
        // No activityId => brand new
        setModalText(
          'Would you like to choose an activity from the list? Or start a new one?'
        )
        setShowModal(true)
      }
    }
  }, [activityId, fromSearch])

  // Fetch projects for the dropdown
  useEffect(() => {
    axios
      .get<ProjectOption[]>('/api/projects')
      .then((res) => setProjects(res.data))
      .catch((err) => console.error('Error fetching projects', err))
  }, [])

  // If we have an activityId => fetch it for read‐only

  // Pseudocode from AddActivity.tsx
  useEffect(() => {
    if (activityId) {
      axios
        .get(`/api/activities/${activityId}`)
        .then((res) => {
          const data = res.data
          setActivity({
            id: data.id,
            activity_name: data.activity_name,
            project_id: data.project_id,
            activity_date: data.activity_date,
            notes: data.notes || '',
            createdBy: data.createdBy || '',
            status: data.status || 'InProgress',
            projectLocation: data.projectLocation,
            projectName: data.projectName,
          })

          setReadOnly(true)
        })
        .catch((err) => {
          console.error('Error fetching activity', err)
          alert('Failed to load the requested activity.')
        })
    }
  }, [activityId])

  // Geocode any time the location changes
  useEffect(() => {
    if (activity.projectLocation) {
      geocodeAddress(activity.projectLocation)
    }
  }, [activity.projectLocation])

  async function geocodeAddress(address: string) {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${GOOGLE_MAPS_API_KEY}`
      const resp = await fetch(url)
      const json = await resp.json()
      if (json.status === 'OK' && json.results[0]?.geometry?.location) {
        const { lat, lng } = json.results[0].geometry.location
        setMapCenter({ lat, lng })
        setMarkerPos({ lat, lng })
      } else {
        console.warn('Geocode failed or no results for:', address)
        setMapCenter(defaultCenter)
        setMarkerPos(defaultCenter)
      }
    } catch (err) {
      console.error('Geocoding error:', err)
      setMapCenter(defaultCenter)
      setMarkerPos(defaultCenter)
    }
  }

  // Form changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target
    setActivity((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // If user changes the selected project => fill location from that project
  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const projId = Number(e.target.value)
    const proj = projects.find((p) => p.id === projId)
    setActivity((prev) => ({
      ...prev,
      project_id: projId,
      projectLocation: proj ? proj.location : '',
    }))
  }

  // =========== CREATE or UPDATE ================
  const handleSave = async () => {
    // Basic validation
    if (
      !activity.activity_date ||
      !activity.activity_name ||
      !activity.project_id
    ) {
      alert('Please fill Activity Name, Project, and Activity Date.')
      return
    }

    try {
      if (!activityId) {
        // CREATE new
        await axios.post('/api/activities', {
          activity_name: activity.activity_name,
          project_id: activity.project_id,
          activity_date: activity.activity_date,
          notes: activity.notes,
          createdBy: activity.createdBy,
          status: activity.status,
        })
        alert('Activity created successfully!')

        // If archived => go to archived tab
        const redirectTo =
          activity.status === 'archived'
            ? 'archivedactivities'
            : 'activeactivities'

        navigate('/searchactivity', { state: { redirectTo } })
      } else if (activityId && !readOnly) {
        // UPDATE existing
        await axios.put(`/api/activities/${activityId}`, {
          activity_name: activity.activity_name,
          project_id: activity.project_id,
          activity_date: activity.activity_date,
          notes: activity.notes,
          createdBy: activity.createdBy,
          status: activity.status,
        })
        alert('Activity updated successfully!')

        const redirectTo =
          activity.status === 'archived'
            ? 'archivedactivities'
            : 'activeactivities'
        navigate('/searchactivity', { state: { redirectTo } })
      }
    } catch (err: any) {
      console.error(err)
      if (err.response && err.response.status === 409) {
        alert('Activity name already in use. Must be unique.')
      } else {
        alert('Failed to save activity.')
      }
    }
  }

  // =========== SAVE AS COPY =============
  const handleSaveAsCopy = async () => {
    if (!activityId) return
    try {
      const copyName = activity.activity_name
      // + '-copy'
      await axios.post('/api/activities', {
        activity_name: copyName,
        project_id: activity.project_id,
        activity_date: activity.activity_date,
        notes: activity.notes,
        createdBy: activity.createdBy,
        status: activity.status,
      })
      alert('Activity duplicated successfully!')

      // Select the new one or go to the list
      const redirectTo =
        activity.status === 'archived'
          ? 'archivedactivities'
          : 'activeactivities'
      navigate('/searchactivity', { state: { redirectTo } })
    } catch (err: any) {
      console.error(err)
      if (err.response && err.response.status === 409) {
        alert('Copy name also conflicts. Please change it manually.')
      } else {
        alert('Failed to duplicate activity.')
      }
    }
  }

  // 'Edit' button => allow changing the activities
  const handleEdit = () => setReadOnly(false)

  // =========== MODAL LOGIC =============
  const handleModalCancel = () => {
    setShowModal(false)
  }

  const handleModalNew = () => {
    // "New Activity Note" => blank out the form
    setActivity({
      activity_name: '',
      project_id: 0,
      activity_date: '',
      notes: '',
      createdBy: '',
      status: 'InProgress',
      projectLocation: '',
    })
    setReadOnly(false)
    setShowModal(false)
  }

  const handleModalGoList = () => {
    navigate('/searchactivity')
  }
  //====================================================
  //////// Render
  return (
    <div className="m-4 shadow">
      <Modal show={showModal} onHide={handleModalCancel}>
        <Modal.Header closeButton>
          <Modal.Title>Activity Note In Progress</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modalText}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalGoList}>
            Go To List
          </Button>
          <Button variant="primary" onClick={handleModalNew}>
            New Activity Note
          </Button>
        </Modal.Footer>
      </Modal>

      <Card>
        <Card.Header>
          <h4 style={{ margin: 0 }}>
            {activityId ? 'Activity Detail' : 'Add Activity'}
          </h4>
        </Card.Header>
        <Card.Body>
          <Form>
            {/* Row 1: ActivityName + Status */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="activityName">
                  <Form.Label>Activity Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="activity_name"
                    value={activity.activity_name}
                    onChange={handleChange}
                    placeholder="Unique Activity Name"
                    readOnly={readOnly}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="status">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={activity.status}
                    onChange={handleChange}
                    disabled={readOnly}
                  >
                    <option value="InProgress">InProgress</option>
                    <option value="onhold">onhold</option>
                    <option value="Completed">Completed</option>
                    <option value="archived">archived</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {/* Row 2: Project + ActivityDate */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="projectSelect">
                  <Form.Label>Project *</Form.Label>
                  <Form.Select
                    name="project_id"
                    value={activity.project_id}
                    onChange={handleProjectChange}
                    disabled={readOnly}
                  >
                    <option value={0}>-- Select a Project --</option>
                    {projects.map((proj) => (
                      <option key={proj.id} value={proj.id}>
                        {proj.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="activityDate">
                  <Form.Label>Activity Date *</Form.Label>
                  <Form.Control
                    type="date"
                    name="activity_date"
                    value={activity.activity_date || ''}
                    onChange={handleChange}
                    min="2024-01-01"
                    disabled={readOnly}
                  />
                  <Form.Text className="text-muted">
                    Date cannot be earlier than 2024.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            {/* Row 3: Location read‐only + CreatedBy */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="location">
                  <Form.Label>Location (auto-filled)</Form.Label>
                  <Form.Control
                    type="text"
                    name="projectLocation"
                    value={activity.projectLocation || ''}
                    readOnly
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="createdBy">
                  <Form.Label>Created By (Name)</Form.Label>
                  <Form.Control
                    type="text"
                    name="createdBy"
                    value={activity.createdBy}
                    onChange={handleChange}
                    disabled={readOnly}
                    placeholder="Who is creating this note?"
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Map */}
            <div className="mb-3">
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={mapCenter}
                zoom={12}
              >
                <Marker position={markerPos} />
              </GoogleMap>
            </div>

            {/* Notes */}
            <Form.Group controlId="notes" className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                value={activity.notes}
                onChange={handleChange}
                readOnly={readOnly}
                placeholder="Any notes for this activity..."
              />
            </Form.Group>

            {activityId && readOnly && (
              <div className="mt-3">
                <Button variant="warning" onClick={handleEdit}>
                  Edit
                </Button>
              </div>
            )}

            {activityId && !readOnly && (
              <div className="mt-3">
                <Button variant="primary" onClick={handleSave}>
                  Save Changes
                </Button>{' '}
                <Button variant="info" onClick={handleSaveAsCopy}>
                  Save as New Activity
                </Button>
              </div>
            )}

            {!activityId && (
              <div className="mt-3">
                <Button variant="success" onClick={handleSave}>
                  Save
                </Button>
              </div>
            )}
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}

export default AddActivity
