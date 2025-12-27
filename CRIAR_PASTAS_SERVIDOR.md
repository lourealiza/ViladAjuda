# 📁 Criar Pastas no Servidor (Solução para Erro FTP)

## ❌ Problema
O usuário FTP não tem permissão para **criar pastas** no servidor. O deploy falha ao tentar criar `css/`, `js/`, `images/`, etc.

## ✅ Solução: Criar Pastas Manualmente via SSH

Execute estes comandos **uma única vez** via SSH para criar as pastas necessárias:

### **1. Conectar ao Servidor**
```bash
ssh viladajuda@www.viladajuda.com.br
```

### **2. Criar Estrutura de Pastas**
```bash
cd ~/www  # ou ~/public_html (depende da sua configuração)

# Criar pastas necessárias
mkdir -p css
mkdir -p js
mkdir -p images
mkdir -p api

# Dar permissões corretas
chmod 755 css
chmod 755 js
chmod 755 images
chmod 755 api

# Verificar se foram criadas
ls -la
```

### **3. Verificar Caminho Correto**
```bash
# Verificar onde você está
pwd

# Verificar estrutura
ls -la ~/
ls -la ~/www/
ls -la ~/public_html/
```

### **4. Descobrir Caminho Correto para o Workflow**

Após criar as pastas, verifique qual é o caminho correto:

- Se as pastas estão em `~/www/` → use `server-dir: ./www/`
- Se as pastas estão em `~/public_html/` → use `server-dir: ./public_html/`
- Se as pastas estão na raiz `~/` → use `server-dir: ./`

---

## 🔄 Após Criar as Pastas

1. **Faça commit e push** do workflow atualizado
2. **O GitHub Actions** agora conseguirá fazer upload dos arquivos
3. **Não precisará criar pastas** novamente (apenas upload de arquivos)

---

## 🆘 Se Ainda Der Erro

### **Opção 1: Verificar Permissões**
```bash
ssh viladajuda@www.viladajuda.com.br
cd ~/www  # ou caminho correto
chmod -R 755 css js images api
```

### **Opção 2: Usar Caminho Absoluto no Workflow**
Se o caminho relativo não funcionar, tente absoluto:

```yaml
server-dir: /home/viladajuda/www/
# ou
server-dir: /home/viladajuda/public_html/
```

### **Opção 3: Deploy Manual Completo**
Se o FTP continuar dando erro, use deploy manual via SSH:

```bash
ssh viladajuda@www.viladajuda.com.br "cd ~ && mkdir -p temp-vila && cd temp-vila && git clone https://github.com/lourealiza/ViladAjuda.git . && cp -f index.html ~/www/index.html && cp -f obrigado.html ~/www/obrigado.html && cp -f admin.html ~/www/admin.html && cp -rf css ~/www/ && cp -rf js ~/www/ && cp -rf images ~/www/ && cd ~ && rm -rf temp-vila"
```

---

## ✅ Checklist

- [ ] Conectou via SSH
- [ ] Criou pastas `css/`, `js/`, `images/`
- [ ] Deu permissões `chmod 755` nas pastas
- [ ] Verificou caminho correto (`www/` ou `public_html/`)
- [ ] Atualizou `server-dir` no workflow se necessário
- [ ] Fez commit e push
- [ ] Testou deploy novamente

---

**🎯 Depois de criar as pastas uma vez, o deploy via FTP funcionará normalmente!**
