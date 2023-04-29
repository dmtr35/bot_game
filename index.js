const TelegramBot = require('node-telegram-bot-api')
const { gameOptions, againOptions } = require('./options.js')
const sequelize = require('./db.js')
const UserModel = require('./models.js')

require('dotenv').config()


const token = process.env.TOKEN_BOT


const bot = new TelegramBot(token, { polling: true });


const chats = {}


const startGame = async (chatId) => {
  await bot.sendMessage(chatId, `Я загадываю цифру, ты должен ее отгадать`)
  const randomNumber = Math.floor(Math.random() * 10)
  chats[chatId] = randomNumber
  await bot.sendMessage(chatId, `Отгадывай`, gameOptions)
}

const start = async () => {

  try {
    await sequelize.authenticate()
    await sequelize.sync()
  } catch (e) {
    console.log('Подключение к бд сломалось', e)
  }


  bot.setMyCommands([
    { command: '/start', description: 'start message' },
    { command: '/info', description: 'get info' },
    { command: '/game', description: 'Игра угадай цифру' },
  ])

  bot.on('message', async msg => {
    const text = msg.text;
    const chatId = msg.chat.id;

    try {
      if (text === '/start') {
        const user = await UserModel.findOne({ chatId })
        if (user) {
          return bot.sendMessage(chatId, 'Бот уже запущен!')
        }
        await UserModel.create({ chatId })
        await bot.sendSticker(chatId, `https://tlgrm.eu/_/stickers/b0d/85f/b0d85fbf-de1b-4aaf-836c-1cddaa16e002/1.webp`)
        return bot.sendMessage(chatId, `Ты написал мне: ${text}`)
      }


      if (text === '/info') {
        const user = await UserModel.findOne({ chatId })
        return bot.sendMessage(chatId, `Ваше имя: ${msg.from.first_name}, правильных ответов ${user.dataValues.right}, неправильных: ${user.dataValues.wrong}`)
      }

      if (text === '/game') {
        return startGame(chatId)
      }

      return bot.sendMessage(chatId, `Я тебя не понимаю, запусти команду`)
    } catch (e) {
      return bot.sendMessage(chatId, 'Произашла ошибка')
    }
  });



  bot.on('callback_query', async msg => {
    const data = msg.data;
    const chatId = msg.message.chat.id;
  
    if (data === '/again') {
      return startGame(chatId)
    }
  
    const user = await UserModel.findOne({ chatId })
  
    if (parseInt(data) === chats[chatId]) {
      user.right += 1
      await bot.sendMessage(chatId, `Поздравляю, ты угадал, цифра: ${chats[chatId]}`, againOptions)
    } else {
      user.wrong += 1
      await bot.sendMessage(chatId, `К сожалению, ты не угадал, бот загадал: ${chats[chatId]}`, againOptions)
    }
    
    await user.save()
  })
  


}

start()

