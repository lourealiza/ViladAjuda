const LogAcesso = require('../models/LogAcesso');

class AuditoriaService {
    /**
     * Registra alteração em tarifa
     */
    static async registrarAlteracaoTarifa(usuarioId, acao, dadosAntes, dadosDepois, req = null) {
        return await LogAcesso.criar({
            usuario_id: usuarioId,
            acao: `tarifa_${acao}`,
            tabela_afetada: 'temporadas',
            registro_id: dadosDepois?.id || dadosAntes?.id,
            dados_antes: dadosAntes,
            dados_depois: dadosDepois,
            ip_address: req?.ip || req?.connection?.remoteAddress,
            user_agent: req?.get('user-agent')
        });
    }

    /**
     * Registra bloqueio de data
     */
    static async registrarBloqueioData(usuarioId, acao, dadosAntes, dadosDepois, req = null) {
        return await LogAcesso.criar({
            usuario_id: usuarioId,
            acao: `bloqueio_${acao}`,
            tabela_afetada: 'bloqueios',
            registro_id: dadosDepois?.id || dadosAntes?.id,
            dados_antes: dadosAntes,
            dados_depois: dadosDepois,
            ip_address: req?.ip || req?.connection?.remoteAddress,
            user_agent: req?.get('user-agent')
        });
    }

    /**
     * Registra alteração genérica
     */
    static async registrarAlteracao(usuarioId, acao, tabela, registroId, dadosAntes, dadosDepois, req = null) {
        return await LogAcesso.criar({
            usuario_id: usuarioId,
            acao,
            tabela_afetada: tabela,
            registro_id: registroId,
            dados_antes: dadosAntes,
            dados_depois: dadosDepois,
            ip_address: req?.ip || req?.connection?.remoteAddress,
            user_agent: req?.get('user-agent')
        });
    }

    /**
     * Buscar histórico de alterações de tarifas
     */
    static async buscarHistoricoTarifas(filtros = {}) {
        return await LogAcesso.buscarTodos({
            acao: filtros.acao ? `tarifa_${filtros.acao}` : undefined,
            tabela_afetada: 'temporadas',
            ...filtros
        });
    }

    /**
     * Buscar histórico de bloqueios
     */
    static async buscarHistoricoBloqueios(filtros = {}) {
        return await LogAcesso.buscarTodos({
            acao: filtros.acao ? `bloqueio_${filtros.acao}` : undefined,
            tabela_afetada: 'bloqueios',
            ...filtros
        });
    }
}

module.exports = AuditoriaService;

