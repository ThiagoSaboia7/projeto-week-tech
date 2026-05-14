/* ════════════════════════════════════════
   CONFIGURAÇÕES E BANCO DE DADOS
════════════════════════════════════════ */
const ADMIN_EMAIL = 'admin@techweek.com';
const ADMIN_SENHA = 'TechWeek2026!';

function getInscritos() {
    try {
        return JSON.parse(localStorage.getItem('tw_inscritos') || '[]');
    } catch {
        return [];
    }
}

function saveInscritos(arr) {
    localStorage.setItem('tw_inscritos', JSON.stringify(arr));
}

function addInscrito(obj) {
    const arr = getInscritos();

    obj.id = Date.now();
    obj.data = new Date().toLocaleString('pt-BR');

    arr.push(obj);

    saveInscritos(arr);
}

/* ════════════════════════════════════════
   MODAIS – ABRIR / FECHAR
════════════════════════════════════════ */
function openModal(id) {
    document.getElementById(id).classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeModal(id) {
    document.getElementById(id).classList.remove('open');
    document.body.style.overflow = '';
}

// Fechar ao clicar no overlay
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
        if (e.target === overlay) {
            closeModal(overlay.id);
        }
    });
});

// Botões de fechamento
document.getElementById('close-login').onclick = () => closeModal('modal-login');

document.getElementById('close-part').onclick = () => {
    closeModal('modal-part');
    resetPartForm();
};

document.getElementById('close-pal').onclick = () => {
    closeModal('modal-pal');
    resetPalForm();
};

// Botões de abertura
document.getElementById('btn-open-login').onclick = () => {

    if (sessionStorage.getItem('tw_admin') === '1') {
        openAdmin();
        return;
    }

    openModal('modal-login');
};

document.getElementById('btn-open-part').onclick = () => {
    resetPartForm();
    openModal('modal-part');
};

document.getElementById('btn-open-pal').onclick = () => {
    resetPalForm();
    openModal('modal-pal');
};

// Scroll Hero
document.getElementById('btn-hero-inscricao').onclick = () => {
    document.getElementById('inscricoes').scrollIntoView({
        behavior: 'smooth'
    });
};

document.getElementById('btn-hero-programacao').onclick = () => {
    document.getElementById('palestrantes').scrollIntoView({
        behavior: 'smooth'
    });
};

/* ════════════════════════════════════════
   VALIDAÇÕES EM TEMPO REAL
════════════════════════════════════════ */

// Nome apenas letras
document.getElementById('p-nome').addEventListener('input', function () {
    this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");
});

// Máscara R.A
document.getElementById('p-ra').addEventListener('input', function (e) {

    let v = e.target.value.replace(/\D/g, "");

    if (v.length > 8) {
        v = v.replace(/^(\d{8})(\d{1}).*/, "$1-$2");
    }

    e.target.value = v;
});

/* ════════════════════════════════════════
   FORMULÁRIO PARTICIPANTE
════════════════════════════════════════ */
function resetPartForm() {

    document.getElementById('form-part-wrap').style.display = 'block';
    document.getElementById('success-part').style.display = 'none';

    document.getElementById('registroForm').reset();

    document.getElementById('part-error').classList.remove('show');

    projetoSection.classList.remove('open');
    projetoSection.style.display = 'none';
}

document.getElementById('registroForm').addEventListener('submit', function (e) {

    e.preventDefault();

    const nome = document.getElementById('p-nome').value.trim();
    const ra = document.getElementById('p-ra').value.trim();
    const curso = document.getElementById('p-curso').value;
    const serie = document.getElementById('p-serie').value;

    const coffee = document.getElementById('p-coffee').checked;
    const apresentaProjeto = document.getElementById('p-apresentar').checked;

    const errEl = document.getElementById('part-error');

    // Validação R.A
    if (ra.length < 10) {

        errEl.innerText = "R.A. incompleto.";
        errEl.classList.add('show');

        return;
    }

    // Verifica R.A duplicado
    const inscritos = getInscritos();

    const raJaExiste = inscritos.some(inscrito =>
        inscrito.ra &&
        inscrito.ra.replace(/\D/g, '') === ra.replace(/\D/g, '')
    );

    if (raJaExiste) {

        errEl.innerText = "Este R.A. já está inscrito no evento.";
        errEl.classList.add('show');

        return;
    }

    // Projeto
    const linkProjeto = document.getElementById('p-link').value.trim();

    if (apresentaProjeto && !linkProjeto) {

        errEl.innerText = "Informe o link do seu projeto.";
        errEl.classList.add('show');

        return;
    }

    // Tudo OK
    errEl.classList.remove('show');

    addInscrito({
        tipo: 'participante',
        nome,
        ra,
        curso,
        serie,
        coffee,
        projeto: apresentaProjeto,
        integrantes: apresentaProjeto ? intInput.value : '',
        link: apresentaProjeto ? linkProjeto : ''
    });

    document.getElementById('form-part-wrap').style.display = 'none';
    document.getElementById('success-part').style.display = 'block';
});

/* ════════════════════════════════════════
   TOGGLE PROJETO
════════════════════════════════════════ */
const checkboxProjeto = document.getElementById('p-apresentar');
const projetoSection = document.getElementById('projeto-section');

checkboxProjeto.addEventListener('change', function () {

    const submitContainer = document.getElementById('submit-container');

    if (this.checked) {

        projetoSection.style.display = 'block';

        setTimeout(() => {
            projetoSection.classList.add('open');
        }, 10);

        projetoSection.after(submitContainer);

    } else {

        projetoSection.classList.remove('open');

        setTimeout(() => {
            projetoSection.style.display = 'none';
        }, 400);

        document.getElementById('registroForm').appendChild(submitContainer);
    }
});

/* ════════════════════════════════════════
   STEPPER INTEGRANTES
════════════════════════════════════════ */
const intInput = document.getElementById('p-integrantes');
const intLabel = document.getElementById('integrantes-label');

document.getElementById('inc-int').onclick = () => {

    let v = parseInt(intInput.value);

    if (v < 5) {
        intInput.value = v + 1;
        intLabel.textContent = `${v + 1} Integrantes`;
    }
};

document.getElementById('dec-int').onclick = () => {

    let v = parseInt(intInput.value);

    if (v > 1) {

        intInput.value = v - 1;

        intLabel.textContent =
            (v - 1) === 1
                ? '1 Integrante'
                : `${v - 1} Integrantes`;
    }
};

/* ════════════════════════════════════════
   LOGIN E ADMIN PANEL
════════════════════════════════════════ */
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

/* ════════════════════════════════════════
   PALESTRANTE
════════════════════════════════════════ */
function resetPalForm() {

    document.getElementById('form-pal-wrap').style.display = 'block';

    document.getElementById('success-pal').style.display = 'none';

    document.getElementById('pal-error').classList.remove('show');
}

function fileToBase64(file) {

    return new Promise((resolve) => {

        const reader = new FileReader();

        reader.onload = () => resolve(reader.result);

        reader.readAsDataURL(file);
    });
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

/* ════════════════════════════════════════
   COUNTDOWN
════════════════════════════════════════ */
const TARGET = new Date('2026-06-01T00:00:00-03:00').getTime();

(function tick() {

    const diff = TARGET - Date.now();

    if (diff > 0) {

        const t = Math.floor(diff / 1000);

        document.getElementById('cd-d').textContent =
            String(Math.floor(t / 86400)).padStart(2, '0');

        document.getElementById('cd-h').textContent =
            String(Math.floor(t / 3600) % 24).padStart(2, '0');

        document.getElementById('cd-m').textContent =
            String(Math.floor(t / 60) % 60).padStart(2, '0');

        document.getElementById('cd-s').textContent =
            String(t % 60).padStart(2, '0');

        setTimeout(tick, 1000);

    } else {

        document.getElementById('fin-msg').style.display = 'block';
    }

})();

/* ════════════════════════════════════════
   CAROUSEL
════════════════════════════════════════ */
const track = document.getElementById('track');

let cur = 0;

document.getElementById('next').onclick = () => {

    if (cur < 2) {

        cur++;

        track.style.transform =
            `translateX(-${cur * 33.3}%)`;
    }
};

document.getElementById('prev').onclick = () => {

    if (cur > 0) {

        cur--;

        track.style.transform =
            `translateX(-${cur * 33.3}%)`;
    }
};