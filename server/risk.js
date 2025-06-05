import express from 'express'
import { pool } from './db.js'

const router = express.Router()

// Fetch all risks (the "risk_titles" table)
router.get('/risks', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, title, isReadOnly FROM risk_titles ORDER BY id'
    )
    res.json(rows)
  } catch (err) {
    console.error('Error:', err)
    res.status(500).json({ message: 'Failed to fetch risks.' })
  }
})

// Fetch controls for a given risk_title_id
router.get('/risks/:id/controls', async (req, res) => {
  try {
    const { id } = req.params
    const [rows] = await pool.query(
      'SELECT id, risk_title_id, control_text, isReadOnly FROM risk_controls WHERE risk_title_id = ?',
      [id]
    )
    res.json(rows)
  } catch (err) {
    console.error('Error:', err)
    res.status(500).json({ message: 'Failed to fetch controls.' })
  }
})

// Create a new risk (in risk_titles)
router.post('/risks', async (req, res) => {
  try {
    const { title, isReadOnly = 0 } = req.body
    const [result] = await pool.query(
      'INSERT INTO risk_titles (title, isReadOnly) VALUES (?, ?)',
      [title, isReadOnly]
    )
    // Return the new risk's ID so frontend can insert controls
    res.status(201).json({ id: result.insertId })
  } catch (err) {
    console.error('Error:', err)
    res.status(500).json({ message: 'Failed to create risk.' })
  }
})

// Update a risk's title
router.put('/risks/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { title } = req.body
    // Check if read-only
    const [[risk]] = await pool.query(
      'SELECT isReadOnly FROM risk_titles WHERE id = ?',
      [id]
    )
    if (!risk || risk.isReadOnly) {
      return res.status(403).json({ message: 'Cannot edit a read-only risk.' })
    }
    // Update DB
    await pool.query('UPDATE risk_titles SET title = ? WHERE id = ?', [
      title,
      id,
    ])
    res.json({ message: 'Risk title updated successfully.' })
  } catch (err) {
    console.error('Error:', err)
    res.status(500).json({ message: 'Failed to edit risk.' })
  }
})

// Add a control to a risk
router.post('/risks/:id/controls', async (req, res) => {
  try {
    const { id } = req.params
    const { control_text, isReadOnly = 0 } = req.body
    await pool.query(
      'INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES (?, ?, ?)',
      [id, control_text, isReadOnly]
    )
    res.status(201).json({ message: 'Control added successfully.' })
  } catch (err) {
    console.error('Error:', err)
    res.status(500).json({ message: 'Failed to add control.' })
  }
})

// Edit an existing control's text
router.put('/risk_controls/:controlId', async (req, res) => {
  try {
    const { controlId } = req.params
    const { control_text } = req.body
    // Check if read-only
    const [[control]] = await pool.query(
      'SELECT isReadOnly FROM risk_controls WHERE id = ?',
      [controlId]
    )
    if (!control || control.isReadOnly) {
      return res
        .status(403)
        .json({ message: 'Cannot edit a read-only control.' })
    }
    // Update DB
    await pool.query('UPDATE risk_controls SET control_text = ? WHERE id = ?', [
      control_text,
      controlId,
    ])
    res.json({ message: 'Control updated successfully.' })
  } catch (err) {
    console.error('Error:', err)
    res.status(500).json({ message: 'Failed to update control.' })
  }
})

// Delete an entire risk
router.delete('/risks/:id', async (req, res) => {
  try {
    const { id } = req.params
    // Check if read-only
    const [[risk]] = await pool.query(
      'SELECT isReadOnly FROM risk_titles WHERE id = ?',
      [id]
    )
    if (!risk || risk.isReadOnly) {
      return res
        .status(403)
        .json({ message: 'Cannot delete a read-only risk.' })
    }
    // Delete it
    await pool.query('DELETE FROM risk_titles WHERE id = ?', [id])
    res.json({ message: 'Risk deleted successfully.' })
  } catch (err) {
    console.error('Error:', err)
    res.status(500).json({ message: 'Failed to delete risk.' })
  }
})

// Delete a single control
router.delete('/risk_controls/:controlId', async (req, res) => {
  try {
    const { controlId } = req.params
    // Check if read-only
    const [[control]] = await pool.query(
      'SELECT isReadOnly FROM risk_controls WHERE id = ?',
      [controlId]
    )
    if (!control || control.isReadOnly) {
      return res
        .status(403)
        .json({ message: 'Cannot delete a read-only control.' })
    }
    // Delete it
    await pool.query('DELETE FROM risk_controls WHERE id = ?', [controlId])
    res.json({ message: 'Control deleted successfully.' })
  } catch (err) {
    console.error('Error:', err)
    res.status(500).json({ message: 'Failed to delete control.' })
  }
})

export default router
