const express = require("express")
const router = express.Router()
const testController = require("../controllers/testController")

// Get all tests
router.get("/", testController.getAllTests)

// Get test by ID
router.get("/:id", testController.getTestById)

// Get randomized test
router.get("/:id/randomized", testController.getRandomizedTest)

// Create test
router.post("/", testController.createTest)

// Delete test
router.delete("/:id", testController.deleteTest)

module.exports = router
