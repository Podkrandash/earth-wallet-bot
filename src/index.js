require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');

// Создаем Express приложение
const app = express();

// Настраиваем CORS
app.use(cors({
  origin: function(origin, callback) {
    console.log('CORS request from origin:', origin);
    callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

// Запуск API сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
  console.log('Environment variables:');
  console.log('VERCEL_URL:', process.env.VERCEL_URL);
});

// Создаем бота
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
  polling: true
});

// Обработка ошибок подключения
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

// Проверяем подключение
bot.getMe().then((botInfo) => {
  console.log('Bot connected successfully:', botInfo.username);
}).catch((error) => {
  console.error('Failed to connect to Telegram:', error);
});

// Клавиатура для главного меню
const mainKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: "💬 Поддержка", url: "https://t.me/your_support" },
        { 
          text: "🌐 Открыть кошелёк",
          web_app: { url: "https://dapp-wallet-earth2.vercel.app/" }
        }
      ]
    ]
  }
};

// Обработка команды /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    await bot.sendMessage(
      chatId,
      `Добро пожаловать в Earth Wallet! 🌍\n\n` +
      `Это ваш надежный криптокошелек в Telegram.\n\n` +
      `• Безопасное хранение TON\n` +
      `• Мгновенные переводы\n` +
      `• Простой и удобный интерфейс\n\n` +
      `Нажмите "Открыть кошелёк" чтобы начать работу.`,
      mainKeyboard
    );
  } catch (error) {
    console.error('Error in /start command:', error);
    await bot.sendMessage(
      chatId,
      'Произошла ошибка. Пожалуйста, попробуйте позже.'
    );
  }
});