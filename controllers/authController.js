const dataService = require("../services/dataService")
const telegramService = require("../services/telegramService")
const { v4: uuidv4 } = require("uuid")

// Login
exports.login = async (req, res) => {
  const { login, password } = req.body

  try {
    // Get users
    const users = await dataService.getUsers()

    // Find user
    const user = users.find((u) => u.login === login && u.password === password)

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
        message: "Login yoki parol noto'g'ri.",
      })
    }
  } catch (error) {
    console.error("Login error:", error)
    res.json({
      success: false,
      message: "Serverda xatolik yuz berdi.",
    })
  }
}

// Register
exports.register = async (req, res) => {
  const { firstName, lastName, direction, phone, telegram, login, password } = req.body

  try {
    // Get users
    const users = await dataService.getUsers()

    // Check if login already exists
    if (users.some((u) => u.login === login)) {
      return res.json({
        success: false,
        message: "Bu login allaqachon mavjud. Iltimos, boshqa login tanlang.",
      })
    }

    // Create new user
    const newUser = {
      id: uuidv4(),
      firstName,
      lastName,
      direction,
      phone,
      telegram,
      login,
      password,
      createdAt: Date.now(),
    }

    // Save user
    await dataService.saveUser(newUser)

    res.json({
      success: true,
      message: "Ro'yxatdan o'tish muvaffaqiyatli yakunlandi.",
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.json({
      success: false,
      message: "Ro'yxatdan o'tishda xatolik yuz berdi.",
    })
  }
}

// Connect to Telegram bot
exports.connectBot = (req, res) => {
  const { telegram } = req.body

  // Check if telegram username exists
  if (!telegram) {
    return res.json({
      success: false,
      message: "Telegram foydalanuvchi nomi talab qilinadi.",
    })
  }

  // Telegram bot bilan bog'lanishni tekshirish
  const botStatus = telegramService.checkBotConnection()

  // Telegram bot bilan bog'lanish holati haqida ma'lumot berish
  console.log("Telegram bot holati:", botStatus)

  // Foydalanuvchiga botga ulanish uchun havolani tayyorlash
  const botUsername = botStatus.botUsername || "@isfttasdiqlashkodirobot"
  const botLink = `https://t.me/${botUsername.replace("@", "")}`

  // Har qanday holatda ham muvaffaqiyatli javob qaytarish
  res.json({
    success: true,
    message: `Botga muvaffaqiyatli ulandingiz.`,
    botStatus,
    botLink,
    step: 2, // Foydalanuvchini 2-bosqichga o'tkazish
  })
}

// Get verification code
exports.getCode = async (req, res) => {
  const { telegram } = req.body

  try {
    // Generate a random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // Store the code
    await dataService.saveVerificationCode(telegram, code)

    // Send the code via Telegram bot
    telegramService.sendVerificationCode(telegram, code)

    // Konsolga chiqarish (faqat server tomonida)
    console.log(`${telegram} uchun tasdiqlash kodi: ${code}`)

    res.json({
      success: true,
      message: "Tasdiqlash kodi yuborildi. Iltimos, Telegram xabarlaringizni tekshiring.",
    })
  } catch (error) {
    console.error("Get code error:", error)
    res.json({
      success: false,
      message: "Tasdiqlash kodini yuborishda xatolik yuz berdi.",
    })
  }
}

// Verify code
exports.verifyCode = async (req, res) => {
  const { telegram, code } = req.body

  try {
    // Verify the code
    const isValid = await dataService.verifyCode(telegram, code)

    if (isValid) {
      res.json({
        success: true,
        message: "Kod muvaffaqiyatli tasdiqlandi.",
      })
    } else {
      res.json({
        success: false,
        message: "Noto'g'ri tasdiqlash kodi.",
      })
    }
  } catch (error) {
    console.error("Verify code error:", error)
    res.json({
      success: false,
      message: "Kodni tasdiqlashda xatolik yuz berdi.",
    })
  }
}

// Check if user has started the bot
exports.checkBotStarted = (req, res) => {
  const { telegram } = req.body

  // Check if the user has started the bot
  const hasStarted = telegramService.hasUserStartedBot(telegram)

  res.json({
    success: true,
    hasStarted,
  })
}
