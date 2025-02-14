const TelegramBot = require('node-telegram-bot-api');
const { getPrice, getTopCryptos } = require('../src/services/bybit');

// Инициализация бота
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

// Получаем список токенов Blum
const BLUM_TOKENS = process.env.BLUM_TOKENS ? process.env.BLUM_TOKENS.split(',') : [];

// Обработчики команд
async function handleStart(msg) {
  console.log('Handling /start command');
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
  console.log('Handling /price command');
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
  console.log('Handling /top command');
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
  console.log('Handling /blumtokens command');
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
  console.log('Handling /help command');
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
  try {
    console.log('Received webhook request:', {
      method: req.method,
      body: req.body,
      headers: req.headers
    });

    if (req.method === 'POST') {
      const update = req.body;
      console.log('Received update:', JSON.stringify(update, null, 2));

      if (!update || !update.message) {
        console.log('No message in update');
        return res.status(200).json({ message: 'No message in request' });
      }

      const message = update.message;
      const text = message.text || '';
      console.log('Processing message:', text);

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

      console.log('Message processed successfully');
      return res.status(200).json({ message: 'Success' });
    }

    console.log('Not a POST request');
    return res.status(200).json({ message: 'Only POST requests are accepted' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ error: error.message });
  }
}; 