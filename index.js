const TelegramBot = require('node-telegram-bot-api');
const { gameOptions, againOptions } = require('./options.js');
require('dotenv').config()


const token = process.env.TOKEN_BOT


const bot = new TelegramBot(token, { polling: true });

bot.setMyCommands([
  { command: '/start', description: 'start message' },
  { command: '/info', description: 'get info' },
  { command: '/game', description: 'Игра угадай цифру' },
])

const chats = {}


const startGame = async (chatId) => {
  await bot.sendMessage(chatId, `Я загадываю цифру, ты должен ее отгадать`)
  const randomNumber = Math.floor(Math.random() * 10)
  chats[chatId] = randomNumber
  await bot.sendMessage(chatId, `Отгадывай`, gameOptions)
}

const start = () => {
  bot.on('message', async msg => {
    const text = msg.text;
    const chatId = msg.chat.id;

    if (text === '/start') {
      await bot.sendSticker(chatId, `https://tlgrm.eu/_/stickers/b0d/85f/b0d85fbf-de1b-4aaf-836c-1cddaa16e002/1.webp`)
      return bot.sendMessage(chatId, `You wrote me: ${text}`)
    }


    if (text === '/info') {
      return bot.sendMessage(chatId, `You name: ${msg.from.first_name}`)
    }

    if (text === '/game') {
      return startGame(chatId)
    }

    return bot.sendMessage(chatId, `I don't understand you, run the command`)
  });



  bot.on('callback_query', async msg => {

    const data = msg.data;
    const chatId = msg.message.chat.id;

    if (data === '/again') {
      return startGame(chatId)
    }

    if (parseInt(data) === chats[chatId]) {
      return await bot.sendMessage(chatId, `Поздравляю, ты угадал, цифра: ${chats[chatId]}`, againOptions)
    } else {
      return await bot.sendMessage(chatId, `К сожалению, ты не угадал, бот загадал: ${chats[chatId]}`, againOptions)
    }
  })


}

start()

