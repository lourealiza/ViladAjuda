const database = require('../config/database');

class Bloqueio {
    static async criar(dados) {
        const sql = `
            INSERT INTO bloqueios (chale_id, data_inicio, data_fim, motivo, tipo, criado_por)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const params = [
            dados.chale_id || null,
            dados.data_inicio,
            dados.data_fim,
            dados.motivo || null,
            dados.tipo || 'bloqueado',
            dados.criado_por || null
        ];
        
        const result = await database.run(sql, params);
        return this.buscarPorId(result.id);
    }

    static async buscarTodos(filtros = {}) {
        let sql = `
            SELECT b.*, c.nome as chale_nome, u.nome as criado_por_nome
            FROM bloqueios b
            LEFT JOIN chales c ON b.chale_id = c.id
            LEFT JOIN usuarios u ON b.criado_por = u.id
            WHERE 1=1
        `;
        const params = [];

        if (filtros.chale_id) {
            sql += ' AND b.chale_id = ?';
            params.push(filtros.chale_id);
        }

        if (filtros.tipo) {
            sql += ' AND b.tipo = ?';
            params.push(filtros.tipo);
        }

        if (filtros.data_inicio) {
            sql += ' AND b.data_fim >= ?';
            params.push(filtros.data_inicio);
        }

        if (filtros.data_fim) {
            sql += ' AND b.data_inicio <= ?';
            params.push(filtros.data_fim);
        }

        sql += ' ORDER BY b.data_inicio';

        return database.all(sql, params);
    }

    static async buscarPorId(id) {
        const sql = `
            SELECT b.*, c.nome as chale_nome, u.nome as criado_por_nome
            FROM bloqueios b
            LEFT JOIN chales c ON b.chale_id = c.id
            LEFT JOIN usuarios u ON b.criado_por = u.id
            WHERE b.id = ?
        `;
        return database.get(sql, [id]);
    }

    static async verificarBloqueio(chaleId, dataCheckin, dataCheckout) {
        let sql = `
            SELECT COUNT(*) as count
            FROM bloqueios
            WHERE (
                (? BETWEEN data_inicio AND data_fim) OR
                (? BETWEEN data_inicio AND data_fim) OR
                (data_inicio >= ? AND data_fim <= ?)
            )
        `;
        const params = [dataCheckin, dataCheckout, dataCheckin, dataCheckout];

        if (chaleId) {
            sql += ' AND (chale_id = ? OR chale_id IS NULL)';
            params.push(chaleId);
        } else {
            sql += ' AND chale_id IS NULL';
        }

        const result = await database.get(sql, params);
        return result.count > 0;
    }

    static async buscarBloqueiosPorPeriodo(chaleId, dataInicio, dataFim) {
        let sql = `
            SELECT * FROM bloqueios
            WHERE (
                (data_inicio <= ? AND data_fim >= ?) OR
                (data_inicio >= ? AND data_fim <= ?)
            )
        `;
        const params = [dataInicio, dataFim, dataInicio, dataFim];

        if (chaleId) {
            sql += ' AND (chale_id = ? OR chale_id IS NULL)';
            params.push(chaleId);
        } else {
            sql += ' AND chale_id IS NULL';
        }

        sql += ' ORDER BY data_inicio';

        return database.all(sql, params);
    }

    static async atualizar(id, dados) {
        const campos = [];
        const valores = [];

        if (dados.chale_id !== undefined) {
            campos.push('chale_id = ?');
            valores.push(dados.chale_id);
        }
        if (dados.data_inicio !== undefined) {
            campos.push('data_inicio = ?');
            valores.push(dados.data_inicio);
        }
        if (dados.data_fim !== undefined) {
            campos.push('data_fim = ?');
            valores.push(dados.data_fim);
        }
        if (dados.motivo !== undefined) {
            campos.push('motivo = ?');
            valores.push(dados.motivo);
        }
        if (dados.tipo !== undefined) {
            campos.push('tipo = ?');
            valores.push(dados.tipo);
        }

        valores.push(id);

        const sql = `UPDATE bloqueios SET ${campos.join(', ')} WHERE id = ?`;
        await database.run(sql, valores);
        return this.buscarPorId(id);
    }

    static async deletar(id) {
        const sql = 'DELETE FROM bloqueios WHERE id = ?';
        return database.run(sql, [id]);
    }
}

module.exports = Bloqueio;

