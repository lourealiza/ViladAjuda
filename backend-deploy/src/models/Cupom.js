const database = require('../config/database');

class Cupom {
    static async criar(dados) {
        const sql = `
            INSERT INTO cupons (codigo, tipo, valor, valor_minimo, data_inicio, data_fim, limite_uso, 
                               campanha, temporada_aplicavel, chale_id, ativo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            dados.codigo.toUpperCase(),
            dados.tipo || 'percentual',
            dados.valor,
            dados.valor_minimo || 0,
            dados.data_inicio || null,
            dados.data_fim || null,
            dados.limite_uso || null,
            dados.campanha || null,
            dados.temporada_aplicavel || null,
            dados.chale_id || null,
            dados.ativo !== undefined ? dados.ativo : 1
        ];
        
        const result = await database.run(sql, params);
        return this.buscarPorId(result.id);
    }

    static async buscarTodos(apenasAtivos = false) {
        let sql = 'SELECT * FROM cupons';
        if (apenasAtivos) {
            sql += ' WHERE ativo = 1';
        }
        sql += ' ORDER BY criado_em DESC';
        
        return database.all(sql);
    }

    static async buscarPorId(id) {
        const sql = 'SELECT * FROM cupons WHERE id = ?';
        return database.get(sql, [id]);
    }

    static async buscarPorCodigo(codigo) {
        const sql = 'SELECT * FROM cupons WHERE codigo = ?';
        return database.get(sql, [codigo.toUpperCase()]);
    }

    static async validarCupom(codigo, valorMinimo = 0, dadosAdicionais = {}) {
        const cupom = await this.buscarPorCodigo(codigo);
        
        if (!cupom || !cupom.ativo) {
            return { valido: false, erro: 'Cupom inválido ou inativo' };
        }

        const hoje = new Date().toISOString().split('T')[0];
        
        if (cupom.data_inicio && hoje < cupom.data_inicio) {
            return { valido: false, erro: 'Cupom ainda não está válido' };
        }

        if (cupom.data_fim && hoje > cupom.data_fim) {
            return { valido: false, erro: 'Cupom expirado' };
        }

        if (cupom.limite_uso && cupom.usado >= cupom.limite_uso) {
            return { valido: false, erro: 'Cupom esgotado' };
        }

        if (cupom.valor_minimo > valorMinimo) {
            return { valido: false, erro: `Valor mínimo de R$ ${cupom.valor_minimo.toFixed(2)} não atingido` };
        }

        // Validar temporada aplicável
        if (cupom.temporada_aplicavel && dadosAdicionais.temporada_tipo) {
            if (cupom.temporada_aplicavel !== dadosAdicionais.temporada_tipo) {
                return { valido: false, erro: `Cupom válido apenas para temporada ${cupom.temporada_aplicavel}` };
            }
        }

        // Validar chalé específico
        if (cupom.chale_id && dadosAdicionais.chale_id) {
            if (cupom.chale_id !== dadosAdicionais.chale_id) {
                return { valido: false, erro: 'Cupom não válido para este chalé' };
            }
        }

        return { valido: true, cupom };
    }

    static async aplicarCupom(codigo, valorSubtotal, dadosAdicionais = {}) {
        const validacao = await this.validarCupom(codigo, valorSubtotal, dadosAdicionais);
        
        if (!validacao.valido) {
            return validacao;
        }

        const cupom = validacao.cupom;
        let desconto = 0;

        if (cupom.tipo === 'percentual') {
            desconto = valorSubtotal * (cupom.valor / 100);
        } else {
            desconto = cupom.valor;
        }

        // Limitar desconto ao valor do subtotal
        if (desconto > valorSubtotal) {
            desconto = valorSubtotal;
        }

        return {
            valido: true,
            cupom,
            desconto: parseFloat(desconto.toFixed(2)),
            valorFinal: parseFloat((valorSubtotal - desconto).toFixed(2))
        };
    }

    static async incrementarUso(id) {
        const sql = 'UPDATE cupons SET usado = usado + 1 WHERE id = ?';
        await database.run(sql, [id]);
        return this.buscarPorId(id);
    }

    static async atualizar(id, dados) {
        const campos = [];
        const valores = [];

        if (dados.codigo !== undefined) {
            campos.push('codigo = ?');
            valores.push(dados.codigo.toUpperCase());
        }
        if (dados.tipo !== undefined) {
            campos.push('tipo = ?');
            valores.push(dados.tipo);
        }
        if (dados.valor !== undefined) {
            campos.push('valor = ?');
            valores.push(dados.valor);
        }
        if (dados.valor_minimo !== undefined) {
            campos.push('valor_minimo = ?');
            valores.push(dados.valor_minimo);
        }
        if (dados.data_inicio !== undefined) {
            campos.push('data_inicio = ?');
            valores.push(dados.data_inicio);
        }
        if (dados.data_fim !== undefined) {
            campos.push('data_fim = ?');
            valores.push(dados.data_fim);
        }
        if (dados.limite_uso !== undefined) {
            campos.push('limite_uso = ?');
            valores.push(dados.limite_uso);
        }
        if (dados.campanha !== undefined) {
            campos.push('campanha = ?');
            valores.push(dados.campanha);
        }
        if (dados.temporada_aplicavel !== undefined) {
            campos.push('temporada_aplicavel = ?');
            valores.push(dados.temporada_aplicavel);
        }
        if (dados.chale_id !== undefined) {
            campos.push('chale_id = ?');
            valores.push(dados.chale_id);
        }
        if (dados.ativo !== undefined) {
            campos.push('ativo = ?');
            valores.push(dados.ativo);
        }

        campos.push('atualizado_em = CURRENT_TIMESTAMP');
        valores.push(id);

        const sql = `UPDATE cupons SET ${campos.join(', ')} WHERE id = ?`;
        await database.run(sql, valores);
        return this.buscarPorId(id);
    }

    static async deletar(id) {
        const sql = 'DELETE FROM cupons WHERE id = ?';
        return database.run(sql, [id]);
    }
}

module.exports = Cupom;

