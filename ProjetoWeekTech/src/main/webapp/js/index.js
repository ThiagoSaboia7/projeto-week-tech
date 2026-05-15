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

/* ════════════════════════════════════════
   LOGICA DO CAROUSEL (3 DOTS + TRAVA DE FIM)
   ════════════════════════════════════════ */
function setupCarousel() {
    const track = document.getElementById('track');
    const outer = track.parentElement;
    const dotsContainer = document.getElementById('dots');
    const nextBtn = document.getElementById('next');
    const prevBtn = document.getElementById('prev');

    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let currentIndex = 0;

    // 1. Criar exatamente 3 bolinhas
    dotsContainer.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('button');
        dot.classList.add('dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToPage(i));
        dotsContainer.appendChild(dot);
    }
    const dots = Array.from(dotsContainer.children);

    // 2. Calcular o limite máximo de arrasto (impede o espaço em branco)
    function getMaxTranslate() {
        // Largura total de todos os cards somados - largura da área visível
        return track.scrollWidth - outer.offsetWidth;
    }

    function goToPage(index) {
        const maxScroll = getMaxTranslate();
        currentIndex = index;

        // Ponto 0, Ponto Médio, Ponto Final
        if (index === 0) currentTranslate = 0;
        else if (index === 1) currentTranslate = -(maxScroll / 2);
        else if (index === 2) currentTranslate = -maxScroll;

        prevTranslate = currentTranslate;
        applyPosition();
        updateDots();
    }

    function applyPosition() {
        track.style.transition = 'transform 0.4s ease-out';
        track.style.transform = `translateX(${currentTranslate}px)`;
    }

    function updateDots() {
        dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
    }

    // 3. Eventos de Arraste com Trava (Boundaries)
    track.addEventListener('mousedown', dragStart);
    track.addEventListener('mousemove', dragMove);
    track.addEventListener('mouseup', dragEnd);
    track.addEventListener('mouseleave', dragEnd);
    track.addEventListener('touchstart', dragStart);
    track.addEventListener('touchmove', dragMove);
    track.addEventListener('touchend', dragEnd);

    function dragStart(e) {
        isDragging = true;
        startPos = getPositionX(e);
        track.style.transition = 'none';
        track.style.cursor = 'grabbing';
    }

    function dragMove(e) {
        if (!isDragging) return;
        const currentPosition = getPositionX(e);
        let move = prevTranslate + currentPosition - startPos;

        // Trava no início (Esquerda)
        if (move > 0) move = 0;

        // Trava no fim (Direita - evita o espaço em branco)
        const maxScroll = getMaxTranslate();
        if (move < -maxScroll) move = -maxScroll;

        currentTranslate = move;
        track.style.transform = `translateX(${currentTranslate}px)`;
    }

    function dragEnd() {
        if (!isDragging) return;
        isDragging = false;
        track.style.cursor = 'grab';
        prevTranslate = currentTranslate;

        // Sincroniza a bolinha baseada na posição atual
        const maxScroll = getMaxTranslate();
        const percent = Math.abs(currentTranslate) / maxScroll;

        if (percent < 0.25) currentIndex = 0;
        else if (percent < 0.75) currentIndex = 1;
        else currentIndex = 2;

        applyPosition();
        updateDots();
    }

    function getPositionX(e) {
        return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
    }

    // Botões Next/Prev (ajustados para as 3 posições)
    nextBtn.onclick = () => { if (currentIndex < 2) goToPage(currentIndex + 1); };
    prevBtn.onclick = () => { if (currentIndex > 0) goToPage(currentIndex - 1); };
}

/* ════════════════════════════════════════
   PARTICIPANTE (VALIDAÇÕES)
   ════════════════════════════════════════ */
// Máscara R.A.
document.getElementById('p-ra')?.addEventListener('input', function (e) {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length > 8) v = v.replace(/^(\d{8})(\d{1}).*/, "$1-$2");
    e.target.value = v;
    this.setCustomValidity("");
});

document.getElementById('p-nome')?.addEventListener('input', function () {
    this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");
    this.setCustomValidity("");
});

// Submit Participante
document.getElementById('registroForm')?.addEventListener('submit', function (e) {
    const nomeField = document.getElementById('p-nome');
    const raField = document.getElementById('p-ra');
    const inscritos = getInscritos();

    if (nomeField.value.trim().split(/\s+/).length < 2) {
        e.preventDefault();
        nomeField.setCustomValidity("Informe seu nome e pelo menos um sobrenome.");
        nomeField.reportValidity();
        return;
    }

    if (raField.value.length < 10) {
        e.preventDefault();
        raField.setCustomValidity("O R.A. deve estar completo.");
        raField.reportValidity();
        return;
    }

    if (inscritos.some(i => i.ra === raField.value)) {
        e.preventDefault();
        raField.setCustomValidity("Este R.A. já está cadastrado.");
        raField.reportValidity();
        return;
    }

    e.preventDefault();
    addInscrito({
        tipo: 'participante',
        nome: nomeField.value.trim(),
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
   PALESTRANTE (VALIDAÇÕES)
   ════════════════════════════════════════ */
document.getElementById('form-pal')?.addEventListener('submit', async function (e) {
    const nomeField = document.getElementById('s-nome');
    const telField = document.getElementById('s-tel');
    const emailField = document.getElementById('s-email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (nomeField.value.trim().split(/\s+/).length < 2) {
        e.preventDefault();
        nomeField.setCustomValidity("Informe o nome completo do palestrante.");
        nomeField.reportValidity();
        return;
    }

    if (!emailRegex.test(emailField.value.trim())) {
        e.preventDefault();
        emailField.setCustomValidity("Informe um e-mail válido com domínio .com");
        emailField.reportValidity();
        return;
    }

    const telLimpo = telField.value.replace(/\D/g, "");
    if (telLimpo.length < 11) {
        e.preventDefault();
        telField.setCustomValidity("Informe o telefone completo com DDD.");
        telField.reportValidity();
        return;
    }

    e.preventDefault();
    const btn = document.getElementById('btn-do-pal');
    btn.disabled = true;
    btn.innerText = "Enviando...";

    try {
        const b64B = await fileToBase64(document.getElementById('s-briefing').files[0]);
        const b64C = await fileToBase64(document.getElementById('s-curr').files[0]);

        addInscrito({
            tipo: 'palestrante',
            nome: nomeField.value.trim(),
            email: emailField.value.trim(),
            telefone: telField.value,
            tema: document.getElementById('s-tema').value.trim(),
            tempo: document.getElementById('s-tempo').value,
            briefing: b64B,
            curriculo: b64C
        });

        document.getElementById('form-pal-wrap').style.display = 'none';
        document.getElementById('success-pal').style.display = 'block';
    } catch (err) {
        alert("Erro ao processar arquivos.");
    } finally {
        btn.disabled = false;
        btn.innerText = "Enviar Proposta";
    }
});

/* ════════════════════════════════════════
   ADMIN E UI GERAL
   ════════════════════════════════════════ */
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
    if (!data.length) { container.innerHTML = "<p style='padding:20px'>Nenhum registro encontrado.</p>"; return; }

    let html = `<thead><tr><th>#</th><th>Nome</th>`;
    if (currentTab === 'participante') html += `<th>R.A</th><th>Curso</th><th>Coffee</th><th>Projeto</th><th>GitHub</th>`;
    else if (currentTab === 'palestrante') html += `<th>Email</th><th>Telefone</th><th>Tema</th>`;
    else html += `<th>Doc/Tel</th><th>Tipo</th>`;
    html += `<th>Data</th></tr></thead><tbody>`;

    data.forEach((i, idx) => {
        html += `<tr><td>${idx + 1}</td><td><strong>${i.nome}</strong></td>`;
        if (i.tipo === 'participante') {
            if (currentTab === 'participante' || currentTab === 'todos') {
                if (currentTab === 'participante') html += `<td>${i.ra}</td><td>${i.curso}</td><td>${i.coffee ? '✅' : '❌'}</td><td>${i.projeto ? 'Sim' : 'Não'}</td><td>${i.link ? '<a href="' + i.link + '" target="_blank">Link</a>' : '-'}</td>`;
                else html += `<td>${i.ra}</td><td>Participante</td>`;
            }
        } else {
            if (currentTab === 'palestrante' || currentTab === 'todos') {
                if (currentTab === 'palestrante') html += `<td>${i.email}</td><td>${i.telefone}</td><td>${i.tema}</td>`;
                else html += `<td>${i.telefone}</td><td>Palestrante</td>`;
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

let currentTab = 'todos';
function renderStats() {
    const all = getInscritos();
    const statsEl = document.getElementById('admin-stats');
    if (statsEl) statsEl.innerHTML = `<div class="stat-card"><div class="stat-label">Participantes</div><div class="stat-value">${all.filter(i => i.tipo === 'participante').length}</div></div><div class="stat-card"><div class="stat-label">Palestrantes</div><div class="stat-value">${all.filter(i => i.tipo === 'palestrante').length}</div></div>`;
}

function exportCSV() {
    const all = getInscritos();
    const header = 'Nome,Documento,Tipo,Curso,Coffee,Projeto,Data\n';
    const rows = all.map(i => `"${i.nome}","${i.ra || i.telefone}","${i.tipo}","${i.curso || ''}","${i.coffee ? 'Sim' : 'Nao'}","${i.projeto ? 'Sim' : 'Nao'}","${i.data}"`).join('\n');
    const blob = new Blob(['\ufeff' + header + rows], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'inscritos.csv'; a.click();
}

/* ════════════════════════════════════════
   INICIALIZAÇÃO FINAL
   ════════════════════════════════════════ */
function init() {
    setupCarousel();

    document.getElementById('btn-open-login').onclick = () => sessionStorage.getItem('tw_admin') === '1' ? openAdmin() : openModal('modal-login');
    document.getElementById('btn-do-login').onclick = doLogin;
    document.getElementById('close-login').onclick = () => closeModal('modal-login');

    document.getElementById('s-email')?.addEventListener('input', function () { this.setCustomValidity(""); });
    document.getElementById('s-nome')?.addEventListener('input', function () {
        this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");
        this.setCustomValidity("");
    });

    document.getElementById('btn-open-part').onclick = () => {
        document.getElementById('registroForm').reset();
        document.getElementById('form-part-wrap').style.display = 'block';
        document.getElementById('success-part').style.display = 'none';
        projetoSection.style.display = 'none';
        openModal('modal-part');
    };
    document.getElementById('close-part').onclick = () => closeModal('modal-part');

    document.getElementById('btn-open-pal').onclick = () => {
        document.getElementById('form-pal').reset();
        document.getElementById('form-pal-wrap').style.display = 'block';
        document.getElementById('success-pal').style.display = 'none';
        openModal('modal-pal');
    };
    document.getElementById('close-pal').onclick = () => closeModal('modal-pal');

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
        }
    });

    if (sessionStorage.getItem('tw_admin') === '1') openAdmin();
}

// === LOGICA DO COUNTDOWN ===
const TARGET = new Date('2026-06-01T19:00:00-03:00').getTime();

function updateCountdown() {
    const diff = TARGET - Date.now();
    const dEl = document.getElementById('cd-d');
    const hEl = document.getElementById('cd-h');
    const mEl = document.getElementById('cd-m');
    const sEl = document.getElementById('cd-s');
    const finMsg = document.getElementById('fin-msg');

    if (!dEl || !hEl || !mEl || !sEl) return;

    if (diff > 0) {
        const t = Math.floor(diff / 1000);
        dEl.textContent = String(Math.floor(t / 86400)).padStart(2, '0');
        hEl.textContent = String(Math.floor(t / 3600) % 24).padStart(2, '0');
        mEl.textContent = String(Math.floor(t / 60) % 60).padStart(2, '0');
        sEl.textContent = String(t % 60).padStart(2, '0');
    } else {
        if (finMsg) finMsg.style.display = 'block';
        const cdArea = document.getElementById('countdown');
        if (cdArea) cdArea.style.display = 'none';
        // Esconde o rótulo "Contagem Regressiva" 
        const cdLabel = document.querySelector('.cd-label');
        if (cdLabel) cdLabel.style.display = 'none';
    }
}

// INICIA O CONTADOR IMEDIATAMENTE
updateCountdown();
setInterval(updateCountdown, 1000);

window.onload = init;