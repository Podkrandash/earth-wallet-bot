const TelegramBot = require('node-telegram-bot-api');

module.exports = async (req, res) => {
  try {
    const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
    const url = `https://${process.env.VERCEL_URL}/api/webhook`;
    
    const result = await bot.setWebHook(url);
    
    console.log('Webhook set result:', result);
    console.log('Webhook URL:', url);
    
    res.status(200).json({
      success: true,
      message: 'Webhook set successfully',
      url: url
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