const database = require('../config/database');

class Reserva {
    static async criar(dados) {
        // Calcular número de diárias
        const dataInicio = new Date(dados.data_checkin);
        const dataFim = new Date(dados.data_checkout);
        const numDiarias = Math.ceil((dataFim - dataInicio) / (1000 * 60 * 60 * 24));

        const sql = `
            INSERT INTO reservas (chale_id, hospede_id, nome_hospede, email_hospede, telefone_hospede,
                                 data_checkin, data_checkout, num_adultos, num_criancas, num_diarias,
                                 diaria_minima, valor_diaria, valor_subtotal, valor_desconto, cupom_id,
                                 valor_total, valor_sinal, status, forma_pagamento, cidade_hospede, observacoes,
                                 mensagem, origem_canal, consentimento_lgpd, politica_privacidade_aceita, data_consentimento,
                                 utm_source, utm_medium, utm_campaign, utm_term, utm_content, gclid)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            dados.chale_id,
            dados.hospede_id || null,
            dados.nome_hospede,
            dados.email_hospede,
            dados.telefone_hospede,
            dados.data_checkin,
            dados.data_checkout,
            dados.num_adultos || 2,
            dados.num_criancas || 0,
            dados.num_diarias || numDiarias,
            dados.diaria_minima || 1,
            dados.valor_diaria || null,
            dados.valor_subtotal || dados.valor_total || 0,
            dados.valor_desconto || 0,
            dados.cupom_id || null,
            dados.valor_total || 0,
            dados.valor_sinal || 0,
            dados.status || 'solicitacao_recebida',
            dados.forma_pagamento || null,
            dados.cidade_hospede || null,
            dados.observacoes || null,
            dados.mensagem || null,
            dados.origem_canal || null,
            dados.consentimento_lgpd ? 1 : 0,
            dados.politica_privacidade_aceita ? 1 : 0,
            dados.data_consentimento || null,
            dados.utm_source || null,
            dados.utm_medium || null,
            dados.utm_campaign || null,
            dados.utm_term || null,
            dados.utm_content || null,
            dados.gclid || null
        ];
        
        const result = await database.run(sql, params);
        return this.buscarPorId(result.id);
    }

    static async buscarTodos(filtros = {}) {
        let sql = `
            SELECT r.*, c.nome as chale_nome, h.nome as hospede_nome_completo,
                   cup.codigo as cupom_codigo
            FROM reservas r
            LEFT JOIN chales c ON r.chale_id = c.id
            LEFT JOIN hospedes h ON r.hospede_id = h.id
            LEFT JOIN cupons cup ON r.cupom_id = cup.id
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

        if (filtros.hospede_id) {
            sql += ' AND r.hospede_id = ?';
            params.push(filtros.hospede_id);
        }

        if (filtros.email_hospede) {
            sql += ' AND r.email_hospede = ?';
            params.push(filtros.email_hospede);
        }

        if (filtros.data_inicio) {
            sql += ' AND r.data_checkin >= ?';
            params.push(filtros.data_inicio);
        }

        if (filtros.data_fim) {
            sql += ' AND r.data_checkout <= ?';
            params.push(filtros.data_fim);
        }

        if (filtros.origem_canal) {
            sql += ' AND r.origem_canal = ?';
            params.push(filtros.origem_canal);
        }

        sql += ' ORDER BY r.data_checkin DESC';

        return database.all(sql, params);
    }

    static async buscarPorId(id) {
        const sql = `
            SELECT r.*, c.nome as chale_nome, h.nome as hospede_nome_completo,
                   cup.codigo as cupom_codigo, cup.tipo as cupom_tipo
            FROM reservas r
            LEFT JOIN chales c ON r.chale_id = c.id
            LEFT JOIN hospedes h ON r.hospede_id = h.id
            LEFT JOIN cupons cup ON r.cupom_id = cup.id
            WHERE r.id = ?
        `;
        return database.get(sql, [id]);
    }

    static async buscarPorPeriodo(dataInicio, dataFim) {
        const sql = `
            SELECT r.*, c.nome as chale_nome
            FROM reservas r
            LEFT JOIN chales c ON r.chale_id = c.id
            WHERE r.status IN ('confirmada', 'aguardando_pagamento', 'solicitacao_recebida', 'checkin_realizado')
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
        if (dados.valor_sinal !== undefined) {
            campos.push('valor_sinal = ?');
            valores.push(dados.valor_sinal);
        }
        if (dados.hospede_id !== undefined) {
            campos.push('hospede_id = ?');
            valores.push(dados.hospede_id);
        }
        if (dados.num_diarias !== undefined) {
            campos.push('num_diarias = ?');
            valores.push(dados.num_diarias);
        }
        if (dados.valor_diaria !== undefined) {
            campos.push('valor_diaria = ?');
            valores.push(dados.valor_diaria);
        }
        if (dados.valor_subtotal !== undefined) {
            campos.push('valor_subtotal = ?');
            valores.push(dados.valor_subtotal);
        }
        if (dados.valor_desconto !== undefined) {
            campos.push('valor_desconto = ?');
            valores.push(dados.valor_desconto);
        }
        if (dados.cupom_id !== undefined) {
            campos.push('cupom_id = ?');
            valores.push(dados.cupom_id);
        }
        if (dados.status !== undefined) {
            campos.push('status = ?');
            valores.push(dados.status);
        }
        if (dados.forma_pagamento !== undefined) {
            campos.push('forma_pagamento = ?');
            valores.push(dados.forma_pagamento);
        }
        if (dados.cidade_hospede !== undefined) {
            campos.push('cidade_hospede = ?');
            valores.push(dados.cidade_hospede);
        }
        if (dados.observacoes !== undefined) {
            campos.push('observacoes = ?');
            valores.push(dados.observacoes);
        }
        if (dados.mensagem !== undefined) {
            campos.push('mensagem = ?');
            valores.push(dados.mensagem);
        }
        if (dados.origem_canal !== undefined) {
            campos.push('origem_canal = ?');
            valores.push(dados.origem_canal);
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

    static async buscarChalesDisponiveis(dataCheckin, dataCheckout, chaleId = null) {
        let sql = `
            SELECT c.*
            FROM chales c
            WHERE c.ativo = 1
            AND c.id NOT IN (
                SELECT r.chale_id
                FROM reservas r
                WHERE r.status IN ('confirmada', 'aguardando_pagamento', 'solicitacao_recebida', 'checkin_realizado')
                AND (
                    (r.data_checkin <= ? AND r.data_checkout > ?) OR
                    (r.data_checkin < ? AND r.data_checkout >= ?) OR
                    (r.data_checkin >= ? AND r.data_checkout <= ?)
                )
            )
        `;
        const params = [
            dataCheckin, dataCheckin,
            dataCheckout, dataCheckout,
            dataCheckin, dataCheckout
        ];

        if (chaleId) {
            sql += ' AND c.id = ?';
            params.push(chaleId);
        }

        sql += ' ORDER BY c.nome';

        const chales = await database.all(sql, params);
        
        return chales.map(chale => ({
            ...chale,
            ativo: Boolean(chale.ativo),
            amenidades: chale.amenidades ? JSON.parse(chale.amenidades) : [],
            imagens: chale.imagens ? JSON.parse(chale.imagens) : []
        }));
    }

}

module.exports = Reserva;

