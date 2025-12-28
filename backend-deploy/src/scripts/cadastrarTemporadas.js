require('dotenv').config();
const mysql = require('mysql2/promise');

/**
 * Calcula a data da Páscoa para um determinado ano (algoritmo de Gauss)
 */
function calcularPascoa(ano) {
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
}

/**
 * Calcula a Quarta de Cinzas (46 dias antes da Páscoa)
 */
function calcularQuartaDeCinzas(ano) {
    const pascoa = calcularPascoa(ano);
    const quartaCinzas = new Date(pascoa);
    quartaCinzas.setDate(quartaCinzas.getDate() - 46);
    return quartaCinzas;
}

/**
 * Formata data para YYYY-MM-DD
 */
function formatarData(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
}

async function cadastrarTemporadas() {
    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'viladajuda',
        port: process.env.DB_PORT || 3306
    };
    
    let connection;
    
    try {
        console.log('🚀 Conectando ao banco de dados...\n');
        connection = await mysql.createConnection(config);
        console.log('✅ Conectado ao MySQL\n');
        
        // Obter ano atual e próximo ano
        const hoje = new Date();
        const anoAtual = hoje.getFullYear();
        const proximoAno = anoAtual + 1;
        
        // Calcular datas dinâmicas
        const hojeFormatado = formatarData(hoje);
        
        const quartaCinzasAtual = calcularQuartaDeCinzas(anoAtual);
        const quartaCinzasProximo = calcularQuartaDeCinzas(proximoAno);
        
        const posCarnavalAtual = new Date(quartaCinzasAtual);
        posCarnavalAtual.setDate(posCarnavalAtual.getDate() + 1);
        
        // Preço base dos chalés: R$ 350
        const PRECO_BASE = 350.00;
        
        // Definir temporadas
        const temporadas = [
            {
                nome: 'Réveillon + Férias Janeiro',
                tipo: 'alta', // Altíssima -> usa 'alta' com multiplicador maior
                data_inicio: hojeFormatado, // Começa hoje, não amanhã
                data_fim: `${anoAtual}-01-31`,
                preco_min: 700,
                preco_max: 800,
                preco_medio: 750,
                multiplicador: (750 / PRECO_BASE).toFixed(2), // ~2.14
                diaria_minima: 3
            },
            {
                nome: 'Carnaval',
                tipo: 'alta', // Altíssima
                data_inicio: `${anoAtual}-02-01`,
                data_fim: formatarData(quartaCinzasAtual),
                preco_min: 750,
                preco_max: 850,
                preco_medio: 800,
                multiplicador: (800 / PRECO_BASE).toFixed(2), // ~2.29
                diaria_minima: 3
            },
            {
                nome: 'Pós-Carnaval',
                tipo: 'alta',
                data_inicio: formatarData(posCarnavalAtual),
                data_fim: `${anoAtual}-03-30`,
                preco_min: 550,
                preco_max: 650,
                preco_medio: 600,
                multiplicador: (600 / PRECO_BASE).toFixed(2), // ~1.71
                diaria_minima: 2
            },
            {
                nome: 'Média/Baixa Temporada',
                tipo: 'media',
                data_inicio: `${anoAtual}-04-01`,
                data_fim: `${anoAtual}-06-15`,
                preco_min: 400,
                preco_max: 500,
                preco_medio: 450,
                multiplicador: (450 / PRECO_BASE).toFixed(2), // ~1.29
                diaria_minima: 2
            },
            {
                nome: 'Férias de Julho',
                tipo: 'alta',
                data_inicio: `${anoAtual}-06-16`,
                data_fim: `${anoAtual}-07-31`,
                preco_min: 550,
                preco_max: 650,
                preco_medio: 600,
                multiplicador: (600 / PRECO_BASE).toFixed(2), // ~1.71
                diaria_minima: 2
            },
            {
                nome: 'Baixa Temporada',
                tipo: 'baixa',
                data_inicio: `${anoAtual}-08-01`,
                data_fim: `${anoAtual}-10-31`,
                preco_min: 380,
                preco_max: 480,
                preco_medio: 430,
                multiplicador: (430 / PRECO_BASE).toFixed(2), // ~1.23
                diaria_minima: 2
            },
            {
                nome: 'Pré-Verão',
                tipo: 'alta',
                data_inicio: `${anoAtual}-11-01`,
                data_fim: `${anoAtual}-12-15`,
                preco_min: 500,
                preco_max: 600,
                preco_medio: 550,
                multiplicador: (550 / PRECO_BASE).toFixed(2), // ~1.57
                diaria_minima: 2
            },
            {
                nome: 'Alta Temporada (Dezembro)',
                tipo: 'alta',
                data_inicio: `${anoAtual}-12-16`,
                data_fim: `${anoAtual}-12-25`,
                preco_min: 600,
                preco_max: 700,
                preco_medio: 650,
                multiplicador: (650 / PRECO_BASE).toFixed(2), // ~1.86
                diaria_minima: 3
            },
            {
                nome: 'Réveillon',
                tipo: 'alta', // Altíssima
                data_inicio: `${anoAtual}-12-26`,
                data_fim: `${proximoAno}-01-05`,
                preco_min: 750,
                preco_max: 900,
                preco_medio: 825,
                multiplicador: (825 / PRECO_BASE).toFixed(2), // ~2.36
                diaria_minima: 3
            }
        ];
        
        console.log('📅 Cadastrando temporadas...\n');
        console.log(`Ano atual: ${anoAtual}`);
        console.log(`Data de hoje: ${hojeFormatado}`);
        console.log(`Réveillon + Janeiro: ${hojeFormatado} até ${anoAtual}-01-31 (R$ 700-800)`);
        console.log(`Quarta de Cinzas ${anoAtual}: ${formatarData(quartaCinzasAtual)}\n`);
        
        let cadastradas = 0;
        let atualizadas = 0;
        let ignoradas = 0;
        
        for (const temporada of temporadas) {
            // Verificar se já existe temporada com mesmo nome e período
            const [existentes] = await connection.execute(
                `SELECT id, nome, data_inicio, data_fim FROM temporadas 
                 WHERE nome = ? AND data_inicio = ? AND data_fim = ?`,
                [temporada.nome, temporada.data_inicio, temporada.data_fim]
            );
            
            if (existentes.length > 0) {
                // Atualizar temporada existente
                await connection.execute(
                    `UPDATE temporadas 
                     SET tipo = ?, multiplicador = ?, diaria_minima = ?, ativo = 1
                     WHERE id = ?`,
                    [
                        temporada.tipo,
                        temporada.multiplicador,
                        temporada.diaria_minima,
                        existentes[0].id
                    ]
                );
                console.log(`🔄 Atualizada: ${temporada.nome} (${temporada.data_inicio} a ${temporada.data_fim})`);
                atualizadas++;
            } else {
                // Verificar se há sobreposição com outras temporadas
                const [sobrepostas] = await connection.execute(
                    `SELECT id, nome FROM temporadas 
                     WHERE ativo = 1 
                     AND (
                         (data_inicio <= ? AND data_fim >= ?) OR
                         (data_inicio >= ? AND data_fim <= ?) OR
                         (data_inicio <= ? AND data_fim >= ?)
                     )`,
                    [
                        temporada.data_inicio, temporada.data_fim,
                        temporada.data_inicio, temporada.data_fim,
                        temporada.data_inicio, temporada.data_fim
                    ]
                );
                
                if (sobrepostas.length > 0) {
                    console.log(`⚠️  Ignorada (sobreposição): ${temporada.nome} - conflito com: ${sobrepostas.map(s => s.nome).join(', ')}`);
                    ignoradas++;
                    continue;
                }
                
                // Inserir nova temporada
                await connection.execute(
                    `INSERT INTO temporadas 
                     (nome, tipo, data_inicio, data_fim, multiplicador, diaria_minima, ativo)
                     VALUES (?, ?, ?, ?, ?, ?, 1)`,
                    [
                        temporada.nome,
                        temporada.tipo,
                        temporada.data_inicio,
                        temporada.data_fim,
                        temporada.multiplicador,
                        temporada.diaria_minima
                    ]
                );
                
                console.log(`✅ Cadastrada: ${temporada.nome}`);
                console.log(`   Período: ${temporada.data_inicio} a ${temporada.data_fim}`);
                console.log(`   Tipo: ${temporada.tipo} | Multiplicador: ${temporada.multiplicador}x | Preço: R$ ${temporada.preco_min}-${temporada.preco_max} (médio: R$ ${temporada.preco_medio})`);
                console.log(`   Diária mínima: ${temporada.diaria_minima} dias\n`);
                cadastradas++;
            }
        }
        
        console.log('\n📊 Resumo:');
        console.log(`   ✅ Cadastradas: ${cadastradas}`);
        console.log(`   🔄 Atualizadas: ${atualizadas}`);
        console.log(`   ⚠️  Ignoradas: ${ignoradas}`);
        
        // Listar todas as temporadas ativas
        console.log('\n📋 Temporadas ativas cadastradas:');
        const [todas] = await connection.execute(
            `SELECT id, nome, tipo, data_inicio, data_fim, multiplicador, diaria_minima 
             FROM temporadas 
             WHERE ativo = 1 
             ORDER BY data_inicio`
        );
        
        const PRECO_BASE_DISPLAY = 350.00; // Preço base para exibição
        todas.forEach(temp => {
            const precoMin = (PRECO_BASE_DISPLAY * parseFloat(temp.multiplicador) * 0.93).toFixed(0);
            const precoMax = (PRECO_BASE_DISPLAY * parseFloat(temp.multiplicador) * 1.07).toFixed(0);
            console.log(`   ${temp.id}. ${temp.nome}`);
            console.log(`      ${temp.data_inicio} a ${temp.data_fim} | ${temp.tipo} | ${temp.multiplicador}x | R$ ${precoMin}-${precoMax}`);
        });
        
        console.log('\n✅ Cadastro de temporadas concluído!');
        
    } catch (erro) {
        console.error('❌ Erro ao cadastrar temporadas:', erro.message);
        console.error(erro);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
        process.exit(0);
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    cadastrarTemporadas();
}

module.exports = cadastrarTemporadas;
