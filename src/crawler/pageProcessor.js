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

async function extractAllLinks(page, config) {
  const allLinks = [];
  let currentPage = 1;

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

  console.log(`Total de ${allLinks.length} links extraídos.`);
  return allLinks;
}

async function processLinks(page, links, config, extractors) {
  const results = [];

  for (let i = 0; i < links.length && results.length < config.maxItems; i++) {
    const link = links[i];
    console.log(`Processando link ${i + 1}/${Math.min(config.maxItems, links.length)}: ${link}`);

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

async function processAllPages(page, config, extractors) {
  const links = await extractAllLinks(page, config);
  return await processLinks(page, links, config, extractors);
}

module.exports = {
  extractLinks,
  extractAllLinks,
  processLinks,
  processAllPages
};
