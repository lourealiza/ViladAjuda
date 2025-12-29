const { track } = require('@vercel/analytics/server');

/**
 * Middleware para rastrear eventos de análise no Vercel Web Analytics
 * Implementação server-side para monitorar requisições da API
 */
const analyticsMiddleware = async (req, res, next) => {
    const startTime = Date.now();

    // Interceptar a resposta para coletar dados
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);

    const trackAnalyticsEvent = (statusCode, eventType = 'api_request') => {
        try {
            const duration = Date.now() - startTime;

            // Registrar evento de requisição de API
            track(eventType, {
                method: req.method,
                path: req.path,
                statusCode: statusCode,
                duration: duration,
                // Informações adicionais úteis
                ...(req.usuario && { userId: req.usuario.id }),
                ...(req.ip && { clientIp: req.ip })
            });
        } catch (error) {
            // Não falhar a requisição se o rastreamento falhar
            console.error('Erro ao rastrear evento de análise:', error.message);
        }
    };

    // Interceptar res.json()
    res.json = function (data) {
        trackAnalyticsEvent(res.statusCode, 'api_response');
        return originalJson(data);
    };

    // Interceptar res.send()
    res.send = function (data) {
        trackAnalyticsEvent(res.statusCode, 'api_response');
        return originalSend(data);
    };

    // Interceptar erros
    res.on('finish', () => {
        if (res.statusCode >= 400) {
            trackAnalyticsEvent(res.statusCode, 'api_error');
        }
    });

    next();
};

module.exports = analyticsMiddleware;
