const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../database.sqlite');

class Database {
    constructor() {
        this.db = null;
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(DB_PATH, (err) => {
                if (err) {
                    console.error('Erro ao conectar ao banco de dados:', err.message);
                    reject(err);
                } else {
                    console.log('Conectado ao banco de dados SQLite');
                    this.initTables()
                        .then(() => resolve())
                        .catch(reject);
                }
            });
        });
    }

    initTables() {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                // Tabela de Usuários (Administradores)
                this.db.run(`
                    CREATE TABLE IF NOT EXISTS usuarios (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        nome VARCHAR(100) NOT NULL,
                        email VARCHAR(100) UNIQUE NOT NULL,
                        senha VARCHAR(255) NOT NULL,
                        role VARCHAR(20) DEFAULT 'admin',
                        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
                        atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                `, (err) => {
                    if (err) console.error('Erro ao criar tabela usuarios:', err.message);
                });

                // Tabela de Chalés
                this.db.run(`
                    CREATE TABLE IF NOT EXISTS chales (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        nome VARCHAR(50) NOT NULL,
                        descricao TEXT,
                        capacidade_adultos INTEGER DEFAULT 2,
                        capacidade_criancas INTEGER DEFAULT 2,
                        preco_diaria DECIMAL(10, 2),
                        ativo BOOLEAN DEFAULT 1,
                        amenidades TEXT,
                        imagens TEXT,
                        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
                        atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                `, (err) => {
                    if (err) console.error('Erro ao criar tabela chales:', err.message);
                });

                // Tabela de Notificações
                this.db.run(`
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
                    )
                `, (err) => {
                    if (err) console.error('Erro ao criar tabela notificacoes:', err.message);
                });

                // Tabela de Políticas de Cancelamento
                this.db.run(`
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
                    )
                `, (err) => {
                    if (err) console.error('Erro ao criar tabela politicas_cancelamento:', err.message);
                });

                // Tabela de Preços Adicionais
                this.db.run(`
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
                    )
                `, (err) => {
                    if (err) console.error('Erro ao criar tabela precos_adicionais:', err.message);
                });

                // Tabela de Temporadas
                this.db.run(`
                    CREATE TABLE IF NOT EXISTS temporadas (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        nome VARCHAR(100) NOT NULL,
                        tipo VARCHAR(20) NOT NULL,
                        data_inicio DATE NOT NULL,
                        data_fim DATE NOT NULL,
                        multiplicador DECIMAL(5, 2) DEFAULT 1.0,
                        descricao TEXT,
                        ativo BOOLEAN DEFAULT 1,
                        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
                        atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                `, (err) => {
                    if (err) console.error('Erro ao criar tabela temporadas:', err.message);
                });

                // Tabela de Preços de Chalés por Temporada
                this.db.run(`
                    CREATE TABLE IF NOT EXISTS chale_temporada_precos (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        chale_id INTEGER,
                        temporada_id INTEGER,
                        preco_diaria DECIMAL(10, 2) NOT NULL,
                        descricao TEXT,
                        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
                        atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
                        UNIQUE(chale_id, temporada_id),
                        FOREIGN KEY (chale_id) REFERENCES chales(id),
                        FOREIGN KEY (temporada_id) REFERENCES temporadas(id)
                    )
                `, (err) => {
                    if (err) console.error('Erro ao criar tabela chale_temporada_precos:', err.message);
                });

                // Tabela de Reservas
                this.db.run(`
                    CREATE TABLE IF NOT EXISTS reservas (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        chale_id INTEGER,
                        nome_hospede VARCHAR(100) NOT NULL,
                        email_hospede VARCHAR(100) NOT NULL,
                        telefone_hospede VARCHAR(20) NOT NULL,
                        data_checkin DATE NOT NULL,
                        data_checkout DATE NOT NULL,
                        num_adultos INTEGER DEFAULT 2,
                        num_criancas INTEGER DEFAULT 0,
                        valor_total DECIMAL(10, 2),
                        status VARCHAR(20) DEFAULT 'pendente',
                        mensagem TEXT,
                        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
                        atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (chale_id) REFERENCES chales(id)
                    )
                `, (err) => {
                    if (err) {
                        console.error('Erro ao criar tabela reservas:', err.message);
                        reject(err);
                    } else {
                        console.log('Tabelas criadas/verificadas com sucesso');
                        resolve();
                    }
                });
            });
        });
    }

    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
                }
            });
        });
    }

    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('Conexão com o banco de dados fechada');
                    resolve();
                }
            });
        });
    }
}

const database = new Database();
module.exports = database;

