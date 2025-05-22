const express = require("express")
const router = express.Router()
const authController = require("../controllers/authController")

// Login
router.post("/login", authController.login)

// Register
router.post("/register", authController.register)

// Connect to Telegram bot
router.post("/connect-bot", authController.connectBot)

// Get verification code
router.post("/get-code", authController.getCode)

// Verify code
router.post("/verify-code", authController.verifyCode)

// Check if user has started the bot
router.post("/check-bot-started", authController.checkBotStarted)

module.exports = router
