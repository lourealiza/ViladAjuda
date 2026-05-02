const formTriagem = document.getElementById('formTriagem');
const triagemStatus = document.getElementById('triagemStatus');
const triagemSuccess = document.getElementById('triagemSuccess');

function showTriagemStatus(message, type = 'info') {
    if (!triagemStatus) {
        return;
    }

    triagemStatus.textContent = message;
    triagemStatus.className = `triagem-status is-visible is-${type}`;
}

function hideTriagemStatus() {
    if (!triagemStatus) {
        return;
    }

    triagemStatus.textContent = '';
    triagemStatus.className = 'triagem-status';
}

function setDateLimits() {
    const checkinInput = document.getElementById('triagemCheckin');
    const checkoutInput = document.getElementById('triagemCheckout');

    if (!checkinInput || !checkoutInput) {
        return;
    }

    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    const hojeFormatado = `${ano}-${mes}-${dia}`;

    checkinInput.min = hojeFormatado;
    checkoutInput.min = hojeFormatado;

    if (checkinInput.dataset.bound === 'true') {
        return;
    }

    checkinInput.addEventListener('change', () => {
        checkoutInput.min = checkinInput.value || hojeFormatado;

        if (checkoutInput.value && checkoutInput.value <= checkinInput.value) {
            checkoutInput.value = '';
        }
    });

    checkinInput.dataset.bound = 'true';
}

function maskWhatsappInput() {
    const whatsappInput = document.getElementById('triagemWhatsapp');
    if (!whatsappInput) {
        return;
    }

    whatsappInput.addEventListener('input', () => {
        const digits = whatsappInput.value.replace(/\D/g, '').slice(0, 11);

        if (digits.length <= 2) {
            whatsappInput.value = digits;
            return;
        }

        if (digits.length <= 7) {
            whatsappInput.value = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
            return;
        }

        if (digits.length <= 10) {
            whatsappInput.value = `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
            return;
        }

        whatsappInput.value = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    });
}

function getTrackingData() {
    const params = new URLSearchParams(window.location.search);

    return {
        utm_source: params.get('utm_source') || '',
        utm_medium: params.get('utm_medium') || '',
        utm_campaign: params.get('utm_campaign') || '',
        url_origem: document.referrer || window.location.href
    };
}

function buildMensagemTriagem(hospedes, criancas, observacao) {
    const linhas = [
        'Triagem - Etapa 1',
        `Numero de hospedes: ${hospedes}`,
        `Criancas: ${criancas}`
    ];

    if (observacao) {
        linhas.push(`Observacao: ${observacao}`);
    }

    return linhas.join('\n');
}

if (formTriagem) {
    setDateLimits();
    maskWhatsappInput();

    formTriagem.addEventListener('submit', async (event) => {
        event.preventDefault();
        hideTriagemStatus();

        if (triagemSuccess) {
            triagemSuccess.hidden = true;
        }

        const submitButton = formTriagem.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        const formData = new FormData(formTriagem);

        const checkin = formData.get('checkin');
        const checkout = formData.get('checkout');
        const hospedes = parseInt(formData.get('hospedes'), 10);
        const criancas = formData.get('criancas');
        const observacao = (formData.get('observacao') || '').toString().trim();
        const tracking = getTrackingData();

        if (!checkin || !checkout || checkout <= checkin) {
            showTriagemStatus('Confira as datas de entrada e saída antes de enviar.', 'error');
            return;
        }

        if (Number.isNaN(hospedes) || hospedes < 1) {
            showTriagemStatus('Informe um número de hóspedes válido.', 'error');
            return;
        }

        const payload = {
            nome_hospede: (formData.get('nome') || '').toString().trim(),
            telefone_hospede: (formData.get('whatsapp') || '').toString().trim(),
            email_hospede: (formData.get('email') || '').toString().trim(),
            data_checkin: checkin,
            data_checkout: checkout,
            num_adultos: hospedes,
            num_criancas: 0,
            numero_hospedes_total: hospedes,
            tem_criancas: criancas,
            cidade_hospede: (formData.get('origem') || '').toString().trim(),
            observacao_livre: observacao,
            mensagem: buildMensagemTriagem(hospedes, criancas, observacao),
            origem_formulario: 'triagem_etapa_1',
            ...tracking
        };

        submitButton.disabled = true;
        submitButton.textContent = 'Enviando...';
        showTriagemStatus('Enviando sua triagem para a equipe...', 'info');

        try {
            await API.criarReserva(payload);

            formTriagem.reset();
            setDateLimits();
            hideTriagemStatus();

            if (triagemSuccess) {
                triagemSuccess.hidden = false;
                triagemSuccess.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

            if (typeof gtag !== 'undefined') {
                gtag('event', 'conversion', {
                    send_to: 'AW-17836356824',
                    event_category: 'Reserva',
                    event_label: 'Triagem Etapa 1 Enviada'
                });
            }
        } catch (error) {
            console.error('Erro ao enviar triagem:', error);
            showTriagemStatus(error.message || 'Nao foi possivel enviar a triagem agora. Tente novamente em instantes.', 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    });
}
