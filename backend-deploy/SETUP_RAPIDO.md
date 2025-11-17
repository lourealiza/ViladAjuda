# ⚡ Setup Rápido - Backend Vila d'Ajuda

## 🚀 Início em 3 Comandos

```bash
# 1. Instalar dependências
npm install

# 2. Configurar .env (copiar exemplo e ajustar)
cp .env.example .env
nano .env

# 3. Setup completo (banco + avaliações)
npm run setup-completo
```

## 📦 Scripts Disponíveis

```bash
# Iniciar servidor
npm start              # Produção
npm run dev            # Desenvolvimento (com nodemon)

# Banco de dados
npm run init-db        # Criar tabelas e usuário admin
npm run inserir-avaliacoes  # Inserir avaliações de exemplo
npm run setup-completo      # Tudo de uma vez

# Backups
npm run backup         # Criar backup manual

# MySQL
npm run init-mysql     # Inicializar MySQL
npm run test-mysql     # Testar conexão MySQL
npm run migrate-mysql  # Migrar de SQLite para MySQL
```

## 🔐 Credenciais Padrão

**Admin:**
- Email: `admin@viladajuda.com`
- Senha: `admin123`
- ⚠️ **ALTERE A SENHA APÓS O PRIMEIRO LOGIN!**

## 🌐 Endpoints Principais

```
GET  /api                    - Health check
GET  /api/chales             - Listar chalés
GET  /api/reservas/disponiveis - Verificar disponibilidade
POST /api/reservas            - Criar reserva
GET  /api/avaliacoes/homepage - Avaliações para homepage
POST /api/auth/login          - Login admin
```

## 📝 Variáveis de Ambiente (.env)

```env
# Servidor
PORT=3000
NODE_ENV=production

# Banco de Dados
DB_TYPE=mysql
DB_HOST=localhost
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=viladajuda

# Segurança
JWT_SECRET=GERE_UMA_CHAVE_ALEATORIA_AQUI
JWT_EXPIRE=7d

# URLs
FRONTEND_URL=https://www.viladajuda.com.br

# Google Analytics 4 (opcional)
GA4_MEASUREMENT_ID=G-XXXXXXXXXX
GA4_API_SECRET=sua_api_secret

# Google Ads (opcional)
GOOGLE_ADS_CUSTOMER_ID=123-456-7890
GOOGLE_ADS_CONVERSION_ACTION_ID=123456789

# Backups
BACKUP_DIR=./backups
```

## ✅ Verificação Rápida

```bash
# Testar API
curl http://localhost:3000/api

# Deve retornar:
# {"mensagem":"API Vila d'Ajuda funcionando!","versao":"2.0.0","status":"online"}
```

## 🆘 Problemas Comuns

**Erro de conexão com banco:**
- Verifique `.env` com credenciais corretas
- Teste conexão: `npm run test-mysql`

**Porta 3000 já em uso:**
- Altere `PORT` no `.env`
- Ou mate o processo: `lsof -ti:3000 | xargs kill`

**Tabelas não criadas:**
- Execute: `npm run init-db`

---

Para mais detalhes, veja `PROXIMOS_PASSOS_COMPLETO.md`

