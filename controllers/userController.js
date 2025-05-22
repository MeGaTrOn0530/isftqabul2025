const dataService = require("../services/dataService")

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await dataService.getUsers()

    // Don't send passwords to client
    const usersWithoutPasswords = users.map((user) => {
      const { password, ...userWithoutPassword } = user
      return userWithoutPassword
    })

    res.json({
      success: true,
      users: usersWithoutPasswords,
    })
  } catch (error) {
    console.error("Get all users error:", error)
    res.json({
      success: false,
      message: "Foydalanuvchilarni olishda xatolik yuz berdi.",
    })
  }
}

// Get user by ID
exports.getUserById = async (req, res) => {
  const userId = req.params.id

  try {
    const user = await dataService.getUserById(userId)

    if (user) {
      // Don't send password to client
      const { password, ...userWithoutPassword } = user

      res.json({
        success: true,
        user: userWithoutPassword,
      })
    } else {
      res.json({
        success: false,
        message: "Foydalanuvchi topilmadi.",
      })
    }
  } catch (error) {
    console.error("Get user by ID error:", error)
    res.json({
      success: false,
      message: "Foydalanuvchini olishda xatolik yuz berdi.",
    })
  }
}

// Get user results
exports.getUserResults = async (req, res) => {
  const userId = req.params.id

  try {
    const user = await dataService.getUserById(userId)

    if (!user) {
      return res.json({
        success: false,
        message: "Foydalanuvchi topilmadi.",
      })
    }

    // Get all results for this user
    const results = await dataService.getResults(userId)

    // Get test details for each result
    const resultsWithDetails = await Promise.all(
      results.map(async (result) => {
        const test = await dataService.getTestById(result.testId)
        return {
          ...result,
          testDetails: test
            ? {
                title: test.title,
                direction: test.direction,
                totalQuestions: test.questions.length,
              }
            : null,
        }
      }),
    )

    res.json({
      success: true,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        direction: user.direction,
      },
      results: resultsWithDetails,
    })
  } catch (error) {
    console.error("Get user results error:", error)
    res.json({
      success: false,
      message: "Foydalanuvchi natijalarini olishda xatolik yuz berdi.",
    })
  }
}

// Delete user
exports.deleteUser = async (req, res) => {
  const userId = req.params.id

  try {
    const success = await dataService.deleteUser(userId)

    if (success) {
      res.json({
        success: true,
        message: "Foydalanuvchi muvaffaqiyatli o'chirildi.",
      })
    } else {
      res.json({
        success: false,
        message: "Foydalanuvchi topilmadi.",
      })
    }
  } catch (error) {
    console.error("Delete user error:", error)
    res.json({
      success: false,
      message: "Foydalanuvchini o'chirishda xatolik yuz berdi.",
    })
  }
}
