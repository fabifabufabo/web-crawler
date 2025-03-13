async function extractTitle(page, config) {
  const s = config.fieldSelectors.title;

  if (s.type !== 'xpath') throw new Error('Tipo de seletor não suportado para título');

  try {
    const els = await page.$$(`xpath/.${s.template}`);

    if (els.length) return page.evaluate(el => el.textContent.trim(), els[0]);

    return null;
  } catch (e) {
    console.log(`Erro ao extrair título:`, e.message);
    return null;
  }
}

async function extractPrice(page, config) {
  const s = config.fieldSelectors.price;

  if (s.type !== 'xpath') throw new Error('Tipo de seletor não suportado para preço');

  try {
    const els = await page.$$(`xpath/.${s.template}`);

    if (els.length) return page.evaluate(el => el.textContent.trim(), els[0]);

    return null;
  } catch (e) {
    console.log(`Erro ao extrair preço:`, e.message);
    return null;
  }
}

async function extractDescription(page, config) {
  const s = config.fieldSelectors.description;

  if (s.type !== 'css') throw new Error('Tipo de seletor não suportado para descrição');

  try {
    const text = await page.evaluate((selector) => {
      const paragraphs = document.querySelectorAll(selector);
      if (paragraphs.length > 0) {
        return paragraphs[0].textContent.trim();
      }
      return null;
    }, s.selector);

    return text;
  } catch (e) {
    console.log(`Erro ao extrair descrição:`, e.message);
    return null;
  }
}

async function extractAddress(page, config) {
  const s = config.fieldSelectors.address;
  if (s.type !== 'xpath') throw new Error('Tipo de seletor não suportado para endereço');
  try {
    const els = await page.$$(`xpath/.${s.template}`);
    if (els.length) return page.evaluate(el => el.textContent.trim(), els[0]);
    return null;
  } catch (e) {
    console.log(`Erro ao extrair endereço:`, e.message);
    return null;
  }
}

async function collectData(page, config, extractors) {
  const data = {};
  for (const [field, fn] of Object.entries(extractors)) {
    data[field] = await fn(page, config);
  }
  return data;
}

function extractBusinessType(page, config) {
  const baseUrl = config.baseUrl;
  const urlObj = new URL(baseUrl);
  const segments = urlObj.pathname.split('/').filter(Boolean);
  if (segments.length > 0) {
    return segments[0].charAt(0).toUpperCase() + segments[0].slice(1);
  }
  return null;
}

module.exports = {
  extractTitle,
  extractPrice,
  extractDescription,
  collectData,
  extractBusinessType,
  extractAddress
};