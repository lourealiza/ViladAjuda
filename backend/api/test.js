// Serverless function simples para testar Vercel
module.exports = (req, res) => {
    res.status(200).json({
        ok: true,
        message: 'Serverless function working!',
        timestamp: new Date().toISOString(),
        path: req.path || '/'
    });
};
