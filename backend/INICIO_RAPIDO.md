# 🚀 Início Rápido - Backend Vila d'Ajuda

## Configuração em 5 passos

### 1. Instalar dependências
```bash
cd backend
npm install
```

### 2. Criar arquivo .env
Copie e renomeie `env-example.txt` para `.env` e ajuste as configurações:
```env
PORT=3000
NODE_ENV=development
DB_PATH=./database.sqlite
JWT_SECRET=mude_para_algo_muito_seguro_e_aleatorio
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5500
```

### 3. Inicializar banco de dados
```bash
npm run init-db
```

Isso criará:
- ✓ Tabelas no banco de dados
- ✓ Usuário admin (email: admin@viladajuda.com, senha: admin123)
- ✓ 4 chalés de exemplo

### 4. Iniciar servidor
```bash
npm run dev
```

### 5. Testar
Abra o navegador em: http://localhost:3000/api

Você verá:
```json
{
  "mensagem": "API Vila d'Ajuda funcionando!",
  "versao": "1.0.0",
  "status": "online"
}
```

## 🧪 Teste Rápido da API

### 1. Fazer Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@viladajuda.com","senha":"admin123"}'
```

Copie o token retornado.

### 2. Listar Chalés
```bash
curl http://localhost:3000/api/chales
```

### 3. Criar Reserva
```bash
curl -X POST http://localhost:3000/api/reservas \
  -H "Content-Type: application/json" \
  -d '{
    "chale_id": 1,
    "nome_hospede": "Teste Silva",
    "email_hospede": "teste@exemplo.com",
    "telefone_hospede": "(73) 99999-9999",
    "data_checkin": "2024-12-20",
    "data_checkout": "2024-12-25",
    "num_adultos": 2,
    "num_criancas": 0
  }'
```

### 4. Listar Reservas (com autenticação)
```bash
curl http://localhost:3000/api/reservas \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## ⚠️ Importante

1. **Altere a senha do admin** após o primeiro login!
2. **Mude o JWT_SECRET** no arquivo .env
3. Para produção, use um banco de dados PostgreSQL ou MySQL

## 📚 Documentação Completa

Veja `README.md` para documentação completa da API.

## 🐛 Problemas Comuns

### Erro "EADDRINUSE"
A porta 3000 já está em uso. Mude a porta no arquivo `.env`:
```env
PORT=3001
```

### Erro "Cannot find module"
Execute novamente:
```bash
npm install
```

### Banco de dados não inicializa
Delete o arquivo `database.sqlite` e execute novamente:
```bash
npm run init-db
```

