// Verificar Black Friday e mostrar banner
function verificarBlackFriday() {
    // Verificar se há parâmetro na URL para forçar exibição (para testes)
    const urlParams = new URLSearchParams(window.location.search);
    const forcarBlackFriday = urlParams.get('blackfriday') === 'true';
    const esconderBlackFriday = urlParams.get('blackfriday') === 'false';
    
    const hoje = new Date();
    const mes = hoje.getMonth() + 1; // 1-12
    const dia = hoje.getDate();
    const ano = hoje.getFullYear();
    
    // Banner aparece sempre até 28 de novembro, depois para de aparecer
    // Data limite: 29 de novembro (não mostra mais)
    const dataLimite = new Date(ano, 10, 29); // 29 de novembro (mês 10 = novembro, pois começa em 0)
    const isAntesDaDataLimite = hoje < dataLimite;
    
    // Black Friday: mostrar sempre até 28 de novembro, ou se forçar via URL
    const isBlackFridayPeriod = (isAntesDaDataLimite || forcarBlackFriday) && !esconderBlackFriday;
    
    if (isBlackFridayPeriod) {
        const banner = document.getElementById('blackFridayBanner');
        if (banner) {
            banner.style.display = 'block';
            document.body.classList.add('has-black-friday-banner');
        }
    }
}

// Executar verificação ao carregar a página
verificarBlackFriday();

// Menu Mobile
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}

// Fechar menu ao clicar em um link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// FAQ Accordion
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Fechar todos os outros itens
        faqItems.forEach(otherItem => {
            if (otherItem !== item) {
                otherItem.classList.remove('active');
            }
        });
        
        // Toggle do item atual
        item.classList.toggle('active', !isActive);
    });
});

// Formulário de Reserva Rápida
const formReserva = document.getElementById('formReserva');
if (formReserva) {
    formReserva.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(formReserva);
        const dataCheckin = formData.get('checkin');
        const dataCheckout = formData.get('checkout');
        const adultos = formData.get('adultos');
        const criancas = formData.get('criancas');
        
        // Validação básica
        if (!dataCheckin || !dataCheckout) {
            showMessage('Por favor, selecione as datas de check-in e check-out', 'error');
            return;
        }
        
        try {
            // Buscar chalés disponíveis na API
            showMessage('Verificando disponibilidade...', 'info');
            
            const resultado = await API.buscarChalesDisponiveis(dataCheckin, dataCheckout);
            
            if (resultado.chales.length === 0) {
                showMessage('😔 Não há chalés disponíveis para o período selecionado. Tente outras datas.', 'error');
                return;
            }
            
            const noites = API.calcularNoites(dataCheckin, dataCheckout);
            showMessage(`✅ ${resultado.chales.length} chalé(s) disponível(is) para ${noites} noite(s)!`, 'success');
            
            // Preencher formulário completo
            const formCompleto = document.getElementById('formReservaCompleto');
            if (formCompleto) {
                formCompleto.querySelector('[name="checkin"]').value = dataCheckin;
                formCompleto.querySelector('[name="checkout"]').value = dataCheckout;
                formCompleto.querySelector('[name="adultos"]').value = adultos;
                formCompleto.querySelector('[name="criancas"]').value = criancas;
                
                // Atualizar opções de chalés disponíveis
                const selectChale = formCompleto.querySelector('[name="chale"]');
                if (selectChale) {
                    // Limpar opções existentes exceto "Qualquer chalé"
                    selectChale.innerHTML = '<option value="">Qualquer chalé</option>';
                    
                    // Adicionar chalés disponíveis
                    resultado.chales.forEach(chale => {
                        const option = document.createElement('option');
                        option.value = chale.id;
                        option.textContent = `${chale.nome} - ${API.formatarValor(chale.preco_diaria)}/noite`;
                        selectChale.appendChild(option);
                    });
                }
            }
            
            // Rolar para o formulário de reserva
            setTimeout(() => {
                window.location.href = '#reserva';
            }, 1000);
            
        } catch (erro) {
            console.error('Erro ao verificar disponibilidade:', erro);
            showMessage('❌ Erro ao verificar disponibilidade: ' + erro.message, 'error');
        }
    });
}

// Configuração EmailJS
// IMPORTANTE: Configure suas credenciais do EmailJS em https://www.emailjs.com/
// Substitua os valores abaixo após criar sua conta e configurar o serviço
const EMAILJS_CONFIG = {
    serviceID: 'YOUR_SERVICE_ID',      // Substitua pelo seu Service ID
    templateID: 'YOUR_TEMPLATE_ID',    // Substitua pelo seu Template ID
    publicKey: 'YOUR_PUBLIC_KEY'        // Substitua pela sua Public Key
};

// Inicializar EmailJS (será inicializado quando a página carregar)
if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_CONFIG.publicKey);
}

// Função para mostrar mensagem de sucesso/erro/info
function showMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-${type}`;
    
    // Cores diferentes para cada tipo
    let bgColor;
    switch(type) {
        case 'success':
            bgColor = '#4a7c2a';
            break;
        case 'error':
            bgColor = '#d32f2f';
            break;
        case 'info':
            bgColor = '#1976d2';
            break;
        default:
            bgColor = '#4a7c2a';
    }
    
    messageDiv.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 400px;
        line-height: 1.5;
    `;
    
    // Permitir HTML na mensagem
    messageDiv.innerHTML = message;
    document.body.appendChild(messageDiv);
    
    // Duração maior para mensagens de sucesso com mais informações
    const duration = type === 'success' ? 8000 : 5000;
    
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => messageDiv.remove(), 300);
    }, duration);
}

// Formulário de Reserva Completo
const formReservaCompleto = document.getElementById('formReservaCompleto');
if (formReservaCompleto) {
    formReservaCompleto.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitButton = formReservaCompleto.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Enviando reserva...';
        
        const formData = new FormData(formReservaCompleto);
        
        // Preparar dados para enviar à API
        const dados = {
            chale_id: formData.get('chale') ? parseInt(formData.get('chale')) : null,
            nome_hospede: formData.get('nome'),
            email_hospede: formData.get('email'),
            telefone_hospede: formData.get('telefone'),
            data_checkin: formData.get('checkin'),
            data_checkout: formData.get('checkout'),
            num_adultos: parseInt(formData.get('adultos')),
            num_criancas: parseInt(formData.get('criancas')) || 0,
            mensagem: formData.get('mensagem') || ''
        };
        
        try {
            // Enviar reserva para a API
            const resultado = await API.criarReserva(dados);
            
            // Calcular informações para mostrar ao usuário
            const noites = API.calcularNoites(dados.data_checkin, dados.data_checkout);
            const checkinFormatado = API.formatarData(dados.data_checkin);
            const checkoutFormatado = API.formatarData(dados.data_checkout);
            
            let mensagemSucesso = `✅ Reserva enviada com sucesso!<br><br>`;
            mensagemSucesso += `📅 ${checkinFormatado} até ${checkoutFormatado} (${noites} noite${noites > 1 ? 's' : ''})<br>`;
            
            if (resultado.reserva.valor_total) {
                mensagemSucesso += `💰 Valor: ${API.formatarValor(resultado.reserva.valor_total)}<br>`;
            }
            
            mensagemSucesso += `<br>📧 Entraremos em contato em breve no email: ${dados.email_hospede}`;
            
            showMessage(mensagemSucesso, 'success');
            
            // Limpar formulário
            formReservaCompleto.reset();
            
            // Scroll para o topo
            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 2000);
            
        } catch (erro) {
            console.error('Erro ao criar reserva:', erro);
            
            let mensagemErro = 'Erro ao enviar reserva: ' + erro.message;
            
            // Mensagens de erro mais amigáveis
            if (erro.message.includes('indisponível')) {
                mensagemErro = '😔 O chalé selecionado não está disponível para este período. Por favor, escolha outras datas.';
            } else if (erro.message.includes('capacidade')) {
                mensagemErro = '⚠️ ' + erro.message;
            } else if (erro.message.includes('inválido')) {
                mensagemErro = '⚠️ Por favor, verifique os dados informados.';
            }
            
            showMessage(mensagemErro, 'error');
            
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    });
}

// Header scroll effect
let lastScroll = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
    } else {
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }
    
    lastScroll = currentScroll;
});

// Carregar avaliações do Google Business
async function carregarAvaliacoes() {
    try {
        const container = document.getElementById('avaliacoesGrid');
        const mediaRating = document.getElementById('mediaRating');
        const totalAvaliacoes = document.getElementById('totalAvaliacoes');

        if (!container) return;

        // Mostrar loading
        container.innerHTML = '<div class="avaliacao-loading">Carregando avaliações...</div>';

        // Buscar avaliações e estatísticas
        const resultado = await API.buscarAvaliacoesHomepage(6);
        
        // A API retorna { avaliacoes: [...], estatisticas: {...} }
        const avaliacoes = resultado.avaliacoes || resultado;
        const estatisticas = resultado.estatisticas || await API.buscarEstatisticasAvaliacoes();

        // Atualizar estatísticas
        if (estatisticas && mediaRating && totalAvaliacoes) {
            mediaRating.textContent = estatisticas.media ? estatisticas.media.toFixed(1) : '5.0';
            totalAvaliacoes.textContent = `${estatisticas.total || avaliacoes.length} avaliações`;
        }

        // Renderizar avaliações
        if (avaliacoes && Array.isArray(avaliacoes) && avaliacoes.length > 0) {
            container.innerHTML = avaliacoes.map(avaliacao => `
                <div class="avaliacao-card">
                    <div class="avaliacao-header">
                        <div class="avaliacao-autor">
                            ${avaliacao.foto_autor 
                                ? `<img src="${avaliacao.foto_autor}" alt="${avaliacao.nome_autor}" class="avaliacao-foto">`
                                : `<div class="avaliacao-foto-placeholder">${avaliacao.nome_autor.charAt(0).toUpperCase()}</div>`
                            }
                            <div class="avaliacao-info">
                                <h4>${avaliacao.nome_autor}</h4>
                                ${avaliacao.data_avaliacao 
                                    ? `<span class="avaliacao-data">${formatarDataAvaliacao(avaliacao.data_avaliacao)}</span>`
                                    : ''
                                }
                            </div>
                        </div>
                        <div class="avaliacao-rating">
                            ${gerarEstrelas(avaliacao.rating)}
                        </div>
                    </div>
                    ${avaliacao.texto 
                        ? `<p class="avaliacao-texto">${avaliacao.texto}</p>`
                        : ''
                    }
                    ${avaliacao.origem === 'google_business' 
                        ? `<span class="avaliacao-badge">Google</span>`
                        : ''
                    }
                </div>
            `).join('');
        } else {
            container.innerHTML = '<div class="avaliacao-empty">Nenhuma avaliação disponível no momento.</div>';
        }
    } catch (error) {
        console.error('Erro ao carregar avaliações:', error);
        const container = document.getElementById('avaliacoesGrid');
        if (container) {
            container.innerHTML = '<div class="avaliacao-error">Não foi possível carregar as avaliações. Tente novamente mais tarde.</div>';
        }
    }
}

// Gerar estrelas HTML
function gerarEstrelas(rating) {
    let html = '<div class="estrelas">';
    for (let i = 1; i <= 5; i++) {
        html += `<span class="estrela ${i <= rating ? 'preenchida' : 'vazia'}">★</span>`;
    }
    html += '</div>';
    return html;
}

// Formatar data para avaliações
function formatarDataAvaliacao(dataString) {
    if (!dataString) return '';
    const data = new Date(dataString);
    const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    return `${data.getDate()} ${meses[data.getMonth()]} ${data.getFullYear()}`;
}

// Carregar avaliações quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se a seção de avaliações existe
    if (document.getElementById('avaliacoes')) {
        carregarAvaliacoes();
    }
});

// Definir data mínima para inputs de data (hoje)
const today = new Date().toISOString().split('T')[0];
document.querySelectorAll('input[type="date"]').forEach(input => {
    input.setAttribute('min', today);
});

// Animação ao scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observar elementos para animação
document.querySelectorAll('.chale-card, .feature-item, .galeria-item, .proximidade-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Calendário de Disponibilidade
let calendarioMesAtual = new Date().getMonth() + 1;
let calendarioAnoAtual = new Date().getFullYear();

async function carregarCalendario() {
    const container = document.getElementById('calendarioContainer');
    if (!container) return;
    
    try {
        container.innerHTML = '<div class="calendario-loading">Carregando calendário...</div>';
        
        // Carregar 2 meses: atual e próximo
        const meses = [];
        for (let i = 0; i < 2; i++) {
            const mes = calendarioMesAtual + i;
            const ano = calendarioAnoAtual;
            let mesAjustado = mes;
            let anoAjustado = ano;
            
            if (mesAjustado > 12) {
                mesAjustado -= 12;
                anoAjustado += 1;
            }
            
            meses.push({ mes: mesAjustado, ano: anoAjustado });
        }
        
        const promessas = meses.map(({ mes, ano }) => 
            API.buscarCalendarioDisponibilidade(ano, mes)
        );
        
        const resultados = await Promise.all(promessas);
        
        let html = '<div class="calendario-meses">';
        
        resultados.forEach((resultado, index) => {
            if (!resultado || !resultado.calendario) {
                console.error('Resultado inválido:', resultado);
                return;
            }
            const { mes, ano, calendario } = resultado;
            html += renderizarMes(mes, ano, calendario, index === 0);
        });
        
        html += '</div>';
        container.innerHTML = html;
        
    } catch (erro) {
        console.error('Erro ao carregar calendário:', erro);
        let mensagemErro = 'Erro ao carregar calendário.';
        
        if (erro.tipo === 'CONEXAO') {
            mensagemErro = 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.';
        } else if (erro.message) {
            mensagemErro = erro.message;
        }
        
        container.innerHTML = `<div class="calendario-loading" style="color: #d32f2f;">${mensagemErro}</div>`;
    }
}

function renderizarMes(mes, ano, diasCalendario, isPrimeiroMes) {
    const nomesMeses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const hoje = new Date();
    const hojeStr = hoje.toISOString().split('T')[0];
    
    // Primeiro dia do mês
    const primeiroDia = new Date(ano, mes - 1, 1);
    const diaSemanaInicio = primeiroDia.getDay();
    
    let html = `
        <div class="calendario-mes">
            <div class="calendario-mes-header">
                <h3 class="calendario-mes-title">${nomesMeses[mes - 1]} ${ano}</h3>
                ${isPrimeiroMes ? `
                    <div class="calendario-nav">
                        <button class="calendario-nav-btn" onclick="calendarioMesAnterior()" ${calendarioMesAtual === new Date().getMonth() + 1 && calendarioAnoAtual === new Date().getFullYear() ? 'disabled' : ''}>‹</button>
                        <button class="calendario-nav-btn" onclick="calendarioMesProximo()">›</button>
                    </div>
                ` : ''}
            </div>
            <div class="calendario-dias-semana">
                ${diasSemana.map(dia => `<div class="calendario-dia-semana">${dia}</div>`).join('')}
            </div>
            <div class="calendario-dias">
    `;
    
    // Espaços vazios antes do primeiro dia
    for (let i = 0; i < diaSemanaInicio; i++) {
        html += '<div class="calendario-dia vazio"></div>';
    }
    
    // Dias do mês
    if (!diasCalendario || !Array.isArray(diasCalendario)) {
        console.error('Calendário inválido:', diasCalendario);
        return '<div class="calendario-loading">Erro ao processar calendário</div>';
    }
    
    diasCalendario.forEach(diaInfo => {
        if (!diaInfo) return;
        
        const { data, dia, disponivel, reservado, bloqueado } = diaInfo;
        const isHoje = data === hojeStr;
        
        let classes = 'calendario-dia';
        if (disponivel && !reservado && !bloqueado) {
            classes += ' disponivel';
        } else if (reservado) {
            classes += ' reservado';
        } else if (bloqueado) {
            classes += ' bloqueado';
        }
        
        if (isHoje) {
            classes += ' hoje';
        }
        
        html += `<div class="${classes}" data-data="${data}" title="${data}">${dia}</div>`;
    });
    
    html += `
            </div>
        </div>
    `;
    
    return html;
}

function calendarioMesAnterior() {
    calendarioMesAtual--;
    if (calendarioMesAtual < 1) {
        calendarioMesAtual = 12;
        calendarioAnoAtual--;
    }
    carregarCalendario();
}

function calendarioMesProximo() {
    calendarioMesAtual++;
    if (calendarioMesAtual > 12) {
        calendarioMesAtual = 1;
        calendarioAnoAtual++;
    }
    carregarCalendario();
}

// Carregar calendário quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('calendarioContainer')) {
        // Aguardar um pouco para garantir que a API está pronta
        setTimeout(() => {
            carregarCalendario();
        }, 500);
    }
});

// Lazy loading para imagens
if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
        img.addEventListener('load', function() {
            this.classList.add('loaded');
        });
    });
} else {
    // Fallback para navegadores que não suportam lazy loading nativo
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
    document.body.appendChild(script);
}

