// server/routes/api.js
import express from 'express'
const router = express.Router()

router.get('/ping', (req, res) => {
  res.json({ message: 'pong from routes/api.js' })
})

export default router
