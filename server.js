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

// CORS middleware - enable CORS for specific origins
app.use(
  cors({
    origin: [
      "https://testplat-forma.netlify.app", // Frontend domeningiz
      "http://localhost:3000",
      "http://localhost:5000",
      "http://localhost:8080",
      "http://127.0.0.1:5500",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Content-Length", "X-Requested-With"],
    credentials: true,
  }),
)

// Add specific CORS headers for all routes
app.use((req, res, next) => {
  const allowedOrigins = [
    "https://testplat-forma.netlify.app", // Frontend domeningiz
    "http://localhost:3000",
    "http://localhost:5000",
    "http://localhost:8080",
    "http://127.0.0.1:5500",
  ]

  const origin = req.headers.origin
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin)
  }

  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS")
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With")
  res.header("Access-Control-Allow-Credentials", "true")

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

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "API server is running",
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      tests: "/api/tests",
      results: "/api/results",
      statistics: "/api/statistics",
    },
  })
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
