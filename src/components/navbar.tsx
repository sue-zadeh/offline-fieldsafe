import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  FaUserPlus,
  FaUsers,
  FaUserCog,
  FaTasks,
  FaRegChartBar,
} from 'react-icons/fa'
import { MdGroups, MdVolunteerActivism, MdLocalActivity } from 'react-icons/md'
import {
  BsCalendar2Plus,
  BsCalendarCheck,
  BsPersonFillAdd,
} from 'react-icons/bs'
import LogoLil from '../assets/logo-lil.png'

interface NavbarProps {
  onLogout: () => void
  isLoggedIn: boolean
  isLoggingOut: boolean
}

const Navbar: React.FC<NavbarProps> = ({
  onLogout,
  isLoggedIn,
  isLoggingOut,
}) => {
  const location = useLocation()

  // Track whether navbar is collapsed or not
  const [navCollapsed, setNavCollapsed] = useState(true)

  // current route
  const isActive = (path: string) => location.pathname === path

  // close the navbar after any link click
  const handleLinkClick = () => {
    setNavCollapsed(true)
  }

  // get role from localStorage
  const role = localStorage.getItem('role')

  return (
    <nav
      className="navbar navbar-expand-lg"
      style={{
        backgroundColor: '#76D6E2',
        color: '#1A1A1A',
        padding: '0.15rem 3rem',
        position: 'fixed',
        top: 0,
        width: '100%',
        zIndex: 1050,
      }}
    >
      <div className="container-fluid">
        {/* Logo on the left */}
        <Link
          to="/"
          className="navbar-brand d-flex align-items-center"
          onClick={handleLinkClick}
        >
          <img
            src={LogoLil}
            alt="logo"
            className="img-fluid me-2"
            style={{ maxHeight: '52px' }}
          />
        </Link>

        {/* Toggler uses onClick to update navCollapsed */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setNavCollapsed(!navCollapsed)}
          aria-controls="navbarNavDropdown"
          aria-expanded={!navCollapsed}
          aria-label="Toggle navigation"
          style={{ backgroundColor: '#F4F7F1' }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className={`collapse navbar-collapse ${navCollapsed ? '' : 'show'}`}
          id="navbarNavDropdown"
        >
          <ul className="navbar-nav ms-auto fs-6">
            {/* Projects */}
            <li className="nav-item dropdown px-3">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="projectsDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{
                  color: '#1A1A1A',
                  fontWeight:
                    isActive('/addproject') || isActive('/searchproject')
                      ? 'bold'
                      : 'normal',
                }}
              >
                <BsCalendar2Plus style={{ marginRight: '5px' }} />
                Projects
              </a>
              <ul className="dropdown-menu" aria-labelledby="projectsDropdown">
                <li>
                  {/* 4) onClick={handleLinkClick} to close navbar */}
                  <Link
                    to="/addproject"
                    className="dropdown-item"
                    style={{
                      fontWeight: isActive('/addproject') ? 'bold' : 'normal',
                    }}
                    onClick={handleLinkClick}
                  >
                    <BsCalendar2Plus style={{ marginRight: '5px' }} />
                    {location.pathname === '/editproject'
                      ? 'Edit Project'
                      : 'Add Project'}
                  </Link>
                </li>

                <li>
                  <Link
                    to="/searchproject"
                    className="dropdown-item"
                    style={{
                      fontWeight: isActive('/searchproject')
                        ? 'bold'
                        : 'normal',
                    }}
                    onClick={handleLinkClick}
                  >
                    <BsCalendarCheck style={{ marginRight: '5px' }} />
                    Search Project
                  </Link>
                </li>
              </ul>
            </li>

            {/* Activity Notes */}
            <li className="nav-item dropdown px-3">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="activityDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{
                  color: '#1A1A1A',
                  fontWeight:
                    isActive('/addactivity') || isActive('/searchactivity')
                      ? 'bold'
                      : 'normal',
                }}
              >
                <MdLocalActivity style={{ marginRight: '5px' }} />
                Activity Notes
              </a>
              <ul className="dropdown-menu" aria-labelledby="activityDropdown">
                <li>
                  <Link
                    to="/activity-notes"
                    className="dropdown-item"
                    style={{
                      fontWeight: isActive('/activity-notes')
                        ? 'bold'
                        : 'normal',
                    }}
                    onClick={handleLinkClick}
                  >
                    <MdLocalActivity style={{ marginRight: '5px' }} />
                    Add Activity
                  </Link>
                </li>
                <li>
                  <Link
                    to="/searchactivity"
                    className="dropdown-item"
                    style={{
                      fontWeight: isActive('/searchactivity')
                        ? 'bold'
                        : 'normal',
                    }}
                    onClick={handleLinkClick}
                  >
                    <FaTasks style={{ marginRight: '5px' }} />
                    Search Activity
                  </Link>
                </li>
              </ul>
            </li>

            {/* Report */}

            <li className="nav-item px-3">
              <Link
                to="/report"
                style={{
                  color: '#1A1A1A',
                }}
                className={`nav-link d-flex align-items-center ${
                  isActive('/report') ? 'fw-bold' : ''
                }`}
                onClick={handleLinkClick}
              >
                <FaRegChartBar style={{ marginRight: '5px' }} />
                Report
              </Link>
            </li>

            {/* Organization Profile */}
            <li className="nav-item dropdown px-3">
              <a
                className="nav-link dropdown-toggle w-100"
                href="#"
                id="organizationDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{
                  color: '#1A1A1A',
                  fontWeight:
                    isActive('/registerroles') ||
                    isActive('/groupadmin') ||
                    isActive('/teamlead') ||
                    isActive('/fieldstaff') ||
                    isActive('/objectives')
                      ? 'bold'
                      : 'normal',
                }}
              >
                <MdGroups style={{ marginRight: '5px' }} />
                Organisation Profile
              </a>
              <ul
                className="dropdown-menu"
                aria-labelledby="organizationDropdown"
              >
                {role === 'Group Admin' && (
                  <li>
                    <Link
                      to="/registerroles"
                      className="dropdown-item"
                      style={{
                        fontWeight: isActive('/registerroles')
                          ? 'bold'
                          : 'normal',
                      }}
                      onClick={handleLinkClick}
                    >
                      <FaUserPlus style={{ marginRight: '5px' }} />
                      Add User
                    </Link>
                  </li>
                )}
                <li>
                  <Link
                    to="/groupadmin"
                    className="dropdown-item"
                    style={{
                      fontWeight: isActive('/groupadmin') ? 'bold' : 'normal',
                    }}
                    onClick={handleLinkClick}
                  >
                    <MdGroups style={{ marginRight: '5px' }} />
                    Group Admin
                  </Link>
                </li>
                <li>
                  <Link
                    to="/teamlead"
                    className="dropdown-item"
                    style={{
                      fontWeight: isActive('/teamlead') ? 'bold' : 'normal',
                    }}
                    onClick={handleLinkClick}
                  >
                    <FaUsers style={{ marginRight: '5px' }} />
                    Team Leader
                  </Link>
                </li>
                <li>
                  <Link
                    to="/fieldstaff"
                    className="dropdown-item"
                    style={{
                      fontWeight: isActive('/fieldstaff') ? 'bold' : 'normal',
                    }}
                    onClick={handleLinkClick}
                  >
                    <FaUserCog style={{ marginRight: '5px' }} />
                    Field Staff
                  </Link>
                </li>
              </ul>
            </li>

            {/* Volunteer */}
            <li className="nav-item dropdown px-3">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="volunteerDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{
                  color: '#1A1A1A',
                  fontWeight:
                    isActive('/registervolunteer') || isActive('/volunteer')
                      ? 'bold'
                      : 'normal',
                }}
              >
                <MdVolunteerActivism style={{ marginRight: '5px' }} />
                Volunteer
              </a>
              <ul className="dropdown-menu" aria-labelledby="volunteerDropdown">
                <li>
                  <Link
                    to="/registervolunteer"
                    className="dropdown-item"
                    style={{
                      fontWeight: isActive('/registervolunteer')
                        ? 'bold'
                        : 'normal',
                    }}
                    onClick={handleLinkClick}
                  >
                    <BsPersonFillAdd style={{ marginRight: '5px' }} />
                    Add Volunteer
                  </Link>
                </li>
                <li>
                  <Link
                    to="/volunteer"
                    className="dropdown-item"
                    style={{
                      fontWeight: isActive('/volunteer') ? 'bold' : 'normal',
                    }}
                    onClick={handleLinkClick}
                  >
                    <MdVolunteerActivism style={{ marginRight: '5px' }} />
                    Volunteer
                  </Link>
                </li>
              </ul>
            </li>

            {/* Logout */}
            {isLoggedIn && (
              <li className="nav-item">
                <button
                  className="btn btn-outline-danger ms-3 fw-bold fs-6"
                  onClick={onLogout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
