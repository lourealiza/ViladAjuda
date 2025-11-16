require('dotenv').config();

// Escolher qual banco de dados usar baseado na variável de ambiente
const DB_TYPE = process.env.DB_TYPE || 'sqlite';

let database;

if (DB_TYPE === 'mysql') {
    database = require('./database-mysql');
} else {
    database = require('./database-sqlite');
}

module.exports = database;

