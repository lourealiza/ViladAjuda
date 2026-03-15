const database = require('../config/database');

/**
 * Modelo de Política de Cancelamento
 * Gerencia as políticas flexíveis, não-reembolsáveis e suas respectivas tarifas
 */
class PoliticaCancelamento {
    static TIPOS = {
        FLEXIVEL: 'flexivel',         // +10-15% sobre não-reembolsável
        NAO_REEMBOLSAVEL: 'nao_reembolsavel', // Base 0%
        MODERADA: 'moderada',         // +5% sobre não-reembolsável
        RIGOROSA: 'rigorosa'          // +20% sobre não-reembolsável
    };

    static PERIODOS_CANCELAMENTO = {
        // Dias antes do check-in para reembolso total
        REEMBOLSO_TOTAL: 30,
        // Dias para reembolso parcial
        REEMBOLSO_PARCIAL_INICIO: 14,
        REEMBOLSO_PARCIAL_PERCENTUAL: 50
    };

    /**
     * Cria uma política de cancelamento
     */
    static async criar(dados) {
        const sql = `
            INSERT INTO politicas_cancelamento (
                chale_id, tipo, taxa_adicional_percentual, 
                descricao, condicoes_reembolso, ativo, criado_em
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            dados.chale_id,
            dados.tipo || this.TIPOS.NAO_REEMBOLSAVEL,
            dados.taxa_adicional_percentual || 0,
            dados.descricao || '',
            dados.condicoes_reembolso ? JSON.stringify(dados.condicoes_reembolso) : null,
            dados.ativo !== undefined ? dados.ativo : 1,
            new Date()
        ];

        return new Promise((resolve, reject) => {
            database.run(sql, params, function(err) {
                if (err) return reject(err);
                PoliticaCancelamento.buscarPorId(this.lastID).then(resolve).catch(reject);
            });
        });
    }

    /**
     * Busca política de cancelamento por ID
     */
    static async buscarPorId(id) {
        const sql = `SELECT * FROM politicas_cancelamento WHERE id = ?`;

        return new Promise((resolve, reject) => {
            database.get(sql, [id], (err, row) => {
                if (err) return reject(err);
                if (row && row.condicoes_reembolso) {
                    row.condicoes_reembolso = JSON.parse(row.condicoes_reembolso);
                }
                resolve(row);
            });
        });
    }

    /**
     * Busca política do chalé
     */
    static async buscarPorChale(chaleId) {
        const sql = `
            SELECT * FROM politicas_cancelamento 
            WHERE chale_id = ? AND ativo = 1
            ORDER BY criado_em DESC
            LIMIT 1
        `;

        return new Promise((resolve, reject) => {
            database.get(sql, [chaleId], (err, row) => {
                if (err) return reject(err);
                if (row && row.condicoes_reembolso) {
                    row.condicoes_reembolso = JSON.parse(row.condicoes_reembolso);
                }
                resolve(row);
            });
        });
    }

    /**
     * Busca todas as políticas
     */
    static async buscarTodas(apenasAtivas = true) {
        let sql = `SELECT * FROM politicas_cancelamento`;
        
        if (apenasAtivas) {
            sql += ` WHERE ativo = 1`;
        }
        
        sql += ` ORDER BY chale_id, criado_em DESC`;

        return new Promise((resolve, reject) => {
            database.all(sql, [], (err, rows) => {
                if (err) return reject(err);
                const resultado = (rows || []).map(row => {
                    if (row.condicoes_reembolso) {
                        row.condicoes_reembolso = JSON.parse(row.condicoes_reembolso);
                    }
                    return row;
                });
                resolve(resultado);
            });
        });
    }

    /**
     * Atualiza política de cancelamento
     */
    static async atualizar(id, dados) {
        const campos = [];
        const valores = [];

        if (dados.tipo !== undefined) {
            campos.push('tipo = ?');
            valores.push(dados.tipo);
        }

        if (dados.taxa_adicional_percentual !== undefined) {
            campos.push('taxa_adicional_percentual = ?');
            valores.push(dados.taxa_adicional_percentual);
        }

        if (dados.descricao !== undefined) {
            campos.push('descricao = ?');
            valores.push(dados.descricao);
        }

        if (dados.condicoes_reembolso !== undefined) {
            campos.push('condicoes_reembolso = ?');
            valores.push(dados.condicoes_reembolso ? JSON.stringify(dados.condicoes_reembolso) : null);
        }

        if (dados.ativo !== undefined) {
            campos.push('ativo = ?');
            valores.push(dados.ativo ? 1 : 0);
        }

        campos.push('atualizado_em = CURRENT_TIMESTAMP');
        valores.push(id);

        const sql = `UPDATE politicas_cancelamento SET ${campos.join(', ')} WHERE id = ?`;

        return new Promise((resolve, reject) => {
            database.run(sql, valores, function(err) {
                if (err) return reject(err);
                PoliticaCancelamento.buscarPorId(id).then(resolve).catch(reject);
            });
        });
    }

    /**
     * Calcula valor do cancelamento baseado na política
     * @param {Number} valorTotal - Valor total da reserva
     * @param {String} tipo - Tipo de política
     * @param {Number} diasAntesCheckIn - Dias antes do check-in
     */
    static calcularTaxaCancelamento(valorTotal, tipo, diasAntesCheckIn = 0) {
        let taxaPercentual = 0;
        let reembolsoPercentual = 0;

        switch (tipo) {
            case this.TIPOS.FLEXIVEL:
                // Reembolso total até 30 dias antes
                if (diasAntesCheckIn >= this.PERIODOS_CANCELAMENTO.REEMBOLSO_TOTAL) {
                    reembolsoPercentual = 100;
                }
                // Reembolso parcial 14-30 dias antes
                else if (diasAntesCheckIn >= this.PERIODOS_CANCELAMENTO.REEMBOLSO_PARCIAL_INICIO) {
                    reembolsoPercentual = 50;
                }
                // Sem reembolso menos de 14 dias
                else {
                    reembolsoPercentual = 0;
                }
                // Taxa adicional: +10-15%
                taxaPercentual = 10 + Math.floor(Math.random() * 5);
                break;

            case this.TIPOS.MODERADA:
                if (diasAntesCheckIn >= 14) reembolsoPercentual = 100;
                else if (diasAntesCheckIn >= 7) reembolsoPercentual = 50;
                else reembolsoPercentual = 0;
                taxaPercentual = 5;
                break;

            case this.TIPOS.RIGOROSA:
                if (diasAntesCheckIn >= 7) reembolsoPercentual = 100;
                else reembolsoPercentual = 0;
                taxaPercentual = 20;
                break;

            case this.TIPOS.NAO_REEMBOLSAVEL:
            default:
                if (diasAntesCheckIn >= 7) reembolsoPercentual = 100;
                else reembolsoPercentual = 0;
                taxaPercentual = 0;
                break;
        }

        const valorReembolso = (valorTotal * reembolsoPercentual) / 100;
        const taxaCancelamento = (valorTotal * taxaPercentual) / 100;
        const saldoRetorno = valorReembolso - taxaCancelamento;

        return {
            tipo,
            valor_total: valorTotal,
            dias_antes_checkin: diasAntesCheckIn,
            reembolso_percentual: reembolsoPercentual,
            valor_reembolso: Math.round(valorReembolso * 100) / 100,
            taxa_percentual: taxaPercentual,
            taxa_cancelamento: Math.round(taxaCancelamento * 100) / 100,
            saldo_retorno: Math.round(saldoRetorno * 100) / 100
        };
    }

    /**
     * Deleta política
     */
    static async deletar(id) {
        const sql = `DELETE FROM politicas_cancelamento WHERE id = ?`;

        return new Promise((resolve, reject) => {
            database.run(sql, [id], function(err) {
                if (err) return reject(err);
                resolve(this.changes > 0);
            });
        });
    }
}

module.exports = PoliticaCancelamento;
