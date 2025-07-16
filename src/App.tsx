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
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isAppInstalled, setIsAppInstalled] = useState(false)

  const sessionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const INACTIVITY_LIMIT = 1000 * 60_000
  const isOnline = useNetworkStatus()
  const location = useLocation()
  const isLoginPage = location.pathname === '/' || location.pathname === '/login'
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
    const isLogged = localStorage.getItem('loggedIn') === 'true'
    setIsLoggedIn(isLogged)
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
  const handleBeforeInstallPrompt = (e: any) => {
    console.log("beforeinstallprompt triggered")
    e.preventDefault()
    setDeferredPrompt(e)
  }

    const handleAppInstalled = () => setIsAppInstalled(true)

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt')
          setIsAppInstalled(true)
        } else {
          console.log('User dismissed the install prompt')
        }
        setDeferredPrompt(null)
      })
    }
  }

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
    localStorage.removeItem('loggedIn')
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

  const isOfflineLoggedIn = localStorage.getItem('loggedIn') === 'true'
  const isAllowed = isLoggedIn || (!navigator.onLine && isOfflineLoggedIn)

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
      
      {/* Install Button */}
      {!isAppInstalled && isLoginPage && deferredPrompt && (
  <div className="d-flex justify-content-center align-items-center mt-5 p-4 w-100 fs-3 text-light fw-bold shadow rounded" style={{ backgroundColor: '#0094B6', color: 'white' }}>
    <button type="button" className="btn btn-info btn-sm text-light w-50" onClick={handleInstallClick}>
      Install App
    </button>
  </div>
)}
      {!isLoggedIn ? (
        <Login
         onLoginSuccess={handleLoginSuccess}
         deferredPrompt={deferredPrompt}
         isAppInstalled={isAppInstalled}
         handleInstallClick={handleInstallClick}/>
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
                <Route path="/home" element={isAllowed ? <Home isSidebarOpen={isSidebarOpen} /> : <Navigate to="/login" />} />
                <Route path="/registerroles" element={isAllowed ? <Registerroles isSidebarOpen={isSidebarOpen} /> : <Navigate to="/login" />} />
                <Route path="/groupadmin" element={isAllowed ? <Groupadmin isSidebarOpen={isSidebarOpen} /> : <Navigate to="/login" />} />
                <Route path="/fieldstaff" element={isAllowed ? <Fieldstaff isSidebarOpen={isSidebarOpen} /> : <Navigate to="/login" />} />
                <Route path="/teamlead" element={isAllowed ? <Teamlead isSidebarOpen={isSidebarOpen} /> : <Navigate to="/login" />} />
                <Route path="/registervolunteer" element={isAllowed ? <Registervolunteer isSidebarOpen={isSidebarOpen} /> : <Navigate to="/login" />} />
                <Route path="/volunteer" element={isAllowed ? <Volunteer isSidebarOpen={isSidebarOpen} /> : <Navigate to="/login" />} />
                <Route path="/AddProject" element={isAllowed ? <AddProject isSidebarOpen={isSidebarOpen} /> : <Navigate to="/login" />} />
                <Route path="/Addobjective" element={isAllowed ? <AddObjective isSidebarOpen={isSidebarOpen} /> : <Navigate to="/login" />} />
                <Route path="/SearchProject" element={isAllowed ? <SearchProject isSidebarOpen={isSidebarOpen} /> : <Navigate to="/login" />} />
                <Route path="/addrisk" element={isAllowed ? <AddRisk isSidebarOpen={isSidebarOpen} /> : <Navigate to="/login" />} />
                <Route path="/addhazard" element={isAllowed ? <AddHazard isSidebarOpen={isSidebarOpen} /> : <Navigate to="/login" />} />
                <Route path="/activity-notes" element={isAllowed ? <ActivityTabs isSidebarOpen={isSidebarOpen} /> : <Navigate to="/login" />} />
                <Route path="/searchactivity" element={isAllowed ? <SearchActivity isSidebarOpen={isSidebarOpen} /> : <Navigate to="/login" />} />
                <Route path="/report" element={isAllowed ? <Report isSidebarOpen={isSidebarOpen} /> : <Navigate to="/login" />} />
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