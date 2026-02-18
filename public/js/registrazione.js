var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const registrationForm = document.getElementById('registrationForm');
registrationForm.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
    e.preventDefault();
    // --- Raccolta valori dal form ---
    const nome = document.getElementById('nome').value.trim();
    const cognome = document.getElementById('cognome').value.trim();
    const email = document.getElementById('email').value.trim();
    const ruolo = document.getElementById('ruolo').value;
    const competenze = document.getElementById('competenze').value.trim();
    const password = document.getElementById('password').value;
    const confPassword = document.getElementById('conf-password').value;
    const submitBtn = registrationForm.querySelector('.btn-register');
    // --- Validazione lato client ---
    if (!nome || !cognome || !email || !ruolo || !password || !confPassword) {
        showRegMessage('Tutti i campi obbligatori devono essere compilati.', 'error');
        return;
    }
    if (password !== confPassword) {
        showRegMessage('Le password non coincidono.', 'error');
        return;
    }
    // --- Mapping ruolo: PascalCase (HTML) → lowercase (backend) ---
    const roleMap = {
        'Chair': 'chair',
        'Autore': 'autore',
        'Revisore': 'revisore',
        'Editore': 'editore'
    };
    const role = roleMap[ruolo];
    // --- Invio richiesta ---
    submitBtn.disabled = true;
    submitBtn.textContent = 'Registrazione in corso...';
    try {
        const response = yield fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nome,
                cognome,
                email,
                password,
                role,
                competenza: competenze || null // campo opzionale: null se vuoto
            })
        });
        const data = yield response.json();
        if (!response.ok) {
            // Il backend restituisce { message: '...' } per 400 e 500
            showRegMessage(data.message, 'error');
            return;
        }
        // Registrazione riuscita (201)
        showRegMessage('Registrazione completata! Reindirizzamento al login...', 'success');
        setTimeout(() => {
            window.location.href = '/';
        }, 1500);
    }
    catch (error) {
        showRegMessage('Errore di connessione al server.', 'error');
    }
    finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Registrati \u2192';
    }
}));
function showRegMessage(text, type) {
    let msgDiv = document.getElementById('form-message');
    if (!msgDiv) {
        msgDiv = document.createElement('div');
        msgDiv.id = 'form-message';
        // Inserisce il div prima del form-grid (primo figlio del form)
        registrationForm.insertBefore(msgDiv, registrationForm.firstChild);
    }
    msgDiv.textContent = text;
    msgDiv.className = `form-message ${type}`;
}
export {};
//# sourceMappingURL=registrazione.js.map