import express from 'express'
import logger from './logger.js'

import path from 'path'
import { fileURLToPath } from 'url'
import apiRoutes from './routes/api.js' // backend routes
import mysql from 'mysql2/promise'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'

// Import  routes - ES Module
import staffRoutes from './register.js'
import volunteerRoutes from './volunteer.js'
import { sendEmail } from './email.js'
import projectsRouter from './projects.js'
import objectivesRouter from './objectives.js'
import hazardRiskRoutes from './hazard.js'
import riskRouter from './risk.js'
import ActivityRiskRouter from './activityrisk.js'
import checklistRouter from './checklist.js'
import ActivityObjectivesRouter from './activityobjectives.js'
import predatorRouter from './predator.js'
import activitiesRouter from './activities.js'
import completeRouter from './complete.js'
import reportRouter from './report.js'

dotenv.config()

dotenv.config()

const app = express()
app.use(express.json())
app.use('/api', apiRoutes) // our API

// For find __dirname in ES Modules---------------
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
//------------------------------
// Serve the dist folder
app.use(express.static(path.join(__dirname, '..', 'dist')))
// Serve the service worker file
app.use(
  '/service-worker.js',
  express.static(path.join(__dirname, '..', 'dist', 'service-worker.js'))
)

// logging with Winston
app.get('/', (req, res) => {
  logger.info('GET request received at /')
  res.send('Hello, Winston!')
})
// Serve "uploads" folder for images/docs
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Use routers for pages
app.use('/api/projects', projectsRouter)
app.use('/api/objectives', objectivesRouter)
app.use('/api', staffRoutes)
app.use('/api', volunteerRoutes)
app.use('/api', hazardRiskRoutes)
app.use('/api', riskRouter)
app.use('/api', ActivityRiskRouter)
app.use('/api', checklistRouter)
app.use('/api', ActivityObjectivesRouter)
app.use('/api', predatorRouter)
app.use('/api/activities', activitiesRouter)
app.use('/api/activities/complete', completeRouter)
app.use('/api/report', reportRouter)

// app.use((req, res, next) => {
//   if (req.hostname === 'www.fieldsafe.org.nz') {
//     return res.redirect(301, 'https://fieldsafe.org.nz' + req.url)
//   }
//   next()
// })
//=================================
// Serve service worker file FIRST
app.use(
  '/service-worker.js',
  express.static(path.join(__dirname, '..', 'dist', 'service-worker.js'))
)

// Serve static
app.use(express.static(path.join(__dirname, '..', 'dist')))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// 👇 LAST: fallback for SPA routing
// === Serve frontend build ===
const distPath = path.join(__dirname, '../dist')
app.use(express.static(distPath))

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'))
// })

//========================================

// test route
app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong' })
})

// MySQL pool ======================
const pool = mysql.createPool({
  host: process.env.db_host,
  user: process.env.db_user,
  password: process.env.db_pass,
  database: process.env.db_name,
  waitForConnections: true,
  connectionLimit: 10,
})

// Test DB connection ===================
;(async () => {
  try {
    const connection = await pool.getConnection()
    console.log('Database connected!')
    connection.release() // Release the connection
  } catch (err) {
    console.error('Database connection failed:', err.message)
    process.exit(1) // Exit the app if the DB connection fails
  }
})()

// ================= LOGIN ===========================
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  try {
    // Check the staffs table by email
    const [rows] = await pool.query('SELECT * FROM staffs WHERE email = ?', [
      email,
    ])
    console.log('Database query result:', rows)

    if (rows.length === 0) {
      console.log('No user found with the provided email.')
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const user = rows[0]
    // Compare plaintext password with hashed password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Instead of creating a JWT, just define a placeholder token
    const token = 'FAKE_NO_JWT_USED'

    // Return success response (front end may still expect 'token')
    return res.json({
      message: 'Login successful',
      token, //  placeholder string
      firstname: user.firstname,
      lastname: user.lastname,
      role: user.role,
    })
  } catch (err) {
    console.error('Error during login:', err.message)
    return res.status(500).json({ message: 'Server error' })
  }
})

// ================= Validate token - REMOVED / COMMENTED OUT
//removed

// ================= Forgot Password =====================
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body
  if (!email) {
    return res.status(400).json({ message: 'Email is required' })
  }

  try {
    const [rows] = await pool.query('SELECT * FROM staffs WHERE email = ?', [
      email,
    ])

    if (rows.length === 0) {
      console.log('→ Email not found in staffs')
      return res.status(404).json({ message: 'Email not found' })
    }

    const user = rows[0]
    console.log('→ Found user:', user)

    // Generate random new password
    const newPassword = Math.random().toString(36).substring(2, 10)
    console.log('→ newPassword to hash:', newPassword)

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await pool.query('UPDATE staffs SET password = ? WHERE id = ?', [
      hashedPassword,
      user.id,
    ])

    // === Send Email ====
    try {
      await sendEmail(
        email,
        'Password Reset',
        `Your new password is: ${newPassword}`
      )
    } catch (err) {
      console.error('Error sending reset email:', err.message)
      return res.status(500).json({ message: 'Failed to send reset email' })
    }

    return res.json({ message: 'Password reset email sent successfully' })
  } catch (err) {
    console.error('Error during password reset:', err.message)
    return res.status(500).json({ message: 'Server error' })
  }
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
