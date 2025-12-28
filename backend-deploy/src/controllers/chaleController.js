const Chale = require('../models/Chale');
const Temporada = require('../models/Temporada');
const Feriado = require('../models/Feriado');

class ChaleController {
    /**
     * Calcula o preço dinâmico do chalé baseado na temporada/feriado de uma data específica
     * @param {Object} chale - Objeto do chalé
     * @param {String} data - Data no formato YYYY-MM-DD (opcional, usa hoje se não informado)
     */
    static async calcularPrecoDinamico(chale, data = null) {
        try {
            const dataConsulta = data || new Date().toISOString().split('T')[0];
            const precoBase = parseFloat(chale.preco_diaria || 350.00);
            
            // Verificar feriado primeiro (prioridade máxima)
            const feriado = await Feriado.buscarPorData(dataConsulta);
            if (feriado && feriado.preco_override) {
                return {
                    preco_diaria_atual: parseFloat(feriado.preco_override),
                    preco_base: precoBase,
                    temporada: null,
                    feriado: feriado.nome,
                    multiplicador: parseFloat((feriado.preco_override / precoBase).toFixed(2))
                };
            }
            
            // Verificar temporada
            const temporada = await Temporada.buscarPorData(dataConsulta);
            if (temporada) {
                const multiplicador = parseFloat(temporada.multiplicador);
                const precoAtual = precoBase * multiplicador;
                
                return {
                    preco_diaria_atual: parseFloat(precoAtual.toFixed(2)),
                    preco_base: precoBase,
                    temporada: temporada.nome,
                    temporada_tipo: temporada.tipo,
                    feriado: null,
                    multiplicador: multiplicador
                };
            }
            
            // Sem temporada/feriado, usar preço base
            return {
                preco_diaria_atual: precoBase,
                preco_base: precoBase,
                temporada: null,
                feriado: null,
                multiplicador: 1.0
            };
        } catch (erro) {
            console.error('Erro ao calcular preço dinâmico:', erro);
            // Em caso de erro, retornar preço base
            return {
                preco_diaria_atual: parseFloat(chale.preco_diaria || 350.00),
                preco_base: parseFloat(chale.preco_diaria || 350.00),
                temporada: null,
                feriado: null,
                multiplicador: 1.0
            };
        }
    }

    async listar(req, res) {
        try {
            const apenasAtivos = req.query.ativo === 'true';
            const chales = await Chale.buscarTodos(apenasAtivos);
            
            // Adicionar preço dinâmico para cada chalé
            const chalesComPreco = await Promise.all(
                chales.map(async (chale) => {
                    const precoDinamico = await ChaleController.calcularPrecoDinamico(chale);
                    return {
                        ...chale,
                        ...precoDinamico
                    };
                })
            );
            
            return res.json({ 
                total: chalesComPreco.length,
                chales: chalesComPreco
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

            // Adicionar preço dinâmico
            const precoDinamico = await this.calcularPrecoDinamico(chale);
            const chaleComPreco = {
                ...chale,
                ...precoDinamico
            };

            return res.json({ chale: chaleComPreco });

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

