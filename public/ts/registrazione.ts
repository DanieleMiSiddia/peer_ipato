const registrationForm = document.getElementById('registrationForm') as HTMLFormElement;

registrationForm.addEventListener('submit', async (e: Event) => {
    e.preventDefault();

    // --- Raccolta valori dal form ---
    const nome     = (document.getElementById('nome')          as HTMLInputElement).value.trim();
    const cognome  = (document.getElementById('cognome')       as HTMLInputElement).value.trim();
    const email    = (document.getElementById('email')         as HTMLInputElement).value.trim();
    const ruolo    = (document.getElementById('ruolo')         as HTMLSelectElement).value;
    const competenze = (document.getElementById('competenze')  as HTMLInputElement).value.trim();
    const password   = (document.getElementById('password')    as HTMLInputElement).value;
    const confPassword = (document.getElementById('conf-password') as HTMLInputElement).value;

    const submitBtn = registrationForm.querySelector('.btn-register') as HTMLButtonElement;

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
    const roleMap: Record<string, string> = {
        'Chair':    'chair',
        'Autore':   'autore',
        'Revisore': 'revisore',
        'Editore':  'editore'
    };
    const role = roleMap[ruolo];

    // --- Invio richiesta ---
    submitBtn.disabled = true;
    submitBtn.textContent = 'Registrazione in corso...';

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nome,
                cognome,
                email,
                password,
                role,
                competenza: competenze || null   // campo opzionale: null se vuoto
            })
        });

        const data = await response.json();

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

    } catch (error) {
        showRegMessage('Errore di connessione al server.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Registrati \u2192';
    }
});

function showRegMessage(text: string, type: 'error' | 'success'): void {
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
