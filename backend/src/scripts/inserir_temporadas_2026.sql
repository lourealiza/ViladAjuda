-- ========================================
-- Inserir Temporadas Especiais 2026
-- ========================================
-- Preço base para cálculo: R$ 315.00 (90% de R$ 350)
-- Formato: multiplicador = preco_medio / 315

-- Limpar temporadas duplicadas de 2026 (opcional)
DELETE FROM temporadas 
WHERE ano = 2026 AND nome IN (
    'Semana Santa 2026',
    'Tiradentes 2026',
    'Dia do Trabalhador 2026',
    'Corpus Christi 2026',
    'São João 2026',
    'Independência da Bahia 2026',
    'Julho 2026 (férias)',
    'Agosto 2026 (Baixa Temporada)'
);

-- ========================================
-- Semana Santa 2026 (03/04 → 07/04)
-- Diária Médio: R$ 468
-- Multiplicador: 1.49
-- ========================================
INSERT INTO temporadas 
(nome, tipo, data_inicio, data_fim, multiplicador, diaria_minima, descricao, ativo)
VALUES (
    'Semana Santa 2026',
    'alta',
    '2026-04-03',
    '2026-04-07',
    1.49,
    4,
    'Semana Santa 2026 - Período limitado estimado',
    1
);

-- ========================================
-- Tiradentes 2026 (17/04 → 21/04)
-- Diária Médio: R$ 364
-- Multiplicador: 1.16
-- ========================================
INSERT INTO temporadas 
(nome, tipo, data_inicio, data_fim, multiplicador, diaria_minima, descricao, ativo)
VALUES (
    'Tiradentes 2026',
    'media',
    '2026-04-17',
    '2026-04-21',
    1.16,
    4,
    'Tiradentes 2026 - Período limitado estimado',
    1
);

-- ========================================
-- Dia do Trabalhador 2026 (01/05 → 04/05)
-- Diária Médio: R$ 351
-- Multiplicador: 1.11
-- ========================================
INSERT INTO temporadas 
(nome, tipo, data_inicio, data_fim, multiplicador, diaria_minima, descricao, ativo)
VALUES (
    'Dia do Trabalhador 2026',
    'media',
    '2026-05-01',
    '2026-05-04',
    1.11,
    3,
    'Dia do Trabalhador 2026 - Período limitado estimado',
    1
);

-- ========================================
-- Corpus Christi 2026 (04/06 → 07/06)
-- Diária Médio: R$ 351
-- Multiplicador: 1.11
-- ========================================
INSERT INTO temporadas 
(nome, tipo, data_inicio, data_fim, multiplicador, diaria_minima, descricao, ativo)
VALUES (
    'Corpus Christi 2026',
    'media',
    '2026-06-04',
    '2026-06-07',
    1.11,
    3,
    'Corpus Christi 2026 - Período limitado estimado',
    1
);

-- ========================================
-- São João 2026 (23/06 → 26/06)
-- Diária Médio: R$ 325
-- Multiplicador: 1.03
-- ========================================
INSERT INTO temporadas 
(nome, tipo, data_inicio, data_fim, multiplicador, diaria_minima, descricao, ativo)
VALUES (
    'São João 2026',
    'media',
    '2026-06-23',
    '2026-06-26',
    1.03,
    3,
    'São João 2026 - Período limitado estimado',
    1
);

-- ========================================
-- Independência da Bahia 2026 (01/07 → 04/07)
-- Diária Médio: R$ 377
-- Multiplicador: 1.20
-- ========================================
INSERT INTO temporadas 
(nome, tipo, data_inicio, data_fim, multiplicador, diaria_minima, descricao, ativo)
VALUES (
    'Independência da Bahia 2026',
    'media',
    '2026-07-01',
    '2026-07-04',
    1.20,
    3,
    'Independência da Bahia 2026 - Período limitado estimado',
    1
);

-- ========================================
-- Julho 2026 (férias) (13/07 → 20/07)
-- Diária Médio: R$ 351
-- Multiplicador: 1.11
-- ========================================
INSERT INTO temporadas 
(nome, tipo, data_inicio, data_fim, multiplicador, diaria_minima, descricao, ativo)
VALUES (
    'Julho 2026 (férias)',
    'alta',
    '2026-07-13',
    '2026-07-20',
    1.11,
    7,
    'Férias de Julho 2026 - Período limitado estimado',
    1
);

-- ========================================
-- Agosto 2026 (Baixa Temporada) (10/08 → 17/08)
-- Diária Médio: R$ 260
-- Multiplicador: 0.83
-- ========================================
INSERT INTO temporadas 
(nome, tipo, data_inicio, data_fim, multiplicador, diaria_minima, descricao, ativo)
VALUES (
    'Agosto 2026 (Baixa Temporada)',
    'baixa',
    '2026-08-10',
    '2026-08-17',
    0.83,
    7,
    'Agosto 2026 - Baixa Temporada estimada',
    1
);

-- ========================================
-- Verificação: Listar temporadas inseridas
-- ========================================
SELECT 'Temporadas 2026 inseridas com sucesso!' AS status;
SELECT 
    nome,
    tipo,
    data_inicio,
    data_fim,
    multiplicador,
    ROUND(315 * multiplicador, 0) AS preco_medio_estimado,
    diaria_minima,
    ativo
FROM temporadas
WHERE data_inicio >= '2026-01-01' AND data_inicio <= '2026-12-31'
ORDER BY data_inicio;
