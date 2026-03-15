-- Tabela de Temporadas (alta, média, baixa, especial)
CREATE TABLE IF NOT EXISTS temporadas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    multiplicador REAL DEFAULT 1.0,
    descricao TEXT,
    ativo BOOLEAN DEFAULT 1,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_temporada_periodo ON temporadas(data_inicio, data_fim);
CREATE INDEX IF NOT EXISTS idx_temporada_tipo ON temporadas(tipo);
CREATE INDEX IF NOT EXISTS idx_temporada_ativo ON temporadas(ativo);

-- Tabela de Preços de Chalés por Temporada
CREATE TABLE IF NOT EXISTS chale_temporada_precos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chale_id INTEGER NOT NULL,
    temporada_id INTEGER NOT NULL,
    preco_diaria REAL NOT NULL,
    descricao TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (chale_id) REFERENCES chales(id) ON DELETE CASCADE,
    FOREIGN KEY (temporada_id) REFERENCES temporadas(id) ON DELETE CASCADE,
    UNIQUE(chale_id, temporada_id)
);

CREATE INDEX IF NOT EXISTS idx_chale_temporada_preco_chale ON chale_temporada_precos(chale_id);
CREATE INDEX IF NOT EXISTS idx_chale_temporada_preco_temporada ON chale_temporada_precos(temporada_id);
