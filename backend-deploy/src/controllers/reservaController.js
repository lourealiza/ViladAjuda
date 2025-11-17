const Reserva = require('../models/Reserva');
const Chale = require('../models/Chale');
const Hospede = require('../models/Hospede');
const Bloqueio = require('../models/Bloqueio');
const Cupom = require('../models/Cupom');
const TarifaService = require('../services/tarifaService');
const EventoTracking = require('../models/EventoTracking');

class ReservaController {
    async listar(req, res) {
        try {
            const filtros = {
                status: req.query.status,
                chale_id: req.query.chale_id,
                data_inicio: req.query.data_inicio,
                data_fim: req.query.data_fim
            };

            const reservas = await Reserva.buscarTodos(filtros);
            
            return res.json({ 
                total: reservas.length,
                reservas 
            });

        } catch (erro) {
            console.error('Erro ao listar reservas:', erro);
            return res.status(500).json({ 
                erro: 'Erro no servidor',
                mensagem: 'Erro ao buscar reservas'
            });
        }
    }

    async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const reserva = await Reserva.buscarPorId(id);
            
            if (!reserva) {
                return res.status(404).json({ 
                    erro: 'Reserva não encontrada'
                });
            }

            return res.json({ reserva });

        } catch (erro) {
            console.error('Erro ao buscar reserva:', erro);
            return res.status(500).json({ 
                erro: 'Erro no servidor',
                mensagem: 'Erro ao buscar reserva'
            });
        }
    }

    async criar(req, res) {
        try {
            const { 
                chale_id, 
                data_checkin, 
                data_checkout,
                num_adultos,
                num_criancas 
            } = req.body;

            // Verificar se o chalé existe
            let chale = null;
            if (chale_id) {
                chale = await Chale.buscarPorId(chale_id);
                if (!chale) {
                    return res.status(404).json({ 
                        erro: 'Chalé não encontrado'
                    });
                }

                // Verificar disponibilidade
                const disponivel = await Chale.verificarDisponibilidade(
                    chale_id, 
                    data_checkin, 
                    data_checkout
                );

                if (!disponivel) {
                    return res.status(400).json({ 
                        erro: 'Chalé indisponível',
                        mensagem: 'O chalé selecionado não está disponível para o período escolhido'
                    });
                }

                // Verificar capacidade
                if (num_adultos > chale.capacidade_adultos) {
                    return res.status(400).json({ 
                        erro: 'Capacidade excedida',
                        mensagem: `Este chalé comporta no máximo ${chale.capacidade_adultos} adultos`
                    });
                }

                if (num_criancas > chale.capacidade_criancas) {
                    return res.status(400).json({ 
                        erro: 'Capacidade excedida',
                        mensagem: `Este chalé comporta no máximo ${chale.capacidade_criancas} crianças`
                    });
                }
            }

            // Validação completa de disponibilidade
            const DisponibilidadeService = require('../services/disponibilidadeService');
            const validacao = await DisponibilidadeService.validarDisponibilidade({
                chale_id,
                data_checkin,
                data_checkout,
                num_adultos,
                num_criancas
            });

            if (!validacao.valido) {
                return res.status(400).json({
                    erro: 'Reserva inválida',
                    mensagem: 'Não é possível criar a reserva',
                    erros: validacao.erros,
                    avisos: validacao.avisos
                });
            }

            // Buscar ou criar hóspede
            let hospede = null;
            if (req.body.email_hospede || req.body.telefone_hospede) {
                hospede = await Hospede.buscarOuCriar({
                    nome: req.body.nome_hospede,
                    email: req.body.email_hospede,
                    telefone: req.body.telefone_hospede,
                    cidade: req.body.cidade_hospede || null,
                    estado: req.body.estado_hospede || null,
                    origem_canal: req.body.origem_canal || 'site',
                    como_nos_encontrou: req.body.como_nos_encontrou || req.body.origem_canal || null
                });
            }

            // Calcular valor usando serviço de tarifas
            let valor_total = req.body.valor_total;
            let valor_subtotal = 0;
            let valor_desconto = 0;
            let cupom_id = null;

            if (!valor_total && chale_id) {
                const calculo = await TarifaService.calcularValorEstadia({
                    chale_id,
                    data_checkin,
                    data_checkout,
                    num_adultos,
                    num_criancas,
                    cupom_codigo: req.body.cupom_codigo,
                    idades_criancas: req.body.idades_criancas || []
                });

                valor_subtotal = calculo.valor_subtotal;
                valor_desconto = calculo.desconto;
                valor_total = calculo.valor_total;

                // Se cupom foi aplicado, buscar ID do cupom
                if (calculo.cupom) {
                    const cupom = await Cupom.buscarPorCodigo(req.body.cupom_codigo);
                    if (cupom) {
                        cupom_id = cupom.id;
                        // Incrementar uso do cupom
                        await Cupom.incrementarUso(cupom.id);
                    }
                }
            }

            // Registrar evento de tracking
            if (req.body.utm_source || req.body.gclid) {
                await EventoTracking.criar({
                    tipo_evento: 'reserva_criada',
                    categoria: 'conversao',
                    sessao_id: req.body.sessao_id,
                    ip_address: req.ip || req.connection.remoteAddress,
                    user_agent: req.get('user-agent'),
                    url: req.get('referer'),
                    utm_source: req.body.utm_source,
                    utm_medium: req.body.utm_medium,
                    utm_campaign: req.body.utm_campaign,
                    utm_term: req.body.utm_term,
                    utm_content: req.body.utm_content,
                    gclid: req.body.gclid
                });
            }

            const novaReserva = await Reserva.criar({
                ...req.body,
                hospede_id: hospede?.id,
                valor_total,
                valor_subtotal,
                valor_desconto,
                cupom_id,
                num_diarias: validacao.num_diarias,
                diaria_minima: validacao.diaria_minima,
                status: 'solicitacao_recebida',
                cidade_hospede: req.body.cidade_hospede || null,
                forma_pagamento: req.body.forma_pagamento || null,
                observacoes: req.body.observacoes || null,
                consentimento_lgpd: req.body.consentimento_lgpd || false,
                politica_privacidade_aceita: req.body.politica_privacidade_aceita || false,
                data_consentimento: (req.body.consentimento_lgpd || req.body.politica_privacidade_aceita) 
                    ? new Date().toISOString() 
                    : null
            });

            // Registrar evento de booking_request
            const TrackingService = require('../services/trackingService');
            const utm = TrackingService.extrairUTM(req);
            
            await TrackingService.registrarBookingRequest(novaReserva.id, {
                valor_total: novaReserva.valor_total,
                forma_pagamento: novaReserva.forma_pagamento
            }, utm, req.body.sessao_id).catch(err => {
                console.error('Erro ao registrar evento de booking_request:', err);
            });
            
            return res.status(201).json({
                mensagem: 'Reserva criada com sucesso',
                reserva: novaReserva
            });

        } catch (erro) {
            console.error('Erro ao criar reserva:', erro);
            return res.status(500).json({ 
                erro: 'Erro no servidor',
                mensagem: 'Erro ao criar reserva'
            });
        }
    }

    async atualizar(req, res) {
        try {
            const { id } = req.params;
            
            const reservaExistente = await Reserva.buscarPorId(id);
            if (!reservaExistente) {
                return res.status(404).json({ 
                    erro: 'Reserva não encontrada'
                });
            }

            // Se estiver mudando o chalé ou as datas, verificar disponibilidade
            if (req.body.chale_id || req.body.data_checkin || req.body.data_checkout) {
                const chale_id = req.body.chale_id || reservaExistente.chale_id;
                const data_checkin = req.body.data_checkin || reservaExistente.data_checkin;
                const data_checkout = req.body.data_checkout || reservaExistente.data_checkout;

                // Validação completa excluindo a reserva atual
                const DisponibilidadeService = require('../services/disponibilidadeService');
                const validacao = await DisponibilidadeService.validarDisponibilidade({
                    chale_id,
                    data_checkin,
                    data_checkout,
                    num_adultos: req.body.num_adultos || reservaExistente.num_adultos,
                    num_criancas: req.body.num_criancas || reservaExistente.num_criancas
                });

                // Verificar disponibilidade excluindo a reserva atual
                const disponivel = await Chale.verificarDisponibilidade(
                    chale_id, 
                    data_checkin, 
                    data_checkout,
                    id
                );

                if (!disponivel || !validacao.valido) {
                    return res.status(400).json({ 
                        erro: 'Chalé indisponível',
                        mensagem: 'O chalé não está disponível para o período escolhido',
                        erros: validacao.erros
                    });
                }
            }

            const reservaAtualizada = await Reserva.atualizar(id, req.body);
            
            return res.json({
                mensagem: 'Reserva atualizada com sucesso',
                reserva: reservaAtualizada
            });

        } catch (erro) {
            console.error('Erro ao atualizar reserva:', erro);
            return res.status(500).json({ 
                erro: 'Erro no servidor',
                mensagem: 'Erro ao atualizar reserva'
            });
        }
    }

    async deletar(req, res) {
        try {
            const { id } = req.params;
            
            const reservaExistente = await Reserva.buscarPorId(id);
            if (!reservaExistente) {
                return res.status(404).json({ 
                    erro: 'Reserva não encontrada'
                });
            }

            await Reserva.deletar(id);
            
            return res.json({
                mensagem: 'Reserva deletada com sucesso'
            });

        } catch (erro) {
            console.error('Erro ao deletar reserva:', erro);
            return res.status(500).json({ 
                erro: 'Erro no servidor',
                mensagem: 'Erro ao deletar reserva'
            });
        }
    }

    async atualizarStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!status) {
                return res.status(400).json({ 
                    erro: 'Status é obrigatório'
                });
            }

            // Usar workflow service para validar e atualizar status
            const ReservaWorkflowService = require('../services/reservaWorkflowService');
            
            const reservaAtualizada = await ReservaWorkflowService.atualizarStatus(id, status, {
                usuario_id: req.usuario?.id
            });
            
            return res.json({
                mensagem: 'Status da reserva atualizado com sucesso',
                reserva: reservaAtualizada
            });

        } catch (erro) {
            console.error('Erro ao atualizar status:', erro);
            return res.status(500).json({ 
                erro: 'Erro no servidor',
                mensagem: 'Erro ao atualizar status da reserva'
            });
        }
    }

    async buscarChalesDisponiveis(req, res) {
        try {
            const { data_checkin, data_checkout } = req.query;

            if (!data_checkin || !data_checkout) {
                return res.status(400).json({ 
                    erro: 'Parâmetros inválidos',
                    mensagem: 'data_checkin e data_checkout são obrigatórios'
                });
            }

            const chalesDisponiveis = await Reserva.buscarChalesDisponiveis(
                data_checkin, 
                data_checkout
            );
            
            return res.json({
                data_checkin,
                data_checkout,
                total: chalesDisponiveis.length,
                chales: chalesDisponiveis
            });

        } catch (erro) {
            console.error('Erro ao buscar chalés disponíveis:', erro);
            return res.status(500).json({ 
                erro: 'Erro no servidor',
                mensagem: 'Erro ao buscar chalés disponíveis'
            });
        }
    }

    async buscarPorPeriodo(req, res) {
        try {
            const { data_inicio, data_fim } = req.query;

            if (!data_inicio || !data_fim) {
                return res.status(400).json({ 
                    erro: 'Parâmetros inválidos',
                    mensagem: 'data_inicio e data_fim são obrigatórios'
                });
            }

            const reservas = await Reserva.buscarPorPeriodo(data_inicio, data_fim);
            
            return res.json({
                data_inicio,
                data_fim,
                total: reservas.length,
                reservas
            });

        } catch (erro) {
            console.error('Erro ao buscar reservas por período:', erro);
            return res.status(500).json({ 
                erro: 'Erro no servidor',
                mensagem: 'Erro ao buscar reservas'
            });
        }
    }
}

module.exports = new ReservaController();

