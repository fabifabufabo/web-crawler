const { crawl } = require('../crawler/core');
const crawlerConfig = require('../config/crawler-config');
const extractors = require('../crawler/extractors');
const fs = require('fs').promises;
const {
  startCapture,
  completeCapture,
  markCaptureError
} = require('../../db/captureManager');
const { indexProperties } = require('../../db/elasticsearch');

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

    console.log(`Processando ${results.length} imóveis no Elasticsearch...`);
    const indexResult = await indexProperties(results);

    if (indexResult.success) {
      console.log(`Indexação concluída: ${indexResult.indexed} novos imóveis inseridos, ${indexResult.updated} imóveis atualizados no Elasticsearch`);
      await completeCapture(capture.id);
    } else {
      const errorMsg = `Erro parcial na indexação: ${indexResult.failed} de ${results.length} imóveis não foram processados`;
      console.error(errorMsg);
      await markCaptureError(capture.id, errorMsg);
    }

  } catch (error) {
    console.error(`Erro ao processar captura #${capture.id}:`, error);
    await markCaptureError(capture.id, error.message);
  }
}

module.exports = { processCapture };
