const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validarLogin, validarUsuario, tratarErrosValidacao } = require('../middleware/validacao');
const { auth } = require('../middleware/auth');

// Rotas públicas
router.post('/login', validarLogin, tratarErrosValidacao, authController.login);
router.post('/registrar', validarUsuario, tratarErrosValidacao, authController.registrar);

// Rotas protegidas
router.get('/perfil', auth, authController.perfil);

module.exports = router;

