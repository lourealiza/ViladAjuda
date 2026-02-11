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
console.log('DEBUG: Loading consultaRoutes...');
console.log('DEBUG: validarConsulta:', typeof validarConsulta);
console.log('DEBUG: tratarErrosValidacao:', typeof tratarErrosValidacao);
console.log('DEBUG: reservaController:', typeof reservaController);
if (reservaController) {
    console.log('DEBUG: reservaController.consultar:', typeof reservaController.consultar);
}

// Debug route to check router status
router.get('/debug-check', (req, res) => {
    res.json({
        status: 'ok',
        validarConsultaType: typeof validarConsulta,
        tratarErrosValidacaoType: typeof tratarErrosValidacao,
        consultarType: typeof reservaController?.consultar
    });
});

router.post('/', validarConsulta, tratarErrosValidacao, reservaController.consultar);

module.exports = router;

