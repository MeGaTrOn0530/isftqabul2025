const express = require("express")
const router = express.Router()
const resultController = require("../controllers/resultController")

// Get results (with optional userId filter)
router.get("/", resultController.getResults)

// Submit test result
router.post("/submit", resultController.submitResult)

module.exports = router
