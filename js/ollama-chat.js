/**
 * Chat com Ollama Qwen 3
 * Widget flutuante para assistente de IA
 */

const OllamaChat = {
    // Configurações
    config: {
        apiUrl: 'http://localhost:11434/api/generate',
        model: 'qwen:3b', // ou 'qwen2:7b' se tiver instalado
        systemPrompt: `Você é a Assistente Vila D'Ajuda, agente virtual do site dos Chalés Vila D'Ajuda, em Arraial d'Ajuda, Bahia.

SOBRE A VILA D'AJUDA:
Chalés individuais completos, em região tranquila, arborizada e próxima ao centro. Cada chalé tem quarto, sala, cozinha equipada, varanda térrea e ar-condicionado. A proposta é oferecer conforto, privacidade, autonomia e uma experiência mais autêntica que uma hospedagem tradicional.

LOCALIZAÇÃO:
- Endereço: Rua das Mangabeiras, 78, Arraial d'Ajuda, Bahia
- Centro de Arraial: ~7 minutos a pé
- Praia do Mucugê: ~12-15 minutos a pé
- Praia dos Pescadores: ~12-15 minutos a pé
- Região silenciosa, segura, próxima a mercados, farmácias, restaurantes e lojas

SUA FUNÇÃO:
- Atender visitantes interessados em hospedagem
- Responder dúvidas sobre chalés, localização e proposta
- Qualificar interessados e encaminhar para pré-reserva
- Transmitir confiança sem pressionar

TOM:
- Acolhedor, objetivo, simples e tranquilo
- Breve e direto (máximo 3-4 linhas por resposta)

PODE RESPONDER SOBRE:
✓ Localização e proximidade de praias/centro
✓ Estrutura geral dos chalés
✓ Proposta de hospedagem
✓ Perfil ideal de hóspede
✓ Funcionamento da pré-reserva

NÃO PODE RESPONDER (encaminhe para equipe):
✗ Valores e preços
✗ Disponibilidade de datas
✗ Formas de pagamento
✗ Política de cancelamento
✗ Check-in/Check-out
✗ Estacionamento, pets, café da manhã
✗ Regras específicas

PROCESSO DE QUALIFICAÇÃO:
Quando demonstrarem interesse real, peça:
1. Data de entrada
2. Data de saída
3. Quantidade de adultos
4. Quantidade de crianças (se houver)
5. Nome
6. WhatsApp
7. E-mail

IMPORTANTE:
- Nunca confirme reserva automaticamente
- Nunca peça CPF, RG, documentos ou dados de cartão no primeiro atendimento
- Incentive o preenchimento da ficha de pré-reserva
- Seja transparente quando não souber algo
- Contato WhatsApp para dúvidas não respondidas: +55 27 99851-3096

RESPOSTAS TRANSPARENTES:
Para dúvidas que não pode responder, use: "Essa informação precisa ser confirmada com a equipe para evitar qualquer erro. Posso encaminhar sua dúvida junto com a consulta de disponibilidade."

OBJETIVO FINAL:
Ajudar o visitante a entender se a Vila D'Ajuda combina com o tipo de estadia que procura e facilitar o próximo passo da reserva.`,
        temperature: 0.7,
        topK: 40,
        topP: 0.9,
        stream: true
    },

    // Estado da aplicação
    state: {
        isOpen: false,
        isLoading: false,
        messages: [],
        currentResponse: ''
    },

    // Elementos DOM
    elements: {},

    /**
     * Inicializar o chat
     */
    init() {
        this.createChatWidget();
        this.attachEventListeners();
        this.loadChatHistory();

        console.log('✅ Ollama Chat inicializado');
    },

    /**
     * Criar a estrutura HTML do widget
     */
    createChatWidget() {
        const container = document.createElement('div');
        container.id = 'ollama-chat-container';
        container.innerHTML = `
            <div id="ollama-chat-widget" class="ollama-chat-widget">
                <!-- Botão flutuante -->
                <button id="ollama-chat-toggle" class="ollama-chat-toggle" aria-label="Abrir chat com IA">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3 .97 4.29L2 22l6.18-1.46C9.25 21.13 10.56 21.5 12 21.5c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.41 0-2.73-.29-3.96-.82l-.28-.15-2.89.68.72-2.98-.19-.3C4.5 14.62 4 13.38 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z" fill="currentColor"/>
                    </svg>
                    <span class="ollama-chat-pulse"></span>
                </button>

                <!-- Janela de chat -->
                <div id="ollama-chat-window" class="ollama-chat-window" hidden>
                    <div class="ollama-chat-header">
                        <div class="ollama-chat-title">
                            <h3>Assistente Vila d'Ajuda</h3>
                            <span class="ollama-chat-status">Online</span>
                        </div>
                        <button id="ollama-chat-close" class="ollama-chat-close" aria-label="Fechar chat">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
                            </svg>
                        </button>
                    </div>

                    <div id="ollama-chat-messages" class="ollama-chat-messages">
                        <div class="ollama-chat-message ollama-chat-message-ai">
                            <div class="ollama-chat-message-content">
                                Olá! 👋 Sou o assistente da Vila d'Ajuda. Como posso ajudá-lo com informações sobre nossos chalés ou sua hospedagem?
                            </div>
                        </div>
                    </div>

                    <div id="ollama-chat-input-area" class="ollama-chat-input-area">
                        <form id="ollama-chat-form" class="ollama-chat-form">
                            <input 
                                id="ollama-chat-input" 
                                type="text" 
                                class="ollama-chat-input" 
                                placeholder="Digite sua pergunta..."
                                autocomplete="off"
                            >
                            <button type="submit" class="ollama-chat-send" aria-label="Enviar mensagem">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L4.13399899,1.16346276 C3.34915502,0.9 2.40734225,0.9 1.77946707,1.4 C0.994623095,2.0 0.837654326,3.0942284 1.15159189,3.88011269 L3.03521743,10.3211057 C3.03521743,10.4782031 3.19218622,10.6353005 3.50612381,10.6353005 L16.6915026,11.4207874 C16.6915026,11.4207874 17.1624089,11.4207874 17.1624089,12.0272903 C17.1624089,12.6315722 16.6915026,12.4744748 16.6915026,12.4744748 Z" fill="currentColor"/>
                                </svg>
                            </button>
                        </form>
                    </div>

                    <div class="ollama-chat-footer">
                        <small>Alimentado por Ollama Qwen</small>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(container);
        this.cacheElements();
    },

    /**
     * Cache dos elementos DOM
     */
    cacheElements() {
        this.elements = {
            widget: document.getElementById('ollama-chat-widget'),
            toggle: document.getElementById('ollama-chat-toggle'),
            window: document.getElementById('ollama-chat-window'),
            close: document.getElementById('ollama-chat-close'),
            messages: document.getElementById('ollama-chat-messages'),
            form: document.getElementById('ollama-chat-form'),
            input: document.getElementById('ollama-chat-input'),
            send: document.getElementById('ollama-chat-send'),
        };
    },

    /**
     * Adicionar event listeners
     */
    attachEventListeners() {
        this.elements.toggle.addEventListener('click', () => this.toggleChat());
        this.elements.close.addEventListener('click', () => this.closeChat());
        this.elements.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Fechar chat com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.state.isOpen) {
                this.closeChat();
            }
        });
    },

    /**
     * Toggle chat aberto/fechado
     */
    toggleChat() {
        if (this.state.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    },

    /**
     * Abrir chat
     */
    openChat() {
        this.state.isOpen = true;
        this.elements.window.hidden = false;
        this.elements.toggle.classList.add('ollama-chat-toggle-active');
        this.elements.input.focus();
        localStorage.setItem('ollamaChatOpen', 'true');
    },

    /**
     * Fechar chat
     */
    closeChat() {
        this.state.isOpen = false;
        this.elements.window.hidden = true;
        this.elements.toggle.classList.remove('ollama-chat-toggle-active');
        localStorage.setItem('ollamaChatOpen', 'false');
    },

    /**
     * Handle submit do formulário
     */
    async handleSubmit(e) {
        e.preventDefault();

        const message = this.elements.input.value.trim();
        if (!message) return;

        // Adicionar mensagem do usuário
        this.addMessage(message, 'user');
        this.elements.input.value = '';

        // Mostrar indicador de digitação
        this.state.isLoading = true;
        this.elements.send.disabled = true;

        try {
            await this.getAIResponse(message);
        } catch (error) {
            console.error('Erro ao obter resposta da IA:', error);
            this.addMessage(
                '❌ Desculpe, não consegui processar sua pergunta agora. Tente novamente em instantes.',
                'ai'
            );
        } finally {
            this.state.isLoading = false;
            this.elements.send.disabled = false;
            this.elements.input.focus();
        }
    },

    /**
     * Adicionar mensagem ao chat
     */
    addMessage(content, sender = 'user') {
        const messageEl = document.createElement('div');
        messageEl.className = `ollama-chat-message ollama-chat-message-${sender === 'ai' ? 'ai' : 'user'}`;

        const contentEl = document.createElement('div');
        contentEl.className = 'ollama-chat-message-content';
        contentEl.textContent = content;

        messageEl.appendChild(contentEl);
        this.elements.messages.appendChild(messageEl);

        // Scroll para a última mensagem
        this.elements.messages.scrollTop = this.elements.messages.scrollHeight;

        // Guardar no estado
        this.state.messages.push({ sender, content });
        this.saveChatHistory();
    },

    /**
     * Obter resposta da IA via Ollama
     */
    async getAIResponse(userMessage) {
        // Montar contexto das mensagens anteriores (últimas 5)
        const recentMessages = this.state.messages.slice(-10);
        let context = this.config.systemPrompt + '\n\n';

        recentMessages.forEach(msg => {
            if (msg.sender === 'user') {
                context += `Usuário: ${msg.content}\n`;
            } else {
                context += `Assistente: ${msg.content}\n`;
            }
        });

        context += `Usuário: ${userMessage}\nAssistente: `;

        const prompt = context;

        try {
            const response = await fetch(this.config.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: this.config.model,
                    prompt: prompt,
                    system: this.config.systemPrompt,
                    stream: this.config.stream,
                    temperature: this.config.temperature,
                    top_k: this.config.topK,
                    top_p: this.config.topP,
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Processar streaming de resposta
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullResponse = '';
            let messageEl = null;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n').filter(line => line.trim());

                for (const line of lines) {
                    try {
                        const data = JSON.parse(line);
                        if (data.response) {
                            fullResponse += data.response;

                            // Criar ou atualizar elemento da mensagem
                            if (!messageEl) {
                                messageEl = document.createElement('div');
                                messageEl.className = 'ollama-chat-message ollama-chat-message-ai ollama-chat-message-typing';
                                const contentEl = document.createElement('div');
                                contentEl.className = 'ollama-chat-message-content';
                                messageEl.appendChild(contentEl);
                                this.elements.messages.appendChild(messageEl);
                            }

                            // Atualizar conteúdo
                            messageEl.querySelector('.ollama-chat-message-content').textContent = fullResponse;
                            this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
                        }

                        // Verificar se acabou
                        if (data.done) {
                            if (messageEl) {
                                messageEl.classList.remove('ollama-chat-message-typing');
                            }
                            this.state.messages.push({ sender: 'ai', content: fullResponse });
                            this.saveChatHistory();
                        }
                    } catch (e) {
                        // Ignorar linhas inválidas
                    }
                }
            }

            if (!fullResponse) {
                throw new Error('Nenhuma resposta recebida do modelo');
            }

        } catch (error) {
            console.error('Erro na chamada ao Ollama:', error);

            // Verificar se é erro de conexão
            if (error instanceof TypeError && error.message.includes('fetch')) {
                this.addMessage(
                    '⚠️ Não consigo conectar ao assistente IA agora. Verifique se o Ollama está rodando em http://localhost:11434',
                    'ai'
                );
            } else {
                this.addMessage(
                    '❌ Ocorreu um erro ao processar sua pergunta. Tente novamente.',
                    'ai'
                );
            }
            throw error;
        }
    },

    /**
     * Salvar histórico de chat no localStorage
     */
    saveChatHistory() {
        localStorage.setItem('ollamaChatHistory', JSON.stringify(this.state.messages));
    },

    /**
     * Carregar histórico de chat do localStorage
     */
    loadChatHistory() {
        const saved = localStorage.getItem('ollamaChatHistory');
        if (saved) {
            try {
                this.state.messages = JSON.parse(saved);
                // Recarregar mensagens na UI (exceto a primeira)
                const messages = this.state.messages.slice(1);
                messages.forEach(msg => {
                    this.addMessage(msg.content, msg.sender === 'ai' ? 'ai' : 'user');
                });
            } catch (e) {
                console.error('Erro ao carregar histórico:', e);
            }
        }

        // Restaurar estado aberto/fechado
        const wasOpen = localStorage.getItem('ollamaChatOpen') === 'true';
        if (wasOpen) {
            this.openChat();
        }
    },

    /**
     * Limpar histórico de chat
     */
    clearHistory() {
        this.state.messages = [];
        localStorage.removeItem('ollamaChatHistory');
        this.elements.messages.innerHTML = `
            <div class="ollama-chat-message ollama-chat-message-ai">
                <div class="ollama-chat-message-content">
                    Histórico limpo. Como posso ajudá-lo?
                </div>
            </div>
        `;
    },

    /**
     * Configurar modelo customizado
     */
    setModel(modelName) {
        this.config.model = modelName;
        console.log(`✅ Modelo alterado para: ${modelName}`);
    },

    /**
     * Testar conexão com Ollama
     */
    async testConnection() {
        try {
            const response = await fetch(this.config.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: this.config.model,
                    prompt: 'Oi',
                    stream: false,
                })
            });

            if (response.ok) {
                console.log('✅ Ollama conectado com sucesso!');
                return true;
            }
        } catch (e) {
            console.error('❌ Erro ao conectar Ollama:', e);
        }
        return false;
    }
};

// Inicializar quando o DOM está pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => OllamaChat.init());
} else {
    OllamaChat.init();
}
