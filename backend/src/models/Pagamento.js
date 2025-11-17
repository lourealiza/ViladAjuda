const database = require('../config/database');

class Pagamento {
    static async criar(dados) {
        const sql = `
            INSERT INTO pagamentos (reserva_id, tipo, valor, status, chave_pix, observacoes, processado_por)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            dados.reserva_id,
            dados.tipo || 'pix',
            dados.valor,
            dados.status || 'pendente',
            dados.chave_pix || null,
            dados.observacoes || null,
            dados.processado_por || null
        ];
        
        const result = await database.run(sql, params);
        return this.buscarPorId(result.id);
    }

    static async buscarTodos(filtros = {}) {
        let sql = `
            SELECT p.*, r.id as reserva_id, r.nome_hospede, r.valor_total as reserva_valor_total,
                   u.nome as processado_por_nome
            FROM pagamentos p
            LEFT JOIN reservas r ON p.reserva_id = r.id
            LEFT JOIN usuarios u ON p.processado_por = u.id
            WHERE 1=1
        `;
        const params = [];

        if (filtros.reserva_id) {
            sql += ' AND p.reserva_id = ?';
            params.push(filtros.reserva_id);
        }

        if (filtros.status) {
            sql += ' AND p.status = ?';
            params.push(filtros.status);
        }

        if (filtros.tipo) {
            sql += ' AND p.tipo = ?';
            params.push(filtros.tipo);
        }

        sql += ' ORDER BY p.criado_em DESC';

        return database.all(sql, params);
    }

    static async buscarPorId(id) {
        const sql = `
            SELECT p.*, r.id as reserva_id, r.nome_hospede, r.valor_total as reserva_valor_total,
                   r.valor_sinal, u.nome as processado_por_nome
            FROM pagamentos p
            LEFT JOIN reservas r ON p.reserva_id = r.id
            LEFT JOIN usuarios u ON p.processado_por = u.id
            WHERE p.id = ?
        `;
        return database.get(sql, [id]);
    }

    static async buscarPorReserva(reservaId) {
        const sql = 'SELECT * FROM pagamentos WHERE reserva_id = ? ORDER BY criado_em DESC';
        return database.all(sql, [reservaId]);
    }

    static async buscarPorTransacaoId(transacaoId) {
        const sql = 'SELECT * FROM pagamentos WHERE transacao_id = ?';
        return database.get(sql, [transacaoId]);
    }

    static async atualizarStatus(id, novoStatus, dadosAdicionais = {}) {
        const campos = ['status = ?'];
        const valores = [novoStatus];

        if (novoStatus === 'pago') {
            campos.push('data_pagamento = CURRENT_TIMESTAMP');
        }

        if (dadosAdicionais.processado_por) {
            campos.push('processado_por = ?');
            valores.push(dadosAdicionais.processado_por);
        }

        if (dadosAdicionais.observacoes !== undefined) {
            campos.push('observacoes = ?');
            valores.push(dadosAdicionais.observacoes);
        }

        campos.push('atualizado_em = CURRENT_TIMESTAMP');
        valores.push(id);

        const sql = `UPDATE pagamentos SET ${campos.join(', ')} WHERE id = ?`;
        await database.run(sql, valores);
        return this.buscarPorId(id);
    }

    static async atualizar(id, dados) {
        const campos = [];
        const valores = [];

        if (dados.tipo !== undefined) {
            campos.push('tipo = ?');
            valores.push(dados.tipo);
        }
        if (dados.valor !== undefined) {
            campos.push('valor = ?');
            valores.push(dados.valor);
        }
        if (dados.status !== undefined) {
            campos.push('status = ?');
            valores.push(dados.status);
        }
        if (dados.transacao_id !== undefined) {
            campos.push('transacao_id = ?');
            valores.push(dados.transacao_id);
        }
        if (dados.qr_code !== undefined) {
            campos.push('qr_code = ?');
            valores.push(dados.qr_code);
        }
        if (dados.codigo_barras !== undefined) {
            campos.push('codigo_barras = ?');
            valores.push(dados.codigo_barras);
        }
        if (dados.data_vencimento !== undefined) {
            campos.push('data_vencimento = ?');
            valores.push(dados.data_vencimento);
        }
        if (dados.data_pagamento !== undefined) {
            campos.push('data_pagamento = ?');
            valores.push(dados.data_pagamento);
        }
        if (dados.observacoes !== undefined) {
            campos.push('observacoes = ?');
            valores.push(dados.observacoes);
        }
        if (dados.processado_por !== undefined) {
            campos.push('processado_por = ?');
            valores.push(dados.processado_por);
        }

        campos.push('atualizado_em = CURRENT_TIMESTAMP');
        valores.push(id);

        const sql = `UPDATE pagamentos SET ${campos.join(', ')} WHERE id = ?`;
        await database.run(sql, valores);
        return this.buscarPorId(id);
    }

    static async deletar(id) {
        const sql = 'DELETE FROM pagamentos WHERE id = ?';
        return database.run(sql, [id]);
    }

    static async calcularValorPago(reservaId) {
        const sql = `
            SELECT COALESCE(SUM(valor), 0) as total_pago
            FROM pagamentos
            WHERE reserva_id = ? AND status = 'pago'
        `;
        const result = await database.get(sql, [reservaId]);
        return parseFloat(result.total_pago || 0);
    }
}

module.exports = Pagamento;

