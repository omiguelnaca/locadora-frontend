// SEGURANÇA E INICIALIZAÇÃO
// =========================================
const userId = localStorage.getItem('userId');
const userName = localStorage.getItem('userName');

// Proteção de rota: Se não logado, volta para login
if (!userId) window.location.href = 'index.html';

// Exibe nome do usuário na tela
if(document.getElementById('userNameDisplay')) {
    document.getElementById('userNameDisplay').textContent = userName || 'Colaborador';
}

// Lógica de Logout
document.getElementById('btnLogout').addEventListener('click', () => {
    Swal.fire({
        title: 'Sair?', icon: 'question', showCancelButton: true,
        confirmButtonColor: '#FFC107', cancelButtonColor: '#d33',
        background: '#1E1E1E', color: '#FFF', confirmButtonText: 'Sim, sair'
    }).then((r) => { if (r.isConfirmed) { localStorage.clear(); window.location.href = 'index.html'; } });
});

// Elementos Globais
const vehicleForm = document.getElementById('vehicleForm');
const vehicleList = document.getElementById('vehicleList');
const totalEl = document.getElementById('totalCars');
const availableEl = document.getElementById('availableCars');

// =========================================
// FUNÇÃO DE LEITURA (READ & STATS)
// =========================================
async function loadVehicles() {
    const result = await fetchAPI('/vehicles');

    if (!result.ok) {
        vehicleList.innerHTML = '<p style="color:#666">Erro ao carregar sistema.</p>'; return;
    }

    const vehicles = result.data;

    // Atualiza Painel de Estatísticas
    if(totalEl) totalEl.textContent = vehicles.length;
    const disponiveis = vehicles.filter(v => v.disponivel === true).length;
    if(availableEl) availableEl.textContent = disponiveis;

    // Renderiza a lista na tela
    vehicleList.innerHTML = '';
    vehicles.forEach(v => {
        const card = document.createElement('div');
        card.className = 'vehicle-card';
        
        // Lógica visual de Status (Verde/Vermelho)
        const isAvailable = v.disponivel; 
        const statusClass = isAvailable ? 'status-disponivel' : 'status-alugado';
        const statusText = isAvailable ? 'Disponível' : 'Alugado';
        
        // Define qual botão de ação mostrar
        const actionBtn = isAvailable 
            ? `<button onclick="toggleStatus(${v.id}, false)" class="btn-action btn-rent">Alugar</button>`
            : `<button onclick="toggleStatus(${v.id}, true)" class="btn-action btn-return">Devolver</button>`;

        // Prepara dados para edição
        const editParams = `'${v.id}', '${v.marca}', '${v.modelo}', '${v.ano}', '${v.placa}', '${v.cor}', '${v.diaria}'`;

        // Injeta HTML do cartão
        card.innerHTML = `
            <span class="status-badge ${statusClass}">${statusText}</span>
            <h4>${v.marca} ${v.modelo}</h4>
            <p><strong>Placa:</strong> ${v.placa}</p>
            <p><strong>Ano:</strong> ${v.ano} | <strong>Cor:</strong> ${v.cor || 'N/A'}</p>
            <p class="price">R$ ${v.diaria}</p>
            ${actionBtn}
            <div style="margin-top: 15px; display: flex; gap: 5px;">
                <button onclick="editVehicle(${editParams})" class="btn-edit" style="width: 50%;">Editar</button>
                <button onclick="deleteVehicle(${v.id})" class="btn-danger" style="width: 50%;">Excluir</button>
            </div>
        `;
        vehicleList.appendChild(card);
    });
}

// FUNÇÃO DE EDIÇÃO (UPDATE)
// =========================================
window.editVehicle = async (id, marca, modelo, ano, placa, cor, diaria) => {
    // Abre Modal com formulário preenchido
    const { value: formValues } = await Swal.fire({
        title: 'Editar Veículo',
        background: '#1E1E1E', color: '#FFF',
        html: `
            <label style="text-align:left; display:block; color:#ccc;">Marca</label>
            <input id="swal-marca" class="swal2-input" value="${marca}">
            <label style="text-align:left; display:block; color:#ccc;">Modelo</label>
            <input id="swal-modelo" class="swal2-input" value="${modelo}">
            <label style="text-align:left; display:block; color:#ccc;">Placa</label>
            <input id="swal-placa" class="swal2-input" value="${placa}">
            <label style="text-align:left; display:block; color:#ccc;">Diária (R$)</label>
            <input id="swal-diaria" type="number" step="0.01" class="swal2-input" value="${diaria}">
        `,
        focusConfirm: false, showCancelButton: true, confirmButtonColor: '#3498db', confirmButtonText: 'Salvar Alterações',
        preConfirm: () => {
            return {
                marca: document.getElementById('swal-marca').value,
                modelo: document.getElementById('swal-modelo').value,
                placa: document.getElementById('swal-placa').value,
                diaria: document.getElementById('swal-diaria').value
            }
        }
    });

    // Envia atualização (PUT)
    if (formValues) {
        const result = await fetchAPI(`/vehicles/${id}`, 'PUT', formValues);
        if (result.ok) {
            Swal.fire({ icon: 'success', title: 'Atualizado!', background: '#1E1E1E', color: '#FFF', timer: 1500, showConfirmButton: false });
            loadVehicles();
        } else {
            Swal.fire({ icon: 'error', title: 'Erro', text: result.data.error, background: '#1E1E1E', color: '#FFF' });
        }
    }
}

// MUDAR STATUS (UPDATE PARCIAL)
// =========================================
window.toggleStatus = async (id, novoStatus) => {
    const result = await fetchAPI(`/vehicles/${id}`, 'PUT', { disponivel: novoStatus });
    if (result.ok) {
        const msg = novoStatus ? 'Devolvido ao pátio.' : 'Alugado com sucesso.';
        Swal.fire({ icon: 'success', title: 'Atualizado!', text: msg, timer: 1500, showConfirmButton: false, background: '#1E1E1E', color: '#FFF' });
        loadVehicles();
    } else {
        Swal.fire({ icon: 'error', title: 'Erro', text: 'Erro ao atualizar.', background: '#1E1E1E', color: '#FFF' });
    }
};

// CADASTRAR (CREATE)
// =========================================
vehicleForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = vehicleForm.querySelector('button');
    btn.textContent = 'Salvando...'; btn.disabled = true;

    const data = {
        marca: document.getElementById('marca').value,
        modelo: document.getElementById('modelo').value,
        ano: document.getElementById('ano').value,
        placa: document.getElementById('placa').value,
        cor: document.getElementById('cor').value,
        diaria: document.getElementById('diaria').value,
        user_id: userId,
        disponivel: true
    };

    try {
        const result = await fetchAPI('/vehicles', 'POST', data);
        if (result.ok) {
            await Swal.fire({ icon: 'success', title: 'Sucesso!', background: '#1E1E1E', color: '#FFF', confirmButtonColor: '#FFC107' });
            vehicleForm.reset(); loadVehicles();
        } else {
            Swal.fire({ icon: 'error', title: 'Erro', text: result.data.error, background: '#1E1E1E', color: '#FFF' });
        }
    } catch (err) { console.error(err); }
    finally { btn.textContent = 'Cadastrar Veículo'; btn.disabled = false; }
});

// EXCLUIR (DELETE)
// =========================================
window.deleteVehicle = async (id) => {
    const r = await Swal.fire({ title: 'Excluir?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', background: '#1E1E1E', color: '#FFF' });
    if (r.isConfirmed) {
        const res = await fetchAPI(`/vehicles/${id}`, 'DELETE');
        if (res.ok) { loadVehicles(); }
    }
};

// Inicia aplicação
loadVehicles();