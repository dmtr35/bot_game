const { Sequelize } = require('sequelize')
require('dotenv').config()


module.exports = new Sequelize(
    process.env.DB_NAME,                  // название базы данных
    process.env.DB_USER,                 // имя пользователя под которым мы подключаемся
    process.env.DB_PASSWORD,            // пароль базы данных
    {
        dialect: 'postgres',
        host: process.env.DB_HOST,
        port: process.env.DB_PORT
    }
)
    




