const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const chaleRoutes = require('./chaleRoutes');
const reservaRoutes = require('./reservaRoutes');
const precoRoutes = require('./precoRoutes');
const disponibilidadeRoutes = require('./disponibilidadeRoutes');
const tarifaRoutes = require('./tarifaRoutes');
const pagamentoRoutes = require('./pagamentoRoutes');
const hospedeRoutes = require('./hospedeRoutes');
const conteudoRoutes = require('./conteudoRoutes');
const trackingRoutes = require('./trackingRoutes');
const bloqueioRoutes = require('./bloqueioRoutes');
const adminRoutes = require('./adminRoutes');
const lgpdRoutes = require('./lgpdRoutes');
const avaliacaoRoutes = require('./avaliacaoRoutes');

// Rota de health check
router.get('/', (req, res) => {
    res.json({ 
        mensagem: 'API Vila d\'Ajuda funcionando!',
        versao: '2.0.0',
        status: 'online',
        modulos: [
            'Motor de Reservas',
            'Gestão de Tarifas',
            'Pipeline de Reservas',
            'Pagamentos',
            'CRM de Hóspedes',
            'Conteúdo & CMS',
            'Tracking & Analytics',
            'Admin & Segurança'
        ]
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
router.use('/disponibilidade', disponibilidadeRoutes);
router.use('/tarifas', tarifaRoutes);
router.use('/pagamentos', pagamentoRoutes);
router.use('/hospedes', hospedeRoutes);
router.use('/conteudos', conteudoRoutes);
router.use('/tracking', trackingRoutes);
router.use('/bloqueios', bloqueioRoutes);
router.use('/admin', adminRoutes);
router.use('/lgpd', lgpdRoutes);
router.use('/avaliacoes', avaliacaoRoutes);

module.exports = router;

