const crawlerConfig = {
  headless: false,
  baseUrl: 'https://dudaimoveis.com.br/venda/residencial/florianopolis/',
  maxPages: 2,
  maxItems: 5,
  timeout: 30000,
  delayBetweenRequests: 2000,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
  fieldSelectors: {
    link: {
      type: 'xpath',
      template: '//*[@id="page{pageNum}"]/div[{itemNum}]/div/div[2]/a'
    },
    title: {
      type: 'xpath',
      template: '//*[@id="clb-imovel-topo"]/div/div[1]/div[1]/h1'
    },
    price: {
      type: 'xpath',
      template: '//*[@id="clb-imovel-topo"]/div/div[1]/div[2]/div/span/span[2]'
    },
  }
};

module.exports = crawlerConfig;