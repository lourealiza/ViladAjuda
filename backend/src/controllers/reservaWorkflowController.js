const Reserva = require('../models/Reserva');
const ReservaWorkflowService = require('../services/reservaWorkflowService');
const ResumoService = require('../services/resumoService');

class ReservaWorkflowController {
    /**
     * Atualizar status da reserva (workflow)
     */
    static async atualizarStatus(req, res) {
        try {
            const { id } = req.params;
            const { status, ...dadosAdicionais } = req.body;

            if (!status) {
                return res.status(400).json({
                    erro: 'Status obrigatório',
                    mensagem: 'Status é obrigatório'
                });
            }

            dadosAdicionais.usuario_id = req.usuario?.id;

            const reservaAtualizada = await ReservaWorkflowService.atualizarStatus(
                id,
                status,
                dadosAdicionais
            );

            res.json({
                mensagem: `Status atualizado para: ${ResumoService._traduzirStatus(status)}`,
                reserva: reservaAtualizada,
                proximos_status: ReservaWorkflowService.obterProximosStatus(status)
            });

        } catch (erro) {
            console.error('Erro ao atualizar status:', erro);
            res.status(500).json({
                erro: 'Erro ao atualizar status',
                mensagem: erro.message
            });
        }
    }

    /**
     * Obter próximos status possíveis
     */
    static async obterProximosStatus(req, res) {
        try {
            const { id } = req.params;
            const reserva = await Reserva.buscarPorId(id);

            if (!reserva) {
                return res.status(404).json({
                    erro: 'Reserva não encontrada'
                });
            }

            const proximosStatus = ReservaWorkflowService.obterProximosStatus(reserva.status);

            res.json({
                status_atual: reserva.status,
                status_atual_traduzido: ResumoService._traduzirStatus(reserva.status),
                proximos_status: proximosStatus.map(s => ({
                    codigo: s,
                    nome: ResumoService._traduzirStatus(s)
                }))
            });

        } catch (erro) {
            console.error('Erro ao obter próximos status:', erro);
            res.status(500).json({
                erro: 'Erro ao obter próximos status',
                mensagem: erro.message
            });
        }
    }

    /**
     * Obter estatísticas do funil
     */
    static async obterEstatisticasFunil(req, res) {
        try {
            const filtros = {
                data_inicio: req.query.data_inicio,
                data_fim: req.query.data_fim
            };

            const estatisticas = await ReservaWorkflowService.obterEstatisticasFunil(filtros);

            res.json(estatisticas);

        } catch (erro) {
            console.error('Erro ao obter estatísticas do funil:', erro);
            res.status(500).json({
                erro: 'Erro ao obter estatísticas',
                mensagem: erro.message
            });
        }
    }

    /**
     * Gerar resumo da reserva (JSON, texto, HTML ou PDF)
     */
    static async gerarResumo(req, res) {
        try {
            const { id } = req.params;
            const formato = req.query.formato || 'json';

            if (formato === 'texto') {
                const resumoTexto = await ResumoService.gerarResumoTexto(id);
                res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                res.setHeader('Content-Disposition', `attachment; filename="reserva-${id}.txt"`);
                return res.send(resumoTexto);
            }

            if (formato === 'html') {
                const resumoHTML = await ResumoService.gerarResumoHTML(id);
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                return res.send(resumoHTML);
            }

            if (formato === 'pdf') {
                const PDFService = require('../services/pdfService');
                const pdfInfo = await PDFService.gerarPDF(id);
                
                // Se pdfkit estiver instalado, retornar PDF
                // Por enquanto, retornar HTML que pode ser convertido
                if (pdfInfo.mensagem) {
                    return res.json({
                        mensagem: pdfInfo.mensagem,
                        instrucoes: pdfInfo.instrucoes,
                        alternativas: {
                            texto: `/api/reservas/${id}/resumo?formato=texto`,
                            html: `/api/reservas/${id}/resumo?formato=html`
                        }
                    });
                }
                
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="reserva-${id}.pdf"`);
                return pdfInfo.pipe(res);
            }

            // JSON (padrão)
            const resumo = await ResumoService.gerarResumo(id);
            res.json(resumo);

        } catch (erro) {
            console.error('Erro ao gerar resumo:', erro);
            res.status(500).json({
                erro: 'Erro ao gerar resumo',
                mensagem: erro.message
            });
        }
    }
}

module.exports = ReservaWorkflowController;

