// Admin JavaScript - Vila d'Ajuda

// Limpar parâmetros da URL por segurança (nunca passar credenciais na URL)
if (window.location.search) {
    const url = new URL(window.location);
    url.search = '';
    window.history.replaceState({}, document.title, url.pathname);
}

// Verificar se está logado ao carregar
document.addEventListener('DOMContentLoaded', () => {
    if (API.estaLogado()) {
        mostrarDashboard();
        carregarDashboard();
    } else {
        mostrarLogin();
    }
});

// ==================== LOGIN ====================

function mostrarLogin() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminDashboard').style.display = 'none';
}

function mostrarDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
    
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    if (usuario.nome) {
        document.getElementById('userName').textContent = usuario.nome;
    }
}

// Formulário de login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Limpar URL imediatamente (segurança)
    if (window.location.search) {
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const errorDiv = document.getElementById('loginError');
    
    // Validar campos
    if (!email || !senha) {
        errorDiv.textContent = 'Por favor, preencha todos os campos.';
        errorDiv.style.display = 'block';
        return;
    }
    
    errorDiv.style.display = 'none';
    
    try {
        const resultado = await API.login(email, senha);
        // Limpar URL após login bem-sucedido (segurança)
        if (window.location.search) {
            window.history.replaceState({}, document.title, window.location.pathname);
        }
        mostrarDashboard();
        carregarDashboard();
    } catch (erro) {
        let mensagemErro = 'Erro ao fazer login.';
        
        if (erro.tipo === 'CONEXAO') {
            mensagemErro = erro.message + '\n\nCertifique-se de que o backend está rodando.';
        } else if (erro.status === 401) {
            mensagemErro = 'E-mail ou senha incorretos.';
        } else if (erro.status === 404) {
            mensagemErro = 'Endpoint não encontrado. Verifique a configuração da API.';
        } else if (erro.message) {
            mensagemErro = erro.message;
        }
        
        errorDiv.textContent = mensagemErro;
        errorDiv.style.display = 'block';
        console.error('Erro no login:', erro);
    }
    
    return false;
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    API.logout();
    mostrarLogin();
    document.getElementById('loginForm').reset();
});

// ==================== NAVEGAÇÃO ====================

document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Remover active de todos
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
        
        // Adicionar active no clicado
        btn.classList.add('active');
        const section = btn.dataset.section;
        document.getElementById(`${section}Section`).classList.add('active');
        
        // Carregar dados da seção
        if (section === 'dashboard') {
            carregarDashboard();
        } else if (section === 'reservas') {
            carregarReservas();
        } else if (section === 'chales') {
            carregarChales();
        }
    });
});

// ==================== DASHBOARD ====================

async function carregarDashboard() {
    try {
        const reservas = await API.fetchAPI('/reservas');
        const chales = await API.listarChales();
        
        // Estatísticas
        const totalReservas = reservas.length || 0;
        const reservasPendentes = reservas.filter(r => r.status === 'pendente').length;
        const reservasConfirmadas = reservas.filter(r => r.status === 'confirmada').length;
        const totalChales = chales.length || 0;
        
        document.getElementById('totalReservas').textContent = totalReservas;
        document.getElementById('reservasPendentes').textContent = reservasPendentes;
        document.getElementById('reservasConfirmadas').textContent = reservasConfirmadas;
        document.getElementById('totalChales').textContent = totalChales;
        
        // Reservas recentes (últimas 5)
        const recentes = reservas
            .sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em))
            .slice(0, 5);
        
        mostrarReservasRecentes(recentes);
    } catch (erro) {
        console.error('Erro ao carregar dashboard:', erro);
        // Mostrar valores zerados ao invés de erro
        document.getElementById('totalReservas').textContent = '0';
        document.getElementById('reservasPendentes').textContent = '0';
        document.getElementById('reservasConfirmadas').textContent = '0';
        document.getElementById('totalChales').textContent = '0';
        document.getElementById('recentReservas').innerHTML = 
            '<p class="empty-state">Nenhuma reserva encontrada</p>';
    }
}

function mostrarReservasRecentes(reservas) {
    const container = document.getElementById('recentReservas');
    
    if (!reservas || reservas.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhuma reserva encontrada</p>';
        return;
    }
    
    container.innerHTML = reservas.map(reserva => `
        <div class="reserva-item">
            <div class="reserva-info">
                <h4>${reserva.nome_hospede}</h4>
                <p>📧 ${reserva.email_hospede}</p>
                <p>📞 ${reserva.telefone_hospede}</p>
                <p>📅 ${API.formatarData(reserva.data_checkin)} - ${API.formatarData(reserva.data_checkout)}</p>
                <span class="reserva-status ${reserva.status}">${reserva.status}</span>
            </div>
            <div class="reserva-actions">
                <button class="btn-edit" onclick="editarReserva(${reserva.id})">Editar</button>
            </div>
        </div>
    `).join('');
}

// ==================== RESERVAS ====================

async function carregarReservas() {
    const container = document.getElementById('reservasList');
    container.innerHTML = '<p class="loading">Carregando reservas...</p>';
    
    try {
        let reservas = await API.fetchAPI('/reservas');
        
        // Filtrar por status se selecionado
        const filterStatus = document.getElementById('filterStatus').value;
        if (filterStatus) {
            reservas = reservas.filter(r => r.status === filterStatus);
        }
        
        // Ordenar por data de criação (mais recentes primeiro)
        reservas.sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em));
        
        mostrarReservas(reservas);
    } catch (erro) {
        console.error('Erro ao carregar reservas:', erro);
        // Mostrar mensagem amigável ao invés de erro
        container.innerHTML = '<p class="empty-state">Nenhuma reserva encontrada no momento.</p>';
    }
}

function mostrarReservas(reservas) {
    const container = document.getElementById('reservasList');
    
    if (!reservas || reservas.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhuma reserva encontrada</p>';
        return;
    }
    
    container.innerHTML = reservas.map(reserva => `
        <div class="reserva-item">
            <div class="reserva-info">
                <h4>${reserva.nome_hospede}</h4>
                <p>📧 ${reserva.email_hospede}</p>
                <p>📞 ${reserva.telefone_hospede}</p>
                <p>📅 ${API.formatarData(reserva.data_checkin)} - ${API.formatarData(reserva.data_checkout)}</p>
                ${reserva.chale_id ? `<p>🏠 Chalé ID: ${reserva.chale_id}</p>` : ''}
                ${reserva.valor_total ? `<p>💰 ${API.formatarValor(reserva.valor_total)}</p>` : ''}
                ${reserva.mensagem ? `<p>💬 ${reserva.mensagem}</p>` : ''}
                <span class="reserva-status ${reserva.status}">${reserva.status}</span>
            </div>
            <div class="reserva-actions">
                <button class="btn-edit" onclick="editarReserva(${reserva.id})">Editar</button>
                <button class="btn-delete" onclick="deletarReserva(${reserva.id})">Excluir</button>
            </div>
        </div>
    `).join('');
}

// Filtro de status
document.getElementById('filterStatus').addEventListener('change', carregarReservas);

// Editar reserva
async function editarReserva(id) {
    try {
        const reserva = await API.fetchAPI(`/reservas/${id}`);
        
        document.getElementById('reservaId').value = reserva.id;
        document.getElementById('reservaStatus').value = reserva.status;
        document.getElementById('reservaNome').value = reserva.nome_hospede;
        document.getElementById('reservaEmail').value = reserva.email_hospede;
        document.getElementById('reservaTelefone').value = reserva.telefone_hospede;
        document.getElementById('reservaCheckin').value = reserva.data_checkin;
        document.getElementById('reservaCheckout').value = reserva.data_checkout;
        document.getElementById('reservaMensagem').value = reserva.mensagem || '';
        
        document.getElementById('modalReserva').style.display = 'flex';
    } catch (erro) {
        console.error('Erro ao carregar reserva:', erro);
        alert('Erro ao carregar dados da reserva');
    }
}

// Salvar reserva editada
document.getElementById('formEditarReserva').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('reservaId').value;
    const dados = {
        status: document.getElementById('reservaStatus').value,
        nome_hospede: document.getElementById('reservaNome').value,
        email_hospede: document.getElementById('reservaEmail').value,
        telefone_hospede: document.getElementById('reservaTelefone').value,
        data_checkin: document.getElementById('reservaCheckin').value,
        data_checkout: document.getElementById('reservaCheckout').value,
        mensagem: document.getElementById('reservaMensagem').value
    };
    
    try {
        await API.fetchAPI(`/reservas/${id}`, {
            method: 'PUT',
            body: JSON.stringify(dados)
        });
        
        fecharModal('modalReserva');
        carregarReservas();
        carregarDashboard();
        alert('Reserva atualizada com sucesso!');
    } catch (erro) {
        console.error('Erro ao atualizar reserva:', erro);
        alert('Erro ao atualizar reserva: ' + erro.message);
    }
});

// Deletar reserva
async function deletarReserva(id) {
    if (!confirm('Tem certeza que deseja excluir esta reserva?')) {
        return;
    }
    
    try {
        await API.fetchAPI(`/reservas/${id}`, {
            method: 'DELETE'
        });
        
        carregarReservas();
        carregarDashboard();
        alert('Reserva excluída com sucesso!');
    } catch (erro) {
        console.error('Erro ao deletar reserva:', erro);
        alert('Erro ao excluir reserva: ' + erro.message);
    }
}

// ==================== CHALÉS ====================

async function carregarChales() {
    const container = document.getElementById('chalesList');
    container.innerHTML = '<p class="loading">Carregando chalés...</p>';
    
    try {
        const chales = await API.listarChales();
        mostrarChales(chales);
    } catch (erro) {
        console.error('Erro ao carregar chalés:', erro);
        container.innerHTML = '<p class="error-message">Erro ao carregar chalés</p>';
    }
}

function mostrarChales(chales) {
    const container = document.getElementById('chalesList');
    
    if (chales.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhum chalé cadastrado</p>';
        return;
    }
    
    container.innerHTML = chales.map(chale => `
        <div class="chale-card-admin">
            <h4>${chale.nome}</h4>
            <p>${chale.descricao || 'Sem descrição'}</p>
            <div class="chale-card-info">
                <span>👥 ${chale.capacidade_adultos} adultos</span>
                <span>💰 ${API.formatarValor(chale.preco_diaria)}</span>
            </div>
            <div class="chale-card-info">
                <span>${chale.ativo ? '✅ Ativo' : '❌ Inativo'}</span>
            </div>
            <div class="chale-card-actions">
                <button class="btn-edit" onclick="editarChale(${chale.id})">Editar</button>
                <button class="btn-delete" onclick="deletarChale(${chale.id})">Excluir</button>
            </div>
        </div>
    `).join('');
}

// Novo chalé
document.getElementById('btnNovoChale').addEventListener('click', () => {
    document.getElementById('modalChaleTitle').textContent = 'Novo Chalé';
    document.getElementById('formEditarChale').reset();
    document.getElementById('chaleId').value = '';
    document.getElementById('chaleAtivo').checked = true;
    document.getElementById('modalChale').style.display = 'flex';
});

// Editar chalé
async function editarChale(id) {
    try {
        const chale = await API.buscarChale(id);
        
        document.getElementById('modalChaleTitle').textContent = 'Editar Chalé';
        document.getElementById('chaleId').value = chale.id;
        document.getElementById('chaleNome').value = chale.nome;
        document.getElementById('chaleDescricao').value = chale.descricao || '';
        document.getElementById('chaleCapacidadeAdultos').value = chale.capacidade_adultos;
        document.getElementById('chaleCapacidadeCriancas').value = chale.capacidade_criancas || 0;
        document.getElementById('chalePreco').value = chale.preco_diaria;
        document.getElementById('chaleAtivo').checked = chale.ativo !== false;
        
        document.getElementById('modalChale').style.display = 'flex';
    } catch (erro) {
        console.error('Erro ao carregar chalé:', erro);
        alert('Erro ao carregar dados do chalé');
    }
}

// Salvar chalé
document.getElementById('formEditarChale').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('chaleId').value;
    const dados = {
        nome: document.getElementById('chaleNome').value,
        descricao: document.getElementById('chaleDescricao').value,
        capacidade_adultos: parseInt(document.getElementById('chaleCapacidadeAdultos').value),
        capacidade_criancas: parseInt(document.getElementById('chaleCapacidadeCriancas').value),
        preco_diaria: parseFloat(document.getElementById('chalePreco').value),
        ativo: document.getElementById('chaleAtivo').checked
    };
    
    try {
        if (id) {
            // Atualizar
            await API.fetchAPI(`/chales/${id}`, {
                method: 'PUT',
                body: JSON.stringify(dados)
            });
            alert('Chalé atualizado com sucesso!');
        } else {
            // Criar
            await API.fetchAPI('/chales', {
                method: 'POST',
                body: JSON.stringify(dados)
            });
            alert('Chalé criado com sucesso!');
        }
        
        fecharModal('modalChale');
        carregarChales();
        carregarDashboard();
    } catch (erro) {
        console.error('Erro ao salvar chalé:', erro);
        
        // Mensagens de erro mais detalhadas
        let mensagemErro = 'Erro ao salvar chalé: ';
        
        if (erro.message.includes('401') || erro.message.includes('não autenticado')) {
            mensagemErro = '❌ Você não está autenticado. Por favor, faça login novamente.';
        } else if (erro.message.includes('403') || erro.message.includes('permissão')) {
            mensagemErro = '❌ Você não tem permissão para criar/editar chalés. Apenas administradores podem fazer isso.';
        } else if (erro.message.includes('400') || erro.message.includes('inválido')) {
            mensagemErro = '❌ Dados inválidos. Verifique se todos os campos estão preenchidos corretamente:\n\n' +
                          '- Nome: obrigatório (2-50 caracteres)\n' +
                          '- Capacidade Adultos: 1-10\n' +
                          '- Capacidade Crianças: 0-10\n' +
                          '- Preço Diária: valor positivo';
        } else if (erro.message.includes('500') || erro.message.includes('servidor')) {
            mensagemErro = '❌ Erro no servidor. Tente novamente mais tarde ou verifique os logs do servidor.';
        } else {
            mensagemErro += erro.message || 'Erro desconhecido';
        }
        
        alert(mensagemErro);
    }
});

// Deletar chalé
async function deletarChale(id) {
    if (!confirm('Tem certeza que deseja excluir este chalé?')) {
        return;
    }
    
    try {
        await API.fetchAPI(`/chales/${id}`, {
            method: 'DELETE'
        });
        
        carregarChales();
        carregarDashboard();
        alert('Chalé excluído com sucesso!');
    } catch (erro) {
        console.error('Erro ao deletar chalé:', erro);
        alert('Erro ao excluir chalé: ' + erro.message);
    }
}

// ==================== MODAL ====================

function fecharModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal');
        if (modal) {
            modal.style.display = 'none';
        }
    });
});

// Fechar modal ao clicar fora
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// Expor funções globalmente para uso em onclick
window.editarReserva = editarReserva;
window.deletarReserva = deletarReserva;
window.editarChale = editarChale;
window.deletarChale = deletarChale;

