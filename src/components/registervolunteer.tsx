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

    // Trim whitespace and check for empty fields
    if (
      !firstname?.trim() ||
      !lastname?.trim() ||
      !email?.trim() ||
      !phone?.trim() ||
      !emergencyContact?.trim() ||
      !emergencyContactNumber?.trim()
    ) {
      return 'All fields are required and cannot be empty spaces.'
    }

    // Validate firstname and lastname (no numbers or special chars)
    if (!/^[a-zA-Z\s]+$/.test(firstname.trim()) || firstname.trim().length < 2) {
      return 'First name must contain only letters and be at least 2 characters long.'
    }
    if (!/^[a-zA-Z\s]+$/.test(lastname.trim()) || lastname.trim().length < 2) {
      return 'Last name must contain only letters and be at least 2 characters long.'
    }
    if (!/^[a-zA-Z\s]+$/.test(emergencyContact.trim()) || emergencyContact.trim().length < 2) {
      return 'Emergency contact name must contain only letters and be at least 2 characters long.'
    }

    // Strict email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email.trim().toLowerCase())) {
      return 'Please enter a valid email address (e.g. user@example.com).'
    }

    // Strict phone validation - only digits, spaces, +, -, (, )
    const phoneRegex = /^[\d\s+\-()]+$/
    const cleanPhone = phone.trim().replace(/[\s\-()]/g, '')
    if (!phoneRegex.test(phone.trim()) || cleanPhone.length < 7) {
      return 'Phone number must contain only digits, spaces, +, -, (, ) and be at least 7 digits long.'
    }

    // Emergency contact phone validation
    const cleanEmergencyPhone = emergencyContactNumber.trim().replace(/[\s\-()]/g, '')
    if (!phoneRegex.test(emergencyContactNumber.trim()) || cleanEmergencyPhone.length < 7) {
      return 'Emergency contact number must contain only digits, spaces, +, -, (, ) and be at least 7 digits long.'
    }

    // Check for common invalid phone entries
    const invalidPhonePatterns = [
      /no\s?thanks?/i,
      /none?/i,
      /n\/a/i,
      /not?\s?applicable/i,
      /null/i,
      /undefined/i,
      /test/i,
      /example/i,
      /[a-zA-Z]{3,}/i // Any word with 3+ letters
    ]
    if (invalidPhonePatterns.some(pattern => pattern.test(phone.trim()))) {
      return 'Please enter a valid phone number, not text or placeholder values.'
    }
    if (invalidPhonePatterns.some(pattern => pattern.test(emergencyContactNumber.trim()))) {
      return 'Please enter a valid emergency contact number, not text or placeholder values.'
    }

    return null
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    
    // Clear previous notifications when user starts typing
    if (notification) {
      setNotification(null)
    }
    
    let processedValue = value
    
    // Real-time validation and processing
    if (name === 'email') {
      processedValue = value.trim().toLowerCase()
    } else if (name === 'phone' || name === 'emergencyContactNumber') {
      // Allow only valid phone characters as user types
      processedValue = value.replace(/[^0-9\s+\-()]/g, '')
    } else if (name === 'firstname' || name === 'lastname' || name === 'emergencyContact') {
      // Allow only letters and spaces, remove numbers and special chars
      processedValue = value.replace(/[^a-zA-Z\s]/g, '')
    }
    
    setFormData({ ...formData, [name]: processedValue })
    
    // Real-time validation feedback
    if (name === 'email' && processedValue) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
      if (!emailRegex.test(processedValue)) {
        setNotification('Please enter a valid email address.')
        setTimeout(() => setNotification(null), 2000)
      }
    }
    
    if ((name === 'phone' || name === 'emergencyContactNumber') && processedValue) {
      const cleanPhone = processedValue.replace(/[\s\-()]/g, '')
      const invalidPatterns = [/no\s?thanks?/i, /none?/i, /n\/a/i, /[a-zA-Z]{3,}/i]
      if (invalidPatterns.some(pattern => pattern.test(processedValue))) {
        setNotification('Please enter a valid phone number, not text.')
        setTimeout(() => setNotification(null), 2000)
      } else if (cleanPhone.length > 0 && cleanPhone.length < 7) {
        setNotification('Phone number must be at least 7 digits long.')
        setTimeout(() => setNotification(null), 2000)
      }
    }
  }

  const handleSubmit = async () => {
    // Trim all fields before validation
    const trimmedFormData = {
      ...formData,
      firstname: formData.firstname.trim(),
      lastname: formData.lastname.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      emergencyContact: formData.emergencyContact.trim(),
      emergencyContactNumber: formData.emergencyContactNumber.trim()
    }
    
    // Update form data with trimmed values
    setFormData(trimmedFormData)
    
    // Validate form with trimmed data
    const validationError = validateForm()
    if (validationError) {
      setNotification(validationError)
      return
    }

    // Additional client-side checks
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(trimmedFormData.email)) {
      setNotification('Invalid email format detected. Please enter a valid email.')
      return
    }

    // Check phone numbers are different
    if (trimmedFormData.phone === trimmedFormData.emergencyContactNumber) {
      setNotification(
        'Phone number and Emergency Contact Number must be different.'
      )
      return
    }

    // Check email uniqueness
    const isEmailTaken = users.some(
      (user) => user.email === trimmedFormData.email && user.id !== trimmedFormData.id
    )
    if (isEmailTaken) {
      setNotification('The email address is already in use.')
      return
    }

    try {
      const dataToSubmit = {
        ...trimmedFormData,
        // Additional validation flags for server
        clientValidated: true,
        timestamp: new Date().toISOString()
      }
      
      if (navigator.onLine) {
        if (formData.id) {
          await axios.put(`/api/volunteers/${formData.id}`, dataToSubmit)
          setNotification(`Editing ${dataToSubmit.firstname} was successful!`)
        } else {
          await axios.post('/api/volunteers', dataToSubmit)
          setNotification(
            `${dataToSubmit.firstname} ${dataToSubmit.lastname} added successfully!`
          )
        }
      } else {
        const item: Omit<OfflineItem, 'id'> = {
        type: 'volunteer',
        data: { ...dataToSubmit, id: 0 },
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
        <form className="form-container bg-white p-4 rounded shadow" noValidate={false}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label>First Name</label>
              <input
                type="text"
                name="firstname"
                value={formData.firstname}
                onChange={handleInputChange}
                className="form-control"
                required
                minLength={2}
                maxLength={50}
                pattern="[a-zA-Z\s]+"
                title="First name must contain only letters and spaces, minimum 2 characters"
                placeholder="Enter first name"
                spellCheck="false"
                autoComplete="given-name"
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
                required
                minLength={2}
                maxLength={50}
                pattern="[a-zA-Z\s]+"
                title="Last name must contain only letters and spaces, minimum 2 characters"
                placeholder="Enter last name"
                spellCheck="false"
                autoComplete="family-name"
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
                required
                maxLength={100}
                pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
                title="Please enter a valid email address (e.g. user@example.com)"
                placeholder="user@example.com"
                spellCheck="false"
                autoComplete="email"
              />
            </div>
            <div className="col-md-6 mb-3">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="form-control"
                required
                minLength={7}
                maxLength={20}
                pattern="[\d\s+\-()]+"
                title="Phone number must contain only digits, spaces, +, -, (, ) and be at least 7 digits long"
                placeholder="Enter phone number (e.g. +64 21 123 4567)"
                spellCheck="false"
                autoComplete="tel"
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
                required
                minLength={2}
                maxLength={100}
                pattern="[a-zA-Z\s]+"
                title="Emergency contact name must contain only letters and spaces, minimum 2 characters"
                placeholder="Enter emergency contact name"
                spellCheck="false"
                autoComplete="name"
              />
            </div>
            <div className="col-md-6 mb-3">
              <label>Emergency Contact Number</label>
              <input
                type="tel"
                name="emergencyContactNumber"
                value={formData.emergencyContactNumber}
                onChange={handleInputChange}
                className="form-control"
                required
                minLength={7}
                maxLength={20}
                pattern="[\d\s+\-()]+"
                title="Emergency contact number must contain only digits, spaces, +, -, (, ) and be at least 7 digits long"
                placeholder="Enter emergency contact phone number"
                spellCheck="false"
                autoComplete="tel"
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
