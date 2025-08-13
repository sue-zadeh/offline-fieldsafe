import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
  Table,
  Form,
  InputGroup,
  Button,
  Alert,
  Navbar,
  Nav,
} from 'react-bootstrap'
import {
  cacheActivity,
  getCachedActivity,
} from '../utils/localDB'
import { useNavigate, useLocation } from 'react-router-dom'
import { FaSearch, FaArrowRight } from 'react-icons/fa' // <== removed FaTrashAlt

interface ActivityRow {
  id: number
  activity_name: string
  activity_date: string
  projectName?: string
  projectLocation: string
  status: string // e.g. "InProgress", "onhold", "Completed", "archived"
  createdBy?: string
}

interface SearchActivityProps {
  isSidebarOpen: boolean
}

const SearchActivity: React.FC<SearchActivityProps> = ({ isSidebarOpen }) => {
  const navigate = useNavigate()
  const location = useLocation()

  // The master list of all activities
  const [allActivities, setAllActivities] = useState<ActivityRow[]>([])
  const [, setLoading] = useState(true)
  const [, setError] = useState<string | null>(null)

  // Current tab: "activeactivities" or "archivedactivities"
  const [activeTab, setActiveTab] = useState<
    'activeactivities' | 'archivedactivities'
  >('activeactivities')

  // Search term
  const [searchTerm, setSearchTerm] = useState('')

  // ======= fetch all activities =========
  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        let activities: ActivityRow[] = []
        
        if (navigator.onLine) {
          console.log('🔄 Fetching activities from API...')
          const res = await axios.get<ActivityRow[]>('/api/activities')
          activities = res.data
          console.log('✅ Fetched activities from API:', activities.length)

          const { cacheActivities } = await import('../utils/localDB')
          await cacheActivities(activities)
        } else {
          console.log('📱 Offline mode - loading from cache...')
          const { getCachedActivities } = await import('../utils/localDB')
          activities = await getCachedActivities()
          console.log('✅ Loaded activities from cache:', activities.length)
        }

        const { getSyncedItems, getUnsyncedItems } = await import(
          '../utils/localDB'
        )
        const synced = await getSyncedItems()
        const unsynced = await getUnsyncedItems()
        const offline = [...synced, ...unsynced]
          .filter((i) => i.type === 'activity')
          .map((i) => ({ ...i.data, id: i.data.id || i.timestamp }))

        console.log('📦 Offline activities found:', offline.length)
        activities = [...activities, ...offline]
        
        console.log('📊 Total activities to display:', activities.length)
        setAllActivities(activities)
      } catch (err) {
        console.error('❌ Error fetching activities:', err)
        setError('Failed to load activity notes.')

        // Fallback to cached data
        console.log('🔄 Falling back to cached data...')
        try {
          const { getCachedActivities, getSyncedItems, getUnsyncedItems } =
            await import('../utils/localDB')
          const cached = await getCachedActivities()
          const synced = await getSyncedItems()
          const unsynced = await getUnsyncedItems()
          const offline = [...synced, ...unsynced]
            .filter((i) => i.type === 'activity')
            .map((i) => ({ ...i.data, id: i.data.id || i.timestamp }))

          const merged = [...cached, ...offline]
          console.log('📦 Fallback activities loaded:', merged.length)
          setAllActivities(merged)
        } catch (cacheErr) {
          console.error('Error loading cached activities:', cacheErr)
        }
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  useEffect(() => {
    const st = location.state as { redirectTo?: string }
    if (st?.redirectTo === 'archivedactivities') {
      setActiveTab('archivedactivities')
    } else if (st?.redirectTo === 'activeactivities') {
      setActiveTab('activeactivities')
    }
  }, [location.state])

  // Split out 'active' vs. 'archived' tabs
  const activeActivities = allActivities.filter(
    (act) => act.status !== 'archived'
  )
  const archivedActivities = allActivities.filter(
    (act) => act.status === 'archived'
  )

  // Filter based on selected tab, then apply search
  const displayedActivities =
    activeTab === 'activeactivities' ? activeActivities : archivedActivities

  const filteredActivities = displayedActivities.filter((act) => {
    const dateStr = formatDate(act.activity_date).toLowerCase()
    const aName = (act.activity_name || '').toLowerCase()
    const pName = (act.projectName || '').toLowerCase()
    const loc = (act.projectLocation || '').toLowerCase()
    const stat = (act.status || '').toLowerCase()
    const user = (act.createdBy || '').toLowerCase()
    const term = searchTerm.toLowerCase()
    return (
      dateStr.includes(term) ||
      aName.includes(term) ||
      pName.includes(term) ||
      loc.includes(term) ||
      stat.includes(term) ||
      user.includes(term)
    )
  })

  // Switch tabs
  const handleTabChange = (tab: 'activeactivities' | 'archivedactivities') => {
    setActiveTab(tab)
    setSearchTerm('') //reset search each time
  }

  /** Arrow => go to AddActivity in read‐only mode */
  const handleGoToDetail = async (act: ActivityRow, e: React.MouseEvent) => {
    e.stopPropagation()

    if (navigator.onLine) {
      // Online: Cache the full activity data and navigate
      try {
        const response = await axios.get(`/api/activities/${act.id}`)
        await cacheActivity(response.data) // Cache the complete activity data
        console.log('✅ Activity cached for offline access:', act.id)
      } catch (err) {
        console.warn('Failed to cache activity for offline:', err)
      }
      navigate('/activity-notes', {
        state: { activityId: act.id, fromSearch: true },
      })
    } else {
      // Offline: check multiple sources for activity data
      let activityFound = false

      // First check cached activities
      const cachedActivity = await getCachedActivity(act.id)
      if (cachedActivity) {
        activityFound = true
      } else {
        // Check offline queue for the activity
        try {
          const { getSyncedItems, getUnsyncedItems } = await import('../utils/localDB')
          const synced = await getSyncedItems()
          const unsynced = await getUnsyncedItems()
          const allOfflineItems = [...synced, ...unsynced]
            .filter((i) => i.type === 'activity')
            .map((i) => i.data)

          const offlineActivity = allOfflineItems.find((a) => a.id === act.id)
          if (offlineActivity) {
            activityFound = true
          }
        } catch (err) {
          console.error('Error checking offline queue:', err)
        }
      }

      if (activityFound) {
        navigate('/activity-notes', {
          state: { activityId: act.id, fromSearch: true },
        })
      } else {
        alert('Activity details are not available offline. Please connect to the internet to view this activity.')
      }
    }
  }
  
  return (
    <div
      className={`container-fluid ${
        isSidebarOpen ? 'content-expanded' : 'content-collapsed'
      }`}
      style={{
        marginLeft: isSidebarOpen ? '220px' : '30px',
        transition: 'margin 0.3s ease',
        paddingTop: '0.5rem',
        minHeight: '100vh',
        width: '98%',
      }}
    >
      {/* TABS (Active / Archived) */}
      <Navbar
        expand="lg"
        style={{ backgroundColor: '#c4edf2' }}
        className="py-2 mb-3"
      >
        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          style={{ backgroundColor: '#F4F7F1' }}
        />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto justify-content-center">
            <Nav.Link
              onClick={() => handleTabChange('activeactivities')}
              style={{
                fontWeight:
                  activeTab === 'activeactivities' ? 'bold' : 'normal',
                color: '#1A1A1A',
                marginRight: '1rem',
              }}
            >
              Active Activities
            </Nav.Link>
            <Nav.Link
              onClick={() => handleTabChange('archivedactivities')}
              style={{
                fontWeight:
                  activeTab === 'archivedactivities' ? 'bold' : 'normal',
                color: '#1A1A1A',
                marginRight: '1rem',
              }}
            >
              Archived Activities
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <h3 className="mb-4" style={{ color: '#0094B6', fontWeight: 'bold' }}>
        Search {activeTab === 'activeactivities' ? 'Active' : 'Archived'}{' '}
        Activities
      </h3>

      {/* Search bar */}
      <div className="d-flex justify-content-center mb-3">
        <InputGroup style={{ maxWidth: '450px' }}>
          <Form.Control
            type="text"
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="secondary">
            <FaSearch />
          </Button>
        </InputGroup>
      </div>

      {/* If zero filtered results => show an alert */}
      {filteredActivities.length === 0 && searchTerm && (
        <Alert variant="warning" className="text-center">
          No results found for "{searchTerm}"
        </Alert>
      )}

      {/* Offline info alert */}
      {!navigator.onLine && allActivities.length === 0 && (
        <Alert variant="info" className="text-center">
          No activities are available offline.<br />
          Please connect to the internet and open the app at least once to cache activities for offline use.
        </Alert>
      )}

      <h5 className="p-2" style={{ color: '#0094B6' }}>
        Choose an activity by pressing Arrow Key
      </h5>

      <Table bordered striped hover responsive>
        <thead>
          <tr>
            <th className="">Activity Date</th>
            <th className="">Activity Name</th>
            <th className="">Project Name</th>
            <th className="mx-2">Location</th>
            <th
              style={{
                minWidth: '90px',
                whiteSpace: 'nowrap',
                wordWrap: 'break-word',
              }}
            >
              Status
            </th>
            <th
              className=""
              style={{ minWidth: '100px', paddingRight: '1rem' }}
            >
              Created By
            </th>
            <th className="text-end">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredActivities.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center p-4">
                {allActivities.length === 0 
                  ? 'No activities found. Create your first activity to get started.'
                  : searchTerm 
                    ? `No activities match "${searchTerm}"`
                    : activeTab === 'activeactivities' 
                      ? 'No active activities found.'
                      : 'No archived activities found.'
                }
              </td>
            </tr>
          ) : (
            filteredActivities.map((act) => (
              <tr
                key={act.id}
                style={{ cursor: 'pointer' }}
                onClick={(e) => handleGoToDetail(act, e)}
              >
                <td>{formatDate(act.activity_date)}</td>
                <td>{act.activity_name}</td>
                <td>{act.projectName || ''}</td>
                <td>{act.projectLocation}</td>
                <td>{act.status}</td>
                <td className="text-center">{act.createdBy || 'N/A'}</td>
                <td className="text-end">
                  <span
                    style={{ fontSize: '1.5rem', cursor: 'pointer' }}
                    onClick={(e) => handleGoToDetail(act, e)}
                  >
                    <FaArrowRight />
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  )
}

// Same date formatter:
function formatDate(isoString: string) {
  if (!isoString) return ''
  const d = new Date(isoString)
  if (isNaN(d.getTime())) return isoString
  const day = String(d.getDate()).padStart(2, '0')
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  const monthName = monthNames[d.getMonth()]
  const year = d.getFullYear()
  return `${day}-${monthName}-${year}`
}

export default SearchActivity
