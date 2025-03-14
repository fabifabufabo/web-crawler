const { pool } = require('./postgresql.js');

const getPortalParams = async () => {
  try {
    const query = 'SELECT id, nome, url, observacoes FROM portal ORDER BY id ASC LIMIT 1';
    const { rows } = await pool.query(query);
    if (rows.length === 0) {
      return null;
    }
    const { id, nome, url, observacoes } = rows[0];
    return { id, portal: nome, baseUrl: url, observacoes };
  } catch (error) {
    console.error('Erro ao obter o portal:', error);
    throw error;
  }
};

module.exports = { getPortalParams };