const TelegramBot = require('node-telegram-bot-api');

module.exports = async (req, res) => {
  try {
    const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
    
    // Сначала удалим текущий вебхук
    console.log('Deleting existing webhook...');
    await bot.deleteWebHook();
    
    // Подождем немного
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Установим новый вебхук с дополнительными параметрами
    const url = `https://${process.env.VERCEL_URL}/api/webhook`;
    console.log('Setting webhook to:', url);
    
    const result = await bot.setWebHook(url, {
      max_connections: 100,
      drop_pending_updates: true
    });
    
    // Подождем еще немного
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Проверим установку вебхука
    const webhookInfo = await bot.getWebHookInfo();
    
    console.log('Webhook set result:', result);
    console.log('Webhook info:', webhookInfo);
    
    if (webhookInfo.url === url) {
      res.status(200).json({
        success: true,
        message: 'Webhook set successfully',
        url: url,
        webhookInfo: webhookInfo
      });
    } else {
      throw new Error('Webhook URL mismatch');
    }
  } catch (error) {
    console.error('Error setting webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set webhook',
      error: error.message
    });
  }
}; 