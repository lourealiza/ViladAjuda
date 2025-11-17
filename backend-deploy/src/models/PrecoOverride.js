const database = require('../config/database');

class PrecoOverride {
    static async criar(dados) {
        const sql = `
            INSERT INTO precos_override (chale_id, data, preco_override, motivo, ativo)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                preco_override = VALUES(preco_override),
                motivo = VALUES(motivo),
                ativo = VALUES(ativo),
                atualizado_em = CURRENT_TIMESTAMP
        `;
        const params = [
            dados.chale_id || null,
            dados.data,
            dados.preco_override,
            dados.motivo || null,
            dados.ativo !== undefined ? dados.ativo : 1
        ];
        
        const result = await database.run(sql, params);
        return this.buscarPorId(result.id || dados.chale_id, dados.data);
    }

    static async buscarTodos(filtros = {}) {
        let sql = `
            SELECT p.*, c.nome as chale_nome
            FROM precos_override p
            LEFT JOIN chales c ON p.chale_id = c.id
            WHERE 1=1
        `;
        const params = [];

        if (filtros.chale_id) {
            sql += ' AND p.chale_id = ?';
            params.push(filtros.chale_id);
        }

        if (filtros.data_inicio) {
            sql += ' AND p.data >= ?';
            params.push(filtros.data_inicio);
        }

        if (filtros.data_fim) {
            sql += ' AND p.data <= ?';
            params.push(filtros.data_fim);
        }

        if (filtros.ativo !== undefined) {
            sql += ' AND p.ativo = ?';
            params.push(filtros.ativo ? 1 : 0);
        }

        sql += ' ORDER BY p.data';

        return database.all(sql, params);
    }

    static async buscarPorId(chaleId, data) {
        const sql = `
            SELECT p.*, c.nome as chale_nome
            FROM precos_override p
            LEFT JOIN chales c ON p.chale_id = c.id
            WHERE p.chale_id = ? AND p.data = ?
        `;
        return database.get(sql, [chaleId, data]);
    }

    static async buscarPorData(data, chaleId = null) {
        let sql = `
            SELECT * FROM precos_override
            WHERE data = ? AND ativo = 1
        `;
        const params = [data];

        if (chaleId) {
            sql += ' AND (chale_id = ? OR chale_id IS NULL)';
            params.push(chaleId);
            sql += ' ORDER BY chale_id DESC LIMIT 1';
        } else {
            sql += ' AND chale_id IS NULL LIMIT 1';
        }

        return database.get(sql, params);
    }

    static async atualizar(chaleId, data, dados) {
        const campos = [];
        const valores = [];

        if (dados.preco_override !== undefined) {
            campos.push('preco_override = ?');
            valores.push(dados.preco_override);
        }
        if (dados.motivo !== undefined) {
            campos.push('motivo = ?');
            valores.push(dados.motivo);
        }
        if (dados.ativo !== undefined) {
            campos.push('ativo = ?');
            valores.push(dados.ativo);
        }

        campos.push('atualizado_em = CURRENT_TIMESTAMP');
        valores.push(chaleId, data);

        const sql = `UPDATE precos_override SET ${campos.join(', ')} WHERE chale_id = ? AND data = ?`;
        await database.run(sql, valores);
        return this.buscarPorId(chaleId, data);
    }

    static async deletar(chaleId, data) {
        const sql = 'DELETE FROM precos_override WHERE chale_id = ? AND data = ?';
        return database.run(sql, [chaleId, data]);
    }
}

module.exports = PrecoOverride;

