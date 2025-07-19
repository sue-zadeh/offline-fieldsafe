import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Form, Button, Row, Col, Card, Modal } from 'react-bootstrap'
import { GoogleMap, Marker } from '@react-google-maps/api'
import MapLoader from './MapLoader'
import {
  saveOfflineItem,
  getSyncedItems,
  getUnsyncedItems,
} from '../utils/localDB'

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
  timestamp?: number
}

interface AddActivityProps {
  activityId?: number | null
  initialActivityName?: string
  initialProjectName?: string
  onActivityUpdated?: (
    activityId: number,
    activityName: string,
    projectName: string
  ) => void
}

const containerStyle = { width: '100%', height: '220px' }
const defaultCenter = { lat: -36.8485, lng: 174.7633 }

const AddActivity: React.FC<AddActivityProps> = ({}) => {
  const navigate = useNavigate()
  const locState = useLocation().state as {
    activityId?: number
    fromSearch?: boolean
  }

  const [projects, setProjects] = useState<ProjectOption[]>([])
  const [activity, setActivity] = useState<ActivityData>({
    activity_name: '',
    project_id: 0,
    activity_date: '',
    notes: '',
    createdBy: '',
    status: 'InProgress',
    projectLocation: '',
  })
  const [readOnly, setReadOnly] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalText, setModalText] = useState('')
  const [mapCenter, setMapCenter] = useState(defaultCenter)
  const [markerPos, setMarkerPos] = useState(defaultCenter)

  const fromSearch = locState?.fromSearch
  const activityId = locState?.activityId

  useEffect(() => {
    if (!fromSearch) {
      if (activityId) {
        setModalText(
          'You already have an Activity Note in progress. Would you like to start a new one?'
        )
        setShowModal(true)
      } else {
        setModalText(
          'Would you like to choose an activity from the list? Or start a new one?'
        )
        setShowModal(true)
      }
    }
  }, [activityId, fromSearch])

  useEffect(() => {
    axios
      .get<ProjectOption[]>('/api/projects')
      .then((res) => setProjects(res.data))
      .catch((err) => console.error('Error fetching projects', err))
  }, [])

  useEffect(() => {
    if (activityId) {
      if (navigator.onLine) {
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
      } else {
        ;(async () => {
          try {
            const synced = await getSyncedItems()
            const unsynced = await getUnsyncedItems()
            const all = [...synced, ...unsynced]
              .filter((i) => i.type === 'activity')
              .map((i) => i.data)

            const local = all.find(
              (a) => a.id === activityId || a.timestamp === activityId
            )
            if (local) {
              setActivity(local)
              setReadOnly(true)
            } else {
              alert('Offline: This activity is not available locally.')
            }
          } catch (err) {
            console.error('Offline fetch error:', err)
            alert('Offline: Error loading local activity.')
          }
        })()
      }
    }
  }, [activityId])

  useEffect(() => {
    if (activity.projectLocation) geocodeAddress(activity.projectLocation)
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
        setMapCenter(defaultCenter)
        setMarkerPos(defaultCenter)
      }
    } catch (err) {
      setMapCenter(defaultCenter)
      setMarkerPos(defaultCenter)
    }
  }

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target
    setActivity((prev) => ({ ...prev, [name]: value }))
  }

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const projId = Number(e.target.value)
    const proj = projects.find((p) => p.id === projId)
    setActivity((prev) => ({
      ...prev,
      project_id: projId,
      projectLocation: proj ? proj.location : '',
    }))
  }

  const handleSave = async () => {
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
        if (navigator.onLine) {
          await axios.post('/api/activities', activity)
          alert('Activity created successfully!')
        } else {
          await saveOfflineItem({
            type: 'activity',
            data: { ...activity },
            synced: false,
            timestamp: Date.now(),
          })
          alert('Offline: Activity saved locally and will sync later.')
        }

        const redirectTo =
          activity.status === 'archived'
            ? 'archivedactivities'
            : 'activeactivities'
        navigate('/searchactivity', { state: { redirectTo } })
      } else if (!readOnly && navigator.onLine) {
        await axios.put(`/api/activities/${activityId}`, activity)
        alert('Activity updated successfully!')
        const redirectTo =
          activity.status === 'archived'
            ? 'archivedactivities'
            : 'activeactivities'
        navigate('/searchactivity', { state: { redirectTo } })
      }
    } catch (err: any) {
      console.error(err)
      if (err.response?.status === 409) {
        alert('Activity name already in use. Must be unique.')
      } else {
        alert('Failed to save activity.')
      }
    }
  }

  const handleModalNew = () => {
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

  return (
    <div className="m-4 shadow">
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Activity Note In Progress</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modalText}</Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => navigate('/searchactivity')}
          >
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
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="location">
                  <MapLoader>
                    <Form.Label>Location (auto-filled)</Form.Label>
                    <Form.Control
                      type="text"
                      name="projectLocation"
                      value={activity.projectLocation || ''}
                      readOnly
                    />
                  </MapLoader>
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

            <div className="mb-3">
              <MapLoader placeholderHeight={220}>
                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={mapCenter}
                  zoom={12}
                >
                  <Marker position={markerPos} />
                </GoogleMap>
              </MapLoader>
            </div>

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

            {!activityId && (
              <div className="mt-3">
                <Button variant="success" onClick={handleSave}>
                  Save
                </Button>
              </div>
            )}

            {activityId && !readOnly && navigator.onLine && (
              <div className="mt-3">
                <Button variant="primary" onClick={handleSave}>
                  Save Changes
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
