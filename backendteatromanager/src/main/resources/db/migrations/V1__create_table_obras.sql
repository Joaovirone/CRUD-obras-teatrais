CREATE TABLE IF NOT EXISTS obras(
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    data DATE NOT NULL,
    local VARCHAR(255),
    diretor VARCHAR(255),
    elenco TEXT,
    descricao TEXT,
    nota INTEGER
);