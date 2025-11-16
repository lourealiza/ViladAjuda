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

            // Tabela de Reservas
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS reservas (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    chale_id INT,
                    nome_hospede VARCHAR(100) NOT NULL,
                    email_hospede VARCHAR(100) NOT NULL,
                    telefone_hospede VARCHAR(20) NOT NULL,
                    data_checkin DATE NOT NULL,
                    data_checkout DATE NOT NULL,
                    num_adultos INT DEFAULT 2,
                    num_criancas INT DEFAULT 0,
                    valor_total DECIMAL(10, 2),
                    status VARCHAR(20) DEFAULT 'pendente',
                    mensagem TEXT,
                    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
                    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (chale_id) REFERENCES chales(id) ON DELETE SET NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);

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

