const puppeteer = require('puppeteer');
const { scrollToBottom, delay } = require('./utils');
const { collectData } = require('./extractors');

async function processAllPages(page, config, extractors) {
  const results = [];
  let currentPage = 1;

  while (currentPage <= config.maxPages && results.length < config.maxItems) {
    if (currentPage > 1) {
      console.log(`Scrollando para carregar a página ${currentPage}...`);
      await scrollToBottom(page, config);
    }

    await delay(config.delayBetweenRequests);
    const pageSelector = `#page${currentPage}`;
    const elementExists = await page.$(pageSelector);

    if (elementExists) {
      console.log(`Processando página ${currentPage}...`);

      let itemNum = 1;
      let found = true;

      while (found && results.length < config.maxItems) {
        const item = await collectData(page, currentPage, itemNum, config, extractors);

        if (item.title) {
          results.push(item);
          console.log(`Item ${itemNum} da página ${currentPage} extraído com sucesso`);
          itemNum++;
        } else {
          found = false;
        }
      }

      currentPage++;
    } else {
      console.log(`Não foi possível encontrar a página ${currentPage}. Tentando novamente...`);
      await delay(1000);
    }
  }

  return results;
}

async function crawl(config, extractors) {
  const browser = await puppeteer.launch({
    headless: config.headless,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  try {
    const page = await browser.newPage();
    await page.setUserAgent(config.userAgent);
    await page.goto(config.baseUrl, { waitUntil: 'networkidle2', timeout: config.timeout });

    const results = await processAllPages(page, config, extractors);
    console.log(`Total de ${results.length} imóveis extraídos`);

    return results;
  } catch (e) {
    console.error('Erro durante o crawling:', e);
    throw e;
  } finally {
    await browser.close();
  }
}

module.exports = {
  crawl,
};