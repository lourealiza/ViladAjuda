const database = require('../config/database');

class RegraTarifacao {
    static async criar(dados) {
        const sql = `
            INSERT INTO regras_tarifacao (chale_id, nome, tipo, limite_pessoas_base, valor_adicional,
                                         idade_maxima_crianca, desconto_crianca_percentual, desconto_crianca_fixo, ativo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            dados.chale_id || null,
            dados.nome,
            dados.tipo,
            dados.limite_pessoas_base || 2,
            dados.valor_adicional || 0,
            dados.idade_maxima_crianca || null,
            dados.desconto_crianca_percentual || null,
            dados.desconto_crianca_fixo || null,
            dados.ativo !== undefined ? dados.ativo : 1
        ];
        
        const result = await database.run(sql, params);
        return this.buscarPorId(result.id);
    }

    static async buscarTodos(filtros = {}) {
        let sql = `
            SELECT r.*, c.nome as chale_nome
            FROM regras_tarifacao r
            LEFT JOIN chales c ON r.chale_id = c.id
            WHERE 1=1
        `;
        const params = [];

        if (filtros.chale_id) {
            sql += ' AND r.chale_id = ?';
            params.push(filtros.chale_id);
        }

        if (filtros.tipo) {
            sql += ' AND r.tipo = ?';
            params.push(filtros.tipo);
        }

        if (filtros.ativo !== undefined) {
            sql += ' AND r.ativo = ?';
            params.push(filtros.ativo ? 1 : 0);
        }

        sql += ' ORDER BY r.nome';

        return database.all(sql, params);
    }

    static async buscarPorId(id) {
        const sql = `
            SELECT r.*, c.nome as chale_nome
            FROM regras_tarifacao r
            LEFT JOIN chales c ON r.chale_id = c.id
            WHERE r.id = ?
        `;
        return database.get(sql, [id]);
    }

    static async buscarRegrasPorChale(chaleId) {
        const sql = `
            SELECT * FROM regras_tarifacao
            WHERE (chale_id = ? OR chale_id IS NULL)
            AND ativo = 1
            ORDER BY chale_id DESC, tipo
        `;
        return database.all(sql, [chaleId]);
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
        if (dados.limite_pessoas_base !== undefined) {
            campos.push('limite_pessoas_base = ?');
            valores.push(dados.limite_pessoas_base);
        }
        if (dados.valor_adicional !== undefined) {
            campos.push('valor_adicional = ?');
            valores.push(dados.valor_adicional);
        }
        if (dados.idade_maxima_crianca !== undefined) {
            campos.push('idade_maxima_crianca = ?');
            valores.push(dados.idade_maxima_crianca);
        }
        if (dados.desconto_crianca_percentual !== undefined) {
            campos.push('desconto_crianca_percentual = ?');
            valores.push(dados.desconto_crianca_percentual);
        }
        if (dados.desconto_crianca_fixo !== undefined) {
            campos.push('desconto_crianca_fixo = ?');
            valores.push(dados.desconto_crianca_fixo);
        }
        if (dados.ativo !== undefined) {
            campos.push('ativo = ?');
            valores.push(dados.ativo);
        }

        campos.push('atualizado_em = CURRENT_TIMESTAMP');
        valores.push(id);

        const sql = `UPDATE regras_tarifacao SET ${campos.join(', ')} WHERE id = ?`;
        await database.run(sql, valores);
        return this.buscarPorId(id);
    }

    static async deletar(id) {
        const sql = 'DELETE FROM regras_tarifacao WHERE id = ?';
        return database.run(sql, [id]);
    }
}

module.exports = RegraTarifacao;

