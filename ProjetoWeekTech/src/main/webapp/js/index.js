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
   PARTICIPANTE (MÁSCARAS E VALIDAÇÕES)
   ════════════════════════════════════════ */
const checkboxProjeto = document.getElementById('p-apresentar');
const projetoSection = document.getElementById('projeto-section');
const intInput = document.getElementById('p-integrantes');
const intLabel = document.getElementById('integrantes-label');
const partError = document.getElementById('part-error');

if (projetoSection) projetoSection.style.display = 'none';

// Máscara R.A.
document.getElementById('p-ra')?.addEventListener('input', function (e) {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length > 8) v = v.replace(/^(\d{8})(\d{1}).*/, "$1-$2");
    e.target.value = v;
    partError.classList.remove('show');
});

// Máscara Nome: Bloqueia números e limpa erro
document.getElementById('p-nome')?.addEventListener('input', function () {
    this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");
    partError.classList.remove('show');
});

// Toggle Projeto: Apenas mostra/esconde (O erro Focusable foi resolvido removendo o required manual)
checkboxProjeto?.addEventListener('change', function () {
    const submitContainer = document.getElementById('submit-container');
    const linkInput = document.getElementById('p-link');

    if (this.checked) {
        projetoSection.style.display = 'block';
        setTimeout(() => projetoSection.classList.add('open'), 10);
        projetoSection.after(submitContainer);
    } else {
        projetoSection.classList.remove('open');
        setTimeout(() => { if (!this.checked) projetoSection.style.display = 'none'; }, 400);
        document.getElementById('registroForm').appendChild(submitContainer);
        linkInput.value = "";
    }
    partError.classList.remove('show');
});

// Stepper Integrantes
document.getElementById('inc-int')?.addEventListener('click', () => {
    let v = parseInt(intInput.value);
    if (v < 5) {
        intInput.value = v + 1;
        intLabel.textContent = `${v + 1} Integrantes`;
    }
});
document.getElementById('dec-int')?.addEventListener('click', () => {
    let v = parseInt(intInput.value);
    if (v > 1) {
        intInput.value = v - 1;
        intLabel.textContent = (v - 1) === 1 ? '1 Integrante' : `${v - 1} Integrantes`;
    }
});

// SUBMIT PARTICIPANTE (Validação unificada com faixa vermelha)
document.getElementById('registroForm')?.addEventListener('submit', function (e) {
    e.preventDefault(); // Impede o balão "required" padrão para os campos de texto se houver conflito

    const nome = document.getElementById('p-nome');
    const ra = document.getElementById('p-ra');
    const curso = document.getElementById('p-curso');
    const serie = document.getElementById('p-serie');
    const link = document.getElementById('p-link');
    const inscritos = getInscritos();

    const dispararErro = (msg, campo) => {
        partError.innerText = msg;
        partError.classList.add('show');
        campo.focus();
        return false;
    };

    // 1. Validar Nome
    if (nome.value.trim().length < 3) return dispararErro("O campo Nome Completo é obrigatório.", nome);

    // 2. Validar R.A.
    if (!ra.value) return dispararErro("O campo R.A. é obrigatório.", ra);
    if (ra.value.length < 10) return dispararErro("O R.A. deve ter 9 dígitos.", ra);

    // 3. Validar Duplicidade
    if (inscritos.some(i => i.ra === ra.value)) return dispararErro("Este R.A. já está cadastrado no evento!", ra);

    // 6. Validar Link do Projeto (SÓ SE O CHECKBOX ESTIVER MARCADO)
    if (checkboxProjeto.checked && !link.value.trim()) {
        return dispararErro("O link do GitHub é obrigatório para quem apresenta projeto.", link);
    }

    // TUDO CERTO - SALVAR
    partError.classList.remove('show');
    addInscrito({
        tipo: 'participante',
        nome: nome.value.trim(),
        ra: ra.value,
        curso: curso.value,
        serie: serie.value,
        coffee: document.getElementById('p-coffee').checked,
        projeto: checkboxProjeto.checked,
        integrantes: checkboxProjeto.checked ? intInput.value : '',
        link: checkboxProjeto.checked ? link.value.trim() : ''
    });

    document.getElementById('form-part-wrap').style.display = 'none';
    document.getElementById('success-part').style.display = 'block';
});

/* ════════════════════════════════════════
   PALESTRANTE (LÓGICA)
   ════════════════════════════════════════ */
function resetPalForm() {
    document.getElementById('form-pal-wrap').style.display = 'block';
    document.getElementById('success-pal').style.display = 'none';
    document.getElementById('pal-error').classList.remove('show');
    document.getElementById('form-pal').reset();
}

document.getElementById('s-nome')?.addEventListener('input', function () {
    this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");
});

document.getElementById('s-tel')?.addEventListener('input', function (e) {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 11) v = v.substring(0, 11);
    if (v.length > 0) v = '(' + v;
    if (v.length > 3) v = v.substring(0, 3) + ') ' + v.substring(3);
    if (v.length > 9) v = v.substring(0, 10) + '-' + v.substring(10);
    e.target.value = v;
});

document.getElementById('form-pal')?.addEventListener('submit', async function (e) {
    e.preventDefault();
    const btn = document.getElementById('btn-do-pal');
    const errEl = document.getElementById('pal-error');

    try {
        btn.disabled = true;
        btn.innerText = "Enviando...";
        const bFile = document.getElementById('s-briefing').files[0];
        const cFile = document.getElementById('s-curr').files[0];
        const b64B = await fileToBase64(bFile);
        const b64C = await fileToBase64(cFile);

        addInscrito({
            tipo: 'palestrante',
            nome: document.getElementById('s-nome').value.trim(),
            email: document.getElementById('s-email').value.trim(),
            telefone: document.getElementById('s-tel').value,
            tema: document.getElementById('s-tema').value.trim(),
            tempo: document.getElementById('s-tempo').value,
            briefing: b64B,
            curriculo: b64C
        });

        document.getElementById('form-pal-wrap').style.display = 'none';
        document.getElementById('success-pal').style.display = 'block';
    } catch (err) {
        errEl.innerText = "Erro ao processar arquivos.";
        errEl.classList.add('show');
    } finally {
        btn.disabled = false;
        btn.innerText = "Enviar Proposta";
    }
});

/* ════════════════════════════════════════
   ADMIN E LOGIN
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
        document.getElementById('login-error').classList.add('show');
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
    else html += `<th>Identificador</th><th>Tipo</th>`;
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
   INICIALIZAÇÃO DE EVENTOS UI
   ════════════════════════════════════════ */
document.getElementById('btn-open-login').onclick = () => sessionStorage.getItem('tw_admin') === '1' ? openAdmin() : openModal('modal-login');

document.getElementById('btn-open-part').onclick = () => {
    document.getElementById('registroForm').reset();
    document.getElementById('form-part-wrap').style.display = 'block';
    document.getElementById('success-part').style.display = 'none';
    document.getElementById('part-error').classList.remove('show');
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