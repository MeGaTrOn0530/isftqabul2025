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

// CORS middleware - BARCHA domainlar uchun ruxsat berish
app.use(
  cors({
    origin: "*", // Barcha domainlarga ruxsat berish
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Content-Length", "X-Requested-With"],
  }),
)

// Body parser middleware
app.use(bodyParser.json())

// API routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/tests", testRoutes)
app.use("/api/results", resultRoutes)
app.use("/api/statistics", statisticsRoutes)

// Oddiy API endpointlar (frontend uchun)
app.use("/auth", authRoutes)
app.use("/users", userRoutes)
app.use("/tests", testRoutes)
app.use("/results", resultRoutes)
app.use("/statistics", statisticsRoutes)

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "API server is running",
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: "/api/auth or /auth",
      users: "/api/users or /users",
      tests: "/api/tests or /tests",
      results: "/api/results or /results",
      statistics: "/api/statistics or /statistics",
    },
  })
})

// Debug endpoint
app.get("/debug", async (req, res) => {
  try {
    // Check database connection
    const { db } = require("./config/firebase")

    // Try to get a user
    const usersSnapshot = await db.collection("users").limit(1).get()
    const hasUsers = !usersSnapshot.empty

    // Try to get a test
    const testsSnapshot = await db.collection("tests").limit(1).get()
    const hasTests = !testsSnapshot.empty

    res.json({
      success: true,
      message: "API server is running in " + (hasUsers || hasTests ? "database" : "demo") + " mode",
      timestamp: new Date().toISOString(),
      database: {
        hasUsers,
        hasTests,
        mode: hasUsers || hasTests ? "database" : "demo",
      },
    })
  } catch (error) {
    res.json({
      success: false,
      message: "API server is running in demo mode due to database error",
      error: error.message,
      timestamp: new Date().toISOString(),
    })
  }
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ success: false, message: "Server xatoligi" })
})

// Start the server
app.listen(PORT, () => {
  console.log(`Backend server ${PORT} portida ishga tushirildi`)
  console.log("Firebase Firestore bilan bog'langan (yoki demo rejimda)")
})
