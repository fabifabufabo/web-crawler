const { Client } = require('@elastic/elasticsearch');
const config = require('../src/config/elasticsearch-config');
const crypto = require('crypto');

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

  const generateDeterministicId = (property) => {
    const hash = crypto.createHash('md5');
    hash.update(property.url);
    return hash.digest('hex');
  };

  return {
    id: generateDeterministicId(property),
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

async function checkExistingProperties(normalizedProperties, indexName = 'imoveis') {
  const existingPropsMap = new Map();

  if (normalizedProperties.length === 0) {
    return existingPropsMap;
  }

  try {
    const response = await client.mget({
      index: indexName,
      body: {
        ids: normalizedProperties.map(prop => prop.id)
      }
    });

    response.docs.forEach((doc) => {
      if (doc.found) {
        existingPropsMap.set(doc._id, {
          exists: true,
          capturado_em: doc._source?.capturado_em
        });
      }
    });

    normalizedProperties.forEach(prop => {
      if (!existingPropsMap.has(prop.id)) {
        existingPropsMap.set(prop.id, {
          exists: false
        });
      }
    });

    return existingPropsMap;
  } catch (error) {
    console.error("❌ Erro ao verificar imóveis existentes:", error.message);
    return new Map();
  }
}

async function indexProperties(properties, indexName = 'imoveis') {
  try {
    console.log(`Preparando ${properties.length} imóveis para indexação...`);

    const normalizedProperties = properties.map(normalizePropertyData);

    if (normalizedProperties.length === 0) {
      console.log('Nenhum imóvel para indexar.');
      return { success: true, indexed: 0, updated: 0 };
    }

    const existingPropertiesMap = await checkExistingProperties(normalizedProperties, indexName);

    const operations = [];
    let newItems = 0;
    let updatedItems = 0;

    for (const property of normalizedProperties) {
      const propInfo = existingPropertiesMap.get(property.id);

      if (propInfo && propInfo.exists) {
        const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
        operations.push(
          { update: { _index: indexName, _id: property.id } },
          { doc: { atualizado_em: now } }
        );
        updatedItems++;
      } else {
        operations.push(
          { index: { _index: indexName, _id: property.id } },
          property
        );
        newItems++;
      }
    }

    if (operations.length === 0) {
      return { success: true, indexed: 0, updated: 0 };
    }

    const { errors, items } = await client.bulk({
      refresh: true,
      operations
    });

    if (errors) {
      const failedItems = items.filter(item =>
        (item.index && item.index.error) ||
        (item.update && item.update.error)
      );

      console.error(`❌ Erros ao indexar/atualizar alguns documentos:`,
        failedItems.map(item =>
          (item.index?.error?.reason || item.update?.error?.reason)
        ).join(', ')
      );
    }

    const successfulOps = items.filter(item =>
      !(item.index?.error || item.update?.error)
    ).length / 2;

    console.log(`✅ Operações no Elasticsearch concluídas: ${newItems} novos imóveis, ${updatedItems} atualizados`);

    return {
      success: !errors,
      indexed: newItems,
      updated: updatedItems,
      failed: (newItems + updatedItems) - successfulOps
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
