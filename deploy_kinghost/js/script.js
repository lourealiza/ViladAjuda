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
    formReserva.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(formReserva);
        const data = {
            checkin: formData.get('checkin'),
            checkout: formData.get('checkout'),
            adultos: formData.get('adultos'),
            criancas: formData.get('criancas')
        };
        
        // Aqui você pode adicionar lógica para verificar disponibilidade
        // Por enquanto, apenas redireciona para a seção de reserva
        window.location.href = '#reserva';
        
        // Preencher o formulário completo com os dados
        const formCompleto = document.getElementById('formReservaCompleto');
        if (formCompleto) {
            formCompleto.querySelector('[name="checkin"]').value = data.checkin;
            formCompleto.querySelector('[name="checkout"]').value = data.checkout;
            formCompleto.querySelector('[name="adultos"]').value = data.adultos;
            formCompleto.querySelector('[name="criancas"]').value = data.criancas;
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

// Função para mostrar mensagem de sucesso/erro
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
        const data = {
            nome: formData.get('nome'),
            email: formData.get('email'),
            telefone: formData.get('telefone'),
            chale: formData.get('chale') || 'Qualquer',
            checkin: formData.get('checkin'),
            checkout: formData.get('checkout'),
            adultos: formData.get('adultos'),
            criancas: formData.get('criancas') || '0',
            mensagem: formData.get('mensagem') || 'Nenhuma mensagem'
        };
        
        // Verificar se EmailJS está configurado
        if (EMAILJS_CONFIG.serviceID === 'YOUR_SERVICE_ID' || 
            EMAILJS_CONFIG.templateID === 'YOUR_TEMPLATE_ID' || 
            EMAILJS_CONFIG.publicKey === 'YOUR_PUBLIC_KEY') {
            // Fallback: usar mailto se EmailJS não estiver configurado
            const assunto = encodeURIComponent(`Reserva - Vila d'Ajuda`);
            const corpo = encodeURIComponent(`
Nome: ${data.nome}
Email: ${data.email}
Telefone: ${data.telefone}
Chalé Preferido: ${data.chale}
Check-in: ${data.checkin}
Check-out: ${data.checkout}
Adultos: ${data.adultos}
Crianças: ${data.criancas}
Mensagem: ${data.mensagem}
            `);
            
            window.location.href = `mailto:contato@viladajuda.com?subject=${assunto}&body=${corpo}`;
            showMessage('Redirecionando para seu cliente de email...', 'success');
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        } else {
            // Enviar via EmailJS
            try {
                const templateParams = {
                    from_name: data.nome,
                    from_email: data.email,
                    phone: data.telefone,
                    chale: data.chale,
                    checkin: data.checkin,
                    checkout: data.checkout,
                    adultos: data.adultos,
                    criancas: data.criancas,
                    message: data.mensagem,
                    to_name: 'Renata - Vila d\'Ajuda'
                };
                
                await emailjs.send(
                    EMAILJS_CONFIG.serviceID,
                    EMAILJS_CONFIG.templateID,
                    templateParams
                );
                
                showMessage('Reserva enviada com sucesso! Entraremos em contato em breve.', 'success');
                formReservaCompleto.reset();
            } catch (error) {
                console.error('Erro ao enviar email:', error);
                showMessage('Erro ao enviar reserva. Por favor, tente novamente ou entre em contato diretamente.', 'error');
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
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

