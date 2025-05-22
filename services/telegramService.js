const TelegramBot = require("node-telegram-bot-api")

// Get bot token from environment variables or use the new token
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8042840575:AAGkSzARwwaPiA5_uHc-B3U0MTFFLdSDoAY"
const BOT_USERNAME = "@isfttasdiqlashkodirobot"

// Create a bot instance
let bot
try {
  bot = new TelegramBot(BOT_TOKEN, { polling: true })
  console.log("Telegram bot muvaffaqiyatli ishga tushirildi:", BOT_USERNAME)
} catch (error) {
  console.error("Telegram botni ishga tushirishda xatolik:", error)
  bot = null
}

// Map to store Telegram usernames to chat IDs
const telegramUsers = new Map()

// Debug mode - set to true to see more logs
const DEBUG = true

// Bot message handler
if (bot) {
  bot.on("message", (msg) => {
    const chatId = msg.chat.id
    const username = msg.from.username

    if (DEBUG) {
      console.log("Yangi xabar qabul qilindi:", msg)
      console.log("Chat ID:", chatId)
      console.log("Username:", username)
    }

    // Store the chat ID for the username
    if (username) {
      telegramUsers.set(username.toLowerCase(), chatId)
      console.log(`@${username} uchun chat ID saqlandi: ${chatId}`)
    }

    // If the message is /start, send a welcome message
    if (msg.text === "/start") {
      bot.sendMessage(
        chatId,
        "Salom! Tasdiqlash Kodi botiga xush kelibsiz! Ro'yxatdan o'tish jarayonida tasdiqlash kodini shu yerda olasiz.\n\nEndi saytga qaytib, ro'yxatdan o'tishni davom ettirishingiz mumkin.",
      )
    }
  })

  // Test bot connection on startup
  bot
    .getMe()
    .then((botInfo) => {
      console.log("Bot ma'lumotlari:", botInfo)
      console.log(`Bot nomi: ${botInfo.first_name}, username: @${botInfo.username}`)
    })
    .catch((error) => {
      console.error("Bot ma'lumotlarini olishda xatolik:", error)
    })
}

// Send verification code
exports.sendVerificationCode = (telegram, code) => {
  if (!bot) {
    console.log(`[MOCK] ${telegram} ga tasdiqlash kodi yuborilmoqda: ${code}`)
    // Haqiqiy bot yo'q bo'lganda, konsolga chiqaramiz
    console.log(`TASDIQLASH KODI: ${code}`)
    return
  }

  // Remove @ if present
  const username = telegram.startsWith("@") ? telegram.substring(1) : telegram

  // Try to find chat ID
  const chatId = telegramUsers.get(username.toLowerCase())

  if (DEBUG) {
    console.log("Telegram username:", username)
    console.log("Saqlangan chat ID:", chatId)
    console.log("Barcha saqlangan foydalanuvchilar:", Array.from(telegramUsers.entries()))
  }

  if (chatId) {
    // Send a nicely formatted message with the code
    try {
      bot
        .sendMessage(
          chatId,
          `🔐 <b>Tasdiqlash kodingiz:</b> <code>${code}</code>\n\n` +
            `Bu kod 15 daqiqa davomida amal qiladi.\n` +
            `Iltimos, bu kodni hech kimga bermang!`,
          { parse_mode: "HTML" },
        )
        .then(() => {
          console.log(`@${username} ga tasdiqlash kodi yuborildi: ${code}`)
        })
        .catch((error) => {
          console.error(`Xabar yuborishda xatolik:`, error)
        })
    } catch (error) {
      console.error(`Xabar yuborishda xatolik:`, error)
    }
  } else {
    console.log(`@${username} uchun chat ID topilmadi. Kod: ${code}`)
    console.log(`Iltimos, foydalanuvchi ${BOT_USERNAME} botga /start buyrug'ini yuborsin`)
  }
}

// Telegram bot bilan bog'lanishni tekshirish uchun funksiya
exports.checkBotConnection = () => {
  if (!bot) {
    return {
      connected: false,
      message: "Telegram bot ishga tushirilmagan",
    }
  }

  try {
    // Botning ishlayotganini tekshirish
    return {
      connected: true,
      message: "Telegram bot ishlayapti",
      botUsername: BOT_USERNAME,
    }
  } catch (error) {
    return {
      connected: false,
      message: "Telegram bot bilan bog'lanishda xatolik: " + error.message,
    }
  }
}

// Foydalanuvchi botni ishga tushirganligini tekshirish
exports.hasUserStartedBot = (telegram) => {
  if (!bot) {
    return false
  }

  // Remove @ if present
  const username = telegram.startsWith("@") ? telegram.substring(1) : telegram

  // Check if we have a chat ID for this user
  return telegramUsers.has(username.toLowerCase())
}

// Botga to'g'ridan-to'g'ri xabar yuborish
exports.sendDirectMessage = (chatId, message) => {
  if (!bot) {
    console.log(`[MOCK] Chat ID ${chatId} ga xabar yuborilmoqda: ${message}`)
    return Promise.resolve({ success: false, error: "Bot ishga tushirilmagan" })
  }

  return bot
    .sendMessage(chatId, message)
    .then(() => {
      return { success: true }
    })
    .catch((error) => {
      console.error("Xabar yuborishda xatolik:", error)
      return { success: false, error: error.message }
    })
}
