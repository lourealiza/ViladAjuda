const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

console.log('Servidor mínimo iniciado');

app.get('/test', (req, res) => {
    res.json({ msg: 'funcionando!' });
});

app.listen(3000, () => {
    console.log('Server rodando na porta 3000');
});
