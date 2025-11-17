# ✅ Configuração MySQL Completa

## 📋 Credenciais Configuradas

- **Servidor:** mysql66-farm2.uni5.net
- **Porta:** 3306
- **Database:** viladajuda
- **Usuário:** viladajuda
- **Senha:** arraial2026

## ✅ Status da Configuração

- ✅ Conexão MySQL testada e funcionando
- ✅ Tabelas criadas no banco de dados
- ✅ Dados migrados do SQLite para MySQL
- ✅ Usuário admin criado
- ✅ 4 chalés cadastrados

## 🚀 Como Usar

### Desenvolvimento Local (SQLite)
```bash
# No arquivo .env, use:
DB_TYPE=sqlite
```

### Produção (MySQL)
```bash
# No arquivo .env, use:
DB_TYPE=mysql
DB_HOST=mysql66-farm2.uni5.net
DB_USER=viladajuda
DB_PASSWORD=arraial2026
DB_NAME=viladajuda
DB_PORT=3306
```

## 📝 Scripts Disponíveis

```bash
# Testar conexão MySQL
npm run test-mysql

# Inicializar banco MySQL (criar tabelas e dados padrão)
npm run init-mysql

# Migrar dados do SQLite para MySQL
npm run migrate-mysql

# Iniciar servidor
npm run dev
```

## 🔐 Credenciais de Acesso

**Admin:**
- Email: `admin@viladajuda.com`
- Senha: `admin123`

⚠️ **IMPORTANTE:** Altere a senha após o primeiro login!

## 📊 Dados Migrados

- ✅ 1 usuário administrador
- ✅ 4 chalés
- ✅ 0 reservas (banco novo)

## 🔄 Próximos Passos

1. ✅ MySQL configurado
2. ✅ Dados migrados
3. ⏭️ Testar API com MySQL
4. ⏭️ Fazer deploy para produção
5. ⏭️ Configurar variáveis de ambiente no servidor

## 🧪 Testar API

```bash
# Iniciar servidor
npm run dev

# Testar endpoint
curl http://localhost:3000/api

# Listar chalés
curl http://localhost:3000/api/chales

# Fazer login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@viladajuda.com","senha":"admin123"}'
```

## ⚠️ Notas Importantes

1. **Backup:** Sempre faça backup antes de migrar dados
2. **Segurança:** Não commite o arquivo `.env` no Git
3. **Produção:** Use variáveis de ambiente no servidor
4. **Monitoramento:** Monitore a conexão MySQL em produção

