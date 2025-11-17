const LogAcesso = require('../models/LogAcesso');

/**
 * Middleware para registrar logs de acesso (LGPD)
 */
const registrarLogAcesso = async (req, res, next) => {
    // Não registrar logs para rotas públicas ou health checks
    const rotasPublicas = ['/api/health', '/api/', '/api/tracking/evento'];
    if (rotasPublicas.some(rota => req.path.startsWith(rota))) {
        return next();
    }

    // Capturar dados antes da execução
    const dadosAntes = req.method === 'GET' ? null : { ...req.body };

    // Sobrescrever res.json para capturar resposta
    const originalJson = res.json.bind(res);
    res.json = function(data) {
        // Registrar log após resposta
        setImmediate(async () => {
            try {
                await LogAcesso.criar({
                    usuario_id: req.usuario?.id || null,
                    acao: `${req.method} ${req.path}`,
                    tabela_afetada: obterTabelaDaRota(req.path),
                    registro_id: req.params.id || null,
                    dados_antes: dadosAntes,
                    dados_depois: req.method === 'GET' ? null : { ...req.body },
                    ip_address: req.ip || req.connection.remoteAddress,
                    user_agent: req.get('user-agent')
                });
            } catch (erro) {
                console.error('Erro ao registrar log de acesso:', erro);
            }
        });

        return originalJson(data);
    };

    next();
};

/**
 * Função auxiliar para identificar tabela afetada pela rota
 */
function obterTabelaDaRota(path) {
    const mapeamento = {
        '/chales': 'chales',
        '/reservas': 'reservas',
        '/hospedes': 'hospedes',
        '/pagamentos': 'pagamentos',
        '/temporadas': 'temporadas',
        '/feriados': 'feriados',
        '/cupons': 'cupons',
        '/bloqueios': 'bloqueios',
        '/conteudos': 'conteudos',
        '/usuarios': 'usuarios'
    };

    for (const [rota, tabela] of Object.entries(mapeamento)) {
        if (path.includes(rota)) {
            return tabela;
        }
    }

    return null;
}

module.exports = registrarLogAcesso;

