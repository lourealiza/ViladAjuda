# 🚀 Deploy Online - Backend Vila d'Ajuda

## 📋 Pré-requisitos

1. Acesso SSH ao servidor
2. Node.js instalado (versão 18 ou superior)
3. PM2 instalado globalmente
4. MySQL configurado e acessível
5. Apache com módulos `mod_rewrite` e `mod_proxy` habilitados

## 🔧 Passo a Passo

### 1. Preparar Arquivos Localmente

```powershell
# No Windows, execute:
.\preparar-deploy-servidor.ps1
```

Isso criará:

- `backend-deploy/` - Backend pronto para produção
- `frontend-deploy/` - Frontend com proxy configurado

### 2. Enviar Arquivos para o Servidor

**Opção A: Via SCP (PowerShell)**

```powershell
# Enviar backend
scp -r backend-deploy\* usuario@servidor:~/viladajuda/backend/

# Enviar frontend
scp -r frontend-deploy\* usuario@servidor:~/public_html/
```

**Opção B: Via Git (Recomendado)**

```bash
# No servidor SSH:
cd ~
git clone https://github.com/seu-usuario/ViladAjuda.git temp-vila
cp -r temp-vila/backend/* ~/viladajuda/backend/
cp -r temp-vila/deploy_kinghost/* ~/public_html/
rm -rf temp-vila
```

### 3. Configurar Backend no Servidor

```bash
# Conectar ao servidor
ssh usuario@servidor

# Navegar para o backend
cd ~/viladajuda/backend

# Instalar dependências
npm install --production

# Criar arquivo .env
nano .env
```

**Conteúdo do .env:**

```env
PORT=3000
NODE_ENV=production

# MySQL
DB_TYPE=mysql
DB_HOST=mysql66-farm2.uni5.net
DB_USER=viladajuda
DB_PASSWORD=sua_senha_mysql
DB_NAME=viladajuda
DB_PORT=3306

# JWT
JWT_SECRET=GERE_UMA_CHAVE_ALEATORIA_MUITO_SEGURA_AQUI
JWT_EXPIRE=7d

# CORS
FRONTEND_URL=https://www.viladajuda.com.br
```

### 4. Inicializar Banco de Dados

```bash
# Testar conexão MySQL
npm run test-mysql

# Inicializar banco (cria tabelas e usuário admin)
npm run init-mysql
```

### 5. Iniciar Backend com PM2

```bash
# Instalar PM2 globalmente (se ainda não tiver)
npm install -g pm2

# Parar processo anterior (se existir)
pm2 stop viladajuda-api 2>/dev/null || true
pm2 delete viladajuda-api 2>/dev/null || true

# Iniciar backend
pm2 start src/server.js --name viladajuda-api

# Salvar configuração do PM2
pm2 save

# Configurar PM2 para iniciar automaticamente
pm2 startup
# (Siga as instruções que aparecerem)
```

### 6. Verificar Status

```bash
# Ver status do PM2
pm2 status

# Ver logs
pm2 logs viladajuda-api

# Verificar se está respondendo
curl http://localhost:3000/api
```

### 7. Configurar Proxy Reverso no Apache

O arquivo `.htaccess` já está configurado no frontend. Certifique-se de que o Apache tem os módulos habilitados:

```bash
# Verificar se os módulos estão habilitados
apache2ctl -M | grep rewrite
apache2ctl -M | grep proxy

# Se não estiverem, habilitar (pode precisar de sudo):
# a2enmod rewrite
# a2enmod proxy
# a2enmod proxy_http
# systemctl restart apache2
```

### 8. Testar

1. **Testar API diretamente:**

   ```bash
   curl http://localhost:3000/api
   ```

2. **Testar via proxy:**

   ```bash
   curl https://www.viladajuda.com.br/api
   ```

3. **Testar login no admin:**
   - Acesse: `https://www.viladajuda.com.br/admin.html`
   - Email: `admin@viladajuda.com`
   - Senha: `admin123`

## 🔍 Troubleshooting

### Backend não inicia

```bash
# Ver logs detalhados
pm2 logs viladajuda-api --lines 50

# Verificar se a porta 3000 está em uso
netstat -tulpn | grep 3000

# Reiniciar backend
pm2 restart viladajuda-api
```

### Erro de conexão MySQL

```bash
# Testar conexão manualmente
mysql -h mysql66-farm2.uni5.net -u viladajuda -p viladajuda

# Verificar variáveis de ambiente
cd ~/viladajuda/backend
cat .env
```

### Proxy não funciona

1. Verificar se `.htaccess` está na pasta `public_html`
2. Verificar se módulos do Apache estão habilitados
3. Verificar logs do Apache:

   ```bash
   tail -f /var/log/apache2/error.log
   ```

### CORS Error

Verificar se `FRONTEND_URL` no `.env` está correto:

```env
FRONTEND_URL=https://www.viladajuda.com.br
```

## 📊 Comandos Úteis

```bash
# Ver status do PM2
pm2 status

# Ver logs em tempo real
pm2 logs viladajuda-api

# Reiniciar backend
pm2 restart viladajuda-api

# Parar backend
pm2 stop viladajuda-api

# Ver informações do processo
pm2 info viladajuda-api

# Monitorar recursos
pm2 monit
```

## ✅ Checklist Final

- [ ] Backend rodando no PM2
- [ ] Banco de dados inicializado
- [ ] Arquivo .env configurado corretamente
- [ ] Proxy reverso funcionando
- [ ] API respondendo em `/api`
- [ ] Login admin funcionando
- [ ] PM2 configurado para iniciar automaticamente

## 🔐 Segurança

1. **Altere a senha do admin** após o primeiro login
2. **Mude o JWT_SECRET** para algo seguro e aleatório
3. **Use HTTPS** em produção
4. **Configure firewall** para permitir apenas porta 80/443
5. **Mantenha Node.js atualizado**

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs: `pm2 logs viladajuda-api`
2. Verifique logs do Apache: `/var/log/apache2/error.log`
3. Teste a API diretamente: `curl http://localhost:3000/api`
