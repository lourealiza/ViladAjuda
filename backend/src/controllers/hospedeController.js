const Hospede = require('../models/Hospede');

class HospedeController {
    /**
     * Listar hóspedes
     */
    static async listar(req, res) {
        try {
            const filtros = {
                nome: req.query.nome,
                email: req.query.email,
                telefone: req.query.telefone,
                origem_canal: req.query.origem_canal
            };

            const hospedes = await Hospede.buscarTodos(filtros);
            res.json(hospedes);
        } catch (erro) {
            console.error('Erro ao listar hóspedes:', erro);
            res.status(500).json({
                erro: 'Erro ao listar hóspedes',
                mensagem: erro.message
            });
        }
    }

    /**
     * Buscar hóspede por ID
     */
    static async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const hospede = await Hospede.buscarPorId(id);

            if (!hospede) {
                return res.status(404).json({
                    erro: 'Hóspede não encontrado'
                });
            }

            // Buscar histórico de reservas
            const historico = await Hospede.buscarHistoricoReservas(id);

            res.json({
                ...hospede,
                historico_reservas: historico
            });
        } catch (erro) {
            console.error('Erro ao buscar hóspede:', erro);
            res.status(500).json({
                erro: 'Erro ao buscar hóspede',
                mensagem: erro.message
            });
        }
    }

    /**
     * Criar hóspede
     */
    static async criar(req, res) {
        try {
            const hospede = await Hospede.criar(req.body);
            res.status(201).json(hospede);
        } catch (erro) {
            console.error('Erro ao criar hóspede:', erro);
            res.status(500).json({
                erro: 'Erro ao criar hóspede',
                mensagem: erro.message
            });
        }
    }

    /**
     * Buscar ou criar hóspede
     */
    static async buscarOuCriar(req, res) {
        try {
            const hospede = await Hospede.buscarOuCriar(req.body);
            res.json(hospede);
        } catch (erro) {
            console.error('Erro ao buscar ou criar hóspede:', erro);
            res.status(500).json({
                erro: 'Erro ao buscar ou criar hóspede',
                mensagem: erro.message
            });
        }
    }

    /**
     * Atualizar hóspede
     */
    static async atualizar(req, res) {
        try {
            const { id } = req.params;
            const hospede = await Hospede.atualizar(id, req.body);
            res.json(hospede);
        } catch (erro) {
            console.error('Erro ao atualizar hóspede:', erro);
            res.status(500).json({
                erro: 'Erro ao atualizar hóspede',
                mensagem: erro.message
            });
        }
    }

    /**
     * Buscar histórico de reservas do hóspede
     */
    static async buscarHistorico(req, res) {
        try {
            const { id } = req.params;
            const historico = await Hospede.buscarHistoricoReservas(id);
            res.json(historico);
        } catch (erro) {
            console.error('Erro ao buscar histórico:', erro);
            res.status(500).json({
                erro: 'Erro ao buscar histórico',
                mensagem: erro.message
            });
        }
    }

    /**
     * Obter estatísticas do hóspede
     */
    static async obterEstatisticas(req, res) {
        try {
            const { id } = req.params;
            const hospede = await Hospede.buscarPorId(id);

            if (!hospede) {
                return res.status(404).json({
                    erro: 'Hóspede não encontrado'
                });
            }

            const estatisticas = await Hospede.calcularEstatisticas(id);
            const historico = await Hospede.buscarHistoricoReservas(id);

            res.json({
                hospede: {
                    id: hospede.id,
                    nome: hospede.nome,
                    email: hospede.email,
                    telefone: hospede.telefone,
                    cidade: hospede.cidade,
                    estado: hospede.estado,
                    origem_canal: hospede.origem_canal,
                    como_nos_encontrou: hospede.como_nos_encontrou,
                    notas_internas: hospede.notas_internas // Apenas para admin
                },
                estatisticas,
                historico_reservas: historico
            });

        } catch (erro) {
            console.error('Erro ao obter estatísticas:', erro);
            res.status(500).json({
                erro: 'Erro ao obter estatísticas',
                mensagem: erro.message
            });
        }
    }

    /**
     * Buscar hóspedes para campanha de retorno
     */
    static async buscarParaCampanhaRetorno(req, res) {
        try {
            const filtros = {
                min_reservas: req.query.min_reservas ? parseInt(req.query.min_reservas) : 1,
                ultima_estadia_antes_de: req.query.ultima_estadia_antes_de || null
            };

            const hospedes = await Hospede.buscarHospedesRetorno(filtros);

            res.json({
                total: hospedes.length,
                filtros,
                hospedes: hospedes.map(h => ({
                    id: h.id,
                    nome: h.nome,
                    email: h.email,
                    telefone: h.telefone,
                    cidade: h.cidade,
                    estado: h.estado,
                    num_reservas: h.num_reservas,
                    valor_total_gasto: parseFloat(h.valor_total_gasto || 0).toFixed(2),
                    ultima_estadia: h.ultima_estadia
                }))
            });

        } catch (erro) {
            console.error('Erro ao buscar hóspedes para campanha:', erro);
            res.status(500).json({
                erro: 'Erro ao buscar hóspedes',
                mensagem: erro.message
            });
        }
    }

    /**
     * Buscar hóspedes por localização
     */
    static async buscarPorLocalizacao(req, res) {
        try {
            const { cidade, estado } = req.query;
            const hospedes = await Hospede.buscarPorLocalizacao(cidade, estado);

            res.json({
                total: hospedes.length,
                filtros: { cidade, estado },
                hospedes
            });

        } catch (erro) {
            console.error('Erro ao buscar por localização:', erro);
            res.status(500).json({
                erro: 'Erro ao buscar hóspedes',
                mensagem: erro.message
            });
        }
    }

    /**
     * Buscar hóspedes por origem
     */
    static async buscarPorOrigem(req, res) {
        try {
            const { origem } = req.params;
            const hospedes = await Hospede.buscarPorOrigem(origem);

            res.json({
                total: hospedes.length,
                origem,
                hospedes
            });

        } catch (erro) {
            console.error('Erro ao buscar por origem:', erro);
            res.status(500).json({
                erro: 'Erro ao buscar hóspedes',
                mensagem: erro.message
            });
        }
    }
}

module.exports = HospedeController;

