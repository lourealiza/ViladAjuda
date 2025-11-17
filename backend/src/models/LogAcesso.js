const database = require('../config/database');

class LogAcesso {
    static async criar(dados) {
        const sql = `
            INSERT INTO logs_acesso (usuario_id, acao, tabela_afetada, registro_id, 
                                   dados_antes, dados_depois, ip_address, user_agent)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            dados.usuario_id || null,
            dados.acao,
            dados.tabela_afetada || null,
            dados.registro_id || null,
            dados.dados_antes ? JSON.stringify(dados.dados_antes) : null,
            dados.dados_depois ? JSON.stringify(dados.dados_depois) : null,
            dados.ip_address || null,
            dados.user_agent || null
        ];
        
        const result = await database.run(sql, params);
        return this.buscarPorId(result.id);
    }

    static async buscarTodos(filtros = {}) {
        let sql = `
            SELECT l.*, u.nome as usuario_nome, u.email as usuario_email
            FROM logs_acesso l
            LEFT JOIN usuarios u ON l.usuario_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (filtros.usuario_id) {
            sql += ' AND l.usuario_id = ?';
            params.push(filtros.usuario_id);
        }

        if (filtros.acao) {
            sql += ' AND l.acao = ?';
            params.push(filtros.acao);
        }

        if (filtros.tabela_afetada) {
            sql += ' AND l.tabela_afetada = ?';
            params.push(filtros.tabela_afetada);
        }

        if (filtros.data_inicio) {
            sql += ' AND l.criado_em >= ?';
            params.push(filtros.data_inicio);
        }

        if (filtros.data_fim) {
            sql += ' AND l.criado_em <= ?';
            params.push(filtros.data_fim);
        }

        sql += ' ORDER BY l.criado_em DESC';

        if (filtros.limit) {
            sql += ' LIMIT ?';
            params.push(filtros.limit);
        }

        const logs = await database.all(sql, params);
        return logs.map(this.formatarLog);
    }

    static async buscarPorId(id) {
        const sql = `
            SELECT l.*, u.nome as usuario_nome, u.email as usuario_email
            FROM logs_acesso l
            LEFT JOIN usuarios u ON l.usuario_id = u.id
            WHERE l.id = ?
        `;
        const log = await database.get(sql, [id]);
        return log ? this.formatarLog(log) : null;
    }

    static formatarLog(log) {
        return {
            ...log,
            dados_antes: log.dados_antes ? JSON.parse(log.dados_antes) : null,
            dados_depois: log.dados_depois ? JSON.parse(log.dados_depois) : null
        };
    }

    static async limparLogsAntigos(dias = 90) {
        const sql = `
            DELETE FROM logs_acesso 
            WHERE criado_em < DATE_SUB(NOW(), INTERVAL ? DAY)
        `;
        const result = await database.run(sql, [dias]);
        return result.changes;
    }
}

module.exports = LogAcesso;

