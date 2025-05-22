const TelegramBot = require("node-telegram-bot-api")

// Get bot token from environment variables
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const BOT_USERNAME = "@isfttasdiqlashkodirobot"

// Create a bot instance
let bot = null

// Map to store Telegram usernames to chat IDs
const telegramUsers = new Map()

// Debug mode - set to true to see more logs
const DEBUG = true

// Initialize bot
const initializeBot = () => {
  if (!BOT_TOKEN) {
    console.error("TELEGRAM_BOT_TOKEN environment variable topilmadi!")
    return false
  }

  try {
    // POLLING REJIMINI O'CHIRISH - bu muhim!
    bot = new TelegramBot(BOT_TOKEN, { polling: false })
    console.log("Telegram bot muvaffaqiyatli ishga tushirildi:", BOT_USERNAME)

    // Test bot connection
    testBotConnection()

    return true
  } catch (error) {
    console.error("Telegram botni ishga tushirishda xatolik:", error)
    bot = null
    return false
  }
}

// Test bot connection
const testBotConnection = async () => {
  if (!bot) return

  try {
    const botInfo = await bot.getMe()
    console.log("Bot ma'lumotlari:", botInfo)
    console.log(`Bot nomi: ${botInfo.first_name}, username: @${botInfo.username}`)
  } catch (error) {
    console.error("Bot ma'lumotlarini olishda xatolik:", error)
  }
}

// Initialize bot on module load
initializeBot()

// Send verification code
exports.sendVerificationCode = async (telegram, code) => {
  if (!bot) {
    console.log(`[MOCK] ${telegram} ga tasdiqlash kodi yuborilmoqda: ${code}`)
    console.log(`TASDIQLASH KODI: ${code}`)
    return false
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
    try {
      await bot.sendMessage(
        chatId,
        `🔐 <b>Tasdiqlash kodingiz:</b> <code>${code}</code>\n\n` +
          `Bu kod 15 daqiqa davomida amal qiladi.\n` +
          `Iltimos, bu kodni hech kimga bermang!`,
        { parse_mode: "HTML" },
      )

      console.log(`@${username} ga tasdiqlash kodi yuborildi: ${code}`)
      return true
    } catch (error) {
      console.error(`Xabar yuborishda xatolik:`, error)
      return false
    }
  } else {
    console.log(`@${username} uchun chat ID topilmadi. Kod: ${code}`)
    console.log(`Iltimos, foydalanuvchi ${BOT_USERNAME} botga /start buyrug'ini yuborsin`)

    // Foydalanuvchiga bot linkini yuborish uchun
    console.log(`Bot linki: https://t.me/${BOT_USERNAME.replace("@", "")}`)
    return false
  }
}

// Telegram bot bilan bog'lanishni tekshirish uchun funksiya
exports.checkBotConnection = () => {
  if (!bot) {
    return {
      connected: false,
      message: "Telegram bot ishga tushirilmagan",
      botUsername: BOT_USERNAME,
    }
  }

  try {
    return {
      connected: true,
      message: "Telegram bot ishlayapti",
      botUsername: BOT_USERNAME,
    }
  } catch (error) {
    return {
      connected: false,
      message: "Telegram bot bilan bog'lanishda xatolik: " + error.message,
      botUsername: BOT_USERNAME,
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
  const hasStarted = telegramUsers.has(username.toLowerCase())

  if (DEBUG) {
    console.log(`${username} botni ishga tushirganmi: ${hasStarted}`)
  }

  return hasStarted
}

// Botga to'g'ridan-to'g'ri xabar yuborish
exports.sendDirectMessage = async (chatId, message) => {
  if (!bot) {
    console.log(`[MOCK] Chat ID ${chatId} ga xabar yuborilmoqda: ${message}`)
    return { success: false, error: "Bot ishga tushirilmagan" }
  }

  try {
    await bot.sendMessage(chatId, message)
    return { success: true }
  } catch (error) {
    console.error("Xabar yuborishda xatolik:", error)
    return { success: false, error: error.message }
  }
}

// Webhook uchun message handler (agar kerak bo'lsa)
exports.handleWebhookUpdate = (update) => {
  if (!bot) return

  try {
    // Process the update
    if (update.message) {
      const msg = update.message
      const chatId = msg.chat.id
      const username = msg.from.username

      if (DEBUG) {
        console.log("Webhook orqali yangi xabar:", msg)
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
    }
  } catch (error) {
    console.error("Webhook update ni qayta ishlashda xatolik:", error)
  }
}

// Bot ma'lumotlarini olish
exports.getBotInfo = async () => {
  if (!bot) {
    return { success: false, error: "Bot ishga tushirilmagan" }
  }

  try {
    const botInfo = await bot.getMe()
    return {
      success: true,
      data: {
        id: botInfo.id,
        first_name: botInfo.first_name,
        username: botInfo.username,
        can_join_groups: botInfo.can_join_groups,
        can_read_all_group_messages: botInfo.can_read_all_group_messages,
        supports_inline_queries: botInfo.supports_inline_queries,
      },
    }
  } catch (error) {
    console.error("Bot ma'lumotlarini olishda xatolik:", error)
    return { success: false, error: error.message }
  }
}

// Saqlangan foydalanuvchilar ro'yxatini olish (debug uchun)
exports.getStoredUsers = () => {
  return Array.from(telegramUsers.entries())
}

// Foydalanuvchi chat ID sini qo'lda qo'shish (test uchun)
exports.addUserChatId = (username, chatId) => {
  const cleanUsername = username.startsWith("@") ? username.substring(1) : username
  telegramUsers.set(cleanUsername.toLowerCase(), chatId)
  console.log(`Qo'lda qo'shildi: @${cleanUsername} -> ${chatId}`)
  return true
}

// Bot holatini qayta tiklash
exports.reinitializeBot = () => {
  console.log("Botni qayta ishga tushirish...")
  return initializeBot()
}
