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
        if (!file) return resolve(null);
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
    });
}

/* ════════════════════════════════════════
   CONTROLE DE MODAIS
   ════════════════════════════════════════ */
function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }
}

document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
        if (e.target === overlay) closeModal(overlay.id);
    });
});

/* ════════════════════════════════════════
   PARTICIPANTE (LOGICA COM VALIDAÇÃO NATIVA)
   ════════════════════════════════════════ */
const checkboxProjeto = document.getElementById('p-apresentar');
const projetoSection = document.getElementById('projeto-section');
const intInput = document.getElementById('p-integrantes');
const intLabel = document.getElementById('integrantes-label');

if (projetoSection) projetoSection.style.display = 'none';

// Máscara R.A. e Limpeza de Erro customizado
document.getElementById('p-ra')?.addEventListener('input', function (e) {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length > 8) v = v.replace(/^(\d{8})(\d{1}).*/, "$1-$2");
    e.target.value = v;

    // IMPORTANTE: Limpa a mensagem de erro enquanto o usuário digita
    this.setCustomValidity("");
});

document.getElementById('p-nome')?.addEventListener('input', function () {
    this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");
    this.setCustomValidity("");
});

// Toggle Projeto
checkboxProjeto?.addEventListener('change', function () {
    const submitContainer = document.getElementById('submit-container');
    const linkInput = document.getElementById('p-link');

    if (this.checked) {
        projetoSection.style.display = 'block';
        setTimeout(() => projetoSection.classList.add('open'), 10);
        projetoSection.after(submitContainer);
        linkInput.required = true;
    } else {
        projetoSection.classList.remove('open');
        setTimeout(() => { if (!this.checked) projetoSection.style.display = 'none'; }, 400);
        document.getElementById('registroForm').appendChild(submitContainer);
        linkInput.required = false;
        linkInput.value = "";
    }
});

// Stepper Integrantes
document.getElementById('inc-int')?.addEventListener('click', () => {
    let v = parseInt(intInput.value);
    if (v < 5) { intInput.value = v + 1; intLabel.textContent = `${v + 1} Integrantes`; }
});
document.getElementById('dec-int')?.addEventListener('click', () => {
    let v = parseInt(intInput.value);
    if (v > 1) { intInput.value = v - 1; intLabel.textContent = (v - 1) === 1 ? '1 Integrante' : `${v - 1} Integrantes`; }
});

// SUBMIT PARTICIPANTE
document.getElementById('registroForm')?.addEventListener('submit', function (e) {

    const nomeField = document.getElementById('p-nome');
    const nomeValor = nomeField.value.trim();

    // Verifica se tem pelo menos 2 palavras (Nome e Sobrenome)
    if (nomeValor.split(" ").length < 2) {
        e.preventDefault();
        nomeField.setCustomValidity("Por favor, informe seu nome e pelo menos um sobrenome.");
        nomeField.reportValidity();
        return;
    }
    
    const raField = document.getElementById('p-ra');
    const inscritos = getInscritos();

    // 1. Validação de Tamanho do R.A. (8 números + traço + 1 número = 10 caracteres)
    if (raField.value.length < 10) {
        e.preventDefault();
        raField.setCustomValidity("O R.A. deve estar completo.");
        raField.reportValidity(); // Força o balão do navegador a aparecer
        return;
    }

    // 2. Validação de Duplicidade
    if (inscritos.some(i => i.ra === raField.value)) {
        e.preventDefault();
        raField.setCustomValidity("Este R.A. já está cadastrado.");
        raField.reportValidity();
        return;
    }

    // Se passou, salva
    e.preventDefault();
    addInscrito({
        tipo: 'participante',
        nome: document.getElementById('p-nome').value.trim(),
        ra: raField.value,
        curso: document.getElementById('p-curso').value,
        serie: document.getElementById('p-serie').value,
        coffee: document.getElementById('p-coffee').checked,
        projeto: checkboxProjeto.checked,
        integrantes: checkboxProjeto.checked ? intInput.value : '',
        link: checkboxProjeto.checked ? document.getElementById('p-link').value.trim() : ''
    });

    document.getElementById('form-part-wrap').style.display = 'none';
    document.getElementById('success-part').style.display = 'block';
});

/* ════════════════════════════════════════
   PALESTRANTE (LOGICA SIMPLIFICADA)
   ════════════════════════════════════════ */
function resetPalForm() {
    document.getElementById('form-pal-wrap').style.display = 'block';
    document.getElementById('success-pal').style.display = 'none';
    document.getElementById('form-pal').reset();
}

document.getElementById('s-tel')?.addEventListener('input', function (e) {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 11) v = v.substring(0, 11);
    if (v.length > 0) v = '(' + v;
    if (v.length > 3) v = v.substring(0, 3) + ') ' + v.substring(3);
    if (v.length > 9) v = v.substring(0, 10) + '-' + v.substring(10);
    e.target.value = v;
    this.setCustomValidity("");
});

document.getElementById('form-pal')?.addEventListener('submit', async function (e) {
    e.preventDefault();
    const telField = document.getElementById('s-tel');
    const telLimpo = telField.value.replace(/\D/g, "");

    // Validação de tamanho do telefone
    if (telLimpo.length < 11) {
        telField.setCustomValidity("O telefone deve ter 11 dígitos.");
        telField.reportValidity();
        return;
    }

    const btn = document.getElementById('btn-do-pal');
    btn.disabled = true;
    btn.innerText = "Enviando...";

    const b64B = await fileToBase64(document.getElementById('s-briefing').files[0]);
    const b64C = await fileToBase64(document.getElementById('s-curr').files[0]);

    addInscrito({
        tipo: 'palestrante',
        nome: document.getElementById('s-nome').value.trim(),
        email: document.getElementById('s-email').value.trim(),
        telefone: telField.value,
        tema: document.getElementById('s-tema').value.trim(),
        tempo: document.getElementById('s-tempo').value,
        briefing: b64B,
        curriculo: b64C
    });

    document.getElementById('form-pal-wrap').style.display = 'none';
    document.getElementById('success-pal').style.display = 'block';
    btn.disabled = false;
    btn.innerText = "Enviar Proposta";
});

/* ════════════════════════════════════════
   ADMIN E UI GERAL
   ════════════════════════════════════════ */
let currentTab = 'todos';

function openAdmin() {
    document.body.classList.add('admin-logged-in');
    const panel = document.getElementById('admin-panel');
    const faq = document.querySelector('.faq-floating-container');
    if (panel) panel.style.display = 'block';
    if (faq) faq.style.display = 'none';
    renderStats();
    renderTable();
}

function doLogin() {
    const email = document.getElementById('login-email').value.trim();
    const senha = document.getElementById('login-senha').value;
    if (email === ADMIN_EMAIL && senha === ADMIN_SENHA) {
        sessionStorage.setItem('tw_admin', '1');
        closeModal('modal-login');
        openAdmin();
    } else {
        alert("E-mail ou Senha incorretos.");
    }
}

function logout() {
    sessionStorage.removeItem('tw_admin');
    window.location.reload();
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

    let html = `<thead><tr><th>#</th><th>Nome</th>`;
    if (currentTab === 'participante') html += `<th>R.A</th><th>Curso</th><th>Coffee</th><th>Projeto</th><th>GitHub</th>`;
    else if (currentTab === 'palestrante') html += `<th>Email</th><th>Telefone</th><th>Tema</th>`;
    else html += `<th>Doc/Tel</th><th>Tipo</th>`;
    html += `<th>Data</th></tr></thead><tbody>`;

    data.forEach((i, idx) => {
        html += `<tr><td>${idx + 1}</td><td><strong>${i.nome}</strong></td>`;
        if (i.tipo === 'participante') {
            if (currentTab === 'participante' || currentTab === 'todos') {
                if (currentTab === 'participante') {
                    html += `<td>${i.ra}</td><td>${i.curso}</td><td>${i.coffee ? '✅' : '❌'}</td><td>${i.projeto ? 'Sim' : 'Não'}</td><td>${i.link ? '<a href="' + i.link + '" target="_blank">Link</a>' : '-'}</td>`;
                } else {
                    html += `<td>${i.ra}</td><td>Participante</td>`;
                }
            }
        } else {
            if (currentTab === 'palestrante' || currentTab === 'todos') {
                if (currentTab === 'palestrante') {
                    html += `<td>${i.email}</td><td>${i.telefone}</td><td>${i.tema}</td>`;
                } else {
                    html += `<td>${i.telefone}</td><td>Palestrante</td>`;
                }
            }
        }
        html += `<td>${i.data}</td></tr>`;
    });
    container.innerHTML = `<table class="admin-table">${html}</tbody></table>`;
}

function switchTab(tab, btn) {
    currentTab = tab;
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    renderTable();
}

function renderStats() {
    const all = getInscritos();
    const statsEl = document.getElementById('admin-stats');
    if (statsEl) {
        statsEl.innerHTML = `
            <div class="stat-card"><div class="stat-label">Participantes</div><div class="stat-value">${all.filter(i => i.tipo === 'participante').length}</div></div>
            <div class="stat-card"><div class="stat-label">Palestrantes</div><div class="stat-value">${all.filter(i => i.tipo === 'palestrante').length}</div></div>
        `;
    }
}

function exportCSV() {
    const all = getInscritos();
    const header = 'Nome,Documento,Tipo,Curso,Coffee,Projeto,Data\n';
    const rows = all.map(i => `"${i.nome}","${i.ra || i.telefone}","${i.tipo}","${i.curso || ''}","${i.coffee ? 'Sim' : 'Nao'}","${i.projeto ? 'Sim' : 'Nao'}","${i.data}"`).join('\n');
    const blob = new Blob(['\ufeff' + header + rows], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'inscritos_techweek.csv';
    a.click();
}

/* ════════════════════════════════════════
   BOTÕES E EVENTOS UI
   ════════════════════════════════════════ */
document.getElementById('btn-open-login').onclick = () => sessionStorage.getItem('tw_admin') === '1' ? openAdmin() : openModal('modal-login');

document.getElementById('btn-open-part').onclick = () => {
    document.getElementById('registroForm').reset();
    document.getElementById('form-part-wrap').style.display = 'block';
    document.getElementById('success-part').style.display = 'none';
    if (projetoSection) projetoSection.style.display = 'none';
    openModal('modal-part');
};

document.getElementById('btn-open-pal').onclick = () => {
    resetPalForm();
    openModal('modal-pal');
};

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

window.onload = () => {
    if (sessionStorage.getItem('tw_admin') === '1') openAdmin();
};