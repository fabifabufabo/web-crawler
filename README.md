# Web Crawler para Imóveis

Um sistema automatizado para captura e indexação de dados de imóveis de diversos portais imobiliários.

## Visão Geral

Este sistema permite:

- Rastrear portais imobiliários configurados no banco de dados
- Agendar e gerenciar capturas de dados
- Armazenar resultados estruturados no Elasticsearch para fácil pesquisa e análise

## Requisitos

- Node.js
- PostgreSQL
- Elasticsearch

## Instalação

1. Clone o repositório
2. Instale as dependências:

```bash
npm install
```

3. Crie um arquivo `.env` na raiz do projeto (ou edite o existente) com as configurações de banco de dados e Elasticsearch:

```
# Database config
DB_USER=postgres
DB_HOST=localhost
DB_NAME=web_crawler_db
DB_PASSWORD=your_db_password
DB_PORT=5432

# Elasticsearch config
ELASTICSEARCH_NODE="https://localhost:9200"
ELASTICSEARCH_USER=elastic
ELASTICSEARCH_PASSWORD="your_password"
ELASTICSEARCH_TLS_REJECT=false
ELASTICSEARCH_REQUEST_TIMEOUT=30000
ELASTICSEARCH_MAX_RETRIES=3
ELASTICSEARCH_SNIFF_ON_START=true
ELASTICSEARCH_SNIFF_ON_CONNECTION_FAULT=true
```

## Configuração

### 1. Banco de Dados PostgreSQL

#### Instalação e Configuração

1. Certifique-se de que você tem o PostgreSQL instalado em seu sistema
2. Execute o script de configuração:

```bash
psql -U $(whoami) -f scripts/setup_database.sql
```

3. Se necessário, ajuste as configurações de conexão na aplicação.

#### Estrutura do Banco de Dados

O sistema utiliza duas tabelas principais:

- **portal** - Informações sobre os sites a serem rastreados

  - `id`: Identificador único
  - `nome`: Nome do portal
  - `url`: URL do site
  - `observacoes`: Notas ou observações adicionais

- **captura** - Registros das atividades de rastreamento
  - `id`: Identificador único
  - `id_portal`: Referência ao portal (chave estrangeira)
  - `filtros`: JSON com parâmetros da captura
  - `status`: Estado da captura (pendente, rodando, concluido, erro)
  - `data_hora_inicio`: Timestamp de início
  - `data_hora_fim`: Timestamp de término
  - `observacoes`: Informações adicionais/mensagens de erro

### 2. Elasticsearch

#### Instalação

1. Baixe o Elasticsearch na [página oficial de downloads](https://www.elastic.co/downloads/elasticsearch)
2. Extraia o arquivo para um diretório de sua preferência
3. Navegue até o diretório extraído
4. Inicie o serviço:
   - **Windows**: Execute `bin\elasticsearch.bat`
   - **macOS/Linux**: Execute `./bin/elasticsearch`

#### Verificação

Acesse `http://localhost:9200` - você deverá ver informações do cluster em formato JSON.

#### Criação do Índice de Imóveis

Execute o seguinte comando para criar o índice necessário:

> **Nota**: Se seu Elasticsearch estiver configurado com autenticação, adicione o usuário e senha ao comando abaixo.

```bash
curl -X PUT "https://localhost:9200/imoveis" -u username:password --insecure -H "Content-Type: application/json" -d '{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 1
  },
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "titulo": { "type": "text" },
      "descricao": { "type": "text" },
      "portal": { "type": "keyword" },
      "url": { "type": "text" },
      "tipoNegocio": { "type": "keyword" },
      "endereco": { "type": "text" },
      "preco": { "type": "double" },
      "quartos": { "type": "integer" },
      "banheiros": { "type": "integer" },
      "vagas_garagem": { "type": "integer" },
      "area_util": { "type": "double" },
      "capturado_em": { "type": "date", "format": "yyyy-MM-dd HH:mm:ss" },
      "atualizado_em": { "type": "date", "format": "yyyy-MM-dd HH:mm:ss" }
    }
  }
}'
```

## Uso do Sistema

### Executando o Crawler

Para iniciar o processo de crawler e processar todas as capturas pendentes:

```bash
node index.js
```

### Ciclo de Vida das Capturas

O sistema gerencia automaticamente o processo de capturas:

1. **Inicialização**: O sistema busca capturas com status "pendente".
2. **Execução**: Para cada captura pendente:
   - Atualiza o status para "rodando"
   - Registra o timestamp de início
   - Configura o crawler com os parâmetros necessários
   - Executa a captura
3. **Finalização**:
   - Sucesso: status "concluido"
   - Erro: status "erro" com mensagem detalhada
   - Registra o timestamp de finalização
4. **Resultados**: Gera um arquivo JSON com os dados capturados para cada execução bem-sucedida.

### Agendando Novas Capturas

Para criar uma nova tarefa de captura, insira um registro na tabela `captura`:

```sql
INSERT INTO captura (id_portal, filtros, status, data_hora_inicio) VALUES
(
  1, -- ID do portal desejado,
  '{"tipo_negocio": "venda", "tipo_imovel": "residencial", "cidade": "florianopolis", "max_itens": 5}',
  'pendente',
  NOW()
);
```

### Opções de Filtro Disponíveis

O campo `filtros` aceita um objeto JSON com as seguintes propriedades:

- `tipo_negocio`: Tipo de transação ("venda", "aluguel")
- `tipo_imovel`: Categoria do imóvel ("residencial", "comercial")
- `cidade`: Localização alvo
- `max_paginas`: Limite de páginas a processar
- `max_itens`: Número máximo de imóveis a capturar

## Personalização do Crawler

### Configurando Seletores de Campos

O arquivo `src/config/crawler-config.js` contém a configuração dos seletores para extração de dados. Você pode personalizar os seletores para diferentes portais:

```js
fieldSelectors: {
  link: {
    type: 'xpath',
    template: '//*[@id="page{pageNum}"]/div[{itemNum}]/div/div[2]/a'
  },
  title: {
    type: 'xpath',
    template: '//*[@id="clb-imovel-topo"]/div/div[1]/div[1]/h1'
  },
  // ... outros seletores
}
```
