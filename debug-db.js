const { db } = require("./config/firebase")

// Collection references
const USERS_COLLECTION = "users"
const TESTS_COLLECTION = "tests"
const RESULTS_COLLECTION = "results"

async function checkDatabaseConnection() {
  console.log("Checking database connection...")

  try {
    // Check users collection
    const usersSnapshot = await db.collection(USERS_COLLECTION).limit(1).get()
    console.log(`Users collection exists: ${!usersSnapshot.empty}`)
    if (!usersSnapshot.empty) {
      console.log(`Sample user:`, usersSnapshot.docs[0].data())
    }

    // Check tests collection
    const testsSnapshot = await db.collection(TESTS_COLLECTION).limit(1).get()
    console.log(`Tests collection exists: ${!testsSnapshot.empty}`)
    if (!testsSnapshot.empty) {
      console.log(`Sample test:`, testsSnapshot.docs[0].data())
    }

    // Check results collection
    const resultsSnapshot = await db.collection(RESULTS_COLLECTION).limit(1).get()
    console.log(`Results collection exists: ${!resultsSnapshot.empty}`)
    if (!resultsSnapshot.empty) {
      console.log(`Sample result:`, resultsSnapshot.docs[0].data())
    }

    console.log("Database connection check completed successfully")
    return true
  } catch (error) {
    console.error("Database connection check failed:", error)
    return false
  }
}

// Run the check
checkDatabaseConnection().then((isConnected) => {
  if (isConnected) {
    console.log("✅ Database is connected and working properly")
  } else {
    console.error("❌ Database connection has issues")
  }
})

module.exports = { checkDatabaseConnection }
