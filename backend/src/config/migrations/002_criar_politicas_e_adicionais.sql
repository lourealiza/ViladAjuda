-- Tabela de Políticas de Cancelamento
CREATE TABLE IF NOT EXISTS politicas_cancelamento (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chale_id INTEGER NOT NULL UNIQUE,
    tipo TEXT NOT NULL DEFAULT 'nao_reembolsavel',
    taxa_adicional_percentual REAL DEFAULT 0,
    descricao TEXT,
    condicoes_reembolso TEXT,
    ativo BOOLEAN DEFAULT 1,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (chale_id) REFERENCES chales(id) ON DELETE CASCADE
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_politica_chale ON politicas_cancelamento(chale_id);
CREATE INDEX IF NOT EXISTS idx_politica_tipo ON politicas_cancelamento(tipo);
CREATE INDEX IF NOT EXISTS idx_politica_ativo ON politicas_cancelamento(ativo);

-- Tabela de Preços Adicionais (hóspede extra, criança, pet, etc)
CREATE TABLE IF NOT EXISTS precos_adicionais (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chale_id INTEGER NOT NULL,
    tipo TEXT NOT NULL,
    preco_por_noite REAL NOT NULL,
    descricao TEXT,
    condicoes TEXT,
    ativo BOOLEAN DEFAULT 1,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (chale_id) REFERENCES chales(id) ON DELETE CASCADE
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_preco_chale ON precos_adicionais(chale_id);
CREATE INDEX IF NOT EXISTS idx_preco_tipo ON precos_adicionais(tipo);
CREATE INDEX IF NOT EXISTS idx_preco_ativo ON precos_adicionais(ativo);
