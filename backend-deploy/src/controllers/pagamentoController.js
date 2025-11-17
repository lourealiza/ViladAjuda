const Pagamento = require('../models/Pagamento');
const Reserva = require('../models/Reserva');

class PagamentoController {
    /**
     * Listar pagamentos
     */
    static async listar(req, res) {
        try {
            const filtros = {
                reserva_id: req.query.reserva_id,
                status: req.query.status,
                tipo: req.query.tipo
            };

            const pagamentos = await Pagamento.buscarTodos(filtros);
            res.json(pagamentos);
        } catch (erro) {
            console.error('Erro ao listar pagamentos:', erro);
            res.status(500).json({
                erro: 'Erro ao listar pagamentos',
                mensagem: erro.message
            });
        }
    }

    /**
     * Buscar pagamento por ID
     */
    static async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const pagamento = await Pagamento.buscarPorId(id);

            if (!pagamento) {
                return res.status(404).json({
                    erro: 'Pagamento não encontrado'
                });
            }

            res.json(pagamento);
        } catch (erro) {
            console.error('Erro ao buscar pagamento:', erro);
            res.status(500).json({
                erro: 'Erro ao buscar pagamento',
                mensagem: erro.message
            });
        }
    }

    /**
     * Criar pagamento (sinal)
     */
    static async criar(req, res) {
        try {
            const { reserva_id, valor_sinal, chave_pix, observacoes } = req.body;

            if (!reserva_id || !valor_sinal) {
                return res.status(400).json({
                    erro: 'Dados obrigatórios',
                    mensagem: 'reserva_id e valor_sinal são obrigatórios'
                });
            }

            // Verificar se reserva existe
            const reserva = await Reserva.buscarPorId(reserva_id);
            if (!reserva) {
                return res.status(404).json({
                    erro: 'Reserva não encontrada'
                });
            }

            // Atualizar valor_sinal na reserva
            await Reserva.atualizar(reserva_id, { valor_sinal });

            // Criar registro de pagamento pendente
            const pagamento = await Pagamento.criar({
                reserva_id,
                tipo: 'pix',
                valor: valor_sinal,
                status: 'pendente',
                chave_pix: chave_pix || null,
                observacoes: observacoes || 'Sinal da reserva - aguardando confirmação',
                processado_por: null
            });

            res.status(201).json({
                mensagem: 'Pagamento de sinal registrado. Aguardando confirmação.',
                pagamento
            });
        } catch (erro) {
            console.error('Erro ao criar pagamento:', erro);
            res.status(500).json({
                erro: 'Erro ao criar pagamento',
                mensagem: erro.message
            });
        }
    }

    /**
     * Atualizar status do pagamento
     */
    static async atualizarStatus(req, res) {
        try {
            const { id } = req.params;
            const { status, observacoes } = req.body;

            if (!status || !['pendente', 'pago'].includes(status)) {
                return res.status(400).json({
                    erro: 'Status inválido',
                    mensagem: 'Status deve ser "pendente" ou "pago"'
                });
            }

            const pagamento = await Pagamento.atualizarStatus(id, status, {
                processado_por: req.usuario?.id,
                observacoes
            });

            // Se pagamento confirmado, atualizar status da reserva
            if (status === 'pago') {
                const pagamentoCompleto = await Pagamento.buscarPorId(id);
                const reserva = await Reserva.buscarPorId(pagamentoCompleto.reserva_id);

                // Se pagou o sinal, confirma a reserva
                if (pagamentoCompleto.valor === reserva.valor_sinal) {
                    await Reserva.atualizarStatus(pagamentoCompleto.reserva_id, 'confirmado');
                }

                // Se pagou o valor total, marca como pago
                const valorPago = await Pagamento.calcularValorPago(pagamentoCompleto.reserva_id);
                if (valorPago >= reserva.valor_total) {
                    await Reserva.atualizarStatus(pagamentoCompleto.reserva_id, 'pago');
                    
                    // Registrar evento de booking_confirmed
                    const TrackingService = require('../services/trackingService');
                    const EventoTracking = require('../models/EventoTracking');
                    
                    // Buscar UTM da reserva
                    const eventos = await EventoTracking.buscarTodos({
                        reserva_id: pagamentoCompleto.reserva_id,
                        limit: 1
                    });
                    
                    const utm = eventos.length > 0 ? {
                        utm_source: eventos[0].utm_source,
                        utm_medium: eventos[0].utm_medium,
                        utm_campaign: eventos[0].utm_campaign,
                        gclid: eventos[0].gclid
                    } : {};
                    
                    await TrackingService.registrarBookingConfirmed(pagamentoCompleto.reserva_id, {
                        valor_total: reserva.valor_total,
                        forma_pagamento: reserva.forma_pagamento,
                        email_hospede: reserva.email_hospede,
                        telefone_hospede: reserva.telefone_hospede
                    }, utm, eventos[0]?.sessao_id).catch(err => {
                        console.error('Erro ao registrar evento de booking_confirmed:', err);
                    });
                }
            }

            res.json({
                mensagem: `Pagamento marcado como ${status}`,
                pagamento
            });
        } catch (erro) {
            console.error('Erro ao atualizar status do pagamento:', erro);
            res.status(500).json({
                erro: 'Erro ao atualizar status do pagamento',
                mensagem: erro.message
            });
        }
    }

    /**
     * Buscar pagamentos de uma reserva
     */
    static async buscarPorReserva(req, res) {
        try {
            const { reserva_id } = req.params;
            const pagamentos = await Pagamento.buscarPorReserva(reserva_id);
            res.json(pagamentos);
        } catch (erro) {
            console.error('Erro ao buscar pagamentos da reserva:', erro);
            res.status(500).json({
                erro: 'Erro ao buscar pagamentos da reserva',
                mensagem: erro.message
            });
        }
    }

    /**
     * Confirmar pagamento manual (botão no painel)
     */
    static async confirmarManual(req, res) {
        try {
            const { id } = req.params;
            const { observacoes } = req.body;

            const pagamento = await Pagamento.buscarPorId(id);
            if (!pagamento) {
                return res.status(404).json({
                    erro: 'Pagamento não encontrado'
                });
            }

            if (pagamento.status === 'pago') {
                return res.status(400).json({
                    erro: 'Pagamento já confirmado',
                    mensagem: 'Este pagamento já foi confirmado anteriormente'
                });
            }

            // Marcar como pago
            const pagamentoAtualizado = await Pagamento.atualizarStatus(id, 'pago', {
                processado_por: req.usuario?.id,
                observacoes: observacoes || 'Pagamento confirmado manualmente via painel'
            });

            // Atualizar status da reserva
            const reserva = await Reserva.buscarPorId(pagamento.reserva_id);
            
            // Se pagou o sinal, confirma a reserva
            if (pagamento.valor === reserva.valor_sinal) {
                await Reserva.atualizarStatus(pagamento.reserva_id, 'confirmado');
            }

            // Verificar se pagou o valor total
            const valorPago = await Pagamento.calcularValorPago(pagamento.reserva_id);
            if (valorPago >= reserva.valor_total) {
                await Reserva.atualizarStatus(pagamento.reserva_id, 'pago');
                
                // Registrar evento de booking_confirmed
                const TrackingService = require('../services/trackingService');
                const EventoTracking = require('../models/EventoTracking');
                
                // Buscar UTM da reserva
                const eventos = await EventoTracking.buscarTodos({
                    reserva_id: pagamento.reserva_id,
                    limit: 1
                });
                
                const utm = eventos.length > 0 ? {
                    utm_source: eventos[0].utm_source,
                    utm_medium: eventos[0].utm_medium,
                    utm_campaign: eventos[0].utm_campaign,
                    gclid: eventos[0].gclid
                } : {};
                
                await TrackingService.registrarBookingConfirmed(pagamento.reserva_id, {
                    valor_total: reserva.valor_total,
                    forma_pagamento: reserva.forma_pagamento,
                    email_hospede: reserva.email_hospede,
                    telefone_hospede: reserva.telefone_hospede
                }, utm, eventos[0]?.sessao_id).catch(err => {
                    console.error('Erro ao registrar evento de booking_confirmed:', err);
                });
            }

            res.json({
                mensagem: 'Pagamento confirmado com sucesso',
                pagamento: pagamentoAtualizado,
                reserva_atualizada: await Reserva.buscarPorId(pagamento.reserva_id)
            });
        } catch (erro) {
            console.error('Erro ao confirmar pagamento manual:', erro);
            res.status(500).json({
                erro: 'Erro ao confirmar pagamento manual',
                mensagem: erro.message
            });
        }
    }
}

module.exports = PagamentoController;

