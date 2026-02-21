const token = localStorage.getItem('token');

// 1. Protezione pagina
if (!token) {
    window.location.href = '/';
}

const urlParams = new URLSearchParams(window.location.search);
const idConferenza = urlParams.get('id');

if (!idConferenza) {
    console.error('ID Conferenza mancante');
    window.location.href = '/pages/dashboard/DashboardAutore.html';
}

// 2. Carica profilo utente
async function caricaProfilo(): Promise<void> {
    try {
        const response = await fetch('/api/homepage/profilo', {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (!response.ok) {
            localStorage.removeItem('token');
            window.location.href = '/';
            return;
        }

        const data = await response.json();
        const headerUser = document.getElementById('header-user');
        if (headerUser) {
            headerUser.textContent = data.utente.nome + ' ' + data.utente.cognome;
        }
    } catch (error) {
        console.error('Errore profilo:', error);
    }
}

// 3. Carica info conferenza (nome)
async function caricaInfoConferenza(): Promise<void> {
    const subtitle = document.getElementById('conf-subtitle');
    try {
        // Nota: riutilizziamo l'API delle conferenze e filtriamo per ID
        const response = await fetch('/api/dashboard-autore/conferenze', {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (response.ok) {
            const data = await response.json();
            const conf = data.conferenze.find((c: any) => c.id_conferenza === idConferenza);
            if (conf && subtitle) {
                subtitle.textContent = `Stai sottomettendo un articolo per: ${conf.nome}`;
            }
        }
    } catch (error) {
        console.error('Errore info conferenza:', error);
    }
}

// 4. Gestione Invio Form
const form = document.getElementById('form-sottomissione') as HTMLFormElement;
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        formData.append('id_conferenza', idConferenza!);

        try {
            // Qui andrebbe la chiamata all'API di sottomissione
            // const response = await fetch('/api/sottomissione/articolo', { ... });

            console.log('Sottomissione inviata per:', idConferenza);
            alert('Sottomissione inviata con successo! (Simulazione)');
            window.location.href = '/pages/ListaArticoliSottomessi.html';

        } catch (error) {
            console.error('Errore invio:', error);
            alert('Si è verificato un errore durante l\'invio.');
        }
    });
}

// 5. Gestione visualizzazione nome file selezionato
const fileInput = document.getElementById('documento') as HTMLInputElement;
const fileInfo = document.querySelector('.file-info') as HTMLElement;

if (fileInput && fileInfo) {
    fileInput.addEventListener('change', () => {
        if (fileInput.files && fileInput.files.length > 0) {
            fileInfo.textContent = `File selezionato: ${fileInput.files[0].name}`;
            fileInfo.style.color = 'var(--primary-blue)';
            fileInfo.style.fontWeight = '600';
        }
    });
}

// Inizializza
document.addEventListener('DOMContentLoaded', () => {
    caricaProfilo();
    caricaInfoConferenza();
});

export { };
