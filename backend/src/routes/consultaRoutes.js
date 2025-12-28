const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reservaController');
const { validarConsulta, tratarErrosValidacao } = require('../middleware/validacao');

/**
 * Rota POST /consulta
 * Compatibilidade com API PHP ConsultaController
 * NÃO cria reserva no banco - apenas envia notificação pendente
 * A reserva será criada manualmente pelo admin após aprovação
 * Aceita tanto consultas simples quanto reservas completas
 * Campos nome_hospede, email_hospede e telefone_hospede são opcionais
 */
router.post('/', validarConsulta, tratarErrosValidacao, reservaController.consultar);

module.exports = router;

