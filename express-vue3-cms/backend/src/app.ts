import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { apiLimiter } from './middleware/rateLimiter.js'
import { errorHandler } from './middleware/errorHandler.js'
import { routes } from './routes/index.js'

dotenv.config()

const app = express()

// Security
app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors())

// Rate limiting
app.use('/api', apiLimiter)

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Static files
app.use('/public', express.static('public'))

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ code: 0, msg: 'ok', data: { uptime: process.uptime() } })
})

// API routes
app.use('/api/v1', routes)

// 404
app.use((_req, res) => {
  res.status(404).json({ code: 404, msg: '接口不存在', data: null })
})

// Global error handler (must be last)
app.use(errorHandler)

export default app
