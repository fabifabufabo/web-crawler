const { crawl } = require('./src/crawler/core');
const crawlerConfig = require('./src/config/crawler-config.js');
const extractors = require('./src/crawler/extractors.js');
const fs = require('fs').promises;
const { testConnection, pool } = require('./db/postgresql.js');
const {
  getPendingCaptures,
  startCapture,
  completeCapture,
  markCaptureError
} = require('./db/captureManager.js');

async function processCapture(capture) {
  console.log(`\n==== Processando captura #${capture.id} para portal: ${capture.portal_nome} ====`);

  try {
    await startCapture(capture.id);

    const filters = capture.filtros || {};
    let captureBaseUrl = capture.portal_url;

    if (filters.tipo_negocio) {
      captureBaseUrl = `${captureBaseUrl}/${filters.tipo_negocio}`;
    }

    if (filters.tipo_imovel) {
      captureBaseUrl = `${captureBaseUrl}/${filters.tipo_imovel}`;
    }

    if (filters.cidade) {
      captureBaseUrl = `${captureBaseUrl}/${filters.cidade}`;
    }

    const config = {
      ...crawlerConfig,
      portalName: capture.portal_nome,
      baseUrl: captureBaseUrl,
      maxPages: filters.max_paginas,
      maxItems: filters.max_itens
    };

    console.log(`Iniciando crawler para: ${config.baseUrl}`);
    const results = await crawl(config, {
      title: extractors.extractTitle,
      description: extractors.extractDescription,
      businessType: extractors.extractBusinessType,
      address: extractors.extractAddress,
      price: extractors.extractPrice,
      bedroom: extractors.extractBedroom,
      bathroom: extractors.extractBathroom,
      garage: extractors.extractGarage,
      privateArea: extractors.extractPrivateArea
    });

    console.log(`Captura #${capture.id} concluída com ${results.length} itens`);

    const outputFile = `imoveis-captura-${capture.id}.json`;
    await fs.writeFile(
      outputFile,
      JSON.stringify(results, null, 2),
      'utf8'
    );
    console.log(`Resultados salvos em ${outputFile}`);

    await completeCapture(capture.id);

  } catch (error) {
    console.error(`Erro ao processar captura #${capture.id}:`, error);
    await markCaptureError(capture.id, error.message);
  }
}

async function main() {
  try {
    const connected = await testConnection();
    if (!connected) {
      console.error("❌ Não foi possível conectar ao banco de dados. Encerrando...");
      return
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