const mysql = require('mysql2/promise');
require('dotenv').config();

class Database {
    constructor() {
        this.pool = null;
    }

    async connect() {
        try {
            this.pool = mysql.createPool({
                host: process.env.DB_HOST || 'localhost',
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                database: process.env.DB_NAME || 'viladajuda',
                port: process.env.DB_PORT || 3306,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0,
                charset: 'utf8mb4'
            });

            // Testar conexão
            const connection = await this.pool.getConnection();
            console.log('Conectado ao banco de dados MySQL');
            connection.release();

            await this.initTables();
        } catch (err) {
            console.error('Erro ao conectar ao banco de dados:', err.message);
            throw err;
        }
    }

    async initTables() {
        const connection = await this.pool.getConnection();
        
        try {
            // Tabela de Usuários
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS usuarios (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    nome VARCHAR(100) NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    senha VARCHAR(255) NOT NULL,
                    role VARCHAR(20) DEFAULT 'admin',
                    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
                    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);

            // Tabela de Chalés
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS chales (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    nome VARCHAR(50) NOT NULL,
                    descricao TEXT,
                    capacidade_adultos INT DEFAULT 2,
                    capacidade_criancas INT DEFAULT 2,
                    preco_diaria DECIMAL(10, 2),
                    ativo BOOLEAN DEFAULT TRUE,
                    amenidades TEXT,
                    imagens TEXT,
                    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
                    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);

            // Tabela de Temporadas
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS temporadas (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    nome VARCHAR(100) NOT NULL,
                    tipo ENUM('baixa', 'media', 'alta', 'feriado') DEFAULT 'media',
                    data_inicio DATE NOT NULL,
                    data_fim DATE NOT NULL,
                    multiplicador DECIMAL(5, 2) DEFAULT 1.00,
                    diaria_minima INT DEFAULT 1,
                    dias_checkin_permitidos VARCHAR(50) DEFAULT NULL,
                    ativo BOOLEAN DEFAULT TRUE,
                    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
                    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);

            // Adicionar coluna tipo se não existir
            try {
                const [columns] = await connection.execute(`
                    SELECT COLUMN_NAME 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_SCHEMA = DATABASE() 
                    AND TABLE_NAME = 'temporadas' 
                    AND COLUMN_NAME = 'tipo'
                `);
                
                if (columns.length === 0) {
                    await connection.execute(`
                        ALTER TABLE temporadas 
                        ADD COLUMN tipo ENUM('baixa', 'media', 'alta', 'feriado') DEFAULT 'media' AFTER nome
                    `);
                }
            } catch (err) {
                console.log('Coluna tipo já existe ou erro ao adicionar:', err.message);
            }

            // Adicionar colunas se não existirem
            try {
                const [columns] = await connection.execute(`
                    SELECT COLUMN_NAME 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_SCHEMA = DATABASE() 
                    AND TABLE_NAME = 'temporadas'
                `);
                
                const colunasExistentes = columns.map(c => c.COLUMN_NAME);
                
                if (!colunasExistentes.includes('diaria_minima')) {
                    await connection.execute(`
                        ALTER TABLE temporadas 
                        ADD COLUMN diaria_minima INT DEFAULT 1 AFTER multiplicador
                    `);
                }
                
                if (!colunasExistentes.includes('dias_checkin_permitidos')) {
                    await connection.execute(`
                        ALTER TABLE temporadas 
                        ADD COLUMN dias_checkin_permitidos VARCHAR(50) DEFAULT NULL AFTER diaria_minima
                    `);
                }
            } catch (err) {
                console.log('Colunas já existem ou erro ao adicionar:', err.message);
            }

            // Tabela de Feriados (com override de preço)
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS feriados (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    nome VARCHAR(100) NOT NULL,
                    data DATE NOT NULL,
                    tipo ENUM('nacional', 'estadual', 'municipal', 'especial') DEFAULT 'nacional',
                    multiplicador DECIMAL(5, 2) DEFAULT 1.50,
                    preco_override DECIMAL(10, 2) DEFAULT NULL,
                    override_por_chale BOOLEAN DEFAULT FALSE,
                    ativo BOOLEAN DEFAULT TRUE,
                    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
                    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    UNIQUE KEY unique_feriado_data (data)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);

            // Adicionar colunas de override se não existirem
            try {
                const [columns] = await connection.execute(`
                    SELECT COLUMN_NAME 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_SCHEMA = DATABASE() 
                    AND TABLE_NAME = 'feriados'
                `);
                
                const colunasExistentes = columns.map(c => c.COLUMN_NAME);
                
                if (!colunasExistentes.includes('preco_override')) {
                    await connection.execute(`
                        ALTER TABLE feriados 
                        ADD COLUMN preco_override DECIMAL(10, 2) DEFAULT NULL AFTER multiplicador
                    `);
                }
                
                if (!colunasExistentes.includes('override_por_chale')) {
                    await connection.execute(`
                        ALTER TABLE feriados 
                        ADD COLUMN override_por_chale BOOLEAN DEFAULT FALSE AFTER preco_override
                    `);
                }
            } catch (err) {
                console.log('Colunas já existem ou erro ao adicionar:', err.message);
            }

            // Tabela de Preços por Chalé/Temporada
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS chale_temporada_precos (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    chale_id INT NOT NULL,
                    temporada_id INT NOT NULL,
                    preco_base DECIMAL(10, 2) NOT NULL,
                    ativo BOOLEAN DEFAULT TRUE,
                    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
                    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (chale_id) REFERENCES chales(id) ON DELETE CASCADE,
                    FOREIGN KEY (temporada_id) REFERENCES temporadas(id) ON DELETE CASCADE,
                    UNIQUE KEY unique_chale_temporada (chale_id, temporada_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);

            // Tabela de Regras de Tarifação
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS regras_tarifacao (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    chale_id INT,
                    nome VARCHAR(100) NOT NULL,
                    tipo ENUM('pessoa_extra', 'crianca_gratis', 'crianca_desconto') NOT NULL,
                    limite_pessoas_base INT DEFAULT 2,
                    valor_adicional DECIMAL(10, 2) DEFAULT 0,
                    idade_maxima_crianca INT DEFAULT NULL,
                    desconto_crianca_percentual DECIMAL(5, 2) DEFAULT NULL,
                    desconto_crianca_fixo DECIMAL(10, 2) DEFAULT NULL,
                    ativo BOOLEAN DEFAULT TRUE,
                    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
                    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (chale_id) REFERENCES chales(id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);

            // Tabela de Override de Preços por Data Específica
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS precos_override (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    chale_id INT,
                    data DATE NOT NULL,
                    preco_override DECIMAL(10, 2) NOT NULL,
                    motivo VARCHAR(255),
                    ativo BOOLEAN DEFAULT TRUE,
                    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
                    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (chale_id) REFERENCES chales(id) ON DELETE CASCADE,
                    UNIQUE KEY unique_chale_data (chale_id, data)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);

            // Tabela de Cupons (melhorada para campanhas)
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS cupons (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    codigo VARCHAR(50) UNIQUE NOT NULL,
                    tipo ENUM('percentual', 'fixo') DEFAULT 'percentual',
                    valor DECIMAL(10, 2) NOT NULL,
                    valor_minimo DECIMAL(10, 2) DEFAULT 0,
                    data_inicio DATE,
                    data_fim DATE,
                    limite_uso INT DEFAULT NULL,
                    usado INT DEFAULT 0,
                    campanha VARCHAR(100),
                    temporada_aplicavel VARCHAR(50),
                    chale_id INT,
                    ativo BOOLEAN DEFAULT TRUE,
                    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
                    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (chale_id) REFERENCES chales(id) ON DELETE SET NULL,
                    INDEX idx_campanha (campanha),
                    INDEX idx_temporada (temporada_aplicavel)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);

            // Adicionar colunas de campanha se não existirem
            try {
                const [columns] = await connection.execute(`
                    SELECT COLUMN_NAME 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_SCHEMA = DATABASE() 
                    AND TABLE_NAME = 'cupons'
                `);
                
                const colunasExistentes = columns.map(c => c.COLUMN_NAME);
                
                if (!colunasExistentes.includes('campanha')) {
                    await connection.execute(`
                        ALTER TABLE cupons 
                        ADD COLUMN campanha VARCHAR(100) DEFAULT NULL AFTER usado
                    `);
                }
                
                if (!colunasExistentes.includes('temporada_aplicavel')) {
                    await connection.execute(`
                        ALTER TABLE cupons 
                        ADD COLUMN temporada_aplicavel VARCHAR(50) DEFAULT NULL AFTER campanha
                    `);
                }
                
                if (!colunasExistentes.includes('chale_id')) {
                    await connection.execute(`
                        ALTER TABLE cupons 
                        ADD COLUMN chale_id INT DEFAULT NULL AFTER temporada_aplicavel,
                        ADD FOREIGN KEY (chale_id) REFERENCES chales(id) ON DELETE SET NULL
                    `);
                }
            } catch (err) {
                console.log('Colunas já existem ou erro ao adicionar:', err.message);
            }

            // Tabela de Bloqueios (para bloqueio automático/manual de períodos)
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS bloqueios (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    chale_id INT,
                    data_inicio DATE NOT NULL,
                    data_fim DATE NOT NULL,
                    motivo VARCHAR(255),
                    tipo ENUM('manutencao', 'reservado', 'bloqueado', 'outro') DEFAULT 'bloqueado',
                    criado_por INT,
                    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (chale_id) REFERENCES chales(id) ON DELETE CASCADE,
                    FOREIGN KEY (criado_por) REFERENCES usuarios(id) ON DELETE SET NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);

            // Tabela de Hóspedes (CRM)
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS hospedes (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    nome VARCHAR(100) NOT NULL,
                    email VARCHAR(100),
                    telefone VARCHAR(20),
                    cpf VARCHAR(14),
                    data_nascimento DATE,
                    endereco TEXT,
                    cidade VARCHAR(100),
                    estado VARCHAR(2),
                    cep VARCHAR(10),
                    origem_canal VARCHAR(50),
                    como_nos_encontrou VARCHAR(100),
                    notas_internas TEXT,
                    observacoes TEXT,
                    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
                    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_email (email),
                    INDEX idx_telefone (telefone),
                    INDEX idx_cidade (cidade),
                    INDEX idx_origem (origem_canal)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);
            
            // Adicionar colunas se não existirem
            try {
                const [columns] = await connection.execute(`
                    SELECT COLUMN_NAME 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_SCHEMA = DATABASE() 
                    AND TABLE_NAME = 'hospedes'
                `);
                
                const colunasExistentes = columns.map(c => c.COLUMN_NAME);
                
                if (!colunasExistentes.includes('como_nos_encontrou')) {
                    await connection.execute(`
                        ALTER TABLE hospedes 
                        ADD COLUMN como_nos_encontrou VARCHAR(100) DEFAULT NULL AFTER origem_canal
                    `);
                }
                
                if (!colunasExistentes.includes('notas_internas')) {
                    await connection.execute(`
                        ALTER TABLE hospedes 
                        ADD COLUMN notas_internas TEXT DEFAULT NULL AFTER como_nos_encontrou
                    `);
                }
            } catch (err) {
                console.log('Colunas já existem ou erro ao adicionar:', err.message);
            }

            // Tabela de Reservas (atualizada com novos campos)
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS reservas (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    chale_id INT,
                    hospede_id INT,
                    nome_hospede VARCHAR(100) NOT NULL,
                    email_hospede VARCHAR(100) NOT NULL,
                    telefone_hospede VARCHAR(20) NOT NULL,
                    data_checkin DATE NOT NULL,
                    data_checkout DATE NOT NULL,
                    num_adultos INT DEFAULT 2,
                    num_criancas INT DEFAULT 0,
                    num_diarias INT DEFAULT 1,
                    diaria_minima INT DEFAULT 1,
                    valor_diaria DECIMAL(10, 2),
                    valor_subtotal DECIMAL(10, 2),
                    valor_desconto DECIMAL(10, 2) DEFAULT 0,
                    cupom_id INT,
                    valor_total DECIMAL(10, 2),
                    valor_sinal DECIMAL(10, 2) DEFAULT 0,
                    status ENUM('solicitacao_recebida', 'aguardando_pagamento', 'confirmada', 'checkin_realizado', 'checkout_realizado', 'cancelada') DEFAULT 'solicitacao_recebida',
                    forma_pagamento VARCHAR(50),
                    cidade_hospede VARCHAR(100),
                    observacoes TEXT,
                    mensagem TEXT,
                    origem_canal VARCHAR(50),
                    consentimento_lgpd BOOLEAN DEFAULT FALSE,
                    politica_privacidade_aceita BOOLEAN DEFAULT FALSE,
                    data_consentimento DATETIME DEFAULT NULL,
                    utm_source VARCHAR(100),
                    utm_medium VARCHAR(100),
                    utm_campaign VARCHAR(100),
                    utm_term VARCHAR(100),
                    utm_content VARCHAR(100),
                    gclid VARCHAR(255),
                    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
                    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (chale_id) REFERENCES chales(id) ON DELETE SET NULL,
                    FOREIGN KEY (hospede_id) REFERENCES hospedes(id) ON DELETE SET NULL,
                    FOREIGN KEY (cupom_id) REFERENCES cupons(id) ON DELETE SET NULL,
                    INDEX idx_status (status),
                    INDEX idx_datas (data_checkin, data_checkout)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);

            // Adicionar colunas se não existirem
            try {
                const [columns] = await connection.execute(`
                    SELECT COLUMN_NAME 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_SCHEMA = DATABASE() 
                    AND TABLE_NAME = 'reservas'
                `);
                
                const colunasExistentes = columns.map(c => c.COLUMN_NAME);
                
                if (!colunasExistentes.includes('valor_sinal')) {
                    await connection.execute(`
                        ALTER TABLE reservas 
                        ADD COLUMN valor_sinal DECIMAL(10, 2) DEFAULT 0 AFTER valor_total
                    `);
                }
                
                if (!colunasExistentes.includes('forma_pagamento')) {
                    await connection.execute(`
                        ALTER TABLE reservas 
                        ADD COLUMN forma_pagamento VARCHAR(50) DEFAULT NULL AFTER status
                    `);
                }
                
                if (!colunasExistentes.includes('cidade_hospede')) {
                    await connection.execute(`
                        ALTER TABLE reservas 
                        ADD COLUMN cidade_hospede VARCHAR(100) DEFAULT NULL AFTER telefone_hospede
                    `);
                }
                
                if (!colunasExistentes.includes('observacoes')) {
                    await connection.execute(`
                        ALTER TABLE reservas 
                        ADD COLUMN observacoes TEXT DEFAULT NULL AFTER forma_pagamento
                    `);
                }
                
                if (!colunasExistentes.includes('consentimento_lgpd')) {
                    await connection.execute(`
                        ALTER TABLE reservas 
                        ADD COLUMN consentimento_lgpd BOOLEAN DEFAULT FALSE AFTER origem_canal
                    `);
                }
                
                if (!colunasExistentes.includes('politica_privacidade_aceita')) {
                    await connection.execute(`
                        ALTER TABLE reservas 
                        ADD COLUMN politica_privacidade_aceita BOOLEAN DEFAULT FALSE AFTER consentimento_lgpd
                    `);
                }
                
                if (!colunasExistentes.includes('data_consentimento')) {
                    await connection.execute(`
                        ALTER TABLE reservas 
                        ADD COLUMN data_consentimento DATETIME DEFAULT NULL AFTER politica_privacidade_aceita
                    `);
                }
            } catch (err) {
                console.log('Colunas já existem ou erro ao adicionar:', err.message);
            }

            // Tabela de Pagamentos (simplificada - nível 1)
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS pagamentos (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    reserva_id INT NOT NULL,
                    tipo ENUM('pix', 'cartao_credito', 'cartao_debito', 'boleto', 'dinheiro', 'manual') DEFAULT 'pix',
                    valor DECIMAL(10, 2) NOT NULL,
                    status ENUM('pendente', 'pago') DEFAULT 'pendente',
                    chave_pix VARCHAR(255),
                    observacoes TEXT,
                    processado_por INT,
                    data_pagamento DATETIME,
                    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
                    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (reserva_id) REFERENCES reservas(id) ON DELETE CASCADE,
                    FOREIGN KEY (processado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
                    INDEX idx_status (status),
                    INDEX idx_reserva (reserva_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);

            // Tabela de Conteúdo CMS
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS conteudos (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    tipo ENUM('faq', 'texto', 'pagina', 'banner', 'landing_page', 'secao', 'galeria', 'outro') NOT NULL,
                    titulo VARCHAR(255) NOT NULL,
                    slug VARCHAR(255) UNIQUE NOT NULL,
                    conteudo TEXT,
                    resumo TEXT,
                    imagem VARCHAR(255),
                    galeria TEXT,
                    ordem INT DEFAULT 0,
                    ativo BOOLEAN DEFAULT TRUE,
                    meta_title VARCHAR(255),
                    meta_description TEXT,
                    beneficios TEXT,
                    call_to_action TEXT,
                    filtros_preenchidos TEXT,
                    data_inicio DATE,
                    data_fim DATE,
                    secao VARCHAR(50),
                    chale_id INT,
                    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
                    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_tipo (tipo),
                    INDEX idx_slug (slug),
                    INDEX idx_secao (secao),
                    INDEX idx_chale (chale_id),
                    INDEX idx_datas (data_inicio, data_fim),
                    FOREIGN KEY (chale_id) REFERENCES chales(id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);
            
            // Adicionar colunas se não existirem
            try {
                const [columns] = await connection.execute(`
                    SELECT COLUMN_NAME 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_SCHEMA = DATABASE() 
                    AND TABLE_NAME = 'conteudos'
                `);
                
                const colunasExistentes = columns.map(c => c.COLUMN_NAME);
                
                const novasColunas = [
                    { nome: 'beneficios', tipo: 'TEXT DEFAULT NULL AFTER meta_description' },
                    { nome: 'call_to_action', tipo: 'TEXT DEFAULT NULL AFTER beneficios' },
                    { nome: 'filtros_preenchidos', tipo: 'TEXT DEFAULT NULL AFTER call_to_action' },
                    { nome: 'data_inicio', tipo: 'DATE DEFAULT NULL AFTER filtros_preenchidos' },
                    { nome: 'data_fim', tipo: 'DATE DEFAULT NULL AFTER data_inicio' },
                    { nome: 'secao', tipo: 'VARCHAR(50) DEFAULT NULL AFTER data_fim' },
                    { nome: 'chale_id', tipo: 'INT DEFAULT NULL AFTER secao' }
                ];
                
                for (const coluna of novasColunas) {
                    if (!colunasExistentes.includes(coluna.nome)) {
                        await connection.execute(`
                            ALTER TABLE conteudos 
                            ADD COLUMN ${coluna.nome} ${coluna.tipo}
                        `);
                    }
                }
                
                // Adicionar foreign key se não existir
                if (colunasExistentes.includes('chale_id')) {
                    try {
                        // Verificar se a foreign key já existe
                        const [fks] = await connection.execute(`
                            SELECT CONSTRAINT_NAME 
                            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                            WHERE TABLE_SCHEMA = DATABASE() 
                            AND TABLE_NAME = 'conteudos' 
                            AND COLUMN_NAME = 'chale_id'
                            AND REFERENCED_TABLE_NAME IS NOT NULL
                        `);
                        
                        if (fks.length === 0) {
                            await connection.execute(`
                                ALTER TABLE conteudos 
                                ADD FOREIGN KEY (chale_id) REFERENCES chales(id) ON DELETE CASCADE
                            `);
                        }
                    } catch (err) {
                        console.log('Foreign key já existe ou erro:', err.message);
                    }
                }
            } catch (err) {
                console.log('Colunas já existem ou erro ao adicionar:', err.message);
            }

            // Tabela de Tracking/Eventos
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS eventos_tracking (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    tipo_evento VARCHAR(50) NOT NULL,
                    categoria ENUM('pageview', 'conversao', 'interacao', 'erro', 'outro') DEFAULT 'interacao',
                    reserva_id INT,
                    sessao_id VARCHAR(255),
                    ip_address VARCHAR(45),
                    user_agent TEXT,
                    url TEXT,
                    referrer TEXT,
                    utm_source VARCHAR(100),
                    utm_medium VARCHAR(100),
                    utm_campaign VARCHAR(100),
                    utm_term VARCHAR(100),
                    utm_content VARCHAR(100),
                    gclid VARCHAR(255),
                    dados_adicionais TEXT,
                    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (reserva_id) REFERENCES reservas(id) ON DELETE SET NULL,
                    INDEX idx_tipo (tipo_evento),
                    INDEX idx_categoria (categoria),
                    INDEX idx_data (criado_em)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);

            // Tabela de Avaliações do Google Business
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS avaliacoes_google (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    nome_autor VARCHAR(100) NOT NULL,
                    foto_autor VARCHAR(255),
                    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
                    texto TEXT,
                    data_avaliacao DATE,
                    origem ENUM('google_business', 'manual') DEFAULT 'manual',
                    google_review_id VARCHAR(255),
                    sincronizado_em DATETIME,
                    ativo BOOLEAN DEFAULT TRUE,
                    ordem INT DEFAULT 0,
                    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
                    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_rating (rating),
                    INDEX idx_ativo (ativo),
                    INDEX idx_ordem (ordem),
                    INDEX idx_google_id (google_review_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);

            // Tabela de Logs de Acesso (LGPD)
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS logs_acesso (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    usuario_id INT,
                    acao VARCHAR(100) NOT NULL,
                    tabela_afetada VARCHAR(50),
                    registro_id INT,
                    dados_antes TEXT,
                    dados_depois TEXT,
                    ip_address VARCHAR(45),
                    user_agent TEXT,
                    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
                    INDEX idx_usuario (usuario_id),
                    INDEX idx_acao (acao),
                    INDEX idx_data (criado_em)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);

            // Tabela de Backups (metadados)
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS backups (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    tipo ENUM('completo', 'incremental', 'dados', 'config') NOT NULL,
                    arquivo VARCHAR(255) NOT NULL,
                    tamanho BIGINT,
                    tabelas TEXT,
                    status ENUM('em_andamento', 'concluido', 'erro') DEFAULT 'em_andamento',
                    observacoes TEXT,
                    criado_por INT,
                    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (criado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
                    INDEX idx_status (status),
                    INDEX idx_data (criado_em)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);

            // Tabela de Permissões (RBAC)
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS permissoes (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    nome VARCHAR(50) UNIQUE NOT NULL,
                    descricao TEXT,
                    recurso VARCHAR(50) NOT NULL,
                    acao VARCHAR(50) NOT NULL,
                    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);

            // Tabela de Roles (papéis)
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS roles (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    nome VARCHAR(50) UNIQUE NOT NULL,
                    descricao TEXT,
                    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
                    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);

            // Tabela de Relação Role-Permissão
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS role_permissoes (
                    role_id INT NOT NULL,
                    permissao_id INT NOT NULL,
                    PRIMARY KEY (role_id, permissao_id),
                    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
                    FOREIGN KEY (permissao_id) REFERENCES permissoes(id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);

            // Adicionar role_id à tabela usuarios se não existir
            try {
                const [columns] = await connection.execute(`
                    SELECT COLUMN_NAME 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_SCHEMA = DATABASE() 
                    AND TABLE_NAME = 'usuarios' 
                    AND COLUMN_NAME = 'role_id'
                `);
                
                if (columns.length === 0) {
                    await connection.execute(`
                        ALTER TABLE usuarios 
                        ADD COLUMN role_id INT,
                        ADD CONSTRAINT fk_usuario_role 
                        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
                    `);
                }
            } catch (err) {
                // Ignora erro se a coluna já existir ou constraint já existe
                console.log('Coluna role_id já existe ou erro ao adicionar:', err.message);
            }

            console.log('Tabelas criadas/verificadas com sucesso');
        } catch (err) {
            console.error('Erro ao criar tabelas:', err.message);
            throw err;
        } finally {
            connection.release();
        }
    }

    async run(sql, params = []) {
        const [result] = await this.pool.execute(sql, params);
        return { 
            id: result.insertId, 
            changes: result.affectedRows 
        };
    }

    async get(sql, params = []) {
        const [rows] = await this.pool.execute(sql, params);
        return rows[0] || null;
    }

    async all(sql, params = []) {
        const [rows] = await this.pool.execute(sql, params);
        return rows;
    }

    async close() {
        if (this.pool) {
            await this.pool.end();
            console.log('Conexão com o banco de dados fechada');
        }
    }
}

const database = new Database();
module.exports = database;

