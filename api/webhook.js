const axios = require('axios');
const { getPrice, getTopCryptos } = require('../src/services/bybit');

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

// Получаем список токенов Blum
const BLUM_TOKENS = process.env.BLUM_TOKENS ? process.env.BLUM_TOKENS.split(',') : [];

// Функция для отправки сообщений
async function sendMessage(chatId, text) {
  try {
    const response = await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML'
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error.response?.data || error.message);
    throw error;
  }
}

// Обработчики команд
async function handleStart(chatId) {
  console.log('Handling /start command');
  await sendMessage(chatId,
    'Добро пожаловать в Earth Wallet Bot! 🌍\n\n' +
    'Доступные команды:\n' +
    '/price <символ> - Проверить цену (например: /price BTCUSDT)\n' +
    '/top - Топ-10 криптовалют по объему торгов\n' +
    '/blumtokens - Список отслеживаемых токенов Blum\n' +
    '/help - Помощь'
  );
}

async function handlePrice(chatId, match) {
  console.log('Handling /price command');
  const symbol = match[1]?.toUpperCase();

  if (!symbol) {
    await sendMessage(chatId, 'Пожалуйста, укажите символ. Например: /price BTCUSDT');
    return;
  }

  const price = await getPrice(symbol);
  if (price) {
    await sendMessage(chatId, `💰 Цена ${symbol}: ${price} USDT`);
  } else {
    await sendMessage(chatId, `❌ Не удалось получить цену для ${symbol}`);
  }
}

async function handleTop(chatId) {
  console.log('Handling /top command');
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
    await sendMessage(chatId, message);
  } else {
    await sendMessage(chatId, '❌ Не удалось получить данные о топ криптовалютах');
  }
}

async function handleBlumTokens(chatId) {
  console.log('Handling /blumtokens command');
  
  if (BLUM_TOKENS.length === 0) {
    await sendMessage(chatId, '❌ Список токенов Blum пуст');
    return;
  }

  let message = '📋 Токены Blum:\n\n';
  for (const token of BLUM_TOKENS) {
    const price = await getPrice(`${token}USDT`);
    message += `${token}: ${price ? price + ' USDT' : 'Цена недоступна'}\n`;
  }
  
  await sendMessage(chatId, message);
}

async function handleHelp(chatId) {
  console.log('Handling /help command');
  await sendMessage(chatId,
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
    if (req.method !== 'POST') {
      return res.status(200).json({ message: 'Only POST requests are accepted' });
    }

    const { message } = req.body;
    console.log('Received update:', JSON.stringify(req.body, null, 2));

    if (!message || !message.text) {
      console.log('No message or text in update');
      return res.status(200).json({ message: 'No message in request' });
    }

    const chatId = message.chat.id;
    const text = message.text;
    console.log('Processing message:', text, 'from chat:', chatId);

    // Отправляем предварительный ответ
    res.status(200).json({ message: 'Processing message' });

    // Обрабатываем команды асинхронно
    try {
      if (text.startsWith('/start')) {
        await handleStart(chatId);
      } else if (text.startsWith('/price')) {
        const match = text.match(/\/price(?:\s+(.+))?/);
        await handlePrice(chatId, match);
      } else if (text.startsWith('/top')) {
        await handleTop(chatId);
      } else if (text.startsWith('/blumtokens')) {
        await handleBlumTokens(chatId);
      } else if (text.startsWith('/help')) {
        await handleHelp(chatId);
      }
      console.log('Message processed successfully');
    } catch (error) {
      console.error('Error processing command:', error);
      try {
        await sendMessage(chatId, '❌ Произошла ошибка при обработке команды. Пожалуйста, попробуйте позже.');
      } catch (sendError) {
        console.error('Error sending error message:', sendError);
      }
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ error: error.message });
  }
}; 