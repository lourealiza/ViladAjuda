const database = require('../config/database');

class Temporada {
    static async criar(dados) {
        const sql = `
            INSERT INTO temporadas (nome, tipo, data_inicio, data_fim, multiplicador, diaria_minima, dias_checkin_permitidos, ativo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            dados.nome,
            dados.tipo || 'media',
            dados.data_inicio,
            dados.data_fim,
            dados.multiplicador || 1.00,
            dados.diaria_minima || 2, // Diária mínima padrão: 2 dias
            dados.dias_checkin_permitidos ? JSON.stringify(dados.dias_checkin_permitidos) : null,
            dados.ativo !== undefined ? dados.ativo : 1
        ];
        
        const result = await database.run(sql, params);
        return this.buscarPorId(result.id);
    }

    static async buscarTodos(apenasAtivos = false) {
        let sql = 'SELECT * FROM temporadas';
        if (apenasAtivos) {
            sql += ' WHERE ativo = 1';
        }
        sql += ' ORDER BY data_inicio';
        
        return database.all(sql);
    }

    static async buscarPorId(id) {
        const sql = 'SELECT * FROM temporadas WHERE id = ?';
        return database.get(sql, [id]);
    }

    static async buscarPorData(data) {
        const sql = `
            SELECT * FROM temporadas 
            WHERE ativo = 1 
            AND ? BETWEEN data_inicio AND data_fim
            ORDER BY multiplicador DESC
            LIMIT 1
        `;
        const temporada = await database.get(sql, [data]);
        if (temporada && temporada.dias_checkin_permitidos) {
            temporada.dias_checkin_permitidos = JSON.parse(temporada.dias_checkin_permitidos);
        }
        return temporada;
    }

    static async buscarPorPeriodo(dataInicio, dataFim) {
        const sql = `
            SELECT * FROM temporadas 
            WHERE ativo = 1 
            AND (
                (data_inicio <= ? AND data_fim >= ?) OR
                (data_inicio >= ? AND data_fim <= ?) OR
                (data_inicio <= ? AND data_fim >= ?)
            )
            ORDER BY data_inicio
        `;
        const temporadas = await database.all(sql, [
            dataInicio, dataFim,
            dataInicio, dataFim,
            dataInicio, dataFim
        ]);
        return temporadas.map(t => {
            if (t.dias_checkin_permitidos) {
                t.dias_checkin_permitidos = JSON.parse(t.dias_checkin_permitidos);
            }
            return t;
        });
    }

    static async atualizar(id, dados) {
        const campos = [];
        const valores = [];

        if (dados.nome !== undefined) {
            campos.push('nome = ?');
            valores.push(dados.nome);
        }
        if (dados.tipo !== undefined) {
            campos.push('tipo = ?');
            valores.push(dados.tipo);
        }
        if (dados.data_inicio !== undefined) {
            campos.push('data_inicio = ?');
            valores.push(dados.data_inicio);
        }
        if (dados.data_fim !== undefined) {
            campos.push('data_fim = ?');
            valores.push(dados.data_fim);
        }
        if (dados.multiplicador !== undefined) {
            campos.push('multiplicador = ?');
            valores.push(dados.multiplicador);
        }
        if (dados.diaria_minima !== undefined) {
            campos.push('diaria_minima = ?');
            valores.push(dados.diaria_minima);
        }
        if (dados.dias_checkin_permitidos !== undefined) {
            campos.push('dias_checkin_permitidos = ?');
            valores.push(dados.dias_checkin_permitidos ? JSON.stringify(dados.dias_checkin_permitidos) : null);
        }
        if (dados.ativo !== undefined) {
            campos.push('ativo = ?');
            valores.push(dados.ativo);
        }

        campos.push('atualizado_em = CURRENT_TIMESTAMP');
        valores.push(id);

        const sql = `UPDATE temporadas SET ${campos.join(', ')} WHERE id = ?`;
        await database.run(sql, valores);
        return this.buscarPorId(id);
    }

    static async deletar(id) {
        const sql = 'DELETE FROM temporadas WHERE id = ?';
        return database.run(sql, [id]);
    }
}

module.exports = Temporada;

