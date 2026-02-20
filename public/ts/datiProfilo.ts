const token = localStorage.getItem('token');

// 1. Protezione pagina
if (!token) {
    window.location.href = '/';
}

// 2. Mappa ruolo DB → etichetta leggibile
const ROLE_MAP: Record<string, string> = {
    'chair':    'Chair',
    'autore':   'Autore',
    'revisore': 'Revisore',
    'editore':  'Editore'
};

// 3. Carica e popola il profilo dall'API
async function caricaProfilo(): Promise<void> {
    try {
        const response = await fetch('/api/dashboard-chair/profilo', {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (!response.ok) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
            return;
        }

        const data = await response.json();
        const utente = data.utente;
        const roleLabel = ROLE_MAP[utente.role] ?? utente.role;

        (document.getElementById('display-name') as HTMLElement).innerText = `${utente.nome} ${utente.cognome}`;
        (document.getElementById('display-role') as HTMLElement).innerText = roleLabel;
        (document.getElementById('val-nome') as HTMLElement).innerText = utente.nome;
        (document.getElementById('val-cognome') as HTMLElement).innerText = utente.cognome;
        (document.getElementById('val-email') as HTMLElement).innerText = utente.email;
        (document.getElementById('val-ruolo-full') as HTMLElement).innerText = roleLabel;

        const skillsContainer = document.getElementById('val-skills') as HTMLElement;
        skillsContainer.innerHTML = '';
        if (utente.competenza) {
            const span = document.createElement('span');
            span.className = 'skill-tag';
            span.innerText = utente.competenza;
            skillsContainer.appendChild(span);
        } else {
            skillsContainer.innerText = '—';
        }

    } catch (error) {
        console.error('Errore caricamento profilo:', error);
        window.location.href = '/';
    }
}

caricaProfilo();

// 4. Navigazione pulsanti
document.getElementById('btn-modifica-password')!.addEventListener('click', () => {
    window.location.href = '/pages/ModificaPassword.html';
});

document.getElementById('btn-modifica-email')!.addEventListener('click', () => {
    window.location.href = '/pages/ModificaEmail.html';
});

export {};
