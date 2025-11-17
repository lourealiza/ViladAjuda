// Serviço de integração com Google Ads
// Requer: npm install google-ads-api

class GoogleAdsService {
    /**
     * Envia conversão para Google Ads
     * Requer: GOOGLE_ADS_CUSTOMER_ID, GOOGLE_ADS_CONVERSION_ACTION_ID, GOOGLE_ADS_API_KEY
     */
    static async enviarConversao(dados) {
        const { GOOGLE_ADS_CUSTOMER_ID, GOOGLE_ADS_CONVERSION_ACTION_ID, GOOGLE_ADS_API_KEY } = process.env;

        if (!GOOGLE_ADS_CUSTOMER_ID || !GOOGLE_ADS_CONVERSION_ACTION_ID || !GOOGLE_ADS_API_KEY) {
            console.log('Google Ads não configurado. Conversão não enviada:', dados.reserva_id);
            return null;
        }

        try {
            // Enviar conversão via Google Ads API
            // Por enquanto, retornar instruções para implementação completa
            
            const conversao = {
                conversion_action: `customers/${GOOGLE_ADS_CUSTOMER_ID}/conversionActions/${GOOGLE_ADS_CONVERSION_ACTION_ID}`,
                conversion_date_time: new Date().toISOString(),
                conversion_value: dados.valor_total || 0,
                currency_code: 'BRL',
                gclid: dados.gclid || null,
                order_id: dados.reserva_id?.toString() || null
            };

            // Implementação completa requer google-ads-api
            /*
            const { GoogleAdsApi } = require('google-ads-api');
            const client = new GoogleAdsApi({
                client_id: process.env.GOOGLE_ADS_CLIENT_ID,
                client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
                developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN
            });

            const customer = client.Customer({
                customer_id: GOOGLE_ADS_CUSTOMER_ID,
                refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN
            });

            await customer.conversionUploads.uploadClickConversions([conversao]);
            */

            console.log('Conversão Google Ads (simulado):', conversao);
            return { sucesso: true, conversao };

        } catch (erro) {
            console.error('Erro ao enviar conversão para Google Ads:', erro);
            return null;
        }
    }

    /**
     * Envia conversão offline (enhanced conversions)
     */
    static async enviarConversaoOffline(dados) {
        // Enhanced conversions requer dados do cliente (email, telefone hash)
        const conversao = {
            ...dados,
            hashed_email: dados.email ? this._hashEmail(dados.email) : null,
            hashed_phone: dados.telefone ? this._hashPhone(dados.telefone) : null
        };

        return await this.enviarConversao(conversao);
    }

    /**
     * Hash de email para enhanced conversions (SHA-256)
     */
    static _hashEmail(email) {
        const crypto = require('crypto');
        return crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
    }

    /**
     * Hash de telefone para enhanced conversions (SHA-256)
     */
    static _hashPhone(telefone) {
        const crypto = require('crypto');
        // Remove caracteres não numéricos
        const numero = telefone.replace(/\D/g, '');
        return crypto.createHash('sha256').update(numero).digest('hex');
    }
}

module.exports = GoogleAdsService;

