require('dotenv').config();
const mysql = require('mysql2/promise');

async function cadastrarChales() {
    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'viladajuda',
        port: process.env.DB_PORT || 3306
    };
    
    let connection;
    
    try {
        console.log('🚀 Conectando ao banco de dados...\n');
        connection = await mysql.createConnection(config);
        console.log('✅ Conectado ao MySQL\n');
        
        // Verificar se os chalés já existem
        const [chalesExistentes] = await connection.execute(
            "SELECT nome FROM chales WHERE nome IN ('Alvorada Tropical', 'Vila do Canto')"
        );
        
        const nomesExistentes = chalesExistentes.map(c => c.nome);
        
        if (nomesExistentes.includes('Alvorada Tropical') && nomesExistentes.includes('Vila do Canto')) {
            console.log('✅ Os chalés "Alvorada Tropical" e "Vila do Canto" já estão cadastrados!\n');
            
            // Mostrar chalés cadastrados
            const [chales] = await connection.execute(
                "SELECT id, nome, preco_diaria, ativo FROM chales WHERE nome IN ('Alvorada Tropical', 'Vila do Canto') ORDER BY id"
            );
            
            console.log('📋 Chalés cadastrados:');
            chales.forEach(chale => {
                const preco = parseFloat(chale.preco_diaria) || 0;
                console.log(`   - ID: ${chale.id} | ${chale.nome} | R$ ${preco.toFixed(2)}/noite | ${chale.ativo ? '✅ Ativo' : '❌ Inativo'}`);
            });
            return;
        }
        
        // Dados dos chalés
        const chalesParaCadastrar = [
            {
                nome: 'Alvorada Tropical',
                descricao: 'Chalé completo com varanda espaçosa, rede e vista para o jardim. Perfeito para casais.',
                capacidade_adultos: 2,
                capacidade_criancas: 2,
                preco_diaria: 350.00,
                ativo: 1,
                amenidades: JSON.stringify([
                    'Quarto com ar-condicionado',
                    'Sala de estar',
                    'Cozinha equipada',
                    'Varanda com rede',
                    'Wi-Fi gratuito'
                ]),
                imagens: JSON.stringify(['images/Chales 1(3).png'])
            },
            {
                nome: 'Vila do Canto',
                descricao: 'Chalé completo com varanda espaçosa, rede e vista para o jardim. Perfeito para casais.',
                capacidade_adultos: 2,
                capacidade_criancas: 2,
                preco_diaria: 350.00,
                ativo: 1,
                amenidades: JSON.stringify([
                    'Quarto com ar-condicionado',
                    'Sala de estar',
                    'Cozinha equipada',
                    'Varanda com rede',
                    'Wi-Fi gratuito'
                ]),
                imagens: JSON.stringify(['images/33175620-1024x1024.jpg'])
            }
        ];
        
        console.log('🏠 Cadastrando chalés...\n');
        
        for (const chale of chalesParaCadastrar) {
            // Verificar se já existe antes de inserir
            if (!nomesExistentes.includes(chale.nome)) {
                await connection.execute(
                    `INSERT INTO chales (
                        nome, descricao, capacidade_adultos, capacidade_criancas,
                        preco_diaria, ativo, amenidades, imagens
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        chale.nome,
                        chale.descricao,
                        chale.capacidade_adultos,
                        chale.capacidade_criancas,
                        chale.preco_diaria,
                        chale.ativo,
                        chale.amenidades,
                        chale.imagens
                    ]
                );
                
                const [result] = await connection.execute(
                    'SELECT id FROM chales WHERE nome = ?',
                    [chale.nome]
                );
                
                console.log(`✅ Chalé cadastrado: ${chale.nome} (ID: ${result[0].id})`);
            } else {
                console.log(`⏭️  Chalé já existe: ${chale.nome}`);
            }
        }
        
        // Verificar resultado final
        console.log('\n📋 Verificando chalés cadastrados:');
        const [chalesFinais] = await connection.execute(
            "SELECT id, nome, preco_diaria, ativo FROM chales WHERE nome IN ('Alvorada Tropical', 'Vila do Canto') ORDER BY id"
        );
        
        chalesFinais.forEach(chale => {
            const preco = parseFloat(chale.preco_diaria) || 0;
            console.log(`   - ID: ${chale.id} | ${chale.nome} | R$ ${preco.toFixed(2)}/noite | ${chale.ativo ? '✅ Ativo' : '❌ Inativo'}`);
        });
        
        console.log('\n✅ Cadastro concluído com sucesso!');
        
    } catch (erro) {
        console.error('❌ Erro ao cadastrar chalés:', erro.message);
        console.error(erro);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
        process.exit(0);
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    cadastrarChales();
}

module.exports = cadastrarChales;
