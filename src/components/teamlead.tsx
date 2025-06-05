import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

// Role type
type Role = 'Group Admin' | 'Field Staff' | 'Team Leader'
type User = {
  id: number
  firstname: string
  lastname: string
  email: string
  phone: string
  role: Role
}

interface TeamLeadProps {
  isSidebarOpen: boolean
}

const TeamLead: React.FC<TeamLeadProps> = ({ isSidebarOpen }) => {
  // Full list of Team Leaders
  const [allLeads, setAllLeads] = useState<User[]>([])

  // Search results
  const [searchResults, setSearchResults] = useState<User[]>([])

  // The user's search text
  const [searchQuery, setSearchQuery] = useState('')

  // Notification (success/fail messages)
  const [notification, setNotification] = useState<string | null>(null)
  // Only group admin can change, edit, delete
  const [currentUserRole, setCurrentUserRole] = useState<string>('')

  useEffect(() => {
    const role = localStorage.getItem('role') || ''
    setCurrentUserRole(role)
  }, [])

  const navigate = useNavigate()

  //------------------------------------------------------------
  // Fetch ALL "Team Leader" records on mount
  const fetchAllLeads = async () => {
    try {
      const res = await axios.get('/api/staff', {
        params: { role: 'Team Leader' },
      })
      const sorted = res.data.sort((a: User, b: User) =>
        a.firstname.localeCompare(b.firstname)
      )
      setAllLeads(sorted)
    } catch (err) {
      console.error('Error fetching Team Leaders:', err)
      setNotification('Failed to load data.')
    }
  }

  useEffect(() => {
    fetchAllLeads()
  }, [])

  //------------------------------------------------------------
  // Auto-search as the user types (immediate)
  // fetch filtered list
  useEffect(() => {
    const doSearch = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([])
        return
      }
      try {
        const res = await axios.get('/api/staff', {
          params: { role: 'Team Leader', search: searchQuery.trim() },
        })
        setSearchResults(res.data)
      } catch (error) {
        console.error('Error searching Team Leaders:', error)
        setNotification('Failed to load data.')
      }
    }

    doSearch()
  }, [searchQuery]) // runs on every change of searchQuery

  //------------------------------------------------------------
  // Role change
  const handleRoleChange = async (userId: number, newRole: Role) => {
    try {
      // Optimistically update local arrays
      setAllLeads((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      )
      setSearchResults((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      )

      // PUT request
      await axios.put(`/api/staff/${userId}`, { role: newRole })
      setNotification(`Role updated to ${newRole} successfully!`)

      // If user is no longer "Team Leader," navigate
      if (newRole === 'Group Admin') {
        navigate('/groupadmin')
      } else if (newRole === 'Field Staff') {
        navigate('/fieldstaff')
      } else {
        // If still "Team Leader," re-fetch in case something changed
        fetchAllLeads()
      }
    } catch (error) {
      console.error('Error updating role:', error)
      setNotification('Failed to update user role.')
    }
  }

  //------------------------------------------------------------
  // Delete user
  const handleDelete = async (userId: number) => {
    // Find the user being deleted
    const userToDelete = allLeads.find((user) => user.id === userId)
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
      fetchAllLeads()

      // Re-run the search if a query is active
      if (searchQuery.trim()) {
        const res = await axios.get('/api/staff', {
          params: { role: 'Team Leader', search: searchQuery.trim() },
        })
        setSearchResults(res.data)
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      setNotification('Failed to delete user.')
    }
  }

  //------------------------------------------------------------
  // Clear notifications automatically
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  //------------------------------------------------------------
  // Utility table renderer
  const renderTable = (list: User[]) => (
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
                <option value="Team Leader">Team Leader</option>
                <option value="Group Admin">Group Admin</option>
                <option value="Field Staff">Field Staff</option>
              </select>
            </td>
            <td className="text-center">
              <button
                className="btn btn-warning btn-sm me-2 text-light rounded"
                style={{ backgroundColor: '#0094b6' }}
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

  //------------------------------------------------------------
  // Render
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
      <h2 className="text-center mb-2 ">Team Leader</h2>
      <p className="text-center text-muted fs-5">
        *Instant Search* - type something in the box below
      </p>

      {/* Notification */}
      {notification && (
        <div className="alert alert-info text-center">{notification}</div>
      )}

      {/* Search input (auto-search on typing) */}
      <div className="mb-4 d-flex justify-content-center">
        <input
          className="form-control w-50 me-2 fs-6"
          placeholder="Search by name, email, letter, etc."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Search Results (if user typed something) */}
      {searchQuery.trim() && (
        <>
          <h3 className="text-center p-3">Search Results</h3>
          {searchResults.length > 0 ? (
            renderTable(searchResults)
          ) : (
            <p className="text-center text-muted p-3 fs-4">
              No results found for "{searchQuery}"
            </p>
          )}
          <hr />
        </>
      )}

      {/* Always show all Team Leaders below */}
      <h3 className="text-center p-3 ">All Team Leaders</h3>
      {allLeads.length > 0 ? (
        renderTable(allLeads)
      ) : (
        <p className="text-center text-muted">No Team Leaders found.</p>
      )}
    </div>
  )
}

export default TeamLead
