const { crawl } = require('./src/crawler/core');
const config = require('./src/config/crawler-config.js');
const extractors = require('./src/crawler/extractors.js');
const fs = require('fs').promises;

async function main() {
  try {
    const results = await crawl(config, {
      title: extractors.extractTitle,
      price: extractors.extractPrice
    });

    console.log(`Extração concluída com ${results.length} itens`);

    await fs.writeFile(
      'imoveis-titulos-precos.json',
      JSON.stringify(results, null, 2),
      'utf8'
    );

    console.log('Crawler finalizado com sucesso! Resultados salvos em imoveis-titulos-precos.json');

  } catch (error) {
    console.error('Erro na execução:', error);
  }
}

main();