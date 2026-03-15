require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const database = require('../src/config/database');
const routes = require('../src/routes');
const logAcesso = require('../src/middleware/logAcesso');

const app = express();

console.log('🚀 Backend iniciando...');

// Middlewares de segurança - DESABILITADO PARA DEBUG
// app.use(helmet());

// CORS - SIMPLES
app.use(cors());

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Muitas requisições deste IP, tente novamente mais tarde.',
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(limiter);

console.log('📝 Registrando rotas...');

// Rota de teste simples
app.get('/test', (req, res) => {
    res.json({ msg: 'test ok' });
});

// Rotas
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rota raiz
app.get('/', (req, res) => {
    res.json({
        mensagem: 'API Vila d\'Ajuda funcionando!',
        versao: '2.0.0',
        status: 'online'
    });
});

// Middleware de erro 404
app.use((req, res) => {
    res.status(404).json({
        erro: 'Rota não encontrada',
        mensagem: `A rota ${req.method} ${req.path} não existe`
    });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error('Erro:', err.message);
    res.status(500).json({
        erro: 'Erro interno do servidor',
        mensagem: err.message
    });
});

// Conectar ao banco de dados
database.connect().catch(err => {
    console.error('Erro ao conectar ao banco de dados:', err);
});

// Exportar para Vercel
module.exports = app;

