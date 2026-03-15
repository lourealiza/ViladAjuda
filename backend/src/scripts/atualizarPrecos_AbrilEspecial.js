/**
 * Script para atualizar preços de 03-07/04/2026
 * Período: 03 a 07 de abril de 2026
 * Preço: R$ 530,00 por noite
 * 
 * Execução: node src/scripts/atualizarPrecos_AbrilEspecial.js
 */

require('dotenv').config();
const database = require('../config/database');
const Temporada = require('../models/Temporada');
const ChaleTemporadaPreco = require('../models/ChaleTemporadaPreco');

const PRECO_ESPECIAL = 530.00;
const DATA_INICIO = '2026-04-03';
const DATA_FIM = '2026-04-07';
const DESCRICAO = 'Preço especial para período 03-07/04/2026';

async function atualizarPrecos() {
    try {
        console.log('🚀 Iniciando atualização de preços para 03-07/04/2026...\n');

        // 1. Verificar ou criar temporada especial
        console.log('📅 Verificando temporada especial...');
        const temporadaEspecial = await criarOuAtualizarTemporadaEspecial();
        console.log(`✓ Temporada criada: ${temporadaEspecial.nome} (ID: ${temporadaEspecial.id})\n`);

        // 2. Buscar todos os chalés ativos
        console.log('🏠 Buscando chalés ativos...');
        const chales = await buscarChalesAtivos();
        console.log(`✓ Encontrados ${chales.length} chalé(s)\n`);

        // 3. Atualizar preço para cada chalé
        console.log('💰 Atualizando preços...');
        let sucessos = 0;
        let erros = 0;

        for (const chale of chales) {
            try {
                const precoExistente = await ChaleTemporadaPreco.buscarPorId(
                    chale.id,
                    temporadaEspecial.id
                );

                if (precoExistente) {
                    // Atualizar preço existente
                    const sql = `
                        UPDATE chale_temporada_precos 
                        SET preco_base = ?, atualizado_em = CURRENT_TIMESTAMP
                        WHERE chale_id = ? AND temporada_id = ?
                    `;
                    
                    await new Promise((resolve, reject) => {
                        database.run(
                            sql,
                            [PRECO_ESPECIAL, chale.id, temporadaEspecial.id],
                            function(err) {
                                if (err) return reject(err);
                                resolve();
                            }
                        );
                    });
                    
                    console.log(`  ✓ ${chale.nome}: Atualizado para R$ ${PRECO_ESPECIAL.toFixed(2)}`);
                } else {
                    // Criar novo preço
                    await ChaleTemporadaPreco.criar({
                        chale_id: chale.id,
                        temporada_id: temporadaEspecial.id,
                        preco_base: PRECO_ESPECIAL,
                        ativo: 1
                    });
                    
                    console.log(`  ✓ ${chale.nome}: Criado com R$ ${PRECO_ESPECIAL.toFixed(2)}`);
                }
                sucessos++;
            } catch (erro) {
                console.error(`  ✗ ${chale.nome}: Erro - ${erro.message}`);
                erros++;
            }
        }

        console.log(`\n📊 Resumo da atualização:`);
        console.log(`  ✓ Sucessos: ${sucessos}`);
        console.log(`  ✗ Erros: ${erros}`);
        console.log(`  📅 Período: ${DATA_INICIO} a ${DATA_FIM}`);
        console.log(`  💵 Preço: R$ ${PRECO_ESPECIAL.toFixed(2)}/noite`);
        console.log(`\n✅ Processo concluído!\n`);

        // 4. Exibir verificação
        console.log('📋 Verificação dos preços atualizados:');
        await verificarPrecosAtualizados(temporadaEspecial.id, chales);

    } catch (erro) {
        console.error('❌ Erro ao atualizar preços:', erro.message);
        process.exit(1);
    }
}

/**
 * Cria ou atualiza a temporada especial de abril
 */
async function criarOuAtualizarTemporadaEspecial() {
    return new Promise((resolve, reject) => {
        // Verificar se já existe
        const sqlBuscar = `
            SELECT * FROM temporadas 
            WHERE data_inicio = ? AND data_fim = ?
            AND tipo = 'media'
        `;

        database.get(sqlBuscar, [DATA_INICIO, DATA_FIM], async (err, temporada) => {
            if (err) return reject(err);

            if (temporada) {
                // Atualizar existente
                const sqlAtualizar = `
                    UPDATE temporadas 
                    SET nome = ?, descricao = ?, atualizado_em = CURRENT_TIMESTAMP
                    WHERE id = ?
                `;

                database.run(
                    sqlAtualizar,
                    [`Especial Abril (03-07)`, DESCRICAO, temporada.id],
                    function(err) {
                        if (err) return reject(err);
                        resolve(temporada);
                    }
                );
            } else {
                // Criar nova
                const sqlCriar = `
                    INSERT INTO temporadas (
                        nome, tipo, data_inicio, data_fim, 
                        multiplicador, diaria_minima, descricao, ativo
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, 1)
                `;

                database.run(
                    sqlCriar,
                    [
                        'Especial Abril (03-07)',
                        'media',
                        DATA_INICIO,
                        DATA_FIM,
                        1.00,
                        1,
                        DESCRICAO
                    ],
                    function(err) {
                        if (err) return reject(err);
                        resolve({
                            id: this.lastID,
                            nome: 'Especial Abril (03-07)',
                            tipo: 'media',
                            data_inicio: DATA_INICIO,
                            data_fim: DATA_FIM
                        });
                    }
                );
            }
        });
    });
}

/**
 * Busca chalés ativos
 */
async function buscarChalesAtivos() {
    return new Promise((resolve, reject) => {
        const sql = `SELECT id, nome FROM chales WHERE ativo = 1 ORDER BY nome`;
        database.all(sql, [], (err, rows) => {
            if (err) return reject(err);
            resolve(rows || []);
        });
    });
}

/**
 * Verifica os preços após atualização
 */
async function verificarPrecosAtualizados(temporadaId, chales) {
    return new Promise((resolve, reject) => {
        const placeholders = chales.map(() => '?').join(',');
        const sql = `
            SELECT 
                c.nome as chale_nome,
                ctp.preco_base,
                t.nome as temporada_nome,
                t.data_inicio,
                t.data_fim
            FROM chale_temporada_precos ctp
            LEFT JOIN chales c ON ctp.chale_id = c.id
            LEFT JOIN temporadas t ON ctp.temporada_id = t.id
            WHERE ctp.temporada_id = ? AND ctp.chale_id IN (${placeholders})
            ORDER BY c.nome
        `;

        const params = [temporadaId, ...chales.map(c => c.id)];
        
        database.all(sql, params, (err, rows) => {
            if (err) return reject(err);
            
            if (rows && rows.length > 0) {
                console.log('');
                rows.forEach(row => {
                    console.log(
                        `  ${row.chale_nome}: R$ ${row.preco_base.toFixed(2)} ` +
                        `(${row.data_inicio} a ${row.data_fim})`
                    );
                });
            }
            resolve();
        });
    });
}

// Executar script
if (require.main === module) {
    atualizarPrecos();
}

module.exports = { atualizarPrecos };
