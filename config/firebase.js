const admin = require("firebase-admin")
const fs = require("fs")
const path = require("path")

// Firebase Admin SDK initialization
let serviceAccount = null
let db = null

try {
  // 1-usul: Environment variables dan foydalanish
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL) {
    console.log("Firebase: Environment variables orqali ulanish...")

    serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY
        ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
        : undefined,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
    }
  }
  // 2-usul: serviceAccountKey.json faylidan foydalanish
  else {
    console.log("Firebase: serviceAccountKey.json faylidan ulanish...")

    const serviceAccountPath = path.join(__dirname, "../serviceAccountKey.json")

    if (fs.existsSync(serviceAccountPath)) {
      serviceAccount = require(serviceAccountPath)
    } else {
      console.error("serviceAccountKey.json fayli topilmadi!")
    }
  }

  // Firebase-ni ishga tushirish
  if (serviceAccount) {
    // Agar allaqachon ishga tushirilgan bo'lsa, yangi app yaratmaslik
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      })
    }

    db = admin.firestore()
    console.log("Firebase initialized successfully")
  } else {
    console.error("Firebase initialization failed: Missing service account credentials")
  }
} catch (error) {
  console.error("Firebase initialization error:", error)

  // Demo ma'lumotlar bilan ishlash
  console.log("Using demo data mode...")
}

// Firestore o'rniga demo ma'lumotlar bilan ishlash uchun funksiyalar
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
  {
    id: "demo-user-3",
    firstName: "Gulnora",
    lastName: "Karimova",
    direction: "Chemistry",
    phone: "+998 93 345 67 89",
    telegram: "@gulnora",
    login: "gulnora",
    password: "123456",
    createdAt: Date.now(),
  },
]

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

const demoResults = []

// Demo ma'lumotlar bilan ishlash uchun funksiyalar
const demoDb = {
  collection: (collectionName) => {
    return {
      doc: (docId) => {
        return {
          get: async () => {
            let data = null
            let exists = false

            if (collectionName === "users") {
              data = demoUsers.find((user) => user.id === docId)
            } else if (collectionName === "tests") {
              data = demoTests.find((test) => test.id === docId)
            } else if (collectionName === "results") {
              data = demoResults.find((result) => result.id === docId)
            }

            exists = !!data

            return {
              exists,
              id: docId,
              data: () => data,
            }
          },
          set: async (data) => {
            if (collectionName === "users") {
              const index = demoUsers.findIndex((user) => user.id === docId)
              if (index !== -1) {
                demoUsers[index] = { ...demoUsers[index], ...data }
              } else {
                demoUsers.push({ id: docId, ...data })
              }
            } else if (collectionName === "tests") {
              const index = demoTests.findIndex((test) => test.id === docId)
              if (index !== -1) {
                demoTests[index] = { ...demoTests[index], ...data }
              } else {
                demoTests.push({ id: docId, ...data })
              }
            } else if (collectionName === "results") {
              const index = demoResults.findIndex((result) => result.id === docId)
              if (index !== -1) {
                demoResults[index] = { ...demoResults[index], ...data }
              } else {
                demoResults.push({ id: docId, ...data })
              }
            }
            return true
          },
          update: async (data) => {
            if (collectionName === "users") {
              const index = demoUsers.findIndex((user) => user.id === docId)
              if (index !== -1) {
                demoUsers[index] = { ...demoUsers[index], ...data }
              }
            } else if (collectionName === "tests") {
              const index = demoTests.findIndex((test) => test.id === docId)
              if (index !== -1) {
                demoTests[index] = { ...demoTests[index], ...data }
              }
            } else if (collectionName === "results") {
              const index = demoResults.findIndex((result) => result.id === docId)
              if (index !== -1) {
                demoResults[index] = { ...demoResults[index], ...data }
              }
            }
            return true
          },
          delete: async () => {
            if (collectionName === "users") {
              const index = demoUsers.findIndex((user) => user.id === docId)
              if (index !== -1) {
                demoUsers.splice(index, 1)
              }
            } else if (collectionName === "tests") {
              const index = demoTests.findIndex((test) => test.id === docId)
              if (index !== -1) {
                demoTests.splice(index, 1)
              }
            } else if (collectionName === "results") {
              const index = demoResults.findIndex((result) => result.id === docId)
              if (index !== -1) {
                demoResults.splice(index, 1)
              }
            }
            return true
          },
        }
      },
      where: (field, operator, value) => {
        return {
          get: async () => {
            let filteredData = []

            if (collectionName === "users") {
              filteredData = demoUsers.filter((user) => {
                if (operator === "==") return user[field] === value
                if (operator === "!=") return user[field] !== value
                return false
              })
            } else if (collectionName === "tests") {
              filteredData = demoTests.filter((test) => {
                if (operator === "==") return test[field] === value
                if (operator === "!=") return test[field] !== value
                return false
              })
            } else if (collectionName === "results") {
              filteredData = demoResults.filter((result) => {
                if (operator === "==") return result[field] === value
                if (operator === "!=") return result[field] !== value
                return false
              })
            }

            return {
              docs: filteredData.map((doc) => ({
                id: doc.id,
                data: () => doc,
                exists: true,
              })),
              empty: filteredData.length === 0,
            }
          },
        }
      },
      get: async () => {
        let data = []

        if (collectionName === "users") {
          data = demoUsers
        } else if (collectionName === "tests") {
          data = demoTests
        } else if (collectionName === "results") {
          data = demoResults
        }

        return {
          docs: data.map((doc) => ({
            id: doc.id,
            data: () => doc,
            exists: true,
          })),
          empty: data.length === 0,
        }
      },
      limit: (limit) => {
        return {
          get: async () => {
            let data = []

            if (collectionName === "users") {
              data = demoUsers.slice(0, limit)
            } else if (collectionName === "tests") {
              data = demoTests.slice(0, limit)
            } else if (collectionName === "results") {
              data = demoResults.slice(0, limit)
            }

            return {
              docs: data.map((doc) => ({
                id: doc.id,
                data: () => doc,
                exists: true,
              })),
              empty: data.length === 0,
            }
          },
        }
      },
      batch: () => {
        const operations = []

        return {
          set: (docRef, data) => {
            operations.push({ type: "set", docRef, data })
          },
          update: (docRef, data) => {
            operations.push({ type: "update", docRef, data })
          },
          delete: (docRef) => {
            operations.push({ type: "delete", docRef })
          },
          commit: async () => {
            // Implement batch operations
            return true
          },
        }
      },
    }
  },
}

// Agar Firestore ulanmagan bo'lsa, demo ma'lumotlar bilan ishlash
module.exports = { db: db || demoDb }
