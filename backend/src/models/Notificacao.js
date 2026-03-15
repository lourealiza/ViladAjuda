const database = require('../config/database');

class Notificacao {
    /**
     * Tipos de notificações suportadas
     */
    static TIPOS = {
        NOVA_RESERVA: 'nova_reserva',
        RESERVA_ALTERADA: 'reserva_alterada',
        CANCELAMENTO_RESERVA: 'cancelamento_reserva',
        CONFIRMACAO_PAGAMENTO: 'confirmacao_pagamento',
        PAGAMENTO_PENDENTE: 'pagamento_pendente',
        CHECKIN_PROXIMO: 'checkin_proximo',
        DISPONIBILIDADE_LIBERADA: 'disponibilidade_liberada',
        BLOQUEIO_CRIADO: 'bloqueio_criado',
        AVALIACAO_RECEBIDA: 'avaliacao_recebida',
        ALERTA_SISTEMA: 'alerta_sistema',
        CONFIRMACAO_HOSPEDE: 'confirmacao_hospede',
        LEMBRETE_CHECKOUT: 'lembrete_checkout'
    };

    /**
     * Status de notificação
     */
    static STATUS = {
        PENDENTE: 'pendente',
        ENVIADA: 'enviada',
        LIDA: 'lida',
        ERRO: 'erro',
        CANCELADA: 'cancelada'
    };

    /**
     * Canais de entrega
     */
    static CANAIS = {
        EMAIL: 'email',
        IN_APP: 'in_app',
        PUSH: 'push',
        WEBHOOK: 'webhook',
        SMS: 'sms'
    };

    /**
     * Cria uma nova notificação
     */
    static async criar(dados) {
        const sql = `
            INSERT INTO notificacoes (
                tipo, descricao, usuario_id, chale_id, reserva_id,
                pagamento_id, titulo, conteudo, canais_entrega,
                status, dados_extra, data_criacao, data_envio,
                tentativas_envio, proximo_envio, lido_em
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            dados.tipo,
            dados.descricao || null,
            dados.usuario_id || null,
            dados.chale_id || null,
            dados.reserva_id || null,
            dados.pagamento_id || null,
            dados.titulo,
            dados.conteudo,
            dados.canais_entrega || 'email,in_app',
            dados.status || this.STATUS.PENDENTE,
            dados.dados_extra ? JSON.stringify(dados.dados_extra) : null,
            new Date(),
            null,
            0,
            new Date(),
            null
        ];

        return new Promise((resolve, reject) => {
            database.run(sql, params, function(err) {
                if (err) return reject(err);
                resolve({ id: this.lastID });
            });
        });
    }

    /**
     * Busca notificação por ID
     */
    static async buscarPorId(id) {
        const sql = `
            SELECT * FROM notificacoes WHERE id = ?
        `;

        return new Promise((resolve, reject) => {
            database.get(sql, [id], (err, row) => {
                if (err) return reject(err);
                if (row && row.dados_extra) {
                    row.dados_extra = JSON.parse(row.dados_extra);
                }
                resolve(row);
            });
        });
    }

    /**
     * Busca notificações para um usuário
     */
    static async buscarPorUsuario(usuarioId, filtros = {}) {
        let sql = `
            SELECT * FROM notificacoes 
            WHERE usuario_id = ?
        `;
        const params = [usuarioId];

        if (filtros.status) {
            sql += ` AND status = ?`;
            params.push(filtros.status);
        }

        if (filtros.tipo) {
            sql += ` AND tipo = ?`;
            params.push(filtros.tipo);
        }

        if (filtros.nao_lidas) {
            sql += ` AND lido_em IS NULL`;
        }

        sql += ` ORDER BY data_criacao DESC`;

        if (filtros.limite) {
            sql += ` LIMIT ?`;
            params.push(filtros.limite);
        }

        return new Promise((resolve, reject) => {
            database.all(sql, params, (err, rows) => {
                if (err) return reject(err);
                if (rows) {
                    rows = rows.map(row => {
                        if (row.dados_extra) {
                            row.dados_extra = JSON.parse(row.dados_extra);
                        }
                        return row;
                    });
                }
                resolve(rows || []);
            });
        });
    }

    /**
     * Busca notificações pendentes para envio
     */
    static async buscarPendentes(limite = 50) {
        const sql = `
            SELECT * FROM notificacoes 
            WHERE status = ? AND proximo_envio <= ?
            ORDER BY data_criacao ASC
            LIMIT ?
        `;

        const params = [this.STATUS.PENDENTE, new Date(), limite];

        return new Promise((resolve, reject) => {
            database.all(sql, params, (err, rows) => {
                if (err) return reject(err);
                if (rows) {
                    rows = rows.map(row => {
                        if (row.dados_extra) {
                            row.dados_extra = JSON.parse(row.dados_extra);
                        }
                        return row;
                    });
                }
                resolve(rows || []);
            });
        });
    }

    /**
     * Atualiza status de uma notificação
     */
    static async atualizarStatus(id, novoStatus) {
        const sql = `
            UPDATE notificacoes 
            SET status = ?, data_envio = ?
            WHERE id = ?
        `;

        return new Promise((resolve, reject) => {
            database.run(
                sql,
                [novoStatus, novoStatus === this.STATUS.ENVIADA ? new Date() : null, id],
                function(err) {
                    if (err) return reject(err);
                    resolve(this.changes > 0);
                }
            );
        });
    }

    /**
     * Marca notificação como lida
     */
    static async marcarComoLida(id) {
        const sql = `
            UPDATE notificacoes 
            SET lido_em = ?, status = ?
            WHERE id = ?
        `;

        return new Promise((resolve, reject) => {
            database.run(
                sql,
                [new Date(), this.STATUS.LIDA, id],
                function(err) {
                    if (err) return reject(err);
                    resolve(this.changes > 0);
                }
            );
        });
    }

    /**
     * Marca múltiplas notificações como lidas
     */
    static async marcarMultiplasComoLidas(ids) {
        if (!ids || ids.length === 0) return false;

        const placeholders = ids.map(() => '?').join(',');
        const sql = `
            UPDATE notificacoes 
            SET lido_em = ?, status = ?
            WHERE id IN (${placeholders})
        `;

        return new Promise((resolve, reject) => {
            database.run(
                sql,
                [new Date(), this.STATUS.LIDA, ...ids],
                function(err) {
                    if (err) return reject(err);
                    resolve(this.changes > 0);
                }
            );
        });
    }

    /**
     * Incrementa contador de tentativas de envio
     */
    static async incrementarTentativas(id) {
        const sql = `
            UPDATE notificacoes 
            SET tentativas_envio = tentativas_envio + 1,
                proximo_envio = ?
            WHERE id = ?
        `;

        // Próximo envio: agora + (2^tentativas * 5 minutos)
        const proximoEnvio = new Date(Date.now() + 5 * 60 * 1000);

        return new Promise((resolve, reject) => {
            database.run(
                sql,
                [proximoEnvio, id],
                function(err) {
                    if (err) return reject(err);
                    resolve(this.changes > 0);
                }
            );
        });
    }

    /**
     * Deleta notificação
     */
    static async deletar(id) {
        const sql = `DELETE FROM notificacoes WHERE id = ?`;

        return new Promise((resolve, reject) => {
            database.run(sql, [id], function(err) {
                if (err) return reject(err);
                resolve(this.changes > 0);
            });
        });
    }

    /**
     * Conta notificações não lidas do usuário
     */
    static async contarNaoLidas(usuarioId) {
        const sql = `
            SELECT COUNT(*) as total FROM notificacoes 
            WHERE usuario_id = ? AND lido_em IS NULL
        `;

        return new Promise((resolve, reject) => {
            database.get(sql, [usuarioId], (err, row) => {
                if (err) return reject(err);
                resolve(row?.total || 0);
            });
        });
    }

    /**
     * Busca notificações de um recurso (reserva, chale, etc)
     */
    static async buscarPorRecurso(tipoRecurso, recursoId) {
        const campoRecurso = `${tipoRecurso}_id`;
        const sql = `
            SELECT * FROM notificacoes 
            WHERE ${campoRecurso} = ?
            ORDER BY data_criacao DESC
        `;

        return new Promise((resolve, reject) => {
            database.all(sql, [recursoId], (err, rows) => {
                if (err) return reject(err);
                if (rows) {
                    rows = rows.map(row => {
                        if (row.dados_extra) {
                            row.dados_extra = JSON.parse(row.dados_extra);
                        }
                        return row;
                    });
                }
                resolve(rows || []);
            });
        });
    }
}

module.exports = Notificacao;
