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
  cacheProjects,
  getCachedProjects,
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
    const fetchProjects = async () => {
      try {
        if (navigator.onLine) {
          const res = await axios.get<ProjectOption[]>('/api/projects')
          setProjects(res.data)
          await cacheProjects(res.data)
          console.log('✅ Projects loaded and cached:', res.data.length)
        } else {
          console.log('🔄 Loading projects from cache (offline mode)')
          const cachedProjects = await getCachedProjects()
          console.log('📦 Found cached projects:', cachedProjects.length)
          setProjects(cachedProjects)
          if (cachedProjects.length === 0) {
            console.warn('⚠️ No cached projects available offline')
            // Show user feedback
            alert(
              'No projects available offline. Please connect to internet first to cache project data.'
            )
          }
        }
      } catch (err) {
        console.error('❌ Error fetching projects:', err)
        // Always try to load cached projects if online request fails
        try {
          console.log('🔄 Fallback: Loading projects from cache')
          const cachedProjects = await getCachedProjects()
          console.log(
            '📦 Fallback: Found cached projects:',
            cachedProjects.length
          )
          setProjects(cachedProjects)
          if (cachedProjects.length === 0) {
            alert(
              'No projects available. Please connect to internet to load project data.'
            )
          }
        } catch (cacheErr) {
          console.error('❌ Error loading cached projects:', cacheErr)
          alert(
            'Unable to load projects. Please check your connection and try again.'
          )
        }
      }
    }
    fetchProjects()
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
        // Offline mode - check multiple sources for activity data
        ;(async () => {
          try {
            // First try to get from cached activities (IndexedDB)
            const { getCachedActivity } = await import('../utils/localDB')
            const cachedActivity = await getCachedActivity(activityId)

            if (cachedActivity) {
              setActivity({
                id: cachedActivity.id,
                activity_name: cachedActivity.activity_name,
                project_id: cachedActivity.project_id,
                activity_date: cachedActivity.activity_date,
                notes: cachedActivity.notes || '',
                createdBy: cachedActivity.createdBy || '',
                status: cachedActivity.status || 'InProgress',
                projectLocation: cachedActivity.projectLocation,
                projectName: cachedActivity.projectName,
              })
              setReadOnly(true)
              return
            }

            // If not found in cached activities, check offline queue
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
              console.warn('⚠️ Activity not found locally:', activityId)
              // Reset to create new activity mode instead of showing error
              setActivity({
                id: 0,
                activity_name: '',
                project_id: 0,
                activity_date: '',
                notes: '',
                createdBy: '',
                status: 'InProgress',
                projectLocation: '',
                projectName: '',
              })
              setReadOnly(false)
              // Show a subtle message instead of alert
              console.log(
                '📝 Switched to new activity mode - activity not cached offline'
              )
            }
          } catch (err) {
            console.error('Offline fetch error:', err)
            // Instead of alert, just reset to new activity mode
            setActivity({
              id: 0,
              activity_name: '',
              project_id: 0,
              activity_date: '',
              notes: '',
              createdBy: '',
              status: 'InProgress',
              projectLocation: '',
              projectName: '',
            })
            setReadOnly(false)
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
      // Skip geocoding if offline
      if (!navigator.onLine) {
        console.log('📍 Skipping geocoding in offline mode')
        setMapCenter(defaultCenter)
        setMarkerPos(defaultCenter)
        return
      }

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
      !activity.project_id ||
      activity.project_id === 0
    ) {
      alert(
        'All fields marked with * are required. Please make sure to fill them in.'
      )
      return
    }

    try {
      if (!activityId) {
        if (navigator.onLine) {
          await axios.post('/api/activities', activity)
          alert('Activity created successfully!')
        } else {
          // For offline saving, we need to include the project name
          const selectedProject = projects.find(p => p.id === activity.project_id)
          const activityWithProjectName = {
            ...activity,
            projectName: selectedProject?.name || '',
            timestamp: Date.now()
          }
          
          await saveOfflineItem({
            type: 'activity',
            data: activityWithProjectName,
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
      } else if (activityId && !readOnly) {
        if (navigator.onLine) {
          await axios.put(`/api/activities/${activityId}`, activity)
          alert('Activity updated successfully!')
        } else {
          alert(
            'Offline: Cannot edit activities in offline mode. Please connect to the internet.'
          )
          return
        }

        const redirectTo =
          activity.status === 'archived'
            ? 'archivedactivities'
            : 'activeactivities'
        navigate('/searchactivity', { state: { redirectTo } })
      }
    } catch (err: any) {
      if (err.response && err.response.status === 409) {
        alert('Activity name already in use. Must be unique.')
      } else {
        alert('Failed to save activity.')
      }
    }
  }

  // =========== SAVE AS COPY ============= (online only)
  const handleSaveAsCopy = async () => {
    if (!activityId) return

    try {
      const copyName = activity.activity_name
      await axios.post('/api/activities', {
        ...activity,
        activity_name: copyName,
        id: undefined, // Remove ID to create new record
      })
      alert('Activity duplicated successfully!')

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

  // 'Edit' button => allow changing the activities (online only)
  const handleEdit = () => {
    setReadOnly(false)
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
          {!navigator.onLine && (
            <small className="text-danger d-block mt-1">
              ⚠️ Offline Mode: Limited functionality available. New activities
              will sync when online.
            </small>
          )}
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
                    <option value={0}>
                      {projects.length === 0
                        ? navigator.onLine
                          ? '-- Loading projects... --'
                          : '-- No projects available offline --'
                        : '-- Select a Project --'}
                    </option>
                    {projects.map((proj) => (
                      <option key={proj.id} value={proj.id}>
                        {proj.name}
                      </option>
                    ))}
                  </Form.Select>
                  {projects.length === 0 && !navigator.onLine && (
                    <small className="text-muted">
                      Projects will be available after connecting to the
                      internet and visiting this page.
                    </small>
                  )}
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

            {/* Edit button for readonly mode - only show when online */}
            {activityId && readOnly && navigator.onLine && (
              <div className="mt-3">
                <Button variant="warning" onClick={handleEdit}>
                  Edit
                </Button>
              </div>
            )}

            {/* Show offline message when edit would normally be available */}
            {activityId && readOnly && !navigator.onLine && (
              <div className="mt-3">
                <small className="text-muted">
                  ⚠️ Edit and Delete functions are not available in offline mode
                </small>
              </div>
            )}

            {/* Save and Save as Copy buttons for edit mode - only show when online */}
            {activityId && !readOnly && navigator.onLine && (
              <div className="mt-3">
                <Button variant="primary" onClick={handleSave}>
                  Save Changes
                </Button>{' '}
                <Button variant="info" onClick={handleSaveAsCopy}>
                  Save as New Activity
                </Button>
              </div>
            )}

            {/* Save button for new activity */}
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
