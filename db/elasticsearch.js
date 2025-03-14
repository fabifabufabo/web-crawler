const { Client } = require('@elastic/elasticsearch');
const config = require('../src/config/elasticsearch-config');
const { v4: uuidv4 } = require('uuid');

const client = new Client(config);

async function ensureElasticsearchReady(indexName = 'imoveis') {
  try {
    await client.info();
    console.log(`✅ Conexão com o Elasticsearch estabelecida com sucesso`);

    const exists = await client.indices.exists({
      index: indexName
    });

    if (!exists) {
      const errorMsg = `Índice "${indexName}" não existe`;
      throw new Error(errorMsg);
    }

    return true;
  } catch (error) {
    console.error('❌ Erro ao verificar Elasticsearch:', error.message);
    throw error;
  }
}

function normalizePropertyData(property) {
  const extractPrice = (priceString) => {
    if (!priceString) return null;
    const numericValue = priceString.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(numericValue);
  };

  const toNumber = (value) => {
    if (!value) return null;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  };

  const extractArea = (areaString) => {
    if (!areaString) return null;
    const match = areaString.match(/(\d+(?:,\d+)?)/);
    if (match) {
      return parseFloat(match[1].replace(',', '.'));
    }
    return null;
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toISOString().replace('T', ' ').substring(0, 19);
  };

  const generateId = () => {
    return uuidv4();
  };

  return {
    id: generateId(),
    titulo: property.title || '',
    descricao: property.description || '',
    portal: property.portal || '',
    url: property.url || '',
    tipoNegocio: property.businessType || '',
    endereco: property.address || '',
    preco: extractPrice(property.price),
    quartos: toNumber(property.bedroom),
    banheiros: toNumber(property.bathroom),
    vagas_garagem: toNumber(property.garage),
    area_util: extractArea(property.privateArea),
    capturado_em: formatDate(property.captured),
    atualizado_em: formatDate(property.captured)
  };
}

async function indexProperties(properties, indexName = 'imoveis') {
  try {
    console.log(`Preparando ${properties.length} imóveis para indexação...`);

    const normalizedProperties = properties.map(normalizePropertyData);

    if (normalizedProperties.length === 0) {
      console.log('Nenhum imóvel para indexar.');
      return { success: true, indexed: 0 };
    }

    const operations = normalizedProperties.flatMap(property => [
      { index: { _index: indexName, _id: property.id } },
      property
    ]);

    const { errors, items } = await client.bulk({
      refresh: true,
      operations
    });

    if (errors) {
      const failedItems = items.filter(item => item.index && item.index.error);
      console.error(`❌ Erros ao indexar alguns documentos:`,
        failedItems.map(item => item.index.error.reason).join(', '));
    }

    const indexed = items.filter(item => !item.index.error).length;
    console.log(`✅ ${indexed} imóveis indexados com sucesso em "${indexName}"`);

    return {
      success: !errors,
      indexed: indexed,
      failed: items.length - indexed
    };
  } catch (error) {
    console.error('❌ Erro ao indexar imóveis:', error.message);
    throw error;
  }
}

module.exports = {
  client,
  ensureElasticsearchReady,
  normalizePropertyData,
  indexProperties
};
