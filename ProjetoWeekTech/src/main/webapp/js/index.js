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
   LOGICA DO CAROUSEL (3 DOTS + TRAVA DE FIM)
   ════════════════════════════════════════ */
function setupCarousel() {
    const track = document.getElementById('track');
    const outer = track?.parentElement;
    const dotsContainer = document.getElementById('dots');
    const nextBtn = document.getElementById('next');
    const prevBtn = document.getElementById('prev');

    if (!track || !dotsContainer) return;

    let isDragging = false, startPos = 0, currentTranslate = 0, prevTranslate = 0, currentIndex = 0;

    dotsContainer.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('button');
        dot.classList.add('dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToPage(i));
        dotsContainer.appendChild(dot);
    }
    const dots = Array.from(dotsContainer.children);

    function getMaxTranslate() { return track.scrollWidth - outer.offsetWidth; }

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

    track.addEventListener('mousedown', dragStart);
    track.addEventListener('mousemove', dragMove);
    track.addEventListener('mouseup', dragEnd);
    track.addEventListener('mouseleave', dragEnd);
    track.addEventListener('touchstart', dragStart);
    track.addEventListener('touchmove', dragMove);
    track.addEventListener('touchend', dragEnd);

    function dragStart(e) { isDragging = true; startPos = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX; track.style.transition = 'none'; track.style.cursor = 'grabbing'; }
    function dragMove(e) {
        if (!isDragging) return;
        const currentPosition = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        let move = prevTranslate + currentPosition - startPos;
        if (move > 0) move = 0;
        const maxScroll = getMaxTranslate();
        if (move < -maxScroll) move = -maxScroll;
        currentTranslate = move;
        track.style.transform = `translateX(${currentTranslate}px)`;
    }
    function dragEnd() {
        if (!isDragging) return;
        isDragging = false; track.style.cursor = 'grab';
        prevTranslate = currentTranslate;
        const maxScroll = getMaxTranslate();
        const percent = Math.abs(currentTranslate) / (maxScroll || 1);
        if (percent < 0.25) currentIndex = 0; else if (percent < 0.75) currentIndex = 1; else currentIndex = 2;
        applyPosition(); updateDots();
    }
    if (nextBtn) nextBtn.onclick = () => { if (currentIndex < 2) goToPage(currentIndex + 1); };
    if (prevBtn) prevBtn.onclick = () => { if (currentIndex > 0) goToPage(currentIndex - 1); };
}

/* ════════════════════════════════════════
   ADMIN: LOGIN E PAINEL
   ════════════════════════════════════════ */
let currentTab = 'participante';

function doLogin() {
    const emailField = document.getElementById('login-email');
    const senhaField = document.getElementById('login-senha');

    const email = emailField.value.trim();
    const senha = senhaField.value.trim();

    emailField.setCustomValidity('');
    senhaField.setCustomValidity('');

    if (!email || !senha) {
        emailField.setCustomValidity("Preencha o E-mail e a Senha");
        emailField.reportValidity();
        return;
    }

    if (email !== ADMIN_EMAIL || senha !== ADMIN_SENHA) {
        senhaField.setCustomValidity("E-mail ou Senha Incorretos");
        senhaField.reportValidity();
        return;
    }

    sessionStorage.setItem('tw_admin', '1');
    closeModal('modal-login');
    openAdmin();
}

function openAdmin() {
    document.body.classList.add('admin-logged-in');

    const panel = document.getElementById('admin-panel');
    const faq = document.querySelector('.faq-floating-container');

    if (panel) {
        panel.style.display = 'block';

        const tabs = document.querySelectorAll('.admin-tab');
        tabs.forEach(btn => {
            if (btn.innerText.includes('Participantes')) btn.classList.add('active');
            else btn.classList.remove('active');
        });

        renderStats();
        renderTable();
    }
    if (faq) faq.style.display = 'none';
}

function logout() {
    sessionStorage.removeItem('tw_admin');
    window.location.reload();
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
    const total = all.length;
    const statsEl = document.getElementById('admin-stats');
    if (statsEl) {
        statsEl.innerHTML = `
            <div class="stat-card"><div class="stat-label">Total Geral</div><div class="stat-value">${total}</div></div>
            <div class="stat-card"><div class="stat-label">Participantes</div><div class="stat-value">${parts}</div></div>
            <div class="stat-card"><div class="stat-label">Palestrantes</div><div class="stat-value">${pals}</div></div>`;
    }
}

function renderTable() {
    const container = document.getElementById('admin-table-container');
    if (!container) return;

    const all = getInscritos();
    const q = document.getElementById('admin-search-input').value.toLowerCase();

    let data = all.filter(i => i.tipo === currentTab);

    if (q) {
        data = data.filter(i => {
            const nMatch = i.nome.toLowerCase().includes(q);
            if (currentTab === 'participante') return nMatch || (i.ra && i.ra.toLowerCase().includes(q));
            return nMatch || (i.email && i.email.toLowerCase().includes(q));
        });
    }

    if (!data.length) { container.innerHTML = "<p style='padding:20px'>Nenhum registro encontrado.</p>"; return; }

    let html = `<thead><tr><th>#</th><th>Nome</th>`;
    if (currentTab === 'participante') {
        html += `<th>R.A</th><th>Curso</th><th>Coffee</th><th>Projeto</th><th>GitHub</th><th>Data</th>`;
    } else {
        html += `<th>Email</th><th>Telefone</th><th>Tema</th><th>Tempo</th><th>Briefing</th><th>Currículo</th><th>Data</th>`;
    }
    html += `</tr></thead><tbody>`;

    data.forEach((i, idx) => {
        html += `<tr><td>${idx + 1}</td><td title="${i.nome}"><strong>${i.nome}</strong></td>`;
        if (currentTab === 'participante') {
            const projInfo = i.projeto ? `Sim (${i.integrantes})` : 'Não';
            html += `<td>${i.ra}</td><td title="${i.curso}">${i.curso}</td><td>${i.coffee ? '✅ Sim' : '❌ Não'}</td><td>${projInfo}</td><td>${i.link ? `<a href="${i.link}" target="_blank" class="btn-download">Ver</a>` : '-'}</td><td>${i.data}</td>`;
        } else {
            const linkBriefing = i.briefing ? `<a href="${i.briefing}" download="briefing_${i.nome}" class="btn-download">📄 Briefing</a>` : '—';
            const linkCurr = i.curriculo ? `<a href="${i.curriculo}" download="curriculo_${i.nome}" class="btn-download">👤 Currículo</a>` : '—';
            html += `<td>${i.email}</td><td>${i.telefone}</td><td title="${i.tema}">${i.tema}</td><td>${i.tempo || '-'}</td><td>${linkBriefing}</td><td>${linkCurr}</td><td>${i.data}</td>`;
        }
        html += `</tr>`;
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
   INICIALIZAÇÃO FINAL
   ════════════════════════════════════════ */
function init() {
    setupCarousel();

    const projetoSection = document.getElementById('projeto-section');
    const intInput = document.getElementById('p-integrantes');
    const intLabel = document.getElementById('integrantes-label');

    // Stepper Logica
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

    // FAQ fechar fora
    window.addEventListener('click', (e) => {
        const faqContainer = document.querySelector('.faq-floating-container');
        const faqToggle = document.getElementById('faq-toggle');
        if (faqToggle?.checked && faqContainer && !faqContainer.contains(e.target)) faqToggle.checked = false;
    });

    // Cliques principais
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

    // Máscaras e Limpeza de Erro
    const inputs = ['login-email', 'login-senha', 'p-nome', 'p-ra', 's-nome', 's-email', 's-tel'];
    inputs.forEach(id => {
        document.getElementById(id)?.addEventListener('input', function () { this.setCustomValidity(""); });
    });

    document.getElementById('p-nome')?.addEventListener('input', function () { this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, ""); });
    document.getElementById('s-nome')?.addEventListener('input', function () { this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, ""); });

    document.getElementById('p-ra')?.addEventListener('input', function (e) {
        let v = e.target.value.replace(/\D/g, "").substring(0, 9);
        if (v.length > 8) v = v.replace(/^(\d{8})(\d)/, "$1-$2");
        e.target.value = v;
    });

    document.getElementById('s-tel')?.addEventListener('input', function (e) {
        if (e.inputType === "deleteContentBackward") return;
        let v = e.target.value.replace(/\D/g, '').substring(0, 11);
        if (v.length > 2) v = '(' + v.substring(0, 2) + ') ' + v.substring(2);
        if (v.length > 9) v = v.substring(0, 10) + '-' + v.substring(10);
        e.target.value = v;
    });

    // Toggle Projeto
    document.getElementById('p-apresentar')?.addEventListener('change', function () {
        const link = document.getElementById('p-link');
        if (this.checked) {
            projetoSection.style.display = 'block';
            setTimeout(() => projetoSection.classList.add('open'), 10);
            link.required = true;
        } else {
            projetoSection.classList.remove('open');
            setTimeout(() => { if (!this.checked) projetoSection.style.display = 'none'; }, 400);
            link.required = false;
        }
    });

    // Submit Participante
    document.getElementById('registroForm').onsubmit = function (e) {
        const n = document.getElementById('p-nome'), r = document.getElementById('p-ra');
        if (n.value.trim().split(/\s+/).length < 2) { e.preventDefault(); n.setCustomValidity("Informe nome e sobrenome."); n.reportValidity(); return; }
        if (r.value.length < 10) { e.preventDefault(); r.setCustomValidity("O R.A. deve estar completo."); r.reportValidity(); return; }
        if (getInscritos().some(i => i.ra === r.value)) { e.preventDefault(); r.setCustomValidity("Este R.A. já está cadastrado."); r.reportValidity(); return; }

        e.preventDefault();
        addInscrito({
            tipo: 'participante', nome: n.value.trim(), ra: r.value,
            curso: document.getElementById('p-curso').value, serie: document.getElementById('p-serie').value,
            coffee: document.getElementById('p-coffee').checked, projeto: document.getElementById('p-apresentar').checked,
            integrantes: document.getElementById('p-apresentar').checked ? intInput.value : '0',
            link: document.getElementById('p-apresentar').checked ? document.getElementById('p-link').value.trim() : ''
        });
        document.getElementById('form-part-wrap').style.display = 'none';
        document.getElementById('success-part').style.display = 'block';
        renderStats();
    };

    // Submit Palestrante
    document.getElementById('form-pal').onsubmit = async function (e) {
        const n = document.getElementById('s-nome'), em = document.getElementById('s-email'), t = document.getElementById('s-tel');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (n.value.trim().split(/\s+/).length < 2) { e.preventDefault(); n.setCustomValidity("Informe nome e sobrenome."); n.reportValidity(); return; }
        if (!emailRegex.test(em.value.trim())) { e.preventDefault(); em.setCustomValidity("E-mail inválido."); em.reportValidity(); return; }
        if (t.value.replace(/\D/g, "").length < 11) { e.preventDefault(); t.setCustomValidity("Telefone incompleto."); t.reportValidity(); return; }

        e.preventDefault();
        const btn = document.getElementById('btn-do-pal'); btn.disabled = true;
        try {
            const b64B = await fileToBase64(document.getElementById('s-briefing').files[0]);
            const b64C = await fileToBase64(document.getElementById('s-curr').files[0]);
            addInscrito({
                tipo: 'palestrante', nome: n.value.trim(), email: em.value.trim(),
                telefone: t.value, tema: document.getElementById('s-tema').value.trim(),
                tempo: document.getElementById('s-tempo').value, briefing: b64B, curriculo: b64C
            });
            document.getElementById('form-pal-wrap').style.display = 'none';
            document.getElementById('success-pal').style.display = 'block';
            renderStats();
        } catch (err) { alert("Erro nos arquivos."); } finally { btn.disabled = false; }
    };

    // Countdown 19:00
    const TARGET = new Date('2026-05-20T19:00:00-03:00').getTime();
    setInterval(() => {
        const diff = TARGET - Date.now();
        if (diff > 0) {
            const t = Math.floor(diff / 1000);
            document.getElementById('cd-d').textContent = String(Math.floor(t / 86400)).padStart(2, '0');
            document.getElementById('cd-h').textContent = String(Math.floor(t / 3600) % 24).padStart(2, '0');
            document.getElementById('cd-m').textContent = String(Math.floor(t / 60) % 60).padStart(2, '0');
            document.getElementById('cd-s').textContent = String(t % 60).padStart(2, '0');
        } else {
            const msg = document.getElementById('fin-msg'); if (msg) msg.style.display = 'block';
            const cd = document.getElementById('countdown'); if (cd) cd.style.display = 'none';
        }
    }, 1000);

    // Persistência de Admin
    if (sessionStorage.getItem('tw_admin') === '1') openAdmin();
}

window.onload = init;