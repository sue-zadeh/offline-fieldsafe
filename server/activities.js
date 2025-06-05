import express from 'express'
import { pool } from './db.js'

const router = express.Router()

/**
 * Helper to convert an incoming ISO date string
 * (e.g. "2025-01-21T11:00:00.000Z") to "YYYY-MM-DD"
 */
function parseDateForMySQL(isoString) {
  const dateObj = new Date(isoString)
  if (isNaN(dateObj.getTime())) {
    return null
  }
  const yyyy = dateObj.getUTCFullYear()
  const mm = String(dateObj.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(dateObj.getUTCDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}` // e.g. "2025-01-21"
}

// ============== POST => /api/activities =============
// Creates a new activity with a unique activity_name
router.post('/', async (req, res) => {
  try {
    let { activity_name, project_id, activity_date, notes, createdBy, status } =
      req.body

    if (!activity_name || !project_id || !activity_date) {
      return res.status(400).json({
        message: 'activity_name, project_id, and activity_date required',
      })
    }

    // Convert the incoming date into MySQL-friendly format
    const sqlDate = parseDateForMySQL(activity_date)
    if (!sqlDate) {
      return res.status(400).json({ message: 'Invalid or unparseable date.' })
    }

    // Check for uniqueness
    const [existingRows] = await pool.query(
      'SELECT id FROM activities WHERE activity_name = ?',
      [activity_name]
    )
    if (existingRows.length > 0) {
      return res
        .status(409)
        .json({ message: 'Activity name already in use. Must be unique.' })
    }

    // Insert into `activities`
    const [actResult] = await pool.query(
      `
        INSERT INTO activities
          (activity_name, project_id, activity_date, notes, createdBy, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        activity_name,
        project_id,
        sqlDate, // the corrected date
        notes || '',
        createdBy || null,
        status || 'InProgress',
      ]
    )
    const newActivityId = actResult.insertId

    await pool.query(
      `
      INSERT INTO activity_objectives (activity_id, objective_id)
      SELECT ?, objective_id
      FROM project_objectives
      WHERE project_id = ?
      `,
      [newActivityId, project_id]
    )

    return res.status(201).json({
      activityId: newActivityId,
      message: 'Activity created successfully',
    })
  } catch (err) {
    console.error('POST /activities error:', err)
    return res.status(500).json({ message: 'Failed to create activity' })
  }
})

// ============== GET => /api/activities (ALL) =============
router.get('/', async (req, res) => {
  try {
    const { projectId } = req.query
    let sql = `
      SELECT a.*,
             p.name AS projectName,
             p.location AS projectLocation
      FROM activities a
      JOIN projects p ON a.project_id = p.id
    `
    const params = []
    if (projectId) {
      sql += ' WHERE a.project_id = ?'
      params.push(projectId)
    }
    sql += ' ORDER BY a.id DESC'
    const [rows] = await pool.query(sql, params)
    res.json(rows)
  } catch (err) {
    console.error('GET /activities error:', err)
    res.status(500).json({ message: 'Failed to fetch activities' })
  }
})

// ============== GET => /api/activities/:id =============
router.get('/:id', async (req, res) => {
  const { id } = req.params
  try {
    const sql = `
      SELECT
        a.id,
        a.activity_name,
        a.project_id,
        /* Convert date to plain YYYY-MM-DD so there's NO time shift */
        DATE_FORMAT(a.activity_date, '%Y-%m-%d') AS activity_date,
        a.notes,
        a.createdBy,
        a.status,
        p.name AS projectName,
        p.location AS projectLocation
      FROM activities a
      JOIN projects p ON a.project_id = p.id
      WHERE a.id = ?
    `
    const [rows] = await pool.query(sql, [id])
    if (!rows.length) {
      return res.status(404).json({ message: 'Activity not found' })
    }
    res.json(rows[0])
  } catch (err) {
    console.error('GET /activities/:id error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// ============== PUT => /api/activities/:id =============
// Edits an existing activity
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    let { activity_name, project_id, activity_date, notes, createdBy, status } =
      req.body

    if (!activity_name || !project_id || !activity_date) {
      return res.status(400).json({
        message: 'activity_name, project_id, and activity_date are required',
      })
    }

    // Convert date to MySQL
    const sqlDate = parseDateForMySQL(activity_date)
    if (!sqlDate) {
      return res.status(400).json({ message: 'Invalid or unparseable date.' })
    }

    // Check if activity exists
    const [existing] = await pool.query('SELECT * FROM activities WHERE id=?', [
      id,
    ])
    if (!existing.length) {
      return res.status(404).json({ message: 'Activity not found' })
    }

    // If the new name is different, ensure it’s not taken
    const oldName = existing[0].activity_name
    if (oldName !== activity_name) {
      const [conflict] = await pool.query(
        'SELECT id FROM activities WHERE activity_name = ? AND id <> ?',
        [activity_name, id]
      )
      if (conflict.length > 0) {
        return res.status(409).json({
          message: 'Activity name already in use by another activity.',
        })
      }
    }

    // Proceed to update
    const sql = `
      UPDATE activities
      SET activity_name=?, project_id=?, activity_date=?,
          notes=?, createdBy=?, status=?
      WHERE id=?
    `
    await pool.query(sql, [
      activity_name,
      project_id,
      sqlDate,
      notes || '',
      createdBy || null,
      status || 'InProgress',
      id,
    ])

    res.json({ message: 'Activity updated successfully' })
  } catch (err) {
    console.error('PUT /activities/:id error:', err)
    res.status(500).json({ message: 'Failed to update activity' })
  }
})

// ============== DELETE => /api/activities/:id =============
router.delete('/:id', async (req, res) => {
  try {
    // Check if activity is in activity_risks or something
    const [childRows] = await pool.query(
      'SELECT id FROM activity_risks WHERE activity_id=?',
      [req.params.id]
    )
    if (childRows.length > 0) {
      return res.status(409).json({
        message: 'Cannot  delete an activity that has data in other tabs.',
      })
    }

    const { id } = req.params
    const [result] = await pool.query('DELETE FROM activities WHERE id=?', [id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Activity not found' })
    }
    res.json({ message: 'Activity deleted successfully' })
  } catch (err) {
    console.error('DELETE /activities/:id error:', err)
    res.status(500).json({ message: 'Failed to delete activity' })
  }
})

export default router
