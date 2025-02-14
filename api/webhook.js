const TelegramBot = require('node-telegram-bot-api');
const { getPrice, getTopCryptos } = require('../src/services/bybit');

// Инициализация бота
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

// Установка вебхука
const url = `https://${process.env.VERCEL_URL}`;
bot.setWebHook(`${url}/api/webhook`);

// Получаем список токенов Blum
const BLUM_TOKENS = process.env.BLUM_TOKENS ? process.env.BLUM_TOKENS.split(',') : [];

// Обработчики команд
async function handleStart(msg) {
  const chatId = msg.chat.id;
  return bot.sendMessage(chatId,
    'Добро пожаловать в Earth Wallet Bot! 🌍\n\n' +
    'Доступные команды:\n' +
    '/price <символ> - Проверить цену (например: /price BTCUSDT)\n' +
    '/top - Топ-10 криптовалют по объему торгов\n' +
    '/blumtokens - Список отслеживаемых токенов Blum\n' +
    '/help - Помощь'
  );
}

async function handlePrice(msg, match) {
  const chatId = msg.chat.id;
  const symbol = match[1]?.toUpperCase();

  if (!symbol) {
    return bot.sendMessage(chatId, 'Пожалуйста, укажите символ. Например: /price BTCUSDT');
  }

  const price = await getPrice(symbol);
  if (price) {
    return bot.sendMessage(chatId, `💰 Цена ${symbol}: ${price} USDT`);
  } else {
    return bot.sendMessage(chatId, `❌ Не удалось получить цену для ${symbol}`);
  }
}

async function handleTop(msg) {
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
    return bot.sendMessage(chatId, message);
  } else {
    return bot.sendMessage(chatId, '❌ Не удалось получить данные о топ криптовалютах');
  }
}

async function handleBlumTokens(msg) {
  const chatId = msg.chat.id;
  
  if (BLUM_TOKENS.length === 0) {
    return bot.sendMessage(chatId, '❌ Список токенов Blum пуст');
  }

  let message = '📋 Токены Blum:\n\n';
  for (const token of BLUM_TOKENS) {
    const price = await getPrice(`${token}USDT`);
    message += `${token}: ${price ? price + ' USDT' : 'Цена недоступна'}\n`;
  }
  
  return bot.sendMessage(chatId, message);
}

async function handleHelp(msg) {
  const chatId = msg.chat.id;
  return bot.sendMessage(chatId,
    '🤖 Помощь по командам:\n\n' +
    '/price <символ> - Проверить цену криптовалюты (например: /price BTCUSDT)\n' +
    '/top - Показать топ-10 криптовалют по объему торгов\n' +
    '/blumtokens - Показать цены токенов Blum\n' +
    '/help - Показать это сообщение'
  );
}

// Обработчик вебхука
module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { message } = req.body;
    
    if (!message) {
      return res.status(200).json({ message: 'No message in request' });
    }

    const text = message.text || '';

    // Обработка команд
    if (text.startsWith('/start')) {
      await handleStart(message);
    } else if (text.startsWith('/price')) {
      const match = text.match(/\/price(?:\s+(.+))?/);
      await handlePrice(message, match);
    } else if (text.startsWith('/top')) {
      await handleTop(message);
    } else if (text.startsWith('/blumtokens')) {
      await handleBlumTokens(message);
    } else if (text.startsWith('/help')) {
      await handleHelp(message);
    }

    return res.status(200).json({ message: 'Success' });
  }

  return res.status(200).json({ message: 'Only POST requests are accepted' });
}; 