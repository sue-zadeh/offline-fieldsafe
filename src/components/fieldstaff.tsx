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

interface FieldStaffProps {
  isSidebarOpen: boolean
}

const FieldStaff: React.FC<FieldStaffProps> = ({ isSidebarOpen }) => {
  // Full list of "Field Staff"
  const [allStaff, setAllStaff] = useState<User[]>([])

  // Filtered "search results"
  const [searchResults, setSearchResults] = useState<User[]>([])

  // The user's search text
  const [searchQuery, setSearchQuery] = useState('')

  // Notification
  const [notification, setNotification] = useState<string | null>(null)

  const [currentUserRole, setCurrentUserRole] = useState<string>('')

  useEffect(() => {
    const role = localStorage.getItem('role') || ''
    setCurrentUserRole(role)
  }, [])

  const navigate = useNavigate()

  //------------------------------------------------------------
  // fetch ALL "Field Staff"
  const fetchAllStaff = async () => {
    try {
      const res = await axios.get('/api/staff', {
        params: { role: 'Field Staff' },
      })
      const sorted = res.data.sort((a: User, b: User) =>
        a.firstname.localeCompare(b.firstname)
      )
      setAllStaff(sorted)
    } catch (err) {
      console.error('Error fetching Field Staff:', err)
      setNotification('Failed to load data.')
    }
  }

  useEffect(() => {
    fetchAllStaff()
  }, [])

  //------------------------------------------------------------
  // Immediate search
  useEffect(() => {
    const doSearch = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([])
        return
      }
      try {
        const res = await axios.get('/api/staff', {
          params: { role: 'Field Staff', search: searchQuery.trim() },
        })
        setSearchResults(res.data)
      } catch (error) {
        console.error('Error searching Field Staff:', error)
        setNotification('Failed to load data.')
      }
    }

    doSearch()
  }, [searchQuery])

  //------------------------------------------------------------
  //  Change role
  const handleRoleChange = async (userId: number, newRole: Role) => {
    try {
      // Optimistic update
      setAllStaff((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      )
      setSearchResults((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      )

      // PUT request
      await axios.put(`/api/staff/${userId}`, { role: newRole })
      setNotification(`Role updated to ${newRole} successfully!`)

      // If user is no longer Field Staff => navigate
      if (newRole === 'Group Admin') {
        navigate('/groupadmin')
      } else if (newRole === 'Team Leader') {
        navigate('/teamlead')
      } else {
        // still Field Staff => re-fetch
        fetchAllStaff()
      }
    } catch (error) {
      console.error('Error updating role:', error)
      setNotification('Failed to update user role.')
    }
  }

  //------------------------------------------------------------
  //  Delete user
  const handleDelete = async (userId: number) => {
    const userToDelete = allStaff.find((user) => user.id === userId)
    if (!userToDelete) {
      setNotification('User not found.')
      return
    }

    if (
      !window.confirm(
        `Are you sure you want to delete ${userToDelete.firstname} ${userToDelete.lastname}?`
      )
    ) {
      return
    }

    try {
      await axios.delete(`/api/staff/${userId}`)
      setNotification(
        `${userToDelete.firstname} ${userToDelete.lastname} deleted successfully!`
      )

      // Refresh the list
      fetchAllStaff()
      // Re-run the search if we had anything typed
      if (searchQuery.trim()) {
        const res = await axios.get('/api/staff', {
          params: { role: 'Field Staff', search: searchQuery.trim() },
        })
        setSearchResults(res.data)
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      setNotification('Failed to delete user.')
    }
  }

  //------------------------------------------------------------
  // Auto-clear notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  //------------------------------------------------------------
  // Reusable table
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
                <option value="Field Staff">Field Staff</option>
                <option value="Group Admin">Group Admin</option>
                <option value="Team Leader">Team Leader</option>
              </select>
            </td>
            <td className="text-center">
              <button
                className="btn btn-warning btn-sm me-2 text-light"
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
                {' '}
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
      <h2 className="text-center mb-2">Field Staff</h2>
      <p className="text-center text-muted fs-5">
        *Instant Search* - type something in the box below
      </p>

      {notification && (
        <div className="alert alert-info text-center">{notification}</div>
      )}

      {/* The search bar (no button). Searching as type */}
      <div className="mb-4 d-flex justify-content-center">
        <input
          className="form-control w-50 me-2 fs-6"
          placeholder="Search by name, email, letter, etc."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Search Results, if user typed something */}
      {searchQuery.trim() && (
        <>
          <h3 className="text-center p-3">Search Results</h3>
          {searchResults.length > 0 ? (
            renderTable(searchResults)
          ) : (
            <p className="text-center text-muted fs-4">
              No results found for "{searchQuery}"
            </p>
          )}
          <hr />
        </>
      )}

      {/* Full Field Staff table below */}
      <h3 className="text-center p-3">All Field Staff</h3>
      {allStaff.length > 0 ? (
        renderTable(allStaff)
      ) : (
        <p className="text-center text-muted">No Field Staff found.</p>
      )}
    </div>
  )
}

export default FieldStaff
