const { Pool } = require('pg');
const dbConfig = require('../src/config/db-config.js');

const pool = new Pool({
  user: dbConfig.user,
  host: dbConfig.host,
  database: dbConfig.database,
  password: dbConfig.password,
  port: dbConfig.port
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
