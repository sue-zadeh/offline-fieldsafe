import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate, useLocation } from 'react-router-dom'
import { Navbar, Nav } from 'react-bootstrap'

interface Project {
  id: number
  name: string
  location: string
  startDate: string
  imageUrl?: string
  inductionFileUrl?: string
  status: string
  primaryContactName?: string
  primaryContactPhone?: string
  emergencyServices?: string
  objectiveTitles?: string
  localMedicalCenterAddress?: string
  localMedicalCenterPhone?: string
}

interface SearchProjectProps {
  isSidebarOpen: boolean
}

const SearchProject: React.FC<SearchProjectProps> = ({ isSidebarOpen }) => {
  const [projects, setProjects] = useState<Project[]>([])
  const [notification, setNotification] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('activeprojects') // Default
  // Track whether the local nav is expanded or collapsed
  const [expanded, setExpanded] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Fetch bridging data from /projList
  useEffect(() => {
    axios
      .get('/api/projects/projList')
      .then((res) => {
        setProjects(res.data)
      })
      .catch((err) => {
        console.error('Error fetching projects:', err)
        setNotification('Failed to fetch projects.')
      })
  }, [])

  // If AddProject told us to redirect to "archiveprojects" or "activeprojects":
  useEffect(() => {
    const state = location.state as { redirectTo?: string }
    if (state?.redirectTo) {
      setActiveTab(state.redirectTo)
    }
  }, [location.state])

  // Auto-clear notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 9000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const handleNavClick = (tab: string) => {
    setActiveTab(tab)
  }

  // Filter projects by status
  const filteredProjects =
    activeTab === 'activeprojects'
      ? projects.filter((p) => p.status !== 'archived')
      : projects.filter((p) => p.status === 'archived')

  const handleEdit = (p: Project) => {
    navigate('/addproject', {
      state: {
        isEdit: true,
        projectId: p.id,
        redirectTo:
          p.status === 'archived' ? 'archiveprojects' : 'activeprojects',
      },
    })
  }

  const handleDelete = async (p: Project) => {
    if (!window.confirm(`Are you sure you want to delete "${p.name}"?`)) {
      return
    }
    try {
      await axios.delete(`/api/projects/${p.id}`)
      setNotification('Project deleted successfully!')
      setProjects((prev) => prev.filter((proj) => proj.id !== p.id))
    } catch (err) {
      console.error('Error deleting project:', err)
      setNotification('Failed to delete project.')
    }
  }

  // Simple date format
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
  return (
    <div
      className={`container-fluid ${
        isSidebarOpen ? 'content-expanded' : 'content-collapsed'
      }`}
      style={{
        marginLeft: isSidebarOpen ? '220px' : '20px',
        transition: 'margin 0.3s ease',
        minHeight: '100vh',
        paddingTop: '10px',
        // backgroundColor: '#F4F7F1',
        height: '100vh',
      }}
    >
      {notification && (
        <div className="alert alert-info text-center">{notification}</div>
      )}

      {/* Tabs (Active / Archive) */}
      <Navbar
        collapseOnSelect // it automatically collapses on link select
        expand="lg"
        expanded={expanded} // controls open/close
        onToggle={setExpanded} // updates state when nav is clicked
        className="py-2"
        style={{ backgroundColor: '#c4edf2' }}
      >
        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          style={{ backgroundColor: '#F4F7F1' }}
        />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto justify-content-center">
            <Nav.Link
              onClick={() => {
                handleNavClick('activeprojects')
                setExpanded(false) // close the nav
              }}
              style={{
                fontWeight: activeTab === 'activeprojects' ? 'bold' : 'normal',
                color: '#1A1A1A',
                marginRight: '1rem',
              }}
            >
              Active Projects
            </Nav.Link>
            <Nav.Link
              onClick={() => {
                handleNavClick('archiveprojects')
                setExpanded(false)
              }}
              style={{
                fontWeight: activeTab === 'archiveprojects' ? 'bold' : 'normal',
                color: '#1A1A1A',
                marginRight: '1rem',
              }}
            >
              Archive Projects
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <h2 className="m-4 fs-1" style={{ color: '#0094B6', fontWeight: 'bold' }}>
        {activeTab === 'activeprojects'
          ? 'Active Projects'
          : 'Archived Projects'}
      </h2>

      <div className="row g-5">
        {filteredProjects.map((p) => (
          <div key={p.id} className="col-md-4">
            <div className="card h-100">
              <div className="position-relative">
                {p.imageUrl ? (
                  <img
                    src={`/${p.imageUrl}`}
                    className="card-img-top"
                    alt="Project"
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    style={{
                      height: '200px',
                      backgroundColor: '#ddd',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    No Image
                  </div>
                )}
                <span
                  className="badge bg-info p-2 text-dark position-absolute fs-6"
                  style={{ bottom: '5px', right: '5px' }}
                >
                  {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                </span>
              </div>
              <div className="card-body">
                <h3 className="card-title mb-2">{p.name}</h3>
                {p.objectiveTitles && (
                  <p className="text-dark fs-6">
                    <strong>Objectives:</strong>
                    <br />
                    {p.objectiveTitles.split(',').map((obj, idx) => (
                      <React.Fragment key={idx}>
                        {obj.trim()}
                        <br />
                      </React.Fragment>
                    ))}
                  </p>
                )}
                <p className="mb-1">
                  <strong>Location:</strong> {p.location}
                </p>
                <p className="mb-1">
                  <strong>Start Date:</strong> {formatDate(p.startDate)}
                </p>
                {p.primaryContactName && (
                  <p className="mb-1">
                    <strong>Contact:</strong> {p.primaryContactName} (
                    {p.primaryContactPhone})
                  </p>
                )}
                {p.emergencyServices && (
                  <p className="mb-1">
                    <strong>Emergency:</strong> {p.emergencyServices}
                    <br />
                    <strong>Local Medical Center Address/Phone:</strong>{' '}
                    {p.localMedicalCenterAddress} ({p.localMedicalCenterPhone})
                  </p>
                )}
                {p.inductionFileUrl && (
                  <p className="mb-1">
                    <strong>Induction Doc:</strong>{' '}
                    <a
                      href={`/${p.inductionFileUrl}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View
                    </a>
                  </p>
                )}

                <div className="mt-3">
                  <button
                    className="btn btn-warning me-3 text-light"
                    style={{ backgroundColor: '#0094B6' }}
                    onClick={() => handleEdit(p)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    style={{ backgroundColor: '#D37B40' }}
                    onClick={() => handleDelete(p)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SearchProject
