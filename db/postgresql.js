const { Pool } = require('pg');
const dbConfig = require('../src/config/db-config.js'); // Fixed path

const pool = new Pool({
  user: dbConfig.user || 'postgres',
  host: dbConfig.host || 'localhost',
  database: dbConfig.database || 'web_crawler_db',
  password: dbConfig.password || '',
  port: dbConfig.port || 5432
});

const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Conexão com o PostgreSQL estabelecida com sucesso');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Erro de conexão com o PostgreSQL:', error.message);
    return false;
  }
};

module.exports = { pool, testConnection };
