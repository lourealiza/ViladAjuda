const Bloqueio = require('../models/Bloqueio');
const AuditoriaService = require('../services/auditoriaService');

class BloqueioController {
    /**
     * Listar bloqueios
     */
    static async listar(req, res) {
        try {
            const filtros = {
                chale_id: req.query.chale_id,
                tipo: req.query.tipo,
                data_inicio: req.query.data_inicio,
                data_fim: req.query.data_fim
            };

            const bloqueios = await Bloqueio.buscarTodos(filtros);
            res.json(bloqueios);
        } catch (erro) {
            console.error('Erro ao listar bloqueios:', erro);
            res.status(500).json({
                erro: 'Erro ao listar bloqueios',
                mensagem: erro.message
            });
        }
    }

    /**
     * Buscar bloqueio por ID
     */
    static async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const bloqueio = await Bloqueio.buscarPorId(id);
            
            if (!bloqueio) {
                return res.status(404).json({
                    erro: 'Bloqueio não encontrado',
                    mensagem: `Bloqueio com ID ${id} não foi encontrado`
                });
            }
            
            res.json(bloqueio);
        } catch (erro) {
            console.error('Erro ao buscar bloqueio:', erro);
            res.status(500).json({
                erro: 'Erro ao buscar bloqueio',
                mensagem: erro.message
            });
        }
    }

    /**
     * Criar bloqueio
     */
    static async criar(req, res) {
        try {
            const bloqueio = await Bloqueio.criar({
                ...req.body,
                criado_por: req.usuario?.id
            });
            
            // Registrar auditoria
            await AuditoriaService.registrarBloqueioData(
                req.usuario?.id,
                'criado',
                null,
                bloqueio,
                req
            ).catch(err => console.error('Erro ao registrar auditoria:', err));
            
            res.status(201).json(bloqueio);
        } catch (erro) {
            console.error('Erro ao criar bloqueio:', erro);
            res.status(500).json({
                erro: 'Erro ao criar bloqueio',
                mensagem: erro.message
            });
        }
    }

    /**
     * Atualizar bloqueio
     */
    static async atualizar(req, res) {
        try {
            const { id } = req.params;
            const bloqueioAntes = await Bloqueio.buscarPorId(id);
            const bloqueio = await Bloqueio.atualizar(id, req.body);
            
            // Registrar auditoria
            await AuditoriaService.registrarBloqueioData(
                req.usuario?.id,
                'atualizado',
                bloqueioAntes,
                bloqueio,
                req
            ).catch(err => console.error('Erro ao registrar auditoria:', err));
            
            res.json(bloqueio);
        } catch (erro) {
            console.error('Erro ao atualizar bloqueio:', erro);
            res.status(500).json({
                erro: 'Erro ao atualizar bloqueio',
                mensagem: erro.message
            });
        }
    }

    /**
     * Deletar bloqueio
     */
    static async deletar(req, res) {
        try {
            const { id } = req.params;
            const bloqueioAntes = await Bloqueio.buscarPorId(id);
            await Bloqueio.deletar(id);
            
            // Registrar auditoria
            await AuditoriaService.registrarBloqueioData(
                req.usuario?.id,
                'deletado',
                bloqueioAntes,
                null,
                req
            ).catch(err => console.error('Erro ao registrar auditoria:', err));
            
            res.json({ mensagem: 'Bloqueio deletado com sucesso' });
        } catch (erro) {
            console.error('Erro ao deletar bloqueio:', erro);
            res.status(500).json({
                erro: 'Erro ao deletar bloqueio',
                mensagem: erro.message
            });
        }
    }

    /**
     * Verificar bloqueio
     */
    static async verificar(req, res) {
        try {
            const { chale_id, data_checkin, data_checkout } = req.query;

            if (!data_checkin || !data_checkout) {
                return res.status(400).json({
                    erro: 'Datas obrigatórias',
                    mensagem: 'data_checkin e data_checkout são obrigatórias'
                });
            }

            const bloqueado = await Bloqueio.verificarBloqueio(
                chale_id || null,
                data_checkin,
                data_checkout
            );

            res.json({
                bloqueado,
                periodo: {
                    checkin: data_checkin,
                    checkout: data_checkout
                }
            });
        } catch (erro) {
            console.error('Erro ao verificar bloqueio:', erro);
            res.status(500).json({
                erro: 'Erro ao verificar bloqueio',
                mensagem: erro.message
            });
        }
    }
}

module.exports = BloqueioController;

