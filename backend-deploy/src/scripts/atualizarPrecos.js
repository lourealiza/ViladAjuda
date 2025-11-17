/**
 * Script para atualizar os preços dos chalés baseado na tabela de mercado
 */

const database = require('../config/database');
const { calcularPrecoDiaria, TEMPORADAS } = require('../config/precos');

async function atualizarPrecos() {
    try {
        console.log('🔄 Atualizando preços dos chalés...\n');
        
        await database.connect();
        
        // Buscar todos os chalés
        const chales = await database.all('SELECT * FROM chales');
        
        for (const chale of chales) {
            // Calcular preço médio (baixa temporada como referência)
            const dataReferencia = new Date('2024-04-15'); // Abril = baixa temporada
            const precoBase = calcularPrecoDiaria(chale.capacidade_adultos, dataReferencia, 'medio');
            
            // Atualizar no banco
            await database.run(
                'UPDATE chales SET preco_diaria = ?, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?',
                [precoBase, chale.id]
            );
            
            console.log(`✅ ${chale.nome}:`);
            console.log(`   Capacidade: ${chale.capacidade_adultos} adultos`);
            console.log(`   Preço base (ref. baixa temporada): R$ ${precoBase.toFixed(2)}/noite`);
            console.log(`   Preço alta temporada: R$ ${calcularPrecoDiaria(chale.capacidade_adultos, new Date('2024-07-15'), 'medio').toFixed(2)}/noite`);
            console.log(`   Preço altíssima temporada: R$ ${calcularPrecoDiaria(chale.capacidade_adultos, new Date('2025-01-15'), 'medio').toFixed(2)}/noite\n`);
        }
        
        console.log('✅ Preços atualizados com sucesso!');
        console.log('\n📊 Tabela de Preços por Temporada:\n');
        console.log('CHALÉS ATÉ 2 PESSOAS:');
        console.log('  Baixa temporada:     R$ 250 - R$ 350');
        console.log('  Alta temporada:      R$ 350 - R$ 450');
        console.log('  Altíssima temporada: R$ 420 - R$ 530\n');
        console.log('CHALÉS ATÉ 4 PESSOAS:');
        console.log('  Baixa temporada:     R$ 300 - R$ 400');
        console.log('  Alta temporada:      R$ 420 - R$ 550');
        console.log('  Altíssima temporada: R$ 500 - R$ 650\n');
        
        console.log('💡 Descontos para estadias longas:');
        console.log('  7-14 noites:  5% de desconto');
        console.log('  15-29 noites: 10% de desconto');
        console.log('  30+ noites:   15% de desconto');
        
        await database.close();
        process.exit(0);
        
    } catch (erro) {
        console.error('❌ Erro ao atualizar preços:', erro);
        process.exit(1);
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    atualizarPrecos();
}

module.exports = atualizarPrecos;

