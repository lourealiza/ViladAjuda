# 🚀 Deploy Pronto - Tudo Configurado!

## ✅ Configuração Atual

### **Secrets do GitHub (Verificar/Atualizar)**

Acesse: https://github.com/lourealiza/ViladAjuda/settings/secrets/actions

Configure estes 3 secrets:

1. **`KINGHOST_FTP_HOST`** = `ftp.viladajuda.com.br`
2. **`KINGHOST_FTP_USER`** = `viladajuda`
3. **`KINGHOST_FTP_PASSWORD`** = (sua senha FTP)

### **Workflow Configurado**

- ✅ Usuário correto: `viladajuda`
- ✅ Host correto: `ftp.viladajuda.com.br`
- ✅ Caminho correto: `./` (raiz do diretório FTP)
- ✅ Pastas já existem no servidor
- ✅ Branch padrão: `master`

---

## 🚀 Como Fazer Deploy

### **Opção 1: Deploy Automático (Recomendado)**

1. **Faça qualquer mudança** nos arquivos
2. **Commit e push**:
   ```bash
   git add .
   git commit -m "atualizar arquivos"
   git push origin master
   ```
3. **O deploy será automático!**

### **Opção 2: Deploy Manual**

1. Acesse: https://github.com/lourealiza/ViladAjuda/actions
2. Clique em **"Deploy to KingHost"** no menu lateral
3. Clique em **"Run workflow"** (canto superior direito)
4. Selecione a branch: **master**
5. Clique em **"Run workflow"**

---

## 📋 O Que Será Deployado

### **Frontend** (para `./`)
- `index.html`
- `obrigado.html`
- `admin.html`
- `css/` (arquivos CSS)
- `js/` (arquivos JavaScript)
- `images/` (imagens)

### **API PHP** (para `./api/`)
- Todos os arquivos PHP da API
- Controllers, configs, templates

### **Backend Node.js**
- ⚠️ **NÃO será deployado via FTP** (KingHost não suporta)
- 📋 **Instruções**: Deploy no Vercel (veja `BACKEND_VERCEL_DEPLOY.md`)

---

## 🔍 Acompanhar o Deploy

1. Acesse: https://github.com/lourealiza/ViladAjuda/actions
2. Clique no workflow **"Deploy to KingHost"** em execução
3. Veja os logs em tempo real
4. Aguarde terminar (2-3 minutos)

---

## ✅ Verificar se Funcionou

Após o deploy terminar:

1. **Limpe o cache do navegador**: `Ctrl + Shift + R`
2. **Acesse**: https://www.viladajuda.com.br/
3. **Verifique**:
   - Site carrega corretamente
   - Mostra "Alvorada Tropical" e "Vila do Canto"
   - CSS e JS carregam
   - API funciona: https://www.viladajuda.com.br/api/

---

## 🚨 Se Der Erro

### **Erro: "550 Permission denied"**
- ✅ Pastas já foram criadas (já existem)
- Verifique se o usuário FTP está correto: `viladajuda`

### **Erro: "Secret not found"**
- Verifique se todos os 3 secrets estão configurados
- Verifique se o nome está exato

### **Erro: "Connection refused"**
- Verifique se o `KINGHOST_FTP_HOST` está correto: `ftp.viladajuda.com.br`

---

## 📝 Checklist Final

- [ ] Secret `KINGHOST_FTP_HOST` = `ftp.viladajuda.com.br`
- [ ] Secret `KINGHOST_FTP_USER` = `viladajuda`
- [ ] Secret `KINGHOST_FTP_PASSWORD` = (sua senha)
- [ ] Workflow "Deploy to KingHost" habilitado
- [ ] Deploy disparado (automático ou manual)
- [ ] Deploy terminou com sucesso
- [ ] Site atualizado no navegador

---

## 🎯 Próximo Passo

**Disparar o deploy agora:**

1. **Opção A**: Fazer um pequeno commit e push
2. **Opção B**: Disparar manualmente no GitHub Actions

**Tudo está pronto! Basta disparar o deploy!** 🚀

