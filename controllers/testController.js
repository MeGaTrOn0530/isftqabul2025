const dataService = require("../services/dataService")
const { v4: uuidv4 } = require("uuid")

// Get all tests
exports.getAllTests = async (req, res) => {
  try {
    const tests = await dataService.getTests()

    res.json({
      success: true,
      tests,
    })
  } catch (error) {
    console.error("Get all tests error:", error)
    res.json({
      success: false,
      message: "Testlarni olishda xatolik yuz berdi.",
    })
  }
}

// Get test by ID
exports.getTestById = async (req, res) => {
  const testId = req.params.id

  try {
    const test = await dataService.getTestById(testId)

    if (test) {
      res.json({
        success: true,
        test,
      })
    } else {
      res.json({
        success: false,
        message: "Test topilmadi.",
      })
    }
  } catch (error) {
    console.error("Get test by ID error:", error)
    res.json({
      success: false,
      message: "Testni olishda xatolik yuz berdi.",
    })
  }
}

// Create test
exports.createTest = async (req, res) => {
  const { title, direction, timeLimit, questions } = req.body

  // Validate input
  if (!title || !direction || !timeLimit || !questions || questions.length === 0) {
    return res.json({
      success: false,
      message: "Barcha maydonlar to'ldirilishi shart.",
    })
  }

  try {
    // Create new test
    const newTest = {
      id: uuidv4(),
      title,
      direction,
      timeLimit,
      questions,
      createdAt: Date.now(),
    }

    // Save test
    await dataService.saveTest(newTest)

    res.json({
      success: true,
      message: "Test muvaffaqiyatli yaratildi.",
      test: newTest,
    })
  } catch (error) {
    console.error("Create test error:", error)
    res.json({
      success: false,
      message: "Testni yaratishda xatolik yuz berdi.",
    })
  }
}

// Delete test
exports.deleteTest = async (req, res) => {
  const testId = req.params.id

  try {
    const success = await dataService.deleteTest(testId)

    if (success) {
      res.json({
        success: true,
        message: "Test muvaffaqiyatli o'chirildi.",
      })
    } else {
      res.json({
        success: false,
        message: "Test topilmadi.",
      })
    }
  } catch (error) {
    console.error("Delete test error:", error)
    res.json({
      success: false,
      message: "Testni o'chirishda xatolik yuz berdi.",
    })
  }
}

// Get randomized test
exports.getRandomizedTest = async (req, res) => {
  const testId = req.params.id

  try {
    const test = await dataService.getTestById(testId)

    if (!test) {
      return res.json({
        success: false,
        message: "Test topilmadi.",
      })
    }

    // Create a deep copy of the test
    const randomizedTest = JSON.parse(JSON.stringify(test))

    // Randomize questions order
    randomizedTest.questions = shuffleArray([...randomizedTest.questions])

    // Randomize options for each question
    randomizedTest.questions = randomizedTest.questions.map((question) => {
      // Create an array of option keys and values
      const options = Object.entries(question.options)

      // Shuffle the options
      const shuffledOptions = shuffleArray([...options])

      // Create a mapping from old option keys to new option keys
      const optionMapping = {}
      options.forEach((oldOption, index) => {
        const newOptionKey = shuffledOptions[index][0]
        optionMapping[oldOption[0]] = newOptionKey
      })

      // Update the correct answer based on the new option positions
      const newCorrect = optionMapping[question.correct]

      // Create new options object from shuffled options
      const newOptions = {}
      shuffledOptions.forEach(([key, value]) => {
        newOptions[key] = value
      })

      return {
        ...question,
        options: newOptions,
        correct: newCorrect,
        originalCorrect: question.correct, // Store original for verification
      }
    })

    res.json({
      success: true,
      test: randomizedTest,
    })
  } catch (error) {
    console.error("Get randomized test error:", error)
    res.json({
      success: false,
      message: "Randomlashtirilgan testni olishda xatolik yuz berdi.",
    })
  }
}

// Helper function to shuffle an array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}
