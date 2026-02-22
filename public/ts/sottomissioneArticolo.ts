const token = localStorage.getItem('token');

// 1. Protezione pagina
if (!token) {
    window.location.href = '/';
}

// 2. Legge l'id conferenza dai parametri URL
const params       = new URLSearchParams(window.location.search);
const idConferenza = params.get('id');

if (!idConferenza) {
    window.location.href = '/pages/dashboard/DashboardAutore.html';
}

// 3. Riferimenti agli elementi del DOM
const fileInput   = document.getElementById('file-input')   as HTMLInputElement;
const uploadBtn   = document.querySelector('.btn-attach')    as HTMLButtonElement;
const dropZone    = document.getElementById('drop-zone')     as HTMLElement;
const fileList    = document.getElementById('file-list')     as HTMLElement;
const confirmBtn  = document.getElementById('confirm-btn')   as HTMLButtonElement;
const errorMsg    = document.getElementById('error-msg')     as HTMLElement;
const toast       = document.getElementById('success-toast') as HTMLElement;
const btnToastOk  = document.querySelector('.btn-toast-ok')  as HTMLButtonElement;
const btnCancel   = document.querySelector('.btn-cancel')    as HTMLButtonElement;
const titoloInput = document.getElementById('titolo-input')  as HTMLInputElement;
const topicInput  = document.getElementById('topic-input')   as HTMLInputElement;

// 4. File selezionato (un solo documento per articolo)
let selectedFile: File | null = null;

// 5. Apertura selettore file
uploadBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.click();
});

dropZone.addEventListener('click', () => fileInput.click());

// 6. Drag & drop
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) processFile(files[0]);
});

// 7. Selezione tramite input
fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files.length > 0) {
        processFile(fileInput.files[0]);
    }
});

// 8. Validazione e memorizzazione del file reale
function processFile(file: File): void {
    const validTypes = ['application/pdf'];
    const maxSize    = 16 * 1024 * 1024; // 16 MB

    if (!validTypes.includes(file.type) || file.size > maxSize) {
        errorMsg.style.display = 'block';
        return;
    }

    errorMsg.style.display = 'none';
    selectedFile = file;
    renderFileItem(file);
    updateConfirmButton();
}

// 9. Renderizza il file selezionato nella lista
function renderFileItem(file: File): void {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    fileList.innerHTML = `
        <div class="file-item">
            <svg class="file-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                </path>
            </svg>
            <div class="file-info">
                <p class="file-name">${file.name}</p>
                <p class="file-details">${sizeMB} MB &bull; <span>Pronto per l'invio</span></p>
            </div>
            <button class="btn-delete" id="btn-remove-file" type="button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
            </button>
        </div>
    `;

    document.getElementById('btn-remove-file')?.addEventListener('click', () => {
        selectedFile    = null;
        fileList.innerHTML = '';
        fileInput.value    = '';
        updateConfirmButton();
    });
}

// 10. Abilita il pulsante Conferma solo se tutti i campi sono compilati
function updateConfirmButton(): void {
    const tuttiCompilati =
        selectedFile !== null &&
        titoloInput.value.trim() !== '' &&
        topicInput.value.trim()  !== '';

    confirmBtn.classList.toggle('active', tuttiCompilati);
}

titoloInput.addEventListener('input', updateConfirmButton);
topicInput.addEventListener('input',  updateConfirmButton);

// 11. Riferimento al messaggio di errore invio
const submitErrorMsg = document.getElementById('submit-error-msg') as HTMLElement;

function showSubmitError(msg: string): void {
    submitErrorMsg.textContent    = msg;
    submitErrorMsg.style.display  = 'block';
}

function hideSubmitError(): void {
    submitErrorMsg.style.display = 'none';
}

// 12. Invio al backend tramite FormData (richiesto da multer)
confirmBtn.addEventListener('click', async () => {
    if (!confirmBtn.classList.contains('active')) return;
    if (!selectedFile || !idConferenza) return;

    // Previene doppio invio: disabilita il pulsante durante la chiamata
    confirmBtn.classList.remove('active');
    confirmBtn.disabled = true;
    hideSubmitError();

    const formData = new FormData();
    formData.append('id_conferenza', idConferenza);
    formData.append('titolo',        titoloInput.value.trim());
    formData.append('topic',         topicInput.value.trim());
    formData.append('documento',     selectedFile);

    try {
        const response = await fetch('/api/articolo', {
            method:  'POST',
            headers: { 'Authorization': 'Bearer ' + token },
            body:    formData
            // NON impostare Content-Type: il browser lo setta automaticamente
            // con il boundary corretto per multipart/form-data
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            showSubmitError(err.message ?? 'Errore durante la sottomissione. Riprova.');
            // Riabilita il pulsante per permettere un nuovo tentativo
            confirmBtn.classList.add('active');
            confirmBtn.disabled = false;
            return;
        }

        // Mostra toast e reindirizza dopo 3 secondi
        toast.style.display = 'flex';
        setTimeout(() => {
            window.location.href = '/pages/dashboard/DashboardAutore.html';
        }, 3000);

    } catch (error) {
        showSubmitError('Errore di rete. Controlla la connessione e riprova.');
        confirmBtn.classList.add('active');
        confirmBtn.disabled = false;
        console.error('Errore di rete:', error);
    }
});

// 13. Toast OK — reindirizza subito
btnToastOk.addEventListener('click', () => {
    window.location.href = '/pages/dashboard/DashboardAutore.html';
});

// 14. Annulla — torna alla dashboard
btnCancel.addEventListener('click', () => {
    window.location.href = '/pages/dashboard/DashboardAutore.html';
});

export {};
