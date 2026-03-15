-- Tabela de Notificações
CREATE TABLE IF NOT EXISTS notificacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo TEXT NOT NULL,
    descricao TEXT,
    usuario_id INTEGER,
    chale_id INTEGER,
    reserva_id INTEGER,
    pagamento_id INTEGER,
    titulo TEXT NOT NULL,
    conteudo TEXT NOT NULL,
    canais_entrega TEXT,
    status TEXT DEFAULT 'pendente',
    dados_extra TEXT,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_envio DATETIME,
    tentativas_envio INTEGER DEFAULT 0,
    proximo_envio DATETIME,
    lido_em DATETIME,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (chale_id) REFERENCES chales(id) ON DELETE SET NULL,
    FOREIGN KEY (reserva_id) REFERENCES reservas(id) ON DELETE SET NULL,
    FOREIGN KEY (pagamento_id) REFERENCES pagamentos(id) ON DELETE SET NULL
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario ON notificacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_status ON notificacoes(status);
CREATE INDEX IF NOT EXISTS idx_notificacoes_tipo ON notificacoes(tipo);
CREATE INDEX IF NOT EXISTS idx_notificacoes_data_criacao ON notificacoes(data_criacao DESC);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lido ON notificacoes(usuario_id, lido_em);
CREATE INDEX IF NOT EXISTS idx_notificacoes_pendentes ON notificacoes(status, proximo_envio) WHERE status = 'pendente';
