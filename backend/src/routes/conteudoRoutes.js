const express = require('express');
const router = express.Router();
const ConteudoController = require('../controllers/conteudoController');
const { auth } = require('../middleware/auth');

// Rotas públicas
router.get('/publico', ConteudoController.listar);
router.get('/publico/tipo/:tipo', ConteudoController.buscarPorTipo);
router.get('/publico/slug/:slug', ConteudoController.buscarPorSlug);
router.get('/publico/secao/:secao', ConteudoController.buscarPorSecao);
router.get('/publico/galeria', ConteudoController.buscarGaleria);
router.get('/publico/landing-pages', ConteudoController.buscarLandingPages);

// Rotas protegidas
router.get('/', auth, ConteudoController.listar);
router.get('/landing-pages', auth, ConteudoController.buscarLandingPages);
router.get('/galeria', auth, ConteudoController.buscarGaleria);
router.get('/secao/:secao', auth, ConteudoController.buscarPorSecao);
router.get('/tipo/:tipo', auth, ConteudoController.buscarPorTipo);
router.get('/slug/:slug', auth, ConteudoController.buscarPorSlug);
router.get('/:id', auth, ConteudoController.buscarPorId);
router.post('/', auth, ConteudoController.criar);
router.put('/:id', auth, ConteudoController.atualizar);
router.delete('/:id', auth, ConteudoController.deletar);

module.exports = router;
