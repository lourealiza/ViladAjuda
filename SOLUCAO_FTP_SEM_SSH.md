# 🔧 Solução: Deploy FTP sem Acesso SSH

## ❌ Problema Identificado

O usuário `viladajuda` não tem permissão SSH (`/sbin/nologin: Permission denied`). Isso significa:
- ❌ Não podemos usar SSH para criar pastas
- ❌ Não podemos usar SSH para fazer deploy manual
- ✅ Podemos usar apenas FTP

## ✅ Solução: Criar Pastas via FTP Client

Como não temos acesso SSH, precisamos criar as pastas manualmente via FTP Client (FileZilla, WinSCP, etc.).

### **Passo 1: Conectar via FTP Client**

1. **Baixe um FTP Client** (se não tiver):
   - FileZilla: https://filezilla-project.org/
   - WinSCP: https://winscp.net/

2. **Configure a conexão**:
   - **Host**: `ftp.viladajuda.com.br`
   - **Usuário**: `viladajuda`
   - **Senha**: (sua senha FTP)
   - **Porta**: `21` (padrão)

3. **Conecte**

### **Passo 2: Criar Pastas Manualmente**

Após conectar, navegue até o diretório correto (geralmente `www/` ou `public_html/`) e crie as pastas:

1. **Navegue até o diretório** onde o site deve estar (geralmente `www/` ou `public_html/`)
2. **Clique com botão direito** → **Criar diretório**
3. **Crie as seguintes pastas**:
   - `css`
   - `js`
   - `images`
   - `api`

### **Passo 3: Verificar Caminho Correto**

Anote qual é o caminho completo onde você criou as pastas:
- Se foi em `www/` → use `server-dir: www/`
- Se foi em `public_html/` → use `server-dir: public_html/`
- Se foi na raiz → use `server-dir: ./`

### **Passo 4: Atualizar Workflow**

Após descobrir o caminho correto, atualize o workflow com o `server-dir` correto.

---

## 🔄 Alternativa: Usar Painel KingHost

Se o FTP Client não funcionar, tente criar as pastas via painel da KingHost:

1. Acesse: https://painel.kinghost.com.br
2. Vá em **Gerenciador de Arquivos** ou **FTP**
3. Navegue até o diretório do site
4. Crie as pastas manualmente

---

## 📋 Checklist

- [ ] Conectou via FTP Client
- [ ] Descobriu qual é o diretório correto (`www/`, `public_html/`, etc.)
- [ ] Criou as pastas `css/`, `js/`, `images/`, `api/`
- [ ] Anotou o caminho completo
- [ ] Atualizou `server-dir` no workflow se necessário
- [ ] Testou deploy novamente

---

## 🆘 Se Ainda Não Funcionar

**Última opção**: Entre em contato com o suporte da KingHost e peça para:
1. Criar as pastas `css/`, `js/`, `images/`, `api/` no diretório correto
2. Ou habilitar permissão SSH para o usuário `viladajuda`

---

**🎯 Próximo passo**: Conecte via FTP Client e crie as pastas manualmente!

