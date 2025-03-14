const { Client } = require('@elastic/elasticsearch');
const config = require('../src/config/elasticsearch-config');

const client = new Client(config);

async function testConnection() {
  try {
    const info = await client.info();
    console.log(`✅ Conectado ao Elasticsearch (versão ${info.version.number})`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar ao Elasticsearch:', error.message);
    return false;
  }
}

async function indexExists(indexName = 'imoveis') {
  try {
    const exists = await client.indices.exists({
      index: indexName
    });

    if (exists) {
      console.log(`✅ Índice "${indexName}" existe`);
    } else {
      console.log(`❌ Índice "${indexName}" não existe`);
    }
    return exists;
  } catch (error) {
    console.error(`❌ Erro ao verificar se o índice ${indexName} existe:`, error.message);
    throw error;
  }
}

module.exports = {
  client,
  testConnection,
  indexExists
};
