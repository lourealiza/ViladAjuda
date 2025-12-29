/**
 * Script para atualizar os preços dos chalés com base na tabela oficial
 */

const database = require('../config/database');
const { calcularPrecoDiaria, obterTabelaPrecos } = require('../config/precos');

async function atualizarPrecos() {
    try {
        console.log('🚀 Atualizando preços dos chalés...\n');

        await database.connect();

        const chales = await database.all('SELECT * FROM chales');

        for (const chale of chales) {
            const referenciaBaixa = new Date('2024-04-15');
            const precoBase = calcularPrecoDiaria(chale.capacidade_adultos, referenciaBaixa, 'medio');

            await database.run(
                'UPDATE chales SET preco_diaria = ?, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?',
                [precoBase, chale.id]
            );

            console.log(`✅ ${chale.nome}:`);
            console.log(`   Capacidade: ${chale.capacidade_adultos} adultos`);
            console.log(`   Base baixa temporada: R$ ${precoBase.toFixed(2)}/noite`);
            console.log(`   Base alta temporada:  R$ ${calcularPrecoDiaria(chale.capacidade_adultos, new Date('2024-07-15'), 'medio').toFixed(2)}/noite`);
            console.log(`   Base altíssima:       R$ ${calcularPrecoDiaria(chale.capacidade_adultos, new Date('2025-01-15'), 'medio').toFixed(2)}/noite\n`);
        }

        console.log('🎯 Preços Atualizados!');
        console.log('\n📊 Faixas de preço por temporada:\n');

        const temporadas = obterTabelaPrecos();
        temporadas.forEach((temporada) => {
            console.log(`- ${temporada.nome} (${temporada.descricao})`);
            console.log(`    • 2 pessoas:   R$ ${temporada.faixaPreco2pessoas.min} - R$ ${temporada.faixaPreco2pessoas.max}`);
            console.log(`    • até 4 pessoas: R$ ${temporada.faixaPreco4pessoas.min} - R$ ${temporada.faixaPreco4pessoas.max}\n`);
        });

        console.log('🏷️ Descontos para estadias longas:');
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

if (require.main === module) {
    atualizarPrecos();
}

module.exports = atualizarPrecos;

