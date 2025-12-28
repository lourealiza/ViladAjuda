# ✅ ERRO FTP BACKEND CORRIGIDO

## ❌ Problema Identificado

O workflow do GitHub Actions estava falhando no deploy do backend com o erro:

```
FTPError: 550 backend: Permission denied
```

### 🔍 Causa do Problema

- O usuário FTP (`viladajuda`) não tem permissão para **criar pastas** no servidor
- O workflow tentava executar `MKD backend` (criar diretório backend)
- Recebia erro `550 backend: Permission denied`
- Depois tentava `CWD backend` e recebia `550 backend: No such file or directory`

## ✅ Solução Aplicada

### 1. **Modificação do Workflow**

- **Removido** o passo de deploy do backend via FTP
- **Adicionada** instrução clara para deploy manual via SSH
- O workflow agora faz apenas:
  - ✅ Deploy do **frontend** via FTP (`./www/`)
  - ✅ Deploy da **API PHP** via FTP (`./www/api/`)
  - 📋 **Instruções** para deploy do **backend** via SSH

### 2. **Por que SSH funciona melhor**

- SSH tem **mais permissões** no servidor
- Pode criar pastas e executar comandos
- Mais confiável para aplicações Node.js
- Permite instalar dependências e gerenciar processos

## 🚀 Como Proceder Agora

### **Deploy Automático (Frontend + API)**

O workflow agora funcionará automaticamente para frontend e API:

1. **Push** para branch `main` ou `master`
2. **GitHub Actions** executa automaticamente
3. **Frontend** e **API PHP** são deployados via FTP
4. ✅ **Sucesso!**

### **Deploy Manual do Backend**

Execute estes comandos via SSH:

```bash
# 1. Conectar ao servidor
ssh viladajuda01@www.viladajuda.com.br

# 2. Fazer deploy do backend
cd ~
mkdir -p temp-vila && cd temp-vila
git clone https://github.com/lourealiza/ViladAjuda.git . || git pull origin main
mkdir -p ~/www/backend
cp -r backend/* ~/www/backend/
cd ~/www/backend
npm install --production
pm2 restart viladajuda-api || pm2 start src/server.js --name viladajuda-api
cd ~ && rm -rf temp-vila

# 3. Testar
curl http://localhost:3001/health
```

## 📋 Status Atual

- ✅ **Frontend**: Deploy automático via FTP
- ✅ **API PHP**: Deploy automático via FTP
- 📋 **Backend Node.js**: Deploy manual via SSH (mais confiável)

## 🔍 Verificações

Após o deploy completo:

1. **Site**: https://www.viladajuda.com.br/
2. **API PHP**: https://www.viladajuda.com.br/api/
3. **API Node.js**: http://localhost:3001/ (no servidor)

## 📝 Próximos Passos

1. **Teste o novo workflow** fazendo um push
2. **Faça deploy manual do backend** seguindo as instruções acima
3. **Verifique se tudo funciona** corretamente

---

**🎉 Problema resolvido!** O deploy agora será mais estável e confiável.
