/**
 * Configuração de preços com temporadas detalhadas
 * Referência oficial enviada pelo cliente (faixas até 4 pessoas)
 */

const TIPOS_TEMPORADA = {
    BAIXA: 'baixa',
    MEDIA_BAIXA: 'media_baixa',
    ALTA: 'alta',
    ALTISSIMA: 'altissima'
};

const FATOR_DESCONTO_CASAL = 0.8; // Conversão aproximada para chalés de casal

const arredondarParaDez = (valor) => Math.round(valor / 10) * 10;

const derivarFaixa2Pessoas = (faixa4) => ({
    min: arredondarParaDez(faixa4.min * FATOR_DESCONTO_CASAL),
    max: arredondarParaDez(faixa4.max * FATOR_DESCONTO_CASAL)
});

const criarMatcherIntervaloFixo = (mesInicio, diaInicio, mesFim, diaFim) => {
    return (dataObj) => {
        const ano = dataObj.getFullYear();
        let anoInicio = ano;
        let anoFim = ano;

        const intervaloCruzaAno = mesInicio > mesFim || (mesInicio === mesFim && diaInicio > diaFim);

        if (intervaloCruzaAno) {
            if ((dataObj.getMonth() + 1) < mesInicio) {
                anoInicio = ano - 1;
                anoFim = ano;
            } else {
                anoInicio = ano;
                anoFim = ano + 1;
            }
        }

        const inicio = new Date(anoInicio, mesInicio - 1, diaInicio);
        const fim = new Date(anoFim, mesFim - 1, diaFim);
        return dataObj >= inicio && dataObj <= fim;
    };
};

const criarTemporada = (dados) => ({
    ...dados,
    faixa2: dados.faixa2 || derivarFaixa2Pessoas(dados.faixa4)
});

const calcularPascoa = (ano) => {
    const a = ano % 19;
    const b = Math.floor(ano / 100);
    const c = ano % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const mes = Math.floor((h + l - 7 * m + 114) / 31);
    const dia = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(ano, mes - 1, dia);
};

const calcularQuartaDeCinzas = (ano) => {
    const pascoa = calcularPascoa(ano);
    const quarta = new Date(pascoa);
    quarta.setDate(quarta.getDate() - 46);
    return quarta;
};

const normalizarData = (data) => {
    if (typeof data === 'string') {
        return new Date(`${data}T00:00:00`);
    }
    return new Date(data.getFullYear(), data.getMonth(), data.getDate());
};

const criarContextoTemporadas = (dataObj) => {
    const ano = dataObj.getFullYear();
    return {
        ano,
        quartaCinzasAnoAtual: calcularQuartaDeCinzas(ano)
    };
};

const TEMPORADAS_DETALHADAS = [
    criarTemporada({
        id: 'reveillon',
        nome: 'Altíssima (Réveillon)',
        descricao: '26/12 a 05/01',
        tipo: TIPOS_TEMPORADA.ALTISSIMA,
        faixa4: { min: 750, max: 900 },
        match: criarMatcherIntervaloFixo(12, 26, 1, 5)
    }),
    criarTemporada({
        id: 'altissima_janeiro',
        nome: 'Altíssima (Férias de Janeiro)',
        descricao: '06/01 a 31/01',
        tipo: TIPOS_TEMPORADA.ALTISSIMA,
        faixa4: { min: 700, max: 800 },
        match: criarMatcherIntervaloFixo(1, 6, 1, 31)
    }),
    criarTemporada({
        id: 'carnaval',
        nome: 'Altíssima (Carnaval)',
        descricao: '01/02 até Quarta de Cinzas',
        tipo: TIPOS_TEMPORADA.ALTISSIMA,
        faixa4: { min: 750, max: 850 },
        match: (dataObj, contexto) => {
            const ano = dataObj.getFullYear();
            const inicio = new Date(ano, 1, 1); // 1º de fevereiro
            const fim = new Date(contexto.quartaCinzasAnoAtual);
            return dataObj >= inicio && dataObj <= fim;
        }
    }),
    criarTemporada({
        id: 'pos_carnaval',
        nome: 'Alta (Pós-Carnaval)',
        descricao: 'Dia seguinte à Quarta de Cinzas até 31/03',
        tipo: TIPOS_TEMPORADA.ALTA,
        faixa4: { min: 550, max: 650 },
        match: (dataObj, contexto) => {
            const inicio = new Date(contexto.quartaCinzasAnoAtual);
            inicio.setDate(inicio.getDate() + 1);
            const fim = new Date(contexto.ano, 2, 31); // 31 de março
            return dataObj >= inicio && dataObj <= fim;
        }
    }),
    criarTemporada({
        id: 'media_baixa',
        nome: 'Média/Baixa',
        descricao: '01/04 a 15/06',
        tipo: TIPOS_TEMPORADA.MEDIA_BAIXA,
        faixa4: { min: 400, max: 500 },
        match: criarMatcherIntervaloFixo(4, 1, 6, 15)
    }),
    criarTemporada({
        id: 'ferias_julho',
        nome: 'Alta (Férias de Julho)',
        descricao: '16/06 a 31/07',
        tipo: TIPOS_TEMPORADA.ALTA,
        faixa4: { min: 550, max: 650 },
        match: criarMatcherIntervaloFixo(6, 16, 7, 31)
    }),
    criarTemporada({
        id: 'baixa_agosto_outubro',
        nome: 'Baixa',
        descricao: '01/08 a 31/10',
        tipo: TIPOS_TEMPORADA.BAIXA,
        faixa4: { min: 380, max: 480 },
        match: criarMatcherIntervaloFixo(8, 1, 10, 31)
    }),
    criarTemporada({
        id: 'pre_verao',
        nome: 'Alta (Pré-Verão)',
        descricao: '01/11 a 15/12',
        tipo: TIPOS_TEMPORADA.ALTA,
        faixa4: { min: 500, max: 600 },
        match: criarMatcherIntervaloFixo(11, 1, 12, 15)
    }),
    criarTemporada({
        id: 'alta_dezembro',
        nome: 'Alta Dezembro',
        descricao: '16/12 a 25/12',
        tipo: TIPOS_TEMPORADA.ALTA,
        faixa4: { min: 600, max: 700 },
        match: criarMatcherIntervaloFixo(12, 16, 12, 25)
    })
];

const TABELA_PRECOS = TEMPORADAS_DETALHADAS.map((temporada) => ({
    id: temporada.id,
    nome: temporada.nome,
    descricao: temporada.descricao,
    tipo: temporada.tipo,
    faixaPreco2pessoas: temporada.faixa2,
    faixaPreco4pessoas: temporada.faixa4
}));

const selecionarFaixaPorCapacidade = (capacidadeAdultos, temporada) => {
    return capacidadeAdultos <= 2 ? temporada.faixa2 : temporada.faixa4;
};

const formatarDataISO = (dataObj) => dataObj.toISOString().split('T')[0];

function obterTemporadaDetalhada(data) {
    const dataObj = normalizarData(data);
    const contexto = criarContextoTemporadas(dataObj);

    for (const temporada of TEMPORADAS_DETALHADAS) {
        if (temporada.match(dataObj, contexto)) {
            return temporada;
        }
    }

    return TEMPORADAS_DETALHADAS[TEMPORADAS_DETALHADAS.length - 1];
}

function determinarTemporada(data) {
    return obterTemporadaDetalhada(data).tipo;
}

function calcularPrecoDiaria(capacidadeAdultos, data, opcao = 'medio') {
    const temporada = obterTemporadaDetalhada(data);
    const faixa = selecionarFaixaPorCapacidade(capacidadeAdultos, temporada);

    switch (opcao) {
        case 'min':
            return faixa.min;
        case 'max':
            return faixa.max;
        case 'medio':
        default:
            return Math.round((faixa.min + faixa.max) / 2);
    }
}

function calcularValorEstadia(capacidadeAdultos, dataCheckin, dataCheckout) {
    const checkin = normalizarData(dataCheckin);
    const checkout = normalizarData(dataCheckout);

    let valorTotal = 0;
    const detalhes = [];

    for (let dataAtual = new Date(checkin); dataAtual < checkout; dataAtual.setDate(dataAtual.getDate() + 1)) {
        const temporada = obterTemporadaDetalhada(dataAtual);
        const diaria = calcularPrecoDiaria(capacidadeAdultos, dataAtual, 'medio');
        valorTotal += diaria;
        detalhes.push({
            data: formatarDataISO(dataAtual),
            temporada: temporada.nome,
            tipo: temporada.tipo,
            valor: diaria
        });
    }

    const numeroNoites = detalhes.length;

    return {
        valorTotal,
        numeroNoites,
        valorMedioDiaria: numeroNoites > 0 ? Math.round(valorTotal / numeroNoites) : 0,
        detalhes
    };
}

function aplicarDescontoEstadiaLonga(valorTotal, numeroNoites) {
    let percentualDesconto = 0;

    if (numeroNoites >= 5 && numeroNoites < 7) {
        percentualDesconto = 5;
    } else if (numeroNoites >= 7 && numeroNoites < 15) {
        percentualDesconto = 7;
    } else if (numeroNoites >= 15) {
        percentualDesconto = 10;
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

function isBlackFriday(data) {
    const dataObj = normalizarData(data);
    const mes = dataObj.getMonth() + 1;
    const dia = dataObj.getDate();
    return mes === 11 && dia >= 20 && dia <= 30;
}

function aplicarDescontoBlackFriday(valorTotal, dataCheckin) {
    if (!isBlackFriday(dataCheckin)) {
        return {
            aplicado: false,
            percentualDesconto: 0,
            valorDesconto: 0,
            valorFinal: valorTotal
        };
    }

    const percentualDesconto = 15;
    const valorDesconto = Math.round(valorTotal * (percentualDesconto / 100));
    return {
        aplicado: true,
        percentualDesconto,
        valorDesconto,
        valorFinal: valorTotal - valorDesconto,
        campanha: 'Black Friday'
    };
}

function obterInfoTemporada(data) {
    const temporada = obterTemporadaDetalhada(data);
    return {
        temporada: temporada.tipo,
        nome: temporada.nome,
        descricao: temporada.descricao,
        faixaPreco2pessoas: temporada.faixa2,
        faixaPreco4pessoas: temporada.faixa4
    };
}

function obterTabelaPrecos() {
    return TABELA_PRECOS.map((temporada) => ({
        ...temporada,
        faixaPreco2pessoas: { ...temporada.faixaPreco2pessoas },
        faixaPreco4pessoas: { ...temporada.faixaPreco4pessoas }
    }));
}

module.exports = {
    TIPOS_TEMPORADA,
    TABELA_PRECOS,
    TEMPORADAS_DETALHADAS,
    determinarTemporada,
    calcularPrecoDiaria,
    calcularValorEstadia,
    aplicarDescontoEstadiaLonga,
    aplicarDescontoBlackFriday,
    isBlackFriday,
    obterInfoTemporada,
    obterTabelaPrecos
};
