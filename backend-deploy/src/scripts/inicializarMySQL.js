require('dotenv').config();
const mysql = require('mysql2/promise');

async function inicializarMySQL() {
    console.log('🚀 Inicializando banco de dados MySQL...\n');
    
    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'viladajuda',
        port: process.env.DB_PORT || 3306
    };

    let connection;
    
    try {
        // Conectar ao banco
        connection = await mysql.createConnection(config);
        console.log('✅ Conectado ao MySQL\n');

        // Criar tabelas
        console.log('📋 Criando tabelas...\n');

        // Tabela de Usuários
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                senha VARCHAR(255) NOT NULL,
                role VARCHAR(20) DEFAULT 'admin',
                criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
                atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✓ Tabela usuarios criada');

        // Tabela de Chalés
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS chales (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(50) NOT NULL,
                descricao TEXT,
                capacidade_adultos INT DEFAULT 2,
                capacidade_criancas INT DEFAULT 2,
                preco_diaria DECIMAL(10, 2),
                ativo BOOLEAN DEFAULT TRUE,
                amenidades TEXT,
                imagens TEXT,
                criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
                atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✓ Tabela chales criada');

        // Tabela de Reservas
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS reservas (
                id INT AUTO_INCREMENT PRIMARY KEY,
                chale_id INT,
                nome_hospede VARCHAR(100) NOT NULL,
                email_hospede VARCHAR(100) NOT NULL,
                telefone_hospede VARCHAR(20) NOT NULL,
                data_checkin DATE NOT NULL,
                data_checkout DATE NOT NULL,
                num_adultos INT DEFAULT 2,
                num_criancas INT DEFAULT 0,
                valor_total DECIMAL(10, 2),
                status VARCHAR(20) DEFAULT 'pendente',
                mensagem TEXT,
                criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
                atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (chale_id) REFERENCES chales(id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✓ Tabela reservas criada\n');

        // Verificar se já existe usuário admin
        const [usuarios] = await connection.execute('SELECT COUNT(*) as total FROM usuarios');
        
        if (usuarios[0].total === 0) {
            console.log('👤 Criando usuário administrador padrão...');
            const bcrypt = require('bcryptjs');
            const senhaHash = await bcrypt.hash('admin123', 10);
            
            await connection.execute(
                `INSERT INTO usuarios (nome, email, senha, role) VALUES (?, ?, ?, ?)`,
                ['Administrador', 'admin@viladajuda.com', senhaHash, 'admin']
            );
            console.log('✓ Usuário admin criado (email: admin@viladajuda.com, senha: admin123)');
        } else {
            console.log('✓ Usuário admin já existe');
        }

        // Verificar se já existem chalés
        const [chales] = await connection.execute('SELECT COUNT(*) as total FROM chales');
        
        if (chales[0].total === 0) {
            console.log('\n🏠 Criando chalés de exemplo...');
            
            const chalésExemplo = [
                {
                    nome: 'Alvorada Tropical',
                    descricao: 'Chalé completo com varanda espaçosa, rede e vista para o jardim. Perfeito para casais.',
                    capacidade_adultos: 2,
                    capacidade_criancas: 2,
                    preco_diaria: 250.00,
                    ativo: true,
                    amenidades: JSON.stringify(['Wi-Fi', 'Ar-condicionado', 'Cozinha equipada', 'Varanda com rede']),
                    imagens: JSON.stringify(['chale1.jpg'])
                },
                {
                    nome: 'Vila do Canto',
                    descricao: 'Chalé completo com varanda espaçosa, rede e vista para o jardim. Perfeito para casais.',
                    capacidade_adultos: 2,
                    capacidade_criancas: 2,
                    preco_diaria: 250.00,
                    ativo: true,
                    amenidades: JSON.stringify(['Wi-Fi', 'Ar-condicionado', 'Cozinha equipada', 'Varanda com rede']),
                    imagens: JSON.stringify(['chale2.jpg'])
                }
                // Chalés 3 e 4 desativados - não criar mais
            ];

            for (const chale of chalésExemplo) {
                await connection.execute(
                    `INSERT INTO chales (nome, descricao, capacidade_adultos, capacidade_criancas, 
                      preco_diaria, ativo, amenidades, imagens) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [chale.nome, chale.descricao, chale.capacidade_adultos, chale.capacidade_criancas,
                     chale.preco_diaria, chale.ativo, chale.amenidades, chale.imagens]
                );
            }
            console.log(`✓ ${chalésExemplo.length} chalés criados`);
        } else {
            console.log(`✓ Já existem ${chales[0].total} chalés cadastrados`);
        }

        console.log('\n✅ Banco de dados MySQL inicializado com sucesso!');
        
    } catch (error) {
        console.error('\n❌ Erro ao inicializar:', error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

inicializarMySQL().catch((error) => {
    console.error('Falha na inicialização:', error);
    process.exit(1);
});

