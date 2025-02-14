const { RestClientV5 } = require('bybit-api');
const NodeCache = require('node-cache');

const priceCache = new NodeCache({ stdTTL: 60 }); // кэш на 60 секунд

// Создаем клиент без API ключей для публичного доступа
const client = new RestClientV5({
    testnet: false,
});

async function getPrice(symbol) {
    try {
        // Проверяем кэш
        const cachedPrice = priceCache.get(symbol);
        if (cachedPrice) return cachedPrice;

        const response = await client.getTickers({
            category: 'spot',
            symbol: symbol
        });

        if (response.retCode === 0 && response.result.list.length > 0) {
            const price = response.result.list[0].lastPrice;
            priceCache.set(symbol, price);
            return price;
        }
        return null;
    } catch (error) {
        console.error(`Error getting price for ${symbol}:`, error);
        return null;
    }
}

// Функция для получения топ-10 криптовалют по объему торгов
async function getTopCryptos() {
    try {
        const response = await client.getTickers({
            category: 'spot'
        });

        if (response.retCode === 0) {
            return response.result.list
                .sort((a, b) => parseFloat(b.volume24h) - parseFloat(a.volume24h))
                .slice(0, 10)
                .map(item => ({
                    symbol: item.symbol,
                    price: item.lastPrice,
                    change24h: item.price24hPcnt,
                    volume: item.volume24h
                }));
        }
        return null;
    } catch (error) {
        console.error('Error getting top cryptos:', error);
        return null;
    }
}

module.exports = {
    getPrice,
    getTopCryptos
}; 