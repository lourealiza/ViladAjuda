# 📧 Configurar EmailJS para Formulário de Reservas

## O que é EmailJS?

EmailJS permite enviar emails diretamente do navegador sem precisar de um servidor backend. É perfeito para sites estáticos na KingHost!

---

## 📋 Passo a Passo para Configurar

### 1. Criar Conta no EmailJS

1. Acesse: https://www.emailjs.com/
2. Clique em **"Sign Up"** (Cadastrar)
3. Use seu email ou faça login com Google/GitHub
4. Confirme seu email

---

### 2. Adicionar Serviço de Email

1. No painel do EmailJS, vá em **"Email Services"**
2. Clique em **"Add New Service"**
3. Escolha seu provedor de email:
   - **Gmail** (recomendado para teste)
   - **Outlook/Hotmail**
   - **Yahoo**
   - Outro provedor SMTP

#### Para Gmail:
1. Selecione "Gmail"
2. Clique em "Connect Account"
3. Faça login com sua conta Google
4. Autorize o EmailJS
5. Dê um nome ao serviço (ex: "vila_dajuda_gmail")
6. Anote o **Service ID** (ex: `service_abc123`)

---

### 3. Criar Template de Email

1. Vá em **"Email Templates"**
2. Clique em **"Create New Template"**
3. Configure o template:

#### Configurações do Template:

**Nome do Template:** `reserva_vila_dajuda`

**De (From):**
```
Nome: {{from_name}}
Email: {{from_email}}
```

**Para (To):**
```
Email: renata@viladajuda.com (ou seu email de contato)
Nome: {{to_name}}
```

**Assunto (Subject):**
```
Nova Reserva - Vila d'Ajuda | {{from_name}}
```

**Conteúdo (Content):**
```html
Olá Renata,

Você recebeu uma nova solicitação de reserva através do site Vila d'Ajuda!

📋 DADOS DO HÓSPEDE
Nome: {{from_name}}
Email: {{from_email}}
Telefone: {{phone}}

🏠 DETALHES DA RESERVA
Chalé Preferido: {{chale}}
Check-in: {{checkin}}
Check-out: {{checkout}}
Número de Adultos: {{adultos}}
Número de Crianças: {{criancas}}

💬 MENSAGEM
{{message}}

---
Esta mensagem foi enviada através do formulário de reserva do site http://viladajuda.web213.uni5.net/
```

4. Clique em **"Save"**
5. Anote o **Template ID** (ex: `template_xyz789`)

---

### 4. Obter Public Key

1. Vá em **"Account"** no menu
2. Encontre a seção **"General"** ou **"API Keys"**
3. Copie sua **Public Key** (ex: `abc123XYZ-456def`)

---

### 5. Atualizar o Código JavaScript

Abra o arquivo `js/script.js` e encontre esta seção (linhas 87-91):

```javascript
const EMAILJS_CONFIG = {
    serviceID: 'YOUR_SERVICE_ID',      // Substitua pelo seu Service ID
    templateID: 'YOUR_TEMPLATE_ID',    // Substitua pelo seu Template ID
    publicKey: 'YOUR_PUBLIC_KEY'        // Substitua pela sua Public Key
};
```

**Substitua pelos seus valores:**

```javascript
const EMAILJS_CONFIG = {
    serviceID: 'service_abc123',           // Seu Service ID
    templateID: 'template_xyz789',         // Seu Template ID
    publicKey: 'abc123XYZ-456def'          // Sua Public Key
};
```

---

### 6. Testar o Formulário

1. Salve o arquivo `script.js`
2. Faça upload para a KingHost
3. Acesse o site: http://viladajuda.web213.uni5.net/
4. Vá para a seção **"Reserve seu Chalé"**
5. Preencha o formulário
6. Clique em **"Enviar Reserva"**
7. Verifique se o email chegou!

---

## 🎯 Exemplo Completo de Configuração

```javascript
// EXEMPLO - Substitua pelos seus valores reais
const EMAILJS_CONFIG = {
    serviceID: 'service_5g7h9j2',
    templateID: 'template_k8l3m9p',
    publicKey: 'Xy4z_8Br5Qm2Lp9Nw'
};
```

---

## ✅ Checklist de Configuração

- [ ] Conta EmailJS criada
- [ ] Serviço de email conectado (Gmail, Outlook, etc.)
- [ ] Service ID copiado
- [ ] Template de email criado
- [ ] Template ID copiado
- [ ] Public Key copiada
- [ ] Valores atualizados no `script.js`
- [ ] Arquivo enviado para KingHost
- [ ] Formulário testado
- [ ] Email de teste recebido

---

## 🆓 Limites do Plano Gratuito

**EmailJS Gratuito:**
- ✅ 200 emails/mês
- ✅ Todos os recursos básicos
- ✅ Suporte por email

Para um site de chalés, 200 emails/mês é mais que suficiente no início!

---

## 🔧 Troubleshooting (Resolução de Problemas)

### Email não está enviando

1. **Verifique as credenciais:**
   - Service ID está correto?
   - Template ID está correto?
   - Public Key está correta?

2. **Verifique o console do navegador:**
   - Pressione F12
   - Vá na aba "Console"
   - Envie o formulário
   - Veja se há erros

3. **Verifique o template:**
   - Os campos `{{from_name}}`, `{{from_email}}`, etc. estão corretos?
   - O email de destino está configurado?

4. **Verifique spam:**
   - O email pode ter ido para a pasta de spam
   - Adicione o remetente como contato

### Erro 403

- Verifique se a Public Key está correta
- Verifique se o domínio está autorizado nas configurações do EmailJS

### Erro de CORS

- EmailJS resolve automaticamente problemas de CORS
- Se persistir, entre em contato com o suporte

---

## 📧 Fallback Automático

Se o EmailJS não estiver configurado, o formulário automaticamente abre o cliente de email padrão do usuário (Outlook, Gmail, etc.) com os dados preenchidos.

**Isso significa que o formulário sempre funcionará, mesmo sem configuração!**

---

## 🔐 Segurança

- ✅ **Public Key é segura**: pode ser exposta no código
- ✅ **Sem backend necessário**: tudo funciona no navegador
- ✅ **HTTPS não obrigatório**: funciona com HTTP
- ⚠️ **Limite de envios**: para evitar spam, EmailJS tem limite de envios

---

## 💡 Dicas Extras

### Email de Confirmação para o Hóspede

Você pode criar um segundo template para enviar confirmação automática ao hóspede que fez a reserva!

1. Crie outro template no EmailJS
2. Configure para enviar para `{{from_email}}`
3. No script.js, adicione uma segunda chamada `emailjs.send()`

### Notificação via WhatsApp

Além do email, você pode receber notificações no WhatsApp usando serviços como:
- **Twilio** (pago, mas tem trial gratuito)
- **Zapier** (conecta EmailJS com WhatsApp)

---

## 📞 Suporte EmailJS

- 📖 Documentação: https://www.emailjs.com/docs/
- 💬 Suporte: https://www.emailjs.com/docs/support/
- 🐛 Reportar bugs: https://github.com/emailjs/emailjs-sdk/issues

---

## 🎓 Links Úteis

- [Tutorial em Vídeo (YouTube)](https://www.youtube.com/results?search_query=emailjs+tutorial)
- [Documentação Oficial](https://www.emailjs.com/docs/)
- [Exemplos de Templates](https://www.emailjs.com/docs/examples/contact-form/)

---

**Tempo de Configuração:** 15-20 minutos  
**Dificuldade:** ⭐⭐☆☆☆ (Fácil)

**Criado em**: 15 de Novembro de 2025

