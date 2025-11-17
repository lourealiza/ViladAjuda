const database = require('../config/database');

class EventoTracking {
    static async criar(dados) {
        const sql = `
            INSERT INTO eventos_tracking (tipo_evento, categoria, reserva_id, sessao_id, ip_address, 
                                        user_agent, url, referrer, utm_source, utm_medium, utm_campaign, 
                                        utm_term, utm_content, gclid, dados_adicionais)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            dados.tipo_evento,
            dados.categoria || 'interacao',
            dados.reserva_id || null,
            dados.sessao_id || null,
            dados.ip_address || null,
            dados.user_agent || null,
            dados.url || null,
            dados.referrer || null,
            dados.utm_source || null,
            dados.utm_medium || null,
            dados.utm_campaign || null,
            dados.utm_term || null,
            dados.utm_content || null,
            dados.gclid || null,
            dados.dados_adicionais ? JSON.stringify(dados.dados_adicionais) : null
        ];
        
        const result = await database.run(sql, params);
        return this.buscarPorId(result.id);
    }

    static async buscarTodos(filtros = {}) {
        let sql = 'SELECT * FROM eventos_tracking WHERE 1=1';
        const params = [];

        if (filtros.tipo_evento) {
            sql += ' AND tipo_evento = ?';
            params.push(filtros.tipo_evento);
        }

        if (filtros.categoria) {
            sql += ' AND categoria = ?';
            params.push(filtros.categoria);
        }

        if (filtros.reserva_id) {
            sql += ' AND reserva_id = ?';
            params.push(filtros.reserva_id);
        }

        if (filtros.sessao_id) {
            sql += ' AND sessao_id = ?';
            params.push(filtros.sessao_id);
        }

        if (filtros.data_inicio) {
            sql += ' AND criado_em >= ?';
            params.push(filtros.data_inicio);
        }

        if (filtros.data_fim) {
            sql += ' AND criado_em <= ?';
            params.push(filtros.data_fim);
        }

        sql += ' ORDER BY criado_em DESC';

        if (filtros.limit) {
            sql += ' LIMIT ?';
            params.push(filtros.limit);
        }

        const eventos = await database.all(sql, params);
        return eventos.map(this.formatarEvento);
    }

    static async buscarPorId(id) {
        const sql = 'SELECT * FROM eventos_tracking WHERE id = ?';
        const evento = await database.get(sql, [id]);
        return evento ? this.formatarEvento(evento) : null;
    }

    static formatarEvento(evento) {
        return {
            ...evento,
            dados_adicionais: evento.dados_adicionais ? JSON.parse(evento.dados_adicionais) : null
        };
    }

    static async buscarEstatisticas(filtros = {}) {
        let sql = `
            SELECT 
                tipo_evento,
                categoria,
                COUNT(*) as total,
                DATE(criado_em) as data
            FROM eventos_tracking
            WHERE 1=1
        `;
        const params = [];

        if (filtros.data_inicio) {
            sql += ' AND criado_em >= ?';
            params.push(filtros.data_inicio);
        }

        if (filtros.data_fim) {
            sql += ' AND criado_em <= ?';
            params.push(filtros.data_fim);
        }

        sql += ' GROUP BY tipo_evento, categoria, DATE(criado_em) ORDER BY data DESC';

        return database.all(sql, params);
    }

    static async buscarConversoes(filtros = {}) {
        let sql = `
            SELECT 
                e.*,
                r.valor_total,
                r.status as reserva_status
            FROM eventos_tracking e
            LEFT JOIN reservas r ON e.reserva_id = r.id
            WHERE e.categoria = 'conversao'
        `;
        const params = [];

        if (filtros.data_inicio) {
            sql += ' AND e.criado_em >= ?';
            params.push(filtros.data_inicio);
        }

        if (filtros.data_fim) {
            sql += ' AND e.criado_em <= ?';
            params.push(filtros.data_fim);
        }

        sql += ' ORDER BY e.criado_em DESC';

        const eventos = await database.all(sql, params);
        return eventos.map(this.formatarEvento);
    }

    static async buscarPorUTM(filtros = {}) {
        let sql = `
            SELECT 
                utm_source,
                utm_medium,
                utm_campaign,
                COUNT(*) as total_eventos,
                COUNT(DISTINCT sessao_id) as sessoes_unicas,
                COUNT(DISTINCT reserva_id) as conversoes
            FROM eventos_tracking
            WHERE 1=1
        `;
        const params = [];

        if (filtros.utm_source) {
            sql += ' AND utm_source = ?';
            params.push(filtros.utm_source);
        }

        if (filtros.utm_medium) {
            sql += ' AND utm_medium = ?';
            params.push(filtros.utm_medium);
        }

        if (filtros.utm_campaign) {
            sql += ' AND utm_campaign = ?';
            params.push(filtros.utm_campaign);
        }

        if (filtros.data_inicio) {
            sql += ' AND criado_em >= ?';
            params.push(filtros.data_inicio);
        }

        if (filtros.data_fim) {
            sql += ' AND criado_em <= ?';
            params.push(filtros.data_fim);
        }

        sql += ' GROUP BY utm_source, utm_medium, utm_campaign';

        return database.all(sql, params);
    }
}

module.exports = EventoTracking;

