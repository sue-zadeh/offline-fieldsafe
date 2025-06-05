import express from 'express'
import { pool } from './db.js'

const router = express.Router()

// GET /api/site_hazards
router.get('/site_hazards', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM site_hazards')
    res.json(rows)
  } catch (err) {
    console.error('Error fetching site hazards:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// GET /api/activity_people_hazards
router.get('/activity_people_hazards', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM activity_people_hazards')
    res.json(rows)
  } catch (err) {
    console.error('Error fetching activity/people hazards:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// POST /api/site_hazards
router.post('/site_hazards', async (req, res) => {
  try {
    const { hazard_description } = req.body
    if (!hazard_description || !hazard_description.trim()) {
      return res
        .status(400)
        .json({ message: 'Site hazard description is required' })
    }

    const sql = 'INSERT INTO site_hazards (hazard_description) VALUES (?)'
    await pool.query(sql, [hazard_description.trim()])
    return res.status(201).json({ message: 'Site hazard added successfully!' })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Site hazard already exists.' })
    }
    console.error('Error adding site hazard:', error)
    return res.status(500).json({ message: 'Failed to add site hazard.' })
  }
})

// POST /api/activity_people_hazards
router.post('/activity_people_hazards', async (req, res) => {
  try {
    const { hazard_description } = req.body
    if (!hazard_description || !hazard_description.trim()) {
      return res
        .status(400)
        .json({ message: 'Activity/people hazard description is required' })
    }

    const sql =
      'INSERT INTO activity_people_hazards (hazard_description) VALUES (?)'
    await pool.query(sql, [hazard_description.trim()])
    return res
      .status(201)
      .json({ message: 'Activity/people hazard added successfully!' })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res
        .status(400)
        .json({ message: 'Activity/people hazard already exists.' })
    }
    console.error('Error adding activity/people hazard:', error)
    return res
      .status(500)
      .json({ message: 'Failed to add activity/people hazard.' })
  }
})

// PUT /api/site_hazards/:id
router.put('/site_hazards/:id', async (req, res) => {
  const { id } = req.params
  const { hazard_description } = req.body

  if (!hazard_description || !hazard_description.trim()) {
    return res
      .status(400)
      .json({ message: 'Site hazard description is required' })
  }

  try {
    const sql = 'UPDATE site_hazards SET hazard_description = ? WHERE id = ?'
    const [result] = await pool.query(sql, [hazard_description.trim(), id])

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Site hazard not found.' })
    }
    return res.json({ message: 'Site hazard updated successfully!' })
  } catch (error) {
    console.error('Error updating site hazard:', error)
    return res.status(500).json({ message: 'Failed to update site hazard.' })
  }
})

// PUT /api/activity_people_hazards/:id
router.put('/activity_people_hazards/:id', async (req, res) => {
  const { id } = req.params
  const { hazard_description } = req.body

  if (!hazard_description || !hazard_description.trim()) {
    return res
      .status(400)
      .json({ message: 'Activity/people hazard description is required' })
  }

  try {
    const sql =
      'UPDATE activity_people_hazards SET hazard_description = ? WHERE id = ?'
    const [result] = await pool.query(sql, [hazard_description.trim(), id])

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: 'Activity/people hazard not found.' })
    }
    return res.json({ message: 'Activity/people hazard updated successfully!' })
  } catch (error) {
    console.error('Error updating activity/people hazard:', error)
    return res
      .status(500)
      .json({ message: 'Failed to update activity/people hazard.' })
  }
})

// DELETE /api/site_hazards/:id
router.delete('/site_hazards/:id', async (req, res) => {
  const { id } = req.params

  try {
    const [result] = await pool.query('DELETE FROM site_hazards WHERE id = ?', [
      id,
    ])

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Site hazard not found.' })
    }
    res.json({ message: 'Site hazard deleted successfully!' })
  } catch (error) {
    console.error('Error deleting site hazard:', error)
    res.status(500).json({ message: 'Failed to delete site hazard.' })
  }
})

// DELETE /api/activity_people_hazards/:id
router.delete('/activity_people_hazards/:id', async (req, res) => {
  const { id } = req.params

  try {
    const [result] = await pool.query(
      'DELETE FROM activity_people_hazards WHERE id = ?',
      [id]
    )

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: 'Activity/people hazard not found.' })
    }
    res.json({ message: 'Activity/people hazard deleted successfully!' })
  } catch (error) {
    console.error('Error deleting activity/people hazard:', error)
    res
      .status(500)
      .json({ message: 'Failed to delete activity/people hazard.' })
  }
})

export default router
