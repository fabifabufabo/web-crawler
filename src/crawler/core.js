const puppeteer = require('puppeteer');
const { scrollToBottom, delay } = require('./utils');
const { collectData } = require('./extractors');

async function extractLinks(page, pageNum, config) {
  const links = [];
  let itemNum = 1;
  let found = true;

  while (found) {
    const linkXPath = config.fieldSelectors.link.template
      .replace('{pageNum}', pageNum)
      .replace('{itemNum}', itemNum);
    const linkElements = await page.$$(`xpath/.${linkXPath}`);
    if (linkElements.length > 0) {
      const href = await page.evaluate(el => el.getAttribute('href'), linkElements[0]);
      if (href) {
        links.push(href);
        itemNum++;
      } else {
        found = false;
      }
    } else {
      found = false;
    }
  }

  return links;
}

async function processAllPages(page, config, extractors) {
  const results = [];
  let currentPage = 1;
  const allLinks = [];

  while (currentPage <= config.maxPages && allLinks.length < config.maxItems) {
    if (currentPage > 1) {
      console.log(`Scrollando para carregar a página ${currentPage}...`);
      await scrollToBottom(page, config);
    }

    await delay(config.delayBetweenRequests);
    const pageSelector = `#page${currentPage}`;
    const elementExists = await page.$(pageSelector);

    if (elementExists) {
      console.log(`Extraindo links da página ${currentPage}...`);
      const pageLinks = await extractLinks(page, currentPage, config);
      allLinks.push(...pageLinks);
      console.log(`${pageLinks.length} links extraídos da página ${currentPage}`);
      currentPage++;
    } else {
      console.log(`Não foi possível encontrar a página ${currentPage}. Tentando novamente...`);
      await delay(1000);
    }
  }

  console.log(`Total de ${allLinks.length} links extraídos. Processando itens...`);

  for (let i = 0; i < allLinks.length && results.length < config.maxItems; i++) {
    const link = allLinks[i];
    console.log(`Processando link ${i + 1}/${Math.min(config.maxItems, allLinks.length)}: ${link}`);

    await page.goto(link, { waitUntil: 'networkidle2', timeout: config.timeout });
    await delay(config.delayBetweenRequests);

    const item = await collectData(page, config, extractors);

    if (item.title) {
      item.url = link;
      results.push(item);
      console.log(`Item ${i + 1} extraído com sucesso`);
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