# ⚡ Guia Rápido - Deploy KingHost

## 🎯 Opção 1: Método Automático (Recomendado)

### Execute o script de preparação:

1. Abra o PowerShell na pasta do projeto
2. Execute:
   ```powershell
   .\preparar_deploy_kinghost.ps1
   ```
3. Uma pasta `deploy_kinghost` será criada com tudo pronto
4. Faça upload dos arquivos dessa pasta para a KingHost

---

## 🎯 Opção 2: Método Manual Rápido

### Passo 1: Acesse a KingHost
```
🌐 https://painel.kinghost.com.br
```

### Passo 2: Gerenciador de Arquivos
- Clique em "Gerenciador de Arquivos"
- Entre na pasta `public_html`

### Passo 3: Upload
Envie estes arquivos:
- ✅ `index.html`
- ✅ Pasta `css/`
- ✅ Pasta `js/`
- ✅ Pasta `images/`

### Passo 4: Teste
```
🌐 http://viladajuda.web213.uni5.net/
```

---

## 🎯 Opção 3: FTP com FileZilla

### Configuração Rápida:
```
Host:     viladajuda.web213.uni5.net
Usuário:  (seu usuário KingHost)
Senha:    (sua senha FTP)
Porta:    21
```

### Upload:
1. Conecte ao servidor
2. Vá para `public_html`
3. Arraste todos os arquivos do projeto
4. Aguarde a transferência
5. Teste o site

---

## ⚠️ IMPORTANTE: Atualizar URLs

Antes do upload, atualize as URLs no `index.html`:

**Trocar de:**
```html
https://lourealiza.github.io/ViladAjuda/
```

**Para:**
```html
http://viladajuda.web213.uni5.net/
```

> 💡 O script automático faz isso para você!

---

## ✅ Checklist Pós-Deploy

- [ ] Site carrega?
- [ ] Imagens aparecem?
- [ ] Menu funciona?
- [ ] Formulário envia?
- [ ] Funciona no celular?

---

## 🆘 Problemas?

### Site não carrega
- Aguarde 5-10 minutos
- Verifique se os arquivos estão em `public_html`
- Limpe o cache do navegador (Ctrl + F5)

### Imagens não aparecem
- Verifique se a pasta `images` foi completamente enviada
- Confira os nomes dos arquivos (maiúsculas/minúsculas importam!)

### CSS não funciona
- Verifique se a pasta `css` foi enviada
- Limpe o cache do navegador

---

## 📞 Suporte KingHost

- ☎️ 0800 200 8300
- 💬 https://king.host/suporte
- ✉️ suporte@kinghost.com.br

---

## 🎓 Dica Extra

**Primeiro deploy?**
Use o **Método Automático** (script PowerShell) - é mais seguro e rápido!

---

**Tempo estimado:** 10-15 minutos
**Dificuldade:** ⭐⭐☆☆☆ (Fácil)

