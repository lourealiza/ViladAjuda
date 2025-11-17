const express = require('express');
const router = express.Router();
const DisponibilidadeController = require('../controllers/disponibilidadeController');

// Verificação completa de disponibilidade
router.get('/verificar', DisponibilidadeController.verificarDisponibilidade);

// Verificação rápida (para formulário)
router.get('/verificar-rapida', DisponibilidadeController.verificarRapida);

// Calendário de disponibilidade
router.get('/calendario', DisponibilidadeController.obterCalendario);

// Calcular número de diárias
router.get('/calcular-diarias', DisponibilidadeController.calcularDiarias);

module.exports = router;

