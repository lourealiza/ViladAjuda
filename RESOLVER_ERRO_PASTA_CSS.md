# 🔧 Resolver Erro: "550 css: Permission denied"

## ❌ Problema
O FTP está tentando criar a pasta `css/` mas não tem permissão, mesmo que a pasta já exista.

## 🔍 Diagnóstico

O problema pode ser que:
1. O usuário FTP está logando em um diretório diferente do SSH
2. O caminho `server-dir: www/` não está correto
3. As pastas foram criadas em um lugar, mas o FTP está tentando criar em outro

## ✅ Soluções

### **Solução 1: Verificar Diretório do FTP**

O usuário FTP pode estar logando em um diretório diferente. Verifique:

1. **Conecte via FTP** (use FileZilla ou similar)
2. **Veja qual é o diretório inicial** quando conecta
3. **Verifique se existe `www/` nesse diretório**

### **Solução 2: Ajustar server-dir no Workflow**

Dependendo de onde o FTP loga, o `server-dir` pode precisar ser:

**Opção A**: Se o FTP loga na raiz do usuário:
```yaml
server-dir: www/
```

**Opção B**: Se o FTP loga em `public_html/`:
```yaml
server-dir: ./
```

**Opção C**: Se o FTP loga em outro lugar:
```yaml
server-dir: /home/viladajuda01/www/
```

### **Solução 3: Criar Pastas no Diretório Correto**

Se o FTP loga em um diretório diferente, crie as pastas lá:

```bash
ssh viladajuda01@www.viladajuda.com.br

# Verificar onde você está
pwd

# Verificar estrutura
ls -la ~/
ls -la ~/www/
ls -la ~/public_html/

# Criar pastas no diretório correto (ajuste conforme necessário)
cd ~/www  # ou ~/public_html ou onde o FTP loga
mkdir -p css js images api
chmod 755 css js images api
```

### **Solução 4: Usar Deploy Manual via SSH**

Se o FTP continuar dando problema, use deploy manual:

```bash
ssh viladajuda01@www.viladajuda.com.br "cd ~ && mkdir -p temp-vila && cd temp-vila && git clone https://github.com/lourealiza/ViladAjuda.git . && cp -f index.html ~/www/index.html && cp -f obrigado.html ~/www/obrigado.html && cp -f admin.html ~/www/admin.html && cp -rf css ~/www/ && cp -rf js ~/www/ && cp -rf images ~/www/ && cp -rf api ~/www/ && cd ~ && rm -rf temp-vila && echo '✅ Deploy concluído!'"
```

---

## 🔍 Como Descobrir o Diretório Correto

### **1. Via SSH:**
```bash
ssh viladajuda01@www.viladajuda.com.br
pwd  # Ver onde você está
ls -la  # Ver estrutura
```

### **2. Via FTP:**
- Conecte com FileZilla ou similar
- Veja qual diretório aparece quando conecta
- Navegue até encontrar `www/` ou `public_html/`

### **3. Verificar no Painel KingHost:**
- Acesse o painel da KingHost
- Veja a configuração FTP
- Verifique o diretório home do usuário

---

## 📋 Checklist

- [ ] Verificou onde o FTP loga (diretório inicial)
- [ ] Verificou onde as pastas foram criadas via SSH
- [ ] Ajustou `server-dir` no workflow se necessário
- [ ] Criou pastas no diretório correto do FTP
- [ ] Testou deploy novamente

---

## 🆘 Se Nada Funcionar

Use deploy manual via SSH (solução mais confiável):
- Não depende de permissões FTP
- Funciona sempre
- Pode ser automatizado com script

