import React, { useState, useEffect, useRef } from 'react'
import {
  Routes,
  Route,
  useNavigate,
  Navigate,
  useLocation,
} from 'react-router-dom'
import { replayQueue } from './utils/localDB'
import { useNetworkStatus } from './hooks/useNetworkStatus'
import Navbar from './components/navbar'
import Login from './components/login'
import Home from './components/home'
import Sidebar from './components/sidebar'
import Registerroles from './components/registerroles'
import Groupadmin from './components/groupadmin'
import Fieldstaff from './components/fieldstaff'
import Teamlead from './components/teamlead'
import Registervolunteer from './components/registervolunteer'
import Volunteer from './components/volunteer'
import AddProject from './components/AddProject'
import SearchProject from './components/searchproject'
import AddObjective from './components/addobjective'
import AddRisk from './components/addrisk'
import AddHazard from './components/addhazard'
import SearchActivity from './components/searchactivity'
import Report from './components/report'
import ActivityTabs from './components/activitytabs'

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [logoutMessage, setLogoutMessage] = useState<string | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768)
  const [showSessionModal, setShowSessionModal] = useState(false)
  const [, setCountdown] = useState(120)
  const [showSessionExpiredAlert] = useState(false)

  const sessionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const INACTIVITY_LIMIT = 1000 * 60_000
  const isOnline = useNetworkStatus()
  const location = useLocation()
  const isLoginPage =
    location.pathname === '/' || location.pathname === '/login'
  const navigate = useNavigate()

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    window.addEventListener('online', replayQueue)
    replayQueue()
    return () => window.removeEventListener('online', replayQueue)
  }, [])

  useEffect(() => {
    const maybeUserName = localStorage.getItem('firstname')
    if (maybeUserName) {
      setIsLoggedIn(true)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    const startTimers = () => {
      sessionTimerRef.current = setTimeout(() => {
        setShowSessionModal(true)
        logoutTimerRef.current = setTimeout(() => {}, 120_000)
      }, INACTIVITY_LIMIT - 120_000)
    }

    const handleUserActivity = () => {
      if (!showSessionModal) {
        if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current)
        if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current)
        setCountdown(120)
        setShowSessionModal(false)
        startTimers()
      }
    }

    startTimers()
    window.addEventListener('mousemove', handleUserActivity)
    window.addEventListener('keydown', handleUserActivity)

    return () => {
      if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current)
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current)
      window.removeEventListener('mousemove', handleUserActivity)
      window.removeEventListener('keydown', handleUserActivity)
    }
  }, [showSessionModal])

  useEffect(() => {
    if (showSessionModal) {
      setCountdown(120)
      const intervalId = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
      }, 1000)
      return () => clearInterval(intervalId)
    }
  }, [showSessionModal])

  const handleLoginSuccess = () => {
    setIsLoggedIn(true)
    navigate('/home')
  }

  const handleLogout = () => {
    setIsLoggingOut(true)
    localStorage.removeItem('firstname')
    localStorage.removeItem('lastname')
    localStorage.removeItem('role')
    setIsLoggedIn(false)
    setLogoutMessage('You have successfully logged out.')
    setTimeout(() => {
      setLogoutMessage(null)
      setIsLoggingOut(false)
      navigate('/')
    }, 10000)
  }

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev)
  }

  const mainContentStyle: React.CSSProperties = {
    marginLeft: isSidebarOpen ? '20px' : '5px',
    width: isSidebarOpen ? 'calc(100% - 240px)' : '100%',
    padding: '15px',
    marginTop: '2.5rem',
    transition: 'all 0.3s ease',
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      {showSessionExpiredAlert && (
        <div className="alert alert-warning text-center">
          Your session has expired due to inactivity. Please log in again.
        </div>
      )}
      {logoutMessage && (
        <div className="alert alert-success text-center">{logoutMessage}</div>
      )}
      {!isLoginPage && !isOnline && (
        <div className="alert alert-warning text-center">
          🔸️ You are offline. Any new data will be stored locally and synced
          later.
        </div>
      )}
      {!isLoggedIn ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <div className="d-flex flex-column vh-100">
          <Navbar
            onLogout={handleLogout}
            isLoggedIn={isLoggedIn}
            isLoggingOut={isLoggingOut}
          />
          <div className="d-flex flex-grow-1">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <div style={mainContentStyle}>
              <Routes>
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route
                  path="/home"
                  element={<Home isSidebarOpen={isSidebarOpen} />}
                />
                <Route
                  path="/registerroles"
                  element={<Registerroles isSidebarOpen={isSidebarOpen} />}
                />
                <Route
                  path="/groupadmin"
                  element={<Groupadmin isSidebarOpen={isSidebarOpen} />}
                />
                <Route
                  path="/fieldstaff"
                  element={<Fieldstaff isSidebarOpen={isSidebarOpen} />}
                />
                <Route
                  path="/teamlead"
                  element={<Teamlead isSidebarOpen={isSidebarOpen} />}
                />
                <Route
                  path="/registervolunteer"
                  element={<Registervolunteer isSidebarOpen={isSidebarOpen} />}
                />
                <Route
                  path="/volunteer"
                  element={<Volunteer isSidebarOpen={isSidebarOpen} />}
                />
                <Route
                  path="/AddProject"
                  element={<AddProject isSidebarOpen={isSidebarOpen} />}
                />
                <Route
                  path="/Addobjective"
                  element={<AddObjective isSidebarOpen={isSidebarOpen} />}
                />
                <Route
                  path="/SearchProject"
                  element={<SearchProject isSidebarOpen={isSidebarOpen} />}
                />
                <Route
                  path="/addrisk"
                  element={<AddRisk isSidebarOpen={isSidebarOpen} />}
                />
                <Route
                  path="/addhazard"
                  element={<AddHazard isSidebarOpen={isSidebarOpen} />}
                />
                <Route
                  path="/activity-notes"
                  element={<ActivityTabs isSidebarOpen={isSidebarOpen} />}
                />
                <Route
                  path="/searchactivity"
                  element={<SearchActivity isSidebarOpen={isSidebarOpen} />}
                />
                <Route
                  path="/report"
                  element={<Report isSidebarOpen={isSidebarOpen} />}
                />
                <Route path="*" element={<div>404 Not Found</div>} />
              </Routes>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
