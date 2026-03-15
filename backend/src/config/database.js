require('dotenv').config();

// Escolher qual banco de dados usar baseado na variável de ambiente
// Em produção (Vercel), usar MySQL por padrão; em desenvolvimento, usar SQLite
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
const DB_TYPE = process.env.DB_TYPE || (isProduction ? 'mysql' : 'sqlite');

console.log(`🗄️  Usando banco de dados: ${DB_TYPE} (Ambiente: ${isProduction ? 'PRODUÇÃO' : 'DESENVOLVIMENTO'})`);

let database;

if (DB_TYPE === 'mysql') {
    database = require('./database-mysql');
} else {
    database = require('./database-sqlite');
}

module.exports = database;

