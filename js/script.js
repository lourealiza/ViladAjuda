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

// Formulário de Reserva Completo
const formReservaCompleto = document.getElementById('formReservaCompleto');
if (formReservaCompleto) {
    formReservaCompleto.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(formReservaCompleto);
        const data = {
            nome: formData.get('nome'),
            email: formData.get('email'),
            telefone: formData.get('telefone'),
            chale: formData.get('chale'),
            checkin: formData.get('checkin'),
            checkout: formData.get('checkout'),
            adultos: formData.get('adultos'),
            criancas: formData.get('criancas'),
            mensagem: formData.get('mensagem')
        };
        
        // Aqui você pode adicionar lógica para enviar a reserva
        // Por exemplo, enviar para um servidor ou abrir email
        console.log('Dados da reserva:', data);
        
        // Exemplo: abrir cliente de email
        const assunto = encodeURIComponent(`Reserva - Vila d'Ajuda`);
        const corpo = encodeURIComponent(`
Nome: ${data.nome}
Email: ${data.email}
Telefone: ${data.telefone}
Chalé Preferido: ${data.chale || 'Qualquer'}
Check-in: ${data.checkin}
Check-out: ${data.checkout}
Adultos: ${data.adultos}
Crianças: ${data.criancas}
Mensagem: ${data.mensagem || 'Nenhuma'}
        `);
        
        // Substitua pelo email real
        window.location.href = `mailto:renata@viladajuda.com?subject=${assunto}&body=${corpo}`;
        
        // Ou mostre uma mensagem de sucesso
        alert('Obrigado pela sua reserva! Entraremos em contato em breve.');
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

