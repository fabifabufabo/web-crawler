require('dotenv').config()

module.exports = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'web_crawler_db',
  password: process.env.DB_PASSWORD || '',
  port: Number(process.env.DB_PORT) || 5432
}
