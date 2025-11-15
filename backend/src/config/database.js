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

