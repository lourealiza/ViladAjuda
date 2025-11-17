const Temporada = require('../models/Temporada');
const Feriado = require('../models/Feriado');
const Cupom = require('../models/Cupom');
const Chale = require('../models/Chale');
const ChaleTemporadaPreco = require('../models/ChaleTemporadaPreco');
const RegraTarifacao = require('../models/RegraTarifacao');
const PrecoOverride = require('../models/PrecoOverride');

class TarifaService {
    /**
     * Calcula o valor total de uma estadia considerando todas as regras de tarifação
     */
    static async calcularValorEstadia(dados) {
        const { chale_id, data_checkin, data_checkout, num_adultos = 2, num_criancas = 0, cupom_codigo, idades_criancas = [] } = dados;

        // Buscar chalé
        const chale = await Chale.buscarPorId(chale_id);
        if (!chale) {
            throw new Error('Chalé não encontrado');
        }

        let valorTotal = 0;
        const detalhes = [];

        // Calcular valor por dia
        const dataInicio = new Date(data_checkin);
        const dataFim = new Date(data_checkout);
        const dias = Math.ceil((dataFim - dataInicio) / (1000 * 60 * 60 * 24));

        // Buscar regras de tarifação do chalé
        const regras = await RegraTarifacao.buscarRegrasPorChale(chale_id);

        for (let i = 0; i < dias; i++) {
            const dataAtual = new Date(dataInicio);
            dataAtual.setDate(dataAtual.getDate() + i);
            const dataStr = dataAtual.toISOString().split('T')[0];

            // 1. Verificar override de preço por data específica (prioridade máxima)
            const override = await PrecoOverride.buscarPorData(dataStr, chale_id);
            if (override) {
                detalhes.push({
                    data: dataStr,
                    valor_base: override.preco_override,
                    multiplicador: 1.0,
                    valor_dia: override.preco_override,
                    tipo: 'override',
                    motivo: override.motivo
                });
                valorTotal += parseFloat(override.preco_override);
                continue;
            }

            // 2. Verificar feriado com override
            const feriado = await Feriado.buscarPorData(dataStr);
            if (feriado && feriado.preco_override) {
                const precoFeriado = feriado.override_por_chale 
                    ? await this._buscarPrecoOverrideChale(chale_id, feriado.preco_override)
                    : feriado.preco_override;
                
                detalhes.push({
                    data: dataStr,
                    valor_base: precoFeriado,
                    multiplicador: 1.0,
                    valor_dia: precoFeriado,
                    tipo: `feriado:${feriado.nome}`,
                    override: true
                });
                valorTotal += parseFloat(precoFeriado);
                continue;
            }

            // 3. Buscar preço base (por temporada ou padrão do chalé)
            let precoBase = parseFloat(chale.preco_diaria || 0);
            let temporada = null;
            let multiplicador = 1.0;
            let tipoAplicado = 'base';

            // Verificar temporada
            temporada = await Temporada.buscarPorData(dataStr);
            if (temporada) {
                // Buscar preço específico do chalé para esta temporada
                const precoTemporada = await ChaleTemporadaPreco.buscarPrecoPorChaleEData(chale_id, dataStr);
                if (precoTemporada) {
                    precoBase = parseFloat(precoTemporada.preco_base);
                    tipoAplicado = `temporada:${temporada.nome} (preço específico)`;
                } else {
                    // Usar multiplicador da temporada sobre preço base do chalé
                    multiplicador = parseFloat(temporada.multiplicador);
                    precoBase = precoBase * multiplicador;
                    tipoAplicado = `temporada:${temporada.nome}`;
                }
            } else if (feriado && !feriado.preco_override) {
                // Aplicar multiplicador do feriado (se não tiver override)
                multiplicador = parseFloat(feriado.multiplicador);
                precoBase = precoBase * multiplicador;
                tipoAplicado = `feriado:${feriado.nome}`;
            }

            const valorDia = precoBase;
            valorTotal += valorDia;

            detalhes.push({
                data: dataStr,
                valor_base: parseFloat(chale.preco_diaria || 0),
                multiplicador: multiplicador,
                valor_dia: valorDia,
                tipo: tipoAplicado,
                temporada: temporada ? temporada.tipo : null
            });
        }

        // 4. Aplicar regras de pessoas extras
        const valorPessoasExtras = await this._calcularPessoasExtras(
            chale_id,
            num_adultos,
            regras,
            dias
        );

        // 5. Aplicar regras de crianças
        const valorCriancas = await this._calcularValorCriancas(
            chale_id,
            num_criancas,
            idades_criancas,
            regras,
            dias,
            valorTotal / dias // valor médio por dia
        );

        const valorSubtotal = parseFloat((valorTotal + valorPessoasExtras + valorCriancas).toFixed(2));
        let desconto = 0;
        let cupomAplicado = null;
        let blackFridayAplicado = null;

        // 6. Aplicar desconto Black Friday (15%) se aplicável
        const { aplicarDescontoBlackFriday } = require('../config/precos');
        const descontoBF = aplicarDescontoBlackFriday(valorSubtotal, data_checkin);
        if (descontoBF.aplicado) {
            desconto += descontoBF.valorDesconto;
            blackFridayAplicado = {
                percentual: descontoBF.percentualDesconto,
                valor: descontoBF.valorDesconto,
                campanha: descontoBF.campanha
            };
        }

        // 7. Aplicar cupom se fornecido (desconto adicional)
        if (cupom_codigo) {
            const temporadaTipo = temporada ? temporada.tipo : null;
            const resultadoCupom = await Cupom.aplicarCupom(cupom_codigo, valorSubtotal, {
                temporada_tipo: temporadaTipo,
                chale_id: chale_id
            });
            
            if (resultadoCupom.valido) {
                desconto = resultadoCupom.desconto;
                cupomAplicado = {
                    codigo: resultadoCupom.cupom.codigo,
                    tipo: resultadoCupom.cupom.tipo,
                    valor: resultadoCupom.cupom.valor,
                    campanha: resultadoCupom.cupom.campanha
                };
            }
        }

        const valorFinal = parseFloat((valorSubtotal - desconto).toFixed(2));

        return {
            valor_base: parseFloat(chale.preco_diaria || 0),
            num_diarias: dias,
            valor_hospedagem: valorTotal,
            valor_pessoas_extras: valorPessoasExtras,
            valor_criancas: valorCriancas,
            valor_subtotal: valorSubtotal,
            desconto: desconto,
            valor_total: valorFinal,
            cupom: cupomAplicado,
            black_friday: blackFridayAplicado,
            detalhes: detalhes,
            regras_aplicadas: {
                pessoas_extras: valorPessoasExtras > 0,
                criancas: valorCriancas !== 0
            }
        };
    }

    /**
     * Calcula valor adicional por pessoas extras
     */
    static async _calcularPessoasExtras(chaleId, numAdultos, regras, numDiarias) {
        const regraPessoaExtra = regras.find(r => r.tipo === 'pessoa_extra' && r.ativo);
        
        if (!regraPessoaExtra) {
            return 0;
        }

        const pessoasExtras = Math.max(0, numAdultos - regraPessoaExtra.limite_pessoas_base);
        
        if (pessoasExtras === 0) {
            return 0;
        }

        return parseFloat((pessoasExtras * regraPessoaExtra.valor_adicional * numDiarias).toFixed(2));
    }

    /**
     * Calcula valor de crianças (pode ser negativo se grátis ou desconto)
     */
    static async _calcularValorCriancas(chaleId, numCriancas, idadesCriancas, regras, numDiarias, valorMedioDiaria) {
        if (numCriancas === 0) {
            return 0;
        }

        const regraCrianca = regras.find(r => 
            (r.tipo === 'crianca_gratis' || r.tipo === 'crianca_desconto') && r.ativo
        );

        if (!regraCrianca) {
            return 0;
        }

        let valorTotalCriancas = 0;
        const valorDiariaCrianca = valorMedioDiaria;

        for (let i = 0; i < numCriancas; i++) {
            const idade = idadesCriancas[i] || null;
            
            // Verificar se criança está dentro da idade máxima
            if (regraCrianca.idade_maxima_crianca && idade && idade > regraCrianca.idade_maxima_crianca) {
                // Criança acima da idade máxima paga valor normal
                valorTotalCriancas += valorDiariaCrianca * numDiarias;
                continue;
            }

            if (regraCrianca.tipo === 'crianca_gratis') {
                // Criança grátis - não adiciona valor
                continue;
            }

            if (regraCrianca.tipo === 'crianca_desconto') {
                let valorCrianca = valorDiariaCrianca;
                
                // Aplicar desconto percentual
                if (regraCrianca.desconto_crianca_percentual) {
                    valorCrianca = valorCrianca * (1 - regraCrianca.desconto_crianca_percentual / 100);
                }
                
                // Aplicar desconto fixo
                if (regraCrianca.desconto_crianca_fixo) {
                    valorCrianca = Math.max(0, valorCrianca - regraCrianca.desconto_crianca_fixo);
                }
                
                valorTotalCriancas += valorCrianca * numDiarias;
            }
        }

        return parseFloat(valorTotalCriancas.toFixed(2));
    }

    /**
     * Busca preço override específico por chalé (para feriados com override_por_chale)
     */
    static async _buscarPrecoOverrideChale(chaleId, precoPadrao) {
        // Por enquanto retorna o preço padrão
        // Pode ser expandido para buscar preço específico do chalé
        return precoPadrao;
    }

    /**
     * Verifica se há diária mínima configurada para o período
     */
    static async verificarDiariaMinima(data_checkin, data_checkout) {
        const dataInicio = new Date(data_checkin);
        const dataFim = new Date(data_checkout);
        const dias = Math.ceil((dataFim - dataInicio) / (1000 * 60 * 60 * 24));

        const temporadas = await Temporada.buscarPorPeriodo(data_checkin, data_checkout);
        
        let diariaMinima = 2; // Diária mínima padrão: 2 dias
        for (const temporada of temporadas) {
            if (temporada.diaria_minima > diariaMinima) {
                diariaMinima = temporada.diaria_minima;
            }
        }
        
        return {
            diaria_minima: diariaMinima,
            diarias_solicitadas: dias,
            atende_minimo: dias >= diariaMinima,
            temporadas_aplicaveis: temporadas.map(t => ({
                nome: t.nome,
                tipo: t.tipo,
                diaria_minima: t.diaria_minima
            }))
        };
    }

    /**
     * Busca todas as temporadas e feriados para um período
     */
    static async buscarTarifasPeriodo(dataInicio, dataFim) {
        const temporadas = await Temporada.buscarTodos(true);
        const feriados = await Feriado.buscarPorPeriodo(dataInicio, dataFim);

        return {
            temporadas,
            feriados
        };
    }
}

module.exports = TarifaService;
