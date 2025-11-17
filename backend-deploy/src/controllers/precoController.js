const { 
    calcularValorEstadia, 
    aplicarDescontoEstadiaLonga,
    aplicarDescontoBlackFriday,
    obterInfoTemporada,
    determinarTemporada 
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
            
            // Calcular valor
            const calculo = calcularValorEstadia(parseInt(capacidade), checkin, checkout);
            
            // Aplicar desconto Black Friday primeiro
            let valorComDesconto = calculo.valorTotal;
            let descontoBF = aplicarDescontoBlackFriday(calculo.valorTotal, checkin);
            if (descontoBF.aplicado) {
                valorComDesconto = descontoBF.valorFinal;
            }
            
            // Aplicar desconto para estadia longa
            const comDesconto = aplicarDescontoEstadiaLonga(valorComDesconto, calculo.numeroNoites);
            
            return res.json({
                periodo: {
                    checkin,
                    checkout,
                    numeroNoites: calculo.numeroNoites
                },
                capacidade: parseInt(capacidade),
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
                detalhamento: calculo.detalhes.map(d => ({
                    data: d.data,
                    temporada: d.temporada,
                    diaria: d.valor
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
            return res.json({
                informacoes: {
                    localizacao: 'Arraial d\'Ajuda, BA',
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
                precos: {
                    ate2pessoas: {
                        baixaTemporada: {
                            periodo: 'Março-Junho, Agosto-Novembro',
                            minimo: 250,
                            maximo: 350,
                            medio: 300
                        },
                        altaTemporada: {
                            periodo: 'Julho, Dezembro (exc. Réveillon), Carnaval',
                            minimo: 350,
                            maximo: 450,
                            medio: 400
                        },
                        altissimaTemporada: {
                            periodo: 'Janeiro, Réveillon',
                            minimo: 420,
                            maximo: 530,
                            medio: 475
                        }
                    },
                    ate4pessoas: {
                        baixaTemporada: {
                            periodo: 'Março-Junho, Agosto-Novembro',
                            minimo: 300,
                            maximo: 400,
                            medio: 350
                        },
                        altaTemporada: {
                            periodo: 'Julho, Dezembro (exc. Réveillon), Carnaval',
                            minimo: 420,
                            maximo: 550,
                            medio: 485
                        },
                        altissimaTemporada: {
                            periodo: 'Janeiro, Réveillon',
                            minimo: 500,
                            maximo: 650,
                            medio: 575
                        }
                    }
                }
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

