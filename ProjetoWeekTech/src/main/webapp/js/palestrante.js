/* ════════════════════════════════════════
   VALIDAÇÕES PALESTRANTE
════════════════════════════════════════ */

// Nome apenas letras
document.getElementById('s-nome').addEventListener('input', function () {

    this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");
});

// Máscara telefone
document.getElementById('s-tel').addEventListener('input', function (e) {

    let v = e.target.value.replace(/\D/g, '');

    // Máximo 11 números
    v = v.substring(0, 11);

    // (43) 9
    if (v.length > 2) {
        v = v.replace(/^(\d{2})(\d)/, '($1) $2');
    }

    // (43) 9 9999-9999
    if (v.length > 10) {
        v = v.replace(/(\d{1})(\d{4})(\d{4})$/, '$1 $2-$3');
    }

    e.target.value = v;
});

/* ════════════════════════════════════════
   ENVIO PALESTRANTE
════════════════════════════════════════ */

document.getElementById('form-pal')
    .addEventListener('submit', async function (e) {

        const form = this;

        /* =========================
           REQUIRED HTML5
        ========================= */

        if (!form.checkValidity()) {

            e.preventDefault();

            form.reportValidity();

            return;
        }

        // Impede reload após validação OK
        e.preventDefault();

        const nome = document.getElementById('s-nome').value.trim();

        const email = document.getElementById('s-email').value.trim();

        const tel = document.getElementById('s-tel').value.trim();

        const tema = document.getElementById('s-tema').value.trim();

        const tempo = document.getElementById('s-tempo').value;

        const bFile = document.getElementById('s-briefing').files[0];

        const cFile = document.getElementById('s-curr').files[0];

        const errEl = document.getElementById('pal-error');

        /* =========================
           TELEFONE
        ========================= */

        if (tel.replace(/\D/g, '').length !== 11) {

            errEl.innerText = 'Telefone inválido.';

            errEl.classList.add('show');

            return;
        }

        /* =========================
           TEMA
        ========================= */

        if (tema.length < 5) {

            errEl.innerText = 'Informe um tema válido.';

            errEl.classList.add('show');

            return;
        }

        /* =========================
           TIPOS DE ARQUIVOS
        ========================= */

        const formatosBriefing = [
            'application/pdf',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        const formatosCurriculo = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        // Briefing
        if (!formatosBriefing.includes(bFile.type)) {

            errEl.innerText =
                'Briefing inválido. Envie PDF, DOC, DOCX, PPT ou PPTX.';

            errEl.classList.add('show');

            return;
        }

        // Currículo
        if (!formatosCurriculo.includes(cFile.type)) {

            errEl.innerText =
                'Currículo inválido. Envie PDF, DOC ou DOCX.';

            errEl.classList.add('show');

            return;
        }

        /* =========================
           TAMANHO DOS ARQUIVOS
        ========================= */

        const limite = 10 * 1024 * 1024;

        if (bFile.size > limite) {

            errEl.innerText =
                'O briefing deve ter no máximo 10MB.';

            errEl.classList.add('show');

            return;
        }

        if (cFile.size > limite) {

            errEl.innerText =
                'O currículo deve ter no máximo 10MB.';

            errEl.classList.add('show');

            return;
        }

        /* =========================
           LIMPA ERRO
        ========================= */

        errEl.classList.remove('show');

        /* =========================
           CONVERTE ARQUIVOS
        ========================= */

        const b64B = await fileToBase64(bFile);

        const b64C = await fileToBase64(cFile);

        /* =========================
           SALVA
        ========================= */

        addInscrito({
            tipo: 'palestrante',
            nome,
            email,
            telefone: tel,
            tema,
            tempo,
            briefing: b64B,
            curriculo: b64C
        });

        /* =========================
           SUCCESS
        ========================= */

        document.getElementById('form-pal-wrap').style.display = 'none';

        document.getElementById('success-pal').style.display = 'block';

        form.reset();
    });