const Usuario = require('../models/Usuario');
const { gerarToken } = require('../middleware/auth');

class AuthController {
    async login(req, res) {
        try {
            const { email, senha } = req.body;

            // Buscar usuário
            const usuario = await Usuario.buscarPorEmail(email);
            
            if (!usuario) {
                return res.status(401).json({ 
                    erro: 'Credenciais inválidas',
                    mensagem: 'Email ou senha incorretos'
                });
            }

            // Validar senha
            const senhaValida = await Usuario.validarSenha(senha, usuario.senha);
            
            if (!senhaValida) {
                return res.status(401).json({ 
                    erro: 'Credenciais inválidas',
                    mensagem: 'Email ou senha incorretos'
                });
            }

            // Gerar token
            const token = gerarToken(usuario);

            // Remover senha da resposta
            delete usuario.senha;

            return res.json({
                mensagem: 'Login realizado com sucesso',
                token,
                usuario
            });

        } catch (erro) {
            console.error('Erro no login:', erro);
            return res.status(500).json({ 
                erro: 'Erro no servidor',
                mensagem: 'Erro ao realizar login'
            });
        }
    }

    async registrar(req, res) {
        try {
            const { nome, email, senha, role } = req.body;

            // Verificar se o email já existe
            const usuarioExistente = await Usuario.buscarPorEmail(email);
            
            if (usuarioExistente) {
                return res.status(400).json({ 
                    erro: 'Email já cadastrado',
                    mensagem: 'Este email já está em uso'
                });
            }

            // Criar novo usuário
            const novoUsuario = await Usuario.criar({
                nome,
                email,
                senha,
                role: role || 'admin'
            });

            // Gerar token
            const token = gerarToken(novoUsuario);

            return res.status(201).json({
                mensagem: 'Usuário criado com sucesso',
                token,
                usuario: novoUsuario
            });

        } catch (erro) {
            console.error('Erro no registro:', erro);
            return res.status(500).json({ 
                erro: 'Erro no servidor',
                mensagem: 'Erro ao criar usuário'
            });
        }
    }

    async perfil(req, res) {
        try {
            const usuario = await Usuario.buscarPorId(req.usuarioId);
            
            if (!usuario) {
                return res.status(404).json({ 
                    erro: 'Usuário não encontrado'
                });
            }

            return res.json({ usuario });

        } catch (erro) {
            console.error('Erro ao buscar perfil:', erro);
            return res.status(500).json({ 
                erro: 'Erro no servidor',
                mensagem: 'Erro ao buscar perfil'
            });
        }
    }
}

module.exports = new AuthController();

