#!/usr/bin/env node

/**
 * Script para criar um usuário admin
 * Uso: node criar-admin.js
 */

const http = require('http');

const dadosAdmin = {
    nome: 'Administrador',
    email: 'admin@viladajuda.com',
    senha: 'admin123456',
    role: 'admin'
};

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/registrar',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
};

const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('\n✅ Resposta do servidor:');
        console.log(`Status: ${res.statusCode}`);
        try {
            const resposta = JSON.parse(data);
            console.log(JSON.stringify(resposta, null, 2));

            if (res.statusCode === 201) {
                console.log('\n✅ Admin criado com sucesso!');
                console.log('📧 Email: ' + dadosAdmin.email);
                console.log('🔐 Senha: ' + dadosAdmin.senha);
                console.log('\n⚠️  IMPORTANTE: Altere a senha após o primeiro login!');
            }
        } catch (e) {
            console.log(data);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Erro ao conectar:', error.message);
    console.error('Certifique-se de que o backend está rodando em http://localhost:3000');
});

console.log('📤 Enviando pedido de criação de admin...');
console.log('Dados:', dadosAdmin);
req.write(JSON.stringify(dadosAdmin));
req.end();
