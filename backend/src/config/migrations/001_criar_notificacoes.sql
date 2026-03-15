-- Tabela de Notificações
CREATE TABLE IF NOT EXISTS notificacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo TEXT NOT NULL COMMENT 'Tipo de notificação (nova_reserva, confirmacao_pagamento, etc)',
    descricao TEXT COMMENT 'Descrição da notificação',
    usuario_id INTEGER COMMENT 'ID do usuário que receberá a notificação',
    chale_id INTEGER COMMENT 'ID do chalé relacionado (se aplicável)',
    reserva_id INTEGER COMMENT 'ID da reserva relacionada (se aplicável)',
    pagamento_id INTEGER COMMENT 'ID do pagamento relacionado (se aplicável)',
    titulo TEXT NOT NULL COMMENT 'Título da notificação',
    conteudo TEXT NOT NULL COMMENT 'Conteúdo/corpo da notificação',
    canais_entrega TEXT COMMENT 'Canais por onde enviar (email,in_app,push,webhook,sms)',
    status TEXT DEFAULT 'pendente' COMMENT 'Status (pendente, enviada, lida, erro, cancelada)',
    dados_extra JSON COMMENT 'Dados adicionais em formato JSON',
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Data de criação',
    data_envio DATETIME COMMENT 'Data de envio real',
    tentativas_envio INTEGER DEFAULT 0 COMMENT 'Número de tentativas de envio',
    proximo_envio DATETIME COMMENT 'Próxima tentativa de envio',
    lido_em DATETIME COMMENT 'Data e hora em que foi lida',
    
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
