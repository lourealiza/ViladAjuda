# Diagnóstico e Correção - GitHub Pages 404

## Problema Atual
A URL `https://lourealiza.github.io/ViladAjuda/` está retornando erro 404.

## Causas Possíveis e Soluções

### 1. GitHub Pages não está ativado
**Como verificar:**
1. Acesse: https://github.com/lourealiza/ViladAjuda
2. Clique em **Settings** (Configurações)
3. No menu lateral, clique em **Pages**
4. Verifique se está configurado assim:
   - Source: Deploy from a branch
   - Branch: main
   - Folder: / (root)

**Se não estiver ativado:**
- Selecione a branch `main` e a pasta `/ (root)`
- Clique em **Save**
- Aguarde 3-5 minutos

### 2. O repositório não existe ou tem nome diferente
**Como verificar:**
1. Acesse: https://github.com/lourealiza/ViladAjuda
2. Se der erro 404, o repositório não existe ou o nome está errado

**Soluções:**
- Verifique se o nome do repositório está correto (case sensitive)
- Se o repositório não existe, crie um novo:
  ```bash
  # No GitHub, crie um novo repositório chamado "ViladAjuda"
  # Depois execute no terminal:
  git remote remove origin
  git remote add origin https://github.com/lourealiza/ViladAjuda.git
  git push -u origin main
  ```

### 3. Arquivo index.html não está na raiz
**Como verificar:**
1. Acesse: https://github.com/lourealiza/ViladAjuda
2. Verifique se o arquivo `index.html` está visível na raiz do repositório

**Se não estiver:**
```bash
# Certifique-se de que index.html está na raiz do projeto
# Depois faça commit e push:
git add index.html
git commit -m "Adiciona index.html na raiz"
git push origin main
```

### 4. Branch incorreta
**Como verificar:**
```bash
git branch
```

**Se não estiver em 'main':**
```bash
git checkout main
# ou criar a branch main:
git checkout -b main
git push -u origin main
```

### 5. Arquivos não foram enviados ao GitHub
**Como verificar:**
```bash
git status
```

**Se houver arquivos não comitados:**
```bash
git add .
git commit -m "Adiciona todos os arquivos do site"
git push origin main
```

## Checklist Completo

- [ ] 1. Repositório existe no GitHub em: https://github.com/lourealiza/ViladAjuda
- [ ] 2. Arquivo `index.html` está na raiz do repositório
- [ ] 3. GitHub Pages está ativado em Settings > Pages
- [ ] 4. Branch configurada é `main`
- [ ] 5. Folder configurada é `/ (root)`
- [ ] 6. Aguardou 3-5 minutos após ativar/fazer push
- [ ] 7. Limpou o cache do navegador (Ctrl + Shift + R)

## Comando Rápido de Verificação

Execute este comando para verificar o status:
```bash
git log --oneline -5
git remote -v
git branch
```

## Se nada funcionar

1. **Delete o repositório no GitHub** (se existir)
2. **Crie um novo repositório**:
   - Nome: `ViladAjuda`
   - Público
   - Não inicialize com README
   
3. **Execute estes comandos**:
```bash
git remote remove origin
git remote add origin https://github.com/lourealiza/ViladAjuda.git
git branch -M main
git push -u origin main
```

4. **Ative o GitHub Pages**:
   - Settings > Pages
   - Source: main
   - Folder: / (root)
   - Save

5. **Aguarde 3-5 minutos**

6. **Acesse**: https://lourealiza.github.io/ViladAjuda/

## URL Correta do Site
Após configurado, o site estará disponível em:
`https://lourealiza.github.io/ViladAjuda/`

## Contato de Suporte
Se o erro persistir após seguir todos os passos, pode ser um problema temporário do GitHub. Aguarde alguns minutos e tente novamente.

