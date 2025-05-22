const dataService = require("../services/dataService")

// Get statistics
exports.getStatistics = async (req, res) => {
  try {
    // Get data
    const users = await dataService.getUsers()
    const tests = await dataService.getTests()
    const results = await dataService.getResults()

    // Calculate statistics
    const totalUsers = users.length
    const totalTests = tests.length
    const totalTestsTaken = results.length

    // Calculate average score
    let averageScore = 0
    if (totalTestsTaken > 0) {
      const totalScore = results.reduce((sum, result) => sum + result.score, 0)
      averageScore = Math.round(totalScore / totalTestsTaken)
    }

    // Calculate direction statistics
    const directions = [...new Set(tests.map((test) => test.direction))]
    const directionStats = await Promise.all(
      directions.map(async (direction) => {
        const directionTests = tests.filter((test) => test.direction === direction)
        const directionResults = results.filter((result) => {
          const test = tests.find((t) => t.id === result.testId)
          return test && test.direction === direction
        })

        let averageDirectionScore = 0
        if (directionResults.length > 0) {
          const totalDirectionScore = directionResults.reduce((sum, result) => sum + result.score, 0)
          averageDirectionScore = Math.round(totalDirectionScore / directionResults.length)
        }

        return {
          direction,
          testCount: directionTests.length,
          completedCount: directionResults.length,
          averageScore: averageDirectionScore,
        }
      }),
    )

    // Return real data
    res.json({
      success: true,
      totalUsers,
      totalTests,
      totalTestsTaken,
      averageScore,
      directionStats,
    })
  } catch (error) {
    console.error("Get statistics error:", error)
    res.json({
      success: false,
      message: "Statistikani olishda xatolik yuz berdi.",
    })
  }
}
