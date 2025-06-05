import express from 'express'
import { pool } from './db.js'

const router = express.Router()

/**
 * Helper to convert an incoming ISO date string
 */
function parseDateForMySQL(isoString) {
  const dateObj = new Date(isoString)
  if (isNaN(dateObj.getTime())) {
    return null
  }
  // build "YYYY-MM-DD"
  const yyyy = dateObj.getUTCFullYear()
  const mm = String(dateObj.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(dateObj.getUTCDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

/**
 * Return all objectives for a given project
 *    GET => /api/report/report_outcome/:projectId
 */
router.get('/report_outcome/:projectId', async (req, res) => {
  const { projectId } = req.params
  try {
    const [rows] = await pool.query(
      `
      SELECT
        po.id AS projectObjectiveId,
        po.objective_id,
        o.title,
        o.measurement
      FROM project_objectives po
      JOIN objectives o ON po.objective_id = o.id
      WHERE po.project_id = ?
    `,
      [projectId]
    )

    res.json({ objectives: rows })
  } catch (err) {
    console.error('Error in GET /report_outcome/:projectId:', err)
    res
      .status(500)
      .json({ message: 'Failed to load objectives for the project.' })
  }
})

/**
 * Return a "report" for the given objective & date range.
 *    GET => /api/report/objective?projectId=..&objectiveId=..&startDate=..&endDate=..
 */
router.get('/objective', async (req, res) => {
  let { projectId, objectiveId, startDate, endDate } = req.query
  if (!projectId || !objectiveId || !startDate || !endDate) {
    return res.status(400).json({
      message: 'Missing projectId, objectiveId, startDate, or endDate.',
    })
  }

  // Convert the incoming dates with the same function your activities.js uses:
  const sqlStart = parseDateForMySQL(startDate)
  const sqlEnd = parseDateForMySQL(endDate)
  if (!sqlStart || !sqlEnd) {
    return res.status(400).json({
      message: 'Invalid or unparseable start/end dates.',
    })
  }

  try {
    // Check if objective is "Predator Control"
    const [objRows] = await pool.query(
      'SELECT id, title FROM objectives WHERE id=?',
      [objectiveId]
    )
    if (!objRows.length) {
      return res.status(404).json({ message: 'No such objective.' })
    }
    const objectiveTitle = (objRows[0].title || '').toLowerCase()
    const isPredator = objectiveTitle.includes('predator control')

    // =========== Predator Objective ===========
    if (isPredator) {
      // Gathering data from activity_predator + activities + predator
      const [predRows] = await pool.query(
        `
        SELECT
          ap.id AS activityPredatorId,
          ap.measurement,
          ap.rats,
          ap.possums,
          ap.mustelids,
          ap.hedgehogs,
          ap.others,
          p.sub_type,
          a.id AS activityId,
          a.activity_name,
          -- same fix: return date as YYYY-MM-DD
          DATE_FORMAT(a.activity_date, '%Y-%m-%d') AS activity_date
        FROM activity_predator ap
        JOIN activities a ON ap.activity_id = a.id
        JOIN predator p ON ap.predator_id = p.id
        WHERE a.project_id = ?
          AND a.activity_date >= ?
          AND a.activity_date <= ?
        ORDER BY a.activity_date ASC
      `,
        [projectId, sqlStart, sqlEnd]
      )

      let trapsEstablishedTotal = 0
      let trapsCheckedTotal = 0
      let totalRats = 0
      let totalPossums = 0
      let totalMustelids = 0
      let totalHedgehogs = 0
      let totalOthers = 0

      // Build an optional detail array for the front end
      const predatorDetailRows = predRows.map((row) => {
        const meas = row.measurement || 0

        // Summation logic
        const st = (row.sub_type || '').toLowerCase()
        if (st === 'traps established') {
          trapsEstablishedTotal += meas
        } else if (st === 'traps checked') {
          trapsCheckedTotal += meas
        } else if (st === 'catches') {
          totalRats += row.rats || 0
          totalPossums += row.possums || 0
          totalMustelids += row.mustelids || 0
          totalHedgehogs += row.hedgehogs || 0
          totalOthers += row.others || 0
        }

        return {
          activityId: row.activityId,
          activityName: row.activity_name,
          activityDate: row.activity_date,
          subType: row.sub_type,
          measurement: meas,
          rats: row.rats || 0,
          possums: row.possums || 0,
          mustelids: row.mustelids || 0,
          hedgehogs: row.hedgehogs || 0,
          others: row.others || 0,
        }
      })

      return res.json({
        // Summaries
        trapsEstablishedTotal,
        trapsCheckedTotal,
        catchesBreakdown: {
          rats: totalRats,
          possums: totalPossums,
          mustelids: totalMustelids,
          hedgehogs: totalHedgehogs,
          others: totalOthers,
        },
        // detail for each predator record
        predatorDetailRows,
      })
    }

    // =========== Normal Objective ===========
    // This sum from activity_objectives + activities in the given date range.
    const [rows] = await pool.query(
      `
      SELECT
        a.id AS activityId,
        a.activity_name,
        -- same fix: return date as YYYY-MM-DD
        DATE_FORMAT(a.activity_date, '%Y-%m-%d') AS activity_date,
        ao.amount
      FROM activity_objectives ao
      JOIN activities a ON ao.activity_id = a.id
      WHERE a.project_id = ?
        AND ao.objective_id = ?
        AND a.activity_date >= ?
        AND a.activity_date <= ?
      ORDER BY a.activity_date ASC
    `,
      [projectId, objectiveId, sqlStart, sqlEnd]
    )

    let totalAmount = 0
    const detailRows = rows.map((r) => {
      const amt = r.amount || 0
      totalAmount += amt
      return {
        activityId: r.activityId,
        activityName: r.activity_name,
        activityDate: r.activity_date,
        amount: amt,
      }
    })

    return res.json({
      detailRows,
      totalAmount,
    })
  } catch (err) {
    console.error('Error generating objective report:', err)
    return res.status(500).json({ message: 'Failed to generate report.' })
  }
})

export default router
