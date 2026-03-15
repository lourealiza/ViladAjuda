const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

(async () => {
    try {
        const conn = await mysql.createConnection({
            host: 'mysql.viladajuda.com.br',
            user: 'viladajuda',
            password: '2026dAjudaVila',
            database: 'viladajuda'
        });
        
        // Buscar usuário admin
        const [rows] = await conn.execute(
            'SELECT id, email, senha FROM usuarios WHERE email = ?',
            ['admin@viladajuda.com']
        );
        
        if (!rows.length) {
            console.log('❌ Usuário não encontrado');
            process.exit(1);
        }
        
        const usuario = rows[0];
        console.log('✅ Usuário encontrado');
        console.log(`   Email: ${usuario.email}`);
        console.log(`   Hash armazenado: ${usuario.senha.substring(0, 15)}...`);
        
        // Testar validação de senha
        const senhaCorreta = 'admin123';
        const match = await bcrypt.compare(senhaCorreta, usuario.senha);
        
        console.log(`\n🔐 Testando senha "${senhaCorreta}"`);
        console.log(`   Resultado: ${match ? '✅ VÁLIDA' : '❌ INVÁLIDA'}`);
        
        await conn.end();
        process.exit(0);
    } catch (err) {
        console.log('❌ Erro:', err.message);
        process.exit(1);
    }
})();
