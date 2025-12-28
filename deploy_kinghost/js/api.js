// Configuração da API
// Usar URL de produção se estiver em produção, senão localhost
const API_BASE_URL = window.location.hostname === 'www.viladajuda.com.br' 
    ? 'https://www.viladajuda.com.br/api'
    : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? `${window.location.protocol}//${window.location.host}/api`
        : `${window.location.protocol}//${window.location.host}/api`);

// URL do Backend Node.js no Vercel
const API_VERCEL_BASE_URL = 'https://viladajuda.vercel.app/api';

/**
 * Função auxiliar para fazer requisições à API
 * Usa API Vercel para rotas avançadas (auth, admin) se configurado, senão usa API PHP
 */
async function fetchAPI(endpoint, options = {}) {
    // Rotas que devem usar API Vercel (Node.js) - apenas se API_VERCEL_BASE_URL estiver configurado
    const rotasVercel = ['/auth', '/admin', '/hospedes', '/conteudos', '/tracking', '/bloqueios', '/lgpd', '/consulta', '/chales', '/reservas', '/disponibilidade', '/tarifas'];
    
    // Determinar qual API usar baseado no endpoint
    const usarVercel = API_VERCEL_BASE_URL && rotasVercel.some(rota => endpoint.startsWith(rota));
    const baseURL = usarVercel ? API_VERCEL_BASE_URL : API_BASE_URL;
    
    const url = `${baseURL}${endpoint}`;
    
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
            // Se for erro 404 e estiver usando Vercel, tentar fallback para API PHP
            if (response.status === 404 && usarVercel && endpoint === '/consulta') {
                console.warn('⚠️ Rota /consulta não encontrada no Vercel, tentando API PHP...');
                // Tentar novamente com API PHP
                const urlPHP = `${API_BASE_URL}${endpoint}`;
                const responsePHP = await fetch(urlPHP, config);
                if (responsePHP.ok) {
                    const dataPHP = await responsePHP.json();
                    return dataPHP;
                }
            }
            
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
        
        // Se for erro de conexão/CORS e estiver usando Vercel, tentar fallback para API PHP
        const rotasComFallback = ['/consulta', '/disponibilidade', '/chales', '/reservas'];
        const deveFazerFallback = usarVercel && rotasComFallback.some(rota => endpoint.startsWith(rota));
        
        if ((erro.name === 'TypeError' && erro.message.includes('fetch')) || 
            erro.message.includes('CORS') || 
            erro.message.includes('Failed to fetch')) {
            
            if (deveFazerFallback) {
                console.warn(`⚠️ Falha ao acessar Vercel (${endpoint}), tentando API PHP...`);
                try {
                    const urlPHP = `${API_BASE_URL}${endpoint}`;
                    const responsePHP = await fetch(urlPHP, config);
                    if (responsePHP.ok) {
                        const dataPHP = await responsePHP.json();
                        return dataPHP;
                    } else {
                        // Se API PHP também falhar, tentar decodificar erro
                        const textPHP = await responsePHP.text();
                        try {
                            const dataErroPHP = JSON.parse(textPHP);
                            throw new Error(dataErroPHP.mensagem || dataErroPHP.erro || 'Erro na API PHP');
                        } catch {
                            throw new Error(`Erro ${responsePHP.status} na API PHP`);
                        }
                    }
                } catch (erroPHP) {
                    console.error('Erro ao tentar API PHP:', erroPHP);
                    // Se ambos falharem, lançar erro original
                    throw erro;
                }
            }
        }
        
        // Melhorar mensagens de erro de rede
        if (erro.name === 'TypeError' && erro.message.includes('fetch')) {
            const mensagemErro = `Não foi possível conectar ao servidor. Verifique se o backend está rodando em ${baseURL}`;
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
    const resposta = await fetchAPI('/chales?ativo=true');
    // A API retorna { total, chales }, mas precisamos apenas do array
    return resposta.chales || resposta || [];
}

/**
 * Busca um chalé específico por ID
 */
async function buscarChale(id) {
    const resposta = await fetchAPI(`/chales/${id}`);
    // A API retorna { chale }, então extraímos o objeto
    return resposta.chale || resposta;
}

/**
 * Verifica disponibilidade de um chalé específico
 */
async function verificarDisponibilidade(chaleId, dataCheckin, dataCheckout) {
    return fetchAPI(`/chales/${chaleId}/disponibilidade?data_checkin=${dataCheckin}&data_checkout=${dataCheckout}`);
}

// ==================== RESERVAS ====================

/**
 * Cria uma nova reserva (via /consulta)
 */
async function criarReserva(dados) {
    return fetchAPI('/consulta', {
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

/**
 * Busca calendário de disponibilidade para um mês
 * Com fallback automático para API PHP se Vercel falhar
 */
async function buscarCalendarioDisponibilidade(ano, mes, chaleId = null) {
    let url = `/disponibilidade/calendario?ano=${ano}&mes=${mes}`;
    if (chaleId) {
        url += `&chale_id=${chaleId}`;
    }
    
    try {
        return await fetchAPI(url);
    } catch (erro) {
        // Se falhar com Vercel, tentar API PHP diretamente
        if (erro.tipo === 'CONEXAO' || erro.message.includes('CORS') || erro.message.includes('Failed to fetch')) {
            console.warn('⚠️ Falha ao acessar Vercel, tentando API PHP...');
            const urlPHP = `${API_BASE_URL}${url}`;
            try {
                const response = await fetch(urlPHP, {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                if (response.ok) {
                    return await response.json();
                }
            } catch (erroPHP) {
                console.error('Erro ao tentar API PHP:', erroPHP);
            }
        }
        throw erro;
    }
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
    buscarCalendarioDisponibilidade,
    
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

