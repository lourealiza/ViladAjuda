const EventoTracking = require('../models/EventoTracking');
const TrackingService = require('../services/trackingService');

class TrackingController {
    /**
     * Registrar evento de tracking
     */
    static async registrarEvento(req, res) {
        try {
            const evento = await TrackingService.registrarEvento(req.body, req);
            res.status(201).json(evento);
        } catch (erro) {
            console.error('Erro ao registrar evento:', erro);
            res.status(500).json({
                erro: 'Erro ao registrar evento',
                mensagem: erro.message
            });
        }
    }

    /**
     * Registrar view_content (visualização de chalé)
     */
    static async registrarViewContent(req, res) {
        try {
            const { chale_id, chale_nome, sessao_id } = req.body;
            const utm = TrackingService.extrairUTM(req);
            
            const evento = await TrackingService.registrarViewContent(chale_id, chale_nome, utm, sessao_id);
            res.status(201).json(evento);
        } catch (erro) {
            console.error('Erro ao registrar view_content:', erro);
            res.status(500).json({
                erro: 'Erro ao registrar evento',
                mensagem: erro.message
            });
        }
    }

    /**
     * Registrar search_availability (busca de disponibilidade)
     */
    static async registrarSearchAvailability(req, res) {
        try {
            const { sessao_id, ...dadosBusca } = req.body;
            const utm = TrackingService.extrairUTM(req);
            
            const evento = await TrackingService.registrarSearchAvailability(dadosBusca, utm, sessao_id);
            res.status(201).json(evento);
        } catch (erro) {
            console.error('Erro ao registrar search_availability:', erro);
            res.status(500).json({
                erro: 'Erro ao registrar evento',
                mensagem: erro.message
            });
        }
    }

    /**
     * Registrar start_booking (início de reserva)
     */
    static async registrarStartBooking(req, res) {
        try {
            const { sessao_id, ...dadosReserva } = req.body;
            const utm = TrackingService.extrairUTM(req);
            
            const evento = await TrackingService.registrarStartBooking(dadosReserva, utm, sessao_id);
            res.status(201).json(evento);
        } catch (erro) {
            console.error('Erro ao registrar start_booking:', erro);
            res.status(500).json({
                erro: 'Erro ao registrar evento',
                mensagem: erro.message
            });
        }
    }

    /**
     * Listar eventos
     */
    static async listar(req, res) {
        try {
            const filtros = {
                tipo_evento: req.query.tipo_evento,
                categoria: req.query.categoria,
                reserva_id: req.query.reserva_id,
                sessao_id: req.query.sessao_id,
                data_inicio: req.query.data_inicio,
                data_fim: req.query.data_fim,
                limit: req.query.limit ? parseInt(req.query.limit) : undefined
            };

            const eventos = await EventoTracking.buscarTodos(filtros);
            res.json(eventos);
        } catch (erro) {
            console.error('Erro ao listar eventos:', erro);
            res.status(500).json({
                erro: 'Erro ao listar eventos',
                mensagem: erro.message
            });
        }
    }

    /**
     * Buscar estatísticas
     */
    static async buscarEstatisticas(req, res) {
        try {
            const filtros = {
                data_inicio: req.query.data_inicio,
                data_fim: req.query.data_fim
            };

            const estatisticas = await EventoTracking.buscarEstatisticas(filtros);
            res.json(estatisticas);
        } catch (erro) {
            console.error('Erro ao buscar estatísticas:', erro);
            res.status(500).json({
                erro: 'Erro ao buscar estatísticas',
                mensagem: erro.message
            });
        }
    }

    /**
     * Buscar conversões
     */
    static async buscarConversoes(req, res) {
        try {
            const filtros = {
                data_inicio: req.query.data_inicio,
                data_fim: req.query.data_fim
            };

            const conversoes = await EventoTracking.buscarConversoes(filtros);
            res.json(conversoes);
        } catch (erro) {
            console.error('Erro ao buscar conversões:', erro);
            res.status(500).json({
                erro: 'Erro ao buscar conversões',
                mensagem: erro.message
            });
        }
    }

    /**
     * Buscar dados por UTM
     */
    static async buscarPorUTM(req, res) {
        try {
            const filtros = {
                utm_source: req.query.utm_source,
                utm_medium: req.query.utm_medium,
                utm_campaign: req.query.utm_campaign,
                data_inicio: req.query.data_inicio,
                data_fim: req.query.data_fim
            };

            const dados = await EventoTracking.buscarPorUTM(filtros);
            res.json(dados);
        } catch (erro) {
            console.error('Erro ao buscar dados por UTM:', erro);
            res.status(500).json({
                erro: 'Erro ao buscar dados por UTM',
                mensagem: erro.message
            });
        }
    }
}

module.exports = TrackingController;

