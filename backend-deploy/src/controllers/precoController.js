const {
    calcularValorEstadia,
    aplicarDescontoEstadiaLonga,
    aplicarDescontoBlackFriday,
    obterInfoTemporada,
    obterTabelaPrecos
} = require('../config/precos');

class PrecoController {
    /**
     * Calcular o preço de uma estadia
     * GET /api/precos/calcular?capacidade=2&checkin=2024-12-20&checkout=2024-12-25
     */
    async calcular(req, res) {
        try {
            const { capacidade, checkin, checkout } = req.query;

            if (!capacidade || !checkin || !checkout) {
                return res.status(400).json({
                    erro: 'Parâmetros inválidos',
                    mensagem: 'capacidade, checkin e checkout são obrigatórios'
                });
            }

            const capacidadeInt = parseInt(capacidade, 10);

            const calculo = calcularValorEstadia(capacidadeInt, checkin, checkout);

            let valorComDesconto = calculo.valorTotal;
            const descontoBF = aplicarDescontoBlackFriday(calculo.valorTotal, checkin);
            if (descontoBF.aplicado) {
                valorComDesconto = descontoBF.valorFinal;
            }

            const comDesconto = aplicarDescontoEstadiaLonga(valorComDesconto, calculo.numeroNoites);

            return res.json({
                periodo: {
                    checkin,
                    checkout,
                    numeroNoites: calculo.numeroNoites
                },
                capacidade: capacidadeInt,
                valores: {
                    valorBase: calculo.valorTotal,
                    valorMedioDiaria: calculo.valorMedioDiaria,
                    blackFriday: descontoBF.aplicado ? {
                        percentual: descontoBF.percentualDesconto,
                        valor: descontoBF.valorDesconto,
                        campanha: descontoBF.campanha
                    } : null,
                    descontoEstadiaLonga: comDesconto.aplicado ? {
                        percentual: comDesconto.percentualDesconto,
                        valor: comDesconto.valorDesconto,
                        motivo: `${comDesconto.percentualDesconto}% de desconto para estadia de ${calculo.numeroNoites} noites`
                    } : null,
                    valorFinal: comDesconto.valorFinal
                },
                detalhamento: calculo.detalhes.map((detalhe) => ({
                    data: detalhe.data,
                    temporada: detalhe.temporada,
                    diaria: detalhe.valor
                }))
            });

        } catch (erro) {
            console.error('Erro ao calcular preço:', erro);
            return res.status(500).json({
                erro: 'Erro no servidor',
                mensagem: 'Erro ao calcular preço'
            });
        }
    }

    /**
     * Obter informações sobre a temporada de uma data
     * GET /api/precos/temporada?data=2025-01-15
     */
    async obterTemporada(req, res) {
        try {
            const { data } = req.query;

            if (!data) {
                return res.status(400).json({
                    erro: 'Parâmetros inválidos',
                    mensagem: 'data é obrigatória (formato: YYYY-MM-DD)'
                });
            }

            const info = obterInfoTemporada(data);

            return res.json({
                data,
                ...info
            });

        } catch (erro) {
            console.error('Erro ao obter temporada:', erro);
            return res.status(500).json({
                erro: 'Erro no servidor',
                mensagem: 'Erro ao obter informações da temporada'
            });
        }
    }

    /**
     * Obter tabela de preços completa
     * GET /api/precos/tabela
     */
    async obterTabela(req, res) {
        try {
            const temporadas = obterTabelaPrecos();

            return res.json({
                informacoes: {
                    localizacao: "Arraial d'Ajuda, BA",
                    caracteristicas: [
                        'Sem piscina',
                        'Com cozinha equipada',
                        '7 minutos a pé do centro'
                    ],
                    descontosEstadiaLonga: [
                        { noites: '7-14', desconto: '5%' },
                        { noites: '15-29', desconto: '10%' },
                        { noites: '30+', desconto: '15%' }
                    ]
                },
                temporadas
            });

        } catch (erro) {
            console.error('Erro ao obter tabela:', erro);
            return res.status(500).json({
                erro: 'Erro no servidor',
                mensagem: 'Erro ao obter tabela de preços'
            });
        }
    }
}

module.exports = new PrecoController();

