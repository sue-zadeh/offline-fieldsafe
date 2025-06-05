import React, { useState, useEffect } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import axios, { AxiosError } from 'axios'
import { useNavigate } from 'react-router-dom'

interface LoginProps {
  onLoginSuccess: () => void
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [rememberMe, setRememberMe] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isForgotPassword, setIsForgotPassword] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState<boolean>(false)

  const navigate = useNavigate()

  useEffect(() => {
    const savedEmail = localStorage.getItem('email')
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [])

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await axios.post('/api/login', { email, password })

      if (response.data.message === 'Login successful') {
        // Store firstname and lastname in localStorage - used for welcome
        localStorage.setItem('firstname', response.data.firstname)
        localStorage.setItem('lastname', response.data.lastname)
        localStorage.setItem('role', response.data.role)

        // "Remember Me"
        if (rememberMe) {
          localStorage.setItem('email', email)
        } else {
          localStorage.removeItem('email')
        }
        // Tell App we’re logged in
        onLoginSuccess()

        // Navigate to home page
        navigate('/home')
      } else {
        setError(response.data.message || 'Login failed. Please try again.')
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>
      console.error('Error during login:', axiosError)

      if (axiosError.response?.data?.message) {
        setError(axiosError.response.data.message)
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email.')
      return
    }
    setIsLoading(true)
    setError('')

    try {
      const response = await axios.post('/api/forgot-password', { email })
      if (response.data.message === 'Password reset email sent successfully') {
        alert('Password reset email sent. Check your inbox.')
        setError('')
      } else {
        setError(response.data.message || 'Failed to send reset email.')
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>
      console.error('Error during forgot password:', axiosError)

      if (axiosError.response?.data?.message) {
        setError(axiosError.response.data.message)
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div
      className="login-container d-flex justify-content-center align-items-center vh-100"
      style={{ backgroundColor: '#F4F7F1' }}
    >
      <div
        className="login-box p-4 shadow rounded"
        style={{ backgroundColor: '#FFFFFF', width: '400px' }}
      >
        <h2 className="text-center mb-4" style={{ color: '#76D6E2' }}>
          Welcome to FieldSafe
        </h2>
        <h3 className="text-center my-4" style={{ color: '#76D6E2' }}>
          <i>{isForgotPassword ? 'Forgot Password' : 'Login'}</i>
        </h3>

        <div className="form-group mb-3">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            className="form-control"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {!isForgotPassword && (
          <div className="form-group mb-3 position-relative">
            <label htmlFor="password">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              className="position-absolute top-50 end-0 translate-middle-y pe-3 pt-3"
              style={{ cursor: 'pointer', fontSize: '1.5rem' }}
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        )}

        {error && <div className="text-danger">{error}</div>}

        {!isForgotPassword && (
          <div className="form-group form-check">
            <input
              type="checkbox"
              id="rememberMe"
              className="form-check-input"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
            />
            <label htmlFor="rememberMe" className="form-check-label">
              Remember Me
            </label>
          </div>
        )}

        <button
          className="btn w-100 mt-3"
          style={{ backgroundColor: '#0094B6', color: 'white' }}
          onClick={isForgotPassword ? handleForgotPassword : handleLogin}
          disabled={isLoading}
        >
          {isLoading
            ? 'Processing...'
            : isForgotPassword
            ? 'Send Password Reset Email'
            : 'Login'}
        </button>

        <button
          className="btn w-100 mt-3 btn-link"
          style={{ color: '#0094B6' }}
          onClick={() => setIsForgotPassword(!isForgotPassword)}
        >
          {isForgotPassword ? 'Back to Login' : 'Forgot Password?'}
        </button>
      </div>
    </div>
  )
}

export default Login
