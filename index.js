const fs = require('fs').promises;
const { testConnection, pool } = require('./db/postgresql.js');
const { getPendingCaptures } = require('./db/captureManager.js');
const { ensureElasticsearchReady } = require('./db/elasticsearch.js');
const { processCapture } = require('./src/capture/captureProcessor');

async function main() {
  try {
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error("❌ Não foi possível conectar ao banco de dados PostgreSQL. Encerrando...");
      return;
    }

    try {
      await ensureElasticsearchReady();
    } catch (error) {
      console.error("❌ Falha na verificação do Elasticsearch. Encerrando...");
      return;
    }

    const captures = await getPendingCaptures();
    console.log(`Encontradas ${captures.length} capturas pendentes`);

    if (captures.length === 0) {
      console.log("Nenhuma captura pendente encontrada. Encerrando...");
      return;
    }

    for (const capture of captures) {
      await processCapture(capture);
    }

    console.log('\n✅ Todas as capturas foram processadas');

  } catch (error) {
    console.error('❌ Erro na execução principal:', error);
  } finally {
    await pool.end();
    console.log('\nConexão com o banco de dados encerrada');
  }
}

main();