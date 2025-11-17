const database = require('../config/database');
const bcrypt = require('bcryptjs');

class Usuario {
    static async criar(dados) {
        const senhaHash = await bcrypt.hash(dados.senha, 10);
        
        const sql = `
            INSERT INTO usuarios (nome, email, senha, role)
            VALUES (?, ?, ?, ?)
        `;
        const params = [
            dados.nome,
            dados.email,
            senhaHash,
            dados.role || 'admin'
        ];
        
        const result = await database.run(sql, params);
        return this.buscarPorId(result.id);
    }

    static async buscarTodos() {
        const sql = 'SELECT id, nome, email, role, criado_em, atualizado_em FROM usuarios ORDER BY nome';
        return database.all(sql);
    }

    static async buscarPorId(id) {
        const sql = 'SELECT id, nome, email, role, criado_em, atualizado_em FROM usuarios WHERE id = ?';
        return database.get(sql, [id]);
    }

    static async buscarPorEmail(email) {
        const sql = 'SELECT * FROM usuarios WHERE email = ?';
        return database.get(sql, [email]);
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
        if (dados.senha !== undefined) {
            const senhaHash = await bcrypt.hash(dados.senha, 10);
            campos.push('senha = ?');
            valores.push(senhaHash);
        }
        if (dados.role !== undefined) {
            campos.push('role = ?');
            valores.push(dados.role);
        }

        campos.push('atualizado_em = CURRENT_TIMESTAMP');
        valores.push(id);

        const sql = `UPDATE usuarios SET ${campos.join(', ')} WHERE id = ?`;
        await database.run(sql, valores);
        return this.buscarPorId(id);
    }

    static async deletar(id) {
        const sql = 'DELETE FROM usuarios WHERE id = ?';
        return database.run(sql, [id]);
    }

    static async validarSenha(senha, senhaHash) {
        return bcrypt.compare(senha, senhaHash);
    }
}

module.exports = Usuario;

