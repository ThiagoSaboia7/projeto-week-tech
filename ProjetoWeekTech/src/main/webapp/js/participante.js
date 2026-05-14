const checkboxProjeto = document.getElementById('p-apresentar');
const projetoSection = document.getElementById('projeto-section');

const intInput = document.getElementById('p-integrantes');
const intLabel = document.getElementById('integrantes-label');

/* FECHAR MODAL */
document.getElementById('close-part').onclick = () => {
    closeModal('modal-part');
    resetPartForm();
};

/* MÁSCARA NOME */
document.getElementById('p-nome').addEventListener('input', function () {
    this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");
});

/* MÁSCARA RA */
document.getElementById('p-ra').addEventListener('input', function (e) {

    let v = e.target.value.replace(/\D/g, "");

    if (v.length > 8) {
        v = v.replace(/^(\d{8})(\d{1}).*/, "$1-$2");
    }

    e.target.value = v;
});

/* RESET FORM */
function resetPartForm() {

    document.getElementById('form-part-wrap').style.display = 'block';

    document.getElementById('success-part').style.display = 'none';

    document.getElementById('registroForm').reset();

    document.getElementById('part-error').classList.remove('show');

    projetoSection.classList.remove('open');

    projetoSection.style.display = 'none';
}

/* SUBMIT */
document.getElementById('registroForm').addEventListener('submit', function (e) {

    e.preventDefault();

    const nome = document.getElementById('p-nome').value.trim();
    const ra = document.getElementById('p-ra').value.trim();
    const curso = document.getElementById('p-curso').value;
    const serie = document.getElementById('p-serie').value;

    const coffee = document.getElementById('p-coffee').checked;
    const apresentaProjeto = document.getElementById('p-apresentar').checked;

    const errEl = document.getElementById('part-error');

    if (ra.length < 10) {

        errEl.innerText = "R.A. incompleto.";
        errEl.classList.add('show');

        return;
    }

    const inscritos = getInscritos();

    const raJaExiste = inscritos.some(inscrito =>
        inscrito.ra &&
        inscrito.ra.replace(/\D/g, '') === ra.replace(/\D/g, '')
    );

    if (raJaExiste) {

        errEl.innerText = "Este R.A. já está inscrito.";
        errEl.classList.add('show');

        return;
    }

    const linkProjeto = document.getElementById('p-link').value.trim();

    if (apresentaProjeto && !linkProjeto) {

        errEl.innerText = "Informe o link do projeto.";
        errEl.classList.add('show');

        return;
    }

    errEl.classList.remove('show');

    addInscrito({
        tipo: 'participante',
        nome,
        ra,
        curso,
        serie,
        coffee,
        projeto: apresentaProjeto,
        integrantes: apresentaProjeto ? intInput.value : '',
        link: apresentaProjeto ? linkProjeto : ''
    });

    document.getElementById('form-part-wrap').style.display = 'none';

    document.getElementById('success-part').style.display = 'block';
});

/* TOGGLE PROJETO */
checkboxProjeto.addEventListener('change', function () {

    const submitContainer = document.getElementById('submit-container');

    if (this.checked) {

        projetoSection.style.display = 'block';

        setTimeout(() => {
            projetoSection.classList.add('open');
        }, 10);

        projetoSection.after(submitContainer);

    } else {

        projetoSection.classList.remove('open');

        setTimeout(() => {
            projetoSection.style.display = 'none';
        }, 400);

        document.getElementById('registroForm').appendChild(submitContainer);
    }
});

/* STEPPER */
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

        intLabel.textContent =
            (v - 1) === 1
                ? '1 Integrante'
                : `${v - 1} Integrantes`;
    }
};