const database = require('../config/database');

class Conteudo {
    static async criar(dados) {
        const sql = `
            INSERT INTO conteudos (tipo, titulo, slug, conteudo, resumo, imagem, galeria, ordem, ativo, 
                                 meta_title, meta_description, beneficios, call_to_action, filtros_preenchidos,
                                 data_inicio, data_fim, secao, chale_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            dados.tipo,
            dados.titulo,
            dados.slug || this.gerarSlug(dados.titulo),
            dados.conteudo || null,
            dados.resumo || null,
            dados.imagem || null,
            dados.galeria ? JSON.stringify(dados.galeria) : null,
            dados.ordem || 0,
            dados.ativo !== undefined ? dados.ativo : 1,
            dados.meta_title || null,
            dados.meta_description || null,
            dados.beneficios ? JSON.stringify(dados.beneficios) : null,
            dados.call_to_action ? JSON.stringify(dados.call_to_action) : null,
            dados.filtros_preenchidos ? JSON.stringify(dados.filtros_preenchidos) : null,
            dados.data_inicio || null,
            dados.data_fim || null,
            dados.secao || null,
            dados.chale_id || null
        ];
        
        const result = await database.run(sql, params);
        return this.buscarPorId(result.id);
    }

    static gerarSlug(titulo) {
        return titulo
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }

    static async buscarTodos(filtros = {}) {
        let sql = 'SELECT * FROM conteudos WHERE 1=1';
        const params = [];

        if (filtros.tipo) {
            sql += ' AND tipo = ?';
            params.push(filtros.tipo);
        }

        if (filtros.secao) {
            sql += ' AND secao = ?';
            params.push(filtros.secao);
        }

        if (filtros.chale_id) {
            sql += ' AND chale_id = ?';
            params.push(filtros.chale_id);
        }

        if (filtros.ativo !== undefined) {
            sql += ' AND ativo = ?';
            params.push(filtros.ativo ? 1 : 0);
        }

        sql += ' ORDER BY ordem, titulo';

        const conteudos = await database.all(sql, params);
        return conteudos.map(this.formatarConteudo);
    }

    static async buscarPorId(id) {
        const sql = 'SELECT * FROM conteudos WHERE id = ?';
        const conteudo = await database.get(sql, [id]);
        return conteudo ? this.formatarConteudo(conteudo) : null;
    }

    static async buscarPorSlug(slug) {
        const sql = 'SELECT * FROM conteudos WHERE slug = ? AND ativo = 1';
        const conteudo = await database.get(sql, [slug]);
        return conteudo ? this.formatarConteudo(conteudo) : null;
    }

    static async buscarPorTipo(tipo, apenasAtivos = true) {
        let sql = 'SELECT * FROM conteudos WHERE tipo = ?';
        const params = [tipo];

        if (apenasAtivos) {
            sql += ' AND ativo = 1';
        }

        sql += ' ORDER BY ordem, titulo';

        const conteudos = await database.all(sql, params);
        return conteudos.map(this.formatarConteudo);
    }

    /**
     * Buscar landing pages ativas
     */
    static async buscarLandingPages(apenasAtivas = true) {
        let sql = 'SELECT * FROM conteudos WHERE tipo = "landing_page"';
        const params = [];

        if (apenasAtivas) {
            sql += ' AND ativo = 1';
        }

        sql += ' ORDER BY ordem, titulo';

        const conteudos = await database.all(sql, params);
        return conteudos.map(this.formatarConteudo);
    }

    /**
     * Buscar conteúdo por seção (Sobre, Chalés, FAQ, etc.)
     */
    static async buscarPorSecao(secao, apenasAtivos = true) {
        let sql = 'SELECT * FROM conteudos WHERE secao = ?';
        const params = [secao];

        if (apenasAtivos) {
            sql += ' AND ativo = 1';
        }

        sql += ' ORDER BY ordem, titulo';

        const conteudos = await database.all(sql, params);
        return conteudos.map(this.formatarConteudo);
    }

    /**
     * Buscar galeria geral ou por chalé
     */
    static async buscarGaleria(chaleId = null, apenasAtivos = true) {
        let sql = 'SELECT * FROM conteudos WHERE tipo = "galeria"';
        const params = [];

        if (chaleId) {
            sql += ' AND chale_id = ?';
            params.push(chaleId);
        } else {
            sql += ' AND chale_id IS NULL';
        }

        if (apenasAtivos) {
            sql += ' AND ativo = 1';
        }

        sql += ' ORDER BY ordem, titulo';

        const conteudos = await database.all(sql, params);
        return conteudos.map(this.formatarConteudo);
    }

    static formatarConteudo(conteudo) {
        return {
            ...conteudo,
            ativo: Boolean(conteudo.ativo),
            galeria: conteudo.galeria ? JSON.parse(conteudo.galeria) : [],
            beneficios: conteudo.beneficios ? JSON.parse(conteudo.beneficios) : [],
            call_to_action: conteudo.call_to_action ? JSON.parse(conteudo.call_to_action) : null,
            filtros_preenchidos: conteudo.filtros_preenchidos ? JSON.parse(conteudo.filtros_preenchidos) : null
        };
    }

    static async atualizar(id, dados) {
        const campos = [];
        const valores = [];

        if (dados.tipo !== undefined) {
            campos.push('tipo = ?');
            valores.push(dados.tipo);
        }
        if (dados.titulo !== undefined) {
            campos.push('titulo = ?');
            valores.push(dados.titulo);
        }
        if (dados.slug !== undefined) {
            campos.push('slug = ?');
            valores.push(dados.slug);
        }
        if (dados.conteudo !== undefined) {
            campos.push('conteudo = ?');
            valores.push(dados.conteudo);
        }
        if (dados.resumo !== undefined) {
            campos.push('resumo = ?');
            valores.push(dados.resumo);
        }
        if (dados.imagem !== undefined) {
            campos.push('imagem = ?');
            valores.push(dados.imagem);
        }
        if (dados.galeria !== undefined) {
            campos.push('galeria = ?');
            valores.push(JSON.stringify(dados.galeria));
        }
        if (dados.ordem !== undefined) {
            campos.push('ordem = ?');
            valores.push(dados.ordem);
        }
        if (dados.ativo !== undefined) {
            campos.push('ativo = ?');
            valores.push(dados.ativo);
        }
        if (dados.meta_title !== undefined) {
            campos.push('meta_title = ?');
            valores.push(dados.meta_title);
        }
        if (dados.meta_description !== undefined) {
            campos.push('meta_description = ?');
            valores.push(dados.meta_description);
        }
        if (dados.beneficios !== undefined) {
            campos.push('beneficios = ?');
            valores.push(JSON.stringify(dados.beneficios));
        }
        if (dados.call_to_action !== undefined) {
            campos.push('call_to_action = ?');
            valores.push(JSON.stringify(dados.call_to_action));
        }
        if (dados.filtros_preenchidos !== undefined) {
            campos.push('filtros_preenchidos = ?');
            valores.push(JSON.stringify(dados.filtros_preenchidos));
        }
        if (dados.data_inicio !== undefined) {
            campos.push('data_inicio = ?');
            valores.push(dados.data_inicio);
        }
        if (dados.data_fim !== undefined) {
            campos.push('data_fim = ?');
            valores.push(dados.data_fim);
        }
        if (dados.secao !== undefined) {
            campos.push('secao = ?');
            valores.push(dados.secao);
        }
        if (dados.chale_id !== undefined) {
            campos.push('chale_id = ?');
            valores.push(dados.chale_id);
        }

        campos.push('atualizado_em = CURRENT_TIMESTAMP');
        valores.push(id);

        const sql = `UPDATE conteudos SET ${campos.join(', ')} WHERE id = ?`;
        await database.run(sql, valores);
        return this.buscarPorId(id);
    }

    static async deletar(id) {
        const sql = 'DELETE FROM conteudos WHERE id = ?';
        return database.run(sql, [id]);
    }
}

module.exports = Conteudo;
