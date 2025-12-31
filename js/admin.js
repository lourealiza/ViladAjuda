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
        
        // Debug: verificar resposta da API
        console.log('Dashboard - Reservas:', reservas);
        console.log('Dashboard - Chalés:', chales);
        console.log('Dashboard - Tipo de chalés:', typeof chales, Array.isArray(chales));
        
        // Estatísticas
        const totalReservas = Array.isArray(reservas) ? reservas.length : 0;
        // Considerar 'pendente' e 'solicitacao_recebida' como pendentes
        const reservasPendentes = Array.isArray(reservas) ? reservas.filter(r => 
            r.status === 'pendente' || r.status === 'solicitacao_recebida'
        ).length : 0;
        const reservasConfirmadas = Array.isArray(reservas) ? reservas.filter(r => r.status === 'confirmada').length : 0;
        
        // Tratar resposta de chalés (pode ser array ou objeto com propriedade chales)
        let totalChales = 0;
        if (Array.isArray(chales)) {
            totalChales = chales.length;
        } else if (chales && chales.chales && Array.isArray(chales.chales)) {
            totalChales = chales.chales.length;
        } else if (chales && chales.total !== undefined) {
            totalChales = chales.total;
        }
        
        console.log('Dashboard - Total chalés calculado:', totalChales);
        
        document.getElementById('totalReservas').textContent = totalReservas;
        document.getElementById('reservasPendentes').textContent = reservasPendentes;
        document.getElementById('reservasConfirmadas').textContent = reservasConfirmadas;
        document.getElementById('totalChales').textContent = totalChales;
        
        // Reservas recentes (últimas 5)
        const recentes = Array.isArray(reservas) ? reservas
            .sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em))
            .slice(0, 5) : [];
        
        mostrarReservasRecentes(recentes);
    } catch (erro) {
        console.error('Erro ao carregar dashboard:', erro);
        console.error('Stack trace:', erro.stack);
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
                <p>👥 ${reserva.num_adultos ?? 0} adulto(s)${(reserva.num_criancas && reserva.num_criancas > 0) ? `, ${reserva.num_criancas} criança(s)` : ''}</p>
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
        const resposta = await API.fetchAPI('/reservas');
        
        // A API retorna { total, reservas } ou apenas array
        let reservas = resposta.reservas || resposta || [];
        
        // Filtrar por status se selecionado
        const filterStatus = document.getElementById('filterStatus').value;
        if (filterStatus) {
            if (filterStatus === 'pendente') {
                // Mostrar reservas pendentes E solicitações recebidas
                reservas = reservas.filter(r => 
                    r.status === 'pendente' || r.status === 'solicitacao_recebida'
                );
            } else {
                reservas = reservas.filter(r => r.status === filterStatus);
            }
        } else {
            // Se não há filtro, mostrar todas as reservas (incluindo solicitacao_recebida)
            // Não precisa filtrar, já mostra todas
        }
        
        // Ordenar por data de criação (mais recentes primeiro)
        reservas.sort((a, b) => {
            const dataA = new Date(a.criado_em || a.data_checkin);
            const dataB = new Date(b.criado_em || b.data_checkin);
            return dataB - dataA;
        });
        
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
    
    container.innerHTML = reservas.map(reserva => {
        // Verificar se é uma reserva pendente que pode ser aprovada
        const podeAprovar = reserva.status === 'pendente' || reserva.status === 'solicitacao_recebida';
        const estaConfirmada = reserva.status === 'confirmada';
        
        return `
        <div class="reserva-item">
            <div class="reserva-info">
                <h4>${reserva.nome_hospede}</h4>
                <p>📧 ${reserva.email_hospede}</p>
                <p>📞 ${reserva.telefone_hospede}</p>
                <p>📅 ${API.formatarData(reserva.data_checkin)} - ${API.formatarData(reserva.data_checkout)}</p>
                <p>👥 ${reserva.num_adultos ?? 0} adulto(s)${(reserva.num_criancas && reserva.num_criancas > 0) ? `, ${reserva.num_criancas} criança(s)` : ''}</p>
                ${reserva.chale_id ? `<p>🏠 Chalé ID: ${reserva.chale_id}</p>` : ''}
                ${reserva.valor_total ? `<p>💰 ${API.formatarValor(reserva.valor_total)}</p>` : ''}
                ${reserva.mensagem ? `<p>💬 ${reserva.mensagem}</p>` : ''}
                <span class="reserva-status ${reserva.status}">${reserva.status}</span>
            </div>
            <div class="reserva-actions">
                ${podeAprovar ? `<button class="btn-approve" onclick="aprovarReserva(${reserva.id})" title="Aprovar reserva">✅ Aprovar</button>` : ''}
                ${estaConfirmada ? `<span class="status-badge-confirmed">✓ Confirmada</span>` : ''}
                <button class="btn-edit" onclick="editarReserva(${reserva.id})">Editar</button>
                <button class="btn-delete" onclick="deletarReserva(${reserva.id})">Excluir</button>
            </div>
        </div>
        `;
    }).join('');
}

// Filtro de status
document.getElementById('filterStatus').addEventListener('change', carregarReservas);

// Carregar chalés no select
async function carregarChalesNoSelect() {
    try {
        const chales = await API.listarChales();
        const select = document.getElementById('reservaChaleId');
        select.innerHTML = '<option value="">Selecione um chalé</option>';
        
        chales.forEach(chale => {
            const option = document.createElement('option');
            option.value = chale.id;
            option.textContent = `${chale.nome} (${chale.capacidade_adultos} adultos)`;
            select.appendChild(option);
        });
    } catch (erro) {
        console.error('Erro ao carregar chalés:', erro);
    }
}

// Nova reserva
document.getElementById('btnNovaReserva').addEventListener('click', async () => {
    document.getElementById('modalReservaTitle').textContent = 'Nova Reserva';
    document.getElementById('formEditarReserva').reset();
    document.getElementById('reservaId').value = '';
    document.getElementById('reservaStatus').value = 'solicitacao_recebida';
    document.getElementById('reservaNumAdultos').value = '2';
    document.getElementById('reservaNumCriancas').value = '0';
    
    await carregarChalesNoSelect();
    document.getElementById('modalReserva').style.display = 'flex';
});

// Editar reserva
async function editarReserva(id) {
    try {
        const resposta = await API.fetchAPI(`/reservas/${id}`);
        // A API retorna { reserva }, então extraímos o objeto
        const reserva = resposta.reserva || resposta;
        
        document.getElementById('modalReservaTitle').textContent = 'Editar Reserva';
        document.getElementById('reservaId').value = reserva.id;
        document.getElementById('reservaStatus').value = reserva.status;
        document.getElementById('reservaNome').value = reserva.nome_hospede;
        document.getElementById('reservaEmail').value = reserva.email_hospede;
        document.getElementById('reservaTelefone').value = reserva.telefone_hospede;
        document.getElementById('reservaCheckin').value = reserva.data_checkin;
        document.getElementById('reservaCheckout').value = reserva.data_checkout;
        document.getElementById('reservaMensagem').value = reserva.mensagem || '';
        document.getElementById('reservaNumAdultos').value = reserva.num_adultos || 2;
        document.getElementById('reservaNumCriancas').value = reserva.num_criancas || 0;
        
        await carregarChalesNoSelect();
        if (reserva.chale_id) {
            document.getElementById('reservaChaleId').value = reserva.chale_id;
        }
        
        document.getElementById('modalReserva').style.display = 'flex';
    } catch (erro) {
        console.error('Erro ao carregar reserva:', erro);
        alert('Erro ao carregar dados da reserva');
    }
}

// Salvar reserva (criar ou editar)
document.getElementById('formEditarReserva').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('reservaId').value;
    const chaleIdValue = document.getElementById('reservaChaleId').value;
    
    // Dados base para criação/edição
    const dadosBase = {
        chale_id: chaleIdValue ? parseInt(chaleIdValue) : null,
        nome_hospede: document.getElementById('reservaNome').value,
        email_hospede: document.getElementById('reservaEmail').value,
        telefone_hospede: document.getElementById('reservaTelefone').value,
        data_checkin: document.getElementById('reservaCheckin').value,
        data_checkout: document.getElementById('reservaCheckout').value,
        num_adultos: parseInt(document.getElementById('reservaNumAdultos').value),
        num_criancas: parseInt(document.getElementById('reservaNumCriancas').value) || 0,
        mensagem: document.getElementById('reservaMensagem').value
    };
    
    try {
        if (id) {
            // Atualizar reserva existente - incluir status
            const dadosAtualizacao = {
                ...dadosBase,
                status: document.getElementById('reservaStatus').value
            };
            await API.fetchAPI(`/reservas/${id}`, {
                method: 'PUT',
                body: JSON.stringify(dadosAtualizacao)
            });
            alert('Reserva atualizada com sucesso!');
        } else {
            // Criar nova reserva - não enviar status (será definido automaticamente)
            await API.criarReserva(dadosBase);
            alert('Reserva criada com sucesso!');
        }
        
        fecharModal('modalReserva');
        carregarReservas();
        carregarDashboard();
    } catch (erro) {
        console.error('Erro ao salvar reserva:', erro);
        let mensagemErro = 'Erro ao salvar reserva: ';
        
        // Verificar se há detalhes de validação
        if (erro.detalhes && Array.isArray(erro.detalhes)) {
            const detalhes = erro.detalhes.map(d => `${d.campo}: ${d.mensagem}`).join('\n');
            mensagemErro = '❌ Erro de validação:\n' + detalhes;
        } else if (erro.message.includes('disponibilidade') || erro.message.includes('indisponível')) {
            mensagemErro = '❌ O chalé não está disponível para as datas selecionadas.';
        } else if (erro.message.includes('diária mínima')) {
            mensagemErro = '❌ A estadia mínima é de 2 dias.';
        } else if (erro.message.includes('400') || erro.message.includes('inválido')) {
            mensagemErro = '❌ Dados inválidos. Verifique se todos os campos estão preenchidos corretamente.';
        } else if (erro.message.includes('CONEXAO')) {
            mensagemErro = '❌ Não foi possível conectar ao servidor. Verifique se o backend está rodando.';
        } else {
            mensagemErro += erro.message || 'Erro desconhecido';
        }
        
        alert(mensagemErro);
    }
});

// Aprovar reserva (mudar status para confirmada)
async function aprovarReserva(id) {
    if (!confirm('Tem certeza que deseja aprovar esta reserva?\n\nA reserva será confirmada e aparecerá no calendário de disponibilidade.')) {
        return;
    }
    
    try {
        await API.fetchAPI(`/reservas/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status: 'confirmada' })
        });
        
        carregarReservas();
        carregarDashboard();
        alert('✅ Reserva aprovada com sucesso!\n\nA reserva foi confirmada e agora aparece no calendário de disponibilidade.');
    } catch (erro) {
        console.error('Erro ao aprovar reserva:', erro);
        alert('Erro ao aprovar reserva: ' + (erro.message || 'Erro desconhecido'));
    }
}

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
        const resposta = await API.fetchAPI('/chales?ativo=true');
        console.log('Resposta completa da API:', resposta);
        
        // Tratar resposta que pode ser { total, chales } ou array direto
        let chales = [];
        if (Array.isArray(resposta)) {
            chales = resposta;
        } else if (resposta && resposta.chales && Array.isArray(resposta.chales)) {
            chales = resposta.chales;
        } else if (resposta && Array.isArray(resposta)) {
            chales = resposta;
        }
        
        console.log('Chalés extraídos:', chales);
        console.log('Primeiro chalé (exemplo):', chales[0]);
        
        if (chales.length > 0) {
            console.log('Preço dinâmico do primeiro chalé:', {
                preco_diaria_atual: chales[0].preco_diaria_atual,
                preco_base: chales[0].preco_base,
                preco_diaria: chales[0].preco_diaria,
                temporada: chales[0].temporada,
                feriado: chales[0].feriado
            });
        }
        
        mostrarChales(chales);
    } catch (erro) {
        console.error('Erro ao carregar chalés:', erro);
        container.innerHTML = '<p class="error-message">Erro ao carregar chalés: ' + erro.message + '</p>';
    }
}

function mostrarChales(chales) {
    const container = document.getElementById('chalesList');
    
    if (chales.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhum chalé cadastrado</p>';
        return;
    }
    
    container.innerHTML = chales.map(chale => {
        // Usar preço dinâmico se disponível, senão usar preço base
        const precoExibir = chale.preco_diaria_atual || chale.preco_diaria || 0;
        const precoBase = chale.preco_base || chale.preco_diaria || 0;
        const temporadaInfo = chale.temporada ? ` (${chale.temporada})` : '';
        const feriadoInfo = chale.feriado ? ` - ${chale.feriado}` : '';
        
        return `
        <div class="chale-card-admin">
            <h4>${chale.nome}</h4>
            <p>${chale.descricao || 'Sem descrição'}</p>
            <div class="chale-card-info">
                <span>👥 ${chale.capacidade_adultos} adultos</span>
                <span>💰 ${API.formatarValor(precoExibir)}${temporadaInfo}${feriadoInfo}</span>
            </div>
            ${precoExibir !== precoBase ? `<div class="chale-card-info" style="font-size: 0.85em; color: #666;">
                <span>Preço base: ${API.formatarValor(precoBase)}</span>
            </div>` : ''}
            <div class="chale-card-info">
                <span>${chale.ativo ? '✅ Ativo' : '❌ Inativo'}</span>
            </div>
            <div class="chale-card-actions">
                <button class="btn-edit" onclick="editarChale(${chale.id})">Editar</button>
                <button class="btn-delete" onclick="deletarChale(${chale.id})">Excluir</button>
            </div>
        </div>
    `;
    }).join('');
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
window.aprovarReserva = aprovarReserva;
window.editarChale = editarChale;
window.deletarChale = deletarChale;

