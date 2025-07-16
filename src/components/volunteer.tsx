// src/pages/Volunteer.tsx

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import {
  getSyncedItems,
  getUnsyncedItems,
  saveOfflineItem,
  cacheVolunteers,
  getCachedVolunteers
} from '../utils/localDB'
import { mergeByEmail } from '../utils/mergeHelpers'
import type { User as AppUser } from '../types/user'

interface VolunteerProps {
  isSidebarOpen: boolean
}

const Volunteer: React.FC<VolunteerProps> = ({ isSidebarOpen }) => {
  const [allLeads, setAllLeads] = useState<AppUser[]>([])
  const [searchResults, setSearchResults] = useState<AppUser[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [notification, setNotification] = useState<string | null>(null)
  const navigate = useNavigate()

  const fetchAllLeads = async () => {
    try {
      let onlineVolunteers: AppUser[] = []
      let offlineVolunteers: AppUser[] = []

      const synced = await getSyncedItems()
      const unsynced = await getUnsyncedItems()

      offlineVolunteers = [...synced, ...unsynced]
        .filter((item) => item.type === 'volunteer')
        .map((item) => ({ ...item.data, id: item.data.id || item.timestamp }))

      if (navigator.onLine) {
        const res = await axios.get('/api/volunteers', {
          params: { role: 'Volunteer' }
        })
        onlineVolunteers = res.data
        localStorage.setItem('volunteers', JSON.stringify(onlineVolunteers))
        await cacheVolunteers(onlineVolunteers)
      } else {
        const cached = localStorage.getItem('volunteers')
        if (cached) {
          onlineVolunteers = JSON.parse(cached)
        } else {
          onlineVolunteers = await getCachedVolunteers()
        }
      }

      const merged = mergeByEmail(onlineVolunteers, offlineVolunteers)
      const sorted = merged.sort((a, b) => a.firstname.localeCompare(b.firstname))
      setAllLeads(sorted)
    } catch (err) {
      console.warn('❌ Offline fallback used:', err)
      const synced = await getSyncedItems()
      const unsynced = await getUnsyncedItems()
      const fallback = [...synced, ...unsynced]
        .filter((item) => item.type === 'volunteer')
        .map((item) => ({ ...item.data, id: 0 }))
      setAllLeads(fallback)
    }
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
          params: { role: 'Volunteer', search: searchQuery.trim() }
        })
        setSearchResults(res.data)
      } catch (error) {
        setNotification('Search failed. Using offline data.')
        const cached = localStorage.getItem('volunteers')
        let offlineVolunteers: AppUser[] = []
        if (cached) {
          offlineVolunteers = JSON.parse(cached)
        } else {
          offlineVolunteers = await getCachedVolunteers()
        }
        const filtered = offlineVolunteers.filter((user) =>
          `${user.firstname} ${user.lastname} ${user.email}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        )
        setSearchResults(filtered)
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

    if (!window.confirm(`Are you sure you want to delete ${userToDelete.firstname} ${userToDelete.lastname}?`)) return

    try {
      if (navigator.onLine) {
        await axios.delete(`/api/volunteers/${userId}`)
        setNotification(`${userToDelete.firstname} ${userToDelete.lastname} deleted successfully!`)
      } else {
        await saveOfflineItem({
          type: 'volunteer_delete',
          data: { id: userId },
          synced: false,
          timestamp: Date.now()
        })
        setNotification('Delete action queued for online sync.')
      }
      fetchAllLeads()
    } catch (error) {
      console.error('Error deleting volunteer:', error)
      setNotification('Failed to delete volunteer.')
    }
  }

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const renderTable = (list: AppUser[]) => (
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
        {list.map((u) => (
          <tr key={u.email}>
            <td>{u.firstname} {u.lastname}</td>
            <td>{u.email}</td>
            <td>{u.phone}</td>
            <td>{u.emergencyContact}</td>
            <td>{u.emergencyContactNumber}</td>
            <td>
              <option value="Volunteer">Volunteer</option>
            </td>
            <td className="text-center">
              {navigator.onLine && (
                <>
                 <button
                      className="btn btn-warning btn-sm me-2 text-light rounded"
                      style={{ backgroundColor: '#0094b6' }}
                      onClick={() =>
                      navigate('/registervolunteer', {
                      state: { user: u, isEdit: true }
            })
           }
                disabled={!navigator.onLine}
                title={!navigator.onLine ? 'Edit disabled offline' : ''}
           >
            Edit
              </button>
              <button
        className="btn btn-danger btn-sm rounded"
        style={{ backgroundColor: '#D37B40' }}
        onClick={() => handleDelete(u.id)}
        disabled={!navigator.onLine}
        title={!navigator.onLine ? 'Delete disabled offline' : ''}
       >
        Delete
       </button>
      </>

              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )

  return (
    <div
      className="container-fluid"
      style={{
        marginLeft: isSidebarOpen ? '220px' : '20px',
        padding: '20px',
        transition: 'all 0.3s ease'
      }}
    >
      <h2 className="text-center mb-2">Volunteer</h2>
      <p className="text-center text-muted fs-5">
        *Instant Search* - type something in the box below
      </p>

      {notification && (
        <div className="alert alert-info text-center">{notification}</div>
      )}

      <div className="mb-4 d-flex justify-content-center">
        <input
          className="form-control w-50 me-2 fs-6"
          placeholder="Search by name, email, letter, etc."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

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

      <h3 className="text-center p-3">All Volunteers</h3>
      {allLeads.length > 0 ? (
        renderTable(allLeads)
      ) : (
        <p className="text-center text-muted">No Volunteers found.</p>
      )}
    </div>
  )
}

export default Volunteer
