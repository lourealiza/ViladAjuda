const AvaliacaoGoogle = require('../models/AvaliacaoGoogle');

class AvaliacaoController {
    /**
     * Listar avaliações (público)
     */
    static async listar(req, res) {
        try {
            const filtros = {
                ativo: req.query.ativo !== undefined ? req.query.ativo === 'true' : true,
                rating_min: req.query.rating_min ? parseInt(req.query.rating_min) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit) : undefined
            };

            const avaliacoes = await AvaliacaoGoogle.buscarTodos(filtros);
            res.json(avaliacoes);
        } catch (erro) {
            console.error('Erro ao listar avaliações:', erro);
            res.status(500).json({
                erro: 'Erro ao listar avaliações',
                mensagem: erro.message
            });
        }
    }

    /**
     * Buscar avaliações para homepage (público)
     */
    static async buscarParaHomepage(req, res) {
        try {
            const limite = req.query.limite ? parseInt(req.query.limite) : 6;
            const avaliacoes = await AvaliacaoGoogle.buscarParaHomepage(limite);
            const estatisticas = await AvaliacaoGoogle.calcularMediaRating();

            res.json({
                avaliacoes,
                estatisticas
            });
        } catch (erro) {
            console.error('Erro ao buscar avaliações para homepage:', erro);
            res.status(500).json({
                erro: 'Erro ao buscar avaliações',
                mensagem: erro.message
            });
        }
    }

    /**
     * Obter estatísticas de avaliações (público)
     */
    static async obterEstatisticas(req, res) {
        try {
            const estatisticas = await AvaliacaoGoogle.calcularMediaRating();
            res.json(estatisticas);
        } catch (erro) {
            console.error('Erro ao obter estatísticas:', erro);
            res.status(500).json({
                erro: 'Erro ao obter estatísticas',
                mensagem: erro.message
            });
        }
    }

    /**
     * Buscar avaliação por ID (público)
     */
    static async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const avaliacao = await AvaliacaoGoogle.buscarPorId(id);

            if (!avaliacao) {
                return res.status(404).json({
                    erro: 'Avaliação não encontrada'
                });
            }

            res.json(avaliacao);
        } catch (erro) {
            console.error('Erro ao buscar avaliação:', erro);
            res.status(500).json({
                erro: 'Erro ao buscar avaliação',
                mensagem: erro.message
            });
        }
    }

    /**
     * Criar avaliação (protegido - admin)
     */
    static async criar(req, res) {
        try {
            if (!req.body.nome_autor || !req.body.rating) {
                return res.status(400).json({
                    erro: 'Dados obrigatórios',
                    mensagem: 'nome_autor e rating são obrigatórios'
                });
            }

            if (req.body.rating < 1 || req.body.rating > 5) {
                return res.status(400).json({
                    erro: 'Rating inválido',
                    mensagem: 'Rating deve ser entre 1 e 5'
                });
            }

            const avaliacao = await AvaliacaoGoogle.criar(req.body);
            res.status(201).json(avaliacao);
        } catch (erro) {
            console.error('Erro ao criar avaliação:', erro);
            res.status(500).json({
                erro: 'Erro ao criar avaliação',
                mensagem: erro.message
            });
        }
    }

    /**
     * Atualizar avaliação (protegido - admin)
     */
    static async atualizar(req, res) {
        try {
            const { id } = req.params;
            
            if (req.body.rating && (req.body.rating < 1 || req.body.rating > 5)) {
                return res.status(400).json({
                    erro: 'Rating inválido',
                    mensagem: 'Rating deve ser entre 1 e 5'
                });
            }

            const avaliacao = await AvaliacaoGoogle.atualizar(id, req.body);
            res.json(avaliacao);
        } catch (erro) {
            console.error('Erro ao atualizar avaliação:', erro);
            res.status(500).json({
                erro: 'Erro ao atualizar avaliação',
                mensagem: erro.message
            });
        }
    }

    /**
     * Deletar avaliação (protegido - admin)
     */
    static async deletar(req, res) {
        try {
            const { id } = req.params;
            await AvaliacaoGoogle.deletar(id);
            res.json({ mensagem: 'Avaliação deletada com sucesso' });
        } catch (erro) {
            console.error('Erro ao deletar avaliação:', erro);
            res.status(500).json({
                erro: 'Erro ao deletar avaliação',
                mensagem: erro.message
            });
        }
    }
}

module.exports = AvaliacaoController;

