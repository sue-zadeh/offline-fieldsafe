import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

// Types
type Role = 'Group Admin' | 'Field Staff' | 'Team Leader'
type User = {
  id: number
  firstname: string
  lastname: string
  email: string
  phone: string
  role: Role
}

interface GroupAdminProps {
  isSidebarOpen: boolean
}

const GroupAdmin: React.FC<GroupAdminProps> = ({ isSidebarOpen }) => {
  // All Group Admins for the main table
  const [allAdmins, setAllAdmins] = useState<User[]>([])

  // Search results for the "Search Results" table
  const [searchResults, setSearchResults] = useState<User[]>([])

  // Search bar text
  const [searchQuery, setSearchQuery] = useState('')

  // Has the user actually performed a search? (only show the "No results"
  //    message if they've clicked the Search button.)
  const [hasSearched, setHasSearched] = useState(false)

  // Notification message
  const [notification, setNotification] = useState<string | null>(null)

  const [currentUserRole, setCurrentUserRole] = useState<string>('')

  useEffect(() => {
    const role = localStorage.getItem('role') || ''
    setCurrentUserRole(role)
  }, [])

  const navigate = useNavigate()

  //----------------------------------------------------------------
  // fetch ALL Group Admins
  const fetchAllAdmins = async () => {
    try {
      const res = await axios.get('/api/staff', {
        params: { role: 'Group Admin' },
      })
      // Sort them if you want (by firstname, for example)
      const sorted = res.data.sort((a: User, b: User) =>
        a.firstname.localeCompare(b.firstname)
      )
      setAllAdmins(sorted)
    } catch (error) {
      console.error('Error fetching Group Admins:', error)
      setNotification('Failed to load data for the main table.')
    }
  }

  useEffect(() => {
    fetchAllAdmins()
  }, [])

  // Clear notifications after 4 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  //----------------------------------------------------------------
  // Searching: only by the "Search" button
  const handleSearch = async () => {
    // Mark that we did a search
    setHasSearched(true)

    // If the user’s search box is empty, clear the searchResults table
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }
    try {
      const res = await axios.get('/api/staff', {
        params: {
          role: 'Group Admin',
          search: searchQuery.trim(),
        },
      })
      setSearchResults(res.data)
    } catch (error) {
      console.error('Error searching Group Admins:', error)
      setNotification('Failed to load search results.')
    }
  }

  //----------------------------------------------------------------
  // Changing a user's role
  const handleRoleChange = async (userId: number, newRole: Role) => {
    try {
      // Optimistically update local data so the dropdown changes immediately
      setAllAdmins((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      )
      setSearchResults((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      )

      // PUT request to the backend
      await axios.put(`/api/staff/${userId}`, { role: newRole })
      setNotification(`Role updated to ${newRole} successfully!`)

      // If user left "Group Admin," navigate to that page
      if (newRole === 'Field Staff') {
        navigate('/fieldstaff')
      } else if (newRole === 'Team Leader') {
        navigate('/teamlead')
      } else {
        // If still "Group Admin," re-fetch to be sure
        fetchAllAdmins()
        if (searchQuery.trim()) {
          handleSearch()
        }
      }
    } catch (error) {
      console.error('Error updating user role:', error)
      setNotification('Failed to update user role.')
    }
  }

  //----------------------------------------------------------------
  // Deleting a user
  const handleDelete = async (userId: number) => {
    // Find the user being deleted
    const userToDelete = allAdmins.find((user) => user.id === userId)
    if (!userToDelete) {
      setNotification('User not found.')
      return
    }

    if (
      !window.confirm(
        `Are you sure you want to delete ${userToDelete.firstname} ${userToDelete.lastname}?`
      )
    )
      return

    try {
      await axios.delete(`/api/staff/${userId}`)
      setNotification(
        `${userToDelete.firstname} ${userToDelete.lastname} deleted successfully!`
      )

      // Refresh the list
      fetchAllAdmins()

      // Re-run search if applicable
      if (searchQuery.trim()) {
        handleSearch()
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      setNotification('Failed to delete user.')
    }
  }

  //----------------------------------------------------------------
  // Render table (reusable)
  const renderTable = (list: User[]) => {
    return (
      <table className="table table-bordered table-striped align-middle">
        <thead className="text-center">
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Edit / Delete</th>
          </tr>
        </thead>
        <tbody>
          {list.map((u) => (
            <tr key={u.id}>
              <td>
                {u.firstname} {u.lastname}
              </td>
              <td>{u.email}</td>
              <td>{u.phone}</td>
              <td>
                <select
                  className="form-select"
                  value={u.role}
                  onChange={(e) => {
                    if (currentUserRole === 'Group Admin') {
                      handleRoleChange(u.id, e.target.value as Role)
                    }
                  }}
                  disabled={currentUserRole !== 'Group Admin'}
                >
                  <option value="Group Admin">Group Admin</option>
                  <option value="Field Staff">Field Staff</option>
                  <option value="Team Leader">Team Leader</option>
                  <option value="Volunteer">Volunteer</option>
                </select>
              </td>
              <td className="text-center">
                <button
                  className="btn btn-warning btn-sm me-2 text-light rounded"
                  style={{ backgroundColor: '#0094B6' }}
                  onClick={() =>
                    currentUserRole === 'Group Admin' &&
                    navigate('/registerroles', {
                      state: { user: u, isEdit: true },
                    })
                  }
                  disabled={currentUserRole !== 'Group Admin'}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger btn-sm rounded"
                  style={{ backgroundColor: '#D37B40' }}
                  onClick={() =>
                    currentUserRole === 'Group Admin' && handleDelete(u.id)
                  }
                  disabled={currentUserRole !== 'Group Admin'}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  //----------------------------------------------------------------
  // Render
  //---------------------
  return (
    <div
      className="container-fluid"
      style={{
        marginLeft: isSidebarOpen ? '220px' : '20px',
        padding: '20px',
        marginTop: '2.5rem',
        transition: 'all 0.3s ease',
      }}
    >
      <h2 className="text-center mb-2">Group Admin</h2>
      <p className="text-center text-muted fs-5 font-weight: 700">
        Search for Group Admins by name or any keyword
      </p>

      {/* Notification */}
      {notification && (
        <div className="alert alert-info text-center">{notification}</div>
      )}

      {/* Search bar - only triggers handleSearch on button click */}
      <div className="d-flex justify-content-center align-items-center mb-4">
        <input
          type="text"
          className="form-control w-50 me-2"
          placeholder="Search by name, or a letter."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          className="btn btn-success w-25 fs-5"
          style={{ backgroundColor: '#0094b6' }}
          onClick={handleSearch}
        >
          Search
        </button>
      </div>

      {/* If user actually clicked Search (hasSearched) and typed something, show results */}
      {hasSearched && searchQuery.trim() && (
        <>
          <h3 className="text-center">Search Results</h3>
          {searchResults.length > 0 ? (
            renderTable(searchResults)
          ) : (
            <p className="text-center text-muted">
              No results found for "{searchQuery}"
            </p>
          )}
          <hr />
        </>
      )}

      {/* Full Group Admin Table below */}
      <h2 className="text-center mt-4">All Group Admins</h2>
      {allAdmins.length > 0 ? (
        renderTable(allAdmins)
      ) : (
        <p className="text-center text-muted">No Group Admins found.</p>
      )}
    </div>
  )
}

export default GroupAdmin
