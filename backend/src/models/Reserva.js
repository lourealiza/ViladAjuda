const database = require('../config/database');
const { calcularValorEstadia, aplicarDescontoEstadiaLonga } = require('../config/precos');

class Reserva {
    static async criar(dados) {
        const sql = `
            INSERT INTO reservas (chale_id, nome_hospede, email_hospede, telefone_hospede,
                                 data_checkin, data_checkout, num_adultos, num_criancas,
                                 valor_total, status, mensagem)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            dados.chale_id,
            dados.nome_hospede,
            dados.email_hospede,
            dados.telefone_hospede,
            dados.data_checkin,
            dados.data_checkout,
            dados.num_adultos || 2,
            dados.num_criancas || 0,
            dados.valor_total,
            dados.status || 'pendente',
            dados.mensagem || null
        ];
        
        const result = await database.run(sql, params);
        return this.buscarPorId(result.id);
    }

    static async buscarTodos(filtros = {}) {
        let sql = `
            SELECT r.*, c.nome as chale_nome
            FROM reservas r
            LEFT JOIN chales c ON r.chale_id = c.id
            WHERE 1=1
        `;
        const params = [];

        if (filtros.status) {
            sql += ' AND r.status = ?';
            params.push(filtros.status);
        }

        if (filtros.chale_id) {
            sql += ' AND r.chale_id = ?';
            params.push(filtros.chale_id);
        }

        if (filtros.data_inicio) {
            sql += ' AND r.data_checkin >= ?';
            params.push(filtros.data_inicio);
        }

        if (filtros.data_fim) {
            sql += ' AND r.data_checkout <= ?';
            params.push(filtros.data_fim);
        }

        sql += ' ORDER BY r.data_checkin DESC';

        return database.all(sql, params);
    }

    static async buscarPorId(id) {
        const sql = `
            SELECT r.*, c.nome as chale_nome
            FROM reservas r
            LEFT JOIN chales c ON r.chale_id = c.id
            WHERE r.id = ?
        `;
        return database.get(sql, [id]);
    }

    static async buscarPorPeriodo(dataInicio, dataFim) {
        const sql = `
            SELECT r.*, c.nome as chale_nome
            FROM reservas r
            LEFT JOIN chales c ON r.chale_id = c.id
            WHERE r.status IN ('confirmada', 'pendente')
            AND (
                (r.data_checkin >= ? AND r.data_checkin < ?) OR
                (r.data_checkout > ? AND r.data_checkout <= ?) OR
                (r.data_checkin <= ? AND r.data_checkout >= ?)
            )
            ORDER BY r.data_checkin
        `;
        return database.all(sql, [
            dataInicio, dataFim,
            dataInicio, dataFim,
            dataInicio, dataFim
        ]);
    }

    static async atualizar(id, dados) {
        const campos = [];
        const valores = [];

        if (dados.chale_id !== undefined) {
            campos.push('chale_id = ?');
            valores.push(dados.chale_id);
        }
        if (dados.nome_hospede !== undefined) {
            campos.push('nome_hospede = ?');
            valores.push(dados.nome_hospede);
        }
        if (dados.email_hospede !== undefined) {
            campos.push('email_hospede = ?');
            valores.push(dados.email_hospede);
        }
        if (dados.telefone_hospede !== undefined) {
            campos.push('telefone_hospede = ?');
            valores.push(dados.telefone_hospede);
        }
        if (dados.data_checkin !== undefined) {
            campos.push('data_checkin = ?');
            valores.push(dados.data_checkin);
        }
        if (dados.data_checkout !== undefined) {
            campos.push('data_checkout = ?');
            valores.push(dados.data_checkout);
        }
        if (dados.num_adultos !== undefined) {
            campos.push('num_adultos = ?');
            valores.push(dados.num_adultos);
        }
        if (dados.num_criancas !== undefined) {
            campos.push('num_criancas = ?');
            valores.push(dados.num_criancas);
        }
        if (dados.valor_total !== undefined) {
            campos.push('valor_total = ?');
            valores.push(dados.valor_total);
        }
        if (dados.status !== undefined) {
            campos.push('status = ?');
            valores.push(dados.status);
        }
        if (dados.mensagem !== undefined) {
            campos.push('mensagem = ?');
            valores.push(dados.mensagem);
        }

        campos.push('atualizado_em = CURRENT_TIMESTAMP');
        valores.push(id);

        const sql = `UPDATE reservas SET ${campos.join(', ')} WHERE id = ?`;
        await database.run(sql, valores);
        return this.buscarPorId(id);
    }

    static async deletar(id) {
        const sql = 'DELETE FROM reservas WHERE id = ?';
        return database.run(sql, [id]);
    }

    static async atualizarStatus(id, novoStatus) {
        const sql = 'UPDATE reservas SET status = ?, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?';
        await database.run(sql, [novoStatus, id]);
        return this.buscarPorId(id);
    }

    static async buscarChalesDisponiveis(dataCheckin, dataCheckout) {
        const sql = `
            SELECT c.*
            FROM chales c
            WHERE c.ativo = 1
            AND c.id NOT IN (
                SELECT r.chale_id
                FROM reservas r
                WHERE r.status IN ('confirmada', 'pendente')
                AND (
                    (r.data_checkin <= ? AND r.data_checkout > ?) OR
                    (r.data_checkin < ? AND r.data_checkout >= ?) OR
                    (r.data_checkin >= ? AND r.data_checkout <= ?)
                )
            )
            ORDER BY c.nome
        `;
        const chales = await database.all(sql, [
            dataCheckin, dataCheckin,
            dataCheckout, dataCheckout,
            dataCheckin, dataCheckout
        ]);
        
        return chales.map(chale => ({
            ...chale,
            ativo: Boolean(chale.ativo),
            amenidades: chale.amenidades ? JSON.parse(chale.amenidades) : [],
            imagens: chale.imagens ? JSON.parse(chale.imagens) : []
        }));
    }
}

module.exports = Reserva;

