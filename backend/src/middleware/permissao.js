const Usuario = require('../models/Usuario');

/**
 * Middleware para verificar permissões baseado em roles
 */
const verificarPermissao = (recursosPermitidos) => {
    return async (req, res, next) => {
        try {
            const usuarioRole = req.usuarioRole || req.usuario?.role;
            
            // Roles permitidos: 'admin' (acesso total) e 'operador' (apenas reservas/calendário)
            const permissoesPorRole = {
                'admin': [
                    'usuarios', 'chales', 'reservas', 'tarifas', 'pagamentos',
                    'hospedes', 'conteudos', 'tracking', 'admin', 'bloqueios',
                    'backups', 'logs', 'configuracoes'
                ],
                'operador': [
                    'reservas', 'bloqueios', 'calendario', 'checkin', 'checkout'
                ]
            };

            const recursosDoUsuario = permissoesPorRole[usuarioRole] || [];

            // Verificar se o usuário tem acesso a pelo menos um dos recursos permitidos
            const temPermissao = recursosPermitidos.some(recurso => 
                recursosDoUsuario.includes(recurso)
            );

            if (!temPermissao) {
                return res.status(403).json({
                    erro: 'Acesso negado',
                    mensagem: `Você não tem permissão para acessar este recurso. Role necessário: ${recursosPermitidos.join(' ou ')}`
                });
            }

            // Adicionar informações do usuário à requisição
            req.usuario = {
                id: req.usuarioId,
                email: req.usuarioEmail,
                role: usuarioRole,
                permissoes: recursosDoUsuario
            };

            next();
        } catch (erro) {
            return res.status(500).json({
                erro: 'Erro ao verificar permissões',
                mensagem: erro.message
            });
        }
    };
};

/**
 * Middleware para verificar se é admin
 */
const verificarAdmin = verificarPermissao(['admin']);

/**
 * Middleware para verificar acesso a reservas/calendário
 */
const verificarAcessoReservas = verificarPermissao(['reservas', 'admin']);

module.exports = {
    verificarPermissao,
    verificarAdmin,
    verificarAcessoReservas
};

