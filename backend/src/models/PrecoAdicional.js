const database = require('../config/database');

/**
 * Modelo de Preço Adicional por Hóspede
 * Gerencia adicionais para 3º/4º hóspede, crianças, pets, etc.
 */
class PrecoAdicional {
    static TIPOS = {
        HOSPEDE_EXTRA: 'hospede_extra',      // 3º/4º hóspede
        CRIANCA: 'crianca',                  // Criança (até 12 anos)
        BEBE: 'bebe',                        // Bebê (até 3 anos)
        PET: 'pet',                          // Animais de estimação
        LIMPEZA_EXTRA: 'limpeza_extra',      // Limpeza adicional
        CAMA_EXTRA: 'cama_extra'             // Cama extra/sofá-cama
    };

    /**
     * Cria um preço adicional
     */
    static async criar(dados) {
        const sql = `
            INSERT INTO precos_adicionais (
                chale_id, tipo, preco_por_noite, 
                descricao, condicoes, ativo, criado_em
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            dados.chale_id,
            dados.tipo,
            dados.preco_por_noite,
            dados.descricao || '',
            dados.condicoes ? JSON.stringify(dados.condicoes) : null,
            dados.ativo !== undefined ? dados.ativo : 1,
            new Date()
        ];

        return new Promise((resolve, reject) => {
            database.run(sql, params, function(err) {
                if (err) return reject(err);
                PrecoAdicional.buscarPorId(this.lastID).then(resolve).catch(reject);
            });
        });
    }

    /**
     * Busca por ID
     */
    static async buscarPorId(id) {
        const sql = `SELECT * FROM precos_adicionais WHERE id = ?`;

        return new Promise((resolve, reject) => {
            database.get(sql, [id], (err, row) => {
                if (err) return reject(err);
                if (row && row.condicoes) {
                    row.condicoes = JSON.parse(row.condicoes);
                }
                resolve(row);
            });
        });
    }

    /**
     * Busca preços adicionais de um chalé
     */
    static async buscarPorChale(chaleId, apenasAtivos = true) {
        let sql = `SELECT * FROM precos_adicionais WHERE chale_id = ?`;
        
        if (apenasAtivos) {
            sql += ` AND ativo = 1`;
        }
        
        sql += ` ORDER BY tipo, preco_por_noite`;

        return new Promise((resolve, reject) => {
            database.all(sql, [chaleId], (err, rows) => {
                if (err) return reject(err);
                const resultado = (rows || []).map(row => {
                    if (row.condicoes) {
                        row.condicoes = JSON.parse(row.condicoes);
                    }
                    return row;
                });
                resolve(resultado);
            });
        });
    }

    /**
     * Busca preços de um tipo específico
     */
    static async buscarPorTipo(chaleId, tipo, apenasAtivos = true) {
        let sql = `SELECT * FROM precos_adicionais WHERE chale_id = ? AND tipo = ?`;
        
        if (apenasAtivos) {
            sql += ` AND ativo = 1`;
        }

        return new Promise((resolve, reject) => {
            database.all(sql, [chaleId, tipo], (err, rows) => {
                if (err) return reject(err);
                const resultado = (rows || []).map(row => {
                    if (row.condicoes) {
                        row.condicoes = JSON.parse(row.condicoes);
                    }
                    return row;
                });
                resolve(resultado);
            });
        });
    }

    /**
     * Atualiza preço adicional
     */
    static async atualizar(id, dados) {
        const campos = [];
        const valores = [];

        if (dados.preco_por_noite !== undefined) {
            campos.push('preco_por_noite = ?');
            valores.push(dados.preco_por_noite);
        }

        if (dados.descricao !== undefined) {
            campos.push('descricao = ?');
            valores.push(dados.descricao);
        }

        if (dados.condicoes !== undefined) {
            campos.push('condicoes = ?');
            valores.push(dados.condicoes ? JSON.stringify(dados.condicoes) : null);
        }

        if (dados.ativo !== undefined) {
            campos.push('ativo = ?');
            valores.push(dados.ativo ? 1 : 0);
        }

        campos.push('atualizado_em = CURRENT_TIMESTAMP');
        valores.push(id);

        const sql = `UPDATE precos_adicionais SET ${campos.join(', ')} WHERE id = ?`;

        return new Promise((resolve, reject) => {
            database.run(sql, valores, function(err) {
                if (err) return reject(err);
                PrecoAdicional.buscarPorId(id).then(resolve).catch(reject);
            });
        });
    }

    /**
     * Deleta preço adicional
     */
    static async deletar(id) {
        const sql = `DELETE FROM precos_adicionais WHERE id = ?`;

        return new Promise((resolve, reject) => {
            database.run(sql, [id], function(err) {
                if (err) return reject(err);
                resolve(this.changes > 0);
            });
        });
    }

    /**
     * Calcula adicional para hóspedes extras
     * @param {Number} chaleId
     * @param {Number} numHospedes - Total de hóspedes
     * @param {Number} numDiarias - Número de diárias
     */
    static async calcularAdicionaisHospede(chaleId, numHospedes, numDiarias) {
        if (numHospedes <= 2) return { total: 0, detalhes: [] };

        const adicionaisHospede = await this.buscarPorTipo(chaleId, this.TIPOS.HOSPEDE_EXTRA, true);
        
        if (adicionaisHospede.length === 0) {
            return { total: 0, detalhes: [] };
        }

        const preco = adicionaisHospede[0].preco_por_noite;
        const numExtras = Math.min(numHospedes - 2, 2); // Máximo 2 extras (até 4 pessoas)
        const total = preco * numExtras * numDiarias;

        return {
            total: Math.round(total * 100) / 100,
            detalhes: {
                preco_por_noite: preco,
                num_haspedes_extras: numExtras,
                num_diarias: numDiarias,
                observacao: `${numExtras} hóspede(s) extra(s) × R$ ${preco}/noite × ${numDiarias} noites`
            }
        };
    }
}

module.exports = PrecoAdicional;
