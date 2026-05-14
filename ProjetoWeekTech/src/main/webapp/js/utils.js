const ADMIN_EMAIL = 'admin@techweek.com';
const ADMIN_SENHA = 'TechWeek2026!';

/* STORAGE */
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

/* MODAIS */
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
        if (e.target === overlay) {
            closeModal(overlay.id);
        }
    });
});

/* FILE BASE64 */
function fileToBase64(file) {
    return new Promise((resolve) => {

        const reader = new FileReader();

        reader.onload = () => resolve(reader.result);

        reader.readAsDataURL(file);
    });
}

/* COUNTDOWN */
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

/* CAROUSEL */
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