require('dotenv').config();

const express = require('express');
const cors = require('cors');

console.log('🚀 Backend init - Ultra minimal');

const app = express();

app.use(cors());
app.use(express.json());

console.log('✅ Middlewares loaded');

app.get('/test', (req, res) => {
    res.json({ msg: 'ok' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.get('/', (req, res) => {
    res.json({ msg: 'api ok' });
});

app.use((req, res) => {
    res.status(404).json({ erro: 'not found' });
});

console.log('✅ App configured');

module.exports = app;

