# 📱 Integração Socket.io - Notificações Real-time

## Status Atual
✅ **Backend**: Socket.io implementado e deployado em produção  
✅ **Frontend**: Pronto para integração  
⏳ **Admin Panel**: Aguardando integração  

## 🚀 Como Integrar no Frontend

### 1. Adicionar Script Socket.io no `index.html`

Antes da tag `</body>`, adicione:

```html
<!-- Socket.io Client -->
<script src="https://cdn.socket.io/4.7.2/socket.io.js"></script>

<!-- Arquivo de integração (veja SOCKETIO_INTEGRATION.html para código completo) -->
<script>
    const SOCKET_URL = 'https://backend-mjzdnzhdb-lourealizas-projects.vercel.app';
    const socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        auth: {
            token: localStorage.getItem('authToken') || null
        }
    });

    socket.on('connect', () => {
        console.log('✅ Conectado ao servidor de notificações', socket.id);
        const userId = localStorage.getItem('userId');
        if (userId) {
            socket.emit('registrar-usuario', { userId });
        }
    });

    socket.on('nova-notificacao', (data) => {
        console.log('🔔 Nova notificação:', data);
        // Mostrar notificação visual
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Vila d\'Ajuda', {
                body: data.notificacao.mensagem,
                icon: 'images/Logo.png'
            });
        }
    });
</script>
```

### 2. Adicionar Container de Notificações

```html
<!-- Antes de </body> -->
<div id="notificacoes-container" style="position: fixed; top: 20px; right: 20px; z-index: 9999;"></div>
```

### 3. Função JavaScript para Mostrar Toast

```javascript
function mostrarNotificacao(titulo, mensagem, tipo = 'info') {
    const container = document.getElementById('notificacoes-container');
    const div = document.createElement('div');
    div.style.cssText = `
        background: white;
        border-left: 4px solid #3498db;
        padding: 15px;
        margin-bottom: 10px;
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    `;
    div.innerHTML = `<strong>${titulo}</strong><br>${mensagem}`;
    container.appendChild(div);
    
    setTimeout(() => div.remove(), 5000);
}
```

## 📡 Tipos de Notificações Suportadas

| Tipo | Descrição | Evento |
|------|-----------|--------|
| `nova_reserva` | 📅 Novo agendamento | Cliente fez reserva |
| `confirmacao_pagamento` | 💳 Pagamento aprovado | Pagamento processado |
| `checkin_proximo` | 🔑 Check-in próximo | 24h antes do check-in |
| `avaliacao_recebida` | ⭐ Avaliação recebida | Hóspede deixou review |
| `alerta_sistema` | ⚠️ Alerta | Sistema precisa avisar admin |
| `disponibilidade_liberada` | ✅ Chalé disponível | Período foi liberado |
| `lembrete_checkout` | 🏠 Lembrete checkout | 1h antes do checkout |

## 🔒 Autenticação Socket.io

O Socket.io autentica usando JWT:

```javascript
// Token é enviado no handshake
const socket = io(SOCKET_URL, {
    auth: {
        token: localStorage.getItem('authToken')
    }
});
```

Se não tiver token, o servidor rejeitará conexões administrativas.

## 🎯 Eventos Disponíveis

### Eventos do Cliente (emit para servidor)

```javascript
// Registrar usuário para receber notificações
socket.emit('registrar-usuario', { userId: 123 });

// Marcar notificação como lida
socket.emit('marcar-como-lida', { notificacaoId: 456 });

// Obter notificações pendentes
socket.emit('obter-pendentes', {}, (notificacoes) => {
    console.log('Notificações pendentes:', notificacoes);
});
```

### Eventos do Servidor (listen)

```javascript
// Nova notificação real-time
socket.on('nova-notificacao', (data) => {
    console.log('Notificação:', data.notificacao);
});

// Notificações em lote
socket.on('notificacoes-em-lote', (dados) => {
    console.log('Lote de', dados.notificacoes.length, 'notificações');
});

// Confirmação de leitura
socket.on('notificacao-lida', (data) => {
    console.log('Notificação lida:', data.notificacaoId);
});
```

## 🧪 Como Testar Localmente

### 1. Iniciar servidor backend local
```bash
cd backend
npm start
```
Servidor rodará em: `http://localhost:3000`

### 2. Alterar URL local
```javascript
const SOCKET_URL = 'http://localhost:3000';
```

### 3. Abrir console do navegador
```javascript
// Você verá logs de conexão
socket.on('connect', () => console.log('Conectado!'));
```

## 📊 Integrações Recomendadas

### 1. **Admin Panel**
- Mostrar notificações real-time de novas reservas
- Alertas de pagamentos recebidos
- Avisos de período disponível

### 2. **Página Principal (index.html)**
- Badge com contador de notificações
- Toast notifications discretas
- Pedido de permissão para notificações browser

### 3. **App Mobile**
- Notificações push nativas
- Usar Firebase Cloud Messaging (FCM)
- Integrar com Socket.io para sincronização

## 🔗 URLs de Referência

- **Documentação Socket.io**: https://socket.io/docs/
- **Socket.io Client JS**: https://cdn.socket.io/4.7.2/socket.io.js
- **Backend Socket.io**: [backend/src/services/notificacaoService.js](../backend/src/services/notificacaoService.js)

## 💾 Exemplo Completo

```html
<!DOCTYPE html>
<html>
<head>
    <title>Vila d'Ajuda - Com Socket.io</title>
    <style>
        #notificacoes-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            width: 300px;
        }
        .notificacao-toast {
            background: white;
            border-left: 4px solid #3498db;
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            animation: slideIn 0.3s;
        }
        @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    </style>
</head>
<body>
    <h1>Seu Site Aqui</h1>
    
    <div id="notificacoes-container"></div>

    <script src="https://cdn.socket.io/4.7.2/socket.io.js"></script>
    <script>
        const socket = io('https://backend-mjzdnzhdb-lourealizas-projects.vercel.app', {
            auth: { token: localStorage.getItem('authToken') }
        });

        socket.on('nova-notificacao', (data) => {
            const container = document.getElementById('notificacoes-container');
            const div = document.createElement('div');
            div.className = 'notificacao-toast';
            div.textContent = data.notificacao.mensagem;
            container.appendChild(div);
            setTimeout(() => div.remove(), 5000);
        });
    </script>
</body>
</html>
```

## 🚨 Troubleshooting

| Problema | Solução |
|----------|---------|
| `Refusing to connect to ws://...` | Verificar CORS no backend |
| `Connection refused` | Backend está offline? Verificar `npm start` |
| `Token inválido` | Renovar token JWT em localStorage |
| `Notificação não recebida` | Usuário registrado? Verificar `socket.emit('registrar-usuario', ...)` |

---
**Data**: 15 Março 2026  
**Status**: ✅ Pronto para integração  
**Suporte**: Backend Socket.io em https://backend-mjzdnzhdb-lourealizas-projects.vercel.app
