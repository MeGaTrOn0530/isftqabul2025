const express = require("express")
const router = express.Router()
const userController = require("../controllers/userController")

// Get all users
router.get("/", userController.getAllUsers)

// Get user by ID
router.get("/:id", userController.getUserById)

// Get user results
router.get("/:id/results", userController.getUserResults)

// Delete user
router.delete("/:id", userController.deleteUser)

module.exports = router
