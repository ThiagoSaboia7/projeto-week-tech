/* ════════════════════════════════════════
   CONSTANTES E CONFIGURAÇÕES
   ════════════════════════════════════════ */
const ADMIN_EMAIL = 'admin@techweek.com';
const ADMIN_SENHA = 'TechWeek2026!';

/* ════════════════════════════════════════
   UTILITÁRIOS E STORAGE
   ════════════════════════════════════════ */
function getInscritos() {
    try {
        return JSON.parse(localStorage.getItem('tw_inscritos') || '[]');
    } catch { return []; }
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

function fileToBase64(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
    });
}

/* ════════════════════════════════════════
   MODAIS
   ════════════════════════════════════════ */
function openModal(id) {
    document.getElementById(id).classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeModal(id) {
    document.getElementById(id).classList.remove('open');
    document.body.style.overflow = '';
}

document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
        if (e.target === overlay) closeModal(overlay.id);
    });
});

/* ════════════════════════════════════════
   PARTICIPANTE (FORMULÁRIO E LÓGICA)
   ════════════════════════════════════════ */
const checkboxProjeto = document.getElementById('p-apresentar');
const projetoSection = document.getElementById('projeto-section');
const intInput = document.getElementById('p-integrantes');
const intLabel = document.getElementById('integrantes-label');

// Máscara R.A. (Ex: 25194543-2)
document.getElementById('p-ra')?.addEventListener('input', function (e) {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length > 8) {
        v = v.replace(/^(\d{8})(\d{1}).*/, "$1-$2");
    }
    e.target.value = v;
});

// Máscara Nome (Apenas letras)
document.getElementById('p-nome')?.addEventListener('input', function () {
    this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");
});

// Toggle Projeto (Mostrar/Esconder Seção)
checkboxProjeto?.addEventListener('change', function () {
    const submitContainer = document.getElementById('submit-container');
    if (this.checked) {
        projetoSection.style.display = 'block';
        setTimeout(() => projetoSection.classList.add('open'), 10);
        projetoSection.after(submitContainer);
    } else {
        projetoSection.classList.remove('open');
        setTimeout(() => projetoSection.style.display = 'none', 400);
        document.getElementById('registroForm').appendChild(submitContainer);
    }
});

// Stepper Integrantes
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
        intLabel.textContent = (v - 1) === 1 ? '1 Integrante' : `${v - 1} Integrantes`;
    }
};

function resetPartForm() {
    document.getElementById('form-part-wrap').style.display = 'block';
    document.getElementById('success-part').style.display = 'none';
    document.getElementById('registroForm').reset();
    document.getElementById('part-error').classList.remove('show');
    projetoSection.style.display = 'none';
    projetoSection.classList.remove('open');
}

document.getElementById('registroForm').onsubmit = function (e) {
    e.preventDefault();
    const ra = document.getElementById('p-ra').value;
    const errEl = document.getElementById('part-error');

    if (ra.length < 10) {
        errEl.innerText = "R.A. incompleto.";
        errEl.classList.add('show');
        return;
    }

    addInscrito({
        tipo: 'participante',
        nome: document.getElementById('p-nome').value.trim(),
        ra: ra,
        curso: document.getElementById('p-curso').value,
        serie: document.getElementById('p-serie').value,
        coffee: document.getElementById('p-coffee').checked,
        projeto: checkboxProjeto.checked,
        integrantes: checkboxProjeto.checked ? intInput.value : '',
        link: checkboxProjeto.checked ? document.getElementById('p-link').value.trim() : ''
    });

    document.getElementById('form-part-wrap').style.display = 'none';
    document.getElementById('success-part').style.display = 'block';
};

/* ════════════════════════════════════════
   PALESTRANTE (FORMULÁRIO E MÁSCARAS)
   ════════════════════════════════════════ */
document.getElementById('s-tel')?.addEventListener('input', function (e) {
    let v = e.target.value.replace(/\D/g, '');
    v = v.substring(0, 11);
    if (v.length > 2) v = v.replace(/^(\d{2})(\d)/, '($1) $2');
    if (v.length > 7) v = v.replace(/(\d{5})(\d{4})$/, '$1-$2');
    e.target.value = v;
});

document.getElementById('form-pal').onsubmit = async function (e) {
    e.preventDefault();
    const bFile = document.getElementById('s-briefing').files[0];
    const cFile = document.getElementById('s-curr').files[0];

    const b64B = await fileToBase64(bFile);
    const b64C = await fileToBase64(cFile);

    addInscrito({
        tipo: 'palestrante',
        nome: document.getElementById('s-nome').value.trim(),
        email: document.getElementById('s-email').value.trim(),
        telefone: document.getElementById('s-tel').value.trim(),
        tema: document.getElementById('s-tema').value.trim(),
        tempo: document.getElementById('s-tempo').value,
        briefing: b64B,
        curriculo: b64C
    });

    document.getElementById('form-pal-wrap').style.display = 'none';
    document.getElementById('success-pal').style.display = 'block';
};

/* ════════════════════════════════════════
   ADMIN (PAINEL E TABELA)
   ════════════════════════════════════════ */
let currentTab = 'todos';

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

function openAdmin() {
    document.getElementById('admin-panel').style.display = 'block';
    renderStats();
    renderTable();
}

function switchTab(tab, btn) {
    currentTab = tab;
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    renderTable();
}

function renderStats() {
    const all = getInscritos();
    const parts = all.filter(i => i.tipo === 'participante').length;
    const pals = all.filter(i => i.tipo === 'palestrante').length;
    document.getElementById('admin-stats').innerHTML = `
        <div class="stat-card"><div class="stat-label">Participantes</div><div class="stat-value">${parts}</div></div>
        <div class="stat-card"><div class="stat-label">Palestrantes</div><div class="stat-value">${pals}</div></div>
    `;
}

function renderTable() {
    const container = document.getElementById('admin-table-container');
    const all = getInscritos();
    const q = document.getElementById('admin-search-input').value.toLowerCase();

    let data = currentTab === 'todos' ? all : all.filter(i => i.tipo === currentTab);
    if (q) data = data.filter(i => i.nome.toLowerCase().includes(q) || (i.ra && i.ra.includes(q)));

    if (!data.length) {
        container.innerHTML = "<p style='padding:20px'>Nenhum registro encontrado.</p>";
        return;
    }

    let tableHTML = `<thead><tr><th>#</th><th>Nome</th>`;
    if (currentTab === 'participante') {
        tableHTML += `<th>R.A</th><th>Curso</th><th>Período</th><th>Coffee</th><th>Projeto?</th><th>GitHub</th>`;
    } else if (currentTab === 'palestrante') {
        tableHTML += `<th>Email</th><th>Telefone</th><th>Tema</th>`;
    } else {
        tableHTML += `<th>Doc/Tel</th><th>Tipo</th>`;
    }
    tableHTML += `<th>Data</th></tr></thead><tbody>`;

    data.forEach((i, idx) => {
        tableHTML += `<tr><td>${idx + 1}</td><td><strong>${i.nome}</strong></td>`;
        if (currentTab === 'participante') {
            tableHTML += `<td>${i.ra}</td><td>${i.curso}</td><td>${i.serie}</td><td>${i.coffee ? '✅' : '❌'}</td><td>${i.projeto ? 'Sim (' + i.integrantes + ')' : 'Não'}</td><td>${i.link ? '<a href="' + i.link + '" target="_blank">Link</a>' : '-'}</td>`;
        } else if (currentTab === 'palestrante') {
            tableHTML += `<td>${i.email}</td><td>${i.telefone}</td><td>${i.tema}</td>`;
        } else {
            tableHTML += `<td>${i.ra || i.telefone}</td><td>${i.tipo}</td>`;
        }
        tableHTML += `<td>${i.data}</td></tr>`;
    });

    container.innerHTML = `<table class="admin-table">${tableHTML}</tbody></table>`;
}

function exportCSV() {
    const all = getInscritos();
    const header = 'Nome,Documento,Tipo,Curso,Periodo,Coffee,Projeto,Integrantes,Link,Data\n';
    const rows = all.map(i => `"${i.nome}","${i.ra || i.telefone}","${i.tipo}","${i.curso || ''}","${i.serie || ''}","${i.coffee ? 'Sim' : 'Nao'}","${i.projeto ? 'Sim' : 'Nao'}","${i.integrantes || ''}","${i.link || ''}","${i.data}"`).join('\n');
    const blob = new Blob(['\ufeff' + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'inscritos.csv'; a.click();
}

function logout() {
    sessionStorage.removeItem('tw_admin');
    window.location.reload();
}

/* ════════════════════════════════════════
   GERAL E UI
   ════════════════════════════════════════ */
document.getElementById('btn-open-login').onclick = () => sessionStorage.getItem('tw_admin') === '1' ? openAdmin() : openModal('modal-login');
document.getElementById('btn-open-part').onclick = () => { resetPartForm(); openModal('modal-part'); };
document.getElementById('btn-open-pal').onclick = () => { resetPalForm(); openModal('modal-pal'); };
document.getElementById('close-login').onclick = () => closeModal('modal-login');
document.getElementById('close-part').onclick = () => closeModal('modal-part');
document.getElementById('close-pal').onclick = () => closeModal('modal-pal');
document.getElementById('btn-do-login').onclick = doLogin;

// Countdown
const TARGET = new Date('2026-06-01T00:00:00-03:00').getTime();
setInterval(() => {
    const diff = TARGET - Date.now();
    if (diff > 0) {
        const t = Math.floor(diff / 1000);
        document.getElementById('cd-d').textContent = String(Math.floor(t / 86400)).padStart(2, '0');
        document.getElementById('cd-h').textContent = String(Math.floor(t / 3600) % 24).padStart(2, '0');
        document.getElementById('cd-m').textContent = String(Math.floor(t / 60) % 60).padStart(2, '0');
        document.getElementById('cd-s').textContent = String(t % 60).padStart(2, '0');
    }
}, 1000);

// Carousel
const track = document.getElementById('track');
let cur = 0;
document.getElementById('next').onclick = () => { if (cur < 2) { cur++; track.style.transform = `translateX(-${cur * 33.3}%)`; } };
document.getElementById('prev').onclick = () => { if (cur > 0) { cur--; track.style.transform = `translateX(-${cur * 33.3}%)`; } };

window.onload = () => { if (sessionStorage.getItem('tw_admin') === '1') openAdmin(); };