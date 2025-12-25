-- =========================
-- TABELA CLIENTES
-- =========================
CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    cpf TEXT,
    nome TEXT,
    fantasia TEXT,
    endereco TEXT,
    email TEXT,
    telefone TEXT,
    celular TEXT,
    limite REAL,
    cep TEXT,
    bairro TEXT
);

-- =========================
-- TABELA ITENS (PRODUTOS)
-- =========================
CREATE TABLE IF NOT EXISTS itens (
    controle SERIAL PRIMARY KEY,
    codbarras TEXT,
    nome TEXT,
    descricao TEXT,
    grupo TEXT,
    marca TEXT,
    quantidade REAL,
    precocusto REAL,
    perlucro REAL,
    precovenda REAL,
    revenda REAL
);

-- =========================
-- TABELA ORCAMENTOS
-- =========================
CREATE TABLE IF NOT EXISTS orcamentos (
    id SERIAL PRIMARY KEY,
    numero TEXT UNIQUE,
    clienteid INTEGER,
    datacriacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    validade TEXT,
    observacoes TEXT,
    desconto REAL DEFAULT 0,
    acrescimo REAL DEFAULT 0,
    valortotalitens REAL DEFAULT 0,
    valortotal REAL DEFAULT 0,
    status TEXT DEFAULT 'ABERTO',
    condicao TEXT,
    CONSTRAINT fk_orcamento_cliente
        FOREIGN KEY (clienteid) REFERENCES clientes(id)
);

-- =========================
-- TABELA ITENS DO ORCAMENTO
-- =========================
CREATE TABLE IF NOT EXISTS itensorcamento (
    id SERIAL PRIMARY KEY,
    orcamentoid INTEGER NOT NULL,
    produtoid INTEGER,
    descricao TEXT,
    quantidade REAL NOT NULL,
    valorunit REAL NOT NULL,
    total REAL NOT NULL,
    tipoitem TEXT DEFAULT 'PRODUTO',
    CONSTRAINT fk_item_orcamento
        FOREIGN KEY (orcamentoid) REFERENCES orcamentos(id),
    CONSTRAINT fk_item_produto
        FOREIGN KEY (produtoid) REFERENCES itens(controle)
);
