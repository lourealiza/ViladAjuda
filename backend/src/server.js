const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const socketIO = require('socket.io');
require('dotenv').config();

const database = require('./config/database');
const routes = require('./routes');
const logAcesso = require('./middleware/logAcesso');
const notificacaoService = require('./services/notificacaoService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de segurança
app.use(helmet());

// CORS
const corsOptions = {
    origin: function (origin, callback) {
        // Permitir requisições sem origin (mesmo domínio, Postman, etc)
        if (!origin) {
            return callback(null, true);
        }
        
        // Em desenvolvimento, aceitar localhost em qualquer porta
        if (process.env.NODE_ENV === 'development') {
            if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
                return callback(null, true);
            }
        }
        
        // Em produção, usar FRONTEND_URL
        const frontendUrl = process.env.FRONTEND_URL || 'https://www.viladajuda.com.br';
        const allowedOrigins = frontendUrl.split(',').map(url => url.trim());
        
        // Normalizar URLs para comparação (remover trailing slash)
        const normalizedOrigin = origin.replace(/\/$/, '');
        const normalizedAllowed = allowedOrigins.map(url => url.replace(/\/$/, ''));
        
        // Verificar se a origem está permitida
        const isAllowed = normalizedAllowed.some(allowed => {
            // Comparação exata
            if (normalizedOrigin === allowed) return true;
            // Aceitar variações com/sem www
            if (normalizedOrigin.replace('www.', '') === allowed.replace('www.', '')) return true;
            if (normalizedOrigin.replace(/^https?:\/\//, '') === allowed.replace(/^https?:\/\//, '')) return true;
            return false;
        }) || origin.includes('.vercel.app');
        
        if (isAllowed) {
            callback(null, true);
        } else {
            console.warn(`CORS bloqueado: ${origin} não está em ${allowedOrigins.join(', ')}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
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

// Middleware de log de acesso (LGPD)
if (process.env.ENABLE_ACCESS_LOG !== 'false') {
    app.use('/api', logAcesso);
}

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

// Conectar ao banco de dados (lazy, não bloqueia)
(async () => {
    try {
        if (database.connect && !database.isConnected) {
            await database.connect();
        }
    } catch (erro) {
        console.error('Erro ao conectar ao banco (será tentado novamente na primeira requisição):', erro.message);
    }
})();

// Inicializar servidor (apenas se não estiver no Vercel)
if (process.env.VERCEL !== '1' && require.main === module) {
    const iniciarServidor = async () => {
        try {
            // Conectar ao banco de dados
            await database.connect();
            console.log('✓ Banco de dados conectado');

            // Criar servidor HTTP para Socket.io
            const httpServer = createServer(app);

            // Configurar Socket.io
            const io = socketIO(httpServer, {
                cors: {
                    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
                    credentials: true
                },
                transports: ['websocket', 'polling']
            });

            // Middleware de autenticação para Socket.io
            io.use((socket, next) => {
                const token = socket.handshake.auth.token;
                if (!token) {
                    return next(new Error('Autenticação requerida'));
                }
                // Verificar token (você pode usar jwt.verify aqui)
                try {
                    const jwt = require('jsonwebtoken');
                    const usuario = jwt.verify(token, process.env.JWT_SECRET || 'seu-segredo-aqui');
                    socket.usuario = usuario;
                    next();
                } catch (erro) {
                    next(new Error('Token inválido'));
                }
            });

            // Eventos de Socket.io
            io.on('connection', (socket) => {
                console.log(`Usuário conectado: ${socket.usuario?.id} - Socket: ${socket.id}`);

                // Registrar socket do usuário no serviço
                notificacaoService.registrarSocket(socket.usuario.id, socket);

                // Emitir evento de conexão bem-sucedida
                socket.emit('conectado', {
                    mensagem: 'Conectado ao servidor de notificações',
                    usuario_id: socket.usuario.id
                });

                // Listener para marcar notificação como lida
                socket.on('notificacao_lida', async (notificacaoId) => {
                    try {
                        const Notificacao = require('./models/Notificacao');
                        await Notificacao.marcarComoLida(notificacaoId);
                        socket.emit('notificacao_lida_confirmado', { id: notificacaoId });
                    } catch (erro) {
                        console.error('Erro ao marcar notificação como lida:', erro);
                    }
                });

                // Desconexão
                socket.on('disconnect', () => {
                    console.log(`Usuário desconectado: ${socket.usuario?.id} - Socket: ${socket.id}`);
                    notificacaoService.removerSocket(socket.usuario.id, socket.id);
                });

                // Tratamento de erro
                socket.on('error', (erro) => {
                    console.error('Erro Socket.io:', erro);
                });
            });

            // Fazer io disponível em req para controladores (optional)
            app.locals.io = io;

            // Iniciar servidor HTTP
            const server = httpServer.listen(PORT, () => {
                console.log(`✓ Servidor rodando na porta ${PORT}`);
                console.log(`✓ Ambiente: ${process.env.NODE_ENV || 'development'}`);
                console.log(`✓ API disponível em: http://localhost:${PORT}/api`);
                console.log(`✓ Socket.io disponível em: ws://localhost:${PORT}`);
            });

            // Processador de notificações pendentes (a cada 5 minutos)
            setInterval(async () => {
                try {
                    await notificacaoService.processarFilaPendentes();
                } catch (erro) {
                    console.error('Erro ao processar fila de notificações:', erro);
                }
            }, 5 * 60 * 1000); // 5 minutos

            // Primeira execução após 30 segundos
            setTimeout(async () => {
                try {
                    await notificacaoService.processarFilaPendentes();
                } catch (erro) {
                    console.error('Erro na primeira execução da fila:', erro);
                }
            }, 30 * 1000);

        } catch (erro) {
            console.error('Erro ao iniciar servidor:', erro);
            process.exit(1);
        }
    };

    // Tratamento de encerramento
    process.on('SIGINT', async () => {
        console.log('\nEncerrando servidor...');
        if (database.close) await database.close();
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        console.log('\nEncerrando servidor...');
        if (database.close) await database.close();
        process.exit(0);
    });

    // Iniciar
    iniciarServidor();
}

module.exports = app;

