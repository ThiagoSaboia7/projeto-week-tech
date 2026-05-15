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

    track.addEventListener('mousedown', dragStart);
    track.addEventListener('mousemove', dragMove);
    track.addEventListener('mouseup', dragEnd);
    track.addEventListener('mouseleave', dragEnd);
    track.addEventListener('touchstart', dragStart);
    track.addEventListener('touchmove', dragMove);
    track.addEventListener('touchend', dragEnd);

    function dragStart(e) {
        isDragging = true;
        startPos = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        track.style.transition = 'none';
        track.style.cursor = 'grabbing';
    }

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
        isDragging = false;
        track.style.cursor = 'grab';
        prevTranslate = currentTranslate;
        const maxScroll = getMaxTranslate();
        const percent = Math.abs(currentTranslate) / maxScroll;
        if (percent < 0.25) currentIndex = 0;
        else if (percent < 0.75) currentIndex = 1;
        else currentIndex = 2;
        applyPosition();
        updateDots();
    }

    if (nextBtn) nextBtn.onclick = () => { if (currentIndex < 2) goToPage(currentIndex + 1); };
    if (prevBtn) prevBtn.onclick = () => { if (currentIndex > 0) goToPage(currentIndex - 1); };
}

/* ════════════════════════════════════════
   ADMIN E LOGIN
   ════════════════════════════════════════ */
function doLogin() {
    const emailField = document.getElementById('login-email');
    const senhaField = document.getElementById('login-senha');

    const email = emailField.value.trim();
    const senha = senhaField.value;

    // 1. Validar se os campos estão vazios (o reportValidity mostrará o balão de required)
    if (!emailField.reportValidity() || !senhaField.reportValidity()) {
        return;
    }

    // 2. Validar credenciais
    if (email === ADMIN_EMAIL && senha === ADMIN_SENHA) {
        sessionStorage.setItem('tw_admin', '1');
        closeModal('modal-login');
        openAdmin();
    } else {
        // 3. Se estiver incorreto, aplica o erro customizado no campo de e-mail
        emailField.setCustomValidity("E-mail ou Senha Incorretos.");
        emailField.reportValidity(); // Mostra o balão com a mensagem acima
    }
}

document.getElementById('login-email')?.addEventListener('input', function () {
    this.setCustomValidity("");
});
document.getElementById('login-senha')?.addEventListener('input', function () {
    // Quando o usuário mexe na senha, também limpamos o erro do e-mail
    document.getElementById('login-email').setCustomValidity("");
});

function openAdmin() {
    document.body.classList.add('admin-logged-in');
    const panel = document.getElementById('admin-panel');
    const faq = document.querySelector('.faq-floating-container');
    if (panel) panel.style.display = 'block';
    if (faq) faq.style.display = 'none';
}

function logout() {
    sessionStorage.removeItem('tw_admin');
    window.location.reload();
}

/* ════════════════════════════════════════
   INICIALIZAÇÃO FINAL
   ════════════════════════════════════════ */
function init() {
    setupCarousel();

    const projetoSection = document.getElementById('projeto-section');
    if (projetoSection) projetoSection.style.display = 'none';

    // --- BOTÕES DO HERO ---
    document.getElementById('btn-hero-inscricao').onclick = () => {
        document.getElementById('inscricoes')?.scrollIntoView({ behavior: 'smooth' });
    };

    document.getElementById('btn-hero-programacao').onclick = () => {
        document.getElementById('palestrantes')?.scrollIntoView({ behavior: 'smooth' });
    };

    // --- BOTÕES DE MODAL ---
    document.getElementById('btn-open-login').onclick = () => sessionStorage.getItem('tw_admin') === '1' ? openAdmin() : openModal('modal-login');
    document.getElementById('btn-do-login').onclick = doLogin;
    document.getElementById('close-login').onclick = () => closeModal('modal-login');

    document.getElementById('btn-open-part').onclick = () => {
        document.getElementById('registroForm').reset();
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

    // --- FECHAR FAQ AO CLICAR FORA ---
    window.addEventListener('click', function (e) {
        const faqContainer = document.querySelector('.faq-floating-container');
        const faqCheckbox = document.getElementById('faq-toggle');

        // Se o FAQ estiver aberto e o clique for fora do container do FAQ
        if (faqCheckbox && faqCheckbox.checked && faqContainer && !faqContainer.contains(e.target)) {
            faqCheckbox.checked = false; // Desmarca o checkbox, fechando o card
        }
    });

    // --- VALIDAÇÕES EM TEMPO REAL ---
    document.getElementById('s-email')?.addEventListener('input', function () { this.setCustomValidity(""); });
    document.getElementById('s-nome')?.addEventListener('input', function () {
        this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");
        this.setCustomValidity("");
    });
    document.getElementById('p-nome')?.addEventListener('input', function () {
        this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");
        this.setCustomValidity("");
    });
    document.getElementById('p-ra')?.addEventListener('input', function (e) {
        let v = e.target.value.replace(/\D/g, "");
        if (v.length > 8) v = v.replace(/^(\d{8})(\d{1}).*/, "$1-$2");
        e.target.value = v;
        this.setCustomValidity("");
    });

    // --- TOGGLE PROJETO ---
    const checkboxProjeto = document.getElementById('p-apresentar');
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
const TARGET = new Date('2026-06-01T18:30:00-03:00').getTime();

function updateCountdown() {
    const dEl = document.getElementById('cd-d');
    const hEl = document.getElementById('cd-h');
    const mEl = document.getElementById('cd-m');
    const sEl = document.getElementById('cd-s');
    const finMsg = document.getElementById('fin-msg');

    if (!dEl) return;

    const diff = TARGET - Date.now();

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
        const cdLabel = document.querySelector('.cd-label');
        if (cdLabel) cdLabel.style.display = 'none';
    }
}

// INICIALIZAÇÃO
updateCountdown();
setInterval(updateCountdown, 1000);
window.onload = init;