const puppeteer = require('puppeteer');
const { processAllPages } = require('./pageProcessor');

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