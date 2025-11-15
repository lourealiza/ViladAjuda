# 🚀 Guia de Deploy para KingHost

## URL do Site
**http://viladajuda.web213.uni5.net/**

---

## 📦 O que você precisa

### Credenciais de Acesso
Para fazer o upload do site, você precisa de uma das seguintes opções:

#### Opção 1: Painel de Controle KingHost (Mais Fácil)
- Login: seu email ou usuário KingHost
- Senha: sua senha do painel

#### Opção 2: Acesso FTP (Recomendado para desenvolvedores)
- **Host FTP**: `viladajuda.web213.uni5.net` ou `ftp.viladajuda.web213.uni5.net`
- **Usuário FTP**: (fornecido pela KingHost - geralmente seu email)
- **Senha FTP**: (fornecida pela KingHost)
- **Porta**: 21 (FTP) ou 22 (SFTP)

> 💡 **Como obter suas credenciais?** Entre no painel da KingHost em https://painel.kinghost.com.br e procure por "FTP" ou "Gerenciador de Arquivos"

---

## 🎯 Método 1: Upload pelo Painel da KingHost (Mais Simples)

### Passo a Passo:

1. **Acesse o Painel**
   - Entre em: https://painel.kinghost.com.br
   - Faça login com suas credenciais

2. **Localize o Gerenciador de Arquivos**
   - No painel, procure por "Gerenciador de Arquivos" ou "File Manager"
   - Clique para abrir

3. **Navegue até a pasta pública**
   - Procure pela pasta `public_html` ou `www`
   - Esta é a pasta onde os arquivos do site devem ficar

4. **Limpe a pasta (se necessário)**
   - Se houver arquivos antigos, delete-os
   - Mantenha apenas arquivos importantes como `.htaccess` (se existir)

5. **Faça o Upload dos Arquivos**
   - Selecione todos os arquivos do projeto:
     - `index.html`
     - Pasta `css/` (com `style.css`)
     - Pasta `js/` (com `script.js`)
     - Pasta `images/` (com todas as imagens)
   
6. **Verifique o Upload**
   - Certifique-se de que todos os arquivos foram enviados
   - A estrutura deve ficar assim:
     ```
     public_html/
     ├── index.html
     ├── css/
     │   └── style.css
     ├── js/
     │   └── script.js
     └── images/
         └── (todas as imagens)
     ```

7. **Teste o Site**
   - Acesse: http://viladajuda.web213.uni5.net/
   - Verifique se tudo está funcionando

---

## 🎯 Método 2: Upload via FTP (FileZilla)

### Instalar o FileZilla (se ainda não tiver)
- Download: https://filezilla-project.org/
- Instale a versão Client

### Conectar ao Servidor:

1. **Abra o FileZilla**

2. **Configure a Conexão**
   - Host: `viladajuda.web213.uni5.net` ou `ftp.viladajuda.web213.uni5.net`
   - Usuário: (seu usuário FTP da KingHost)
   - Senha: (sua senha FTP)
   - Porta: 21
   - Clique em "Conexão Rápida"

3. **Navegue até a Pasta Pública**
   - No lado direito (servidor remoto), encontre a pasta `public_html` ou `www`
   - Entre nesta pasta

4. **Faça o Upload**
   - No lado esquerdo (seu computador), navegue até a pasta do projeto
   - Selecione todos os arquivos e pastas:
     - `index.html`
     - `css/`
     - `js/`
     - `images/`
   - Arraste para o lado direito (servidor)

5. **Aguarde a Transferência**
   - Espere todos os arquivos serem transferidos
   - Verifique se não há erros

6. **Teste o Site**
   - Acesse: http://viladajuda.web213.uni5.net/

---

## 🎯 Método 3: Upload via PowerShell/Terminal (Avançado)

Se você tiver acesso SFTP, pode usar comandos:

```powershell
# Instale WinSCP ou use SFTP nativo
# Exemplo com WinSCP:
winscp.com /command ^
    "open sftp://usuario:senha@viladajuda.web213.uni5.net" ^
    "cd /public_html" ^
    "put index.html" ^
    "put -r css/" ^
    "put -r js/" ^
    "put -r images/" ^
    "exit"
```

---

## ✅ Checklist de Verificação

Após o upload, verifique:

- [ ] O site carrega em http://viladajuda.web213.uni5.net/
- [ ] As imagens aparecem corretamente
- [ ] Os estilos CSS estão aplicados
- [ ] O menu de navegação funciona
- [ ] O formulário de reserva funciona
- [ ] O site é responsivo (teste no celular)
- [ ] As seções de FAQ abrem/fecham corretamente

---

## 🔧 Configurações Adicionais (Opcional)

### 1. Configurar arquivo .htaccess
Crie um arquivo `.htaccess` na pasta `public_html` com:

```apache
# Forçar HTTPS (se tiver SSL)
# RewriteEngine On
# RewriteCond %{HTTPS} off
# RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Página de erro 404 customizada
ErrorDocument 404 /index.html

# Habilitar compressão
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>

# Cache de arquivos estáticos
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

### 2. Atualizar URLs no HTML (IMPORTANTE!)
Você precisa atualizar as meta tags Open Graph no `index.html` de:
- `https://lourealiza.github.io/ViladAjuda/`

Para:
- `http://viladajuda.web213.uni5.net/`

---

## 📞 Suporte KingHost

Se tiver problemas:
- **Telefone**: 0800 200 8300
- **Chat**: https://king.host/suporte
- **E-mail**: suporte@kinghost.com.br

---

## 🎨 Próximos Passos (Opcional)

1. **Configurar domínio próprio**: Se quiser usar `viladajuda.com.br` em vez da URL temporária
2. **Instalar SSL**: Para ter HTTPS e maior segurança
3. **Configurar e-mail profissional**: contato@viladajuda.com.br
4. **Integrar com Google Analytics**: Para monitorar visitantes

---

## ⚠️ Problemas Comuns e Soluções

### Site não carrega
- Verifique se os arquivos estão na pasta `public_html`
- Certifique-se de que o `index.html` está na raiz
- Aguarde alguns minutos para propagação

### Imagens não aparecem
- Verifique se a pasta `images` foi completamente enviada
- Verifique os nomes dos arquivos (case-sensitive)

### CSS/JavaScript não funciona
- Verifique se as pastas `css` e `js` foram enviadas
- Limpe o cache do navegador (Ctrl + F5)

### Formulário não envia
- Verifique se o EmailJS está configurado no `script.js`
- Teste a conexão de internet do servidor

---

**Criado em**: 15 de Novembro de 2025
**Última atualização**: 15/11/2025

