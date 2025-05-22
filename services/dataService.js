const { db } = require("../config/firebase")
const { v4: uuidv4 } = require("uuid")

// Collection references
const USERS_COLLECTION = "users"
const TESTS_COLLECTION = "tests"
const RESULTS_COLLECTION = "results"
const VERIFICATION_CODES_COLLECTION = "verification_codes"

// User functions
exports.getUsers = async () => {
  try {
    const usersSnapshot = await db.collection(USERS_COLLECTION).get()
    return usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error(`Error getting users:`, error)
    return []
  }
}

exports.getUserById = async (userId) => {
  try {
    const userDoc = await db.collection(USERS_COLLECTION).doc(userId).get()
    if (!userDoc.exists) {
      return null
    }
    return { id: userDoc.id, ...userDoc.data() }
  } catch (error) {
    console.error(`Error getting user by ID:`, error)
    return null
  }
}

exports.saveUsers = async (users) => {
  // This function is not needed with Firestore as we save users individually
  return true
}

exports.saveUser = async (user) => {
  try {
    if (!user.id) {
      user.id = uuidv4()
    }
    await db.collection(USERS_COLLECTION).doc(user.id).set(user)
    return true
  } catch (error) {
    console.error(`Error saving user:`, error)
    return false
  }
}

exports.deleteUser = async (userId) => {
  try {
    // Delete user
    await db.collection(USERS_COLLECTION).doc(userId).delete()

    // Delete user's results
    const resultsSnapshot = await db.collection(RESULTS_COLLECTION).where("userId", "==", userId).get()

    const batch = db.batch()
    resultsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref)
    })

    await batch.commit()
    return true
  } catch (error) {
    console.error(`Error deleting user:`, error)
    return false
  }
}

// Test functions
exports.getTests = async () => {
  try {
    const testsSnapshot = await db.collection(TESTS_COLLECTION).get()
    return testsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error(`Error getting tests:`, error)
    return []
  }
}

exports.getTestById = async (testId) => {
  try {
    const testDoc = await db.collection(TESTS_COLLECTION).doc(testId).get()
    if (!testDoc.exists) {
      return null
    }
    return { id: testDoc.id, ...testDoc.data() }
  } catch (error) {
    console.error(`Error getting test by ID:`, error)
    return null
  }
}

exports.saveTest = async (test) => {
  try {
    if (!test.id) {
      test.id = uuidv4()
    }
    await db.collection(TESTS_COLLECTION).doc(test.id).set(test)
    return true
  } catch (error) {
    console.error(`Error saving test:`, error)
    return false
  }
}

exports.deleteTest = async (testId) => {
  try {
    // Delete test
    await db.collection(TESTS_COLLECTION).doc(testId).delete()

    // Delete test results
    const resultsSnapshot = await db.collection(RESULTS_COLLECTION).where("testId", "==", testId).get()

    const batch = db.batch()
    resultsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref)
    })

    await batch.commit()
    return true
  } catch (error) {
    console.error(`Error deleting test:`, error)
    return false
  }
}

// Result functions
exports.getResults = async (userId = null) => {
  try {
    let query = db.collection(RESULTS_COLLECTION)

    if (userId) {
      query = query.where("userId", "==", userId)
    }

    const resultsSnapshot = await query.get()
    return resultsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error(`Error getting results:`, error)
    return []
  }
}

exports.saveResult = async (result) => {
  try {
    if (!result.id) {
      result.id = uuidv4()
    }
    await db.collection(RESULTS_COLLECTION).doc(result.id).set(result)
    return true
  } catch (error) {
    console.error(`Error saving result:`, error)
    return false
  }
}

// Verification code functions
exports.saveVerificationCode = async (telegram, code) => {
  try {
    await db.collection(VERIFICATION_CODES_COLLECTION).doc(telegram).set({
      code,
      timestamp: Date.now(),
      verified: false,
    })
    return true
  } catch (error) {
    console.error(`Error saving verification code:`, error)
    return false
  }
}

exports.verifyCode = async (telegram, code) => {
  try {
    const codeDoc = await db.collection(VERIFICATION_CODES_COLLECTION).doc(telegram).get()

    if (!codeDoc.exists) {
      return false
    }

    const storedCode = codeDoc.data()

    // Check if code matches
    if (storedCode.code !== code) {
      return false
    }

    // Check if code is expired (15 minutes)
    const now = Date.now()
    const codeTime = storedCode.timestamp
    const diffMinutes = (now - codeTime) / (1000 * 60)

    if (diffMinutes > 15) {
      return false
    }

    // Mark as verified
    await db.collection(VERIFICATION_CODES_COLLECTION).doc(telegram).update({
      verified: true,
    })

    return true
  } catch (error) {
    console.error(`Error verifying code:`, error)
    return false
  }
}
