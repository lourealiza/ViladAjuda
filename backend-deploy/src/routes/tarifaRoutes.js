const express = require('express');
const router = express.Router();
const TarifaController = require('../controllers/tarifaController');
const { auth } = require('../middleware/auth');
const { verificarAdmin } = require('../middleware/permissao');

// Calcular valor (público)
router.post('/calcular', TarifaController.calcularValor);

// Temporadas (protegido - apenas admin)
router.get('/temporadas', TarifaController.listarTemporadas);
router.post('/temporadas', auth, verificarAdmin, TarifaController.criarTemporada);
router.put('/temporadas/:id', auth, verificarAdmin, TarifaController.atualizarTemporada);
router.delete('/temporadas/:id', auth, verificarAdmin, TarifaController.deletarTemporada);

// Feriados (protegido)
router.get('/feriados', TarifaController.listarFeriados);
router.post('/feriados', auth, TarifaController.criarFeriado);
router.put('/feriados/:id', auth, TarifaController.atualizarFeriado);
router.delete('/feriados/:id', auth, TarifaController.deletarFeriado);

// Cupons
router.post('/cupons/validar', TarifaController.validarCupom);
router.get('/cupons', auth, TarifaController.listarCupons);
router.post('/cupons', auth, TarifaController.criarCupom);
router.put('/cupons/:id', auth, TarifaController.atualizarCupom);
router.delete('/cupons/:id', auth, TarifaController.deletarCupom);

// Preços por Chalé/Temporada (protegido)
router.get('/precos-chale-temporada', auth, TarifaController.listarPrecosChaleTemporada);
router.post('/precos-chale-temporada', auth, TarifaController.criarPrecoChaleTemporada);

// Regras de Tarifação (protegido)
router.get('/regras-tarifacao', auth, TarifaController.listarRegrasTarifacao);
router.post('/regras-tarifacao', auth, TarifaController.criarRegraTarifacao);

// Override de Preços (protegido)
router.get('/precos-override', auth, TarifaController.listarPrecosOverride);
router.post('/precos-override', auth, TarifaController.criarPrecoOverride);

module.exports = router;

