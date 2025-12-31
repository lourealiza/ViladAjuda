const Database = require('../config/database-mysql');
require('dotenv').config();

/**
 * Cadastra feriados nacionais de 2026 com preço no topo da faixa da temporada correspondente
 */
async function cadastrarFeriados2026() {
    const database = new Database();
    
    try {
        console.log('🚀 Conectando ao banco de dados...\n');
        await database.connect();
        
        const connection = await database.pool.getConnection();
        
        try {
            // Feriados nacionais 2026
            const feriados2026 = [
                { nome: 'Confraternização Universal', data: '2026-01-01', tipo: 'nacional' },
                { nome: 'Carnaval', data: '2026-02-16', tipo: 'nacional' },
                { nome: 'Carnaval', data: '2026-02-17', tipo: 'nacional' },
                { nome: 'Paixão de Cristo (Sexta-feira Santa)', data: '2026-04-03', tipo: 'nacional' },
                { nome: 'Tiradentes', data: '2026-04-21', tipo: 'nacional' },
                { nome: 'Dia do Trabalho', data: '2026-05-01', tipo: 'nacional' },
                { nome: 'Corpus Christi', data: '2026-06-04', tipo: 'nacional' },
                { nome: 'Independência do Brasil', data: '2026-09-07', tipo: 'nacional' },
                { nome: 'Nossa Senhora Aparecida', data: '2026-10-12', tipo: 'nacional' },
                { nome: 'Finados', data: '2026-11-02', tipo: 'nacional' },
                { nome: 'Proclamação da República', data: '2026-11-15', tipo: 'nacional' },
                { nome: 'Natal', data: '2026-12-25', tipo: 'nacional' }
            ];
            
            console.log('📅 Cadastrando feriados 2026 com preço no topo da faixa...\n');
            
            const PRECO_BASE = 315.00; // Preço base dos chalés (reduzido 10% de R$ 350)
            let cadastrados = 0;
            let atualizados = 0;
            
            for (const feriado of feriados2026) {
                // Buscar temporada para esta data usando conexão MySQL diretamente
                const [temporadas] = await connection.execute(
                    `SELECT * FROM temporadas 
                     WHERE ativo = 1 
                     AND ? BETWEEN data_inicio AND data_fim
                     ORDER BY multiplicador DESC
                     LIMIT 1`,
                    [feriado.data]
                );
                
                const temporada = temporadas.length > 0 ? temporadas[0] : null;
                let precoOverride = null;
                
                if (temporada) {
                    // Calcular preço no topo da faixa baseado no multiplicador da temporada
                    // Preço máximo = preço base × multiplicador × 1.07 (topo da faixa, ~7% acima da média)
                    const multiplicador = parseFloat(temporada.multiplicador);
                    const precoMaximo = PRECO_BASE * multiplicador * 1.07;
                    precoOverride = parseFloat(precoMaximo.toFixed(2));
                    
                    console.log(`📌 ${feriado.nome} (${feriado.data})`);
                    console.log(`   Temporada: ${temporada.nome} (${temporada.tipo})`);
                    console.log(`   Multiplicador: ${multiplicador}x`);
                    console.log(`   Preço no topo: R$ ${precoOverride.toFixed(2)}`);
                } else {
                    // Se não houver temporada, usar multiplicador padrão de 1.5x (alta demanda)
                    const precoMaximo = PRECO_BASE * 1.5 * 1.07;
                    precoOverride = parseFloat(precoMaximo.toFixed(2));
                    
                    console.log(`📌 ${feriado.nome} (${feriado.data})`);
                    console.log(`   Sem temporada específica - usando multiplicador padrão 1.5x`);
                    console.log(`   Preço no topo: R$ ${precoOverride.toFixed(2)}`);
                }
                
                // Verificar se feriado já existe
                const [existentes] = await connection.execute(
                    'SELECT id FROM feriados WHERE data = ?',
                    [feriado.data]
                );
                
                if (existentes.length > 0) {
                    // Atualizar feriado existente
                    await connection.execute(
                        `UPDATE feriados 
                         SET nome = ?, tipo = ?, preco_override = ?, ativo = 1
                         WHERE id = ?`,
                        [
                            feriado.nome,
                            feriado.tipo,
                            precoOverride,
                            existentes[0].id
                        ]
                    );
                    console.log(`   ✅ Atualizado (ID: ${existentes[0].id})\n`);
                    atualizados++;
                } else {
                    // Inserir novo feriado
                    await connection.execute(
                        `INSERT INTO feriados 
                         (nome, data, tipo, multiplicador, preco_override, ativo)
                         VALUES (?, ?, ?, 1.5, ?, 1)`,
                        [
                            feriado.nome,
                            feriado.data,
                            feriado.tipo,
                            precoOverride
                        ]
                    );
                    
                    const [result] = await connection.execute(
                        'SELECT id FROM feriados WHERE data = ?',
                        [feriado.data]
                    );
                    
                    console.log(`   ✅ Cadastrado (ID: ${result[0].id})\n`);
                    cadastrados++;
                }
            }
            
            console.log('\n📊 Resumo:');
            console.log(`   ✅ Cadastrados: ${cadastrados}`);
            console.log(`   🔄 Atualizados: ${atualizados}`);
            
            // Listar todos os feriados de 2026
            console.log('\n📋 Feriados 2026 cadastrados:');
            const [feriados] = await connection.execute(
                `SELECT id, nome, data, tipo, preco_override 
                 FROM feriados 
                 WHERE data >= '2026-01-01' AND data <= '2026-12-31'
                 ORDER BY data`
            );
            
            feriados.forEach(feriado => {
                console.log(`   ${feriado.data} - ${feriado.nome} | Preço: R$ ${feriado.preco_override?.toFixed(2) || 'N/A'}`);
            });
            
            console.log('\n✅ Cadastro de feriados 2026 concluído!');
            console.log('\n💡 Nota: Os feriados usam preço no topo da faixa da temporada correspondente para refletir alta demanda.');
            
        } finally {
            connection.release();
        }
        
    } catch (erro) {
        console.error('❌ Erro ao cadastrar feriados:', erro.message);
        console.error(erro);
        process.exit(1);
    } finally {
        if (database.pool) {
            await database.pool.end();
        }
        process.exit(0);
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    cadastrarFeriados2026();
}

module.exports = cadastrarFeriados2026;

