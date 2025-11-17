# Backend Vila d'Ajuda - Sistema de Gerenciamento de Reservas

Backend completo para gerenciamento de reservas de chalés da Vila d'Ajuda em Arraial d'Ajuda, Bahia.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **SQLite** - Banco de dados (pode ser migrado para PostgreSQL/MySQL)
- **JWT** - Autenticação
- **bcryptjs** - Criptografia de senhas
- **express-validator** - Validação de dados
- **helmet** - Segurança HTTP
- **cors** - Cross-Origin Resource Sharing
- **rate-limit** - Proteção contra ataques

## 📁 Estrutura do Projeto

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js         # Configuração do banco de dados
│   │   └── initDatabase.js     # Script de inicialização
│   ├── controllers/
│   │   ├── authController.js   # Autenticação
│   │   ├── chaleController.js  # Gestão de chalés
│   │   └── reservaController.js # Gestão de reservas
│   ├── middleware/
│   │   ├── auth.js             # Middleware de autenticação
│   │   └── validacao.js        # Validações
│   ├── models/
│   │   ├── Chale.js            # Modelo de Chalé
│   │   ├── Reserva.js          # Modelo de Reserva
│   │   └── Usuario.js          # Modelo de Usuário
│   ├── routes/
│   │   ├── authRoutes.js       # Rotas de autenticação
│   │   ├── chaleRoutes.js      # Rotas de chalés
│   │   ├── reservaRoutes.js    # Rotas de reservas
│   │   └── index.js            # Agregador de rotas
│   ├── utils/
│   │   └── validarDatas.js     # Funções auxiliares
│   └── server.js               # Servidor principal
├── .gitignore
├── package.json
└── README.md
```

## 🔧 Instalação

### 1. Instalar dependências

```bash
cd backend
npm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do diretório `backend`:

```env
PORT=3000
NODE_ENV=development
DB_PATH=./database.sqlite
JWT_SECRET=seu_secret_muito_seguro_aqui_mude_isso
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5500
```

> **⚠️ IMPORTANTE:** Altere o `JWT_SECRET` para uma string segura e aleatória!

### 3. Inicializar banco de dados

```bash
npm run init-db
```

Este comando irá:
- Criar as tabelas necessárias
- Criar um usuário administrador padrão
- Criar chalés de exemplo

**Credenciais padrão:**
- Email: `admin@viladajuda.com`
- Senha: `admin123`

> **⚠️ IMPORTANTE:** Altere a senha após o primeiro login!

### 4. Iniciar o servidor

**Modo de desenvolvimento (com auto-reload):**
```bash
npm run dev
```

**Modo de produção:**
```bash
npm start
```

O servidor estará disponível em: `http://localhost:3000/api`

## 📚 Documentação da API

### Base URL
```
http://localhost:3000/api
```

### Autenticação

Todas as rotas protegidas requerem um token JWT no header:
```
Authorization: Bearer {token}
```

---

### 🔐 Autenticação

#### POST `/api/auth/login`
Fazer login e obter token de autenticação.

**Body:**
```json
{
  "email": "admin@viladajuda.com",
  "senha": "admin123"
}
```

**Resposta:**
```json
{
  "mensagem": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nome": "Administrador",
    "email": "admin@viladajuda.com",
    "role": "admin"
  }
}
```

#### POST `/api/auth/registrar`
Registrar novo usuário administrador.

**Body:**
```json
{
  "nome": "João Silva",
  "email": "joao@exemplo.com",
  "senha": "senha123",
  "role": "admin"
}
```

#### GET `/api/auth/perfil` 🔒
Obter perfil do usuário autenticado.

---

### 🏠 Chalés

#### GET `/api/chales`
Listar todos os chalés.

**Query params:**
- `ativo=true` - Apenas chalés ativos

**Resposta:**
```json
{
  "total": 4,
  "chales": [
    {
      "id": 1,
      "nome": "Chalé 1",
      "descricao": "Chalé completo...",
      "capacidade_adultos": 2,
      "capacidade_criancas": 2,
      "preco_diaria": 250.00,
      "ativo": true,
      "amenidades": ["Wi-Fi", "Ar-condicionado"],
      "imagens": ["image1.jpg"]
    }
  ]
}
```

#### GET `/api/chales/:id`
Buscar chalé por ID.

#### GET `/api/chales/:id/disponibilidade`
Verificar disponibilidade de um chalé.

**Query params:**
- `data_checkin` (obrigatório) - Data de entrada (YYYY-MM-DD)
- `data_checkout` (obrigatório) - Data de saída (YYYY-MM-DD)

**Exemplo:**
```
GET /api/chales/1/disponibilidade?data_checkin=2024-12-20&data_checkout=2024-12-25
```

**Resposta:**
```json
{
  "chale_id": 1,
  "data_checkin": "2024-12-20",
  "data_checkout": "2024-12-25",
  "disponivel": true
}
```

#### POST `/api/chales` 🔒
Criar novo chalé (requer autenticação).

**Body:**
```json
{
  "nome": "Chalé 5",
  "descricao": "Chalé aconchegante",
  "capacidade_adultos": 2,
  "capacidade_criancas": 2,
  "preco_diaria": 280.00,
  "ativo": true,
  "amenidades": ["Wi-Fi", "Ar-condicionado", "Cozinha"],
  "imagens": ["imagem1.jpg", "imagem2.jpg"]
}
```

#### PUT `/api/chales/:id` 🔒
Atualizar chalé (requer autenticação).

#### DELETE `/api/chales/:id` 🔒
Deletar chalé (requer autenticação).

---

### 📅 Reservas

#### POST `/api/reservas`
Criar nova reserva (rota pública).

**Body:**
```json
{
  "chale_id": 1,
  "nome_hospede": "Maria Santos",
  "email_hospede": "maria@exemplo.com",
  "telefone_hospede": "(73) 99999-9999",
  "data_checkin": "2024-12-20",
  "data_checkout": "2024-12-25",
  "num_adultos": 2,
  "num_criancas": 1,
  "mensagem": "Gostaria de um chalé tranquilo"
}
```

**Resposta:**
```json
{
  "mensagem": "Reserva criada com sucesso",
  "reserva": {
    "id": 1,
    "chale_id": 1,
    "nome_hospede": "Maria Santos",
    "email_hospede": "maria@exemplo.com",
    "telefone_hospede": "(73) 99999-9999",
    "data_checkin": "2024-12-20",
    "data_checkout": "2024-12-25",
    "num_adultos": 2,
    "num_criancas": 1,
    "valor_total": 1250.00,
    "status": "pendente",
    "mensagem": "Gostaria de um chalé tranquilo"
  }
}
```

#### GET `/api/reservas/disponiveis`
Buscar chalés disponíveis para um período.

**Query params:**
- `data_checkin` (obrigatório) - YYYY-MM-DD
- `data_checkout` (obrigatório) - YYYY-MM-DD

**Exemplo:**
```
GET /api/reservas/disponiveis?data_checkin=2024-12-20&data_checkout=2024-12-25
```

#### GET `/api/reservas` 🔒
Listar todas as reservas (requer autenticação).

**Query params (opcionais):**
- `status` - Filtrar por status (pendente, confirmada, cancelada, concluida)
- `chale_id` - Filtrar por chalé
- `data_inicio` - Data inicial
- `data_fim` - Data final

#### GET `/api/reservas/:id` 🔒
Buscar reserva por ID (requer autenticação).

#### PUT `/api/reservas/:id` 🔒
Atualizar reserva (requer autenticação).

#### DELETE `/api/reservas/:id` 🔒
Deletar reserva (requer autenticação).

#### PATCH `/api/reservas/:id/status` 🔒
Atualizar status da reserva (requer autenticação).

**Body:**
```json
{
  "status": "confirmada"
}
```

**Status válidos:** `pendente`, `confirmada`, `cancelada`, `concluida`

#### GET `/api/reservas/periodo` 🔒
Buscar reservas por período (requer autenticação).

**Query params:**
- `data_inicio` (obrigatório)
- `data_fim` (obrigatório)

---

## 🔒 Segurança

O backend implementa várias camadas de segurança:

1. **Helmet** - Proteção de headers HTTP
2. **CORS** - Controle de origem cruzada
3. **Rate Limiting** - Máximo de 100 requisições por IP a cada 15 minutos
4. **JWT** - Tokens com expiração configurável
5. **bcryptjs** - Senhas criptografadas com hash
6. **Validações** - Validação de entrada de dados em todas as rotas

## 🗄️ Banco de Dados

### Tabelas

#### usuarios
- id (INTEGER PRIMARY KEY)
- nome (VARCHAR)
- email (VARCHAR UNIQUE)
- senha (VARCHAR - hash)
- role (VARCHAR)
- criado_em (DATETIME)
- atualizado_em (DATETIME)

#### chales
- id (INTEGER PRIMARY KEY)
- nome (VARCHAR)
- descricao (TEXT)
- capacidade_adultos (INTEGER)
- capacidade_criancas (INTEGER)
- preco_diaria (DECIMAL)
- ativo (BOOLEAN)
- amenidades (TEXT - JSON)
- imagens (TEXT - JSON)
- criado_em (DATETIME)
- atualizado_em (DATETIME)

#### reservas
- id (INTEGER PRIMARY KEY)
- chale_id (INTEGER FK)
- nome_hospede (VARCHAR)
- email_hospede (VARCHAR)
- telefone_hospede (VARCHAR)
- data_checkin (DATE)
- data_checkout (DATE)
- num_adultos (INTEGER)
- num_criancas (INTEGER)
- valor_total (DECIMAL)
- status (VARCHAR)
- mensagem (TEXT)
- criado_em (DATETIME)
- atualizado_em (DATETIME)

## 🔄 Migração para PostgreSQL/MySQL

Para migrar de SQLite para PostgreSQL ou MySQL:

1. Instale o driver apropriado:
```bash
npm install pg  # PostgreSQL
# ou
npm install mysql2  # MySQL
```

2. Atualize `src/config/database.js` para usar o novo driver

3. Ajuste as queries SQL se necessário (principalmente tipos de dados)

## 🚀 Deploy

### Opções de Hospedagem

- **Heroku** - Fácil deploy, suporte a Node.js
- **DigitalOcean** - VPS com controle total
- **AWS EC2** - Escalável e robusto
- **Vercel/Railway** - Deploy simples para APIs

### Checklist para Produção

- [ ] Mudar `JWT_SECRET` para valor seguro
- [ ] Configurar `FRONTEND_URL` correto
- [ ] Alterar senha do admin padrão
- [ ] Configurar banco de dados de produção
- [ ] Configurar `NODE_ENV=production`
- [ ] Configurar SSL/HTTPS
- [ ] Configurar backup automático do banco
- [ ] Configurar logs (Winston, Morgan)
- [ ] Configurar monitoramento (PM2, New Relic)

## 📝 Scripts Disponíveis

```bash
npm start       # Iniciar servidor em produção
npm run dev     # Iniciar servidor em desenvolvimento (com nodemon)
npm run init-db # Inicializar banco de dados
```

## 🐛 Tratamento de Erros

Todas as rotas retornam erros no formato:

```json
{
  "erro": "Tipo do erro",
  "mensagem": "Descrição detalhada do erro"
}
```

Códigos de status HTTP:
- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Erro de validação
- `401` - Não autenticado
- `404` - Não encontrado
- `500` - Erro interno do servidor

## 🧪 Testando a API

Você pode testar a API usando:

- **Postman** - Cliente HTTP com interface gráfica
- **Insomnia** - Alternativa ao Postman
- **curl** - Linha de comando
- **Thunder Client** - Extensão do VS Code

### Exemplo com curl:

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@viladajuda.com","senha":"admin123"}'

# Listar chalés
curl http://localhost:3000/api/chales

# Criar reserva
curl -X POST http://localhost:3000/api/reservas \
  -H "Content-Type: application/json" \
  -d '{
    "chale_id": 1,
    "nome_hospede": "João Silva",
    "email_hospede": "joao@exemplo.com",
    "telefone_hospede": "(73) 99999-9999",
    "data_checkin": "2024-12-20",
    "data_checkout": "2024-12-25",
    "num_adultos": 2,
    "num_criancas": 0
  }'
```

## 📞 Suporte

Para dúvidas ou problemas, consulte:
- Documentação do código
- Logs do servidor
- Mensagens de erro detalhadas

## 📄 Licença

© 2024 Vila d'Ajuda. Todos os direitos reservados.

