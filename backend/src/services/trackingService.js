const EventoTracking = require('../models/EventoTracking');
const GoogleAnalyticsService = require('./googleAnalyticsService');
const GoogleAdsService = require('./googleAdsService');

class TrackingService {
    /**
     * Registra evento e envia para integrações externas
     */
    static async registrarEvento(dados, req = null) {
        // Adicionar dados da requisição se disponível
        const eventoCompleto = {
            ...dados,
            ip_address: req?.ip || req?.connection?.remoteAddress || dados.ip_address,
            user_agent: req?.get('user-agent') || dados.user_agent,
            url: dados.url || req?.get('referer'),
            referrer: dados.referrer || req?.get('referer')
        };

        // Salvar no banco de dados
        const evento = await EventoTracking.criar(eventoCompleto);

        // Enviar para Google Analytics 4 (assíncrono, não bloqueia)
        GoogleAnalyticsService.enviarEvento(eventoCompleto).catch(err => {
            console.error('Erro ao enviar para GA4:', err);
        });

        // Enviar conversão para Google Ads se for evento de conversão
        if (dados.categoria === 'conversao' || dados.tipo_evento === 'booking_confirmed') {
            GoogleAdsService.enviarConversao({
                reserva_id: dados.reserva_id,
                valor_total: dados.valor_total,
                gclid: dados.gclid,
                email: dados.email,
                telefone: dados.telefone
            }).catch(err => {
                console.error('Erro ao enviar conversão para Google Ads:', err);
            });
        }

        return evento;
    }

    /**
     * Registra evento de visualização de conteúdo (chalé)
     */
    static async registrarViewContent(chaleId, chaleNome, dadosUTM = {}, sessaoId = null) {
        return await this.registrarEvento({
            tipo_evento: 'view_content',
            categoria: 'interacao',
            chale_id: chaleId,
            chale_nome: chaleNome,
            sessao_id: sessaoId,
            ...dadosUTM
        });
    }

    /**
     * Registra evento de busca de disponibilidade
     */
    static async registrarSearchAvailability(dadosBusca, dadosUTM = {}, sessaoId = null) {
        return await this.registrarEvento({
            tipo_evento: 'search_availability',
            categoria: 'interacao',
            sessao_id: sessaoId,
            dados_adicionais: dadosBusca,
            ...dadosUTM
        });
    }

    /**
     * Registra início de reserva
     */
    static async registrarStartBooking(dadosReserva, dadosUTM = {}, sessaoId = null) {
        return await this.registrarEvento({
            tipo_evento: 'start_booking',
            categoria: 'interacao',
            sessao_id: sessaoId,
            valor_total: dadosReserva.valor_total,
            dados_adicionais: dadosReserva,
            ...dadosUTM
        });
    }

    /**
     * Registra solicitação de reserva
     */
    static async registrarBookingRequest(reservaId, dadosReserva, dadosUTM = {}, sessaoId = null) {
        return await this.registrarEvento({
            tipo_evento: 'booking_request',
            categoria: 'conversao',
            reserva_id: reservaId,
            sessao_id: sessaoId,
            valor_total: dadosReserva.valor_total,
            forma_pagamento: dadosReserva.forma_pagamento,
            dados_adicionais: dadosReserva,
            ...dadosUTM
        });
    }

    /**
     * Registra confirmação de reserva (pagamento confirmado)
     */
    static async registrarBookingConfirmed(reservaId, dadosReserva, dadosUTM = {}, sessaoId = null) {
        const evento = await this.registrarEvento({
            tipo_evento: 'booking_confirmed',
            categoria: 'conversao',
            reserva_id: reservaId,
            sessao_id: sessaoId,
            valor_total: dadosReserva.valor_total,
            forma_pagamento: dadosReserva.forma_pagamento,
            email: dadosReserva.email_hospede,
            telefone: dadosReserva.telefone_hospede,
            dados_adicionais: dadosReserva,
            ...dadosUTM
        });

        // Enviar conversão offline para Google Ads (enhanced conversions)
        GoogleAdsService.enviarConversaoOffline({
            reserva_id: reservaId,
            valor_total: dadosReserva.valor_total,
            gclid: dadosUTM.gclid,
            email: dadosReserva.email_hospede,
            telefone: dadosReserva.telefone_hospede
        }).catch(err => {
            console.error('Erro ao enviar conversão offline para Google Ads:', err);
        });

        return evento;
    }

    /**
     * Extrai dados UTM da requisição
     */
    static extrairUTM(req) {
        return {
            utm_source: req.query.utm_source || req.body.utm_source || null,
            utm_medium: req.query.utm_medium || req.body.utm_medium || null,
            utm_campaign: req.query.utm_campaign || req.body.utm_campaign || null,
            utm_term: req.query.utm_term || req.body.utm_term || null,
            utm_content: req.query.utm_content || req.body.utm_content || null,
            gclid: req.query.gclid || req.body.gclid || null
        };
    }

    /**
     * Normaliza origem do canal a partir de UTM
     */
    static normalizarOrigemCanal(utm) {
        if (utm.gclid || utm.utm_source === 'google' || utm.utm_medium === 'cpc') {
            return 'Google Ads';
        }
        if (utm.utm_source === 'google' && utm.utm_medium === 'organic') {
            return 'Orgânico';
        }
        if (utm.utm_source === 'facebook' || utm.utm_source === 'instagram') {
            return 'Facebook/Instagram';
        }
        if (utm.utm_source === 'indicacao' || utm.utm_medium === 'referral') {
            return 'Indicação';
        }
        if (!utm.utm_source && !utm.utm_medium) {
            return 'Direto';
        }
        return utm.utm_source || 'Outro';
    }
}

module.exports = TrackingService;

