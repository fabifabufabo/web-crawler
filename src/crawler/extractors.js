async function extractTitle(page, currentPage, itemNum, config) {
  const s = config.fieldSelectors.title;

  if (s.type !== 'xpath') throw new Error('Tipo de seletor não suportado para título');

  const xp = s.template.replace('{pageNum}', currentPage).replace('{itemNum}', itemNum);
  try {
    const els = await page.$$(`xpath/.${xp}`);

    if (els.length) return page.evaluate(el => el.textContent.trim(), els[0]);

    return null;
  } catch (e) {
    console.log(`Erro ao extrair título do item ${itemNum} da página ${currentPage}:`, e.message);
    return null;
  }
}

async function extractPrice(page, currentPage, itemNum, config) {
  const s = config.fieldSelectors.price;

  if (s.type !== 'xpath') throw new Error('Tipo de seletor não suportado para preço');

  const xp = s.template.replace('{pageNum}', currentPage).replace('{itemNum}', itemNum);
  try {
    const els = await page.$$(`xpath/.${xp}`);

    if (els.length) return page.evaluate(el => el.textContent.trim(), els[0]);

    return null;
  } catch (e) {
    console.log(`Erro ao extrair preço do item ${itemNum} da página ${currentPage}:`, e.message);
    return null;
  }
}

async function collectData(page, currentPage, itemNum, config, extractors) {
  const data = {};
  for (const [field, fn] of Object.entries(extractors)) {
    data[field] = await fn(page, currentPage, itemNum, config);
  }
  return data;
}

module.exports = {
  extractTitle,
  extractPrice,
  collectData
};