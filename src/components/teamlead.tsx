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
      // Security check: Only Group Admins can change roles
      if (currentUserRole !== 'Group Admin') {
        setNotification('Access denied. Only Group Admins can change roles.')
        return
      }

      // Find the user being modified
      const userToUpdate = allLeads.find(u => u.id === userId) || searchResults.find(u => u.id === userId)
      if (!userToUpdate) {
        setNotification('User not found.')
        return
      }

      // Validation: Ensure user data is still valid before allowing role change
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
      if (!emailRegex.test(userToUpdate.email)) {
        setNotification(`Cannot change role: User ${userToUpdate.firstname} has an invalid email address. Please edit the user first to fix their email.`)
        return
      }

      // Validate phone number
      const phoneRegex = /^[\d\s+\-()]+$/
      const cleanPhone = userToUpdate.phone.replace(/[\s\-()]/g, '')
      const invalidPhonePatterns = [
        /no\s?thanks?/i, /none?/i, /n\/a/i, /not?\s?applicable/i, 
        /null/i, /undefined/i, /test/i, /example/i, /[a-zA-Z]{3,}/i
      ]
      
      if (!phoneRegex.test(userToUpdate.phone) || 
          cleanPhone.length < 7 || 
          invalidPhonePatterns.some(pattern => pattern.test(userToUpdate.phone))) {
        setNotification(`Cannot change role: User ${userToUpdate.firstname} has an invalid phone number. Please edit the user first to fix their phone number.`)
        return
      }

      // Validate names
      if (!/^[a-zA-Z\s]+$/.test(userToUpdate.firstname.trim()) || 
          userToUpdate.firstname.trim().length < 2 ||
          !/^[a-zA-Z\s]+$/.test(userToUpdate.lastname.trim()) || 
          userToUpdate.lastname.trim().length < 2) {
        setNotification(`Cannot change role: User ${userToUpdate.firstname} has invalid name data. Please edit the user first to fix their name.`)
        return
      }

      // Confirm the role change
      const confirmMessage = `Are you sure you want to change ${userToUpdate.firstname} ${userToUpdate.lastname}'s role from "${userToUpdate.role}" to "${newRole}"?`
      if (!window.confirm(confirmMessage)) {
        // Revert the dropdown to original value
        fetchAllLeads()
        return
      }

      // Optimistically update local arrays
      setAllLeads((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      )
      setSearchResults((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      )

      // PUT request with validation flag
      await axios.put(`/api/staff/${userId}`, { 
        role: newRole,
        validated: true,
        updatedBy: currentUserRole,
        timestamp: new Date().toISOString()
      })
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
    } catch (error: any) {
      console.error('Error updating role:', error)
      let errorMessage = 'Failed to update user role.'
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid data provided. User data must be valid before changing roles.'
      }
      
      setNotification(errorMessage)
      
      // Revert the UI changes on error
      fetchAllLeads()
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
