const database = require('../config/database');

class Feriado {
    static async criar(dados) {
        const sql = `
            INSERT INTO feriados (nome, data, tipo, multiplicador, preco_override, override_por_chale, ativo)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            dados.nome,
            dados.data,
            dados.tipo || 'nacional',
            dados.multiplicador || 1.50,
            dados.preco_override || null,
            dados.override_por_chale !== undefined ? dados.override_por_chale : 0,
            dados.ativo !== undefined ? dados.ativo : 1
        ];
        
        const result = await database.run(sql, params);
        return this.buscarPorId(result.id);
    }

    static async buscarTodos(apenasAtivos = false) {
        let sql = 'SELECT * FROM feriados';
        if (apenasAtivos) {
            sql += ' WHERE ativo = 1';
        }
        sql += ' ORDER BY data';
        
        return database.all(sql);
    }

    static async buscarPorId(id) {
        const sql = 'SELECT * FROM feriados WHERE id = ?';
        return database.get(sql, [id]);
    }

    static async buscarPorData(data) {
        const sql = 'SELECT * FROM feriados WHERE ativo = 1 AND data = ?';
        return database.get(sql, [data]);
    }

    static async buscarPorPeriodo(dataInicio, dataFim) {
        const sql = `
            SELECT * FROM feriados 
            WHERE ativo = 1 
            AND data BETWEEN ? AND ?
            ORDER BY data
        `;
        return database.all(sql, [dataInicio, dataFim]);
    }

    static async atualizar(id, dados) {
        const campos = [];
        const valores = [];

        if (dados.nome !== undefined) {
            campos.push('nome = ?');
            valores.push(dados.nome);
        }
        if (dados.data !== undefined) {
            campos.push('data = ?');
            valores.push(dados.data);
        }
        if (dados.tipo !== undefined) {
            campos.push('tipo = ?');
            valores.push(dados.tipo);
        }
        if (dados.multiplicador !== undefined) {
            campos.push('multiplicador = ?');
            valores.push(dados.multiplicador);
        }
        if (dados.preco_override !== undefined) {
            campos.push('preco_override = ?');
            valores.push(dados.preco_override);
        }
        if (dados.override_por_chale !== undefined) {
            campos.push('override_por_chale = ?');
            valores.push(dados.override_por_chale);
        }
        if (dados.ativo !== undefined) {
            campos.push('ativo = ?');
            valores.push(dados.ativo);
        }

        campos.push('atualizado_em = CURRENT_TIMESTAMP');
        valores.push(id);

        const sql = `UPDATE feriados SET ${campos.join(', ')} WHERE id = ?`;
        await database.run(sql, valores);
        return this.buscarPorId(id);
    }

    static async deletar(id) {
        const sql = 'DELETE FROM feriados WHERE id = ?';
        return database.run(sql, [id]);
    }
}

module.exports = Feriado;

