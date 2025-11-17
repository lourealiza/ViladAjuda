/**
 * Script para inserir avaliações de exemplo do Google Business
 * Execute: node src/scripts/inserirAvaliacoesExemplo.js
 */

require('dotenv').config();
const database = require('../config/database');
const AvaliacaoGoogle = require('../models/AvaliacaoGoogle');

async function inserirAvaliacoesExemplo() {
    try {
        console.log('Inserindo avaliações de exemplo...');

        const avaliacoes = [
            {
                nome_autor: 'Maria Silva',
                rating: 5,
                texto: 'Lugar incrível! Chalé muito aconchegante, limpo e bem equipado. A varanda com rede é perfeita para relaxar. A localização é excelente, perto de tudo mas em um ambiente tranquilo. Recomendo muito!',
                data_avaliacao: '2024-12-15',
                origem: 'google_business',
                ativo: true,
                ordem: 10
            },
            {
                nome_autor: 'João Santos',
                rating: 5,
                texto: 'Experiência maravilhosa! O chalé é completo, tem tudo que precisa. O jardim é lindo e o silêncio da rua é perfeito para descansar. A Renata foi super atenciosa. Voltaremos com certeza!',
                data_avaliacao: '2024-11-20',
                origem: 'google_business',
                ativo: true,
                ordem: 9
            },
            {
                nome_autor: 'Ana Costa',
                rating: 5,
                texto: 'Adoramos nossa estadia! O chalé é muito confortável, a cozinha tem tudo que precisa. A varanda com rede foi nosso lugar favorito. Localização perfeita, perto do centro mas em um ambiente calmo.',
                data_avaliacao: '2024-10-10',
                origem: 'google_business',
                ativo: true,
                ordem: 8
            },
            {
                nome_autor: 'Pedro Oliveira',
                rating: 5,
                texto: 'Excelente opção em Arraial! Chalé bem cuidado, limpo e organizado. A natureza ao redor é incrível, acordamos com o canto dos pássaros. Super recomendo para quem busca tranquilidade.',
                data_avaliacao: '2024-09-05',
                origem: 'google_business',
                ativo: true,
                ordem: 7
            },
            {
                nome_autor: 'Carla Mendes',
                rating: 5,
                texto: 'Perfeito para casais! Chalé completo, aconchegante e muito bem localizado. A varanda é o ponto alto, perfeita para tomar café da manhã. A Renata é super prestativa. Voltaremos!',
                data_avaliacao: '2024-08-18',
                origem: 'google_business',
                ativo: true,
                ordem: 6
            },
            {
                nome_autor: 'Roberto Lima',
                rating: 5,
                texto: 'Lugar especial! A combinação de natureza, conforto e localização é perfeita. O chalé tem tudo que precisa e está muito bem cuidado. Recomendo para quem quer uma experiência autêntica em Arraial.',
                data_avaliacao: '2024-07-22',
                origem: 'google_business',
                ativo: true,
                ordem: 5
            }
        ];

        for (const avaliacao of avaliacoes) {
            await AvaliacaoGoogle.criar(avaliacao);
            console.log(`✓ Avaliação de ${avaliacao.nome_autor} inserida`);
        }

        console.log('\n✅ Todas as avaliações foram inseridas com sucesso!');
        
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
    .then(() => inserirAvaliacoesExemplo())
    .catch(erro => {
        console.error('Erro ao conectar ao banco:', erro);
        process.exit(1);
    });

