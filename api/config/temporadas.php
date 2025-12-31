<?php
/**
 * Configuração de Temporadas e Preços
 * Sistema de precificação dinâmica baseado em temporadas
 */

/**
 * Define as temporadas e seus preços médios sugeridos
 * Formato: [data_inicio, data_fim, tipo_temporada, preco_min, preco_max]
 * O preço médio é calculado automaticamente como (min + max) / 2
 */
define('TEMPORADAS', [
    // Amanhã até 31/01 - Altíssima (Réveillon + férias janeiro)
    [
        'nome' => 'Réveillon + Férias Janeiro',
        'tipo' => 'altissima',
        'data_inicio' => null, // Será calculado dinamicamente (amanhã)
        'data_fim' => '01-31', // 31 de janeiro
        'preco_min' => 700,
        'preco_max' => 800,
        'preco_medio' => 750
    ],
    
    // 01/02 – Carnaval (até Quarta de Cinzas)
    [
        'nome' => 'Carnaval',
        'tipo' => 'altissima',
        'data_inicio' => '02-01', // 1º de fevereiro
        'data_fim' => null, // Será calculado dinamicamente (Quarta de Cinzas)
        'preco_min' => 750,
        'preco_max' => 850,
        'preco_medio' => 800
    ],
    
    // Pós-Carnaval até 30/03 - Alta
    [
        'nome' => 'Pós-Carnaval',
        'tipo' => 'alta',
        'data_inicio' => 'pos_carnaval', // Marcador especial para calcular dinamicamente
        'data_fim' => '03-30', // 30 de março
        'preco_min' => 550,
        'preco_max' => 650,
        'preco_medio' => 600
    ],
    
    // Abril – 15/06 - Média/Baixa
    [
        'nome' => 'Média/Baixa Temporada',
        'tipo' => 'media_baixa',
        'data_inicio' => '04-01', // 1º de abril
        'data_fim' => '06-15', // 15 de junho
        'preco_min' => 400,
        'preco_max' => 500,
        'preco_medio' => 450
    ],
    
    // 16/06 – 31/07 - Alta (férias julho)
    [
        'nome' => 'Férias de Julho',
        'tipo' => 'alta',
        'data_inicio' => '06-16', // 16 de junho
        'data_fim' => '07-31', // 31 de julho
        'preco_min' => 550,
        'preco_max' => 650,
        'preco_medio' => 600
    ],
    
    // 01/08 – 31/10 - Baixa
    [
        'nome' => 'Baixa Temporada',
        'tipo' => 'baixa',
        'data_inicio' => '08-01', // 1º de agosto
        'data_fim' => '10-31', // 31 de outubro
        'preco_min' => 380,
        'preco_max' => 480,
        'preco_medio' => 430
    ],
    
    // 01/11 – 15/12 - Alta (pré-verão)
    [
        'nome' => 'Pré-Verão',
        'tipo' => 'alta',
        'data_inicio' => '11-01', // 1º de novembro
        'data_fim' => '12-15', // 15 de dezembro
        'preco_min' => 500,
        'preco_max' => 600,
        'preco_medio' => 550
    ],
    
    // 16/12 – 25/12 - Alta
    [
        'nome' => 'Alta Temporada Dezembro',
        'tipo' => 'alta',
        'data_inicio' => '12-16', // 16 de dezembro
        'data_fim' => '12-25', // 25 de dezembro
        'preco_min' => 600,
        'preco_max' => 700,
        'preco_medio' => 650
    ],
    
    // 26/12 – 05/01 (próximo Réveillon) - Altíssima
    [
        'nome' => 'Réveillon',
        'tipo' => 'altissima',
        'data_inicio' => '12-26', // 26 de dezembro
        'data_fim' => '01-05', // 5 de janeiro
        'preco_min' => 750,
        'preco_max' => 900,
        'preco_medio' => 825
    ]
]);

/**
 * Calcula a data da Quarta de Cinzas para um determinado ano
 * A Quarta de Cinzas é 46 dias antes do Domingo de Páscoa
 */
function calcularQuartaDeCinzas($ano) {
    // Algoritmo de cálculo da Páscoa (algoritmo de Gauss)
    $a = $ano % 19;
    $b = intval($ano / 100);
    $c = $ano % 100;
    $d = intval($b / 4);
    $e = $b % 4;
    $f = intval(($b + 8) / 25);
    $g = intval(($b - $f + 1) / 3);
    $h = (19 * $a + $b - $d - $g + 15) % 30;
    $i = intval($c / 4);
    $k = $c % 4;
    $l = (32 + 2 * $e + 2 * $i - $h - $k) % 7;
    $m = intval(($a + 11 * $h + 22 * $l) / 451);
    $mes = intval(($h + $l - 7 * $m + 114) / 31);
    $dia = (($h + $l - 7 * $m + 114) % 31) + 1;
    
    // Data da Páscoa
    $pascoa = new DateTime("$ano-$mes-$dia");
    
    // Quarta de Cinzas é 46 dias antes da Páscoa
    $quartaCinzas = clone $pascoa;
    $quartaCinzas->modify('-46 days');
    
    return $quartaCinzas;
}

/**
 * Determina a temporada para uma data específica
 * @param string $data Data no formato YYYY-MM-DD
 * @return array|null Array com informações da temporada ou null
 */
function determinarTemporada($data) {
    $dataObj = new DateTime($data);
    $ano = (int)$dataObj->format('Y');
    $mesDia = $dataObj->format('m-d');
    
    // Calcular Quarta de Cinzas para o ano atual
    $quartaCinzas = calcularQuartaDeCinzas($ano);
    $quartaCinzasStr = $quartaCinzas->format('m-d');
    
    // Calcular amanhã (para temporada de Réveillon + Janeiro)
    $amanha = new DateTime('tomorrow');
    $amanhaStr = $amanha->format('Y-m-d');
    $dataObjStr = $dataObj->format('Y-m-d');
    
    foreach (TEMPORADAS as $temporada) {
        $dataInicio = $temporada['data_inicio'];
        $dataFim = $temporada['data_fim'];
        
        // Tratar temporada que começa "amanhã" (Réveillon + Janeiro)
        if ($dataInicio === null) {
            // Réveillon + Janeiro: de amanhã até 31/01
            // Aplica apenas para datas em janeiro que sejam >= amanhã
            $mesAtual = (int)$dataObj->format('m');
            if ($mesAtual == 1 && $dataObjStr >= $amanhaStr && $mesDia <= '01-31') {
                return $temporada;
            }
            continue;
        }
        
        // Tratar temporada que termina na Quarta de Cinzas
        if ($dataFim === null) {
            // Carnaval: de 01/02 até Quarta de Cinzas
            if ($mesDia >= '02-01' && $mesDia <= $quartaCinzasStr) {
                return $temporada;
            }
            continue;
        }
        
        // Tratar temporada que cruza o ano (26/12 a 05/01)
        if ($dataInicio === '12-26' && $dataFim === '01-05') {
            if ($mesDia >= '12-26' || $mesDia <= '01-05') {
                return $temporada;
            }
            continue;
        }
        
        // Tratar temporada pós-Carnaval (dinâmica)
        if ($dataInicio === 'pos_carnaval') {
            // Pós-Carnaval: após Quarta de Cinzas até 30/03
            $quartaCinzasAno = clone $quartaCinzas;
            $quartaCinzasAno->modify('+1 day'); // Dia seguinte à Quarta de Cinzas
            $quartaCinzasAnoStr = $quartaCinzasAno->format('Y-m-d');
            
            if ($dataObjStr >= $quartaCinzasAnoStr && $mesDia <= '03-30') {
                return $temporada;
            }
            continue;
        }
        
        // Temporadas normais (dentro do mesmo ano)
        if ($mesDia >= $dataInicio && $mesDia <= $dataFim) {
            return $temporada;
        }
    }
    
    // Se não encontrou nenhuma temporada, retorna preço padrão
    return [
        'nome' => 'Temporada Padrão',
        'tipo' => 'padrao',
        'preco_min' => 450,
        'preco_max' => 550,
        'preco_medio' => 500
    ];
}

/**
 * Calcula o preço médio para uma data específica
 * @param string $data Data no formato YYYY-MM-DD
 * @return float Preço médio sugerido
 */
function calcularPrecoMedio($data) {
    $temporada = determinarTemporada($data);
    return $temporada['preco_medio'] ?? 500;
}

/**
 * Calcula o valor total de uma estadia considerando as temporadas e número de pessoas
 * @param string $dataCheckin Data de check-in (YYYY-MM-DD)
 * @param string $dataCheckout Data de checkout (YYYY-MM-DD)
 * @param int $numAdultos Número de adultos (padrão: 2 para casal)
 * @return array Array com valor_total, numero_noites, valor_medio_diaria e detalhes
 */
function calcularValorEstadia($dataCheckin, $dataCheckout, $numAdultos = 2) {
    $checkin = new DateTime($dataCheckin);
    $checkout = new DateTime($dataCheckout);
    
    // Validar número de adultos (mínimo 1, máximo 4)
    $numAdultos = max(1, min(4, (int)$numAdultos));
    
    // Preço por pessoa adicional (acima de 2 pessoas) - reduzido 10%
    $precoPorPessoaAdicional = 135.00;
    
    // Calcular quantas pessoas adicionais (acima do casal)
    $pessoasAdicionais = max(0, $numAdultos - 2);
    
    $valorTotal = 0;
    $detalhes = [];
    
    // Calcular diária por diária
    $dataAtual = clone $checkin;
    while ($dataAtual < $checkout) {
        $dataStr = $dataAtual->format('Y-m-d');
        $temporada = determinarTemporada($dataStr);
        $precoBaseCasal = $temporada['preco_medio'];
        
        // Calcular preço total: base (casal) + pessoas adicionais
        $precoDiaria = $precoBaseCasal + ($pessoasAdicionais * $precoPorPessoaAdicional);
        
        $valorTotal += $precoDiaria;
        $detalhes[] = [
            'data' => $dataStr,
            'temporada' => $temporada['nome'],
            'tipo' => $temporada['tipo'],
            'preco_base_casal' => $precoBaseCasal,
            'pessoas_adicionais' => $pessoasAdicionais,
            'preco_por_pessoa_adicional' => $precoPorPessoaAdicional,
            'preco_diaria' => $precoDiaria,
            'preco_min' => $temporada['preco_min'],
            'preco_max' => $temporada['preco_max']
        ];
        
        $dataAtual->modify('+1 day');
    }
    
    $numeroNoites = count($detalhes);
    
    return [
        'valor_total' => round($valorTotal, 2),
        'numero_noites' => $numeroNoites,
        'valor_medio_diaria' => $numeroNoites > 0 ? round($valorTotal / $numeroNoites, 2) : 0,
        'num_adultos' => $numAdultos,
        'preco_base_casal' => $detalhes[0]['preco_base_casal'] ?? 0,
        'pessoas_adicionais' => $pessoasAdicionais,
        'preco_por_pessoa_adicional' => $precoPorPessoaAdicional,
        'detalhes' => $detalhes
    ];
}
?>

