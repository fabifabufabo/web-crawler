-- Script para criar o banco de dados e tabelas para o web-crawler

CREATE DATABASE web_crawler_db;

\c web_crawler_db;

CREATE TABLE portal (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    url VARCHAR(512) NOT NULL,
    observacoes TEXT
);

CREATE TABLE captura (
    id SERIAL PRIMARY KEY,
    id_portal INTEGER NOT NULL,
    filtros JSONB,
    status VARCHAR(50) NOT NULL,
    data_hora_inicio TIMESTAMP NOT NULL,
    data_hora_fim TIMESTAMP,
    FOREIGN KEY (id_portal) REFERENCES portal (id)
);

CREATE INDEX idx_captura_portal ON captura (id_portal);
CREATE INDEX idx_captura_status ON captura (status);
