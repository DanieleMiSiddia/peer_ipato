var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const token = localStorage.getItem('token');
// 1. Protezione pagina
if (!token) {
    window.location.href = '/';
}
// 2. Legge l'id conferenza dai parametri URL
const params = new URLSearchParams(window.location.search);
const idConferenza = params.get('id');
if (!idConferenza) {
    window.location.href = '/pages/dashboard/DashboardAutore.html';
}
// 3. Riferimenti agli elementi del DOM
const fileInput = document.getElementById('file-input');
const uploadBtn = document.querySelector('.btn-attach');
const dropZone = document.getElementById('drop-zone');
const fileList = document.getElementById('file-list');
const confirmBtn = document.getElementById('confirm-btn');
const errorMsg = document.getElementById('error-msg');
const toast = document.getElementById('success-toast');
const btnToastOk = document.querySelector('.btn-toast-ok');
const btnCancel = document.querySelector('.btn-cancel');
const titoloInput = document.getElementById('titolo-input');
const topicInput = document.getElementById('topic-input');
// 4. File selezionato (un solo documento per articolo)
let selectedFile = null;
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
    var _a;
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const files = (_a = e.dataTransfer) === null || _a === void 0 ? void 0 : _a.files;
    if (files && files.length > 0)
        processFile(files[0]);
});
// 7. Selezione tramite input
fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files.length > 0) {
        processFile(fileInput.files[0]);
    }
});
// 8. Validazione e memorizzazione del file reale
function processFile(file) {
    const validTypes = ['application/pdf'];
    const maxSize = 16 * 1024 * 1024; // 16 MB
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
function renderFileItem(file) {
    var _a;
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
    (_a = document.getElementById('btn-remove-file')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
        selectedFile = null;
        fileList.innerHTML = '';
        fileInput.value = '';
        updateConfirmButton();
    });
}
// 10. Abilita il pulsante Conferma solo se tutti i campi sono compilati
function updateConfirmButton() {
    const tuttiCompilati = selectedFile !== null &&
        titoloInput.value.trim() !== '' &&
        topicInput.value.trim() !== '';
    confirmBtn.classList.toggle('active', tuttiCompilati);
}
titoloInput.addEventListener('input', updateConfirmButton);
topicInput.addEventListener('input', updateConfirmButton);
// 11. Riferimento al messaggio di errore invio
const submitErrorMsg = document.getElementById('submit-error-msg');
function showSubmitError(msg) {
    submitErrorMsg.textContent = msg;
    submitErrorMsg.style.display = 'block';
}
function hideSubmitError() {
    submitErrorMsg.style.display = 'none';
}
// 12. Invio al backend tramite FormData (richiesto da multer)
confirmBtn.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!confirmBtn.classList.contains('active'))
        return;
    if (!selectedFile || !idConferenza)
        return;
    // Previene doppio invio: disabilita il pulsante durante la chiamata
    confirmBtn.classList.remove('active');
    confirmBtn.disabled = true;
    hideSubmitError();
    const formData = new FormData();
    formData.append('id_conferenza', idConferenza);
    formData.append('titolo', titoloInput.value.trim());
    formData.append('topic', topicInput.value.trim());
    formData.append('documento', selectedFile);
    try {
        const response = yield fetch('/api/articolo', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token },
            body: formData
            // NON impostare Content-Type: il browser lo setta automaticamente
            // con il boundary corretto per multipart/form-data
        });
        if (!response.ok) {
            const err = yield response.json().catch(() => ({}));
            showSubmitError((_a = err.message) !== null && _a !== void 0 ? _a : 'Errore durante la sottomissione. Riprova.');
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
    }
    catch (error) {
        showSubmitError('Errore di rete. Controlla la connessione e riprova.');
        confirmBtn.classList.add('active');
        confirmBtn.disabled = false;
        console.error('Errore di rete:', error);
    }
}));
// 13. Toast OK — reindirizza subito
btnToastOk.addEventListener('click', () => {
    window.location.href = '/pages/dashboard/DashboardAutore.html';
});
// 14. Annulla — torna alla dashboard
btnCancel.addEventListener('click', () => {
    window.location.href = '/pages/dashboard/DashboardAutore.html';
});
export {};
//# sourceMappingURL=sottomissioneArticolo.js.map