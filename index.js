const fs = require('fs').promises;
const { testConnection, pool } = require('./db/postgresql.js');
const { getPendingCaptures } = require('./db/captureManager.js');
const { ensureElasticsearchReady } = require('./db/elasticsearch.js');
const { processCapture } = require('./src/capture/captureProcessor');

async function main() {
  try {
    await testConnection();
    await ensureElasticsearchReady();

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
  } catch (err) {
    console.error('❌ Erro na execução principal:', err);
  } finally {
    try {
      await pool.end();
      console.log('\nConexão com o banco de dados encerrada');
    } catch (e) {
      console.error('\nErro ao encerrar a conexão com o banco de dados:', e.message);
    }
  }
}

main();