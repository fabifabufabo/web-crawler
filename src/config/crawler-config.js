const crawlerConfig = {
  headless: true,
  baseUrl: 'https://dudaimoveis.com.br/venda/residencial/florianopolis/',
  maxPages: 10,
  maxItems: 100,
  timeout: 30000,
  delayBetweenRequests: 2000,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
  fieldSelectors: {
    title: {
      type: 'xpath',
      template: '//*[@id="page{pageNum}"]/div[{itemNum}]/div/div[2]/div[1]/a/h2'
    },
    price: {
      type: 'xpath',
      template: '//*[@id="page{pageNum}"]/div[{itemNum}]/div/div[2]/div[2]/div[1]/span/span[2]'
    }
  }
};

module.exports = crawlerConfig;