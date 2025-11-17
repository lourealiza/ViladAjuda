const database = require('../config/database');

class Hospede {
    static async criar(dados) {
        const sql = `
            INSERT INTO hospedes (nome, email, telefone, cpf, data_nascimento, 
                               endereco, cidade, estado, cep, origem_canal, como_nos_encontrou, notas_internas, observacoes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            dados.nome,
            dados.email || null,
            dados.telefone || null,
            dados.cpf || null,
            dados.data_nascimento || null,
            dados.endereco || null,
            dados.cidade || null,
            dados.estado || null,
            dados.cep || null,
            dados.origem_canal || null,
            dados.como_nos_encontrou || null,
            dados.notas_internas || null,
            dados.observacoes || null
        ];
        
        const result = await database.run(sql, params);
        return this.buscarPorId(result.id);
    }

    static async buscarTodos(filtros = {}) {
        let sql = 'SELECT * FROM hospedes WHERE 1=1';
        const params = [];

        if (filtros.nome) {
            sql += ' AND nome LIKE ?';
            params.push(`%${filtros.nome}%`);
        }

        if (filtros.email) {
            sql += ' AND email = ?';
            params.push(filtros.email);
        }

        if (filtros.telefone) {
            sql += ' AND telefone = ?';
            params.push(filtros.telefone);
        }

        if (filtros.origem_canal) {
            sql += ' AND origem_canal = ?';
            params.push(filtros.origem_canal);
        }

        if (filtros.cidade) {
            sql += ' AND cidade LIKE ?';
            params.push(`%${filtros.cidade}%`);
        }

        if (filtros.estado) {
            sql += ' AND estado = ?';
            params.push(filtros.estado);
        }

        sql += ' ORDER BY nome';

        return database.all(sql, params);
    }

    static async buscarPorId(id) {
        const sql = 'SELECT * FROM hospedes WHERE id = ?';
        return database.get(sql, [id]);
    }

    static async buscarPorEmail(email) {
        const sql = 'SELECT * FROM hospedes WHERE email = ? LIMIT 1';
        return database.get(sql, [email]);
    }

    static async buscarPorTelefone(telefone) {
        const sql = 'SELECT * FROM hospedes WHERE telefone = ? LIMIT 1';
        return database.get(sql, [telefone]);
    }

    static async buscarOuCriar(dados) {
        // Tenta encontrar por email ou telefone
        let hospede = null;
        
        if (dados.email) {
            hospede = await this.buscarPorEmail(dados.email);
        }
        
        if (!hospede && dados.telefone) {
            hospede = await this.buscarPorTelefone(dados.telefone);
        }

        if (hospede) {
            // Atualiza dados se necessário
            const dadosAtualizar = {};
            if (dados.nome && dados.nome !== hospede.nome) {
                dadosAtualizar.nome = dados.nome;
            }
            if (dados.telefone && dados.telefone !== hospede.telefone) {
                dadosAtualizar.telefone = dados.telefone;
            }
            if (dados.cidade && dados.cidade !== hospede.cidade) {
                dadosAtualizar.cidade = dados.cidade;
            }
            if (dados.estado && dados.estado !== hospede.estado) {
                dadosAtualizar.estado = dados.estado;
            }
            if (dados.origem_canal && dados.origem_canal !== hospede.origem_canal) {
                dadosAtualizar.origem_canal = dados.origem_canal;
            }
            if (dados.como_nos_encontrou && dados.como_nos_encontrou !== hospede.como_nos_encontrou) {
                dadosAtualizar.como_nos_encontrou = dados.como_nos_encontrou;
            }

            if (Object.keys(dadosAtualizar).length > 0) {
                return await this.atualizar(hospede.id, dadosAtualizar);
            }

            return hospede;
        }

        // Cria novo hóspede
        return await this.criar(dados);
    }

    /**
     * Busca histórico completo de reservas do hóspede
     */
    static async buscarHistoricoReservas(hospedeId) {
        const sql = `
            SELECT r.*, c.nome as chale_nome
            FROM reservas r
            LEFT JOIN chales c ON r.chale_id = c.id
            WHERE r.hospede_id = ?
            ORDER BY r.data_checkin DESC
        `;
        return database.all(sql, [hospedeId]);
    }

    /**
     * Calcula estatísticas do hóspede
     */
    static async calcularEstatisticas(hospedeId) {
        const historico = await this.buscarHistoricoReservas(hospedeId);
        
        // Filtrar apenas reservas confirmadas ou concluídas
        const reservasConfirmadas = historico.filter(r => 
            ['confirmada', 'checkin_realizado', 'checkout_realizado'].includes(r.status)
        );

        const numReservas = reservasConfirmadas.length;
        const chalésUnicos = [...new Set(reservasConfirmadas.map(r => r.chale_id).filter(Boolean))];
        const valorTotalGasto = reservasConfirmadas.reduce((sum, r) => 
            sum + parseFloat(r.valor_total || 0), 0
        );

        // Última reserva
        const ultimaReserva = reservasConfirmadas.length > 0 ? reservasConfirmadas[0] : null;

        return {
            num_reservas: numReservas,
            num_chales_diferentes: chalésUnicos.length,
            chalés_visitados: chalésUnicos,
            valor_total_gasto: parseFloat(valorTotalGasto.toFixed(2)),
            ultima_reserva: ultimaReserva ? {
                id: ultimaReserva.id,
                chale_nome: ultimaReserva.chale_nome,
                data_checkin: ultimaReserva.data_checkin,
                data_checkout: ultimaReserva.data_checkout,
                valor_total: ultimaReserva.valor_total
            } : null,
            primeira_reserva: reservasConfirmadas.length > 0 ? {
                id: reservasConfirmadas[reservasConfirmadas.length - 1].id,
                chale_nome: reservasConfirmadas[reservasConfirmadas.length - 1].chale_nome,
                data_checkin: reservasConfirmadas[reservasConfirmadas.length - 1].data_checkin
            } : null
        };
    }

    /**
     * Busca hóspedes que já ficaram antes (para campanhas de retorno)
     */
    static async buscarHospedesRetorno(filtros = {}) {
        let sql = `
            SELECT DISTINCT h.*, 
                   COUNT(r.id) as num_reservas,
                   SUM(r.valor_total) as valor_total_gasto,
                   MAX(r.data_checkout) as ultima_estadia
            FROM hospedes h
            INNER JOIN reservas r ON h.id = r.hospede_id
            WHERE r.status IN ('confirmada', 'checkin_realizado', 'checkout_realizado')
            GROUP BY h.id
        `;
        const params = [];
        const having = [];

        if (filtros.min_reservas) {
            having.push('COUNT(r.id) >= ?');
            params.push(filtros.min_reservas);
        }

        if (filtros.ultima_estadia_antes_de) {
            having.push('MAX(r.data_checkout) < ?');
            params.push(filtros.ultima_estadia_antes_de);
        }

        if (having.length > 0) {
            sql += ' HAVING ' + having.join(' AND ');
        }

        sql += ' ORDER BY ultima_estadia DESC';

        return database.all(sql, params);
    }

    /**
     * Busca hóspedes por cidade/estado (para campanhas regionais)
     */
    static async buscarPorLocalizacao(cidade = null, estado = null) {
        let sql = 'SELECT * FROM hospedes WHERE 1=1';
        const params = [];

        if (cidade) {
            sql += ' AND cidade LIKE ?';
            params.push(`%${cidade}%`);
        }

        if (estado) {
            sql += ' AND estado = ?';
            params.push(estado);
        }

        sql += ' ORDER BY nome';

        return database.all(sql, params);
    }

    /**
     * Busca hóspedes por origem/canal (para campanhas segmentadas)
     */
    static async buscarPorOrigem(origemCanal) {
        const sql = `
            SELECT DISTINCT h.*
            FROM hospedes h
            WHERE h.origem_canal = ? OR h.como_nos_encontrou LIKE ?
            ORDER BY h.nome
        `;
        return database.all(sql, [origemCanal, `%${origemCanal}%`]);
    }

    static async atualizar(id, dados) {
        const campos = [];
        const valores = [];

        if (dados.nome !== undefined) {
            campos.push('nome = ?');
            valores.push(dados.nome);
        }
        if (dados.email !== undefined) {
            campos.push('email = ?');
            valores.push(dados.email);
        }
        if (dados.telefone !== undefined) {
            campos.push('telefone = ?');
            valores.push(dados.telefone);
        }
        if (dados.cpf !== undefined) {
            campos.push('cpf = ?');
            valores.push(dados.cpf);
        }
        if (dados.data_nascimento !== undefined) {
            campos.push('data_nascimento = ?');
            valores.push(dados.data_nascimento);
        }
        if (dados.endereco !== undefined) {
            campos.push('endereco = ?');
            valores.push(dados.endereco);
        }
        if (dados.cidade !== undefined) {
            campos.push('cidade = ?');
            valores.push(dados.cidade);
        }
        if (dados.estado !== undefined) {
            campos.push('estado = ?');
            valores.push(dados.estado);
        }
        if (dados.cep !== undefined) {
            campos.push('cep = ?');
            valores.push(dados.cep);
        }
        if (dados.origem_canal !== undefined) {
            campos.push('origem_canal = ?');
            valores.push(dados.origem_canal);
        }
        if (dados.como_nos_encontrou !== undefined) {
            campos.push('como_nos_encontrou = ?');
            valores.push(dados.como_nos_encontrou);
        }
        if (dados.notas_internas !== undefined) {
            campos.push('notas_internas = ?');
            valores.push(dados.notas_internas);
        }
        if (dados.observacoes !== undefined) {
            campos.push('observacoes = ?');
            valores.push(dados.observacoes);
        }

        campos.push('atualizado_em = CURRENT_TIMESTAMP');
        valores.push(id);

        const sql = `UPDATE hospedes SET ${campos.join(', ')} WHERE id = ?`;
        await database.run(sql, valores);
        return this.buscarPorId(id);
    }

    static async deletar(id) {
        const sql = 'DELETE FROM hospedes WHERE id = ?';
        return database.run(sql, [id]);
    }
}

module.exports = Hospede;
