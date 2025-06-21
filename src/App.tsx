import React, { useState, useEffect, useRef } from 'react'
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom'
// import { LoadScript } from '@react-google-maps/api'
// import { Modal, Button } from 'react-bootstrap'
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
// import ParentLayout from './components/parentlayout'

// const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [logoutMessage, setLogoutMessage] = useState<string | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768)
  const navigate = useNavigate()

  // For inactivity:
  const INACTIVITY_LIMIT = 1000 * 60_000 // 1000 minutes in ms
  const [showSessionModal, setShowSessionModal] = useState(false)
  const [, setCountdown] = useState(120) // 2 minutes
  const [showSessionExpiredAlert] = useState(false)

  // references for timeouts so we can clear them
  const sessionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // const [isOnline, setIsOnline] = useState(navigator.onLine)
  const isOnline = useNetworkStatus()

  // ------------------------------------------
  // handle window resize for sidebar responsiveness
  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  // --------------------------------------------
  // Sync offline data when online
  useEffect(() => {
    window.addEventListener('online', replayQueue)
    replayQueue()
    return () => window.removeEventListener('online', replayQueue)
  }, [])
  // ------------------------------------------

  // -------------------------------------------
  // Inactivity watchers
  useEffect(() => {
    const startTimers = () => {
      sessionTimerRef.current = setTimeout(() => {
        setShowSessionModal(true)
        logoutTimerRef.current = setTimeout(() => {
          // handleAutoLogout()
        }, 120_000)
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

  // If the session modal is visible, start the 120-sec countdown
  useEffect(() => {
    if (showSessionModal) {
      setCountdown(120)
      const intervalId = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
      }, 1000)
      return () => clearInterval(intervalId)
    }
  }, [showSessionModal])

  // If countdown hits 0 while the modal is open, auto-logout
  // useEffect(() => {
  //   if (countdown === 0 && showSessionModal) {
  //     handleAutoLogout()
  //   }
  // }, [countdown, showSessionModal])

  // const handleStayLoggedIn = () => {
  //   setShowSessionModal(false)
  //   setCountdown(120)
  //   if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current)
  //   if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current)
  // }

  // const handleAutoLogout = () => {
  //   setShowSessionModal(false)
  //   setCountdown(60)
  //   setShowSessionExpiredAlert(true)
  //   handleLogout()
  // }

  // ------------------------------------------
  // Token validation on page load (Removed JWT usage)
  useEffect(() => {
    const maybeUserName = localStorage.getItem('firstname')
    if (maybeUserName) {
      // If there's a name stored, assume we are "logged in" - or can do more checks
      setIsLoggedIn(true)
    }
    // done
    setIsLoading(false)
  }, [])

  const handleLoginSuccess = () => {
    setIsLoggedIn(true)
    navigate('/home')
  }

  const handleLogout = () => {
    setIsLoggingOut(true)
    // Remove any stored user data
    localStorage.removeItem('firstname')
    localStorage.removeItem('lastname')
    localStorage.removeItem('role')
    // localStorage.removeItem('authToken') // not used now

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
      {/* If the session just expired, show an alert once */}
      {showSessionExpiredAlert && (
        <div className="alert alert-warning text-center">
          Your session has expired due to inactivity. Please log in again.
        </div>
      )}
      {/* If just logged out, show a success message */}
      {logoutMessage && (
        <div className="alert alert-success text-center">{logoutMessage}</div>
      )}
      {/* Offline Banner Goes Here */}
      {!isOnline && (
        <div className="alert alert-warning text-center">
          🕸️ You are offline. Any new data will be stored locally and synced
          later.
        </div>
      )}

      {/* If NOT logged in => show Login alone; else => show everything else */}
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
              {/* <LoadScript */}
              {/* googleMapsApiKey={GOOGLE_MAPS_API_KEY}
                libraries={['places']}
                version="beta"
              > */}
              <Routes>
                {/* If user is logged in and goes to "/", let's redirect them to /home */}
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

                {/* 404 fallback */}
                <Route path="*" element={<div>404 Not Found</div>} />
              </Routes>
              {/* </LoadScript> */}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
