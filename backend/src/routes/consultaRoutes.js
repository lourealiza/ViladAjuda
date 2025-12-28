const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reservaController');
const { validarConsulta, tratarErrosValidacao } = require('../middleware/validacao');

/**
 * Rota POST /consulta
 * Compatibilidade com API PHP - redireciona para criação de reserva
 * Aceita tanto consultas simples quanto reservas completas
 * Campos nome_hospede, email_hospede e telefone_hospede são opcionais
 */
router.post('/', validarConsulta, tratarErrosValidacao, reservaController.criar);

module.exports = router;

