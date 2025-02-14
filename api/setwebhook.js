const TelegramBot = require('node-telegram-bot-api');

module.exports = async (req, res) => {
  try {
    const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
    
    // Сначала удалим текущий вебхук
    await bot.deleteWebHook();
    console.log('Previous webhook deleted');

    // Установим новый вебхук
    const url = `https://${process.env.VERCEL_URL}/api/webhook`;
    const result = await bot.setWebHook(url);
    
    // Проверим установку вебхука
    const webhookInfo = await bot.getWebHookInfo();
    
    console.log('Webhook set result:', result);
    console.log('Webhook info:', webhookInfo);
    console.log('Webhook URL:', url);
    
    res.status(200).json({
      success: true,
      message: 'Webhook set successfully',
      url: url,
      webhookInfo: webhookInfo
    });
  } catch (error) {
    console.error('Error setting webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set webhook',
      error: error.message
    });
  }
}; 