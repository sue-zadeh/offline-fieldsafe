// Path: src/pages/registervolunteer.tsx

import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { saveOfflineItem, OfflineItem } from '../utils/localDB'
import axios from 'axios'

interface AddvolunteerProps {
  isSidebarOpen: boolean
}

type User = {
  id: number
  firstname: string
  lastname: string
  email: string
  phone: string
  emergencyContact: string
  emergencyContactNumber: string
  role: 'Volunteer'
}

const Addvolunteer: React.FC<AddvolunteerProps> = ({ isSidebarOpen }) => {
  const [formData, setFormData] = useState<User>({
    id: 0,
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    emergencyContact: '',
    emergencyContactNumber: '',
    role: 'Volunteer',
  })
  const [notification, setNotification] = useState<string | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (location.state?.user) {
      setFormData(location.state.user)
    }
    axios
      .get('/api/volunteers')
      .then((response) => setUsers(response.data))
      .catch(() => setUsers([]))
  }, [location])

  const validateForm = (): string | null => {
    const {
      firstname,
      lastname,
      email,
      phone,
      emergencyContact,
      emergencyContactNumber,
    } = formData
    if (
      !firstname ||
      !lastname ||
      !email ||
      !phone ||
      !emergencyContact ||
      !emergencyContactNumber
    ) {
      return 'All fields are required.'
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return 'Invalid email format.'
    }
    if (!/^[+\d]+$/.test(phone)) {
      return 'Phone must contain only numbers and may start with +.'
    }
    return null
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    const validationError = validateForm()
    if (validationError) {
      setNotification(validationError)
      return
    }

    if (formData.phone === formData.emergencyContactNumber) {
      setNotification(
        'Phone number and Emergency Contact Number must be different.'
      )
      return
    }

    const isEmailTaken = users.some(
      (user) => user.email === formData.email && user.id !== formData.id
    )
    if (isEmailTaken) {
      setNotification('The email address is already in use.')
      return
    }

    try {
      if (navigator.onLine) {
        if (formData.id) {
          await axios.put(`/api/volunteers/${formData.id}`, formData)
          setNotification(`Editing ${formData.firstname} was successful!`)
        } else {
          await axios.post('/api/volunteers', formData)
          setNotification(
            `${formData.firstname} ${formData.lastname} added successfully!`
          )
        }
      } else {
        const item: Omit<OfflineItem, 'id'> = {
        type: 'volunteer',
        data: { ...formData, id: 0 },
        synced: false,
        timestamp: Date.now(),
      }
        await saveOfflineItem(item)
        setNotification('🕸️ You are offline. Data saved locally for sync.')
      }
      setTimeout(() => navigate('/volunteer'), 1000)
    } catch (error) {
      console.error('❌ Unexpected error saving user:', error)
      setNotification('Failed to save user.')
    }
  }

  return (
    <div
      className={`container-fluid d-flex align-items-center justify-content-center  ${
        isSidebarOpen ? 'content-expanded' : 'content-collapsed'
      }`}
      style={{
        marginLeft: isSidebarOpen ? '220px' : '20px',
        paddingTop: '20px',
        marginTop: '2.5rem',
        transition: 'margin 0.3s ease',
      }}
    >
      <div
        className="form-container bg-white p-4 rounded shadow mt-4 align-item-center"
        style={{ maxWidth: '600px', width: '100%' }}
      >
        <h2 className="text-center" style={{ color: '#0094b6' }}>
          {formData.id ? 'Edit Volunteer' : 'Add Volunteer'}
        </h2>
        {notification && (
          <div className="alert alert-primary text-center">{notification}</div>
        )}
        <form className="form-container bg-white p-4 rounded shadow">
          <div className="row">
            <div className="col-md-6 mb-3">
              <label>First Name</label>
              <input
                type="text"
                name="firstname"
                value={formData.firstname}
                onChange={handleInputChange}
                className="form-control"
              />
            </div>
            <div className="col-md-6 mb-3">
              <label>Last Name</label>
              <input
                type="text"
                name="lastname"
                value={formData.lastname}
                onChange={handleInputChange}
                className="form-control"
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-control"
              />
            </div>
            <div className="col-md-6 mb-3">
              <label>Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="form-control"
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label>Emergency Contact Name</label>
              <input
                type="text"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleInputChange}
                className="form-control"
              />
            </div>
            <div className="col-md-6 mb-3">
              <label>Emergency Contact Number</label>
              <input
                type="text"
                name="emergencyContactNumber"
                value={formData.emergencyContactNumber}
                onChange={handleInputChange}
                className="form-control"
              />
            </div>
          </div>
          <div className="mb-3">
            <label>Role</label>
            <div
              className="form-control fs-5"
              style={{ backgroundColor: '#f8f9fa' }}
            >
              Volunteer
            </div>
          </div>
          <button
            type="button"
            className="btn w-100 mt-3 text-light fs-6"
            style={{ backgroundColor: '#0094b6' }}
            onClick={handleSubmit}
          >
            {formData.id ? 'Save Changes' : 'Register Volunteer'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Addvolunteer
