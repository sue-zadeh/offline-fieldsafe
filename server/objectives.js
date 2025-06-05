import express from 'express'
import { pool } from './db.js'

const router = express.Router()

// GET /api/objectives
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM objectives')
    res.json(rows)
  } catch (err) {
    console.error('Error fetching objectives:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// POST /api/objectives
router.post('/', async (req, res) => {
  try {
    const { title, measurement } = req.body
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Objective title is required' })
    }
    if (!measurement || !measurement.trim()) {
      return res.status(400).json({ message: 'Measurement is required' })
    }

    const sql = 'INSERT INTO objectives (title, measurement) VALUES (?, ?)'
    await pool.query(sql, [title.trim(), measurement.trim()])
    return res.status(201).json({ message: 'Objective added successfully!' })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res
        .status(400)
        .json({ message: 'Objective title already exists.' })
    }
    console.error('Error adding objective:', error)
    return res.status(500).json({ message: 'Failed to add objective.' })
  }
})

// PUT /api/objectives/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { title, measurement } = req.body
  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Objective title is required' })
  }
  if (!measurement || !measurement.trim()) {
    return res.status(400).json({ message: 'Measurement is required' })
  }

  try {
    const sql = 'UPDATE objectives SET title = ?, measurement = ? WHERE id = ?'
    const [result] = await pool.query(sql, [
      title.trim(),
      measurement.trim(),
      id,
    ])
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Objective not found' })
    }
    return res.json({ message: 'Objective updated successfully!' })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      // uniqueness objective title ============
      return res
        .status(400)
        .json({ message: 'Objective title already exists.' })
    }
    console.error('Error updating objective:', error)
    return res.status(500).json({ message: 'Failed to update objective.' })
  }
})

// DELETE Objective ================
router.delete('/:id', async (req, res) => {
  const { id } = req.params
  try {
    // First, delete related records in project_objectives
    await pool.query('DELETE FROM project_objectives WHERE objective_id = ?', [
      id,
    ])

    // Then, delete the objective itself
    const [result] = await pool.query('DELETE FROM objectives WHERE id = ?', [
      id,
    ])

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Objective not found.' })
    }

    res.json({ message: 'Objective deleted successfully!' })
  } catch (error) {
    console.error('Error deleting objective:', error)
    res.status(500).json({ message: 'Internal server error.' })
  }
})

// ================================================================
//     NEW ENDPOINTS FOR THE "OUTCOME" / "ACTIVITY OBJECTIVES"
// ================================================================
// GET objectives for a specific activity
// router.get('/activity_objectives/:activity_id', async (req, res) => {
//   const { activity_id } = req.params
//   try {
//     const sql = `
//       SELECT
//         ao.id AS activityObjectiveId,
//         ao.activity_id,
//         ao.project_id
//         ao.objective_id,
//         ao.amount,
//         ao.dateStart,
//         ao.dateEnd,
//         o.title,
//         o.measurement
//       FROM activity_objectives ao
//       JOIN objectives o ON ao.objective_id = o.id
//       WHERE ao.activity_id = ?;
//     `
//     const [rows] = await pool.query(sql, [activity_id])
//     res.json(rows)
//   } catch (err) {
//     console.error('Error fetching activity objectives:', err)
//     res.status(500).json({ message: 'Failed to fetch activity objectives.' })
//   }
// })

// // POST a new objective for an activity
// router.post('/activity_objectives', async (req, res) => {
//   try {
//     const { activity_id, objective_id, amount, dateStart, dateEnd } = req.body

//     const sql = `
//       INSERT INTO activity_objectives
//       (activity_id, objective_id, amount, dateStart, dateEnd)
//       VALUES (?, ?, ?, ?, ?)
//     `
//     await pool.query(sql, [
//       activity_id,
//       objective_id,
//       amount ?? null,
//       dateStart ?? null,
//       dateEnd ?? null,
//     ])

//     res
//       .status(201)
//       .json({ message: 'Objective added successfully to activity.' })
//   } catch (error) {
//     console.error('Error inserting activity objective:', error)
//     res.status(500).json({ message: 'Failed to add objective to activity.' })
//   }
// })

export default router
