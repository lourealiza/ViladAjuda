const Conteudo = require('../models/Conteudo');

class ConteudoController {
    /**
     * Listar conteúdos
     */
    static async listar(req, res) {
        try {
            const filtros = {
                tipo: req.query.tipo,
                secao: req.query.secao,
                chale_id: req.query.chale_id,
                ativo: req.query.ativo !== undefined ? req.query.ativo === 'true' : undefined
            };

            const conteudos = await Conteudo.buscarTodos(filtros);
            res.json(conteudos);
        } catch (erro) {
            console.error('Erro ao listar conteúdos:', erro);
            res.status(500).json({
                erro: 'Erro ao listar conteúdos',
                mensagem: erro.message
            });
        }
    }

    /**
     * Buscar conteúdo por ID
     */
    static async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const conteudo = await Conteudo.buscarPorId(id);

            if (!conteudo) {
                return res.status(404).json({
                    erro: 'Conteúdo não encontrado'
                });
            }

            res.json(conteudo);
        } catch (erro) {
            console.error('Erro ao buscar conteúdo:', erro);
            res.status(500).json({
                erro: 'Erro ao buscar conteúdo',
                mensagem: erro.message
            });
        }
    }

    /**
     * Buscar conteúdo por slug
     */
    static async buscarPorSlug(req, res) {
        try {
            const { slug } = req.params;
            const conteudo = await Conteudo.buscarPorSlug(slug);

            if (!conteudo) {
                return res.status(404).json({
                    erro: 'Conteúdo não encontrado'
                });
            }

            res.json(conteudo);
        } catch (erro) {
            console.error('Erro ao buscar conteúdo por slug:', erro);
            res.status(500).json({
                erro: 'Erro ao buscar conteúdo por slug',
                mensagem: erro.message
            });
        }
    }

    /**
     * Buscar conteúdos por tipo
     */
    static async buscarPorTipo(req, res) {
        try {
            const { tipo } = req.params;
            const apenasAtivos = req.query.ativo !== 'false';
            const conteudos = await Conteudo.buscarPorTipo(tipo, apenasAtivos);
            res.json(conteudos);
        } catch (erro) {
            console.error('Erro ao buscar conteúdos por tipo:', erro);
            res.status(500).json({
                erro: 'Erro ao buscar conteúdos por tipo',
                mensagem: erro.message
            });
        }
    }

    /**
     * Buscar landing pages
     */
    static async buscarLandingPages(req, res) {
        try {
            const apenasAtivas = req.query.ativo !== 'false';
            const landingPages = await Conteudo.buscarLandingPages(apenasAtivas);
            res.json(landingPages);
        } catch (erro) {
            console.error('Erro ao buscar landing pages:', erro);
            res.status(500).json({
                erro: 'Erro ao buscar landing pages',
                mensagem: erro.message
            });
        }
    }

    /**
     * Buscar conteúdo por seção
     */
    static async buscarPorSecao(req, res) {
        try {
            const { secao } = req.params;
            const apenasAtivos = req.query.ativo !== 'false';
            const conteudos = await Conteudo.buscarPorSecao(secao, apenasAtivos);
            res.json(conteudos);
        } catch (erro) {
            console.error('Erro ao buscar conteúdo por seção:', erro);
            res.status(500).json({
                erro: 'Erro ao buscar conteúdo por seção',
                mensagem: erro.message
            });
        }
    }

    /**
     * Buscar galeria (geral ou por chalé)
     */
    static async buscarGaleria(req, res) {
        try {
            const chaleId = req.query.chale_id || null;
            const apenasAtivos = req.query.ativo !== 'false';
            const galeria = await Conteudo.buscarGaleria(chaleId, apenasAtivos);
            res.json(galeria);
        } catch (erro) {
            console.error('Erro ao buscar galeria:', erro);
            res.status(500).json({
                erro: 'Erro ao buscar galeria',
                mensagem: erro.message
            });
        }
    }

    /**
     * Criar conteúdo
     */
    static async criar(req, res) {
        try {
            const conteudo = await Conteudo.criar(req.body);
            res.status(201).json(conteudo);
        } catch (erro) {
            console.error('Erro ao criar conteúdo:', erro);
            res.status(500).json({
                erro: 'Erro ao criar conteúdo',
                mensagem: erro.message
            });
        }
    }

    /**
     * Atualizar conteúdo
     */
    static async atualizar(req, res) {
        try {
            const { id } = req.params;
            const conteudo = await Conteudo.atualizar(id, req.body);
            res.json(conteudo);
        } catch (erro) {
            console.error('Erro ao atualizar conteúdo:', erro);
            res.status(500).json({
                erro: 'Erro ao atualizar conteúdo',
                mensagem: erro.message
            });
        }
    }

    /**
     * Deletar conteúdo
     */
    static async deletar(req, res) {
        try {
            const { id } = req.params;
            await Conteudo.deletar(id);
            res.json({ mensagem: 'Conteúdo deletado com sucesso' });
        } catch (erro) {
            console.error('Erro ao deletar conteúdo:', erro);
            res.status(500).json({
                erro: 'Erro ao deletar conteúdo',
                mensagem: erro.message
            });
        }
    }
}

module.exports = ConteudoController;
