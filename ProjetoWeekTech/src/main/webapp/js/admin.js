/* FECHAR MODAIS */
document.getElementById('close-login').onclick = () => {
    closeModal('modal-login');
};

document.getElementById('close-pal').onclick = () => {
    closeModal('modal-pal');
    resetPalForm();
};

/* LOGIN */
function doLogin() {

    const email = document.getElementById('login-email').value.trim();
    const senha = document.getElementById('login-senha').value;

    if (email === ADMIN_EMAIL && senha === ADMIN_SENHA) {

        sessionStorage.setItem('tw_admin', '1');

        closeModal('modal-login');

        setTimeout(openAdmin, 200);

    } else {

        document.getElementById('login-error').classList.add('show');
    }
}

document.getElementById('btn-do-login').onclick = doLogin;

function logout() {

    sessionStorage.removeItem('tw_admin');

    window.location.reload();
}

let currentTab = 'todos';

function openAdmin() {

    document.getElementById('admin-panel').style.display = 'block';

    renderStats();

    renderTable();
}

function switchTab(tab, btn) {

    currentTab = tab;

    document.querySelectorAll('.admin-tab')
        .forEach(t => t.classList.remove('active'));

    btn.classList.add('active');

    renderTable();
}

function renderStats() {

    const all = getInscritos();

    const parts = all.filter(i => i.tipo === 'participante').length;
    const pals = all.filter(i => i.tipo === 'palestrante').length;

    document.getElementById('admin-stats').innerHTML = `
        <div class="stat-card">
            <div class="stat-label">Participantes</div>
            <div class="stat-value">${parts}</div>
        </div>

        <div class="stat-card">
            <div class="stat-label">Palestrantes</div>
            <div class="stat-value">${pals}</div>
        </div>
    `;
}

function renderTable() {

    const container = document.getElementById('admin-table-container');

    const all = getInscritos();

    const q = document.getElementById('admin-search-input')
        .value
        .toLowerCase();

    let data =
        currentTab === 'todos'
            ? all
            : all.filter(i => i.tipo === currentTab);

    if (q) {
        data = data.filter(i =>
            i.nome.toLowerCase().includes(q)
        );
    }

    if (!data.length) {

        container.innerHTML =
            "<p style='padding:20px'>Nenhum registro.</p>";

        return;
    }

    const rows = data.map((i, idx) => `

        <tr>
            <td>${idx + 1}</td>
            <td><strong>${i.nome}</strong></td>
            <td>${i.ra || i.telefone || '—'}</td>
            <td>${i.tipo}</td>
            <td>${i.data}</td>
        </tr>

    `).join('');

    container.innerHTML = `
    
        <table class="admin-table">

            <thead>
                <tr>
                    <th>#</th>
                    <th>Nome</th>
                    <th>R.A / Telefone</th>
                    <th>Tipo</th>
                    <th>Data</th>
                </tr>
            </thead>

            <tbody>
                ${rows}
            </tbody>

        </table>
    `;
}

function exportCSV() {

    const all = getInscritos();

    const header = 'Nome,Documento,Tipo,Data\n';

    const rows = all.map(i =>
        `${i.nome},${i.ra || i.telefone},${i.tipo},${i.data}`
    ).join('\n');

    const blob = new Blob(
        [header + rows],
        { type: 'text/csv' }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');

    a.href = url;
    a.download = 'inscritos.csv';

    a.click();
}

/* PALESTRANTE */
function resetPalForm() {

    document.getElementById('form-pal-wrap').style.display = 'block';

    document.getElementById('success-pal').style.display = 'none';

    document.getElementById('pal-error').classList.remove('show');
}

document.getElementById('btn-do-pal').onclick = async () => {

    const nome = document.getElementById('s-nome').value.trim();
    const email = document.getElementById('s-email').value.trim();
    const tel = document.getElementById('s-tel').value.trim();
    const tema = document.getElementById('s-tema').value.trim();

    const bFile = document.getElementById('s-briefing').files[0];
    const cFile = document.getElementById('s-curr').files[0];

    if (!nome || !email || !tel || !tema || !bFile || !cFile) {

        document.getElementById('pal-error').classList.add('show');

        return;
    }

    const b64B = await fileToBase64(bFile);
    const b64C = await fileToBase64(cFile);

    addInscrito({
        tipo: 'palestrante',
        nome,
        email,
        telefone: tel,
        tema,
        briefing: b64B,
        curriculo: b64C
    });

    document.getElementById('form-pal-wrap').style.display = 'none';

    document.getElementById('success-pal').style.display = 'block';
};