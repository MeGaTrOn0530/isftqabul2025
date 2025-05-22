const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const path = require("path")
const dotenv = require("dotenv")

// Load environment variables
dotenv.config()

// Import routes
const authRoutes = require("./routes/auth")
const userRoutes = require("./routes/users")
const testRoutes = require("./routes/tests")
const resultRoutes = require("./routes/results")
const statisticsRoutes = require("./routes/statistics")

// Create Express app
const app = express()
const PORT = process.env.PORT || 3000

// CORS middleware - enable CORS for all origins
app.use(cors())

// Add specific CORS headers for all routes
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS")
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With")

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end()
  }

  next()
})

// Body parser middleware
app.use(bodyParser.json())

// API routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/tests", testRoutes)
app.use("/api/results", resultRoutes)
app.use("/api/statistics", statisticsRoutes)

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, "../frontend")))

// Define specific routes for HTML files instead of catch-all
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"))
})

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dashboard.html"))
})

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/admin.html"))
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ success: false, message: "Server xatoligi" })
})

// Start the server
app.listen(PORT, () => {
  console.log(`Backend server ${PORT} portida ishga tushirildi`)
  console.log("Firebase Firestore bilan bog'langan")
})
