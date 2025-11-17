const sqlite3 = require('sqlite3').verbose();
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config();

async function migrarDados() {
    // Conectar ao SQLite
    const sqliteDb = new sqlite3.Database(path.join(__dirname, '../../database.sqlite'));
    
    // Conectar ao MySQL
    const mysqlConn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'viladajuda',
        port: process.env.DB_PORT || 3306
    });

    try {
        console.log('🔄 Iniciando migração de dados SQLite → MySQL...\n');

        // Limpar tabelas MySQL (opcional - descomente se quiser limpar antes)
        // await mysqlConn.execute('SET FOREIGN_KEY_CHECKS = 0');
        // await mysqlConn.execute('TRUNCATE TABLE reservas');
        // await mysqlConn.execute('TRUNCATE TABLE chales');
        // await mysqlConn.execute('TRUNCATE TABLE usuarios');
        // await mysqlConn.execute('SET FOREIGN_KEY_CHECKS = 1');

        // Migrar Usuários
        const usuarios = await new Promise((resolve, reject) => {
            sqliteDb.all('SELECT * FROM usuarios', (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        if (usuarios.length > 0) {
            for (const usuario of usuarios) {
                await mysqlConn.execute(
                    `INSERT IGNORE INTO usuarios (id, nome, email, senha, role, criado_em, atualizado_em) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [usuario.id, usuario.nome, usuario.email, usuario.senha, usuario.role, usuario.criado_em, usuario.atualizado_em]
                );
            }
            console.log(`✓ ${usuarios.length} usuários migrados`);
        } else {
            console.log('⚠ Nenhum usuário encontrado no SQLite');
        }

        // Migrar Chalés
        const chales = await new Promise((resolve, reject) => {
            sqliteDb.all('SELECT * FROM chales', (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        if (chales.length > 0) {
            for (const chale of chales) {
                await mysqlConn.execute(
                    `INSERT IGNORE INTO chales (id, nome, descricao, capacidade_adultos, capacidade_criancas, 
                      preco_diaria, ativo, amenidades, imagens, criado_em, atualizado_em) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [chale.id, chale.nome, chale.descricao, chale.capacidade_adultos, chale.capacidade_criancas,
                     chale.preco_diaria, chale.ativo ? 1 : 0, chale.amenidades, chale.imagens, chale.criado_em, chale.atualizado_em]
                );
            }
            console.log(`✓ ${chales.length} chalés migrados`);
        } else {
            console.log('⚠ Nenhum chalé encontrado no SQLite');
        }

        // Migrar Reservas
        const reservas = await new Promise((resolve, reject) => {
            sqliteDb.all('SELECT * FROM reservas', (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        if (reservas.length > 0) {
            for (const reserva of reservas) {
                await mysqlConn.execute(
                    `INSERT IGNORE INTO reservas (id, chale_id, nome_hospede, email_hospede, telefone_hospede,
                      data_checkin, data_checkout, num_adultos, num_criancas, valor_total, status, mensagem,
                      criado_em, atualizado_em) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [reserva.id, reserva.chale_id, reserva.nome_hospede, reserva.email_hospede, reserva.telefone_hospede,
                     reserva.data_checkin, reserva.data_checkout, reserva.num_adultos, reserva.num_criancas,
                     reserva.valor_total, reserva.status, reserva.mensagem, reserva.criado_em, reserva.atualizado_em]
                );
            }
            console.log(`✓ ${reservas.length} reservas migradas`);
        } else {
            console.log('⚠ Nenhuma reserva encontrada no SQLite');
        }

        console.log('\n✅ Migração concluída com sucesso!');
        console.log('\n📊 Verifique os dados no MySQL:');
        console.log('   mysql -u root -p viladajuda');
        console.log('   SELECT COUNT(*) FROM usuarios;');
        console.log('   SELECT COUNT(*) FROM chales;');
        console.log('   SELECT COUNT(*) FROM reservas;');
    } catch (error) {
        console.error('\n❌ Erro na migração:', error.message);
        throw error;
    } finally {
        sqliteDb.close();
        await mysqlConn.end();
    }
}

// Executar migração
migrarDados().catch((error) => {
    console.error('Falha na migração:', error);
    process.exit(1);
});

