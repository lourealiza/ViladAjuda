const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const chaleRoutes = require('./chaleRoutes');
const reservaRoutes = require('./reservaRoutes');
const precoRoutes = require('./precoRoutes');

// Rota de health check
router.get('/', (req, res) => {
    res.json({ 
        mensagem: 'API Vila d\'Ajuda funcionando!',
        versao: '1.0.0',
        status: 'online'
    });
});

router.get('/health', (req, res) => {
    res.json({ 
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

// Rotas da API
router.use('/auth', authRoutes);
router.use('/chales', chaleRoutes);
router.use('/reservas', reservaRoutes);
router.use('/precos', precoRoutes);

module.exports = router;

