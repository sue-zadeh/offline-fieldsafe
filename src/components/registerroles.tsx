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
  // Handle form changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
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

    if (
      !firstname ||
      !lastname ||
      !email ||
      !phone ||
      !password ||
      !confirmPassword
    ) {
      return 'All fields are required.'
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return 'Invalid email format.'
    }
    if (!/^[+\d]+$/.test(phone)) {
      return 'Phone must contain only numbers and may start with +.'
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
    const errorMsg = validateForm()
    if (errorMsg) {
      setNotification(errorMsg)
      return
    }

    setIsLoading(true)
    setError('')

    // Check email uniqueness
    const isEmailTaken = users.some(
      (u) => u.email === formData.email && u.id !== formData.id
    )
    if (isEmailTaken) {
      setNotification('That email is already in use.')
      return
    }

    try {
      setIsSendingEmail(true)

      // If editing => PUT
      if (formData.id) {
        // Optional check if "no changes" were made
        const originalUser = users.find((u) => u.id === formData.id)
        if (
          originalUser &&
          originalUser.firstname === formData.firstname &&
          originalUser.lastname === formData.lastname &&
          originalUser.email === formData.email &&
          originalUser.phone === formData.phone &&
          originalUser.role === formData.role &&
          // If password is blank, they didn't update it
          !formData.password // or formData.password.length===0
        ) {
          const confirmNoChanges = window.confirm(
            'No changes detected. Save anyway?'
          )
          if (!confirmNoChanges) {
            setIsSendingEmail(false)
            return
          }
        }

        // Perform the update
        await axios.put(`/api/staff/${formData.id}`, formData)
        setNotification(`Successfully updated ${formData.firstname}!`)
      } else {
        // Creating new staff => POST
        await axios.post('/api/staff', formData)
        // Send registration email
        await sendRegistrationEmail()
        setNotification(`${formData.firstname} registered successfully!`)
      }

      setTimeout(() => {
        setIsSendingEmail(false)

        // Navigate to correct staff page
        if (formData.role === 'Group Admin') {
          navigate('/groupadmin')
        } else if (formData.role === 'Field Staff') {
          navigate('/fieldstaff')
        } else {
          navigate('/teamlead')
        }
      }, 1500)
    } catch (err) {
      console.error('Error saving staff:', err)
      setNotification('Failed to save staff.')
      setIsSendingEmail(false)
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
                        placeholder="Enter first name"
                        required
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
                        placeholder="Enter last name"
                        required
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
                    placeholder="user@example.com"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaPhone className="me-1" />
                    Phone
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      handleInputChange(
                        e as React.ChangeEvent<HTMLInputElement>
                      )
                    }
                    placeholder="Enter phone number (digits and + allowed)"
                    required
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
