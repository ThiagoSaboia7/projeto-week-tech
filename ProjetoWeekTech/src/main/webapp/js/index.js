/* ════════════════════════════════════════
   CONFIGURAÇÕES (ALTERE AQUI)
════════════════════════════════════════ */
const ADMIN_EMAIL = 'admin@techweek.com';
const ADMIN_SENHA = 'TechWeek2026!';

/* ════════════════════════════════════════
   BANCO DE DADOS (localStorage)
════════════════════════════════════════ */
function getInscritos() {
    try { return JSON.parse(localStorage.getItem('tw_inscritos') || '[]'); } catch { return []; }
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
   SESSÃO ADMIN
════════════════════════════════════════ */
function isLogged() { return sessionStorage.getItem('tw_admin') === '1'; }
function setLogged() { sessionStorage.setItem('tw_admin', '1'); }
function clearLogged() { sessionStorage.removeItem('tw_admin'); }

/* ════════════════════════════════════════
   MODAIS – abrir / fechar
════════════════════════════════════════ */
function openModal(id) {
    document.getElementById(id).classList.add('open');
    document.body.style.overflow = 'hidden';
}
function closeModal(id) {
    document.getElementById(id).classList.remove('open');
    document.body.style.overflow = '';
}

// fechar ao clicar no overlay
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
        if (e.target === overlay) closeModal(overlay.id);
    });
});

// botões de fechamento
document.getElementById('close-login').onclick = () => closeModal('modal-login');
document.getElementById('close-part').onclick = () => { closeModal('modal-part'); resetPartForm(); };
document.getElementById('close-pal').onclick = () => { closeModal('modal-pal'); resetPalForm(); };

// abrir login
document.getElementById('btn-open-login').onclick = () => {
    if (isLogged()) { openAdmin(); return; }
    openModal('modal-login');
};

// abrir inscrição participante
document.getElementById('btn-open-part').onclick = () => { resetPartForm(); openModal('modal-part'); };
document.getElementById('btn-open-pal').onclick = () => { resetPalForm(); openModal('modal-pal'); };
document.getElementById('btn-hero-inscricao').onclick = () => {
    document.getElementById('inscricoes').scrollIntoView({ behavior: 'smooth' });
};
document.getElementById('btn-hero-programacao').onclick = () => {
    document.getElementById('palestrantes').scrollIntoView({ behavior: 'smooth' });
};

/* ════════════════════════════════════════
   LOGIN
════════════════════════════════════════ */
function doLogin() {
    const email = document.getElementById('login-email').value.trim();
    const senha = document.getElementById('login-senha').value;
    const err = document.getElementById('login-error');

    if (email === ADMIN_EMAIL && senha === ADMIN_SENHA) {
        err.classList.remove('show');
        setLogged();
        closeModal('modal-login');
        setTimeout(openAdmin, 200);
    } else {
        err.classList.add('show');
        document.getElementById('login-senha').value = '';
    }
}

document.getElementById('btn-do-login').onclick = doLogin;
document.getElementById('login-senha').addEventListener('keydown', e => {
    if (e.key === 'Enter') doLogin();
});
document.getElementById('login-email').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('login-senha').focus();
});

/* ════════════════════════════════════════
   ADMIN PANEL
════════════════════════════════════════ */
let currentTab = 'todos';

function openAdmin() {
    document.getElementById('admin-panel').style.display = 'block';
    document.body.style.overflow = 'hidden';
    renderStats();
    renderTable();
}

function closeAdmin() {
    document.getElementById('admin-panel').style.display = 'none';
    document.body.style.overflow = '';
}

function logout() {
    clearLogged();
    closeAdmin();
}

function switchTab(tab, btn) {
    currentTab = tab;
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    const titles = { todos: 'Todas as inscrições', participante: 'Inscrições de Participantes', palestrante: 'Inscrições de Palestrantes' };
    document.getElementById('table-title').textContent = titles[tab];
    document.getElementById('admin-search-input').value = '';
    renderTable();
}

function renderStats() {
    const all = getInscritos();
    const parts = all.filter(i => i.tipo === 'participante');
    const pals = all.filter(i => i.tipo === 'palestrante');
    const coffee = parts.filter(i => i.coffee).length;

    document.getElementById('admin-stats').innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Total de Inscritos</div>
      <div class="stat-value">${all.length}</div>
      <div class="stat-sub">desde o início</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Participantes</div>
      <div class="stat-value">${parts.length}</div>
      <div class="stat-sub">alunos inscritos</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Palestrantes</div>
      <div class="stat-value">${pals.length}</div>
      <div class="stat-sub">propostas recebidas</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Coffee Break</div>
      <div class="stat-value">${coffee}</div>
      <div class="stat-sub">confirmados</div>
    </div>
  `;
}

function renderTable() {
    const q = (document.getElementById('admin-search-input').value || '').toLowerCase();
    const all = getInscritos();
    let data = currentTab === 'todos' ? all : all.filter(i => i.tipo === currentTab);

    if (q) data = data.filter(i =>
        (i.nome || '').toLowerCase().includes(q) ||
        (i.email || '').toLowerCase().includes(q)
    );

    const container = document.getElementById('admin-table-container');

    if (data.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-icon">📋</div><p>Nenhuma inscrição encontrada.</p></div>`;
        return;
    }

    const isPart = currentTab === 'participante';
    const isPal = currentTab === 'palestrante';
    const isTodos = currentTab === 'todos';

    let cols = `<th>#</th><th>Nome</th><th>E-mail</th><th>Tipo</th><th>Data</th>`;
    if (isPart) cols = `<th>#</th><th>Nome</th><th>R.A.</th><th>E-mail</th><th>Curso</th><th>Série</th><th>Coffee</th><th>Data</th>`;
    if (isPal) cols = `<th>#</th><th>Nome</th><th>E-mail</th><th>Telefone</th><th>Tema da Palestra</th><th>Tempo</th><th>Data</th>`;

    const rows = data.map((i, idx) => {
        if (isPart) return `
      <tr>
        <td>${idx + 1}</td>
        <td><strong>${i.nome}</strong></td>
        <td>${i.ra || '—'}</td>
        <td>${i.email}</td>
        <td>${i.curso || '—'}</td>
        <td>${i.serie || '—'}</td>
        <td>${i.coffee ? '✅' : '—'}</td>
        <td style="color:#8a93b8;font-size:12px">${i.data}</td>
      </tr>`;
        if (isPal) return `
      <tr>
        <td>${idx + 1}</td>
        <td><strong>${i.nome}</strong></td>
        <td>${i.email}</td>
        <td>${i.telefone || '—'}</td>
        <td>${i.tema || '—'}</td>
        <td>${i.tempo || '—'}</td>
        <td style="color:#8a93b8;font-size:12px">${i.data}</td>
      </tr>`;
        return `
      <tr>
        <td>${idx + 1}</td>
        <td><strong>${i.nome}</strong></td>
        <td>${i.email}</td>
        <td><span class="badge ${i.tipo === 'participante' ? 'badge-part' : 'badge-pal'}">${i.tipo === 'participante' ? 'Participante' : 'Palestrante'}</span></td>
        <td style="color:#8a93b8;font-size:12px">${i.data}</td>
      </tr>`;
    }).join('');

    container.innerHTML = `
    <table class="admin-table">
      <thead><tr>${cols}</tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function exportCSV() {
    const all = getInscritos();
    if (!all.length) { alert('Nenhum inscrito para exportar.'); return; }
    const header = 'ID,Tipo,Nome,RA,Email,Curso,Série,Coffee,Telefone,Tema,Tempo,Currículo,Briefing,Data';
    const rows = all.map(i => [
        i.id, i.tipo, `"${i.nome}"`, i.ra || '', i.email, i.curso || '', i.serie || '',
        i.coffee ? 'Sim' : 'Não', i.telefone || '', `"${i.tema || ''}"`,
        i.tempo || '', i.curriculo || '', `"${(i.briefing || '').replace(/"/g, '\'')}"`, i.data
    ].join(',')).join('\n');
    const blob = new Blob([header + '\n' + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'inscritos-techweek.csv'; a.click();
    URL.revokeObjectURL(url);
}

/* ════════════════════════════════════════
   FORMULÁRIO PARTICIPANTE
════════════════════════════════════════ */
function resetPartForm() {
    document.getElementById('form-part-wrap').style.display = 'block';
    document.getElementById('success-part').style.display = 'none';
    ['p-nome', 'p-ra', 'p-email'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('p-curso').value = '';
    document.getElementById('p-serie').value = '';
    document.getElementById('p-coffee').checked = false;
    document.getElementById('part-error').classList.remove('show');
}

document.getElementById('btn-do-part').onclick = () => {
    const nome = document.getElementById('p-nome').value.trim();
    const ra = document.getElementById('p-ra').value.trim();
    const email = document.getElementById('p-email').value.trim();
    const curso = document.getElementById('p-curso').value;
    const serie = document.getElementById('p-serie').value;
    const coffee = document.getElementById('p-coffee').checked;
    const err = document.getElementById('part-error');

    if (!nome || !ra || !email || !curso || !serie) {
        err.classList.add('show'); return;
    }
    err.classList.remove('show');
    addInscrito({ tipo: 'participante', nome, ra, email, curso, serie, coffee });
    document.getElementById('form-part-wrap').style.display = 'none';
    document.getElementById('success-part').style.display = 'block';
};

/* ════════════════════════════════════════
   FORMULÁRIO PALESTRANTE
════════════════════════════════════════ */
function resetPalForm() {
    document.getElementById('form-pal-wrap').style.display = 'block';
    document.getElementById('success-pal').style.display = 'none';
    ['s-nome', 's-email', 's-tel', 's-tema', 's-briefing', 's-curr'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('s-tempo').value = '';
    document.getElementById('pal-error').classList.remove('show');
}

document.getElementById('btn-do-pal').onclick = () => {
    const nome = document.getElementById('s-nome').value.trim();
    const email = document.getElementById('s-email').value.trim();
    const telefone = document.getElementById('s-tel').value.trim();
    const tema = document.getElementById('s-tema').value.trim();
    const briefing = document.getElementById('s-briefing').value.trim();
    const tempo = document.getElementById('s-tempo').value;
    const curriculo = document.getElementById('s-curr').value.trim();
    const err = document.getElementById('pal-error');

    if (!nome || !email || !telefone || !tema || !briefing || !tempo || !curriculo) {
        err.classList.add('show'); return;
    }
    err.classList.remove('show');
    addInscrito({ tipo: 'palestrante', nome, email, telefone, tema, briefing, tempo, curriculo });
    document.getElementById('form-pal-wrap').style.display = 'none';
    document.getElementById('success-pal').style.display = 'block';
};

/* ════════════════════════════════════════
   COUNTDOWN
════════════════════════════════════════ */
const TARGET = new Date('2026-06-01T00:00:00-03:00').getTime();
const elD = document.getElementById('cd-d');
const elH = document.getElementById('cd-h');
const elM = document.getElementById('cd-m');
const elS = document.getElementById('cd-s');
const fin = document.getElementById('fin-msg');

function pad(n) { return String(n).padStart(2, '0'); }

function flip(el, val) {
    const v = pad(val);
    if (el.textContent === v) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(-5px)';
    setTimeout(() => { el.textContent = v; el.style.opacity = ''; el.style.transform = ''; }, 110);
}

(function tick() {
    const diff = TARGET - Date.now();
    if (diff <= 0) {
        [elD, elH, elM, elS].forEach(e => e.textContent = '00');
        fin.style.display = 'block'; return;
    }
    const t = Math.floor(diff / 1000);
    flip(elD, Math.floor(t / 86400));
    flip(elH, Math.floor(t / 3600) % 24);
    flip(elM, Math.floor(t / 60) % 60);
    flip(elS, t % 60);
    setTimeout(tick, 1000);
})();

/* ════════════════════════════════════════
   CAROUSEL
════════════════════════════════════════ */
const track = document.getElementById('track');
const dotsEl = document.getElementById('dots');
const btnPrev = document.getElementById('prev');
const btnNext = document.getElementById('next');

const CARDS = track.children.length;
let cur = 0;

function vis() { return window.innerWidth < 640 ? 1 : window.innerWidth < 900 ? 2 : 3; }
function maxSlide() { return Math.max(0, CARDS - vis()); }

function buildDots() {
    dotsEl.innerHTML = '';
    for (let i = 0; i <= maxSlide(); i++) {
        const b = document.createElement('button');
        b.className = 'dot' + (i === cur ? ' active' : '');
        b.setAttribute('aria-label', `Slide ${i + 1}`);
        b.addEventListener('click', () => goTo(i));
        dotsEl.appendChild(b);
    }
}

function goTo(idx) {
    cur = Math.max(0, Math.min(idx, maxSlide()));
    const cardW = track.children[0].offsetWidth;
    const gap = 22;
    track.style.transform = `translateX(-${cur * (cardW + gap)}px)`;
    dotsEl.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === cur));
    btnPrev.disabled = cur === 0;
    btnNext.disabled = cur >= maxSlide();
}

btnPrev.addEventListener('click', () => goTo(cur - 1));
btnNext.addEventListener('click', () => goTo(cur + 1));
window.addEventListener('resize', () => { buildDots(); goTo(Math.min(cur, maxSlide())); });
buildDots(); goTo(0);

/* drag/swipe */
let dragStart = null, dragDelta = 0;
track.addEventListener('pointerdown', e => { dragStart = e.clientX; dragDelta = 0; track.classList.add('dragging'); track.setPointerCapture(e.pointerId); });
track.addEventListener('pointermove', e => { if (dragStart === null) return; dragDelta = e.clientX - dragStart; });
track.addEventListener('pointerup', () => { if (dragStart === null) return; track.classList.remove('dragging'); dragStart = null; if (dragDelta < -60) goTo(cur + 1); else if (dragDelta > 60) goTo(cur - 1); else goTo(cur); });

