const database = require('../config/database');
const fs = require('fs').promises;
const path = require('path');
const mysql = require('mysql2/promise');

class BackupService {
    /**
     * Criar backup completo do banco de dados
     */
    static async criarBackupCompleto(usuarioId = null) {
        const {
            DB_HOST,
            DB_USER,
            DB_PASSWORD,
            DB_NAME,
            BACKUP_DIR = './backups'
        } = process.env;

        try {
            // Criar diretório de backups se não existir
            await fs.mkdir(BACKUP_DIR, { recursive: true });

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const nomeArquivo = `backup_completo_${timestamp}.sql`;
            const caminhoArquivo = path.join(BACKUP_DIR, nomeArquivo);

            // Criar conexão MySQL
            const connection = await mysql.createConnection({
                host: DB_HOST,
                user: DB_USER,
                password: DB_PASSWORD,
                database: DB_NAME
            });

            // Registrar início do backup
            const backup = await this._registrarBackup({
                tipo: 'completo',
                arquivo: nomeArquivo,
                status: 'em_andamento',
                criado_por: usuarioId
            });

            try {
                // Usar mysqldump via execução de comando
                const { exec } = require('child_process');
                const { promisify } = require('util');
                const execAsync = promisify(exec);

                const comando = `mysqldump -h ${DB_HOST} -u ${DB_USER} -p${DB_PASSWORD} ${DB_NAME} > "${caminhoArquivo}"`;

                await execAsync(comando);

                // Obter tamanho do arquivo
                const stats = await fs.stat(caminhoArquivo);
                const tamanho = stats.size;

                // Atualizar registro do backup
                await this._atualizarBackup(backup.id, {
                    status: 'concluido',
                    tamanho: tamanho
                });

                return {
                    id: backup.id,
                    arquivo: nomeArquivo,
                    caminho: caminhoArquivo,
                    tamanho: tamanho,
                    status: 'concluido'
                };
            } catch (erro) {
                await this._atualizarBackup(backup.id, {
                    status: 'erro',
                    observacoes: erro.message
                });
                throw erro;
            } finally {
                await connection.end();
            }
        } catch (erro) {
            console.error('Erro ao criar backup:', erro);
            throw erro;
        }
    }

    /**
     * Criar backup incremental (apenas dados modificados)
     */
    static async criarBackupIncremental(usuarioId = null, dataDesde = null) {
        // Implementação simplificada - pode ser expandida
        return await this.criarBackupCompleto(usuarioId);
    }

    /**
     * Listar backups disponíveis
     */
    static async listarBackups(filtros = {}) {
        const database = require('../config/database');
        let sql = `
            SELECT b.*, u.nome as criado_por_nome, u.email as criado_por_email
            FROM backups b
            LEFT JOIN usuarios u ON b.criado_por = u.id
            WHERE 1=1
        `;
        const params = [];

        if (filtros.status) {
            sql += ' AND b.status = ?';
            params.push(filtros.status);
        }

        if (filtros.tipo) {
            sql += ' AND b.tipo = ?';
            params.push(filtros.tipo);
        }

        sql += ' ORDER BY b.criado_em DESC LIMIT 100';

        return database.all(sql, params);
    }

    /**
     * Restaurar backup
     */
    static async restaurarBackup(backupId, usuarioId = null) {
        const {
            DB_HOST,
            DB_USER,
            DB_PASSWORD,
            DB_NAME,
            BACKUP_DIR = './backups'
        } = process.env;

        try {
            const backup = await this._buscarBackupPorId(backupId);
            if (!backup) {
                throw new Error('Backup não encontrado');
            }

            const caminhoArquivo = path.join(BACKUP_DIR, backup.arquivo);

            // Verificar se arquivo existe
            await fs.access(caminhoArquivo);

            // Restaurar usando mysql
            const { exec } = require('child_process');
            const { promisify } = require('util');
            const execAsync = promisify(exec);

            const comando = `mysql -h ${DB_HOST} -u ${DB_USER} -p${DB_PASSWORD} ${DB_NAME} < "${caminhoArquivo}"`;

            await execAsync(comando);

            // Registrar restauração
            await this._registrarBackup({
                tipo: 'restauracao',
                arquivo: backup.arquivo,
                status: 'concluido',
                observacoes: `Restaurado do backup #${backupId}`,
                criado_por: usuarioId
            });

            return { sucesso: true, mensagem: 'Backup restaurado com sucesso' };
        } catch (erro) {
            console.error('Erro ao restaurar backup:', erro);
            throw erro;
        }
    }

    /**
     * Agendar backup automático (deve ser executado via cron)
     */
    static async executarBackupAutomatico() {
        try {
            const backup = await this.criarBackupCompleto(null);
            
            // Manter apenas últimos 30 backups
            await this._limparBackupsAntigos(30);

            return backup;
        } catch (erro) {
            console.error('Erro no backup automático:', erro);
            throw erro;
        }
    }

    /**
     * Métodos privados
     */
    static async _registrarBackup(dados) {
        const database = require('../config/database');
        const sql = `
            INSERT INTO backups (tipo, arquivo, tamanho, status, observacoes, criado_por)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const params = [
            dados.tipo,
            dados.arquivo,
            dados.tamanho || null,
            dados.status || 'em_andamento',
            dados.observacoes || null,
            dados.criado_por || null
        ];

        const result = await database.run(sql, params);
        return await this._buscarBackupPorId(result.id);
    }

    static async _buscarBackupPorId(id) {
        const database = require('../config/database');
        const sql = 'SELECT * FROM backups WHERE id = ?';
        return database.get(sql, [id]);
    }

    static async _atualizarBackup(id, dados) {
        const database = require('../config/database');
        const campos = [];
        const valores = [];

        if (dados.status) {
            campos.push('status = ?');
            valores.push(dados.status);
        }
        if (dados.tamanho !== undefined) {
            campos.push('tamanho = ?');
            valores.push(dados.tamanho);
        }
        if (dados.observacoes !== undefined) {
            campos.push('observacoes = ?');
            valores.push(dados.observacoes);
        }

        valores.push(id);

        const sql = `UPDATE backups SET ${campos.join(', ')} WHERE id = ?`;
        await database.run(sql, valores);
    }

    static async _limparBackupsAntigos(manterUltimos = 30) {
        const database = require('../config/database');
        const sql = `
            DELETE FROM backups 
            WHERE id NOT IN (
                SELECT id FROM (
                    SELECT id FROM backups 
                    ORDER BY criado_em DESC 
                    LIMIT ?
                ) AS temp
            )
        `;
        await database.run(sql, [manterUltimos]);
    }
}

module.exports = BackupService;

