const database = require('../config/database');

class Chale {
    static async criar(dados) {
        const sql = `
            INSERT INTO chales (nome, descricao, capacidade_adultos, capacidade_criancas, 
                               preco_diaria, ativo, amenidades, imagens)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            dados.nome,
            dados.descricao,
            dados.capacidade_adultos || 2,
            dados.capacidade_criancas || 2,
            dados.preco_diaria,
            dados.ativo !== undefined ? dados.ativo : 1,
            JSON.stringify(dados.amenidades || []),
            JSON.stringify(dados.imagens || [])
        ];
        
        const result = await database.run(sql, params);
        return this.buscarPorId(result.id);
    }

    static async buscarTodos(apenasAtivos = false) {
        let sql = 'SELECT * FROM chales';
        if (apenasAtivos) {
            sql += ' WHERE ativo = 1';
        }
        sql += ' ORDER BY nome';
        
        const chales = await database.all(sql);
        return chales.map(this.formatarChale);
    }

    static async buscarPorId(id) {
        const sql = 'SELECT * FROM chales WHERE id = ?';
        const chale = await database.get(sql, [id]);
        return chale ? this.formatarChale(chale) : null;
    }

    static async atualizar(id, dados) {
        const campos = [];
        const valores = [];

        if (dados.nome !== undefined) {
            campos.push('nome = ?');
            valores.push(dados.nome);
        }
        if (dados.descricao !== undefined) {
            campos.push('descricao = ?');
            valores.push(dados.descricao);
        }
        if (dados.capacidade_adultos !== undefined) {
            campos.push('capacidade_adultos = ?');
            valores.push(dados.capacidade_adultos);
        }
        if (dados.capacidade_criancas !== undefined) {
            campos.push('capacidade_criancas = ?');
            valores.push(dados.capacidade_criancas);
        }
        if (dados.preco_diaria !== undefined) {
            campos.push('preco_diaria = ?');
            valores.push(dados.preco_diaria);
        }
        if (dados.ativo !== undefined) {
            campos.push('ativo = ?');
            valores.push(dados.ativo);
        }
        if (dados.amenidades !== undefined) {
            campos.push('amenidades = ?');
            valores.push(JSON.stringify(dados.amenidades));
        }
        if (dados.imagens !== undefined) {
            campos.push('imagens = ?');
            valores.push(JSON.stringify(dados.imagens));
        }

        campos.push('atualizado_em = CURRENT_TIMESTAMP');
        valores.push(id);

        const sql = `UPDATE chales SET ${campos.join(', ')} WHERE id = ?`;
        await database.run(sql, valores);
        return this.buscarPorId(id);
    }

    static async deletar(id) {
        const sql = 'DELETE FROM chales WHERE id = ?';
        return database.run(sql, [id]);
    }

    static async verificarDisponibilidade(chaleId, dataCheckin, dataCheckout, excluirReservaId = null) {
        let sql = `
            SELECT COUNT(*) as count
            FROM reservas
            WHERE chale_id = ?
            AND status IN ('confirmada', 'aguardando_pagamento', 'solicitacao_recebida', 'checkin_realizado')
            AND (
                (data_checkin <= ? AND data_checkout > ?) OR
                (data_checkin < ? AND data_checkout >= ?) OR
                (data_checkin >= ? AND data_checkout <= ?)
            )
        `;
        const params = [
            chaleId, 
            dataCheckin, dataCheckin,
            dataCheckout, dataCheckout,
            dataCheckin, dataCheckout
        ];

        if (excluirReservaId) {
            sql += ' AND id != ?';
            params.push(excluirReservaId);
        }

        const result = await database.get(sql, params);
        return result.count === 0;
    }

    static formatarChale(chale) {
        return {
            ...chale,
            ativo: Boolean(chale.ativo),
            amenidades: chale.amenidades ? JSON.parse(chale.amenidades) : [],
            imagens: chale.imagens ? JSON.parse(chale.imagens) : []
        };
    }
}

module.exports = Chale;

