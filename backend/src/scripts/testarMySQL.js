require('dotenv').config();
const mysql = require('mysql2/promise');

async function testarConexao() {
    console.log('🔍 Testando conexão com MySQL...\n');
    
    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'viladajuda',
        port: process.env.DB_PORT || 3306
    };

    console.log('Configurações:');
    console.log(`  Host: ${config.host}`);
    console.log(`  Port: ${config.port}`);
    console.log(`  Database: ${config.database}`);
    console.log(`  User: ${config.user}`);
    console.log('');

    try {
        // Testar conexão
        const connection = await mysql.createConnection(config);
        console.log('✅ Conexão estabelecida com sucesso!\n');

        // Verificar se as tabelas existem
        const [tables] = await connection.execute(`
            SELECT TABLE_NAME 
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = ?
        `, [config.database]);

        console.log(`📊 Tabelas encontradas: ${tables.length}`);
        if (tables.length > 0) {
            tables.forEach(table => {
                console.log(`   - ${table.TABLE_NAME}`);
            });
        } else {
            console.log('   ⚠ Nenhuma tabela encontrada. Execute a inicialização do banco.');
        }

        await connection.end();
        console.log('\n✅ Teste concluído com sucesso!');
        return true;
    } catch (error) {
        console.error('\n❌ Erro ao conectar:', error.message);
        console.error('\nVerifique:');
        console.error('  1. As credenciais estão corretas?');
        console.error('  2. O banco de dados existe?');
        console.error('  3. O servidor MySQL está acessível?');
        console.error('  4. O firewall permite conexões?');
        return false;
    }
}

testarConexao().then(sucesso => {
    process.exit(sucesso ? 0 : 1);
});

