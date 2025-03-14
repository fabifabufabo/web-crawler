const { crawl } = require('./src/crawler/core');
const crawlerConfig = require('./src/config/crawler-config.js');
const extractors = require('./src/crawler/extractors.js');
const fs = require('fs').promises;
const { testConnection, pool } = require('./db/postgresql.js');
const { getPortalParams } = require('./db/getPortal.js');

async function main() {
  try {

    await testConnection();

    console.log('Iniciando crawler...');

    const portalParams = await getPortalParams();

    const config = {
      ...crawlerConfig,
      portalName: portalParams.portal,
      baseUrl: `${portalParams.baseUrl}/venda/residencial/florianopolis/`,
    }

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

    console.log(`Extração concluída com ${results.length} itens`);

    await fs.writeFile(
      'imoveis-encontrados.json',
      JSON.stringify(results, null, 2),
      'utf8'
    );

    console.log('Crawler finalizado com sucesso! Resultados salvos em imoveis-encontrados.json');

  } catch (error) {
    console.error('Erro na execução:', error);
  } finally {
    await pool.end();
    console.log('Conexão com o banco de dados encerrada');
  }
}

main();