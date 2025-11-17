// Serviço de integração com Google Analytics 4
// Requer: npm install @google-analytics/data

class GoogleAnalyticsService {
    /**
     * Envia evento para Google Analytics 4
     * Requer: GOOGLE_ANALYTICS_MEASUREMENT_ID e GOOGLE_ANALYTICS_API_SECRET
     */
    static async enviarEvento(dados) {
        const { GA_MEASUREMENT_ID, GA_API_SECRET } = process.env;

        if (!GA_MEASUREMENT_ID || !GA_API_SECRET) {
            console.log('Google Analytics não configurado. Evento não enviado:', dados.tipo_evento);
            return null;
        }

        try {
            // Mapear eventos internos para eventos GA4
            const eventoGA4 = this._mapearEventoGA4(dados);

            // Enviar via Measurement Protocol
            const url = `https://www.google-analytics.com/mp/collect?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${GA_API_SECRET}`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    client_id: dados.sessao_id || 'anonymous',
                    events: [eventoGA4]
                })
            });

            if (!response.ok) {
                console.error('Erro ao enviar evento para GA4:', response.statusText);
                return null;
            }

            return { sucesso: true, evento: eventoGA4.nome };
        } catch (erro) {
            console.error('Erro ao enviar evento para Google Analytics:', erro);
            return null;
        }
    }

    /**
     * Mapeia eventos internos para eventos GA4
     */
    static _mapearEventoGA4(dados) {
        const eventosGA4 = {
            'view_content': {
                nome: 'view_item',
                parametros: {
                    item_id: dados.chale_id?.toString(),
                    item_name: dados.chale_nome,
                    item_category: 'chale'
                }
            },
            'search_availability': {
                nome: 'search',
                parametros: {
                    search_term: dados.busca || 'disponibilidade'
                }
            },
            'start_booking': {
                nome: 'begin_checkout',
                parametros: {
                    currency: 'BRL',
                    value: dados.valor_total || 0
                }
            },
            'booking_request': {
                nome: 'add_payment_info',
                parametros: {
                    currency: 'BRL',
                    value: dados.valor_total || 0,
                    payment_type: dados.forma_pagamento || 'pix'
                }
            },
            'booking_confirmed': {
                nome: 'purchase',
                parametros: {
                    transaction_id: dados.reserva_id?.toString(),
                    value: dados.valor_total || 0,
                    currency: 'BRL',
                    items: dados.itens || []
                }
            }
        };

        const evento = eventosGA4[dados.tipo_evento] || {
            nome: dados.tipo_evento,
            parametros: {}
        };

        // Adicionar parâmetros UTM
        if (dados.utm_source) {
            evento.parametros.source = dados.utm_source;
        }
        if (dados.utm_medium) {
            evento.parametros.medium = dados.utm_medium;
        }
        if (dados.utm_campaign) {
            evento.parametros.campaign = dados.utm_campaign;
        }
        if (dados.gclid) {
            evento.parametros.gclid = dados.gclid;
        }

        return evento;
    }

    /**
     * Envia conversão offline para GA4 (quando reserva é confirmada manualmente)
     */
    static async enviarConversaoOffline(dados) {
        return await this.enviarEvento({
            tipo_evento: 'booking_confirmed',
            ...dados
        });
    }
}

module.exports = GoogleAnalyticsService;

