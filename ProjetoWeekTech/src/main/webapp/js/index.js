/* BOTÕES ABRIR */
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

/* HERO */
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