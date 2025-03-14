require('dotenv').config()

module.exports = {
  node: process.env.ELASTICSEARCH_NODE || 'https://localhost:9200',
  auth: {
    username: process.env.ELASTICSEARCH_USER,
    password: process.env.ELASTICSEARCH_PASSWORD,
  },
  tls: {
    rejectUnauthorized: process.env.ELASTICSEARCH_TLS_REJECT === 'true'
  },
  requestTimeout: Number(process.env.ELASTICSEARCH_REQUEST_TIMEOUT) || 30000,
  maxRetries: Number(process.env.ELASTICSEARCH_MAX_RETRIES) || 3,
  sniffOnStart: process.env.ELASTICSEARCH_SNIFF_ON_START === 'true',
  sniffOnConnectionFault: process.env.ELASTICSEARCH_SNIFF_ON_CONNECTION_FAULT === 'true'
}
