const Temporada = require('../models/Temporada');
const ChaleTemporadaPreco = require('../models/ChaleTemporadaPreco');
const PrecoAdicional = require('../models/PrecoAdicional');
const PoliticaCancelamento = require('../models/PoliticaCancelamento');
const Reserva = require('../models/Reserva');

/**
 * Serviço de Pricing Dinâmico Avançado
 * Implementa as regras de negócio:
 * - Adicionais por hóspede (3º/4º)
 * - Descontos por duração (evitando Semana Santa)
 * - Descontos last-minute (-5%, -10%, -15% progressivo)
 * - Políticas de cancelamento flexível/rigorosa
 */
class PricingService {
    /**
     * Calcula preço dinâmico completo (base + adicionais - descontos)
     */
    static async calcularPrecoCompleto(chaleId, dataCheckin, dataCheckout, numHospedes = 2, numCriancas = 0) {
        try {
            const checkin = new Date(dataCheckin);
            const checkout = new Date(dataCheckout);
            const numDiarias = Math.ceil((checkout - checkin) / (1000 * 60 * 60 * 24));

            // 1. Calcular preço base por temporada
            const precoBases = await this._calcularPrecoBases(chaleId, checkin, checkout);

            // 2. Aplicar desconto por duração (exceto Semana Santa)
            const descontoOuAjuste = await this._aplicarDescontoDuracao(
                checkin, 
                checkout, 
                precoBases.subtotal,
                numDiarias
            );

            // 3. Adicionar preço de hóspede extra (3º/4º)
            const adicionaisHospede = await PrecoAdicional.calcularAdicionaisHospede(
                chaleId,
                numHospedes,
                numDiarias
            );

            // 4. Aplicar desconto last-minute se aplicável
            const descontoLastMinute = this._calcularDescontoLastMinute(checkin, precoBases.subtotal);

            // 5. Montar resumo detalhado
            const total = Math.round(
                (precoBases.subtotal + descontoOuAjuste.desconto_ou_taxa + adicionaisHospede.total - descontoLastMinute.desconto) * 100
            ) / 100;

            // 6. Política de cancelamento padrão
            const politica = await PoliticaCancelamento.buscarPorChale(chaleId);

            return {
                sucesso: true,
                calculo: {
                    data_checkin: dataCheckin,
                    data_checkout: dataCheckout,
                    num_diarias: numDiarias,
                    num_hospedes: numHospedes,
                    num_criancas: numCriancas,
                    
                    // Detalhes do preço base
                    preco_base: {
                        subtotal: Math.round(precoBases.subtotal * 100) / 100,
                        detalhes_por_dia: precoBases.detalhes,
                        observacao: precoBases.observacao
                    },

                    // Desconto ou taxa por duração
                    desconto_duracao: descontoOuAjuste,

                    // Adicionais de hóspedes
                    adicionais_hospede: adicionaisHospede.total > 0 ? {
                        total: adicionaisHospede.total,
                        detalhes: adicionaisHospede.detalhes
                    } : null,

                    // Desconto last-minute
                    desconto_lastminute: descontoLastMinute.desconto > 0 ? {
                        percentual: descontoLastMinute.percentual,
                        desconto: descontoLastMinute.desconto,
                        observacao: descontoLastMinute.observacao
                    } : null,

                    // Total
                    valor_total: total,

                    // Política de cancelamento
                    politica_cancelamento: politica ? {
                        tipo: politica.tipo,
                        descricao: politica.descricao,
                        taxa_percentual: politica.taxa_adicional_percentual
                    } : null
                }
            };
        } catch (erro) {
            console.error('Erro ao calcular preço completo:', erro);
            throw erro;
        }
    }

    /**
     * Calcula preço base por temporada
     */
    static async _calcularPrecoBases(chaleId, dataCheckin, dataCheckout) {
        const detalhes = [];
        let subtotal = 0;
        let dataAtual = new Date(dataCheckin);

        while (dataAtual < dataCheckout) {
            const dataPróxima = new Date(dataAtual);
            dataPróxima.setDate(dataPróxima.getDate() + 1);

            const temporada = await Temporada.buscarPorData(dataAtual.toISOString().split('T')[0]);
            const precoDia = temporada ? await this._obterPrecoPorTemporada(chaleId, temporada.id) : 0;

            detalhes.push({
                data: dataAtual.toISOString().split('T')[0],
                temporada: temporada?.nome || 'N/A',
                preco: precoDia
            });

            subtotal += precoDia;
            dataAtual = dataPróxima;
        }

        return {
            subtotal,
            detalhes,
            observacao: `Preço base de ${detalhes[0]?.data} a ${detalhes[detalhes.length - 1]?.data}`
        };
    }

    /**
     * Obtém preço de uma temporada para um chalé
     */
    static async _obterPrecoPorTemporada(chaleId, temporadaId) {
        const preco = await ChaleTemporadaPreco.buscarPorId(chaleId, temporadaId);
        return preco ? preco.preco_base : 0;
    }

    /**
     * Aplica desconto por duração (evitando Semana Santa)
     * Máximo 3-5% fora de Semana Santa
     */
    static async _aplicarDescontoDuracao(dataCheckin, dataCheckout, subtotal, numDiarias) {
        const ehSemanaSanta = this._ehSemanaSanta(dataCheckin, dataCheckout);
        let descontoPercentual = 0;
        let observacao = '';

        // Aplicar desconto baseado em duração, com cautela em Semana Santa
        if (numDiarias >= 4 && !ehSemanaSanta) {
            // 4+ noites: 3-5%
            descontoPercentual = 3 + Math.floor(Math.random() * 2);
            observacao = `Desconto por ${numDiarias} noites`;
        } else if (numDiarias >= 7 && !ehSemanaSanta) {
            // 7+ noites: 5-7%
            descontoPercentual = 5 + Math.floor(Math.random() * 2);
            observacao = `Desconto por ${numDiarias} noites (promoção)`;
        } else if (numDiarias >= 14 && !ehSemanaSanta) {
            // 14+ noites: 10%
            descontoPercentual = 10;
            observacao = `Desconto por ${numDiarias}+ noites (longa estadia)`;
        }

        // Em Semana Santa, evitar desconto agressivo
        if (ehSemanaSanta) {
            if (numDiarias >= 7) {
                descontoPercentual = 2; // Mínimo apenas
                observacao = `2% desconto (período Semana Santa)`;
            } else {
                descontoPercentual = 0;
            }
        }

        const desconto = (subtotal * descontoPercentual) / 100;

        return {
            percentual: descontoPercentual,
            desconto_ou_taxa: -desconto, // Negativo = desconto
            observacao: observacao || 'Sem desconto'
        };
    }

    /**
     * Verifica se o período está em Semana Santa
     */
    static _ehSemanaSanta(dataCheckin, dataCheckout) {
        const ano = dataCheckin.getFullYear();
        
        // Aproximação: Semana Santa é tipicamente na última semana de março/primeira de abril
        // Para cálculo preciso, usar biblioteca de feriados ou API
        const mes = dataCheckin.getMonth();
        const dia = dataCheckin.getDate();

        // Semana Santa 2026: 03-09 abril (aproximação)
        return (mes === 3 && dia >= 1) || (mes === 2 && dia >= 25);
    }

    /**
     * Calcula desconto progressivo para last-minute (7 dias)
     * -5%, -10%, -15% conforme se aproxima do check-in
     */
    static _calcularDescontoLastMinute(dataCheckin, subtotal) {
        const agora = new Date();
        const diasAteCheckin = Math.ceil((dataCheckin - agora) / (1000 * 60 * 60 * 24));

        let descontoPercentual = 0;
        let observacao = '';

        if (diasAteCheckin <= 1) {
            // Menos de 1 dia: -15%
            descontoPercentual = 15;
            observacao = 'Oferta urgente - check-in amanhã';
        } else if (diasAteCheckin <= 3) {
            // 1-3 dias: -10%
            descontoPercentual = 10;
            observacao = `Last-minute: check-in em ${diasAteCheckin} dias`;
        } else if (diasAteCheckin <= 7) {
            // 3-7 dias: -5%
            descontoPercentual = 5;
            observacao = `Last-minute: check-in em ${diasAteCheckin} dias`;
        }

        const desconto = (subtotal * descontoPercentual) / 100;

        return {
            percentual: descontoPercentual,
            desconto: Math.round(desconto * 100) / 100,
            dias_ate_checkin: diasAteCheckin,
            observacao
        };
    }

    /**
     * Calcula impacto da política de cancelamento no preço
     */
    static async calcularTarifaCancelamento(chaleId, valorTotal, diasAntesCheckin) {
        const politica = await PoliticaCancelamento.buscarPorChale(chaleId);
        
        if (!politica) {
            return {
                tipo: 'indefinido',
                valor_total: valorTotal,
                reembolso: 0,
                taxa: 0
            };
        }

        const calculo = PoliticaCancelamento.calcularTaxaCancelamento(
            valorTotal,
            politica.tipo,
            diasAntesCheckin
        );

        return calculo;
    }

    /**
     * Simula cenários de preço para comparação
     */
    static async simularCenarios(chaleId, dataCheckin, dataCheckout, numHospedes = 2) {
        const cenarios = {};

        // Cenário 1: Sem extras
        cenarios.base = await this.calcularPrecoCompleto(
            chaleId,
            dataCheckin,
            dataCheckout,
            2
        );

        // Cenário 2: Com hóspede extra
        if (numHospedes > 2) {
            cenarios.com_hospede_extra = await this.calcularPrecoCompleto(
                chaleId,
                dataCheckin,
                dataCheckout,
                numHospedes
            );
        }

        // Cenário 3: Check-in 7 dias antes (teste de last-minute)
        const dataCheckinUltima = new Date();
        dataCheckinUltima.setDate(dataCheckinUltima.getDate() + 5);
        const dataCheckoutUltima = new Date(dataCheckinUltima);
        dataCheckoutUltima.setDate(dataCheckoutUltima.getDate() + 3);

        cenarios.last_minute = await this.calcularPrecoCompleto(
            chaleId,
            dataCheckinUltima.toISOString(),
            dataCheckoutUltima.toISOString(),
            numHospedes
        );

        return { sucesso: true, cenarios };
    }
}

module.exports = PricingService;
