CREATE DATABASE cafeteria1;
USE cafeteria1;

CREATE TABLE categorias (
    id_categoria INT PRIMARY KEY AUTO_INCREMENT,
    descricao VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE produtos (
    id_produto INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL UNIQUE,
    preco DECIMAL(10,2) NOT NULL,
    id_categoria INT,
    exige_preparo BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria)
);

CREATE TABLE estoque (
    id_estoque INT PRIMARY KEY AUTO_INCREMENT,
    quantidade_estoque INT NOT NULL,
    id_produto INT NOT NULL UNIQUE,
    FOREIGN KEY (id_produto) REFERENCES produtos(id_produto)
);

CREATE TABLE funcionarios (
    id_funcionario INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL UNIQUE,
    cargo VARCHAR(50) NOT NULL,
    login VARCHAR(50) NOT NULL,
    senha VARCHAR(100) NOT NULL
);

CREATE TABLE pedidos (
    id_nota_fiscal INT PRIMARY KEY AUTO_INCREMENT,
    id_funcionario INT NOT NULL,
    data_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    valor_total DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pendente',
    FOREIGN KEY (id_funcionario) REFERENCES funcionarios(id_funcionario)
);

CREATE TABLE item_pedido (
    id_item_pedido INT PRIMARY KEY AUTO_INCREMENT,
    quantidade INT NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    id_produto INT NOT NULL,
    id_nota_fiscal INT NOT NULL,
    FOREIGN KEY (id_produto) REFERENCES produtos(id_produto),
    FOREIGN KEY (id_nota_fiscal) REFERENCES pedidos(id_nota_fiscal)
);

CREATE TABLE fornecedores (
    id_fornecedor INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL UNIQUE,
    telefone VARCHAR(20) NOT NULL,
    cnpj VARCHAR(18) NOT NULL UNIQUE
);

CREATE TABLE fornecedor_produto (
    id_fornecedor INT NOT NULL,
    id_produto INT NOT NULL,
    PRIMARY KEY (id_fornecedor, id_produto),
    FOREIGN KEY (id_fornecedor) REFERENCES fornecedores(id_fornecedor),
    FOREIGN KEY (id_produto) REFERENCES produtos(id_produto)
);
