# 🔄 Guia de Migração: SQLite → MySQL

## 📋 Pré-requisitos

1. Servidor MySQL instalado e rodando
2. Banco de dados criado no MySQL
3. Usuário com permissões adequadas

## 🚀 Passo a Passo

### 1. Instalar dependência MySQL

```bash
cd backend
npm install mysql2
```

### 2. Criar arquivo de configuração MySQL

Crie um arquivo `src/config/database-mysql.js`:

```javascript
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
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0
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
```

### 3. Atualizar variáveis de ambiente (.env)

Adicione as configurações do MySQL:

```env
# Banco de Dados MySQL
DB_HOST=localhost
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=viladajuda
DB_PORT=3306

# Ou mantenha SQLite para desenvolvimento
# DB_PATH=./database.sqlite

# Escolha qual banco usar
DB_TYPE=mysql
# DB_TYPE=sqlite
```

### 4. Criar script de migração de dados

Crie `src/scripts/migrarParaMySQL.js`:

```javascript
const sqlite3 = require('sqlite3').verbose();
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config();

async function migrarDados() {
    // Conectar ao SQLite
    const sqliteDb = new sqlite3.Database(path.join(__dirname, '../../database.sqlite'));
    
    // Conectar ao MySQL
    const mysqlConn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('🔄 Iniciando migração de dados...');

        // Migrar Usuários
        const usuarios = await new Promise((resolve, reject) => {
            sqliteDb.all('SELECT * FROM usuarios', (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        for (const usuario of usuarios) {
            await mysqlConn.execute(
                `INSERT INTO usuarios (id, nome, email, senha, role, criado_em, atualizado_em) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [usuario.id, usuario.nome, usuario.email, usuario.senha, usuario.role, usuario.criado_em, usuario.atualizado_em]
            );
        }
        console.log(`✓ ${usuarios.length} usuários migrados`);

        // Migrar Chalés
        const chales = await new Promise((resolve, reject) => {
            sqliteDb.all('SELECT * FROM chales', (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        for (const chale of chales) {
            await mysqlConn.execute(
                `INSERT INTO chales (id, nome, descricao, capacidade_adultos, capacidade_criancas, 
                  preco_diaria, ativo, amenidades, imagens, criado_em, atualizado_em) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [chale.id, chale.nome, chale.descricao, chale.capacidade_adultos, chale.capacidade_criancas,
                 chale.preco_diaria, chale.ativo, chale.amenidades, chale.imagens, chale.criado_em, chale.atualizado_em]
            );
        }
        console.log(`✓ ${chales.length} chalés migrados`);

        // Migrar Reservas
        const reservas = await new Promise((resolve, reject) => {
            sqliteDb.all('SELECT * FROM reservas', (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        for (const reserva of reservas) {
            await mysqlConn.execute(
                `INSERT INTO reservas (id, chale_id, nome_hospede, email_hospede, telefone_hospede,
                  data_checkin, data_checkout, num_adultos, num_criancas, valor_total, status, mensagem,
                  criado_em, atualizado_em) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [reserva.id, reserva.chale_id, reserva.nome_hospede, reserva.email_hospede, reserva.telefone_hospede,
                 reserva.data_checkin, reserva.data_checkout, reserva.num_adultos, reserva.num_criancas,
                 reserva.valor_total, reserva.status, reserva.mensagem, reserva.criado_em, reserva.atualizado_em]
            );
        }
        console.log(`✓ ${reservas.length} reservas migradas`);

        console.log('✅ Migração concluída com sucesso!');
    } catch (error) {
        console.error('❌ Erro na migração:', error);
        throw error;
    } finally {
        sqliteDb.close();
        await mysqlConn.end();
    }
}

migrarDados().catch(console.error);
```

### 5. Atualizar database.js para suportar ambos

Modifique `src/config/database.js` para detectar qual banco usar:

```javascript
require('dotenv').config();

const DB_TYPE = process.env.DB_TYPE || 'sqlite';

let database;

if (DB_TYPE === 'mysql') {
    database = require('./database-mysql');
} else {
    database = require('./database-sqlite');
}

module.exports = database;
```

### 6. Executar migração

```bash
# 1. Criar banco de dados no MySQL
mysql -u root -p
CREATE DATABASE viladajuda CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 2. Executar script de migração
npm run migrate-mysql
```

## ✅ Checklist de Migração

- [ ] MySQL instalado e rodando
- [ ] Banco de dados criado
- [ ] Usuário com permissões configurado
- [ ] Variáveis de ambiente atualizadas
- [ ] Dependência mysql2 instalada
- [ ] Script de migração executado
- [ ] Dados migrados e verificados
- [ ] Testes realizados
- [ ] Backup do SQLite criado

## 🔍 Verificação Pós-Migração

```bash
# Verificar dados no MySQL
mysql -u root -p viladajuda
SELECT COUNT(*) FROM usuarios;
SELECT COUNT(*) FROM chales;
SELECT COUNT(*) FROM reservas;
```

## ⚠️ Importante

1. **Faça backup** do SQLite antes de migrar
2. **Teste localmente** antes de fazer em produção
3. **Mantenha SQLite** para desenvolvimento local
4. **Use MySQL** apenas em produção

