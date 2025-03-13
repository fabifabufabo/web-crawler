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
  - status: Status atual da captura (ex: "em_andamento", "concluido", "erro")
  - data_hora_inicio: Data e hora de início da captura
  - data_hora_fim: Data e hora de término da captura
