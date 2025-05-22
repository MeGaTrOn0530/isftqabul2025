const dataService = require("../services/dataService")
const { v4: uuidv4 } = require("uuid")

// Get results
exports.getResults = async (req, res) => {
  const userId = req.query.userId

  try {
    const results = await dataService.getResults(userId)

    res.json({
      success: true,
      results,
    })
  } catch (error) {
    console.error("Get results error:", error)
    res.json({
      success: false,
      message: "Natijalarni olishda xatolik yuz berdi.",
    })
  }
}

// Submit test result
exports.submitResult = async (req, res) => {
  const { userId, testId, answers, timeTaken } = req.body

  try {
    // Get test
    const test = await dataService.getTestById(testId)

    if (!test) {
      return res.json({
        success: false,
        message: "Test topilmadi.",
      })
    }

    // Calculate score
    let correctAnswers = 0

    test.questions.forEach((question, index) => {
      if (answers[index] === question.correct) {
        correctAnswers++
      }
    })

    const score = Math.round((correctAnswers / test.questions.length) * 100)

    // Create new result
    const newResult = {
      id: uuidv4(),
      userId,
      testId,
      testTitle: test.title,
      answers,
      correctAnswers,
      totalQuestions: test.questions.length,
      score,
      timeTaken,
      date: Date.now(),
    }

    // Save result
    await dataService.saveResult(newResult)

    res.json({
      success: true,
      message: "Test muvaffaqiyatli topshirildi.",
      score,
    })
  } catch (error) {
    console.error("Submit result error:", error)
    res.json({
      success: false,
      message: "Natijani saqlashda xatolik yuz berdi.",
    })
  }
}
