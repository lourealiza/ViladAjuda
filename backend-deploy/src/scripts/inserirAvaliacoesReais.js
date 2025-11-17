/**
 * Script para inserir avaliações REAIS do Google Business
 * 
 * INSTRUÇÕES:
 * 1. Acesse: https://www.google.com/search?q=Vila+d%27Ajuda+Chal%C3%A9s
 * 2. Copie as avaliações do Google Meu Negócio
 * 3. Edite este arquivo e adicione as avaliações reais abaixo
 * 4. Execute: node src/scripts/inserirAvaliacoesReais.js
 */

require('dotenv').config();
const database = require('../config/database');
const AvaliacaoGoogle = require('../models/AvaliacaoGoogle');

async function inserirAvaliacoesReais() {
    try {
        console.log('Inserindo avaliações REAIS do Google Business...');

        // ============================================
        // AVALIAÇÕES REAIS DO GOOGLE BUSINESS
        // ============================================
        const avaliacoes = [
            {
                nome_autor: 'Alex Ferraresi',
                rating: 5,
                texto: 'Local maravilhoso. Quartos e atendimento.nota 10. Recomendo',
                data_avaliacao: '2023-08-23',
                origem: 'google_business',
                ativo: true,
                ordem: 10
            },
            {
                nome_autor: 'Thalita Quinto',
                rating: 5,
                texto: 'Um lugar simples, porém bem organizado e limpo.',
                data_avaliacao: '2023-01-03',
                origem: 'google_business',
                ativo: true,
                ordem: 9
            },
            {
                nome_autor: 'Astir Carrascosa',
                rating: 5,
                texto: 'Espetacular. Local paradisíaco. Pessoas experientes e super amáveis. Voltarei com certeza.',
                data_avaliacao: '2023-08-24',
                origem: 'google_business',
                ativo: true,
                ordem: 8
            }
        ];

        console.log(`\nInserindo ${avaliacoes.length} avaliações...\n`);

        for (const avaliacao of avaliacoes) {
            try {
                await AvaliacaoGoogle.criar(avaliacao);
                console.log(`✓ Avaliação de ${avaliacao.nome_autor} inserida`);
            } catch (erro) {
                console.error(`✗ Erro ao inserir avaliação de ${avaliacao.nome_autor}:`, erro.message);
            }
        }

        console.log('\n✅ Processo concluído!');
        
        // Mostrar estatísticas
        const stats = await AvaliacaoGoogle.calcularMediaRating();
        console.log('\n📊 Estatísticas:');
        console.log(`   Média: ${stats.media.toFixed(1)} estrelas`);
        console.log(`   Total: ${stats.total} avaliações`);

        process.exit(0);
    } catch (erro) {
        console.error('Erro ao inserir avaliações:', erro);
        process.exit(1);
    }
}

// Conectar ao banco e executar
database.connect()
    .then(() => inserirAvaliacoesReais())
    .catch(erro => {
        console.error('Erro ao conectar ao banco:', erro);
        process.exit(1);
    });

