const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'secret_padrao_mude_isso';

const auth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({ 
                erro: 'Token não fornecido',
                mensagem: 'É necessário estar autenticado para acessar este recurso'
            });
        }

        const parts = authHeader.split(' ');
        
        if (parts.length !== 2) {
            return res.status(401).json({ erro: 'Formato de token inválido' });
        }

        const [scheme, token] = parts;

        if (!/^Bearer$/i.test(scheme)) {
            return res.status(401).json({ erro: 'Token mal formatado' });
        }

        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ 
                    erro: 'Token inválido ou expirado',
                    mensagem: 'Por favor, faça login novamente'
                });
            }

            req.usuarioId = decoded.id;
            req.usuarioEmail = decoded.email;
            req.usuarioRole = decoded.role;
            
            return next();
        });
    } catch (erro) {
        return res.status(401).json({ 
            erro: 'Erro na autenticação',
            mensagem: erro.message 
        });
    }
};

const gerarToken = (usuario) => {
    const payload = {
        id: usuario.id,
        email: usuario.email,
        role: usuario.role
    };

    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

module.exports = { auth, gerarToken };

