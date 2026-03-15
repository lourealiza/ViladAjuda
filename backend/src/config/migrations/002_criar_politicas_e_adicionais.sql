-- Tabela de Políticas de Cancelamento
CREATE TABLE IF NOT EXISTS politicas_cancelamento (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chale_id INTEGER NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'nao_reembolsavel' COMMENT 'Tipo: flexivel, nao_reembolsavel, moderada, rigorosa',
    taxa_adicional_percentual DECIMAL(5, 2) DEFAULT 0 COMMENT 'Taxa adicional em percentual (%)',
    descricao TEXT COMMENT 'Descrição textual da política',
    condicoes_reembolso JSON COMMENT 'Condições de reembolso em JSON',
    ativo BOOLEAN DEFAULT 1,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (chale_id) REFERENCES chales(id) ON DELETE CASCADE,
    UNIQUE KEY uk_politica_chale (chale_id)
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_politica_chale ON politicas_cancelamento(chale_id);
CREATE INDEX IF NOT EXISTS idx_politica_tipo ON politicas_cancelamento(tipo);
CREATE INDEX IF NOT EXISTS idx_politica_ativo ON politicas_cancelamento(ativo);

-- Tabela de Preços Adicionais (hóspede extra, criança, pet, etc)
CREATE TABLE IF NOT EXISTS precos_adicionais (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chale_id INTEGER NOT NULL,
    tipo TEXT NOT NULL COMMENT 'Tipo: hospede_extra, crianca, bebe, pet, limpeza_extra, cama_extra',
    preco_por_noite DECIMAL(10, 2) NOT NULL,
    descricao TEXT COMMENT 'Descrição (ex: "Criança até 12 anos com cama extra")',
    condicoes JSON COMMENT 'Condições especiais em JSON',
    ativo BOOLEAN DEFAULT 1,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (chale_id) REFERENCES chales(id) ON DELETE CASCADE
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_preco_chale ON precos_adicionais(chale_id);
CREATE INDEX IF NOT EXISTS idx_preco_tipo ON precos_adicionais(tipo);
CREATE INDEX IF NOT EXISTS idx_preco_ativo ON precos_adicionais(ativo);

-- Exemplo de dados iniciais: Política Flexível
INSERT OR IGNORE INTO politicas_cancelamento (chale_id, tipo, taxa_adicional_percentual, descricao)
SELECT id, 'flexivel', 12.5, 'Política Flexível - Reembolso total até 30 dias'
FROM chales 
WHERE ativo = 1 LIMIT 7; -- Para os 7 chalés

-- Exemplo: Adicional para 3º/4º hóspede (R$ 80/noite)
INSERT OR IGNORE INTO precos_adicionais (chale_id, tipo, preco_por_noite, descricao)
SELECT id, 'hospede_extra', 80, '3º ou 4º hóspede com cama extra'
FROM chales 
WHERE ativo = 1 LIMIT 7;
