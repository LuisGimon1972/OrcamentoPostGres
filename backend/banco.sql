BEGIN;

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

CREATE TABLE IF NOT EXISTS itensOrcamento (
    id SERIAL PRIMARY KEY,
    orcamentoId INTEGER NOT NULL,
    produtoId INTEGER,
    descricao TEXT,
    quantidade REAL NOT NULL,
    valorUnit REAL NOT NULL,
    total REAL NOT NULL,
    tipoItem TEXT DEFAULT 'PRODUTO',
    FOREIGN KEY (orcamentoId) REFERENCES orcamentos(id),
    FOREIGN KEY (produtoId) REFERENCES itens(controle)
);

CREATE TABLE IF NOT EXISTS orcamentos (
    id SERIAL PRIMARY KEY,
    numero TEXT UNIQUE,
    clienteId INTEGER,
    dataCriacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    validade TEXT,
    observacoes TEXT,
    desconto REAL DEFAULT 0,
    acrescimo REAL DEFAULT 0,
    valorTotalItens REAL DEFAULT 0,
    valorTotal REAL DEFAULT 0,
    status TEXT DEFAULT 'ABERTO',
    condicao TEXT,
    FOREIGN KEY (clienteId) REFERENCES clientes(id)
);

CREATE TABLE IF NOT EXISTS receber (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER,
    descricao TEXT,
    valororiginal REAL,
    valor REAL,
    valorpago REAL,
    valorpendente REAL,
    datavencimento TIMESTAMP,
    datapagamento TIMESTAMP,
    datacadastro TIMESTAMP,
    status TEXT,
    formapagamento TEXT,
    observacao TEXT,
    usuario TEXT,
    referencia TEXT,
    numero_documento TEXT,
    juros REAL,
    desconto REAL,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);