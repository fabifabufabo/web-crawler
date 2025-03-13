const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function scrollToBottom(page, config) {
  await page.evaluate(m => {
    const c = document.querySelector(".clb-search-result-property");
    if (c) c.scrollTop = c.scrollHeight;
    if (document.getElementById(`page${m}`)) console.log(`A página ${m} já está carregada.`);
  }, config.maxPages);
}

module.exports = {
  scrollToBottom,
  delay
};