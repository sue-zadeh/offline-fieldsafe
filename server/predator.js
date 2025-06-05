import express from 'express'
import { pool } from './db.js'

const router = express.Router()

// GET => /api/predator
router.get('/predator', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM predator')
    res.json(rows)
  } catch (err) {
    console.error('Error fetching predator list:', err)
    res.status(500).json({ message: 'Failed to fetch predator list.' })
  }
})

// GET => /api/activity_predator/:activity_id
router.get('/activity_predator/:activity_id', async (req, res) => {
  const { activity_id } = req.params
  try {
    const sql = `
      SELECT
        ap.id,
        ap.activity_id,
        ap.predator_id,
        p.sub_type,
        ap.measurement,
        ap.dateStart,
        ap.dateEnd,
        ap.rats,
        ap.possums,
        ap.mustelids,
        ap.hedgehogs,
        ap.others,
        ap.others_description
      FROM activity_predator ap
      JOIN predator p ON ap.predator_id = p.id
      WHERE ap.activity_id = ?
    `
    const [rows] = await pool.query(sql, [activity_id])
    res.json(rows)
  } catch (err) {
    console.error('Error fetching activity predators:', err)
    res.status(500).json({ message: 'Failed to fetch activity predators.' })
  }
})

// POST => /api/activity_predator
router.post('/activity_predator', async (req, res) => {
  try {
    const {
      activity_id,
      predator_id,
      measurement,
      dateStart,
      dateEnd,
      rats,
      possums,
      mustelids,
      hedgehogs,
      others,
      othersDescription,
    } = req.body

    // block date < 2024
    let dStart = dateStart ?? null
    let dEnd = dateEnd ?? null
    if (dStart && dStart < '2024-01-01') dStart = '2024-01-01'
    if (dEnd && dEnd < '2024-01-01') dEnd = '2024-01-01'

    // fix "day behind" if needed:
    if (dStart) {
      let ds = new Date(dStart + 'T00:00:00')
      dStart = ds.toISOString().split('T')[0]
    }

    const sql = `
      INSERT INTO activity_predator
      (activity_id, predator_id, measurement, dateStart, dateEnd,
       rats, possums, mustelids, hedgehogs, others, others_description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    await pool.query(sql, [
      activity_id,
      predator_id,
      measurement ?? null,
      dStart,
      dEnd,
      rats ?? 0,
      possums ?? 0,
      mustelids ?? 0,
      hedgehogs ?? 0,
      others ?? 0,
      othersDescription ?? '',
    ])
    res.status(201).json({ message: 'Predator record added successfully.' })
  } catch (err) {
    console.error('Error inserting predator record:', err)
    res.status(500).json({ message: 'Failed to add predator record.' })
  }
})

// PUT => /api/activity_predator/:id
router.put('/activity_predator/:id', async (req, res) => {
  try {
    const { id } = req.params
    let {
      activity_id,
      predator_id,
      measurement,
      dateStart,
      dateEnd,
      rats,
      possums,
      mustelids,
      hedgehogs,
      others,
      othersDescription,
    } = req.body

    if (dateStart && dateStart < '2024-01-01') dateStart = '2024-01-01'
    if (dateEnd && dateEnd < '2024-01-01') dateEnd = '2024-01-01'

    const sql = `
      UPDATE activity_predator
      SET activity_id = ?,
          predator_id = ?,
          measurement = ?,
          dateStart = ?,
          dateEnd = ?,
          rats = ?,
          possums = ?,
          mustelids = ?,
          hedgehogs = ?,
          others = ?,
          others_description = ?
      WHERE id = ?
    `
    const [result] = await pool.query(sql, [
      activity_id,
      predator_id,
      measurement ?? null,
      dateStart ?? null,
      dateEnd ?? null,
      rats ?? 0,
      possums ?? 0,
      mustelids ?? 0,
      hedgehogs ?? 0,
      others ?? 0,
      othersDescription ?? '',
      id,
    ])
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'No predator record found.' })
    }
    res.json({ message: 'Predator record updated successfully.' })
  } catch (err) {
    console.error('Error updating predator record:', err)
    res.status(500).json({ message: 'Failed to update predator record.' })
  }
})

// DELETE => /api/activity_predator/:id
router.delete('/activity_predator/:id', async (req, res) => {
  try {
    const { id } = req.params
    const [result] = await pool.query(
      'DELETE FROM activity_predator WHERE id = ?',
      [id]
    )
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Predator record not found.' })
    }
    res.json({ message: 'Predator record deleted successfully.' })
  } catch (err) {
    console.error('Error deleting predator record:', err)
    res.status(500).json({ message: 'Failed to delete predator record.' })
  }
})

export default router
