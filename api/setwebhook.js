const axios = require('axios');

module.exports = async (req, res) => {
  try {
    const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;
    
    // Сначала удалим текущий вебхук
    console.log('Deleting existing webhook...');
    await axios.post(`${TELEGRAM_API}/deleteWebhook`, {
      drop_pending_updates: true
    });
    
    // Подождем немного
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Установим новый вебхук
    const url = `https://${process.env.VERCEL_URL}/api/webhook`;
    console.log('Setting webhook to:', url);
    
    const setWebhookResponse = await axios.post(`${TELEGRAM_API}/setWebhook`, {
      url: url,
      max_connections: 100,
      drop_pending_updates: true
    });
    
    // Подождем еще немного
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Проверим установку вебхука
    const webhookInfo = await axios.get(`${TELEGRAM_API}/getWebhookInfo`);
    
    console.log('Set webhook response:', setWebhookResponse.data);
    console.log('Webhook info:', webhookInfo.data);
    
    if (webhookInfo.data.result.url === url) {
      res.status(200).json({
        success: true,
        message: 'Webhook set successfully',
        url: url,
        webhookInfo: webhookInfo.data
      });
    } else {
      throw new Error('Webhook URL mismatch');
    }
  } catch (error) {
    console.error('Error setting webhook:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to set webhook',
      error: error.response?.data || error.message
    });
  }
}; 