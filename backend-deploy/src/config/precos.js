/**
 * Configuração de Preços - Vila d'Ajuda
 * Baseado no mercado de Arraial d'Ajuda
 */

// Temporadas
const TEMPORADAS = {
    BAIXA: 'baixa',           // Março-Junho, Agosto-Novembro
    ALTA: 'alta',             // Julho, Dezembro (exceto Réveillon)
    ALTISSIMA: 'altissima'    // Janeiro, Réveillon
};

// Tabela de preços por capacidade e temporada
// Baseado na análise de mercado: Preço Competitivo R$ 390, Valor R$ 450, Premium R$ 520
const TABELA_PRECOS = {
    // Chalés para 2 pessoas
    ate_2_pessoas: {
        [TEMPORADAS.BAIXA]: {
            min: 250,
            max: 350
        },
        [TEMPORADAS.ALTA]: {
            min: 390,  // Preço Competitivo
            max: 450   // Preço de Valor (Recomendado)
        },
        [TEMPORADAS.ALTISSIMA]: {
            min: 450,  // Preço de Valor
            max: 520   // Preço Premium
        }
    },
    // Chalés para 3-4 pessoas
    ate_4_pessoas: {
        [TEMPORADAS.BAIXA]: {
            min: 300,
            max: 400
        },
        [TEMPORADAS.ALTA]: {
            min: 450,
            max: 550
        },
        [TEMPORADAS.ALTISSIMA]: {
            min: 520,
            max: 650
        }
    }
};

/**
 * Determina a temporada com base na data
 * @param {Date|string} data 
 * @returns {string} temporada
 */
function determinarTemporada(data) {
    const dataObj = typeof data === 'string' ? new Date(data) : data;
    const mes = dataObj.getMonth() + 1; // 1-12
    const dia = dataObj.getDate();
    
    // Janeiro (altíssima temporada)
    if (mes === 1) {
        return TEMPORADAS.ALTISSIMA;
    }
    
    // Réveillon (últimos dias de dezembro)
    if (mes === 12 && dia >= 20) {
        return TEMPORADAS.ALTISSIMA;
    }
    
    // Julho e Dezembro (alta temporada)
    if (mes === 7 || mes === 12) {
        return TEMPORADAS.ALTA;
    }
    
    // Carnaval (fevereiro/março - varia por ano, simplificado)
    if (mes === 2 || (mes === 3 && dia <= 10)) {
        return TEMPORADAS.ALTA;
    }
    
    // Resto do ano (baixa temporada)
    return TEMPORADAS.BAIXA;
}

/**
 * Calcula o preço da diária baseado na capacidade e data
 * @param {number} capacidadeAdultos 
 * @param {Date|string} data 
 * @param {string} opcao - 'min', 'max' ou 'medio'
 * @returns {number}
 */
function calcularPrecoDiaria(capacidadeAdultos, data, opcao = 'medio') {
    const temporada = determinarTemporada(data);
    
    // Determinar categoria do chalé
    let categoria;
    if (capacidadeAdultos <= 2) {
        categoria = TABELA_PRECOS.ate_2_pessoas;
    } else {
        categoria = TABELA_PRECOS.ate_4_pessoas;
    }
    
    const precosTemporada = categoria[temporada];
    
    // Retornar preço baseado na opção
    switch(opcao) {
        case 'min':
            return precosTemporada.min;
        case 'max':
            return precosTemporada.max;
        case 'medio':
        default:
            return Math.round((precosTemporada.min + precosTemporada.max) / 2);
    }
}

/**
 * Calcula o valor total da estadia
 * @param {number} capacidadeAdultos 
 * @param {string} dataCheckin - YYYY-MM-DD
 * @param {string} dataCheckout - YYYY-MM-DD
 * @returns {object} { valorTotal, detalhes }
 */
function calcularValorEstadia(capacidadeAdultos, dataCheckin, dataCheckout) {
    const checkin = new Date(dataCheckin + 'T00:00:00');
    const checkout = new Date(dataCheckout + 'T00:00:00');
    
    let valorTotal = 0;
    const detalhes = [];
    
    // Calcular diária por diária
    const dataAtual = new Date(checkin);
    while (dataAtual < checkout) {
        const precoDiaria = calcularPrecoDiaria(capacidadeAdultos, dataAtual);
        const temporada = determinarTemporada(dataAtual);
        
        valorTotal += precoDiaria;
        detalhes.push({
            data: dataAtual.toISOString().split('T')[0],
            temporada,
            valor: precoDiaria
        });
        
        dataAtual.setDate(dataAtual.getDate() + 1);
    }
    
    return {
        valorTotal: Math.round(valorTotal),
        numeroNoites: detalhes.length,
        valorMedioDiaria: Math.round(valorTotal / detalhes.length),
        detalhes
    };
}

/**
 * Verifica se está no período de Black Friday
 * @param {Date|string} data 
 * @returns {boolean}
 */
function isBlackFriday(data) {
    const dataObj = typeof data === 'string' ? new Date(data) : data;
    const mes = dataObj.getMonth() + 1; // 1-12
    const dia = dataObj.getDate();
    
    // Black Friday geralmente é na última sexta-feira de novembro
    // Para simplificar, vamos considerar toda a última semana de novembro
    if (mes === 11 && dia >= 20 && dia <= 30) {
        return true;
    }
    
    return false;
}

/**
 * Aplica desconto de Black Friday (15%)
 * @param {number} valorTotal 
 * @param {Date|string} dataCheckin 
 * @returns {object}
 */
function aplicarDescontoBlackFriday(valorTotal, dataCheckin) {
    if (!isBlackFriday(dataCheckin)) {
        return {
            aplicado: false,
            percentualDesconto: 0,
            valorDesconto: 0,
            valorFinal: valorTotal
        };
    }
    
    const percentualDesconto = 15; // 15% de desconto
    const valorDesconto = Math.round(valorTotal * (percentualDesconto / 100));
    const valorFinal = valorTotal - valorDesconto;
    
    return {
        aplicado: true,
        percentualDesconto,
        valorDesconto,
        valorFinal,
        campanha: 'Black Friday'
    };
}

/**
 * Aplica desconto para estadias longas
 * @param {number} valorTotal 
 * @param {number} numeroNoites 
 * @returns {object}
 */
function aplicarDescontoEstadiaLonga(valorTotal, numeroNoites) {
    let percentualDesconto = 0;
    
    if (numeroNoites >= 7 && numeroNoites < 15) {
        percentualDesconto = 5; // 5% para 1 semana
    } else if (numeroNoites >= 15 && numeroNoites < 30) {
        percentualDesconto = 10; // 10% para 15+ dias
    } else if (numeroNoites >= 30) {
        percentualDesconto = 15; // 15% para 1 mês+
    }
    
    const valorDesconto = Math.round(valorTotal * (percentualDesconto / 100));
    const valorFinal = valorTotal - valorDesconto;
    
    return {
        valorOriginal: valorTotal,
        percentualDesconto,
        valorDesconto,
        valorFinal,
        aplicado: percentualDesconto > 0
    };
}

/**
 * Obtém informações sobre a temporada de uma data
 * @param {Date|string} data 
 * @returns {object}
 */
function obterInfoTemporada(data) {
    const temporada = determinarTemporada(data);
    
    const info = {
        temporada,
        nome: '',
        descricao: '',
        faixaPreco2pessoas: TABELA_PRECOS.ate_2_pessoas[temporada],
        faixaPreco4pessoas: TABELA_PRECOS.ate_4_pessoas[temporada]
    };
    
    switch(temporada) {
        case TEMPORADAS.BAIXA:
            info.nome = 'Baixa Temporada';
            info.descricao = 'Março-Junho, Agosto-Novembro';
            break;
        case TEMPORADAS.ALTA:
            info.nome = 'Alta Temporada';
            info.descricao = 'Julho, Dezembro, Carnaval';
            break;
        case TEMPORADAS.ALTISSIMA:
            info.nome = 'Altíssima Temporada';
            info.descricao = 'Janeiro, Réveillon';
            break;
    }
    
    return info;
}

module.exports = {
    TEMPORADAS,
    TABELA_PRECOS,
    determinarTemporada,
    calcularPrecoDiaria,
    calcularValorEstadia,
    aplicarDescontoEstadiaLonga,
    aplicarDescontoBlackFriday,
    isBlackFriday,
    obterInfoTemporada
};

