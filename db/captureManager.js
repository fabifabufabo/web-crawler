const { pool } = require('./postgresql.js');

const getPendingCaptures = async () => {
  try {
    const query = `
      SELECT c.id, c.id_portal, c.filtros, p.nome AS portal_nome, p.url AS portal_url
      FROM captura c
      JOIN portal p ON c.id_portal = p.id
      WHERE c.status = 'pendente'
      ORDER BY c.id ASC
    `;
    const { rows } = await pool.query(query);
    return rows;
  } catch (error) {
    console.error('Erro ao obter capturas pendentes:', error);
    throw error;
  }
};

const startCapture = async (capturaId) => {
  try {
    const query = `
      UPDATE captura
      SET status = 'rodando', data_hora_inicio = NOW()
      WHERE id = $1
    `;
    await pool.query(query, [capturaId]);
    console.log(`✅ Captura #${capturaId} iniciada com sucesso`);
  } catch (error) {
    console.error(`Erro ao iniciar captura #${capturaId}:`, error);
    throw error;
  }
};

const completeCapture = async (capturaId) => {
  try {
    const query = `
      UPDATE captura
      SET status = 'concluido', data_hora_fim = NOW()
      WHERE id = $1
    `;
    await pool.query(query, [capturaId]);
    console.log(`✅ Captura #${capturaId} concluída com sucesso`);
  } catch (error) {
    console.error(`Erro ao concluir captura #${capturaId}:`, error);
    throw error;
  }
};

const markCaptureError = async (capturaId, errorMessage) => {
  try {
    const query = `
      UPDATE captura
      SET status = 'erro', data_hora_fim = NOW()
      WHERE id = $1
    `;
    await pool.query(query, [capturaId]);
    console.log(`❌ Captura #${capturaId} marcada com erro`);
  } catch (error) {
    console.error(`Erro ao marcar captura #${capturaId} com erro:`, error);
    throw error;
  }
};

module.exports = {
  getPendingCaptures,
  startCapture,
  completeCapture,
  markCaptureError
};
