const database = require('../config/database');

class AvaliacaoGoogle {
    static async criar(dados) {
        const sql = `
            INSERT INTO avaliacoes_google (nome_autor, foto_autor, rating, texto, data_avaliacao, 
                                         origem, google_review_id, ativo, ordem)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            dados.nome_autor,
            dados.foto_autor || null,
            dados.rating,
            dados.texto || null,
            dados.data_avaliacao || null,
            dados.origem || 'manual',
            dados.google_review_id || null,
            dados.ativo !== undefined ? dados.ativo : 1,
            dados.ordem || 0
        ];
        
        const result = await database.run(sql, params);
        return this.buscarPorId(result.id);
    }

    static async buscarTodos(filtros = {}) {
        let sql = 'SELECT * FROM avaliacoes_google WHERE 1=1';
        const params = [];

        if (filtros.ativo !== undefined) {
            sql += ' AND ativo = ?';
            params.push(filtros.ativo ? 1 : 0);
        }

        if (filtros.rating_min) {
            sql += ' AND rating >= ?';
            params.push(filtros.rating_min);
        }

        if (filtros.origem) {
            sql += ' AND origem = ?';
            params.push(filtros.origem);
        }

        sql += ' ORDER BY ordem DESC, data_avaliacao DESC, criado_em DESC';

        if (filtros.limit) {
            sql += ' LIMIT ?';
            params.push(filtros.limit);
        }

        return database.all(sql, params);
    }

    static async buscarParaHomepage(limite = 6) {
        const sql = `
            SELECT * FROM avaliacoes_google 
            WHERE ativo = 1 
            ORDER BY ordem DESC, rating DESC, data_avaliacao DESC 
            LIMIT ?
        `;
        return database.all(sql, [limite]);
    }

    static async buscarPorId(id) {
        const sql = 'SELECT * FROM avaliacoes_google WHERE id = ?';
        return database.get(sql, [id]);
    }

    static async buscarPorGoogleId(googleReviewId) {
        const sql = 'SELECT * FROM avaliacoes_google WHERE google_review_id = ?';
        return database.get(sql, [googleReviewId]);
    }

    static async calcularMediaRating() {
        const sql = `
            SELECT 
                AVG(rating) as media_rating,
                COUNT(*) as total_avaliacoes,
                COUNT(CASE WHEN rating = 5 THEN 1 END) as cinco_estrelas,
                COUNT(CASE WHEN rating = 4 THEN 1 END) as quatro_estrelas,
                COUNT(CASE WHEN rating = 3 THEN 1 END) as tres_estrelas,
                COUNT(CASE WHEN rating = 2 THEN 1 END) as duas_estrelas,
                COUNT(CASE WHEN rating = 1 THEN 1 END) as uma_estrela
            FROM avaliacoes_google 
            WHERE ativo = 1
        `;
        const resultado = await database.get(sql);
        
        // Converter media_rating para número (pode vir como string ou null do MySQL)
        const mediaRating = resultado && resultado.media_rating 
            ? parseFloat(resultado.media_rating) 
            : 0;
        
        return {
            media: parseFloat(mediaRating.toFixed(1)),
            total: resultado ? (resultado.total_avaliacoes || 0) : 0,
            distribuicao: {
                5: resultado ? (resultado.cinco_estrelas || 0) : 0,
                4: resultado ? (resultado.quatro_estrelas || 0) : 0,
                3: resultado ? (resultado.tres_estrelas || 0) : 0,
                2: resultado ? (resultado.duas_estrelas || 0) : 0,
                1: resultado ? (resultado.uma_estrela || 0) : 0
            }
        };
    }

    static async atualizar(id, dados) {
        const campos = [];
        const valores = [];

        if (dados.nome_autor !== undefined) {
            campos.push('nome_autor = ?');
            valores.push(dados.nome_autor);
        }
        if (dados.foto_autor !== undefined) {
            campos.push('foto_autor = ?');
            valores.push(dados.foto_autor);
        }
        if (dados.rating !== undefined) {
            campos.push('rating = ?');
            valores.push(dados.rating);
        }
        if (dados.texto !== undefined) {
            campos.push('texto = ?');
            valores.push(dados.texto);
        }
        if (dados.data_avaliacao !== undefined) {
            campos.push('data_avaliacao = ?');
            valores.push(dados.data_avaliacao);
        }
        if (dados.ativo !== undefined) {
            campos.push('ativo = ?');
            valores.push(dados.ativo ? 1 : 0);
        }
        if (dados.ordem !== undefined) {
            campos.push('ordem = ?');
            valores.push(dados.ordem);
        }

        campos.push('atualizado_em = CURRENT_TIMESTAMP');
        valores.push(id);

        const sql = `UPDATE avaliacoes_google SET ${campos.join(', ')} WHERE id = ?`;
        await database.run(sql, valores);
        return this.buscarPorId(id);
    }

    static async deletar(id) {
        const sql = 'DELETE FROM avaliacoes_google WHERE id = ?';
        return database.run(sql, [id]);
    }
}

module.exports = AvaliacaoGoogle;

