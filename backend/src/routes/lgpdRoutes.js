const express = require('express');
const router = express.Router();
const LGPDController = require('../controllers/lgpdController');
const { auth } = require('../middleware/auth');

// Rotas públicas
router.get('/politica-privacidade', LGPDController.obterPoliticaPrivacidade);
router.post('/consentimento', LGPDController.registrarConsentimento);
router.get('/consentimento/:reserva_id', LGPDController.verificarConsentimento);

module.exports = router;

