# 🔗 Integração Frontend - Backend

Guia para integrar o backend com o frontend existente da Vila d'Ajuda.

## 1. Configurar CORS

O backend já está configurado para aceitar requisições do frontend. Certifique-se de que o `FRONTEND_URL` no `.env` corresponde à URL do seu frontend:

```env
FRONTEND_URL=http://localhost:5500
```

Para permitir múltiplas origens ou aceitar todas (apenas em desenvolvimento):
```env
FRONTEND_URL=*
```

## 2. Atualizar o JavaScript do Frontend

### Criar arquivo de configuração API

Crie um novo arquivo `js/api.js`:

```javascript
// Configuração da API
const API_BASE_URL = 'http://localhost:3000/api';

// Função auxiliar para fazer requisições
async function fetchAPI(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        }
    };
    
    // Adicionar token se existir
    const token = localStorage.getItem('authToken');
    if (token) {
        defaultOptions.headers['Authorization'] = `Bearer ${token}`;
    }
    
    const config = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...(options.headers || {})
        }
    };
    
    try {
        const response = await fetch(url, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.mensagem || data.erro || 'Erro na requisição');
        }
        
        return data;
    } catch (erro) {
        console.error('Erro na API:', erro);
        throw erro;
    }
}

// Funções específicas da API

// Chalés
async function listarChales() {
    return fetchAPI('/chales?ativo=true');
}

async function buscarChale(id) {
    return fetchAPI(`/chales/${id}`);
}

async function verificarDisponibilidade(chaleId, dataCheckin, dataCheckout) {
    return fetchAPI(`/chales/${chaleId}/disponibilidade?data_checkin=${dataCheckin}&data_checkout=${dataCheckout}`);
}

// Reservas
async function criarReserva(dados) {
    return fetchAPI('/reservas', {
        method: 'POST',
        body: JSON.stringify(dados)
    });
}

async function buscarChalesDisponiveis(dataCheckin, dataCheckout) {
    return fetchAPI(`/reservas/disponiveis?data_checkin=${dataCheckin}&data_checkout=${dataCheckout}`);
}

// Exportar funções
window.API = {
    listarChales,
    buscarChale,
    verificarDisponibilidade,
    criarReserva,
    buscarChalesDisponiveis
};
```

### Adicionar no HTML

No arquivo `index.html`, adicione antes do `script.js`:

```html
<!-- API Client -->
<script src="js/api.js"></script>
<script src="js/script.js"></script>
```

## 3. Atualizar o Formulário de Reserva

Modifique o `js/script.js` para usar a API real:

```javascript
// Formulário de Reserva Rápida
const formReserva = document.getElementById('formReserva');
if (formReserva) {
    formReserva.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(formReserva);
        const dataCheckin = formData.get('checkin');
        const dataCheckout = formData.get('checkout');
        
        try {
            // Buscar chalés disponíveis
            const resultado = await API.buscarChalesDisponiveis(dataCheckin, dataCheckout);
            
            if (resultado.chales.length === 0) {
                showMessage('Não há chalés disponíveis para o período selecionado.', 'error');
                return;
            }
            
            showMessage(`${resultado.chales.length} chalé(s) disponível(is)!`, 'success');
            
            // Preencher formulário completo
            const formCompleto = document.getElementById('formReservaCompleto');
            if (formCompleto) {
                formCompleto.querySelector('[name="checkin"]').value = dataCheckin;
                formCompleto.querySelector('[name="checkout"]').value = dataCheckout;
                formCompleto.querySelector('[name="adultos"]').value = formData.get('adultos');
                formCompleto.querySelector('[name="criancas"]').value = formData.get('criancas');
            }
            
            // Rolar para o formulário de reserva
            window.location.href = '#reserva';
            
        } catch (erro) {
            showMessage('Erro ao verificar disponibilidade: ' + erro.message, 'error');
        }
    });
}

// Formulário de Reserva Completo
const formReservaCompleto = document.getElementById('formReservaCompleto');
if (formReservaCompleto) {
    formReservaCompleto.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitButton = formReservaCompleto.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Enviando...';
        
        const formData = new FormData(formReservaCompleto);
        
        const dados = {
            chale_id: formData.get('chale') ? parseInt(formData.get('chale')) : null,
            nome_hospede: formData.get('nome'),
            email_hospede: formData.get('email'),
            telefone_hospede: formData.get('telefone'),
            data_checkin: formData.get('checkin'),
            data_checkout: formData.get('checkout'),
            num_adultos: parseInt(formData.get('adultos')),
            num_criancas: parseInt(formData.get('criancas')),
            mensagem: formData.get('mensagem') || ''
        };
        
        try {
            const resultado = await API.criarReserva(dados);
            
            showMessage('Reserva enviada com sucesso! Entraremos em contato em breve.', 'success');
            formReservaCompleto.reset();
            
        } catch (erro) {
            showMessage('Erro ao enviar reserva: ' + erro.message, 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    });
}
```

## 4. Carregar Chalés Dinamicamente (Opcional)

Se quiser carregar os chalés do banco de dados:

```javascript
// Carregar chalés ao carregar a página
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const resultado = await API.listarChales();
        renderizarChales(resultado.chales);
    } catch (erro) {
        console.error('Erro ao carregar chalés:', erro);
    }
});

function renderizarChales(chales) {
    const container = document.querySelector('.chales-grid');
    if (!container) return;
    
    // Limpar container (opcional)
    // container.innerHTML = '';
    
    // Você pode manter os chalés existentes ou substituir por dados do banco
    chales.forEach(chale => {
        const card = document.createElement('div');
        card.className = 'chale-card';
        
        card.innerHTML = `
            <div class="chale-image">
                <img src="${chale.imagens[0] || 'images/default.jpg'}" 
                     alt="${chale.nome}" loading="lazy">
            </div>
            <div class="chale-info">
                <h3>${chale.nome}</h3>
                <p>${chale.descricao}</p>
                <ul class="chale-amenities">
                    ${chale.amenidades.map(a => `<li>✓ ${a}</li>`).join('')}
                </ul>
                ${chale.preco_diaria ? `<p class="preco">R$ ${chale.preco_diaria}/noite</p>` : ''}
                <a href="#reserva" class="btn-chale">Reservar</a>
            </div>
        `;
        
        container.appendChild(card);
    });
}
```

## 5. Tratamento de Erros

Adicione feedback visual para os usuários:

```javascript
function showMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-${type}`;
    messageDiv.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#4a7c2a' : '#d32f2f'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => messageDiv.remove(), 300);
    }, 5000);
}
```

## 6. Adicionar Animações CSS

Adicione no `css/style.css`:

```css
@keyframes slideIn {
    from {
        transform: translateX(400px);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideOut {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(400px);
        opacity: 0;
    }
}
```

## 7. Testar a Integração

1. Inicie o backend:
```bash
cd backend
npm run dev
```

2. Abra o frontend (pode usar Live Server do VS Code ou similar)

3. Teste:
   - Verificar disponibilidade de chalés
   - Criar uma reserva
   - Verificar no console do navegador se não há erros CORS

## 🔐 Painel Administrativo (Futuro)

Para criar um painel administrativo, você precisará:

1. Criar uma página de login
2. Armazenar o token JWT no localStorage
3. Criar páginas para:
   - Listar/editar reservas
   - Gerenciar chalés
   - Ver estatísticas

Exemplo de login:

```javascript
async function fazerLogin(email, senha) {
    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, senha })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Salvar token
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            
            // Redirecionar para painel
            window.location.href = 'admin.html';
        } else {
            alert(data.mensagem || 'Erro ao fazer login');
        }
    } catch (erro) {
        console.error('Erro:', erro);
        alert('Erro ao conectar com o servidor');
    }
}
```

## 🚀 Próximos Passos

1. Implementar notificações por email quando houver nova reserva
2. Criar painel administrativo completo
3. Adicionar sistema de pagamento
4. Implementar calendário visual de disponibilidade
5. Adicionar fotos dos chalés no banco de dados

