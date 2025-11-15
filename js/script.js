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

