// Configuração da API
// Usar URL de produção se estiver em produção, senão localhost
const API_BASE_URL = window.location.hostname === 'www.viladajuda.com.br' 
    ? 'https://www.viladajuda.com.br/api'
    : 'http://localhost:3000/api';

/**
 * Função auxiliar para fazer requisições à API
 */
async function fetchAPI(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        }
    };
    
    // Adicionar token se existir (para rotas administrativas)
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
        
        // Verificar se a resposta é JSON válido
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            throw new Error(`Resposta inválida do servidor: ${text.substring(0, 100)}`);
        }
        
        if (!response.ok) {
            // Incluir detalhes de validação se existirem
            let mensagemErro = data.mensagem || data.erro || 'Erro na requisição';
            
            if (data.detalhes && Array.isArray(data.detalhes)) {
                const detalhes = data.detalhes.map(d => `- ${d.campo}: ${d.mensagem}`).join('\n');
                mensagemErro += '\n\nDetalhes:\n' + detalhes;
            }
            
            // Adicionar código de status à mensagem
            const erroCompleto = new Error(mensagemErro);
            erroCompleto.status = response.status;
            erroCompleto.detalhes = data.detalhes;
            throw erroCompleto;
        }
        
        return data;
    } catch (erro) {
        console.error('Erro na API:', erro);
        console.error('URL tentada:', url);
        
        // Melhorar mensagens de erro de rede
        if (erro.name === 'TypeError' && erro.message.includes('fetch')) {
            const mensagemErro = `Não foi possível conectar ao servidor. Verifique se o backend está rodando em ${API_BASE_URL}`;
            const erroMelhorado = new Error(mensagemErro);
            erroMelhorado.tipo = 'CONEXAO';
            throw erroMelhorado;
        }
        
        throw erro;
    }
}

// ==================== CHALÉS ====================

/**
 * Lista todos os chalés ativos
 */
async function listarChales() {
    return fetchAPI('/chales?ativo=true');
}

/**
 * Busca um chalé específico por ID
 */
async function buscarChale(id) {
    return fetchAPI(`/chales/${id}`);
}

/**
 * Verifica disponibilidade de um chalé específico
 */
async function verificarDisponibilidade(chaleId, dataCheckin, dataCheckout) {
    return fetchAPI(`/chales/${chaleId}/disponibilidade?data_checkin=${dataCheckin}&data_checkout=${dataCheckout}`);
}

// ==================== RESERVAS ====================

/**
 * Cria uma nova reserva
 */
async function criarReserva(dados) {
    return fetchAPI('/reservas', {
        method: 'POST',
        body: JSON.stringify(dados)
    });
}

/**
 * Busca chalés disponíveis para um período
 */
async function buscarChalesDisponiveis(dataCheckin, dataCheckout) {
    return fetchAPI(`/reservas/disponiveis?data_checkin=${dataCheckin}&data_checkout=${dataCheckout}`);
}

// ==================== AUTENTICAÇÃO (para área admin futura) ====================

/**
 * Faz login no sistema (admin)
 */
async function login(email, senha) {
    const resultado = await fetchAPI('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, senha })
    });
    
    // Salvar token no localStorage
    if (resultado.token) {
        localStorage.setItem('authToken', resultado.token);
        localStorage.setItem('usuario', JSON.stringify(resultado.usuario));
    }
    
    return resultado;
}

/**
 * Faz logout
 */
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('usuario');
}

/**
 * Verifica se está logado
 */
function estaLogado() {
    return !!localStorage.getItem('authToken');
}

// ==================== FUNÇÕES AUXILIARES ====================

/**
 * Calcula o número de noites entre duas datas
 */
function calcularNoites(dataCheckin, dataCheckout) {
    const checkin = new Date(dataCheckin);
    const checkout = new Date(dataCheckout);
    const diferencaMs = checkout - checkin;
    return Math.ceil(diferencaMs / (1000 * 60 * 60 * 24));
}

/**
 * Formata data para exibição (DD/MM/YYYY)
 */
function formatarData(dataStr) {
    const data = new Date(dataStr + 'T00:00:00');
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

/**
 * Formata valor monetário
 */
function formatarValor(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

// ==================== AVALIAÇÕES ====================

/**
 * Busca avaliações para exibir na homepage
 */
async function buscarAvaliacoesHomepage(limite = 6) {
    return fetchAPI(`/avaliacoes/homepage?limite=${limite}`);
}

/**
 * Busca estatísticas de avaliações
 */
async function buscarEstatisticasAvaliacoes() {
    return fetchAPI('/avaliacoes/estatisticas');
}

// Exportar todas as funções para uso global
window.API = {
    // Função base
    fetchAPI,
    
    // Chalés
    listarChales,
    buscarChale,
    verificarDisponibilidade,
    
    // Reservas
    criarReserva,
    buscarChalesDisponiveis,
    
    // Avaliações
    buscarAvaliacoesHomepage,
    buscarEstatisticasAvaliacoes,
    
    // Autenticação
    login,
    logout,
    estaLogado,
    
    // Auxiliares
    calcularNoites,
    formatarData,
    formatarValor
};

console.log('✅ API Client carregado com sucesso!');
console.log('📡 Backend URL:', API_BASE_URL);

