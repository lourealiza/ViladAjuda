require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const database = require('../src/config/database');
const routes = require('../src/routes');
const logAcesso = require('../src/middleware/logAcesso');

const app = express();

// Middlewares de segurança
app.use(helmet());

// CORS
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) {
            return callback(null, true);
        }
        
        if (process.env.NODE_ENV === 'development') {
            if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
                return callback(null, true);
            }
        }
        
        const frontendUrl = process.env.FRONTEND_URL || 'https://www.viladajuda.com.br';
        const allowedOrigins = frontendUrl.split(',').map(url => url.trim());
        
        const normalizedOrigin = origin.replace(/\/$/, '');
        const normalizedAllowed = allowedOrigins.map(url => url.replace(/\/$/, ''));
        
        const isAllowed = normalizedAllowed.some(allowed => {
            if (normalizedOrigin === allowed) return true;
            if (normalizedOrigin.replace('www.', '') === allowed.replace('www.', '')) return true;
            if (normalizedOrigin.replace(/^https?:\/\//, '') === allowed.replace(/^https?:\/\//, '')) return true;
            return false;
        });
        
        if (isAllowed || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(new Error('CORS não permitido'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

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

// Middleware de log - DESABILITADO TEMPORARIAMENTE
// app.use(logAcesso);

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

