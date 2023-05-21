const TelegramBot = require('node-telegram-bot-api');
const { DownloaderMethod } = require('./requestIG');
const { tiktok_downloader } = require('./requestTT');
require('dotenv').config();

const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    'Assalomu Alaykum! Ushbu bot orqali Instagram va TikTok dan videolarni yuklab olishingiz mumkin. Videoning havolasini (linkini) yuboring:'
  ).then(() => {
    const options = {
      reply_markup: {
        inline_keyboard: [
          [{ text: "➕ Obuna Bo'lish", url: 't.me/Sara_Xabarlar' }],
          [{ text: "➕ Obuna Bo'lish", url: 't.me/Tilla_Prikol' }],
          [{ text: "✅ Tasdiqlash", callback_data: 'confirm' }]
        ]
      }
    };
    bot.sendMessage(chatId, "Iltimos, quyidagi kanallarimizga obuna boʻling, keyin botni ishlatishingiz mumkin.", options);
  });
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    'Botdan foydalanish uchun quyidagi buyruqlardan foydalaning:\n\nInstagram yoki TikTokdan videoning URL havolasini yuboring, keyin video yuklanadi.'
  );
});

bot.on('message', async (message) => {
  try {
    const chatId = message.chat.id;
    const text = message.text.toLowerCase();

    if (text === '/start' || text === '/help') {
      return;
    }

    const urlRegex = /(http(s)?:\/\/)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:/~+#-]*[\w@?^=%&amp;/~+#-])?/;
    if (!urlRegex.test(text)) {
      bot.sendMessage(chatId, 'Noto\'g\'ri URL, iltimos, qaytadan urinib ko\'ring.');
      return;
    }

    let videoUrl, caption = '';

    if (text.includes('tiktok.com')) {
      const tiktokData = await tiktok_downloader(message.text);
      videoUrl = tiktokData;
      caption = tiktokData.caption;
    } else if (text.includes('instagram.com')) {
      const igData = await DownloaderMethod(message.text); // Corrected function name
      videoUrl = igData.videoUrl;
      caption = igData.caption;
    } else {
      bot.sendMessage(chatId, 'Qo\'llanilmaydigan URL, iltimos, qaytadan urinib ko\'ring.');
      return;
    }

    await bot.sendVideo(chatId, videoUrl, {
      caption: caption + "\n @Yuklovchi_IG_TT_bot orqali yuklab olindi 📥"
    });
  } catch (error) {
  }
});

bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  if (data === 'confirm') {
    bot.sendMessage(chatId, 'Botni ishlatavering✅');
  }
});