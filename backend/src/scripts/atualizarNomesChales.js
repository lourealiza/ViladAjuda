/**
 * Script para atualizar nomes dos chalés no banco de dados
 * Execute: node src/scripts/atualizarNomesChales.js
 */

const database = require('../config/database');
const Chale = require('../models/Chale');

async function atualizarNomesChales() {
    try {
        console.log('🔄 Atualizando nomes dos chalés...\n');

        // Buscar chalés
        const chales = await Chale.buscarTodos();

        // Atualizar Chalé 1 para "Alvorada Tropical"
        const chale1 = chales.find(c => c.nome === 'Chalé 1' || c.id === 1);
        if (chale1) {
            await Chale.atualizar(chale1.id, { nome: 'Alvorada Tropical' });
            console.log('✅ Chalé 1 → Alvorada Tropical');
        }

        // Atualizar Chalé 2 para "Vila do Canto"
        const chale2 = chales.find(c => c.nome === 'Chalé 2' || c.id === 2);
        if (chale2) {
            await Chale.atualizar(chale2.id, { nome: 'Vila do Canto' });
            console.log('✅ Chalé 2 → Vila do Canto');
        }

        // Desativar Chalé 3
        const chale3 = chales.find(c => c.nome === 'Chalé 3' || c.id === 3);
        if (chale3) {
            await Chale.atualizar(chale3.id, { ativo: 0 });
            console.log('✅ Chalé 3 → Desativado');
        }

        // Desativar Chalé 4
        const chale4 = chales.find(c => c.nome === 'Chalé 4' || c.id === 4);
        if (chale4) {
            await Chale.atualizar(chale4.id, { ativo: 0 });
            console.log('✅ Chalé 4 → Desativado');
        }

        console.log('\n✅ Atualização concluída!');
        process.exit(0);
    } catch (erro) {
        console.error('❌ Erro ao atualizar chalés:', erro);
        process.exit(1);
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    atualizarNomesChales();
}

module.exports = atualizarNomesChales;

