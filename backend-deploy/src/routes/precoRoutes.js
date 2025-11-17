const express = require('express');
const router = express.Router();
const precoController = require('../controllers/precoController');

// Rotas públicas
router.get('/calcular', precoController.calcular);
router.get('/temporada', precoController.obterTemporada);
router.get('/tabela', precoController.obterTabela);

module.exports = router;

