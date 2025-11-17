const Reserva = require('../models/Reserva');
const Pagamento = require('../models/Pagamento');

class ReservaWorkflowService {
    /**
     * Mapa de transições válidas de status
     */
    static TRANSICOES_VALIDAS = {
        'solicitacao_recebida': ['aguardando_pagamento', 'cancelada'],
        'aguardando_pagamento': ['confirmada', 'cancelada'],
        'confirmada': ['checkin_realizado', 'cancelada'],
        'checkin_realizado': ['checkout_realizado'],
        'checkout_realizado': [], // Estado final
        'cancelada': [] // Estado final
    };

    /**
     * Valida se uma transição de status é permitida
     */
    static validarTransicao(statusAtual, novoStatus) {
        const transicoesPermitidas = this.TRANSICOES_VALIDAS[statusAtual] || [];
        return transicoesPermitidas.includes(novoStatus);
    }

    /**
     * Obtém próximos status possíveis
     */
    static obterProximosStatus(statusAtual) {
        return this.TRANSICOES_VALIDAS[statusAtual] || [];
    }

    /**
     * Atualiza status da reserva com validação
     */
    static async atualizarStatus(reservaId, novoStatus, dadosAdicionais = {}) {
        const reserva = await Reserva.buscarPorId(reservaId);
        
        if (!reserva) {
            throw new Error('Reserva não encontrada');
        }

        const statusAtual = reserva.status;

        // Validar transição
        if (!this.validarTransicao(statusAtual, novoStatus)) {
            throw new Error(
                `Transição inválida: não é possível mudar de "${statusAtual}" para "${novoStatus}". ` +
                `Status possíveis: ${this.obterProximosStatus(statusAtual).join(', ')}`
            );
        }

        // Lógica específica por transição
        await this._processarTransicao(reservaId, statusAtual, novoStatus, dadosAdicionais);

        // Atualizar status
        const reservaAtualizada = await Reserva.atualizarStatus(reservaId, novoStatus);

        // Atualizar campos adicionais se fornecidos
        const camposAdicionais = {};
        if (dadosAdicionais.observacoes !== undefined) {
            camposAdicionais.observacoes = dadosAdicionais.observacoes;
        }
        if (dadosAdicionais.forma_pagamento !== undefined) {
            camposAdicionais.forma_pagamento = dadosAdicionais.forma_pagamento;
        }

        if (Object.keys(camposAdicionais).length > 0) {
            await Reserva.atualizar(reservaId, camposAdicionais);
        }

        return await Reserva.buscarPorId(reservaId);
    }

    /**
     * Processa lógica específica de cada transição
     */
    static async _processarTransicao(reservaId, statusAtual, novoStatus, dadosAdicionais) {
        switch (novoStatus) {
            case 'aguardando_pagamento':
                // Quando muda para aguardando pagamento, pode criar registro de pagamento
                if (dadosAdicionais.valor_sinal) {
                    await Reserva.atualizar(reservaId, { valor_sinal: dadosAdicionais.valor_sinal });
                    
                    // Criar registro de pagamento pendente
                    await Pagamento.criar({
                        reserva_id: reservaId,
                        tipo: dadosAdicionais.forma_pagamento || 'pix',
                        valor: dadosAdicionais.valor_sinal,
                        status: 'pendente',
                        observacoes: 'Sinal da reserva - aguardando confirmação'
                    });
                }
                break;

            case 'confirmada':
                // Quando confirma, verificar se há pagamento pendente e marcar como pago
                const pagamentos = await Pagamento.buscarPorReserva(reservaId);
                const pagamentoPendente = pagamentos.find(p => p.status === 'pendente');
                
                if (pagamentoPendente && dadosAdicionais.confirmar_pagamento) {
                    await Pagamento.atualizarStatus(pagamentoPendente.id, 'pago', {
                        processado_por: dadosAdicionais.usuario_id
                    });
                }
                break;

            case 'checkin_realizado':
                // Registrar data/hora do check-in se fornecida
                if (dadosAdicionais.data_checkin_real) {
                    // Pode ser armazenado em observações ou criar campo específico
                    const reserva = await Reserva.buscarPorId(reservaId);
                    const observacoes = reserva.observacoes || '';
                    await Reserva.atualizar(reservaId, {
                        observacoes: `${observacoes}\nCheck-in realizado em: ${dadosAdicionais.data_checkin_real}`
                    });
                }
                break;

            case 'checkout_realizado':
                // Registrar data/hora do checkout se fornecida
                if (dadosAdicionais.data_checkout_real) {
                    const reserva = await Reserva.buscarPorId(reservaId);
                    const observacoes = reserva.observacoes || '';
                    await Reserva.atualizar(reservaId, {
                        observacoes: `${observacoes}\nCheck-out realizado em: ${dadosAdicionais.data_checkout_real}`
                    });
                }
                break;

            case 'cancelada':
                // Ao cancelar, pode registrar motivo
                if (dadosAdicionais.motivo_cancelamento) {
                    const reserva = await Reserva.buscarPorId(reservaId);
                    const observacoes = reserva.observacoes || '';
                    await Reserva.atualizar(reservaId, {
                        observacoes: `${observacoes}\nCancelamento: ${dadosAdicionais.motivo_cancelamento}`
                    });
                }
                break;
        }
    }

    /**
     * Obtém estatísticas do funil
     */
    static async obterEstatisticasFunil(filtros = {}) {
        const database = require('../config/database');
        
        let sql = `
            SELECT 
                status,
                COUNT(*) as total,
                SUM(valor_total) as receita_total
            FROM reservas
            WHERE 1=1
        `;
        const params = [];

        if (filtros.data_inicio) {
            sql += ' AND criado_em >= ?';
            params.push(filtros.data_inicio);
        }

        if (filtros.data_fim) {
            sql += ' AND criado_em <= ?';
            params.push(filtros.data_fim);
        }

        sql += ' GROUP BY status ORDER BY FIELD(status, "solicitacao_recebida", "aguardando_pagamento", "confirmada", "checkin_realizado", "checkout_realizado", "cancelada")';

        const estatisticas = await database.all(sql, params);

        // Calcular taxas de conversão
        const total = estatisticas.reduce((sum, e) => sum + e.total, 0);
        const funil = estatisticas.map(e => ({
            ...e,
            percentual: total > 0 ? ((e.total / total) * 100).toFixed(2) : 0
        }));

        return {
            funil,
            total_reservas: total,
            taxa_conversao: total > 0 ? {
                solicitacao_para_pagamento: ((funil.find(e => e.status === 'aguardando_pagamento')?.total || 0) / total * 100).toFixed(2),
                pagamento_para_confirmada: ((funil.find(e => e.status === 'confirmada')?.total || 0) / total * 100).toFixed(2),
                confirmada_para_checkin: ((funil.find(e => e.status === 'checkin_realizado')?.total || 0) / total * 100).toFixed(2),
                checkin_para_checkout: ((funil.find(e => e.status === 'checkout_realizado')?.total || 0) / total * 100).toFixed(2)
            } : {}
        };
    }
}

module.exports = ReservaWorkflowService;

