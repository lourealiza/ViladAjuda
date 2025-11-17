const Reserva = require('../models/Reserva');
const Bloqueio = require('../models/Bloqueio');
const Chale = require('../models/Chale');
const DisponibilidadeService = require('../services/disponibilidadeService');
const TarifaService = require('../services/tarifaService');

class DisponibilidadeController {
    /**
     * Verifica disponibilidade de chalés para um período (validação completa)
     */
    static async verificarDisponibilidade(req, res) {
        try {
            const { data_checkin, data_checkout, chale_id, num_adultos, num_criancas } = req.query;

            if (!data_checkin || !data_checkout) {
                return res.status(400).json({
                    erro: 'Datas obrigatórias',
                    mensagem: 'data_checkin e data_checkout são obrigatórias'
                });
            }

            if (!chale_id) {
                // Buscar todos os chalés disponíveis
                const chalesDisponiveis = await Reserva.buscarChalesDisponiveis(
                    data_checkin,
                    data_checkout
                );

                return res.json({
                    disponivel: chalesDisponiveis.length > 0,
                    chales_disponiveis: chalesDisponiveis.length,
                    chales: chalesDisponiveis,
                    periodo: {
                        checkin: data_checkin,
                        checkout: data_checkout
                    }
                });
            }

            // Validação completa para um chalé específico
            const validacao = await DisponibilidadeService.validarDisponibilidade({
                chale_id: parseInt(chale_id),
                data_checkin,
                data_checkout,
                num_adultos: num_adultos ? parseInt(num_adultos) : undefined,
                num_criancas: num_criancas ? parseInt(num_criancas) : undefined
            });

            // Buscar informações adicionais
            const diariaMinimaInfo = await TarifaService.verificarDiariaMinima(
                data_checkin,
                data_checkout
            );

            return res.json({
                disponivel: validacao.valido,
                chale_id: parseInt(chale_id),
                periodo: {
                    checkin: data_checkin,
                    checkout: data_checkout
                },
                num_diarias: validacao.num_diarias,
                diaria_minima: validacao.diaria_minima,
                diaria_minima_info: diariaMinimaInfo,
                erros: validacao.erros,
                avisos: validacao.avisos
            });

        } catch (erro) {
            console.error('Erro ao verificar disponibilidade:', erro);
            res.status(500).json({
                erro: 'Erro ao verificar disponibilidade',
                mensagem: erro.message
            });
        }
    }

    /**
     * Verificação rápida de disponibilidade (para formulário)
     */
    static async verificarRapida(req, res) {
        try {
            const { chale_id, data_checkin, data_checkout } = req.query;

            if (!chale_id || !data_checkin || !data_checkout) {
                return res.status(400).json({
                    erro: 'Parâmetros obrigatórios',
                    mensagem: 'chale_id, data_checkin e data_checkout são obrigatórios'
                });
            }

            const resultado = await DisponibilidadeService.verificarDisponibilidadeSimples(
                parseInt(chale_id),
                data_checkin,
                data_checkout
            );

            res.json(resultado);

        } catch (erro) {
            console.error('Erro ao verificar disponibilidade rápida:', erro);
            res.status(500).json({
                erro: 'Erro ao verificar disponibilidade',
                mensagem: erro.message
            });
        }
    }

    /**
     * Retorna calendário de disponibilidade para um mês
     */
    static async obterCalendario(req, res) {
        try {
            const { ano, mes, chale_id } = req.query;
            const anoNum = parseInt(ano) || new Date().getFullYear();
            const mesNum = parseInt(mes) || new Date().getMonth() + 1;

            const inicioMes = new Date(anoNum, mesNum - 1, 1);
            const fimMes = new Date(anoNum, mesNum, 0);

            const dataInicio = inicioMes.toISOString().split('T')[0];
            const dataFim = fimMes.toISOString().split('T')[0];

            // Buscar reservas do período
            const reservas = await Reserva.buscarPorPeriodo(dataInicio, dataFim);
            
            // Buscar bloqueios do período
            const bloqueios = await Bloqueio.buscarBloqueiosPorPeriodo(
                chale_id || null,
                dataInicio,
                dataFim
            );

            // Construir calendário
            const calendario = [];
            const diasNoMes = fimMes.getDate();

            for (let dia = 1; dia <= diasNoMes; dia++) {
                const dataAtual = new Date(anoNum, mesNum - 1, dia);
                const dataStr = dataAtual.toISOString().split('T')[0];

                // Verificar se há reserva neste dia
                const reservasDia = reservas.filter(r => {
                    const checkin = new Date(r.data_checkin);
                    const checkout = new Date(r.data_checkout);
                    return dataAtual >= checkin && dataAtual < checkout;
                });

                // Verificar se há bloqueio neste dia
                const bloqueiosDia = bloqueios.filter(b => {
                    const inicio = new Date(b.data_inicio);
                    const fim = new Date(b.data_fim);
                    return dataAtual >= inicio && dataAtual <= fim;
                });

                calendario.push({
                    data: dataStr,
                    dia: dia,
                    disponivel: reservasDia.length === 0 && bloqueiosDia.length === 0,
                    reservado: reservasDia.length > 0,
                    bloqueado: bloqueiosDia.length > 0,
                    reservas: reservasDia.map(r => ({
                        id: r.id,
                        chale_id: r.chale_id,
                        chale_nome: r.chale_nome
                    })),
                    bloqueios: bloqueiosDia.map(b => ({
                        id: b.id,
                        motivo: b.motivo,
                        tipo: b.tipo
                    }))
                });
            }

            return res.json({
                ano: anoNum,
                mes: mesNum,
                chale_id: chale_id ? parseInt(chale_id) : null,
                calendario: calendario
            });

        } catch (erro) {
            console.error('Erro ao obter calendário:', erro);
            res.status(500).json({
                erro: 'Erro ao obter calendário',
                mensagem: erro.message
            });
        }
    }

    /**
     * Calcular número de diárias
     */
    static async calcularDiarias(req, res) {
        try {
            const { data_checkin, data_checkout } = req.query;

            if (!data_checkin || !data_checkout) {
                return res.status(400).json({
                    erro: 'Datas obrigatórias',
                    mensagem: 'data_checkin e data_checkout são obrigatórias'
                });
            }

            const numDiarias = DisponibilidadeService.calcularNumDiarias(
                data_checkin,
                data_checkout
            );

            const diariaMinimaInfo = await TarifaService.verificarDiariaMinima(
                data_checkin,
                data_checkout
            );

            res.json({
                num_diarias: numDiarias,
                diaria_minima: diariaMinimaInfo.diaria_minima,
                atende_minimo: diariaMinimaInfo.atende_minimo,
                periodo: {
                    checkin: data_checkin,
                    checkout: data_checkout
                }
            });

        } catch (erro) {
            console.error('Erro ao calcular diárias:', erro);
            res.status(500).json({
                erro: 'Erro ao calcular diárias',
                mensagem: erro.message
            });
        }
    }
}

module.exports = DisponibilidadeController;

