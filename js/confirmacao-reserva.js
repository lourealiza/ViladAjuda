const formConfirmacaoReserva = document.getElementById('formConfirmacaoReserva');
const confirmacaoStatus = document.getElementById('confirmacaoStatus');
const confirmacaoSuccess = document.getElementById('confirmacaoSuccess');

function showConfirmacaoStatus(message, type = 'info') {
    if (!confirmacaoStatus) {
        return;
    }

    confirmacaoStatus.textContent = message;
    confirmacaoStatus.className = `triagem-status is-visible is-${type}`;
}

function hideConfirmacaoStatus() {
    if (!confirmacaoStatus) {
        return;
    }

    confirmacaoStatus.textContent = '';
    confirmacaoStatus.className = 'triagem-status';
}

function maskCpfInput() {
    const cpfInput = document.getElementById('confirmacaoCpf');
    if (!cpfInput) {
        return;
    }

    cpfInput.addEventListener('input', () => {
        const digits = cpfInput.value.replace(/\D/g, '').slice(0, 11);
        let formatted = digits;

        if (digits.length > 3) {
            formatted = `${digits.slice(0, 3)}.${digits.slice(3)}`;
        }
        if (digits.length > 6) {
            formatted = `${formatted.slice(0, 7)}.${formatted.slice(7)}`;
        }
        if (digits.length > 9) {
            formatted = `${formatted.slice(0, 11)}-${formatted.slice(11)}`;
        }

        cpfInput.value = formatted;
    });
}

function normalizePlateInput() {
    const placaInput = document.getElementById('confirmacaoPlaca');
    if (!placaInput) {
        return;
    }

    placaInput.addEventListener('input', () => {
        placaInput.value = placaInput.value.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 8);
    });
}

function isValidCpf(cpfValue) {
    const cpf = cpfValue.replace(/\D/g, '');

    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        return false;
    }

    let sum = 0;
    for (let i = 0; i < 9; i += 1) {
        sum += Number(cpf.charAt(i)) * (10 - i);
    }

    let digit = (sum * 10) % 11;
    if (digit === 10) {
        digit = 0;
    }
    if (digit !== Number(cpf.charAt(9))) {
        return false;
    }

    sum = 0;
    for (let i = 0; i < 10; i += 1) {
        sum += Number(cpf.charAt(i)) * (11 - i);
    }

    digit = (sum * 10) % 11;
    if (digit === 10) {
        digit = 0;
    }

    return digit === Number(cpf.charAt(10));
}

function getConfirmacaoTrackingData() {
    const params = new URLSearchParams(window.location.search);

    return {
        utm_source: params.get('utm_source') || '',
        utm_medium: params.get('utm_medium') || '',
        utm_campaign: params.get('utm_campaign') || '',
        url_origem: window.location.href
    };
}

if (formConfirmacaoReserva) {
    maskCpfInput();
    normalizePlateInput();

    formConfirmacaoReserva.addEventListener('submit', async (event) => {
        event.preventDefault();
        hideConfirmacaoStatus();

        if (confirmacaoSuccess) {
            confirmacaoSuccess.hidden = true;
        }

        const submitButton = formConfirmacaoReserva.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        const formData = new FormData(formConfirmacaoReserva);
        const cpf = (formData.get('cpf') || '').toString();
        const dadosPagamento = (formData.get('dados_pagamento') || '').toString().trim();
        const tracking = getConfirmacaoTrackingData();

        if (!isValidCpf(cpf)) {
            showConfirmacaoStatus('Informe um CPF válido para continuar.', 'error');
            return;
        }

        if (!dadosPagamento) {
            showConfirmacaoStatus('Preencha os dados de pagamento antes de enviar.', 'error');
            return;
        }

        if (!formData.get('aceite_regras')) {
            showConfirmacaoStatus('É necessário confirmar a ciência das regras da hospedagem.', 'error');
            return;
        }

        const payload = {
            nome_completo: (formData.get('nome_completo') || '').toString().trim(),
            cpf,
            dados_pagamento: dadosPagamento,
            endereco: (formData.get('endereco') || '').toString().trim(),
            placa_carro: (formData.get('placa_carro') || '').toString().trim(),
            aceite_regras: true,
            origem_formulario: 'confirmacao_reserva_etapa_2',
            ...tracking
        };

        submitButton.disabled = true;
        submitButton.textContent = 'Enviando...';
        showConfirmacaoStatus('Enviando a confirmação da reserva...', 'info');

        try {
            await API.enviarConfirmacaoReserva(payload);

            formConfirmacaoReserva.reset();
            hideConfirmacaoStatus();

            if (confirmacaoSuccess) {
                confirmacaoSuccess.hidden = false;
                confirmacaoSuccess.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

            if (typeof gtag !== 'undefined') {
                gtag('event', 'conversion', {
                    send_to: 'AW-17836356824',
                    event_category: 'Reserva',
                    event_label: 'Confirmacao Reserva Etapa 2 Enviada'
                });
            }
        } catch (error) {
            console.error('Erro ao enviar confirmação da reserva:', error);
            showConfirmacaoStatus(error.message || 'Não foi possível enviar a confirmação agora. Tente novamente em instantes.', 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    });
}
