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
        document.body.classList.add('modal-open');
    }
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
        document.body.classList.remove('modal-open');
    }
}

/* ════════════════════════════════════════
   LOGICA DO CAROUSEL
   ════════════════════════════════════════ */
function setupCarousel() {
    const track = document.getElementById('track');
    const outer = track?.parentElement;
    const dotsContainer = document.getElementById('dots');
    const nextBtn = document.getElementById('next');
    const prevBtn = document.getElementById('prev');

    if (!track || !dotsContainer) return;

    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let currentIndex = 0;

    dotsContainer.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('button');
        dot.classList.add('dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToPage(i));
        dotsContainer.appendChild(dot);
    }
    const dots = Array.from(dotsContainer.children);

    function getMaxTranslate() {
        return track.scrollWidth - outer.offsetWidth;
    }

    function goToPage(index) {
        const maxScroll = getMaxTranslate();
        currentIndex = index;
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

    track.addEventListener('mousedown', (e) => {
        isDragging = true;
        startPos = e.pageX;
        track.style.transition = 'none';
        track.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const currentPosition = e.pageX;
        let move = prevTranslate + currentPosition - startPos;
        if (move > 0) move = 0;
        const maxScroll = getMaxTranslate();
        if (move < -maxScroll) move = -maxScroll;
        currentTranslate = move;
        track.style.transform = `translateX(${currentTranslate}px)`;
    });

    window.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        track.style.cursor = 'grab';
        prevTranslate = currentTranslate;
        const maxScroll = getMaxTranslate();
        const percent = Math.abs(currentTranslate) / (maxScroll || 1);
        if (percent < 0.25) currentIndex = 0;
        else if (percent < 0.75) currentIndex = 1;
        else currentIndex = 2;
        applyPosition();
        updateDots();
    });

    if (nextBtn) nextBtn.onclick = () => { if (currentIndex < 2) goToPage(currentIndex + 1); };
    if (prevBtn) prevBtn.onclick = () => { if (currentIndex > 0) goToPage(currentIndex - 1); };
}

/* ════════════════════════════════════════
   ADMIN E LOGIN
   ════════════════════════════════════════ */
function doLogin() {
    const emailField = document.getElementById('login-email');
    const senhaField = document.getElementById('login-senha');
    if (emailField.value.trim() === ADMIN_EMAIL && senhaField.value === ADMIN_SENHA) {
        sessionStorage.setItem('tw_admin', '1');
        closeModal('modal-login');
        openAdmin();
    } else {
        emailField.setCustomValidity("E-mail ou Senha incorretos.");
        emailField.reportValidity();
    }
}

function openAdmin() {
    document.body.classList.add('admin-logged-in');
    const panel = document.getElementById('admin-panel');
    const faq = document.querySelector('.faq-floating-container');
    if (panel) panel.style.display = 'block';
    if (faq) faq.style.display = 'none';
    renderStats();
    renderTable();
}

function logout() {
    sessionStorage.removeItem('tw_admin');
    window.location.reload();
}

// Alterado para começar em 'participante' em vez de 'todos'
let currentTab = 'participante';

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
    const total = all.length; // Soma de todos

    const statsEl = document.getElementById('admin-stats');
    if (statsEl) {
        statsEl.innerHTML = `
            <div class="stat-card">
                <div class="stat-label">Total Geral</div>
                <div class="stat-value">${total}</div>
            </div>
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
}

function renderTable() {
    const container = document.getElementById('admin-table-container');
    const all = getInscritos();
    const q = document.getElementById('admin-search-input').value.toLowerCase();

    // 1. Primeiro filtramos pela aba ativa
    let data = all.filter(i => i.tipo === currentTab);

    // 2. Aplicamos a pesquisa separada por categoria
    if (q) {
        data = data.filter(i => {
            const nomeMatch = i.nome.toLowerCase().includes(q);

            if (currentTab === 'participante') {
                // Participante: Busca APENAS por Nome ou R.A.
                const raMatch = i.ra && i.ra.toLowerCase().includes(q);
                return nomeMatch || raMatch;
            } else {
                // Palestrante: Busca APENAS por Nome ou E-mail
                const emailMatch = i.email && i.email.toLowerCase().includes(q);
                return nomeMatch || emailMatch;
            }
        });
    }

    if (!data.length) {
        container.innerHTML = "<p style='padding:20px'>Nenhum registro encontrado para esta pesquisa.</p>";
        return;
    }

    // 3. Montagem do cabeçalho da tabela
    let html = `<thead><tr><th>#</th><th>Nome</th>`;
    if (currentTab === 'participante') {
        html += `<th>R.A</th><th>Curso</th><th>Coffee</th><th>Projeto</th><th>GitHub</th>`;
    } else {
        html += `<th>Email</th><th>Telefone</th><th>Tema</th>`;
    }
    html += `<th>Data</th></tr></thead><tbody>`;

    // 4. Montagem das linhas da tabela
    data.forEach((i, idx) => {
        html += `<tr><td>${idx + 1}</td><td><strong>${i.nome}</strong></td>`;
        if (currentTab === 'participante') {
            const projInfo = i.projeto ? `Sim (${i.integrantes})` : 'Não';
            html += `<td>${i.ra}</td><td>${i.curso}</td><td>${i.coffee ? '✅' : '❌'}</td><td>${projInfo}</td><td>${i.link ? `<a href="${i.link}" target="_blank">Ver</a>` : '-'}</td>`;
        } else {
            html += `<td>${i.email}</td><td>${i.telefone}</td><td>${i.tema}</td>`;
        }
        html += `<td>${i.data}</td></tr>`;
    });

    container.innerHTML = `<table class="admin-table">${html}</tbody></table>`;
}

function exportCSV() {
    const all = getInscritos();
    const header = 'Nome,Documento,Tipo,Curso,Coffee,Projeto,Integrantes,GitHub,Data\n';
    const rows = all.map(i => `"${i.nome}","${i.ra || i.telefone}","${i.tipo}","${i.curso || ''}","${i.coffee ? 'Sim' : 'Nao'}","${i.projeto ? 'Sim' : 'Nao'}","${i.integrantes || ''}","${i.link || ''}","${i.data}"`).join('\n');
    const blob = new Blob(['\ufeff' + header + rows], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'inscritos.csv'; a.click();
}

/* ════════════════════════════════════════
   INICIALIZAÇÃO E EVENTOS
   ════════════════════════════════════════ */
function init() {
    setupCarousel();

    const projetoSection = document.getElementById('projeto-section');
    const intInput = document.getElementById('p-integrantes');
    const intLabel = document.getElementById('integrantes-label');

    // LOGICA DO STEPPER 
    document.getElementById('inc-int').onclick = (e) => {
        e.preventDefault();
        let v = parseInt(intInput.value);
        if (v < 5) { intInput.value = v + 1; intLabel.textContent = (v + 1) + " Integrantes"; }
    };
    document.getElementById('dec-int').onclick = (e) => {
        e.preventDefault();
        let v = parseInt(intInput.value);
        if (v > 1) { intInput.value = v - 1; intLabel.textContent = (v - 1 === 1) ? "1 Integrante" : (v - 1) + " Integrantes"; }
    };

    // FAQ: Fechar ao clicar fora
    window.addEventListener('click', function (e) {
        const faqContainer = document.querySelector('.faq-floating-container');
        const faqToggle = document.getElementById('faq-toggle');
        if (faqToggle?.checked && faqContainer && !faqContainer.contains(e.target)) {
            faqToggle.checked = false;
        }
    });

    document.getElementById('btn-open-login').onclick = () => sessionStorage.getItem('tw_admin') === '1' ? openAdmin() : openModal('modal-login');
    document.getElementById('btn-do-login').onclick = doLogin;
    document.getElementById('close-login').onclick = () => closeModal('modal-login');

    document.getElementById('btn-hero-inscricao').onclick = () => document.getElementById('inscricoes')?.scrollIntoView({ behavior: 'smooth' });
    document.getElementById('btn-hero-programacao').onclick = () => document.getElementById('palestrantes')?.scrollIntoView({ behavior: 'smooth' });

    document.getElementById('btn-open-part').onclick = () => {
        document.getElementById('registroForm').reset();
        intInput.value = 1;
        intLabel.textContent = "1 Integrante";
        document.getElementById('form-part-wrap').style.display = 'block';
        document.getElementById('success-part').style.display = 'none';
        if (projetoSection) projetoSection.style.display = 'none';
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

    // Máscaras e Limpezas
    document.getElementById('p-nome')?.addEventListener('input', function () { this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, ""); this.setCustomValidity(""); });
    document.getElementById('s-nome')?.addEventListener('input', function () { this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, ""); this.setCustomValidity(""); });
    document.getElementById('p-ra')?.addEventListener('input', function (e) {
        let v = e.target.value.replace(/\D/g, "");
        if (v.length > 8) v = v.replace(/^(\d{8})(\d{1}).*/, "$1-$2");
        e.target.value = v; this.setCustomValidity("");
    });
    document.getElementById('s-email')?.addEventListener('input', function () { this.setCustomValidity(""); });

    // Toggle Projeto
    document.getElementById('p-apresentar')?.addEventListener('change', function () {
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

    // Submits
    document.getElementById('registroForm').onsubmit = function (e) {
        const nomeField = document.getElementById('p-nome');
        const raField = document.getElementById('p-ra');
        if (nomeField.value.trim().split(/\s+/).length < 2) {
            e.preventDefault(); nomeField.setCustomValidity("Informe nome e sobrenome."); nomeField.reportValidity(); return;
        }
        if (raField.value.length < 10) {
            e.preventDefault(); raField.setCustomValidity("O R.A. deve estar completo."); raField.reportValidity(); return;
        }
        if (getInscritos().some(i => i.ra === raField.value)) {
            e.preventDefault(); raField.setCustomValidity("Este R.A. já está cadastrado."); raField.reportValidity(); return;
        }
        e.preventDefault();
        addInscrito({
            tipo: 'participante', nome: nomeField.value.trim(), ra: raField.value,
            curso: document.getElementById('p-curso').value, serie: document.getElementById('p-serie').value,
            coffee: document.getElementById('p-coffee').checked, projeto: document.getElementById('p-apresentar').checked,
            integrantes: document.getElementById('p-apresentar').checked ? intInput.value : '0',
            link: document.getElementById('p-apresentar').checked ? document.getElementById('p-link').value.trim() : ''
        });
        document.getElementById('form-part-wrap').style.display = 'none';
        document.getElementById('success-part').style.display = 'block';
        renderStats(); // Atualiza painel admin se aberto
    };

    document.getElementById('form-pal').onsubmit = async function (e) {
        const nomeField = document.getElementById('s-nome');
        const emailField = document.getElementById('s-email');
        if (nomeField.value.trim().split(/\s+/).length < 2) {
            e.preventDefault(); nomeField.setCustomValidity("Informe nome e sobrenome."); nomeField.reportValidity(); return;
        }
        e.preventDefault();
        const btn = document.getElementById('btn-do-pal');
        btn.disabled = true;
        try {
            const b64B = await fileToBase64(document.getElementById('s-briefing').files[0]);
            const b64C = await fileToBase64(document.getElementById('s-curr').files[0]);
            addInscrito({
                tipo: 'palestrante', nome: nomeField.value.trim(), email: emailField.value.trim(),
                telefone: document.getElementById('s-tel').value, tema: document.getElementById('s-tema').value.trim(),
                tempo: document.getElementById('s-tempo').value, briefing: b64B, curriculo: b64C
            });
            document.getElementById('form-pal-wrap').style.display = 'none';
            document.getElementById('success-pal').style.display = 'block';
            renderStats(); // Atualiza painel admin se aberto
        } catch (err) { alert("Erro nos arquivos."); } finally { btn.disabled = false; }
    };

    if (sessionStorage.getItem('tw_admin') === '1') openAdmin();

    // Countdown
    const TARGET = new Date('2026-06-01T19:00:00-03:00').getTime();
    setInterval(() => {
        const diff = TARGET - Date.now();
        if (diff > 0) {
            const t = Math.floor(diff / 1000);
            document.getElementById('cd-d').textContent = String(Math.floor(t / 86400)).padStart(2, '0');
            document.getElementById('cd-h').textContent = String(Math.floor(t / 3600) % 24).padStart(2, '0');
            document.getElementById('cd-m').textContent = String(Math.floor(t / 60) % 60).padStart(2, '0');
            document.getElementById('cd-s').textContent = String(t % 60).padStart(2, '0');
        } else {
            const msg = document.getElementById('fin-msg');
            if (msg) msg.style.display = 'block';
            const cd = document.getElementById('countdown');
            if (cd) cd.style.display = 'none';
        }
    }, 1000);
}

window.onload = init;