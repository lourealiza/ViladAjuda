const database = require('../config/database');

class ChaleTemporadaPreco {
    static async criar(dados) {
        const sql = `
            INSERT INTO chale_temporada_precos (chale_id, temporada_id, preco_base, ativo)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                preco_base = VALUES(preco_base),
                ativo = VALUES(ativo),
                atualizado_em = CURRENT_TIMESTAMP
        `;
        const params = [
            dados.chale_id,
            dados.temporada_id,
            dados.preco_base,
            dados.ativo !== undefined ? dados.ativo : 1
        ];
        
        const result = await database.run(sql, params);
        return this.buscarPorId(result.id || dados.chale_id, dados.temporada_id);
    }

    static async buscarTodos(filtros = {}) {
        let sql = `
            SELECT ctp.*, c.nome as chale_nome, t.nome as temporada_nome, t.tipo as temporada_tipo
            FROM chale_temporada_precos ctp
            LEFT JOIN chales c ON ctp.chale_id = c.id
            LEFT JOIN temporadas t ON ctp.temporada_id = t.id
            WHERE 1=1
        `;
        const params = [];

        if (filtros.chale_id) {
            sql += ' AND ctp.chale_id = ?';
            params.push(filtros.chale_id);
        }

        if (filtros.temporada_id) {
            sql += ' AND ctp.temporada_id = ?';
            params.push(filtros.temporada_id);
        }

        if (filtros.ativo !== undefined) {
            sql += ' AND ctp.ativo = ?';
            params.push(filtros.ativo ? 1 : 0);
        }

        sql += ' ORDER BY c.nome, t.data_inicio';

        return database.all(sql, params);
    }

    static async buscarPorId(chaleId, temporadaId) {
        const sql = `
            SELECT ctp.*, c.nome as chale_nome, t.nome as temporada_nome
            FROM chale_temporada_precos ctp
            LEFT JOIN chales c ON ctp.chale_id = c.id
            LEFT JOIN temporadas t ON ctp.temporada_id = t.id
            WHERE ctp.chale_id = ? AND ctp.temporada_id = ?
        `;
        const preco = await database.get(sql, [chaleId, temporadaId]);
        return preco || null;
    }

    static async buscarPrecoPorChaleEData(chaleId, data) {
        // Buscar temporada da data
        const Temporada = require('./Temporada');
        const temporada = await Temporada.buscarPorData(data);
        
        if (!temporada) {
            return null;
        }

        // Buscar preço específico do chalé para esta temporada
        const sql = `
            SELECT ctp.*, c.nome as chale_nome, t.nome as temporada_nome
            FROM chale_temporada_precos ctp
            LEFT JOIN chales c ON ctp.chale_id = c.id
            LEFT JOIN temporadas t ON ctp.temporada_id = t.id
            WHERE ctp.chale_id = ? AND ctp.temporada_id = ? AND ctp.ativo = 1
        `;
        const preco = await database.get(sql, [chaleId, temporada.id]);
        
        return preco || null;
    }

    static async atualizar(chaleId, temporadaId, dados) {
        const campos = [];
        const valores = [];

        if (dados.preco_base !== undefined) {
            campos.push('preco_base = ?');
            valores.push(dados.preco_base);
        }
        if (dados.ativo !== undefined) {
            campos.push('ativo = ?');
            valores.push(dados.ativo);
        }

        campos.push('atualizado_em = CURRENT_TIMESTAMP');
        valores.push(chaleId, temporadaId);

        const sql = `UPDATE chale_temporada_precos SET ${campos.join(', ')} WHERE chale_id = ? AND temporada_id = ?`;
        await database.run(sql, valores);
        return this.buscarPorId(chaleId, temporadaId);
    }

    static async deletar(chaleId, temporadaId) {
        const sql = 'DELETE FROM chale_temporada_precos WHERE chale_id = ? AND temporada_id = ?';
        return database.run(sql, [chaleId, temporadaId]);
    }
}

module.exports = ChaleTemporadaPreco;

