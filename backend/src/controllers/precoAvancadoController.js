const { validationResult } = require('express-validator');
const PricingService = require('../services/pricingService');
const PoliticaCancelamento = require('../models/PoliticaCancelamento');
const PrecoAdicional = require('../models/PrecoAdicional');
const Chale = require('../models/Chale');

class PrecoController {
    /**
     * POST /api/precos/calcular-dinamico
     * Calcula preço dinâmico completo com todas as regras
     */
    static async calcularDinamico(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    sucesso: false,
                    erros: errors.array()
                });
            }

            const { chale_id, data_checkin, data_checkout, num_hospedes, num_criancas } = req.body;

            const calculo = await PricingService.calcularPrecoCompleto(
                chale_id,
                data_checkin,
                data_checkout,
                num_hospedes || 2,
                num_criancas || 0
            );

            res.json(calculo);
        } catch (erro) {
            console.error('Erro ao calcular preço dinâmico:', erro);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro ao calcular preço'
            });
        }
    }

    /**
     * GET /api/precos/simular-cenarios
     * Simula múltiplos cenários de preço
     */
    static async simularCenarios(req, res) {
        try {
            const { chale_id, data_checkin, data_checkout, num_hospedes } = req.query;

            if (!chale_id || !data_checkin || !data_checkout) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Parâmetros obrigatórios: chale_id, data_checkin, data_checkout'
                });
            }

            const resultado = await PricingService.simularCenarios(
                parseInt(chale_id),
                data_checkin,
                data_checkout,
                parseInt(num_hospedes) || 2
            );

            res.json(resultado);
        } catch (erro) {
            console.error('Erro ao simular cenários:', erro);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro ao simular cenários'
            });
        }
    }

    /**
     * POST /api/precos/cancelamento
     * Calcula impacto de cancelamento
     */
    static async calcularCancelamento(req, res) {
        try {
            const { chale_id, valor_total, dias_antes_checkin } = req.body;

            if (!chale_id || !valor_total) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Parâmetros obrigatórios: chale_id, valor_total'
                });
            }

            const calculo = await PricingService.calcularTarifaCancelamento(
                chale_id,
                parseFloat(valor_total),
                parseInt(dias_antes_checkin) || 0
            );

            res.json({
                sucesso: true,
                dados: calculo
            });
        } catch (erro) {
            console.error('Erro ao calcular cancelamento:', erro);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro ao calcular cancelamento'
            });
        }
    }

    // ========== POLÍTICAS DE CANCELAMENTO ==========

    /**
     * POST /api/precos/politicas
     * Cria política de cancelamento
     */
    static async criarPolitica(req, res) {
        try {
            // Verificar permissão (admin)
            if (req.usuario.role !== 'admin') {
                return res.status(403).json({
                    sucesso: false,
                    erro: 'Apenas administradores'
                });
            }

            const { chale_id, tipo, taxa_adicional_percentual, descricao } = req.body;

            if (!chale_id || !tipo) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Parâmetros obrigatórios: chale_id, tipo'
                });
            }

            const politica = await PoliticaCancelamento.criar({
                chale_id,
                tipo,
                taxa_adicional_percentual: taxa_adicional_percentual || 0,
                descricao
            });

            res.status(201).json({
                sucesso: true,
                mensagem: 'Política criada com sucesso',
                dados: politica
            });
        } catch (erro) {
            console.error('Erro ao criar política:', erro);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro ao criar política'
            });
        }
    }

    /**
     * GET /api/precos/politicas/:chale_id
     * Obtém política de um chalé
     */
    static async obterPolitica(req, res) {
        try {
            const politica = await PoliticaCancelamento.buscarPorChale(
                parseInt(req.params.chale_id)
            );

            if (!politica) {
                return res.status(404).json({
                    sucesso: false,
                    erro: 'Política não encontrada'
                });
            }

            res.json({
                sucesso: true,
                dados: politica
            });
        } catch (erro) {
            console.error('Erro ao obter política:', erro);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro ao obter política'
            });
        }
    }

    /**
     * PUT /api/precos/politicas/:id
     * Atualiza política
     */
    static async atualizarPolitica(req, res) {
        try {
            if (req.usuario.role !== 'admin') {
                return res.status(403).json({
                    sucesso: false,
                    erro: 'Apenas administradores'
                });
            }

            const politica = await PoliticaCancelamento.atualizar(
                parseInt(req.params.id),
                req.body
            );

            res.json({
                sucesso: true,
                mensagem: 'Política atualizada',
                dados: politica
            });
        } catch (erro) {
            console.error('Erro ao atualizar política:', erro);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro ao atualizar política'
            });
        }
    }

    // ========== PREÇOS ADICIONAIS ==========

    /**
     * POST /api/precos/adicionais
     * Cria preço adicional
     */
    static async criarAdicional(req, res) {
        try {
            if (req.usuario.role !== 'admin') {
                return res.status(403).json({
                    sucesso: false,
                    erro: 'Apenas administradores'
                });
            }

            const { chale_id, tipo, preco_por_noite, descricao } = req.body;

            if (!chale_id || !tipo || !preco_por_noite) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Parâmetros obrigatórios: chale_id, tipo, preco_por_noite'
                });
            }

            const adicional = await PrecoAdicional.criar({
                chale_id,
                tipo,
                preco_por_noite: parseFloat(preco_por_noite),
                descricao
            });

            res.status(201).json({
                sucesso: true,
                mensagem: 'Preço adicional criado',
                dados: adicional
            });
        } catch (erro) {
            console.error('Erro ao criar adicional:', erro);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro ao criar adicional'
            });
        }
    }

    /**
     * GET /api/precos/adicionais/:chale_id
     * Lista preços adicionais de um chalé
     */
    static async listarAdicionais(req, res) {
        try {
            const adicionais = await PrecoAdicional.buscarPorChale(
                parseInt(req.params.chale_id),
                true
            );

            res.json({
                sucesso: true,
                dados: adicionais
            });
        } catch (erro) {
            console.error('Erro ao listar adicionais:', erro);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro ao listar adicionais'
            });
        }
    }

    /**
     * PUT /api/precos/adicionais/:id
     * Atualiza preço adicional
     */
    static async atualizarAdicional(req, res) {
        try {
            if (req.usuario.role !== 'admin') {
                return res.status(403).json({
                    sucesso: false,
                    erro: 'Apenas administradores'
                });
            }

            const adicional = await PrecoAdicional.atualizar(
                parseInt(req.params.id),
                req.body
            );

            res.json({
                sucesso: true,
                mensagem: 'Adicional atualizado',
                dados: adicional
            });
        } catch (erro) {
            console.error('Erro ao atualizar adicional:', erro);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro ao atualizar adicional'
            });
        }
    }

    /**
     * DELETE /api/precos/adicionais/:id
     * Deleta preço adicional
     */
    static async deletarAdicional(req, res) {
        try {
            if (req.usuario.role !== 'admin') {
                return res.status(403).json({
                    sucesso: false,
                    erro: 'Apenas administradores'
                });
            }

            const deletado = await PrecoAdicional.deletar(parseInt(req.params.id));

            if (!deletado) {
                return res.status(404).json({
                    sucesso: false,
                    erro: 'Preço adicional não encontrado'
                });
            }

            res.json({
                sucesso: true,
                mensagem: 'Preço adicional deletado'
            });
        } catch (erro) {
            console.error('Erro ao deletar adicional:', erro);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro ao deletar adicional'
            });
        }
    }

    /**
     * GET /api/precos/info-tipos
     * Lista tipos de políticas e adicionais
     */
    static async listarTipos(req, res) {
        try {
            res.json({
                sucesso: true,
                dados: {
                    tipos_politica: Object.values(PoliticaCancelamento.TIPOS),
                    tipos_adicional: Object.values(PrecoAdicional.TIPOS),
                    descricoes: {
                        politica: {
                            flexivel: 'Reembolso até 30 dias, +10-15% taxa',
                            nao_reembolsavel: 'Reembolso até 7 dias, sem taxa',
                            moderada: 'Reembolso até 14 dias, +5% taxa',
                            rigorosa: 'Reembolso até 7 dias, +20% taxa'
                        },
                        adicional: {
                            hospede_extra: '3º ou 4º hóspede (R$60-100/noite)',
                            crianca: 'Criança até 12 anos (R$30-50/noite)',
                            bebe: 'Bebê até 3 anos (R$15-25/noite)',
                            pet: 'Animais de estimação (R$50-100/noite)',
                            limpeza_extra: 'Limpeza adicional (R$100-200)',
                            cama_extra: 'Cama extra ou sofá-cama (R$60-150/noite)'
                        }
                    }
                }
            });
        } catch (erro) {
            console.error('Erro ao listar tipos:', erro);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro ao listar tipos'
            });
        }
    }
}

module.exports = PrecoController;
