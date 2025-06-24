import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { getSyncedItems, OfflineItem, getUnsyncedItems } from '../utils/localDB'
import { mergeByEmail } from '../utils/mergeHelpers'

// Role type
type Role = 'Volunteer'
type User = {
  id: number
  firstname: string
  lastname: string
  email: string
  phone: string
  emergencyContact: string
  emergencyContactNumber: string
  role: Role
}

interface VolunteerProps {
  isSidebarOpen: boolean
}

const Volunteer: React.FC<VolunteerProps> = ({ isSidebarOpen }) => {
  const [allLeads, setAllLeads] = useState<User[]>([])
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [notification, setNotification] = useState<string | null>(null)
  const navigate = useNavigate()

  // online / offline mode
  const fetchAllLeads = async () => {
    const synced = await getSyncedItems()
    const unsynced = await getUnsyncedItems()

    const offlineVolunteers = [...synced, ...unsynced]
      .filter((item) => item.type === 'volunteer')
      .map((item) => item.data as User)

    let merged: User[] = []

    if (navigator.onLine) {
      try {
        const res = await axios.get('/api/volunteers', {
          params: { role: 'Volunteer' },
        })
        merged = mergeByEmail(res.data, offlineVolunteers)
      } catch (err) {
        console.warn('🌐 Online fetch failed. Using offline only.')
        merged = offlineVolunteers
      }
    } else {
      merged = offlineVolunteers
    }

    const sorted = merged.sort((a, b) => a.firstname.localeCompare(b.firstname))
    setAllLeads(sorted)
  }

  useEffect(() => {
    fetchAllLeads()
  }, [])

  useEffect(() => {
    const doSearch = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([])
        return
      }
      try {
        const res = await axios.get('/api/volunteers', {
          params: { role: 'Volunteer', search: searchQuery.trim() },
        })
        setSearchResults(res.data)
      } catch (error) {
        console.error('Error searching Volunteers:', error)
        setNotification('Failed to load data.')
        if (!navigator.onLine) {
          const allItems: OfflineItem[] = await getSyncedItems()
          const offlineVolunteers = allItems
            .filter((item) => item.type === 'volunteer')
            .map((item) => item.data as User)
          const filtered = offlineVolunteers.filter((user) =>
            `${user.firstname} ${user.lastname} ${user.email}`
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
          )
          setSearchResults(filtered)
        }
      }
    }
    doSearch()
  }, [searchQuery])

  const handleDelete = async (userId: number) => {
    const userToDelete = allLeads.find((user) => user.id === userId)
    if (!userToDelete) {
      setNotification('Volunteer not found.')
      return
    }

    if (
      !window.confirm(
        `Are you sure you want to delete ${userToDelete.firstname} ${userToDelete.lastname}?`
      )
    )
      return

    try {
      if (navigator.onLine) {
        await axios.delete(`/api/volunteers/${userId}`)
        setNotification(
          `${userToDelete.firstname} ${userToDelete.lastname} deleted successfully!`
        )
      } else {
        setNotification('Delete action queued for online sync.')
      }
      fetchAllLeads()

      // If there is a search query, refresh the search results
      if (searchQuery.trim()) {
        const res = await axios.get('/api/volunteers', {
          params: { role: 'Volunteer', search: searchQuery.trim() },
        })
        setSearchResults(res.data)
      }
    } catch (error) {
      console.error('Error deleting volunteer:', error)
      setNotification('Failed to delete volunteer.')
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
    <table className="table table-bordered table-striped align-middle text-center">
      <thead className="text-center">
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Emergency Contact Name</th>
          <th>Emergency Contact Number</th>
          <th>Role</th>
          <th>Edit / Delete</th>
        </tr>
      </thead>
      <tbody>
{list.map((u) => {
            const isUnsynced = u.id === 0 // heuristic for unsynced items
  return (
    <tr key={u.email} className={isUnsynced ? 'table-warning' : ''}>

            <td>
              {u.firstname} {u.lastname}
            </td>
            <td>{u.email}</td>
            <td>{u.phone}</td>
            <td>{u.emergencyContact}</td>
            <td>{u.emergencyContactNumber}</td>
            <td>
              <option value="Volunteer">Volunteer</option>
            </td>
            <td className="text-center">
              <button
                className="btn btn-warning btn-sm me-2 text-light rounded"
                style={{ backgroundColor: '#0094b6' }}
                onClick={() =>
                  navigate('/registervolunteer', {
                    state: { user: u, isEdit: true },
                  })
                }
              >
                Edit
              </button>
              <button
                className="btn btn-danger btn-sm rounded"
                style={{ backgroundColor: '#D37B40' }}
                onClick={() => handleDelete(u.id)}
              >
                Delete
              </button>
            </td>
          </tr>
        )
})}
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
        transition: 'all 0.3s ease',
      }}
    >
      <h2 className="text-center mb-2 ">Volunteer</h2>
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

      {/* Always show all volunteers below */}
      <h3 className="text-center p-3 ">All Volunteers</h3>
      {allLeads.length > 0 ? (
        renderTable(allLeads)
      ) : (
        <p className="text-center text-muted">No Voluntees found.</p>
      )}
    </div>
  )
}

export default Volunteer
