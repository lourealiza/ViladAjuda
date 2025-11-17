const BackupService = require('../services/backupService');
const LogAcesso = require('../models/LogAcesso');
const AuditoriaService = require('../services/auditoriaService');
const Usuario = require('../models/Usuario');

class AdminController {
    /**
     * Criar backup manual
     */
    static async criarBackup(req, res) {
        try {
            const tipo = req.body.tipo || 'completo';
            const usuarioId = req.usuario?.id;

            let backup;
            if (tipo === 'incremental') {
                backup = await BackupService.criarBackupIncremental(usuarioId, req.body.data_desde);
            } else {
                backup = await BackupService.criarBackupCompleto(usuarioId);
            }

            res.json({
                mensagem: 'Backup criado com sucesso',
                backup
            });
        } catch (erro) {
            console.error('Erro ao criar backup:', erro);
            res.status(500).json({
                erro: 'Erro ao criar backup',
                mensagem: erro.message
            });
        }
    }

    /**
     * Listar backups
     */
    static async listarBackups(req, res) {
        try {
            const filtros = {
                status: req.query.status,
                tipo: req.query.tipo
            };

            const backups = await BackupService.listarBackups(filtros);
            res.json(backups);
        } catch (erro) {
            console.error('Erro ao listar backups:', erro);
            res.status(500).json({
                erro: 'Erro ao listar backups',
                mensagem: erro.message
            });
        }
    }

    /**
     * Restaurar backup
     */
    static async restaurarBackup(req, res) {
        try {
            const { id } = req.params;
            const usuarioId = req.usuario?.id;

            const resultado = await BackupService.restaurarBackup(id, usuarioId);
            res.json(resultado);
        } catch (erro) {
            console.error('Erro ao restaurar backup:', erro);
            res.status(500).json({
                erro: 'Erro ao restaurar backup',
                mensagem: erro.message
            });
        }
    }

    /**
     * Listar logs de acesso/auditoria
     */
    static async listarLogs(req, res) {
        try {
            const filtros = {
                usuario_id: req.query.usuario_id,
                acao: req.query.acao,
                tabela_afetada: req.query.tabela_afetada,
                data_inicio: req.query.data_inicio,
                data_fim: req.query.data_fim,
                limit: req.query.limit ? parseInt(req.query.limit) : 100
            };

            const logs = await LogAcesso.buscarTodos(filtros);
            res.json(logs);
        } catch (erro) {
            console.error('Erro ao listar logs:', erro);
            res.status(500).json({
                erro: 'Erro ao listar logs',
                mensagem: erro.message
            });
        }
    }

    /**
     * Histórico de alterações de tarifas
     */
    static async historicoTarifas(req, res) {
        try {
            const filtros = {
                acao: req.query.acao,
                data_inicio: req.query.data_inicio,
                data_fim: req.query.data_fim
            };

            const historico = await AuditoriaService.buscarHistoricoTarifas(filtros);
            res.json(historico);
        } catch (erro) {
            console.error('Erro ao buscar histórico de tarifas:', erro);
            res.status(500).json({
                erro: 'Erro ao buscar histórico',
                mensagem: erro.message
            });
        }
    }

    /**
     * Histórico de bloqueios
     */
    static async historicoBloqueios(req, res) {
        try {
            const filtros = {
                acao: req.query.acao,
                data_inicio: req.query.data_inicio,
                data_fim: req.query.data_fim
            };

            const historico = await AuditoriaService.buscarHistoricoBloqueios(filtros);
            res.json(historico);
        } catch (erro) {
            console.error('Erro ao buscar histórico de bloqueios:', erro);
            res.status(500).json({
                erro: 'Erro ao buscar histórico',
                mensagem: erro.message
            });
        }
    }

    /**
     * Listar usuários
     */
    static async listarUsuarios(req, res) {
        try {
            const usuarios = await Usuario.buscarTodos();
            res.json(usuarios);
        } catch (erro) {
            console.error('Erro ao listar usuários:', erro);
            res.status(500).json({
                erro: 'Erro ao listar usuários',
                mensagem: erro.message
            });
        }
    }

    /**
     * Criar usuário
     */
    static async criarUsuario(req, res) {
        try {
            const usuario = await Usuario.criar(req.body);
            res.status(201).json({
                mensagem: 'Usuário criado com sucesso',
                usuario: {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email,
                    role: usuario.role
                }
            });
        } catch (erro) {
            console.error('Erro ao criar usuário:', erro);
            res.status(500).json({
                erro: 'Erro ao criar usuário',
                mensagem: erro.message
            });
        }
    }

    /**
     * Atualizar usuário
     */
    static async atualizarUsuario(req, res) {
        try {
            const { id } = req.params;
            const usuario = await Usuario.atualizar(id, req.body);
            res.json({
                mensagem: 'Usuário atualizado com sucesso',
                usuario: {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email,
                    role: usuario.role
                }
            });
        } catch (erro) {
            console.error('Erro ao atualizar usuário:', erro);
            res.status(500).json({
                erro: 'Erro ao atualizar usuário',
                mensagem: erro.message
            });
        }
    }

    /**
     * Deletar usuário
     */
    static async deletarUsuario(req, res) {
        try {
            const { id } = req.params;
            
            // Não permitir deletar a si mesmo
            if (parseInt(id) === req.usuario?.id) {
                return res.status(400).json({
                    erro: 'Não é possível deletar seu próprio usuário'
                });
            }

            await Usuario.deletar(id);
            res.json({ mensagem: 'Usuário deletado com sucesso' });
        } catch (erro) {
            console.error('Erro ao deletar usuário:', erro);
            res.status(500).json({
                erro: 'Erro ao deletar usuário',
                mensagem: erro.message
            });
        }
    }
}

module.exports = AdminController;
