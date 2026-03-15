const Notificacao = require('../models/Notificacao');
const notificacaoService = require('../services/notificacaoService');
const { validationResult } = require('express-validator');

class NotificacaoController {
    /**
     * GET /api/notificacoes - Lista notificações do usuário autenticado
     */
    static async listar(req, res) {
        try {
            const usuarioId = req.usuario.id;
            const filtros = {
                status: req.query.status,
                tipo: req.query.tipo,
                nao_lidas: req.query.nao_lidas === 'true',
                limite: parseInt(req.query.limite) || 20
            };

            const notificacoes = await Notificacao.buscarPorUsuario(usuarioId, filtros);
            const naoLidas = await Notificacao.contarNaoLidas(usuarioId);

            res.json({
                sucesso: true,
                dados: {
                    notificacoes,
                    total_nao_lidas: naoLidas
                }
            });
        } catch (erro) {
            console.error('Erro ao listar notificações:', erro);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro ao listar notificações'
            });
        }
    }

    /**
     * GET /api/notificacoes/:id - Obtém detalhes de uma notificação
     */
    static async obter(req, res) {
        try {
            const notificacao = await Notificacao.buscarPorId(req.params.id);

            if (!notificacao) {
                return res.status(404).json({
                    sucesso: false,
                    erro: 'Notificação não encontrada'
                });
            }

            // Verificar se pertence ao usuário (ou é admin)
            if (notificacao.usuario_id !== req.usuario.id && req.usuario.role !== 'admin') {
                return res.status(403).json({
                    sucesso: false,
                    erro: 'Sem permissão para acessar esta notificação'
                });
            }

            res.json({
                sucesso: true,
                dados: notificacao
            });
        } catch (erro) {
            console.error('Erro ao obter notificação:', erro);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro ao obter notificação'
            });
        }
    }

    /**
     * PATCH /api/notificacoes/:id/lida - Marca notificação como lida
     */
    static async marcarComoLida(req, res) {
        try {
            const notificacao = await Notificacao.buscarPorId(req.params.id);

            if (!notificacao) {
                return res.status(404).json({
                    sucesso: false,
                    erro: 'Notificação não encontrada'
                });
            }

            // Verificar permissão
            if (notificacao.usuario_id !== req.usuario.id && req.usuario.role !== 'admin') {
                return res.status(403).json({
                    sucesso: false,
                    erro: 'Sem permissão'
                });
            }

            await Notificacao.marcarComoLida(req.params.id);

            res.json({
                sucesso: true,
                mensagem: 'Notificação marcada como lida'
            });
        } catch (erro) {
            console.error('Erro ao marcar como lida:', erro);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro ao marcar como lida'
            });
        }
    }

    /**
     * POST /api/notificacoes/marcar-multiplas-lidas - Marca múltiplas como lidas
     */
    static async marcarMultiplasComoLidas(req, res) {
        try {
            const { ids } = req.body;

            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'IDs de notificações inválidos'
                });
            }

            // TODO: Verificar se todas pertencem ao usuário
            await Notificacao.marcarMultiplasComoLidas(ids);

            res.json({
                sucesso: true,
                mensagem: `${ids.length} notificações marcadas como lidas`
            });
        } catch (erro) {
            console.error('Erro ao marcar múltiplas como lidas:', erro);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro ao atualizar notificações'
            });
        }
    }

    /**
     * DELETE /api/notificacoes/:id - Deleta uma notificação
     */
    static async deletar(req, res) {
        try {
            const notificacao = await Notificacao.buscarPorId(req.params.id);

            if (!notificacao) {
                return res.status(404).json({
                    sucesso: false,
                    erro: 'Notificação não encontrada'
                });
            }

            // Verificar permissão
            if (notificacao.usuario_id !== req.usuario.id && req.usuario.role !== 'admin') {
                return res.status(403).json({
                    sucesso: false,
                    erro: 'Sem permissão'
                });
            }

            await Notificacao.deletar(req.params.id);

            res.json({
                sucesso: true,
                mensagem: 'Notificação deletada'
            });
        } catch (erro) {
            console.error('Erro ao deletar notificação:', erro);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro ao deletar notificação'
            });
        }
    }

    /**
     * GET /api/notificacoes/nao-lidas/contar - Conta notificações não lidas
     */
    static async contarNaoLidas(req, res) {
        try {
            const usuarioId = req.usuario.id;
            const total = await Notificacao.contarNaoLidas(usuarioId);

            res.json({
                sucesso: true,
                dados: {
                    total_nao_lidas: total
                }
            });
        } catch (erro) {
            console.error('Erro ao contar notificações não lidas:', erro);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro ao contar notificações'
            });
        }
    }

    /**
     * GET /api/notificacoes/recurso/:tipo/:id - Busca notificações de um recurso
     */
    static async buscarPorRecurso(req, res) {
        try {
            const { tipo, id } = req.params;

            // Validar tipo de recurso
            const tiposValidos = ['chale', 'reserva', 'pagamento'];
            if (!tiposValidos.includes(tipo)) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Tipo de recurso inválido'
                });
            }

            const notificacoes = await Notificacao.buscarPorRecurso(tipo, id);

            res.json({
                sucesso: true,
                dados: {
                    recurso_tipo: tipo,
                    recurso_id: id,
                    notificacoes
                }
            });
        } catch (erro) {
            console.error('Erro ao buscar notificações por recurso:', erro);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro ao buscar notificações'
            });
        }
    }

    /**
     * POST /api/notificacoes/testar - Envia notificação de teste (admin)
     */
    static async testar(req, res) {
        try {
            // Verificar se é admin
            if (req.usuario.role !== 'admin') {
                return res.status(403).json({
                    sucesso: false,
                    erro: 'Apenas administradores podem enviar notificações de teste'
                });
            }

            const { email, tipo } = req.body;

            if (!email) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Email é obrigatório'
                });
            }

            const tipoTeste = tipo || Notificacao.TIPOS.ALERTA_SISTEMA;

            const notificacao = await notificacaoService.criarEEnviar({
                tipo: tipoTeste,
                titulo: '🧪 Notificação de Teste',
                conteudo: 'Esta é uma notificação de teste do sistema.',
                email: email,
                canais_entrega: 'email',
                dados_extra: {
                    teste: true,
                    timestamp: new Date()
                }
            });

            res.json({
                sucesso: true,
                mensagem: 'Notificação de teste enviada',
                dados: notificacao
            });
        } catch (erro) {
            console.error('Erro ao enviar notificação de teste:', erro);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro ao enviar notificação de teste'
            });
        }
    }

    /**
     * GET /api/notificacoes/tipos/listar - Lista tipos de notificações disponíveis
     */
    static async listarTipos(req, res) {
        try {
            res.json({
                sucesso: true,
                dados: {
                    tipos: Object.values(Notificacao.TIPOS),
                    status: Object.values(Notificacao.STATUS),
                    canais: Object.values(Notificacao.CANAIS)
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

    /**
     * POST /api/notificacoes - Cria notificação manual (admin)
     */
    static async criar(req, res) {
        try {
            // Validar permissão
            if (req.usuario.role !== 'admin') {
                return res.status(403).json({
                    sucesso: false,
                    erro: 'Apenas administradores podem criar notificações'
                });
            }

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    sucesso: false,
                    erros: errors.array()
                });
            }

            const { titulo, conteudo, tipo, usuario_id, email, canais_entrega } = req.body;

            if (!titulo || !conteudo || !tipo) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Título, conteúdo e tipo são obrigatórios'
                });
            }

            const notificacao = await notificacaoService.criarEEnviar({
                titulo,
                conteudo,
                tipo,
                usuario_id: usuario_id || null,
                email: email || null,
                canais_entrega: canais_entrega || 'email,in_app'
            });

            res.status(201).json({
                sucesso: true,
                mensagem: 'Notificação criada e enviada com sucesso',
                dados: notificacao
            });
        } catch (erro) {
            console.error('Erro ao criar notificação:', erro);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro ao criar notificação'
            });
        }
    }

    /**
     * GET /api/notificacoes/pendentes/processar - Processa fila de notificações (admin)
     */
    static async processarPendentes(req, res) {
        try {
            if (req.usuario.role !== 'admin') {
                return res.status(403).json({
                    sucesso: false,
                    erro: 'Apenas administradores'
                });
            }

            await notificacaoService.processarFilaPendentes();

            res.json({
                sucesso: true,
                mensagem: 'Fila de notificações processada'
            });
        } catch (erro) {
            console.error('Erro ao processar fila:', erro);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro ao processar fila'
            });
        }
    }
}

module.exports = NotificacaoController;
