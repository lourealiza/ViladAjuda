const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const database = require('./config/database');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de segurança
app.use(helmet());

// CORS
const corsOptions = {
    origin: process.env.FRONTEND_URL || '*',
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo de 100 requisições por IP
    message: {
        erro: 'Muitas requisições',
        mensagem: 'Por favor, tente novamente mais tarde'
    }
});
app.use('/api/', limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log de requisições (desenvolvimento)
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
    });
}

// Rotas
app.use('/api', routes);

// Rota 404
app.use((req, res) => {
    res.status(404).json({ 
        erro: 'Rota não encontrada',
        mensagem: `A rota ${req.method} ${req.path} não existe`
    });
});

// Middleware de erro global
app.use((err, req, res, next) => {
    console.error('Erro:', err);
    
    res.status(err.status || 500).json({
        erro: err.message || 'Erro interno do servidor',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Inicializar servidor
const iniciarServidor = async () => {
    try {
        // Conectar ao banco de dados
        await database.connect();
        console.log('✓ Banco de dados conectado');

        // Iniciar servidor
        app.listen(PORT, () => {
            console.log(`✓ Servidor rodando na porta ${PORT}`);
            console.log(`✓ Ambiente: ${process.env.NODE_ENV || 'development'}`);
            console.log(`✓ API disponível em: http://localhost:${PORT}/api`);
        });

    } catch (erro) {
        console.error('Erro ao iniciar servidor:', erro);
        process.exit(1);
    }
};

// Tratamento de encerramento
process.on('SIGINT', async () => {
    console.log('\nEncerrando servidor...');
    await database.close();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\nEncerrando servidor...');
    await database.close();
    process.exit(0);
});

// Iniciar
iniciarServidor();

module.exports = app;

