const mysql = require('mysql2/promise');

(async () => {
    try {
        const conn = await mysql.createConnection({
            host: 'mysql.viladajuda.com.br',
            user: 'viladajuda',
            password: '2026dAjudaVila',
            database: 'viladajuda'
        });
        
        console.log('✅ Conectado ao MySQL\n');
        
        const [rows] = await conn.execute('SELECT id, email, role FROM usuarios');
        console.log('📋 Usuários no banco:\n');
        console.log(rows);
        
        await conn.end();
        process.exit(0);
    } catch (err) {
        console.log('❌ Erro:', err.message);
        process.exit(1);
    }
})();
