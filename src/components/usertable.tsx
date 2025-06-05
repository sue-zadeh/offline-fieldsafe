import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

interface User {
  id: number
  firstname: string
  lastname: string
  email: string
  phone: string
  role: string
}

interface UserTableProps {
  isSidebarOpen: boolean
}

const UserTable: React.FC<UserTableProps> = ({ isSidebarOpen }) => {
  const { role } = useParams<{ role: string }>()
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/users', {
        params: { role, search },
      })
      setUsers(response.data)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [role, search])

  if (loading) return <p>Loading...</p>

  return (
    <div
      className={`container-fluid ${
        isSidebarOpen ? 'content-expanded' : 'content-collapsed'
      }`}
      style={{
        marginLeft: isSidebarOpen ? '225px' : '20px',
        transition: 'margin 0.3s ease',
      }}
    >
      <h2>{role} Users</h2>
      <div className="p-4">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-primary ml-2" onClick={fetchUsers}>
          Search
        </button>
      </div>
      <div className="table-responsive">
        <table className="table table-striped table-hover text-center">
          <thead className="table-light">
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{`${user.firstname} ${user.lastname}`}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>{user.role}</td>
                <td>
                  <button className="btn btn-warning btn-sm">Edit</button>
                </td>
                <td>
                  <button className="btn btn-danger btn-sm">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default UserTable
