#!/usr/bin/env node

/**
 * Script para criar tabelas faltantes no MySQL
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

const criarTabelasFaltantes = async () => {
    let connection;
    try {
        console.log('Conectando ao MySQL...');

        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'viladajuda',
            port: process.env.DB_PORT || 3306
        });

        console.log('✓ Conectado ao banco de dados\n');

        // Tabela de Notificações
        console.log('Criando tabela notificacoes...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS notificacoes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                tipo ENUM('email', 'sms', 'push', 'webhook') DEFAULT 'email',
                destinatario VARCHAR(255) NOT NULL,
                assunto VARCHAR(255),
                mensagem TEXT NOT NULL,
                template VARCHAR(100),
                dados_dinamicos JSON,
                status ENUM('pendente', 'enviado', 'falha', 'cancelado') DEFAULT 'pendente',
                tentativas INT DEFAULT 0,
                proxima_tentativa INT DEFAULT 0,
                proximo_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
                data_envio DATETIME,
                motivo_falha TEXT,
                reserva_id INT,
                usuario_id INT,
                referencia VARCHAR(100),
                prioritario BOOLEAN DEFAULT FALSE,
                data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
                data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_status (status),
                INDEX idx_tipo (tipo),
                INDEX idx_proximo_envio (proximo_envio),
                INDEX idx_reserva (reserva_id),
                INDEX idx_usuario (usuario_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✓ Tabela notificacoes criada\n');

        // Tabela de Avaliacões
        console.log('Criando tabela avaliacoes...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS avaliacoes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                reserva_id INT,
                chale_id INT NOT NULL,
                hospede_id INT,
                nome_hospede VARCHAR(100),
                email_hospede VARCHAR(100),
                rating INT CHECK (rating >= 1 AND rating <= 5),
                comentario TEXT,
                aspectos_positivos TEXT,
                aspectos_negativos TEXT,
                respondido_por INT,
                resposta_gerente TEXT,
                data_resposta DATETIME,
                util INT DEFAULT 0,
                nao_util INT DEFAULT 0,
                ativo BOOLEAN DEFAULT TRUE,
                data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
                data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (chale_id) REFERENCES chales(id) ON DELETE CASCADE,
                FOREIGN KEY (reserva_id) REFERENCES reservas(id) ON DELETE SET NULL,
                FOREIGN KEY (hospede_id) REFERENCES hospedes(id) ON DELETE SET NULL,
                FOREIGN KEY (respondido_por) REFERENCES usuarios(id) ON DELETE SET NULL,
                INDEX idx_rating (rating),
                INDEX idx_chale (chale_id),
                INDEX idx_ativo (ativo),
                INDEX idx_data (data_criacao)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✓ Tabela avaliacoes criada\n');

        // Tabela de Logs
        console.log('Criando tabela logs...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                tipo_evento VARCHAR(100) NOT NULL,
                nivel ENUM('debug', 'info', 'warning', 'error', 'critical') DEFAULT 'info',
                descricao TEXT,
                usuario_id INT,
                reserva_id INT,
                dados_adicionais JSON,
                ip_address VARCHAR(45),
                user_agent TEXT,
                url TEXT,
                data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
                FOREIGN KEY (reserva_id) REFERENCES reservas(id) ON DELETE SET NULL,
                INDEX idx_tipo (tipo_evento),
                INDEX idx_nivel (nivel),
                INDEX idx_usuario (usuario_id),
                INDEX idx_data (data_criacao)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✓ Tabela logs criada\n');

        console.log('✅ Todas as tabelas criadas com sucesso!');

    } catch (erro) {
        console.error('❌ Erro ao criar tabelas:', erro.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};

criarTabelasFaltantes();
