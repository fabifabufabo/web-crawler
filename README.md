# Web Crawler

## Configuração do Banco de Dados

A aplicação utiliza PostgreSQL para armazenar informações dos portais e registros de capturas. Siga estes passos para configurar o banco de dados:

1. Certifique-se de que você tem o PostgreSQL instalado em seu sistema
2. Abra um terminal e execute o seguinte comando para executar o script de configuração:

```bash
psql -U $(whoami) -f scripts/setup_database.sql
```

3. Se precisar personalizar a configuração do banco de dados, modifique as configurações de conexão na aplicação.

### Estrutura do Banco de Dados

O banco de dados consiste em duas tabelas principais:

- `portal` - Armazena informações sobre os sites a serem rastreados

  - id: Identificador único
  - nome: Nome do portal
  - url: URL do site do portal
  - observacoes: Quaisquer notas ou observações adicionais

- `captura` - Armazena registros das atividades de rastreamento

  - id: Identificador único
  - id_portal: Referência ao portal sendo rastreado (chave estrangeira)
  - filtros: Objeto JSON contendo filtros aplicados durante a captura
  - status: Status atual da captura (ex: "pendente", "rodando", "concluido", "erro")
  - data_hora_inicio: Data e hora de início da captura
  - data_hora_fim: Data e hora de término da captura
  - observacoes: Informações adicionais, incluindo mensagens de erro se houverem

## Sistema de Gerenciamento de Capturas

O sistema gerencia automaticamente o ciclo de vida das capturas:

1. **Capturas Pendentes**: O sistema busca capturas com status "pendente" no banco de dados.

2. **Processamento de Capturas**: Para cada captura pendente:

   - O status é atualizado para "rodando"
   - O timestamp de início é registrado
   - As configurações são extraídas dos campos id_portal e filtros
   - O crawler é executado com as configurações específicas

3. **Finalização**: Após o processamento:

   - Em caso de sucesso, o status é atualizado para "concluido"
   - Em caso de erro, o status é atualizado para "erro" e a mensagem de erro é registrada
   - O timestamp de finalização é registrado

4. **Resultados**: Para cada captura bem-sucedida, um arquivo JSON com os resultados é gerado.

### Criando Capturas

Para agendar uma nova captura, insira um registro na tabela `captura` com o seguinte formato:

```sql
INSERT INTO captura (id_portal, filtros, status, data_hora_inicio) VALUES
(
  1, -- ID do portal
  '{"tipo_negocio": "venda", "tipo_imovel": "residencial", "cidade": "florianopolis", "max_itens": 5}',
  'pendente',
  NOW()
);
```

O campo `filtros` é um objeto JSON que pode conter:

- tipo_negocio: O tipo de negócio (ex: "venda", "aluguel")
- tipo_imovel: O tipo de imóvel (ex: "residencial", "comercial")
- cidade: A cidade alvo
- max_paginas: Número máximo de páginas a processar
- max_itens: Número máximo de itens a capturar
