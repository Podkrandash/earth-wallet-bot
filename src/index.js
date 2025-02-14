require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const { getPrice, getTopCryptos } = require('./services/bybit');

const app = express();
const PORT = process.env.PORT || 3000;

// Конфигурация бота
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
  webHook: {
    port: PORT
  }
});

// Установка webhook для Vercel
const url = process.env.VERCEL_URL || 'https://your-app-name.vercel.app';
bot.setWebHook(`${url}/webhook/${process.env.TELEGRAM_BOT_TOKEN}`);

// Получаем список токенов Blum
const BLUM_TOKENS = process.env.BLUM_TOKENS ? process.env.BLUM_TOKENS.split(',') : [];

// Обработка команд
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  await bot.sendMessage(chatId, 
    'Добро пожаловать в Earth Wallet Bot! 🌍\n\n' +
    'Доступные команды:\n' +
    '/price <символ> - Проверить цену (например: /price BTCUSDT)\n' +
    '/top - Топ-10 криптовалют по объему торгов\n' +
    '/blumtokens - Список отслеживаемых токенов Blum\n' +
    '/help - Помощь'
  );
});

bot.onText(/\/price(?:\s+(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const symbol = match[1]?.toUpperCase();

  if (!symbol) {
    await bot.sendMessage(chatId, 'Пожалуйста, укажите символ. Например: /price BTCUSDT');
    return;
  }

  const price = await getPrice(symbol);
  if (price) {
    await bot.sendMessage(chatId, `💰 Цена ${symbol}: ${price} USDT`);
  } else {
    await bot.sendMessage(chatId, `❌ Не удалось получить цену для ${symbol}`);
  }
});

bot.onText(/\/top/, async (msg) => {
  const chatId = msg.chat.id;
  const topCryptos = await getTopCryptos();

  if (topCryptos) {
    let message = '📊 Топ-10 криптовалют по объему торгов:\n\n';
    topCryptos.forEach((crypto, index) => {
      const change = parseFloat(crypto.change24h) * 100;
      const changeEmoji = change >= 0 ? '🟢' : '🔴';
      message += `${index + 1}. ${crypto.symbol} ${changeEmoji}\n`;
      message += `   💵 Цена: ${crypto.price} USDT\n`;
      message += `   📈 Изменение (24ч): ${change.toFixed(2)}%\n`;
      message += `   📊 Объем: ${parseFloat(crypto.volume).toFixed(2)} USDT\n\n`;
    });
    await bot.sendMessage(chatId, message);
  } else {
    await bot.sendMessage(chatId, '❌ Не удалось получить данные о топ криптовалютах');
  }
});

bot.onText(/\/blumtokens/, async (msg) => {
  const chatId = msg.chat.id;
  
  if (BLUM_TOKENS.length === 0) {
    await bot.sendMessage(chatId, '❌ Список токенов Blum пуст');
    return;
  }

  let message = '📋 Токены Blum:\n\n';
  for (const token of BLUM_TOKENS) {
    const price = await getPrice(`${token}USDT`);
    message += `${token}: ${price ? price + ' USDT' : 'Цена недоступна'}\n`;
  }
  
  await bot.sendMessage(chatId, message);
});

bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  await bot.sendMessage(chatId,
    '🤖 Помощь по командам:\n\n' +
    '/price <символ> - Проверить цену криптовалюты (например: /price BTCUSDT)\n' +
    '/top - Показать топ-10 криптовалют по объему торгов\n' +
    '/blumtokens - Показать цены токенов Blum\n' +
    '/help - Показать это сообщение'
  );
});

// Express endpoints для webhook
app.use(express.json());

app.post(`/webhook/${process.env.TELEGRAM_BOT_TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Эндпоинт для проверки работоспособности
app.get('/', (req, res) => {
  res.send('Earth Wallet Bot is running!');
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 