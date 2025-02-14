# Earth Wallet Bot

Telegram бот для торговли криптовалютой через биржу Blum.

## Установка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/your-username/earth-wallet-bot.git
cd earth-wallet-bot
```

2. Установите зависимости:
```bash
npm install
```

3. Создайте файл `.env` на основе `.env.example` и заполните необходимые переменные окружения:
- `TELEGRAM_BOT_TOKEN` - получите у [@BotFather](https://t.me/BotFather)
- `BLUM_API_KEY` и `BLUM_API_SECRET` - получите в личном кабинете Blum
- `VERCEL_URL` - URL вашего приложения на Vercel

## Развертывание на Vercel

1. Установите Vercel CLI:
```bash
npm i -g vercel
```

2. Войдите в аккаунт Vercel:
```bash
vercel login
```

3. Разверните приложение:
```bash
vercel
```

## Локальная разработка

```bash
npm run dev
```

## Функциональность

- `/start` - Начало работы с ботом
- `/balance` - Проверка баланса
- `/price` - Текущие цены криптовалют
- `/help` - Помощь по использованию бота 