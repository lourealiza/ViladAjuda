const AnalyticsDashboardService = require('../services/analyticsDashboardService');

class AnalyticsController {
    /**
     * Obter dashboard completo
     */
    static async obterDashboard(req, res) {
        try {
            const filtros = {
                data_inicio: req.query.data_inicio,
                data_fim: req.query.data_fim,
                ano: req.query.ano ? parseInt(req.query.ano) : null
            };

            const dashboard = await AnalyticsDashboardService.obterDashboard(filtros);
            res.json(dashboard);
        } catch (erro) {
            console.error('Erro ao obter dashboard:', erro);
            res.status(500).json({
                erro: 'Erro ao obter dashboard',
                mensagem: erro.message
            });
        }
    }

    /**
     * Obter reservas por período
     */
    static async obterReservasPorPeriodo(req, res) {
        try {
            const dataInicio = req.query.data_inicio || new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0];
            const dataFim = req.query.data_fim || new Date().toISOString().split('T')[0];

            const dados = await AnalyticsDashboardService.obterReservasPorPeriodo(dataInicio, dataFim);
            res.json(dados);
        } catch (erro) {
            console.error('Erro ao obter reservas por período:', erro);
            res.status(500).json({
                erro: 'Erro ao obter reservas por período',
                mensagem: erro.message
            });
        }
    }

    /**
     * Obter ocupação por chalé
     */
    static async obterOcupacaoPorChale(req, res) {
        try {
            const dataInicio = req.query.data_inicio || new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0];
            const dataFim = req.query.data_fim || new Date().toISOString().split('T')[0];

            const dados = await AnalyticsDashboardService.obterOcupacaoPorChale(dataInicio, dataFim);
            res.json(dados);
        } catch (erro) {
            console.error('Erro ao obter ocupação por chalé:', erro);
            res.status(500).json({
                erro: 'Erro ao obter ocupação por chalé',
                mensagem: erro.message
            });
        }
    }

    /**
     * Obter receita por mês
     */
    static async obterReceitaPorMes(req, res) {
        try {
            const ano = req.query.ano ? parseInt(req.query.ano) : null;
            const dados = await AnalyticsDashboardService.obterReceitaPorMes(ano);
            res.json(dados);
        } catch (erro) {
            console.error('Erro ao obter receita por mês:', erro);
            res.status(500).json({
                erro: 'Erro ao obter receita por mês',
                mensagem: erro.message
            });
        }
    }

    /**
     * Obter canais que mais geram reservas
     */
    static async obterCanaisReservas(req, res) {
        try {
            const dataInicio = req.query.data_inicio || new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0];
            const dataFim = req.query.data_fim || new Date().toISOString().split('T')[0];

            const dados = await AnalyticsDashboardService.obterCanaisReservas(dataInicio, dataFim);
            res.json(dados);
        } catch (erro) {
            console.error('Erro ao obter canais de reservas:', erro);
            res.status(500).json({
                erro: 'Erro ao obter canais de reservas',
                mensagem: erro.message
            });
        }
    }

    /**
     * Obter análise de UTM
     */
    static async obterAnaliseUTM(req, res) {
        try {
            const dataInicio = req.query.data_inicio || new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0];
            const dataFim = req.query.data_fim || new Date().toISOString().split('T')[0];

            const dados = await AnalyticsDashboardService.obterAnaliseUTM(dataInicio, dataFim);
            res.json(dados);
        } catch (erro) {
            console.error('Erro ao obter análise UTM:', erro);
            res.status(500).json({
                erro: 'Erro ao obter análise UTM',
                mensagem: erro.message
            });
        }
    }

    /**
     * Obter funil de conversão
     */
    static async obterFunilConversao(req, res) {
        try {
            const dataInicio = req.query.data_inicio || new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0];
            const dataFim = req.query.data_fim || new Date().toISOString().split('T')[0];

            const dados = await AnalyticsDashboardService.obterFunilConversao(dataInicio, dataFim);
            res.json(dados);
        } catch (erro) {
            console.error('Erro ao obter funil de conversão:', erro);
            res.status(500).json({
                erro: 'Erro ao obter funil de conversão',
                mensagem: erro.message
            });
        }
    }
}

module.exports = AnalyticsController;

