const { body, validationResult } = require('express-validator');

const validarReserva = [
    body('nome_hospede')
        .trim()
        .notEmpty().withMessage('Nome do hóspede é obrigatório')
        .isLength({ min: 3 }).withMessage('Nome deve ter pelo menos 3 caracteres'),
    
    body('email_hospede')
        .trim()
        .notEmpty().withMessage('Email é obrigatório')
        .isEmail().withMessage('Email inválido'),
    
    body('telefone_hospede')
        .trim()
        .notEmpty().withMessage('Telefone é obrigatório')
        .matches(/^[\d\s\(\)\-\+]+$/).withMessage('Telefone inválido'),
    
    body('data_checkin')
        .notEmpty().withMessage('Data de check-in é obrigatória')
        .isISO8601().withMessage('Data de check-in inválida')
        .custom((value) => {
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            const checkin = new Date(value);
            if (checkin < hoje) {
                throw new Error('Data de check-in deve ser hoje ou no futuro');
            }
            return true;
        }),
    
    body('data_checkout')
        .notEmpty().withMessage('Data de check-out é obrigatória')
        .isISO8601().withMessage('Data de check-out inválida')
        .custom((value, { req }) => {
            const checkin = new Date(req.body.data_checkin);
            const checkout = new Date(value);
            if (checkout <= checkin) {
                throw new Error('Data de check-out deve ser posterior ao check-in');
            }
            return true;
        }),
    
    body('num_adultos')
        .optional()
        .isInt({ min: 1, max: 10 }).withMessage('Número de adultos deve estar entre 1 e 10'),
    
    body('num_criancas')
        .optional()
        .isInt({ min: 0, max: 10 }).withMessage('Número de crianças deve estar entre 0 e 10'),
];

const validarChale = [
    body('nome')
        .trim()
        .notEmpty().withMessage('Nome do chalé é obrigatório')
        .isLength({ min: 2, max: 50 }).withMessage('Nome deve ter entre 2 e 50 caracteres'),
    
    body('descricao')
        .optional()
        .trim(),
    
    body('capacidade_adultos')
        .optional()
        .isInt({ min: 1, max: 10 }).withMessage('Capacidade de adultos deve estar entre 1 e 10'),
    
    body('capacidade_criancas')
        .optional()
        .isInt({ min: 0, max: 10 }).withMessage('Capacidade de crianças deve estar entre 0 e 10'),
    
    body('preco_diaria')
        .optional()
        .isFloat({ min: 0 }).withMessage('Preço da diária deve ser um valor positivo'),
    
    body('ativo')
        .optional()
        .isBoolean().withMessage('Campo ativo deve ser verdadeiro ou falso'),
];

const validarUsuario = [
    body('nome')
        .trim()
        .notEmpty().withMessage('Nome é obrigatório')
        .isLength({ min: 3 }).withMessage('Nome deve ter pelo menos 3 caracteres'),
    
    body('email')
        .trim()
        .notEmpty().withMessage('Email é obrigatório')
        .isEmail().withMessage('Email inválido'),
    
    body('senha')
        .notEmpty().withMessage('Senha é obrigatória')
        .isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
];

const validarLogin = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email é obrigatório')
        .isEmail().withMessage('Email inválido'),
    
    body('senha')
        .notEmpty().withMessage('Senha é obrigatória'),
];

const tratarErrosValidacao = (req, res, next) => {
    const erros = validationResult(req);
    
    if (!erros.isEmpty()) {
        return res.status(400).json({ 
            erro: 'Dados inválidos',
            detalhes: erros.array().map(err => ({
                campo: err.path,
                mensagem: err.msg
            }))
        });
    }
    
    next();
};

module.exports = {
    validarReserva,
    validarChale,
    validarUsuario,
    validarLogin,
    tratarErrosValidacao
};

