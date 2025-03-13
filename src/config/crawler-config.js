const crawlerConfig = {
  headless: false,
  baseUrl: 'https://dudaimoveis.com.br/venda/residencial/florianopolis/',
  maxPages: 1,
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
    description: {
      type: 'css',
      selector: '.col-xs-12.col-sm-12.col-md-7.col-lg-8:not(.hidden-print) p'
    },
    address: {
      type: 'xpath',
      template: '//*[@id="clb-imovel-topo"]/div/div[1]/div[1]/p'
    },
    bedroom: {
      type: 'css',
      selector: '#amenity-dormitorios > span'
    },
    bathroom: {
      type: 'css',
      selector: '#amenity-banheiros > span'
    },
    garage: {
      type: 'css',
      selector: '#amenity-vagas > span'
    },
    privateArea: {
      type: 'css',
      selector: '#amenity-area-privativa > span'
    }
  }
};

module.exports = crawlerConfig;