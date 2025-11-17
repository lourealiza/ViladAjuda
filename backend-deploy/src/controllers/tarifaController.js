const Temporada = require('../models/Temporada');
const Feriado = require('../models/Feriado');
const Cupom = require('../models/Cupom');
const ChaleTemporadaPreco = require('../models/ChaleTemporadaPreco');
const RegraTarifacao = require('../models/RegraTarifacao');
const PrecoOverride = require('../models/PrecoOverride');
const TarifaService = require('../services/tarifaService');
const AuditoriaService = require('../services/auditoriaService');
const auth = require('../middleware/auth');

class TarifaController {
    /**
     * Calcular valor de estadia
     */
    static async calcularValor(req, res) {
        try {
            const { chale_id, data_checkin, data_checkout, num_adultos, num_criancas, cupom_codigo, idades_criancas } = req.body;

            if (!chale_id || !data_checkin || !data_checkout) {
                return res.status(400).json({
                    erro: 'Dados obrigatórios',
                    mensagem: 'chale_id, data_checkin e data_checkout são obrigatórios'
                });
            }

            const resultado = await TarifaService.calcularValorEstadia({
                chale_id,
                data_checkin,
                data_checkout,
                num_adultos,
                num_criancas,
                cupom_codigo,
                idades_criancas
            });

            return res.json(resultado);

        } catch (erro) {
            console.error('Erro ao calcular valor:', erro);
            res.status(500).json({
                erro: 'Erro ao calcular valor',
                mensagem: erro.message
            });
        }
    }

    /**
     * Listar temporadas
     */
    static async listarTemporadas(req, res) {
        try {
            const apenasAtivos = req.query.ativo !== 'false';
            const temporadas = await Temporada.buscarTodos(apenasAtivos);
            res.json(temporadas);
        } catch (erro) {
            console.error('Erro ao listar temporadas:', erro);
            res.status(500).json({
                erro: 'Erro ao listar temporadas',
                mensagem: erro.message
            });
        }
    }

    /**
     * Criar temporada
     */
    static async criarTemporada(req, res) {
        try {
            const temporada = await Temporada.criar(req.body);
            
            // Registrar auditoria
            await AuditoriaService.registrarAlteracaoTarifa(
                req.usuario?.id,
                'criada',
                null,
                temporada,
                req
            ).catch(err => console.error('Erro ao registrar auditoria:', err));
            
            res.status(201).json(temporada);
        } catch (erro) {
            console.error('Erro ao criar temporada:', erro);
            res.status(500).json({
                erro: 'Erro ao criar temporada',
                mensagem: erro.message
            });
        }
    }

    /**
     * Atualizar temporada
     */
    static async atualizarTemporada(req, res) {
        try {
            const { id } = req.params;
            const temporadaAntes = await Temporada.buscarPorId(id);
            const temporada = await Temporada.atualizar(id, req.body);
            
            // Registrar auditoria
            await AuditoriaService.registrarAlteracaoTarifa(
                req.usuario?.id,
                'atualizada',
                temporadaAntes,
                temporada,
                req
            ).catch(err => console.error('Erro ao registrar auditoria:', err));
            
            res.json(temporada);
        } catch (erro) {
            console.error('Erro ao atualizar temporada:', erro);
            res.status(500).json({
                erro: 'Erro ao atualizar temporada',
                mensagem: erro.message
            });
        }
    }

    /**
     * Deletar temporada
     */
    static async deletarTemporada(req, res) {
        try {
            const { id } = req.params;
            await Temporada.deletar(id);
            res.json({ mensagem: 'Temporada deletada com sucesso' });
        } catch (erro) {
            console.error('Erro ao deletar temporada:', erro);
            res.status(500).json({
                erro: 'Erro ao deletar temporada',
                mensagem: erro.message
            });
        }
    }

    /**
     * Listar feriados
     */
    static async listarFeriados(req, res) {
        try {
            const apenasAtivos = req.query.ativo !== 'false';
            const feriados = await Feriado.buscarTodos(apenasAtivos);
            res.json(feriados);
        } catch (erro) {
            console.error('Erro ao listar feriados:', erro);
            res.status(500).json({
                erro: 'Erro ao listar feriados',
                mensagem: erro.message
            });
        }
    }

    /**
     * Criar feriado
     */
    static async criarFeriado(req, res) {
        try {
            const feriado = await Feriado.criar(req.body);
            res.status(201).json(feriado);
        } catch (erro) {
            console.error('Erro ao criar feriado:', erro);
            res.status(500).json({
                erro: 'Erro ao criar feriado',
                mensagem: erro.message
            });
        }
    }

    /**
     * Atualizar feriado
     */
    static async atualizarFeriado(req, res) {
        try {
            const { id } = req.params;
            const feriado = await Feriado.atualizar(id, req.body);
            res.json(feriado);
        } catch (erro) {
            console.error('Erro ao atualizar feriado:', erro);
            res.status(500).json({
                erro: 'Erro ao atualizar feriado',
                mensagem: erro.message
            });
        }
    }

    /**
     * Deletar feriado
     */
    static async deletarFeriado(req, res) {
        try {
            const { id } = req.params;
            await Feriado.deletar(id);
            res.json({ mensagem: 'Feriado deletado com sucesso' });
        } catch (erro) {
            console.error('Erro ao deletar feriado:', erro);
            res.status(500).json({
                erro: 'Erro ao deletar feriado',
                mensagem: erro.message
            });
        }
    }

    /**
     * Validar cupom
     */
    static async validarCupom(req, res) {
        try {
            const { codigo, valor_minimo, temporada_tipo, chale_id } = req.body;

            if (!codigo) {
                return res.status(400).json({
                    erro: 'Código obrigatório',
                    mensagem: 'Código do cupom é obrigatório'
                });
            }

            const resultado = await Cupom.validarCupom(codigo, valor_minimo || 0, {
                temporada_tipo,
                chale_id
            });

            if (!resultado.valido) {
                return res.status(400).json(resultado);
            }

            res.json(resultado);

        } catch (erro) {
            console.error('Erro ao validar cupom:', erro);
            res.status(500).json({
                erro: 'Erro ao validar cupom',
                mensagem: erro.message
            });
        }
    }

    /**
     * Listar cupons
     */
    static async listarCupons(req, res) {
        try {
            const apenasAtivos = req.query.ativo !== 'false';
            const cupons = await Cupom.buscarTodos(apenasAtivos);
            res.json(cupons);
        } catch (erro) {
            console.error('Erro ao listar cupons:', erro);
            res.status(500).json({
                erro: 'Erro ao listar cupons',
                mensagem: erro.message
            });
        }
    }

    /**
     * Criar cupom
     */
    static async criarCupom(req, res) {
        try {
            const cupom = await Cupom.criar(req.body);
            res.status(201).json(cupom);
        } catch (erro) {
            console.error('Erro ao criar cupom:', erro);
            res.status(500).json({
                erro: 'Erro ao criar cupom',
                mensagem: erro.message
            });
        }
    }

    /**
     * Atualizar cupom
     */
    static async atualizarCupom(req, res) {
        try {
            const { id } = req.params;
            const cupom = await Cupom.atualizar(id, req.body);
            res.json(cupom);
        } catch (erro) {
            console.error('Erro ao atualizar cupom:', erro);
            res.status(500).json({
                erro: 'Erro ao atualizar cupom',
                mensagem: erro.message
            });
        }
    }

    /**
     * Deletar cupom
     */
    static async deletarCupom(req, res) {
        try {
            const { id } = req.params;
            await Cupom.deletar(id);
            res.json({ mensagem: 'Cupom deletado com sucesso' });
        } catch (erro) {
            console.error('Erro ao deletar cupom:', erro);
            res.status(500).json({
                erro: 'Erro ao deletar cupom',
                mensagem: erro.message
            });
        }
    }

    /**
     * Preços por Chalé/Temporada
     */
    static async listarPrecosChaleTemporada(req, res) {
        try {
            const filtros = {
                chale_id: req.query.chale_id,
                temporada_id: req.query.temporada_id,
                ativo: req.query.ativo !== undefined ? req.query.ativo === 'true' : undefined
            };
            const precos = await ChaleTemporadaPreco.buscarTodos(filtros);
            res.json(precos);
        } catch (erro) {
            console.error('Erro ao listar preços:', erro);
            res.status(500).json({
                erro: 'Erro ao listar preços',
                mensagem: erro.message
            });
        }
    }

    static async criarPrecoChaleTemporada(req, res) {
        try {
            const preco = await ChaleTemporadaPreco.criar(req.body);
            res.status(201).json(preco);
        } catch (erro) {
            console.error('Erro ao criar preço:', erro);
            res.status(500).json({
                erro: 'Erro ao criar preço',
                mensagem: erro.message
            });
        }
    }

    /**
     * Regras de Tarifação
     */
    static async listarRegrasTarifacao(req, res) {
        try {
            const filtros = {
                chale_id: req.query.chale_id,
                tipo: req.query.tipo,
                ativo: req.query.ativo !== undefined ? req.query.ativo === 'true' : undefined
            };
            const regras = await RegraTarifacao.buscarTodos(filtros);
            res.json(regras);
        } catch (erro) {
            console.error('Erro ao listar regras:', erro);
            res.status(500).json({
                erro: 'Erro ao listar regras',
                mensagem: erro.message
            });
        }
    }

    static async criarRegraTarifacao(req, res) {
        try {
            const regra = await RegraTarifacao.criar(req.body);
            res.status(201).json(regra);
        } catch (erro) {
            console.error('Erro ao criar regra:', erro);
            res.status(500).json({
                erro: 'Erro ao criar regra',
                mensagem: erro.message
            });
        }
    }

    /**
     * Override de Preços
     */
    static async listarPrecosOverride(req, res) {
        try {
            const filtros = {
                chale_id: req.query.chale_id,
                data_inicio: req.query.data_inicio,
                data_fim: req.query.data_fim,
                ativo: req.query.ativo !== undefined ? req.query.ativo === 'true' : undefined
            };
            const overrides = await PrecoOverride.buscarTodos(filtros);
            res.json(overrides);
        } catch (erro) {
            console.error('Erro ao listar overrides:', erro);
            res.status(500).json({
                erro: 'Erro ao listar overrides',
                mensagem: erro.message
            });
        }
    }

    static async criarPrecoOverride(req, res) {
        try {
            const override = await PrecoOverride.criar(req.body);
            res.status(201).json(override);
        } catch (erro) {
            console.error('Erro ao criar override:', erro);
            res.status(500).json({
                erro: 'Erro ao criar override',
                mensagem: erro.message
            });
        }
    }
}

module.exports = TarifaController;
