const fs = require("fs")
const path = require("path")
require("dotenv").config()

// Firebase konfiguratsiyasini yuklash
const { db } = require("../config/firebase")

// Data storage paths
const DATA_DIR = path.join(__dirname, "..", "data")
const USERS_FILE = path.join(DATA_DIR, "users.json")
const TESTS_FILE = path.join(DATA_DIR, "tests.json")
const RESULTS_FILE = path.join(DATA_DIR, "results.json")
const VERIFICATION_CODES_FILE = path.join(DATA_DIR, "verification_codes.json")

// Helper function to read data
function readData(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File does not exist: ${filePath}`)
      return filePath === VERIFICATION_CODES_FILE ? {} : []
    }
    const data = fs.readFileSync(filePath, "utf8")
    return JSON.parse(data)
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error)
    return filePath === VERIFICATION_CODES_FILE ? {} : []
  }
}

// Migrate users
async function migrateUsers() {
  console.log("Migrating users...")
  const users = readData(USERS_FILE)

  if (users.length === 0) {
    console.log("No users to migrate")
    return
  }

  const batch = db.batch()

  for (const user of users) {
    const userRef = db.collection("users").doc(user.id)
    batch.set(userRef, user)
  }

  await batch.commit()
  console.log(`Migrated ${users.length} users`)
}

// Migrate tests
async function migrateTests() {
  console.log("Migrating tests...")
  const tests = readData(TESTS_FILE)

  if (tests.length === 0) {
    console.log("No tests to migrate")
    return
  }

  const batch = db.batch()

  for (const test of tests) {
    const testRef = db.collection("tests").doc(test.id)
    batch.set(testRef, test)
  }

  await batch.commit()
  console.log(`Migrated ${tests.length} tests`)
}

// Migrate results
async function migrateResults() {
  console.log("Migrating results...")
  const results = readData(RESULTS_FILE)

  if (results.length === 0) {
    console.log("No results to migrate")
    return
  }

  const batch = db.batch()

  for (const result of results) {
    const resultRef = db.collection("results").doc(result.id)
    batch.set(resultRef, result)
  }

  await batch.commit()
  console.log(`Migrated ${results.length} results`)
}

// Migrate verification codes
async function migrateVerificationCodes() {
  console.log("Migrating verification codes...")
  const codes = readData(VERIFICATION_CODES_FILE)

  if (Object.keys(codes).length === 0) {
    console.log("No verification codes to migrate")
    return
  }

  const batch = db.batch()

  for (const [telegram, codeData] of Object.entries(codes)) {
    const codeRef = db.collection("verification_codes").doc(telegram)
    batch.set(codeRef, codeData)
  }

  await batch.commit()
  console.log(`Migrated ${Object.keys(codes).length} verification codes`)
}

// Create demo data if no existing data
async function createDemoData() {
  console.log("Creating demo data...")

  // Demo users
  const demoUsers = [
    {
      id: "demo-user-1",
      firstName: "Alisher",
      lastName: "Navoiy",
      direction: "Mathematics",
      phone: "+998 90 123 45 67",
      telegram: "@alisher",
      login: "alisher",
      password: "123456",
      createdAt: Date.now(),
    },
    {
      id: "demo-user-2",
      firstName: "Bobur",
      lastName: "Mirzo",
      direction: "Physics",
      phone: "+998 91 234 56 78",
      telegram: "@bobur",
      login: "bobur",
      password: "123456",
      createdAt: Date.now(),
    },
  ]

  // Demo tests
  const demoTests = [
    {
      id: "demo-test-1",
      title: "Matematika asoslari",
      direction: "Mathematics",
      questions: [
        { text: "2+2=?", options: { a: "3", b: "4", c: "5", d: "6" }, correct: "b" },
        { text: "3×3=?", options: { a: "6", b: "9", c: "12", d: "15" }, correct: "b" },
        { text: "10-7=?", options: { a: "2", b: "3", c: "4", d: "5" }, correct: "b" },
      ],
      timeLimit: 10,
      createdAt: Date.now(),
    },
    {
      id: "demo-test-2",
      title: "Algebra",
      direction: "Mathematics",
      questions: [
        { text: "x+5=9, x=?", options: { a: "3", b: "4", c: "5", d: "6" }, correct: "b" },
        { text: "2x=10, x=?", options: { a: "3", b: "5", c: "7", d: "9" }, correct: "b" },
      ],
      timeLimit: 15,
      createdAt: Date.now(),
    },
  ]

  // Save demo users
  for (const user of demoUsers) {
    await db.collection("users").doc(user.id).set(user)
  }

  // Save demo tests
  for (const test of demoTests) {
    await db.collection("tests").doc(test.id).set(test)
  }

  console.log("Demo data created successfully!")
}

// Run migration
async function runMigration() {
  try {
    console.log("Starting migration to Firestore...")

    await migrateUsers()
    await migrateTests()
    await migrateResults()
    await migrateVerificationCodes()

    // Check if any data was migrated, if not create demo data
    const usersSnapshot = await db.collection("users").get()
    const testsSnapshot = await db.collection("tests").get()

    if (usersSnapshot.empty && testsSnapshot.empty) {
      await createDemoData()
    }

    console.log("Migration completed successfully!")
  } catch (error) {
    console.error("Migration failed:", error)
  }
}

// Run the migration
runMigration()
