const database = require('./database');
const Usuario = require('../models/Usuario');

const inicializarBanco = async () => {
    try {
        console.log('Inicializando banco de dados...');
        
        // Conectar ao banco
        await database.connect();
        
        // Verificar se já existe um usuário admin
        const adminExistente = await Usuario.buscarPorEmail('admin@viladajuda.com');
        
        if (!adminExistente) {
            console.log('Criando usuário administrador padrão...');
            await Usuario.criar({
                nome: 'Administrador',
                email: 'admin@viladajuda.com',
                senha: 'admin123',
                role: 'admin'
            });
            console.log('✓ Usuário admin criado com sucesso!');
            console.log('  Email: admin@viladajuda.com');
            console.log('  Senha: admin123');
            console.log('  ⚠️  IMPORTANTE: Altere a senha após o primeiro login!');
        } else {
            console.log('✓ Usuário admin já existe');
        }

        // Verificar se já existem chalés
        const Chale = require('../models/Chale');
        const chalesExistentes = await Chale.buscarTodos();
        
        if (chalesExistentes.length === 0) {
            console.log('Criando chalés de exemplo...');
            
            await Chale.criar({
                nome: 'Chalé 1',
                descricao: 'Chalé completo com varanda espaçosa, rede e vista para o jardim. Perfeito para casais.',
                capacidade_adultos: 2,
                capacidade_criancas: 2,
                preco_diaria: 250.00,
                ativo: 1,
                amenidades: [
                    'Quarto com ar-condicionado',
                    'Sala de estar',
                    'Cozinha equipada',
                    'Varanda com rede',
                    'Wi-Fi gratuito'
                ],
                imagens: ['images/1693864112638.jpg']
            });

            await Chale.criar({
                nome: 'Chalé 2',
                descricao: 'Chalé completo com varanda espaçosa, rede e vista para o jardim. Perfeito para casais.',
                capacidade_adultos: 2,
                capacidade_criancas: 2,
                preco_diaria: 250.00,
                ativo: 1,
                amenidades: [
                    'Quarto com ar-condicionado',
                    'Sala de estar',
                    'Cozinha equipada',
                    'Varanda com rede',
                    'Wi-Fi gratuito'
                ],
                imagens: ['images/IMG_20230814_141853_677.webp']
            });

            await Chale.criar({
                nome: 'Chalé 3',
                descricao: 'Chalé aconchegante para famílias pequenas.',
                capacidade_adultos: 4,
                capacidade_criancas: 2,
                preco_diaria: 350.00,
                ativo: 1,
                amenidades: [
                    'Quarto com ar-condicionado',
                    'Sala de estar',
                    'Cozinha equipada',
                    'Varanda com rede',
                    'Wi-Fi gratuito'
                ],
                imagens: []
            });

            await Chale.criar({
                nome: 'Chalé 4',
                descricao: 'Chalé espaçoso ideal para famílias.',
                capacidade_adultos: 4,
                capacidade_criancas: 3,
                preco_diaria: 380.00,
                ativo: 1,
                amenidades: [
                    'Quarto com ar-condicionado',
                    'Sala de estar',
                    'Cozinha equipada',
                    'Varanda com rede',
                    'Wi-Fi gratuito',
                    'Área externa'
                ],
                imagens: []
            });

            console.log('✓ Chalés de exemplo criados com sucesso!');
        } else {
            console.log(`✓ Já existem ${chalesExistentes.length} chalés cadastrados`);
        }

        console.log('\n✓ Banco de dados inicializado com sucesso!');
        console.log('\n💡 Dica: Execute "npm run inserir-avaliacoes" para adicionar avaliações de exemplo');
        
        await database.close();
        process.exit(0);

    } catch (erro) {
        console.error('Erro ao inicializar banco de dados:', erro);
        process.exit(1);
    }
};

inicializarBanco();

