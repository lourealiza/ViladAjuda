const Reserva = require('../models/Reserva');
const Chale = require('../models/Chale');
const { calcularValorEstadia, aplicarDescontoEstadiaLonga } = require('../config/precos');

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

            // Calcular valor total usando sistema de precificação dinâmica
            let valor_total = req.body.valor_total;
            let infoCalculoPreco = null;
            
            if (!valor_total) {
                // Usar capacidade do chalé ou valores padrão
                const capacidade = chale ? chale.capacidade_adultos : num_adultos;
                
                // Calcular valor da estadia
                const calculo = calcularValorEstadia(capacidade, data_checkin, data_checkout);
                
                // Aplicar desconto para estadias longas
                const comDesconto = aplicarDescontoEstadiaLonga(calculo.valorTotal, calculo.numeroNoites);
                
                valor_total = comDesconto.valorFinal;
                
                // Informações para log/referência
                infoCalculoPreco = {
                    valorBase: calculo.valorTotal,
                    valorMedioDiaria: calculo.valorMedioDiaria,
                    numeroNoites: calculo.numeroNoites,
                    desconto: comDesconto.aplicado ? {
                        percentual: comDesconto.percentualDesconto,
                        valor: comDesconto.valorDesconto
                    } : null,
                    valorFinal: valor_total
                };
                
                console.log('Cálculo de preço:', infoCalculoPreco);
            }

            const novaReserva = await Reserva.criar({
                ...req.body,
                valor_total
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

                // Verificar disponibilidade (excluindo a reserva atual)
                const disponivel = await Chale.verificarDisponibilidade(
                    chale_id, 
                    data_checkin, 
                    data_checkout
                );

                if (!disponivel) {
                    return res.status(400).json({ 
                        erro: 'Chalé indisponível',
                        mensagem: 'O chalé não está disponível para o período escolhido'
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

            const statusValidos = ['pendente', 'confirmada', 'cancelada', 'concluida'];
            if (!statusValidos.includes(status)) {
                return res.status(400).json({ 
                    erro: 'Status inválido',
                    mensagem: `Status deve ser um dos seguintes: ${statusValidos.join(', ')}`
                });
            }

            const reservaExistente = await Reserva.buscarPorId(id);
            if (!reservaExistente) {
                return res.status(404).json({ 
                    erro: 'Reserva não encontrada'
                });
            }

            const reservaAtualizada = await Reserva.atualizarStatus(id, status);
            
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

