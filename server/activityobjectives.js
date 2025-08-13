import express from 'express'
import { pool } from './db.js'

const router = express.Router()

//  GET => /api/activity_outcome/:activityId
// server/activityOutcome.js (for example)
router.get('/activity_outcome/:activityId', async (req, res) => {
  const { activityId } = req.params
  try {
    //  Find which project this activity belongs to
    const [actRows] = await pool.query(
      'SELECT project_id FROM activities WHERE id = ?',
      [activityId]
    )
    if (!actRows.length) {
      return res.status(404).json({ message: 'No such activity' })
    }
    const projectId = actRows[0].project_id

    // Find all objectives *for the project*
    const [projObjRows] = await pool.query(
      `
        SELECT po.objective_id, po.id AS projectObjectiveId,
               o.title, o.measurement
        FROM project_objectives po
        JOIN objectives o ON po.objective_id = o.id
        WHERE po.project_id = ?
      `,
      [projectId]
    )

    // For each objective, see if there's already an activity_objectives row
    //    for (activityId, objective_id). If not, insert one with default null "amount" in mysql.
    for (const row of projObjRows) {
      const [actObjRows] = await pool.query(
        'SELECT * FROM activity_objectives WHERE activity_id=? AND objective_id=?',
        [activityId, row.objective_id]
      )
      if (actObjRows.length === 0) {
        // Insert a blank row so each objective is visible in the UI
        await pool.query(
          `
            INSERT INTO activity_objectives (activity_id, objective_id, amount)
            VALUES (?, ?, NULL)
          `,
          [activityId, row.objective_id]
        )
      }
    }

    //  Then fetch the ACTUAL data from activity_objectives
    //    so the front end sees the real amounts that belong to this activity
    const [actObjFull] = await pool.query(
      `
        SELECT ao.id AS activityObjectiveId,
               ao.amount,
               o.title,
               o.measurement
        FROM activity_objectives ao
        JOIN objectives o ON ao.objective_id = o.id
        WHERE ao.activity_id = ?
      `,
      [activityId]
    )

    res.json({ objectives: actObjFull })
  } catch (err) {
    console.error('Error in GET /activity_outcome/:activityId:', err)
    res.status(500).json({ message: 'Failed to load activity outcome' })
  }
})
//  POST => /api/objectives
// Create a new objective in "objectives"
router.post('/objectives', async (req, res) => {
  try {
    const { title, measurement } = req.body
    if (!title || !measurement) {
      return res.status(400).json({ message: 'Missing title or measurement.' })
    }

    const sql = `INSERT INTO objectives (title, measurement) VALUES (?, ?)`
    const [result] = await pool.query(sql, [title, measurement])
    // Return the inserted ID
    return res.status(201).json({
      id: result.insertId,
      message: 'Objective created successfully.',
    })
  } catch (err) {
    console.error('Error creating new objective:', err)
    return res.status(500).json({ message: 'Failed to create new objective.' })
  }
})

//  POST => /api/project_objectives
// Link the new objective to a project
router.post('/project_objectives', async (req, res) => {
  try {
    const { project_id, objective_id, amount } = req.body
    if (!project_id || !objective_id) {
      return res.status(400).json({
        message: 'Missing project_id or objective_id.',
      })
    }

    const sql = `
      INSERT INTO project_objectives (project_id, objective_id, amount)
      VALUES (?, ?, ?)
    `
    await pool.query(sql, [project_id, objective_id, amount ?? null])
    return res
      .status(201)
      .json({ message: 'Objective linked to project successfully.' })
  } catch (err) {
    console.error('Error linking objective to project:', err)
    return res
      .status(500)
      .json({ message: 'Failed to link objective to project.' })
  }
})

// PUT => /api/project_objectives/:id
router.put('/activity_objectives/:id', async (req, res) => {
  const { id } = req.params
  const { amount } = req.body

  try {
    const [result] = await pool.query(
      `
        UPDATE activity_objectives
           SET amount = ?
         WHERE id = ?
      `,
      [amount ?? null, id]
    )
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: 'No such activity_objectives row' })
    }
    res.json({ message: 'Activity objective updated successfully.' })
  } catch (err) {
    console.error('PUT /activity_objectives/:id error:', err)
    res.status(500).json({ message: 'Failed to update activity objective.' })
  }
})

//========= PREDATOR routes ===========

// GET => /api/activity_predator/:activityId
router.get('/activity_predator/:activityId', async (req, res) => {
  const { activityId } = req.params
  try {
    const [rows] = await pool.query(
      `SELECT ap.*, p.sub_type 
         FROM activity_predator ap
         JOIN predator p ON ap.predator_id = p.id
         WHERE ap.activity_id = ?`,
      [activityId]
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to fetch predator records.' })
  }
})

// POST => /api/activity_predator
router.post('/api/activity_predator', async (req, res) => {
  try {
    const {
      activity_id,
      predator_id,
      measurement,
      rats,
      possums,
      mustelids,
      hedgehogs,
      others,
      othersDescription,
    } = req.body

    await pool.query(
      `INSERT INTO activity_predator 
        (activity_id, predator_id, measurement, 
         rats, possums, mustelids, hedgehogs, others, others_description) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        activity_id,
        predator_id,
        measurement ?? null,
        rats ?? 0,
        possums ?? 0,
        mustelids ?? 0,
        hedgehogs ?? 0,
        others ?? 0,
        othersDescription || null,
      ]
    )
    res.status(201).json({ message: 'Predator record created.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to create predator record.' })
  }
})

// PUT => /api/activity_predator/:id
router.put('/api/activity_predator/:id', async (req, res) => {
  const { id } = req.params
  const {
    activity_id,
    predator_id,
    measurement,
    rats,
    possums,
    mustelids,
    hedgehogs,
    others,
    othersDescription,
  } = req.body
  try {
    const [result] = await pool.query(
      `UPDATE activity_predator
       SET activity_id=?, predator_id=?, measurement=?, 
           rats=?, possums=?, mustelids=?, hedgehogs=?, others=?, 
           others_description=?
       WHERE id = ?`,
      [
        activity_id,
        predator_id,
        measurement ?? null,
        rats ?? 0,
        possums ?? 0,
        mustelids ?? 0,
        hedgehogs ?? 0,
        others ?? 0,
        othersDescription || null,
        id,
      ]
    )
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'No predator record found.' })
    }
    res.json({ message: 'Predator record updated.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to update predator record.' })
  }
})

// DELETE => /api/activity_predator/:id
router.delete('/api/activity_predator/:id', async (req, res) => {
  const { id } = req.params
  try {
    await pool.query(`DELETE FROM activity_predator WHERE id = ?`, [id])
    res.json({ message: 'Predator record deleted.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to delete predator record.' })
  }
})
//====================================
// POST => /api/activity_objectives_direct/// add objective to activity
router.post('/activity_objectives_direct', async (req, res) => {
  try {
    const { activity_id, title, measurement } = req.body
    if (!activity_id || !title || !measurement) {
      return res.status(400).json({ message: 'Missing fields.' })
    }

    // Step 1: Add to objectives
    const [objResult] = await pool.query(
      'INSERT INTO objectives (title, measurement) VALUES (?, ?)',
      [title, measurement]
    )
    const objectiveId = objResult.insertId

    // Step 2: Insert into activity_objectives
    await pool.query(
      `INSERT INTO activity_objectives (activity_id, objective_id, amount) VALUES (?, ?, NULL)`,
      [activity_id, objectiveId]
    )

    return res.status(201).json({ message: 'Objective added successfully.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to add objective.' })
  }
})


// POST => /api/activity_objectives_for_existing
// Create activity_objectives entry for an existing project objective
router.post('/activity_objectives_for_existing', async (req, res) => {
  try {
    const { activity_id, objective_id, amount } = req.body
    if (!activity_id || !objective_id) {
      return res.status(400).json({ message: 'Missing activity_id or objective_id.' })
    }

    console.log(`✨ Creating activity_objective for activity ${activity_id}, objective ${objective_id}`)
    
    // Insert into activity_objectives
    const [result] = await pool.query(
      `INSERT INTO activity_objectives (activity_id, objective_id, amount) VALUES (?, ?, ?)`,
      [activity_id, objective_id, amount ?? null]
    )

    console.log(`✅ Created activity_objective with ID ${result.insertId}`)
    return res.status(201).json({ 
      id: result.insertId,
      message: 'Activity objective created successfully.' 
    })
  } catch (err) {
    console.error('Error creating activity objective:', err)
    return res.status(500).json({ message: 'Failed to create activity objective.' })
  }
})

// NEW: Get ALL project objectives with activity values (for comprehensive outcome view)
router.get('/project_objectives_with_activity_values', async (req, res) => {
  const { projectId, activityId } = req.query
  
  if (!projectId || !activityId) {
    return res.status(400).json({ message: 'Missing projectId or activityId parameters' })
  }

  try {
    console.log(`🎯 Loading ALL project objectives for project ${projectId} with activity ${activityId} values`)

    // Get ALL project objectives, with their activity-specific amounts if they exist
    const [rows] = await pool.query(
      `
        SELECT 
          po.objective_id,
          o.title,
          o.measurement,
          COALESCE(ao.id, NULL) AS activityObjectiveId,
          COALESCE(ao.amount, NULL) AS amount
        FROM project_objectives po
        JOIN objectives o ON po.objective_id = o.id
        LEFT JOIN activity_objectives ao ON (ao.objective_id = po.objective_id AND ao.activity_id = ?)
        WHERE po.project_id = ?
        ORDER BY o.title
      `,
      [activityId, projectId]
    )

    console.log(`✅ Found ${rows.length} project objectives for comprehensive view`)
    
    // Transform to match the expected interface
    const objectives = rows.map(row => ({
      activityObjectiveId: row.activityObjectiveId || row.objective_id, // Use objective_id if no activity_objective exists yet
      objective_id: row.objective_id,
      title: row.title,
      measurement: row.measurement,
      amount: row.amount
    }))

    res.json(objectives)
  } catch (err) {
    console.error('Error in GET /project_objectives_with_activity_values:', err)
    res.status(500).json({ message: 'Failed to load comprehensive project objectives' })
  }
})

export default router
