const Chale = require('../models/Chale');

class ChaleController {
    async listar(req, res) {
        try {
            const apenasAtivos = req.query.ativo === 'true';
            const chales = await Chale.buscarTodos(apenasAtivos);
            
            return res.json({ 
                total: chales.length,
                chales 
            });

        } catch (erro) {
            console.error('Erro ao listar chalés:', erro);
            return res.status(500).json({ 
                erro: 'Erro no servidor',
                mensagem: 'Erro ao buscar chalés'
            });
        }
    }

    async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const chale = await Chale.buscarPorId(id);
            
            if (!chale) {
                return res.status(404).json({ 
                    erro: 'Chalé não encontrado'
                });
            }

            return res.json({ chale });

        } catch (erro) {
            console.error('Erro ao buscar chalé:', erro);
            return res.status(500).json({ 
                erro: 'Erro no servidor',
                mensagem: 'Erro ao buscar chalé'
            });
        }
    }

    async criar(req, res) {
        try {
            const novoChale = await Chale.criar(req.body);
            
            return res.status(201).json({
                mensagem: 'Chalé criado com sucesso',
                chale: novoChale
            });

        } catch (erro) {
            console.error('Erro ao criar chalé:', erro);
            return res.status(500).json({ 
                erro: 'Erro no servidor',
                mensagem: 'Erro ao criar chalé'
            });
        }
    }

    async atualizar(req, res) {
        try {
            const { id } = req.params;
            
            const chaleExistente = await Chale.buscarPorId(id);
            if (!chaleExistente) {
                return res.status(404).json({ 
                    erro: 'Chalé não encontrado'
                });
            }

            const chaleAtualizado = await Chale.atualizar(id, req.body);
            
            return res.json({
                mensagem: 'Chalé atualizado com sucesso',
                chale: chaleAtualizado
            });

        } catch (erro) {
            console.error('Erro ao atualizar chalé:', erro);
            return res.status(500).json({ 
                erro: 'Erro no servidor',
                mensagem: 'Erro ao atualizar chalé'
            });
        }
    }

    async deletar(req, res) {
        try {
            const { id } = req.params;
            
            const chaleExistente = await Chale.buscarPorId(id);
            if (!chaleExistente) {
                return res.status(404).json({ 
                    erro: 'Chalé não encontrado'
                });
            }

            await Chale.deletar(id);
            
            return res.json({
                mensagem: 'Chalé deletado com sucesso'
            });

        } catch (erro) {
            console.error('Erro ao deletar chalé:', erro);
            return res.status(500).json({ 
                erro: 'Erro no servidor',
                mensagem: 'Erro ao deletar chalé'
            });
        }
    }

    async verificarDisponibilidade(req, res) {
        try {
            const { id } = req.params;
            const { data_checkin, data_checkout } = req.query;

            if (!data_checkin || !data_checkout) {
                return res.status(400).json({ 
                    erro: 'Parâmetros inválidos',
                    mensagem: 'data_checkin e data_checkout são obrigatórios'
                });
            }

            const chaleExistente = await Chale.buscarPorId(id);
            if (!chaleExistente) {
                return res.status(404).json({ 
                    erro: 'Chalé não encontrado'
                });
            }

            const disponivel = await Chale.verificarDisponibilidade(
                id, 
                data_checkin, 
                data_checkout
            );
            
            return res.json({
                chale_id: parseInt(id),
                data_checkin,
                data_checkout,
                disponivel
            });

        } catch (erro) {
            console.error('Erro ao verificar disponibilidade:', erro);
            return res.status(500).json({ 
                erro: 'Erro no servidor',
                mensagem: 'Erro ao verificar disponibilidade'
            });
        }
    }
}

module.exports = new ChaleController();

