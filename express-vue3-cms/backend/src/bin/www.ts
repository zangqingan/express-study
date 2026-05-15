import app from '../app'

const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
  console.log(`[CMS Backend] Server running on http://localhost:${PORT}`)
  console.log(`[CMS Backend] Environment: ${process.env.NODE_ENV || 'development'}`)
})
