const express = require('express');
const router = express.Router();
const TrackingController = require('../controllers/trackingController');
const AnalyticsController = require('../controllers/analyticsController');
const { auth } = require('../middleware/auth');

// Rotas públicas para registrar eventos
router.post('/evento', TrackingController.registrarEvento);
router.post('/view-content', TrackingController.registrarViewContent);
router.post('/search-availability', TrackingController.registrarSearchAvailability);
router.post('/start-booking', TrackingController.registrarStartBooking);

// Rotas protegidas para análise
router.get('/', auth, TrackingController.listar);
router.get('/estatisticas', auth, TrackingController.buscarEstatisticas);
router.get('/conversoes', auth, TrackingController.buscarConversoes);
router.get('/utm', auth, TrackingController.buscarPorUTM);

// Dashboard e Analytics
router.get('/dashboard', auth, AnalyticsController.obterDashboard);
router.get('/dashboard/reservas-periodo', auth, AnalyticsController.obterReservasPorPeriodo);
router.get('/dashboard/ocupacao-chale', auth, AnalyticsController.obterOcupacaoPorChale);
router.get('/dashboard/receita-mes', auth, AnalyticsController.obterReceitaPorMes);
router.get('/dashboard/canais-reservas', auth, AnalyticsController.obterCanaisReservas);
router.get('/dashboard/analise-utm', auth, AnalyticsController.obterAnaliseUTM);
router.get('/dashboard/funil-conversao', auth, AnalyticsController.obterFunilConversao);

module.exports = router;
