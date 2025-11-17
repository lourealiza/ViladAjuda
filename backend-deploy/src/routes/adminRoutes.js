const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { auth } = require('../middleware/auth');
const { verificarAdmin } = require('../middleware/permissao');

// Todas as rotas requerem autenticação e permissão de admin
router.use(auth);
router.use(verificarAdmin);

// Backups
router.post('/backups', AdminController.criarBackup);
router.get('/backups', AdminController.listarBackups);
router.post('/backups/:id/restaurar', AdminController.restaurarBackup);

// Logs e Auditoria
router.get('/logs', AdminController.listarLogs);
router.get('/logs/tarifas', AdminController.historicoTarifas);
router.get('/logs/bloqueios', AdminController.historicoBloqueios);

// Usuários
router.get('/usuarios', AdminController.listarUsuarios);
router.post('/usuarios', AdminController.criarUsuario);
router.put('/usuarios/:id', AdminController.atualizarUsuario);
router.delete('/usuarios/:id', AdminController.deletarUsuario);

module.exports = router;
