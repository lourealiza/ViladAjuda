# 🚀 Deploy KingHost via Git - CONFIGURADO!

## ✅ DEPLOY AUTOMÁTICO ATIVADO!

Você configurou com sucesso a publicação via Git na KingHost! 🎉

---

## 📋 Configuração Atual

- **Hospedagem**: KingHost (viladajuda.com.br)
- **Repositório**: `git@github.com:lourealiza/ViladAjuda.git`
- **Branch sincronizada**: `master`
- **Diretório de deploy**: `/www/`
- **Deploy**: Automático a cada push!

---

## 🔄 Como Funciona

Sempre que você fizer **push** para a branch `master` no GitHub:

1. KingHost detecta a atualização automaticamente
2. Faz download do repositório
3. Sincroniza com a pasta `/www/` no FTP
4. Site atualizado em segundos!

**Você não precisa mais fazer upload manual de arquivos!** 🎉

---

## 💻 Workflow de Desenvolvimento

### Opção 1: Trabalhar direto na master (Mais Simples)

```bash
# Fazer alterações nos arquivos
git add .
git commit -m "sua mensagem"
git push origin master
```

✅ Site atualiza automaticamente na KingHost!

---

### Opção 2: Trabalhar na main e sincronizar (Recomendado)

```bash
# Trabalhar na branch main (desenvolvimento)
git checkout main

# Fazer suas alterações
git add .
git commit -m "sua mensagem"
git push origin main

# Quando estiver pronto para publicar:
git checkout master
git merge main
git push origin master

# Voltar para main
git checkout main
```

✅ Você desenvolve na `main` e publica na `master` quando quiser!

---

## 🌐 URLs do Seu Site

Após o deploy, seu site estará disponível em:

**URLs KingHost:**
- 🔗 http://viladajuda.web213.uni5.net/ (URL temporária)
- 🔗 http://viladajuda.com.br/ (se domínio estiver configurado)

**URL GitHub Pages (alternativa):**
- 🔗 https://lourealiza.github.io/ViladAjuda/

---

## ✅ Primeiro Deploy - AGORA!

A branch `master` foi criada e enviada para o GitHub agora mesmo.

**A KingHost já deve estar fazendo o deploy automaticamente!**

### Verificar se funcionou:

1. **Aguarde 1-2 minutos** (primeira sincronização)
2. **Acesse**: http://viladajuda.web213.uni5.net/
3. **Limpe o cache**: Ctrl + F5
4. **Celebre!** 🎉

---

## 🔧 Verificar Status do Deploy

Para verificar se o deploy está funcionando:

1. Acesse o **Painel KingHost**
2. Vá em **Git Webhook**
3. Veja os logs de sincronização
4. Confirme que não há erros

---

## 📁 Estrutura de Arquivos

A KingHost irá sincronizar estes arquivos para `/www/`:

```
/www/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── script.js
│   └── api.js
├── images/
│   └── (todas as imagens)
└── backend/
    └── (não será usado no deploy)
```

---

## 🎯 Atualizações Futuras

### Para atualizar o site:

```bash
# 1. Fazer alterações nos arquivos

# 2. Commit
git add .
git commit -m "Atualização: [descreva aqui]"

# 3. Push para master
git push origin master

# Pronto! Site atualiza automaticamente em ~1 minuto
```

---

## ⚠️ IMPORTANTE: Duas Branches

Agora você tem duas branches principais:

### 🔵 **main** (desenvolvimento)
- Para desenvolvimento e testes
- GitHub Pages pode usar esta (se configurar)
- Commits frequentes

### 🟢 **master** (produção)
- Conectada à KingHost
- Apenas código pronto e testado
- Atualiza o site ao vivo

---

## 🔄 Sincronizar main → master

Quando quiser publicar mudanças da `main` na `master`:

```bash
git checkout master
git merge main
git push origin master
git checkout main
```

Ou use um script:

```bash
# Criar arquivo: deploy.sh
#!/bin/bash
git checkout master
git merge main
git push origin master
git checkout main
echo "✅ Deploy realizado!"
```

---

## 🐛 Troubleshooting

### Site não atualizou
1. Verifique o painel Git Webhook na KingHost
2. Veja os logs de sincronização
3. Confirme que a branch é `master`
4. Limpe cache do navegador (Ctrl + F5)

### Erro de sincronização
1. Verifique as chaves SSH no GitHub
2. Confirme permissões do repositório
3. Veja logs detalhados na KingHost

### Arquivos faltando
1. Confirme que estão na raiz do repositório
2. Verifique .gitignore (se existe)
3. Faça push novamente

---

## 📊 Vantagens deste Setup

- ✅ **Deploy automático** - push e pronto!
- ✅ **Sem FTP manual** - nunca mais!
- ✅ **Versionamento** - todo histórico no Git
- ✅ **Rollback fácil** - volte versões antigas
- ✅ **Colaboração** - múltiplos devs podem trabalhar
- ✅ **Backup automático** - no GitHub

---

## 🎓 Próximos Passos

1. ✅ **Testar o site** - http://viladajuda.web213.uni5.net/
2. ✅ **Configurar EmailJS** - formulário funcional
3. ✅ **Google Analytics** - monitorar visitantes
4. ✅ **SSL/HTTPS** - certificado grátis na KingHost
5. ✅ **Domínio próprio** - viladajuda.com.br

---

## 📞 Suporte

**KingHost:**
- 📞 0800 200 8300
- 💬 https://king.host/suporte
- 📚 https://king.host/wiki/

**Git/GitHub:**
- 📚 Documentação do Git Webhook: https://king.host/wiki/base-de-conhecimento/git/

---

## 🎉 PARABÉNS!

Seu site agora tem **deploy automático profissional**!

**Faça um push e veja a mágica acontecer!** ✨

---

**Última sincronização**: Branch `master` criada e enviada
**Status**: ✅ Aguardando primeiro deploy da KingHost
**Próximo passo**: Acessar http://viladajuda.web213.uni5.net/

