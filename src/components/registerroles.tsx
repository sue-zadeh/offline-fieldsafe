import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaEye,
  FaEyeSlash,
  FaLock,
} from 'react-icons/fa'
// import { AiFillIdcard } from 'react-icons/ai'
import { MdPassword } from 'react-icons/md'
import { Card, Form, Button, Row, Col, InputGroup } from 'react-bootstrap'

// For staff roles
type Role = 'Group Admin' | 'Field Staff' | 'Team Leader'

interface User {
  id: number
  firstname: string
  lastname: string
  email: string // also used as "username"
  phone: string
  role: Role
  password: string
}

interface RegisterroleProps {
  isSidebarOpen: boolean
}

const RegisterRoles: React.FC<RegisterroleProps> = ({ isSidebarOpen }) => {
  const [users, setUsers] = useState<User[]>([])

  // The main form data
  const [formData, setFormData] = useState<User>({
    id: 0,
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    role: 'Group Admin',
    password: '',
  })

  // Confirm password
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [notification, setNotification] = useState<string | null>(null)
  const [, setIsSendingEmail] = useState(false) // for button spinner/feedback
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isEdit] = useState<boolean>(false)
  const [, setError] = useState<string>('')

  const location = useLocation()
  const navigate = useNavigate()

  // ----------------------------------------------------------------
  // Fetch staff for uniqueness checks & fill form if editing
  useEffect(() => {
    axios
      .get('/api/staff')
      .then((res) => setUsers(res.data))
      .catch((err) => console.error('Error fetching staff:', err))

    if (location.state?.user) {
      // If editing, fill form
      const existing = location.state.user as User
      setFormData(existing)
    }
  }, [location])

  // ----------------------------------------------------------------
  // Clear notifications after a few seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  // ----------------------------------------------------------------
  // Handle form changes with real-time validation
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
    } else if (name === 'phone') {
      // Allow only valid phone characters as user types
      processedValue = value.replace(/[^0-9\s+\-()]/g, '')
    } else if (name === 'firstname' || name === 'lastname') {
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
    
    if (name === 'phone' && processedValue) {
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

  // Prevent form submission with Enter key if validation fails
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const errorMsg = validateForm()
      if (errorMsg) {
        e.preventDefault()
        e.stopPropagation()
        setNotification(errorMsg)
        return false
      }
    }
  }

  const toggleShowPassword = () => setShowPassword((prev) => !prev)
  const toggleShowConfirmPassword = () =>
    setShowConfirmPassword((prev) => !prev)

  // ----------------------------------------------------------------
  // Validate password complexity
  // Example: min 8 chars, at least 1 uppercase, 1 digit, 1 special char
  const passwordIsValid = (pwd: string) => {
    return (
      pwd.length >= 8 &&
      /[A-Z]/.test(pwd) &&
      /\d/.test(pwd) &&
      /[^A-Za-z0-9]/.test(pwd)
    )
  }

  // ----------------------------------------------------------------
  // Validate entire form
  const validateForm = (): string | null => {
    const { firstname, lastname, email, phone, password } = formData

    // Trim whitespace and check for empty fields
    if (
      !firstname?.trim() ||
      !lastname?.trim() ||
      !email?.trim() ||
      !phone?.trim() ||
      !password?.trim() ||
      !confirmPassword?.trim()
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

    // If this is a new staff or if user typed a new password
    if (!formData.id || password) {
      if (!passwordIsValid(password)) {
        return 'Password must be at least 8 characters, include uppercase letters, numbers, and special characters.'
      }
      if (password !== confirmPassword) {
        return 'Passwords do not match.'
      }
    }

    return null
  }

  // ----------------------------------------------------------------
  // Send email
  const sendRegistrationEmail = async () => {
    try {
      await axios.post('/api/send-email', {
        email: formData.email,
        subject: 'Welcome to FieldSafe!',
        message: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
    <p>Dear ${formData.firstname} ${formData.lastname},</p>

    <p>You are now registered as a <strong>${formData.role}</strong> in the FieldSafe App.</p>
    
    <p><strong>Your login email:</strong> ${formData.email}<br/>
    <strong>Your password:</strong> ${formData.password}</p>
    
    <p>Please keep this password secure.<br/>
    If you wish to change it, use the "Forgot Password" link to reset it.</p>

    <p>
      <a href="https://www.fieldsafe.org.nz/" style="
        display: inline-block;
        background-color: #4CAF50;
        color: white;
        padding: 10px 20px;
        text-decoration: none;
        border-radius: 5px;
        font-weight: bold;
      ">
        Login to FieldSafe
      </a>
    </p>

  <p>Best regards,<br/>
    FieldSafe Team</p>
  </div>
                `,
      })
    } catch (error) {
      console.error('Error sending email:', error)
    }
  }

  // ----------------------------------------------------------------
  // Submit the form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation() // Prevent event bubbling
    
    // Prevent form submission if user tries to bypass validation
    if (isLoading) {
      return // Prevent double submission
    }
    
    // Trim all fields before validation
    const trimmedFormData = {
      ...formData,
      firstname: formData.firstname.trim(),
      lastname: formData.lastname.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim()
    }
    
    // Update form data with trimmed values
    setFormData(trimmedFormData)
    
    // CRITICAL: Always validate on submit, regardless of HTML5 validation
    const errorMsg = validateForm()
    if (errorMsg) {
      setNotification(errorMsg)
      setIsLoading(false)
      return false // Explicitly prevent submission
    }

    setIsLoading(true)
    setError('')

    // Additional client-side checks before sending to server
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(trimmedFormData.email)) {
      setNotification('Invalid email format detected. Please enter a valid email.')
      setIsLoading(false)
      return false
    }
    
    // Additional phone validation to catch bypass attempts
    const phoneRegex = /^[\d\s+\-()]+$/
    const cleanPhone = trimmedFormData.phone.replace(/[\s\-()]/g, '')
    if (!phoneRegex.test(trimmedFormData.phone) || cleanPhone.length < 7) {
      setNotification('Invalid phone number detected. Please enter a valid phone number.')
      setIsLoading(false)
      return false
    }
    
    // Check for invalid text in phone field
    const invalidPhonePatterns = [
      /no\s?thanks?/i, /none?/i, /n\/a/i, /not?\s?applicable/i, /null/i, 
      /undefined/i, /test/i, /example/i, /[a-zA-Z]{3,}/i
    ]
    if (invalidPhonePatterns.some(pattern => pattern.test(trimmedFormData.phone))) {
      setNotification('Please enter a valid phone number, not text or placeholder values.')
      setIsLoading(false)
      return false
    }

    // Check email uniqueness
    const isEmailTaken = users.some(
      (u) => u.email === trimmedFormData.email && u.id !== trimmedFormData.id
    )
    if (isEmailTaken) {
      setNotification('That email is already in use.')
      setIsLoading(false)
      return false
    }

    try {
      setIsSendingEmail(true)

      // Use trimmed form data for submission
      const dataToSubmit = {
        ...trimmedFormData,
        // Additional server-side validation flags
        clientValidated: true,
        timestamp: new Date().toISOString()
      }

      // If editing => PUT
      if (formData.id) {
        // Optional check if "no changes" were made
        const originalUser = users.find((u) => u.id === formData.id)
        if (
          originalUser &&
          originalUser.firstname === dataToSubmit.firstname &&
          originalUser.lastname === dataToSubmit.lastname &&
          originalUser.email === dataToSubmit.email &&
          originalUser.phone === dataToSubmit.phone &&
          originalUser.role === dataToSubmit.role &&
          // If password is blank, they didn't update it
          !dataToSubmit.password // or formData.password.length===0
        ) {
          const confirmNoChanges = window.confirm(
            'No changes detected. Save anyway?'
          )
          if (!confirmNoChanges) {
            setIsSendingEmail(false)
            setIsLoading(false)
            return false
          }
        }

        // Perform the update
        await axios.put(`/api/staff/${dataToSubmit.id}`, dataToSubmit)
        setNotification(`Successfully updated ${dataToSubmit.firstname}!`)
      } else {
        // Creating new staff => POST
        await axios.post('/api/staff', dataToSubmit)
        // Send registration email
        await sendRegistrationEmail()
        setNotification(`${dataToSubmit.firstname} registered successfully!`)
      }

      setTimeout(() => {
        setIsSendingEmail(false)
        setIsLoading(false)

        // Navigate to correct staff page
        if (dataToSubmit.role === 'Group Admin') {
          navigate('/groupadmin')
        } else if (dataToSubmit.role === 'Field Staff') {
          navigate('/fieldstaff')
        } else {
          navigate('/teamlead')
        }
      }, 1500)
      
      return true // Success
    } catch (err: any) {
      console.error('Error saving staff:', err)
      let errorMessage = 'Failed to save staff.'
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.response?.status === 400) {
        errorMessage = 'Invalid data provided. Please check all fields.'
      }
      
      setNotification(errorMessage)
      setIsSendingEmail(false)
      setIsLoading(false)
      return false // Failed
    }
  }

  // ----------------------------------------------------------------
  return (
    <div
      className={`container-fluid ${
        isSidebarOpen ? 'content-expanded' : 'content-collapsed'
      }`}
      style={{
        marginLeft: isSidebarOpen ? '220px' : '20px',
        transition: 'margin 0.3s ease',
        paddingTop: '4rem',
      }}
    >
      <Row className="form-container justify-content-center pt-4 ">
        <Col md={8} lg={6}>
          <Card className="shadow">
            <h2 className="text-center pt-3">
              {formData.id ? 'Edit User' : 'Add User'}
            </h2>

            <Card.Body>
              {notification && (
                <div className="alert alert-danger text-center">
                  {notification}
                </div>
              )}

              <Form
                className="form-container bg-white p-3 rounded shadow"
                onSubmit={handleSubmit}
                onKeyDown={handleKeyDown}
                noValidate={false} // Enable HTML5 validation
              >
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaUser className="me-1" />
                        First Name
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="firstname"
                        value={formData.firstname}
                        onChange={(e) =>
                          handleInputChange(
                            e as React.ChangeEvent<HTMLInputElement>
                          )
                        }
                        onInvalid={(e) => {
                          e.preventDefault()
                          setNotification('Please enter a valid first name (letters only, minimum 2 characters)')
                        }}
                        placeholder="Enter first name"
                        required
                        minLength={2}
                        maxLength={50}
                        pattern="[a-zA-Z\s]+"
                        title="First name must contain only letters and spaces, minimum 2 characters"
                        spellCheck="false"
                        autoComplete="given-name"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaUser className="me-1" />
                        Last Name
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="lastname"
                        value={formData.lastname}
                        onChange={(e) =>
                          handleInputChange(
                            e as React.ChangeEvent<HTMLInputElement>
                          )
                        }
                        onInvalid={(e) => {
                          e.preventDefault()
                          setNotification('Please enter a valid last name (letters only, minimum 2 characters)')
                        }}
                        placeholder="Enter last name"
                        required
                        minLength={2}
                        maxLength={50}
                        pattern="[a-zA-Z\s]+"
                        title="Last name must contain only letters and spaces, minimum 2 characters"
                        spellCheck="false"
                        autoComplete="family-name"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaEnvelope className="me-1" />
                    Email (Username)
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    autoComplete="new-email"
                    onChange={(e) =>
                      handleInputChange(
                        e as React.ChangeEvent<HTMLInputElement>
                      )
                    }
                    onInvalid={(e) => {
                      e.preventDefault()
                      setNotification('Please enter a valid email address (e.g. user@example.com)')
                    }}
                    placeholder="user@example.com"
                    required
                    maxLength={100}
                    pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
                    title="Please enter a valid email address (e.g. user@example.com)"
                    spellCheck="false"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaPhone className="me-1" />
                    Phone
                  </Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      handleInputChange(
                        e as React.ChangeEvent<HTMLInputElement>
                      )
                    }
                    onInvalid={(e) => {
                      e.preventDefault()
                      setNotification('Please enter a valid phone number (digits, spaces, +, -, (, ) only, minimum 7 digits)')
                    }}
                    placeholder="Enter phone number (e.g. +64 21 123 4567)"
                    required
                    minLength={7}
                    maxLength={20}
                    pattern="[\d\s+\-()]+"
                    title="Phone number must contain only digits, spaces, +, -, (, ) and be at least 7 digits long"
                    spellCheck="false"
                    autoComplete="tel"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaUser className="me-1" />
                    Role
                  </Form.Label>
                  <Form.Select
                    name="role"
                    value={formData.role}
                    onChange={(e) =>
                      handleInputChange(
                        e as React.ChangeEvent<HTMLSelectElement>
                      )
                    }
                  >
                    <option value="Group Admin">Group Admin</option>
                    <option value="Field Staff">Field Staff</option>
                    <option value="Team Leader">Team Leader</option>
                  </Form.Select>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3 position-relative">
                      <Form.Label>
                        <FaLock className="me-1" />
                        Password
                      </Form.Label>
                      <InputGroup>
                        <Form.Control
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          autoComplete="new-password"
                          onChange={(e) =>
                            handleInputChange(
                              e as React.ChangeEvent<HTMLInputElement>
                            )
                          }
                          placeholder={
                            formData.id
                              ? '(Leave blank to keep current)'
                              : 'e.g. Pass@2023'
                          }
                        />
                        <Button
                          variant="outline-secondary"
                          onClick={toggleShowPassword}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </Button>
                      </InputGroup>
                      <small className="form-text">
                        Password must be at least 8 characters, include
                        uppercase letters, numbers, and special characters.
                      </small>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3 position-relative">
                      <Form.Label>
                        <MdPassword className="me-1" />
                        Confirm Password
                      </Form.Label>
                      <InputGroup>
                        <Form.Control
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder={
                            formData.id
                              ? '(Leave blank if no change)'
                              : 'Repeat password'
                          }
                        />
                        <Button
                          variant="outline-secondary"
                          onClick={toggleShowConfirmPassword}
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </Button>
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>

                <div
                  className="d-grid mt-2"
                  style={{ backgroundColor: '#76D6E2' }}
                >
                  <button
                    type="submit"
                    className="btn  w-100 p-2"
                    onClick={handleSubmit}
                    disabled={isLoading}
                  >
                    {isLoading
                      ? 'Sending Email...'
                      : isEdit
                      ? 'Save changes'
                      : 'Register &Send Email'}
                    {/* {formData.id ? 'Save Changes' : 'Register and Send Email'} */}
                  </button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default RegisterRoles
