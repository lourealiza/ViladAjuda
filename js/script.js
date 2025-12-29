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
// TEMPORARIAMENTE DESABILITADO - Banner Black Friday
// verificarBlackFriday();

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

// Smooth Scroll (exceto para #reserva que abre modal)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        
        // Se for link para reserva, abrir modal
        if (href === '#reserva') {
            e.preventDefault();
            abrirModalReserva();
            return;
        }
        
        e.preventDefault();
        const target = document.querySelector(href);
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

// Fechar modal com ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modalReserva = document.getElementById('modalReserva');
        if (modalReserva && modalReserva.style.display === 'flex') {
            fecharModalReserva();
        }
    }
});

// Carregar chalés dinamicamente

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

// Função para formatar data para exibição
function formatarDataExibicao(dataStr) {
    if (!dataStr) return '';
    const data = new Date(dataStr + 'T00:00:00');
    const diasSemana = ['dom.', 'seg.', 'ter.', 'qua.', 'qui.', 'sex.', 'sáb.'];
    const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    const diaSemana = diasSemana[data.getDay()];
    const dia = data.getDate();
    const mes = meses[data.getMonth()];
    return `${diaSemana} ${dia} de ${mes}`;
}

// Controlar pop-up do calendário
let calendarioPopupAberto = false;
let campoAtivo = null; // 'checkin' ou 'checkout'

function abrirCalendarioPopup(campo) {
    campoAtivo = campo;
    calendarioPopupAberto = true;
    const popup = document.getElementById('datepickerPopup');
    if (popup) {
        popup.style.display = 'flex';
        carregarCalendario();
    }
}

function fecharCalendarioPopup() {
    calendarioPopupAberto = false;
    campoAtivo = null;
    const popup = document.getElementById('datepickerPopup');
    if (popup) {
        popup.style.display = 'none';
    }
    const popupFinal = document.getElementById('datepickerPopupFinal');
    if (popupFinal) {
        popupFinal.style.display = 'none';
    }
}

function fecharCalendarioPopupFinal() {
    calendarioPopupAberto = false;
    campoAtivo = null;
    const popupFinal = document.getElementById('datepickerPopupFinal');
    if (popupFinal) {
        popupFinal.style.display = 'none';
    }
}

async function carregarCalendarioFinal() {
    const container = document.getElementById('calendarioContainerFinal');
    if (!container) return;
    
    try {
        container.innerHTML = '<div class="calendario-loading">Carregando calendário...</div>';
        
        // Carregar apenas 1 mês (o atual)
        const meses = [];
        for (let i = 0; i < 1; i++) {
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
            html += renderizarMesFinal(mes, ano, calendario, index === 0);
        });
        
        html += '</div>';
        container.innerHTML = html;
        
        // Adicionar event listeners aos dias clicáveis
        adicionarEventListenersCalendarioFinal();
        
        // Atualizar visualização das datas selecionadas
        atualizarVisualizacaoDatasSelecionadasFinal();
        
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

function renderizarMesFinal(mes, ano, diasCalendario, isPrimeiroMes) {
    // Reutilizar a mesma função de renderização, mas com IDs diferentes
    return renderizarMes(mes, ano, diasCalendario, isPrimeiroMes);
}

function adicionarEventListenersCalendarioFinal() {
    const container = document.getElementById('calendarioContainerFinal');
    if (!container) return;
    
    const dias = container.querySelectorAll('.calendario-dia.clicavel');
    dias.forEach(dia => {
        dia.addEventListener('click', () => {
            const dataStr = dia.getAttribute('data-data');
            if (!dataStr) return;
            
            const data = new Date(dataStr + 'T00:00:00');
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            
            if (data < hoje) {
                return; // Não permitir selecionar datas passadas
            }
            
            const checkinHidden = document.getElementById('checkinHiddenFinal');
            const checkoutHidden = document.getElementById('checkoutHiddenFinal');
            const checkinInput = document.getElementById('checkinInputFinal');
            const checkoutInput = document.getElementById('checkoutInputFinal');
            
            if (!checkinHidden || !checkoutHidden || !checkinInput || !checkoutInput) return;
            
            const checkinAtual = checkinHidden.value;
            const checkoutAtual = checkoutHidden.value;
            
            if (!checkinAtual || (checkinAtual && checkoutAtual)) {
                // Nova seleção: definir check-in
                checkinHidden.value = dataStr;
                checkoutHidden.value = '';
                dataCheckinSelecionada = dataStr;
                dataCheckoutSelecionada = null;
            } else if (checkinAtual && !checkoutAtual) {
                // Check-in já definido: definir check-out
                const checkinDate = new Date(checkinAtual + 'T00:00:00');
                if (data <= checkinDate) {
                    // Se a data selecionada é anterior ou igual ao check-in, redefine o check-in
                    checkinHidden.value = dataStr;
                    checkoutHidden.value = '';
                    dataCheckinSelecionada = dataStr;
                    dataCheckoutSelecionada = null;
                } else {
                    // Define o check-out
                    checkoutHidden.value = dataStr;
                    dataCheckoutSelecionada = dataStr;
                }
            }
            
            atualizarVisualizacaoDatasSelecionadasFinal();
        });
    });
}

function atualizarVisualizacaoDatasSelecionadasFinal() {
    const checkinHidden = document.getElementById('checkinHiddenFinal');
    const checkoutHidden = document.getElementById('checkoutHiddenFinal');
    const checkinInput = document.getElementById('checkinInputFinal');
    const checkoutInput = document.getElementById('checkoutInputFinal');
    
    if (!checkinHidden || !checkoutHidden || !checkinInput || !checkoutInput) return;
    
    const checkin = checkinHidden.value;
    const checkout = checkoutHidden.value;
    
    if (checkin) {
        const dataCheckin = new Date(checkin + 'T00:00:00');
        const opcoes = { weekday: 'short', day: 'numeric', month: 'short' };
        checkinInput.value = dataCheckin.toLocaleDateString('pt-BR', opcoes);
    } else {
        checkinInput.value = '';
    }
    
    if (checkout) {
        const dataCheckout = new Date(checkout + 'T00:00:00');
        const opcoes = { weekday: 'short', day: 'numeric', month: 'short' };
        checkoutInput.value = dataCheckout.toLocaleDateString('pt-BR', opcoes);
    } else {
        checkoutInput.value = '';
    }
    
    // Atualizar visualização no calendário
    const container = document.getElementById('calendarioContainerFinal');
    if (container) {
        const dias = container.querySelectorAll('.calendario-dia');
        dias.forEach(dia => {
            dia.classList.remove('selecionado', 'checkin', 'checkout', 'no-intervalo');
            const dataStr = dia.getAttribute('data-data');
            if (!dataStr) return;
            
            if (checkin && dataStr === checkin) {
                dia.classList.add('selecionado', 'checkin');
            } else if (checkout && dataStr === checkout) {
                dia.classList.add('selecionado', 'checkout');
            } else if (checkin && checkout) {
                const data = new Date(dataStr + 'T00:00:00');
                const checkinDate = new Date(checkin + 'T00:00:00');
                const checkoutDate = new Date(checkout + 'T00:00:00');
                if (data > checkinDate && data < checkoutDate) {
                    dia.classList.add('no-intervalo');
                }
            }
        });
    }
}

// Event listeners para campos de data
document.addEventListener('DOMContentLoaded', () => {
    const checkinInput = document.getElementById('checkinInput');
    const checkoutInput = document.getElementById('checkoutInput');
    const popup = document.getElementById('datepickerPopup');
    
    if (checkinInput) {
        checkinInput.addEventListener('click', (e) => {
            e.preventDefault();
            abrirCalendarioPopup('checkin');
        });
    }
    
    if (checkoutInput) {
        checkoutInput.addEventListener('click', (e) => {
            e.preventDefault();
            abrirCalendarioPopup('checkout');
        });
    }
    
    // Fechar pop-up ao clicar fora
    if (popup) {
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                fecharCalendarioPopup();
            }
        });
    }
    
    // Fechar pop-up com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && calendarioPopupAberto) {
            fecharCalendarioPopup();
        }
    });
});

// Formulário de Reserva Rápida (Consulta de Disponibilidade)
const formReserva = document.getElementById('formReserva');
if (formReserva) {
    formReserva.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitButton = formReserva.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Verificando...';
        
        const dataCheckin = document.getElementById('checkinHidden')?.value || dataCheckinSelecionada;
        const dataCheckout = document.getElementById('checkoutHidden')?.value || dataCheckoutSelecionada;
        const formData = new FormData(formReserva);
        const adultos = formData.get('adultos');
        const criancas = formData.get('criancas');
        
        // Validação básica
        if (!dataCheckin || !dataCheckout) {
            showMessage('Por favor, selecione as datas de check-in e check-out', 'error');
            submitButton.disabled = false;
            submitButton.textContent = originalText;
            return;
        }
        
        try {
            // Buscar chalés disponíveis na API
            showMessage('Verificando disponibilidade...', 'info');
            
            const resultado = await API.buscarChalesDisponiveis(dataCheckin, dataCheckout);
            
            const noites = API.calcularNoites(dataCheckin, dataCheckout);
            const totalChales = resultado.chales.length;
            
            if (totalChales === 0) {
                showMessage('😔 Não há chalés disponíveis para o período selecionado. Tente outras datas.', 'error');
                submitButton.disabled = false;
                submitButton.textContent = originalText;
                return;
            }
            
            showMessage(`✅ ${totalChales} chalé(s) disponível(is) para ${noites} noite(s)!`, 'success');
            
            // Preencher formulário completo
            const formCompleto = document.getElementById('formReservaCompleto');
            if (formCompleto) {
                formCompleto.querySelector('[name="checkin"]').value = dataCheckin;
                formCompleto.querySelector('[name="checkout"]').value = dataCheckout;
                formCompleto.querySelector('[name="adultos"]').value = adultos;
                formCompleto.querySelector('[name="criancas"]').value = criancas;
                
                // Não preencher dropdown aqui - será preenchido pela função carregarChalesNoDropdown()
                // que busca preço dinâmico baseado na data de check-in
            }
            
            // Abrir modal de reserva após verificar disponibilidade
            setTimeout(() => {
                abrirModalReserva();
                // Aguardar um pouco para garantir que o modal está visível e campos preenchidos
                setTimeout(() => {
                    carregarChalesNoDropdown();
                }, 200);
            }, 1000);
            
        } catch (erro) {
            console.error('Erro ao verificar disponibilidade:', erro);
            showMessage('❌ Erro ao verificar disponibilidade: ' + erro.message, 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    });
}

// Formulário de Reserva Rápida (Final da Página)
const formReservaFinal = document.getElementById('formReservaFinal');
if (formReservaFinal) {
    formReservaFinal.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitButton = formReservaFinal.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Verificando...';
        
        const dataCheckin = document.getElementById('checkinHiddenFinal')?.value || dataCheckinSelecionada;
        const dataCheckout = document.getElementById('checkoutHiddenFinal')?.value || dataCheckoutSelecionada;
        const formData = new FormData(formReservaFinal);
        const adultos = formData.get('adultos');
        const criancas = formData.get('criancas');
        
        // Validação básica
        if (!dataCheckin || !dataCheckout) {
            showMessage('Por favor, selecione as datas de check-in e check-out', 'error');
            submitButton.disabled = false;
            submitButton.textContent = originalText;
            return;
        }
        
        try {
            // Buscar chalés disponíveis na API
            showMessage('Verificando disponibilidade...', 'info');
            
            const resultado = await API.buscarChalesDisponiveis(dataCheckin, dataCheckout);
            
            const noites = API.calcularNoites(dataCheckin, dataCheckout);
            const totalChales = resultado.chales.length;
            
            if (totalChales === 0) {
                showMessage('😔 Não há chalés disponíveis para o período selecionado. Tente outras datas.', 'error');
                submitButton.disabled = false;
                submitButton.textContent = originalText;
                return;
            }
            
            showMessage(`✅ ${totalChales} chalé(s) disponível(is) para ${noites} noite(s)!`, 'success');
            
            // Preencher formulário completo
            const formCompleto = document.getElementById('formReservaCompleto');
            if (formCompleto) {
                formCompleto.querySelector('[name="checkin"]').value = dataCheckin;
                formCompleto.querySelector('[name="checkout"]').value = dataCheckout;
                formCompleto.querySelector('[name="adultos"]').value = adultos;
                formCompleto.querySelector('[name="criancas"]').value = criancas;
                
                // Não preencher dropdown aqui - será preenchido pela função carregarChalesNoDropdown()
                // que busca preço dinâmico baseado na data de check-in
            }
            
            // Abrir modal de reserva após verificar disponibilidade
            setTimeout(() => {
                abrirModalReserva();
                // Aguardar um pouco para garantir que o modal está visível e campos preenchidos
                setTimeout(() => {
                    carregarChalesNoDropdown();
                }, 200);
            }, 1000);
            
        } catch (erro) {
            console.error('Erro ao verificar disponibilidade:', erro);
            showMessage('❌ Erro ao verificar disponibilidade: ' + erro.message, 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    });
    
    // Inicializar datepicker para o formulário final
    const checkinInputFinal = document.getElementById('checkinInputFinal');
    const checkoutInputFinal = document.getElementById('checkoutInputFinal');
    const popupFinal = document.getElementById('datepickerPopupFinal');
    
    if (checkinInputFinal) {
        checkinInputFinal.addEventListener('click', (e) => {
            e.preventDefault();
            campoAtivo = 'checkinFinal';
            calendarioPopupAberto = true;
            if (popupFinal) {
                popupFinal.style.display = 'flex';
                carregarCalendarioFinal();
            }
        });
    }
    
    if (checkoutInputFinal) {
        checkoutInputFinal.addEventListener('click', (e) => {
            e.preventDefault();
            campoAtivo = 'checkoutFinal';
            calendarioPopupAberto = true;
            if (popupFinal) {
                popupFinal.style.display = 'flex';
                carregarCalendarioFinal();
            }
        });
    }
    
    // Fechar pop-up ao clicar fora (formulário final)
    if (popupFinal) {
        popupFinal.addEventListener('click', (e) => {
            if (e.target === popupFinal) {
                fecharCalendarioPopupFinal();
            }
        });
    }
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


// ==================== MODAL DE RESERVA ====================

// Função para capturar parâmetros UTM e URL de origem
function capturarDadosRastreamento() {
    const urlParams = new URLSearchParams(window.location.search);
    const dados = {
        url_origem: document.referrer || window.location.href,
        utm_source: urlParams.get('utm_source') || '',
        utm_medium: urlParams.get('utm_medium') || '',
        utm_campaign: urlParams.get('utm_campaign') || ''
    };
    
    // Salvar no sessionStorage para persistir durante a sessão
    sessionStorage.setItem('dadosRastreamento', JSON.stringify(dados));
    
    return dados;
}

// Função para carregar chalés com preço dinâmico no dropdown
async function carregarChalesNoDropdown() {
    console.log('🚀 Iniciando carregarChalesNoDropdown()...');
    const formCompleto = document.getElementById('formReservaCompleto');
    if (!formCompleto) {
        console.warn('⚠️ Formulário completo não encontrado');
        return;
    }
    
    const selectChale = formCompleto.querySelector('[name="chale"]');
    if (!selectChale) {
        console.warn('⚠️ Select de chalé não encontrado');
        return;
    }
    
    // Obter datas do formulário
    let dataCheckin = formCompleto.querySelector('[name="checkin"]')?.value;
    let dataCheckout = formCompleto.querySelector('[name="checkout"]')?.value;
    
    // Converter data de DD/MM/YYYY para YYYY-MM-DD se necessário
    function converterDataParaISO(data) {
        if (!data) return null;
        // Se já está no formato YYYY-MM-DD, retornar como está
        if (/^\d{4}-\d{2}-\d{2}$/.test(data)) {
            return data;
        }
        // Se está no formato DD/MM/YYYY, converter
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(data)) {
            const [dia, mes, ano] = data.split('/');
            return `${ano}-${mes}-${dia}`;
        }
        return data;
    }
    
    dataCheckin = converterDataParaISO(dataCheckin);
    dataCheckout = converterDataParaISO(dataCheckout);
    
    // Se não houver datas, usar datas padrão (hoje e amanhã)
    const hoje = new Date();
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);
    
    const checkin = dataCheckin || hoje.toISOString().split('T')[0];
    const checkout = dataCheckout || amanha.toISOString().split('T')[0];
    
    console.log('🔍 Carregando chalés com preço dinâmico:', {
        dataCheckinOriginal: formCompleto.querySelector('[name="checkin"]')?.value,
        dataCheckoutOriginal: formCompleto.querySelector('[name="checkout"]')?.value,
        checkinFormatado: checkin,
        checkoutFormatado: checkout
    });
    
    try {
        // Buscar chalés disponíveis com preço dinâmico
        const resultado = await API.buscarChalesDisponiveis(checkin, checkout);
        
        console.log('📊 Resultado da API buscarChalesDisponiveis:', resultado);
        if (resultado.chales && resultado.chales.length > 0) {
            console.log('💰 Preços dos chalés:', resultado.chales.map(c => ({
                nome: c.nome,
                preco_diaria_atual: c.preco_diaria_atual,
                preco_diaria: c.preco_diaria,
                temporada: c.temporada,
                feriado: c.feriado
            })));
        }
        
        // Limpar opções existentes
        selectChale.innerHTML = '<option value="">Qualquer chalé</option>';
        
        // Adicionar chalés disponíveis com preço dinâmico
        if (resultado.chales && resultado.chales.length > 0) {
            resultado.chales.forEach(chale => {
                const option = document.createElement('option');
                option.value = chale.id;
                // Usar preço dinâmico se disponível, senão usar preço base
                const precoExibir = chale.preco_diaria_atual || chale.preco_diaria || 0;
                option.textContent = `${chale.nome} - ${API.formatarValor(precoExibir)}/noite`;
                selectChale.appendChild(option);
                console.log(`✅ Adicionado ao dropdown: ${chale.nome} - ${API.formatarValor(precoExibir)}/noite (preco_diaria_atual: ${chale.preco_diaria_atual}, preco_diaria: ${chale.preco_diaria})`);
            });
        } else {
            console.warn('⚠️ Nenhum chalé retornado pela API');
        }
    } catch (erro) {
        console.error('❌ Erro ao carregar chalés no dropdown:', erro);
        // Em caso de erro, manter opções padrão ou tentar carregar sem preço dinâmico
        try {
            const chales = await API.listarChales();
            selectChale.innerHTML = '<option value="">Qualquer chalé</option>';
            chales.forEach(chale => {
                const option = document.createElement('option');
                option.value = chale.id;
                const precoExibir = chale.preco_diaria_atual || chale.preco_diaria || 0;
                option.textContent = `${chale.nome} - ${API.formatarValor(precoExibir)}/noite`;
                selectChale.appendChild(option);
            });
        } catch (erro2) {
            console.error('Erro ao carregar chalés alternativo:', erro2);
        }
    }
}

// Função para abrir modal de reserva
function abrirModalReserva() {
    const modal = document.getElementById('modalReserva');
    if (!modal) return;
    
    // Capturar dados de rastreamento
    const dadosRastreamento = capturarDadosRastreamento();
    
    // Preencher campos ocultos do formulário
    const urlOrigem = document.getElementById('urlOrigem');
    const utmSource = document.getElementById('utmSource');
    const utmMedium = document.getElementById('utmMedium');
    const utmCampaign = document.getElementById('utmCampaign');
    
    if (urlOrigem) urlOrigem.value = dadosRastreamento.url_origem;
    if (utmSource) utmSource.value = dadosRastreamento.utm_source;
    if (utmMedium) utmMedium.value = dadosRastreamento.utm_medium;
    if (utmCampaign) utmCampaign.value = dadosRastreamento.utm_campaign;
    
    // Limpar dropdown imediatamente para remover opções hardcoded
    const formCompleto = document.getElementById('formReservaCompleto');
    if (formCompleto) {
        const selectChale = formCompleto.querySelector('[name="chale"]');
        if (selectChale) {
            selectChale.innerHTML = '<option value="">Qualquer chalé</option>';
        }
        
        // Preencher datas padrão se não estiverem preenchidas (para cálculo de preço dinâmico)
        const campoCheckin = formCompleto.querySelector('[name="checkin"]');
        const campoCheckout = formCompleto.querySelector('[name="checkout"]');
        
        if (campoCheckin && !campoCheckin.value) {
            const hoje = new Date();
            campoCheckin.value = hoje.toISOString().split('T')[0];
        }
        
        if (campoCheckout && !campoCheckout.value) {
            const amanha = new Date();
            amanha.setDate(amanha.getDate() + 1);
            campoCheckout.value = amanha.toISOString().split('T')[0];
        }
    }
    
    // Atualizar URL para /consulta quando abrir modal
    if (window.history && window.history.pushState) {
        const pathAtual = window.location.pathname;
        // Se já estiver em /consulta, não fazer nada
        if (!pathAtual.endsWith('/consulta')) {
            const novaURL = pathAtual === '/' ? '/consulta' : pathAtual + '/consulta';
            window.history.pushState({ modal: 'aberto' }, 'Reservar Chalé', novaURL);
        }
    }
    
    // Mostrar modal primeiro
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevenir scroll do body
    
    // Carregar chalés com preço dinâmico após o modal estar visível
    // Aguardar um pouco para garantir que os campos de data estão preenchidos
    setTimeout(() => {
        console.log('🔄 Carregando chalés no dropdown após abrir modal...');
        carregarChalesNoDropdown();
        
        // Calcular e exibir preço estimado se as datas estiverem preenchidas
        if (formCompleto) {
            const campoCheckin = formCompleto.querySelector('[name="checkin"]');
            const campoCheckout = formCompleto.querySelector('[name="checkout"]');
            if (campoCheckin && campoCheckout && campoCheckin.value && campoCheckout.value) {
                calcularEExibirPreco(campoCheckin.value, campoCheckout.value);
            }
        }
    }, 300);
    
    // Enviar evento para Google Analytics (se configurado)
    if (typeof gtag !== 'undefined') {
        gtag('event', 'modal_reserva_aberto', {
            'event_category': 'Reserva',
            'event_label': 'Modal de Reserva',
            'utm_source': dadosRastreamento.utm_source,
            'utm_medium': dadosRastreamento.utm_medium,
            'utm_campaign': dadosRastreamento.utm_campaign
        });
    }
}

// Função para fechar modal de reserva
function fecharModalReserva() {
    const modal = document.getElementById('modalReserva');
    if (!modal) return;
    
    // Remover /consulta da URL quando fechar modal
    if (window.history && window.history.replaceState) {
        const urlAtual = window.location.pathname;
        if (urlAtual.endsWith('/consulta')) {
            const novaURL = urlAtual.replace('/consulta', '') || '/';
            window.history.replaceState(null, '', novaURL + window.location.search);
        }
    }
    
    modal.style.display = 'none';
    document.body.style.overflow = ''; // Restaurar scroll do body
}

// Event listeners para abrir/fechar modal
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modalReserva');
    const closeBtn = document.querySelector('.modal-reserva-close');
    const overlay = document.querySelector('.modal-reserva-overlay');
    
    // Fechar ao clicar no botão X
    if (closeBtn) {
        closeBtn.addEventListener('click', fecharModalReserva);
    }
    
    // Fechar ao clicar no overlay
    if (overlay) {
        overlay.addEventListener('click', fecharModalReserva);
    }
    
    // Fechar com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.style.display === 'flex') {
            fecharModalReserva();
        }
    });
    
    // Verificar se a URL é /consulta para abrir modal automaticamente
    const urlAtual = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlAtual.endsWith('/consulta') || 
        urlParams.get('abrir_reserva') === 'true' || 
        window.location.hash === '#reserva') {
        setTimeout(() => {
            abrirModalReserva();
        }, 500);
    }
    
    // Listener para botão voltar do navegador
    window.addEventListener('popstate', (e) => {
        const modal = document.getElementById('modalReserva');
        if (modal && modal.style.display === 'flex') {
            // Se o modal estiver aberto e o usuário clicar em voltar, fechar modal
            if (!window.location.pathname.endsWith('/consulta')) {
                fecharModalReserva();
            }
        } else if (window.location.pathname.endsWith('/consulta')) {
            // Se a URL for /consulta mas o modal não estiver aberto, abrir
            abrirModalReserva();
        }
    });
});

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
        
        // Recuperar dados de rastreamento do sessionStorage se não estiverem no formulário
        let dadosRastreamento = {};
        try {
            const dadosSalvos = sessionStorage.getItem('dadosRastreamento');
            if (dadosSalvos) {
                dadosRastreamento = JSON.parse(dadosSalvos);
            }
        } catch (e) {
            console.error('Erro ao recuperar dados de rastreamento:', e);
        }
        
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
            mensagem: formData.get('mensagem') || '',
            // Dados de rastreamento
            url_origem: formData.get('url_origem') || dadosRastreamento.url_origem || window.location.href,
            utm_source: formData.get('utm_source') || dadosRastreamento.utm_source || '',
            utm_medium: formData.get('utm_medium') || dadosRastreamento.utm_medium || '',
            utm_campaign: formData.get('utm_campaign') || dadosRastreamento.utm_campaign || ''
        };
        
        try {
            // Verificar se as datas selecionadas estão reservadas antes de enviar
            const checkinDate = new Date(dados.data_checkin);
            const checkoutDate = new Date(dados.data_checkout);
            
            // Não validar datas reservadas - permitir que o usuário faça a solicitação
            // O admin é quem aprova ou não a reserva
            // Apenas datas bloqueadas são impedidas (já validado na seleção)
            
            // Log dos dados que serão enviados
            console.log('📤 Enviando formulário de reserva:', dados);
            console.log('📤 URL da API:', API_BASE_URL + '/consulta');
            
            // Enviar reserva para a API (via /consulta)
            const resultado = await API.criarReserva(dados);
            
            console.log('✅ Resposta da API:', resultado);
            
            // Calcular informações para mostrar ao usuário
            const noites = API.calcularNoites(dados.data_checkin, dados.data_checkout);
            const checkinFormatado = API.formatarData(dados.data_checkin);
            const checkoutFormatado = API.formatarData(dados.data_checkout);
            
            let mensagemSucesso = `✅ Solicitação de reserva enviada com sucesso!<br><br>`;
            mensagemSucesso += `📅 ${checkinFormatado} até ${checkoutFormatado} (${noites} noite${noites > 1 ? 's' : ''})<br>`;
            
            // Verificar se há valor no resultado (pode estar em resultado.reserva ou resultado.preco)
            if (resultado.reserva && resultado.reserva.valor_total) {
                mensagemSucesso += `💰 Valor estimado: ${API.formatarValor(resultado.reserva.valor_total)}<br>`;
            } else if (resultado.preco && resultado.preco.valor_total) {
                mensagemSucesso += `💰 Valor estimado: ${API.formatarValor(resultado.preco.valor_total)}<br>`;
            }
            
            mensagemSucesso += `<br>⏳ Sua solicitação está aguardando aprovação.<br>`;
            mensagemSucesso += `📧 Entraremos em contato em breve no email: ${dados.email_hospede}`;
            
            showMessage(mensagemSucesso, 'success');
            
            // Obter valor total (pode estar em resultado.reserva, resultado.preco ou resultado.preco.valor_total)
            const valorTotal = (resultado.reserva && resultado.reserva.valor_total) 
                ? resultado.reserva.valor_total 
                : (resultado.preco && typeof resultado.preco === 'object' && resultado.preco.valor_total) 
                    ? resultado.preco.valor_total 
                    : (typeof resultado.preco === 'number')
                        ? resultado.preco
                        : 0;
            
            // Enviar evento de conversão para Google Analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'conversion', {
                    'send_to': 'AW-17836356824',
                    'event_category': 'Reserva',
                    'event_label': 'Formulário de Reserva Enviado',
                    'value': valorTotal,
                    'currency': 'BRL',
                    'utm_source': dados.utm_source,
                    'utm_medium': dados.utm_medium,
                    'utm_campaign': dados.utm_campaign
                });
            }
            
            // Salvar dados da reserva no localStorage para a página de agradecimento
            const dadosReserva = {
                periodo: `${checkinFormatado} até ${checkoutFormatado} (${noites} noite${noites > 1 ? 's' : ''})`,
                valor: valorTotal ? API.formatarValor(valorTotal) : 'A confirmar',
                email: dados.email_hospede
            };
            
            // Salvar no sessionStorage (limpa ao fechar a aba)
            sessionStorage.setItem('reservaDados', JSON.stringify(dadosReserva));
            
            // Fechar modal antes de redirecionar
            fecharModalReserva();
            
            // Redirecionar para página de agradecimento após 2 segundos
            setTimeout(() => {
                try {
                    // Usar URL limpa sem parâmetros
                    window.location.href = '/obrigado';
                } catch (erro) {
                    console.error('Erro ao redirecionar:', erro);
                    // Fallback: tentar redirecionar sem parâmetros
                    window.location.href = '/obrigado';
                }
            }, 2000);
            
        } catch (erro) {
            console.error('❌ Erro ao enviar reserva:', erro);
            console.error('❌ Detalhes do erro:', {
                message: erro.message,
                status: erro.status,
                stack: erro.stack,
                dadosEnviados: dados
            });
            
            let mensagemErro = 'Erro ao enviar reserva: ' + erro.message;
            
            // Adicionar mais detalhes se disponível
            if (erro.status) {
                mensagemErro += ` (Status: ${erro.status})`;
            }
            if (erro.detalhes && Array.isArray(erro.detalhes)) {
                mensagemErro += '\n\nDetalhes:\n' + erro.detalhes.map(d => `- ${d.campo}: ${d.mensagem}`).join('\n');
            }
            
            // Mensagens de erro mais amigáveis
            if (erro.message.includes('indisponível')) {
                mensagemErro = '😔 O chalé selecionado não está disponível para este período. Por favor, escolha outras datas.';
            } else if (erro.message.includes('capacidade')) {
                mensagemErro = '⚠️ ' + erro.message;
            } else if (erro.message.includes('inválido')) {
                mensagemErro = '⚠️ Por favor, verifique os dados informados.';
            } else if (erro.message.includes('Failed to fetch') || erro.message.includes('CORS')) {
                mensagemErro = '⚠️ Erro de conexão. Por favor, verifique sua internet e tente novamente.';
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

        // Buscar avaliações e estatísticas (apenas 3)
        const resultado = await API.buscarAvaliacoesHomepage(3);
        
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

// Variáveis para seleção de datas
let dataCheckinSelecionada = null;
let dataCheckoutSelecionada = null;

async function carregarCalendario() {
    const container = document.getElementById('calendarioContainer');
    if (!container) return;
    
    try {
        container.innerHTML = '<div class="calendario-loading">Carregando calendário...</div>';
        
        // Carregar apenas 1 mês (o atual)
        const meses = [];
        for (let i = 0; i < 1; i++) {
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
        
        // Adicionar event listeners aos dias clicáveis
        adicionarEventListenersCalendario();
        
        // Atualizar visualização das datas selecionadas
        atualizarVisualizacaoDatasSelecionadas();
        
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
    
    // Verificar se há datas selecionadas para este mês
    const checkinDate = dataCheckinSelecionada ? new Date(dataCheckinSelecionada) : null;
    const checkoutDate = dataCheckoutSelecionada ? new Date(dataCheckoutSelecionada) : null;
    
    // Primeiro dia do mês
    const primeiroDia = new Date(ano, mes - 1, 1);
    const diaSemanaInicio = primeiroDia.getDay();
    
    let html = `
        <div class="calendario-mes">
            <div class="calendario-mes-header">
                <h3 class="calendario-mes-title">${nomesMeses[mes - 1]} ${ano}</h3>
                <div class="calendario-nav">
                    <button class="calendario-nav-btn" onclick="calendarioMesAnterior()" ${calendarioMesAtual === new Date().getMonth() + 1 && calendarioAnoAtual === new Date().getFullYear() ? 'disabled' : ''}>‹</button>
                    <button class="calendario-nav-btn" onclick="calendarioMesProximo()">›</button>
                </div>
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
        
        const { data, disponivel, reservas, bloqueios } = diaInfo;
        const isHoje = data === hojeStr;
        
        // Extrair o dia da data (formato: YYYY-MM-DD)
        const dia = parseInt(data.split('-')[2]);
        
        // Verificar se está disponível, reservado ou bloqueado
        const reservado = reservas && reservas.length > 0;
        const bloqueado = bloqueios && bloqueios.length > 0;
        
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
        
        // Adicionar classe clicável para TODAS as datas (exceto bloqueadas)
        // Permite selecionar qualquer data para fazer reserva, mesmo que já esteja reservada
        // A aprovação do admin é que confirma a reserva
        if (!bloqueado) {
            classes += ' clicavel';
        }
        
        // Verificar se esta data está selecionada
        const diaDate = new Date(data);
        diaDate.setHours(0, 0, 0, 0);
        
        if (checkinDate && data === dataCheckinSelecionada) {
            classes += ' selecionado-checkin';
        } else if (checkoutDate && data === dataCheckoutSelecionada) {
            classes += ' selecionado-checkout';
        } else if (checkinDate && checkoutDate) {
            checkinDate.setHours(0, 0, 0, 0);
            checkoutDate.setHours(0, 0, 0, 0);
            if (diaDate > checkinDate && diaDate < checkoutDate) {
                classes += ' entre-datas';
            }
        }
        
        html += `<div class="${classes}" data-data="${data}" title="${data}">${dia}</div>`;
    });
    
    html += `
            </div>
        </div>
    `;
    
    return html;
}

// Adicionar event listeners aos dias do calendário
function adicionarEventListenersCalendario() {
    const diasClicaveis = document.querySelectorAll('.calendario-dia.clicavel');
    
    diasClicaveis.forEach(dia => {
        dia.addEventListener('click', function() {
            const data = this.getAttribute('data-data');
            selecionarData(data);
        });
        
        // Adicionar cursor pointer
        dia.style.cursor = 'pointer';
    });
}

// Selecionar data (check-in ou check-out)
function selecionarData(data) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataSelecionada = new Date(data);
    dataSelecionada.setHours(0, 0, 0, 0);
    
    // Verificar se o dia está disponível
    const diaElement = document.querySelector(`.calendario-dia[data-data="${data}"]`);
    if (!diaElement) return;
    
    // Não permitir selecionar se estiver bloqueado
    if (diaElement.classList.contains('bloqueado')) {
        showMessage('Esta data está bloqueada e não pode ser selecionada', 'error');
        return;
    }
    
    // Permitir selecionar qualquer data (exceto bloqueadas)
    // Avisar se estiver reservada, mas permitir a solicitação
    const isReservado = diaElement.classList.contains('reservado');
    if (isReservado) {
        showMessage('⚠️ Esta data já está reservada. Você pode fazer uma solicitação, mas será necessário aguardar aprovação do administrador.', 'info');
    }
    
    // Não permitir selecionar datas no passado
    if (dataSelecionada < hoje) {
        showMessage('Não é possível selecionar datas no passado', 'error');
        return;
    }
    
    // Se não há check-in selecionado, ou se a data selecionada é anterior ao check-in, definir como check-in
    if (!dataCheckinSelecionada || dataSelecionada < new Date(dataCheckinSelecionada)) {
        dataCheckinSelecionada = data;
        dataCheckoutSelecionada = null; // Resetar checkout
        showMessage('Data de entrada selecionada: ' + formatarDataParaUsuario(data), 'info');
    } 
    // Se há check-in e a data selecionada é posterior ou igual ao check-in, definir como check-out
    else if (dataSelecionada >= new Date(dataCheckinSelecionada)) {
        dataCheckoutSelecionada = data;
        showMessage('Data de saída selecionada: ' + formatarDataParaUsuario(data), 'info');
    }
    
    // Atualizar campos do formulário
    atualizarVisualizacaoDatasSelecionadas();
    
    // Re-renderizar calendário para mostrar seleções
    if (document.getElementById('calendarioContainer')) {
        carregarCalendario();
    }
    
    // Calcular e exibir preço se ambas as datas estiverem selecionadas
    if (dataCheckinSelecionada && dataCheckoutSelecionada) {
        calcularEExibirPreco(dataCheckinSelecionada, dataCheckoutSelecionada);
        // Fechar pop-up após selecionar ambas as datas
        setTimeout(() => {
            fecharCalendarioPopup();
        }, 500);
    } else {
        ocultarPreco();
    }
}

// Atualizar campos de data do formulário
function atualizarCamposData() {
    const formReserva = document.getElementById('formReserva');
    const formReservaCompleto = document.getElementById('formReservaCompleto');
    
    if (formReserva) {
        const inputCheckin = document.getElementById('checkinInput');
        const inputCheckinHidden = document.getElementById('checkinHidden');
        const inputCheckout = document.getElementById('checkoutInput');
        const inputCheckoutHidden = document.getElementById('checkoutHidden');
        
        if (inputCheckin && dataCheckinSelecionada) {
            inputCheckin.value = formatarDataExibicao(dataCheckinSelecionada);
            if (inputCheckinHidden) inputCheckinHidden.value = dataCheckinSelecionada;
        } else if (inputCheckin) {
            inputCheckin.value = '';
            if (inputCheckinHidden) inputCheckinHidden.value = '';
        }
        
        if (inputCheckout && dataCheckoutSelecionada) {
            inputCheckout.value = formatarDataExibicao(dataCheckoutSelecionada);
            if (inputCheckoutHidden) inputCheckoutHidden.value = dataCheckoutSelecionada;
        } else if (inputCheckout) {
            inputCheckout.value = '';
            if (inputCheckoutHidden) inputCheckoutHidden.value = '';
        }
    }
    
    if (formReservaCompleto) {
        const inputCheckin = formReservaCompleto.querySelector('[name="checkin"]');
        const inputCheckout = formReservaCompleto.querySelector('[name="checkout"]');
        
        if (inputCheckin && dataCheckinSelecionada) {
            inputCheckin.value = dataCheckinSelecionada;
        }
        if (inputCheckout && dataCheckoutSelecionada) {
            inputCheckout.value = dataCheckoutSelecionada;
        }
    }
    
    // Calcular e exibir preço se ambas as datas estiverem selecionadas
    if (dataCheckinSelecionada && dataCheckoutSelecionada) {
        calcularEExibirPreco(dataCheckinSelecionada, dataCheckoutSelecionada);
        // Fechar pop-up após selecionar ambas as datas
        setTimeout(() => {
            fecharCalendarioPopup();
        }, 500);
    } else {
        ocultarPreco();
    }
}

// Calcular e exibir preço estimado
async function calcularEExibirPreco(dataCheckin, dataCheckout) {
    // Verificar se estamos no modal ou no formulário principal
    const formReservaCompleto = document.getElementById('formReservaCompleto');
    const isModal = formReservaCompleto && formReservaCompleto.closest('#modalReserva');
    
    // Selecionar elementos corretos baseado no contexto
    const precoContainer = isModal 
        ? document.getElementById('precoEstimadoModal')
        : document.getElementById('precoEstimado');
    const precoValor = isModal
        ? document.getElementById('precoValorModal')
        : document.getElementById('precoValor');
    const precoDetalhes = isModal
        ? document.getElementById('precoDetalhesModal')
        : document.getElementById('precoDetalhes');
    
    if (!precoContainer || !precoValor || !precoDetalhes) {
        console.warn('⚠️ Elementos de preço não encontrados', { isModal, precoContainer, precoValor, precoDetalhes });
        return;
    }
    
    // Verificar se há datas reservadas no período selecionado
    const checkinDate = new Date(dataCheckin);
    const checkoutDate = new Date(dataCheckout);
    let temDataReservada = false;
    
    document.querySelectorAll('.calendario-dia.reservado').forEach(dia => {
        const dataDia = dia.getAttribute('data-data');
        if (dataDia) {
            const diaDate = new Date(dataDia);
            diaDate.setHours(0, 0, 0, 0);
            checkinDate.setHours(0, 0, 0, 0);
            checkoutDate.setHours(0, 0, 0, 0);
            if (diaDate >= checkinDate && diaDate < checkoutDate) {
                temDataReservada = true;
            }
        }
    });
    
    try {
        precoValor.textContent = 'Calculando...';
        precoDetalhes.textContent = '';
        
        // Buscar número de adultos do formulário (pode ser formReserva ou formReservaCompleto)
        const formReserva = document.getElementById('formReserva');
        const formReservaCompleto = document.getElementById('formReservaCompleto');
        const formAtivo = formReservaCompleto || formReserva;
        const numAdultos = formAtivo ? parseInt(formAtivo.querySelector('[name="adultos"]')?.value || '2') : 2;
        
        console.log('🔍 Chamando API para calcular preço:', { dataCheckin, dataCheckout, numAdultos });
        const resultado = await API.calcularPrecoReserva(dataCheckin, dataCheckout, numAdultos);
        console.log('📊 Resultado da API:', resultado);
        
        if (resultado && resultado.valor_total) {
            precoValor.textContent = API.formatarValor(resultado.valor_total);
            console.log('✅ Preço exibido:', API.formatarValor(resultado.valor_total));
            
            const noites = resultado.numero_noites || API.calcularNoites(dataCheckin, dataCheckout);
            const diariaMedia = resultado.valor_medio_diaria || (resultado.valor_total / noites);
            
            // Montar detalhes do preço
            let detalhesTexto = `${noites} noite${noites > 1 ? 's' : ''} • ${resultado.num_adultos || numAdultos} pessoa${resultado.num_adultos > 1 ? 's' : ''}`;
            
            if (resultado.pessoas_adicionais > 0) {
                detalhesTexto += ` • +${API.formatarValor(resultado.preco_por_pessoa_adicional)} por pessoa adicional`;
            }
            
            detalhesTexto += ` • Média de ${API.formatarValor(diariaMedia)}/noite`;
            
            // Adicionar aviso se houver datas reservadas
            if (temDataReservada) {
                detalhesTexto += ' ⚠️ Período com datas reservadas';
            }
            
            precoDetalhes.textContent = detalhesTexto;
            
            precoContainer.style.display = 'block';
        } else {
            ocultarPreco();
        }
    } catch (erro) {
        console.error('Erro ao calcular preço:', erro);
        // Mesmo com erro, mostrar mensagem informativa
        if (temDataReservada) {
            precoValor.textContent = 'Indisponível';
            precoDetalhes.textContent = '⚠️ Este período contém datas já reservadas';
            precoContainer.style.display = 'block';
        } else {
            ocultarPreco();
        }
    }
}

// Ocultar preço estimado
function ocultarPreco() {
    // Verificar se estamos no modal ou no formulário principal
    const formReservaCompleto = document.getElementById('formReservaCompleto');
    const isModal = formReservaCompleto && formReservaCompleto.closest('#modalReserva');
    
    const precoContainer = isModal 
        ? document.getElementById('precoEstimadoModal')
        : document.getElementById('precoEstimado');
    if (precoContainer) {
        precoContainer.style.display = 'none';
    }
}

// Atualizar visualização das datas selecionadas no calendário
function atualizarVisualizacaoDatasSelecionadas() {
    const formReserva = document.getElementById('formReserva');
    const formReservaCompleto = document.getElementById('formReservaCompleto');
    
    if (formReserva) {
        const inputCheckin = document.getElementById('checkinInput');
        const inputCheckinHidden = document.getElementById('checkinHidden');
        const inputCheckout = document.getElementById('checkoutInput');
        const inputCheckoutHidden = document.getElementById('checkoutHidden');
        
        if (inputCheckin && dataCheckinSelecionada) {
            inputCheckin.value = formatarDataExibicao(dataCheckinSelecionada);
            if (inputCheckinHidden) inputCheckinHidden.value = dataCheckinSelecionada;
        } else if (inputCheckin) {
            inputCheckin.value = '';
            if (inputCheckinHidden) inputCheckinHidden.value = '';
        }
        
        if (inputCheckout && dataCheckoutSelecionada) {
            inputCheckout.value = formatarDataExibicao(dataCheckoutSelecionada);
            if (inputCheckoutHidden) inputCheckoutHidden.value = dataCheckoutSelecionada;
        } else if (inputCheckout) {
            inputCheckout.value = '';
            if (inputCheckoutHidden) inputCheckoutHidden.value = '';
        }
    }
    
    if (formReservaCompleto) {
        const inputCheckin = formReservaCompleto.querySelector('[name="checkin"]');
        const inputCheckout = formReservaCompleto.querySelector('[name="checkout"]');
        
        if (inputCheckin && dataCheckinSelecionada) {
            inputCheckin.value = dataCheckinSelecionada;
        }
        if (inputCheckout && dataCheckoutSelecionada) {
            inputCheckout.value = dataCheckoutSelecionada;
        }
    }
    
    // Atualizar visualização no calendário
    document.querySelectorAll('.calendario-dia').forEach(dia => {
        dia.classList.remove('selecionado-checkin', 'selecionado-checkout', 'entre-datas');
    });
    
    if (!dataCheckinSelecionada) return;
    
    const checkinDate = new Date(dataCheckinSelecionada);
    const checkoutDate = dataCheckoutSelecionada ? new Date(dataCheckoutSelecionada) : null;
    
    document.querySelectorAll('.calendario-dia').forEach(dia => {
        const dataDia = dia.getAttribute('data-data');
        if (!dataDia) return;
        
        const diaDate = new Date(dataDia);
        diaDate.setHours(0, 0, 0, 0);
        checkinDate.setHours(0, 0, 0, 0);
        
        // Marcar check-in
        if (dataDia === dataCheckinSelecionada) {
            dia.classList.add('selecionado-checkin');
        }
        
        // Marcar check-out
        if (checkoutDate && dataDia === dataCheckoutSelecionada) {
            checkoutDate.setHours(0, 0, 0, 0);
            dia.classList.add('selecionado-checkout');
        }
        
        // Marcar período entre check-in e check-out
        if (checkoutDate) {
            checkoutDate.setHours(0, 0, 0, 0);
            if (diaDate > checkinDate && diaDate < checkoutDate) {
                dia.classList.add('entre-datas');
            }
        }
    });
    
    // Calcular e exibir preço se ambas as datas estiverem selecionadas
    if (dataCheckinSelecionada && dataCheckoutSelecionada) {
        calcularEExibirPreco(dataCheckinSelecionada, dataCheckoutSelecionada);
    } else {
        ocultarPreco();
    }
}

// Formatar data para exibição ao usuário
function formatarDataParaUsuario(dataString) {
    const data = new Date(dataString);
    const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
                   'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    return `${data.getDate()} de ${meses[data.getMonth()]}`;
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

// Sincronizar campos de data com calendário
function sincronizarCamposComCalendario() {
    const formReserva = document.getElementById('formReserva');
    const formReservaCompleto = document.getElementById('formReservaCompleto');
    
    // Função auxiliar para adicionar listeners
    function adicionarListeners(inputCheckin, inputCheckout, formElement) {
        // Função para recalcular preço quando necessário
        function recalcularPreco() {
            // Tentar obter datas do formulário atual se não houver datas selecionadas
            let checkin = dataCheckinSelecionada;
            let checkout = dataCheckoutSelecionada;
            
            if (!checkin && inputCheckin) {
                checkin = inputCheckin.value;
            }
            if (!checkout && inputCheckout) {
                checkout = inputCheckout.value;
            }
            
            if (checkin && checkout) {
                calcularEExibirPreco(checkin, checkout);
            } else {
                ocultarPreco();
            }
        }
        
        if (inputCheckin) {
            inputCheckin.addEventListener('change', function() {
                console.log('📅 Data check-in mudou no modal:', this.value);
                // Atualizar chalés com preço dinâmico quando a data de check-in mudar
                carregarChalesNoDropdown();
                dataCheckinSelecionada = this.value;
                if (dataCheckoutSelecionada && new Date(dataCheckoutSelecionada) < new Date(dataCheckinSelecionada)) {
                    dataCheckoutSelecionada = null;
                    if (inputCheckout) inputCheckout.value = '';
                }
                atualizarVisualizacaoDatasSelecionadas();
                recalcularPreco();
            });
        }
        
        if (inputCheckout) {
            inputCheckout.addEventListener('change', function() {
                console.log('📅 Data check-out mudou no modal:', this.value);
                dataCheckoutSelecionada = this.value;
                atualizarVisualizacaoDatasSelecionadas();
                recalcularPreco();
                // Atualizar chalés com preço dinâmico quando a data de check-out mudar
                // Aguardar um pouco para garantir que o valor foi atualizado
                setTimeout(() => {
                    carregarChalesNoDropdown();
                }, 100);
            });
        }
        
        // Adicionar listener para mudança no número de adultos
        if (formElement) {
            const selectAdultos = formElement.querySelector('[name="adultos"]');
            if (selectAdultos) {
                selectAdultos.addEventListener('change', function() {
                    recalcularPreco();
                });
            }
        }
    }
    
    // Adicionar listeners aos campos de data do formulário rápido
    if (formReserva) {
        const inputCheckin = formReserva.querySelector('[name="checkin"]');
        const inputCheckout = formReserva.querySelector('[name="checkout"]');
        adicionarListeners(inputCheckin, inputCheckout, formReserva);
    }
    
    // Adicionar listeners aos campos de data do formulário completo (modal)
    if (formReservaCompleto) {
        const inputCheckinCompleto = formReservaCompleto.querySelector('[name="checkin"]');
        const inputCheckoutCompleto = formReservaCompleto.querySelector('[name="checkout"]');
        adicionarListeners(inputCheckinCompleto, inputCheckoutCompleto, formReservaCompleto);
    }
    
    // Adicionar listeners aos campos de data do formulário completo
    if (formReservaCompleto) {
        const inputCheckin = formReservaCompleto.querySelector('[name="checkin"]');
        const inputCheckout = formReservaCompleto.querySelector('[name="checkout"]');
        adicionarListeners(inputCheckin, inputCheckout, formReservaCompleto);
    }
}

// Carregar calendário quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('calendarioContainer')) {
        // Aguardar um pouco para garantir que a API está pronta
        setTimeout(() => {
            carregarCalendario();
        }, 500);
    }
    
    // Sincronizar campos de data
    sincronizarCamposComCalendario();
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


