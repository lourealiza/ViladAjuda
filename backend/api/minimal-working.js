// Ultra-minimal serverless function for Vercel
module.exports = (req, res) => {
    // Get the request path
    const path = req.url || '/';
    const method = req.method || 'GET';
    
    console.log(`[${new Date().toISOString()}] ${method} ${path}`);
    
    // Check for auth/login endpoint
    if (path.includes('/api/auth/login') && method === 'POST') {
        return res.status(200).json({
            success: true,
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibm9tZSI6IkFkbWluaXN0cmFkb3IiLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
            usuario: {
                id: 1,
                email: 'admin@viladajuda.com',
                nome: 'Administrador'
            }
        });
    }
    
    // Default response
    res.status(200).json({
        ok: true,
        message: 'API Vila d\'Ajuda',
        version: '2.0.0',
        path: path,
        method: method
    });
};
