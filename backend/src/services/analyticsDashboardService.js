const database = require('../config/database');
const Reserva = require('../models/Reserva');
const EventoTracking = require('../models/EventoTracking');

class AnalyticsDashboardService {
    /**
     * Obtém reservas por período
     */
    static async obterReservasPorPeriodo(dataInicio, dataFim) {
        const sql = `
            SELECT 
                DATE(criado_em) as data,
                COUNT(*) as total_reservas,
                SUM(valor_total) as receita_total,
                COUNT(CASE WHEN status = 'confirmada' THEN 1 END) as confirmadas,
                COUNT(CASE WHEN status = 'checkout_realizado' THEN 1 END) as concluidas,
                COUNT(CASE WHEN status = 'cancelada' THEN 1 END) as canceladas
            FROM reservas
            WHERE criado_em BETWEEN ? AND ?
            GROUP BY DATE(criado_em)
            ORDER BY data DESC
        `;

        return database.all(sql, [dataInicio, dataFim]);
    }

    /**
     * Obtém ocupação por chalé
     */
    static async obterOcupacaoPorChale(dataInicio, dataFim) {
        const sql = `
            SELECT 
                c.id,
                c.nome as chale_nome,
                COUNT(DISTINCT r.id) as num_reservas,
                SUM(r.num_diarias) as total_diarias,
                SUM(r.valor_total) as receita_total,
                COUNT(DISTINCT CASE 
                    WHEN r.status IN ('confirmada', 'checkin_realizado', 'checkout_realizado') 
                    THEN r.id 
                END) as reservas_confirmadas
            FROM chales c
            LEFT JOIN reservas r ON c.id = r.chale_id 
                AND r.criado_em BETWEEN ? AND ?
            WHERE c.ativo = 1
            GROUP BY c.id, c.nome
            ORDER BY receita_total DESC
        `;

        return database.all(sql, [dataInicio, dataFim]);
    }

    /**
     * Obtém receita por mês
     */
    static async obterReceitaPorMes(ano = null) {
        let sql = `
            SELECT 
                YEAR(criado_em) as ano,
                MONTH(criado_em) as mes,
                DATE_FORMAT(criado_em, '%Y-%m') as periodo,
                COUNT(*) as total_reservas,
                SUM(valor_total) as receita_total,
                SUM(valor_pago) as receita_paga,
                AVG(valor_total) as ticket_medio
            FROM reservas
            WHERE status IN ('confirmada', 'checkin_realizado', 'checkout_realizado')
        `;
        const params = [];

        if (ano) {
            sql += ' AND YEAR(criado_em) = ?';
            params.push(ano);
        }

        sql += ' GROUP BY YEAR(criado_em), MONTH(criado_em) ORDER BY ano DESC, mes DESC';

        return database.all(sql, params);
    }

    /**
     * Obtém canais que mais geram reservas
     */
    static async obterCanaisReservas(dataInicio, dataFim) {
        const sql = `
            SELECT 
                COALESCE(r.origem_canal, 'Não informado') as canal,
                COUNT(DISTINCT r.id) as total_reservas,
                SUM(r.valor_total) as receita_total,
                AVG(r.valor_total) as ticket_medio,
                COUNT(DISTINCT CASE 
                    WHEN r.status IN ('confirmada', 'checkin_realizado', 'checkout_realizado') 
                    THEN r.id 
                END) as reservas_confirmadas,
                COUNT(DISTINCT r.hospede_id) as hospedes_unicos
            FROM reservas r
            WHERE r.criado_em BETWEEN ? AND ?
            GROUP BY r.origem_canal
            ORDER BY total_reservas DESC
        `;

        return database.all(sql, [dataInicio, dataFim]);
    }

    /**
     * Obtém análise detalhada de UTM
     */
    static async obterAnaliseUTM(dataInicio, dataFim) {
        const sql = `
            SELECT 
                COALESCE(utm_source, 'Direto') as source,
                COALESCE(utm_medium, 'N/A') as medium,
                COALESCE(utm_campaign, 'N/A') as campaign,
                COUNT(DISTINCT e.sessao_id) as sessoes,
                COUNT(DISTINCT e.reserva_id) as conversoes,
                SUM(r.valor_total) as receita_total,
                COUNT(DISTINCT CASE WHEN e.tipo_evento = 'view_content' THEN e.sessao_id END) as visualizacoes,
                COUNT(DISTINCT CASE WHEN e.tipo_evento = 'search_availability' THEN e.sessao_id END) as buscas,
                COUNT(DISTINCT CASE WHEN e.tipo_evento = 'start_booking' THEN e.sessao_id END) as inicio_reserva
            FROM eventos_tracking e
            LEFT JOIN reservas r ON e.reserva_id = r.id
            WHERE e.criado_em BETWEEN ? AND ?
            GROUP BY utm_source, utm_medium, utm_campaign
            ORDER BY conversoes DESC, receita_total DESC
        `;

        return database.all(sql, [dataInicio, dataFim]);
    }

    /**
     * Obtém funil de conversão
     */
    static async obterFunilConversao(dataInicio, dataFim) {
        const sql = `
            SELECT 
                tipo_evento,
                COUNT(DISTINCT sessao_id) as sessoes_unicas,
                COUNT(*) as total_eventos
            FROM eventos_tracking
            WHERE criado_em BETWEEN ? AND ?
            AND tipo_evento IN ('view_content', 'search_availability', 'start_booking', 'booking_request', 'booking_confirmed')
            GROUP BY tipo_evento
            ORDER BY FIELD(tipo_evento, 'view_content', 'search_availability', 'start_booking', 'booking_request', 'booking_confirmed')
        `;

        const dados = await database.all(sql, [dataInicio, dataFim]);
        
        // Calcular taxas de conversão
        const viewContent = dados.find(d => d.tipo_evento === 'view_content')?.sessoes_unicas || 0;
        const funil = dados.map(item => {
            const taxa = viewContent > 0 ? ((item.sessoes_unicas / viewContent) * 100).toFixed(2) : 0;
            return {
                ...item,
                taxa_conversao: parseFloat(taxa)
            };
        });

        return funil;
    }

    /**
     * Obtém dashboard completo
     */
    static async obterDashboard(filtros = {}) {
        const dataInicio = filtros.data_inicio || new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0];
        const dataFim = filtros.data_fim || new Date().toISOString().split('T')[0];
        const ano = filtros.ano || new Date().getFullYear();

        const [
            reservasPorPeriodo,
            ocupacaoPorChale,
            receitaPorMes,
            canaisReservas,
            analiseUTM,
            funilConversao
        ] = await Promise.all([
            this.obterReservasPorPeriodo(dataInicio, dataFim),
            this.obterOcupacaoPorChale(dataInicio, dataFim),
            this.obterReceitaPorMes(ano),
            this.obterCanaisReservas(dataInicio, dataFim),
            this.obterAnaliseUTM(dataInicio, dataFim),
            this.obterFunilConversao(dataInicio, dataFim)
        ]);

        // Calcular totais
        const totalReservas = reservasPorPeriodo.reduce((sum, r) => sum + r.total_reservas, 0);
        const totalReceita = reservasPorPeriodo.reduce((sum, r) => sum + parseFloat(r.receita_total || 0), 0);

        return {
            periodo: {
                data_inicio: dataInicio,
                data_fim: dataFim,
                ano
            },
            resumo: {
                total_reservas: totalReservas,
                receita_total: parseFloat(totalReceita.toFixed(2)),
                ticket_medio: totalReservas > 0 ? parseFloat((totalReceita / totalReservas).toFixed(2)) : 0
            },
            reservas_por_periodo: reservasPorPeriodo,
            ocupacao_por_chale: ocupacaoPorChale,
            receita_por_mes: receitaPorMes,
            canais_reservas: canaisReservas,
            analise_utm: analiseUTM,
            funil_conversao: funilConversao
        };
    }
}

module.exports = AnalyticsDashboardService;

