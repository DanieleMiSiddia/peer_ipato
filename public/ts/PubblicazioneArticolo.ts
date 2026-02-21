const token = localStorage.getItem('token');

// 1. Protezione pagina
if (!token) {
    window.location.href = '/';
}

const urlParams = new URLSearchParams(window.location.search);
const idArticolo = urlParams.get('id');

if (!idArticolo) {
    window.location.href = '/pages/dashboard/DashboardEditore.html';
}

// 2. Carica profilo
async function caricaProfilo(): Promise<void> {
    try {
        const response = await fetch('/api/dashboard-editore/profilo', {
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

// 3. Carica dettagli articolo
async function loadArticolo(): Promise<void> {
    try {
        const response = await fetch(`/api/dashboard-editore/articoli/${idArticolo}`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (!response.ok) {
            console.error('Errore caricamento dettagli articolo');
            return;
        }

        const data = await response.json();
        const art = data.articolo;

        const titoloEl = document.getElementById('articolo-titolo');
        const sottotitoloEl = document.getElementById('articolo-conferenza-label');
        const abstractEl = document.getElementById('abstract-content');

        if (titoloEl) titoloEl.textContent = art.titolo;
        if (sottotitoloEl) sottotitoloEl.textContent = `Conferenza: ${art.nome_conferenza}`;

        // Mock abstract since not in DB
        if (abstractEl) {
            abstractEl.textContent = "Questo articolo esplora approfonditamente le tematiche della conferenza. " +
                "L'abstract originale non è stato trovato nel database, ma il documento completo è scaricabile tramite il pulsante in alto.";
        }

    } catch (error) {
        console.error('Errore loadArticolo:', error);
    }
}

// 4. Gestione Formattazione
function format(command: string) {
    document.execCommand(command, false, undefined);
    document.getElementById('comment-input')?.focus();
}

// 5. Pubblicazione
async function pubblicaArticolo(): Promise<void> {
    const editor = document.getElementById('comment-input') as HTMLElement;
    if (editor.innerText.trim() === "") {
        alert("Inserisci un commento per gli autori prima di pubblicare.");
        return;
    }

    const conferma = confirm("Sei sicuro di voler finalizzare la pubblicazione di questo articolo?");
    if (!conferma) return;

    try {
        const response = await fetch(`/api/dashboard-editore/articoli/${idArticolo}/pubblica`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ commento: editor.innerHTML })
        });

        if (response.ok) {
            const badge = document.getElementById('success-badge');
            if (badge) badge.style.display = 'flex';

            setTimeout(() => {
                window.location.href = '/pages/GestionePubblicazioni.html';
            }, 2000);
        } else {
            alert("Errore durante la pubblicazione.");
        }
    } catch (error) {
        console.error('Errore pubblicazione:', error);
    }
}

// Inizializza
document.addEventListener('DOMContentLoaded', () => {
    caricaProfilo();
    loadArticolo();

    // Eventi Toolbar
    document.getElementById('btn-bold')?.addEventListener('click', () => format('bold'));
    document.getElementById('btn-italic')?.addEventListener('click', () => format('italic'));
    document.getElementById('btn-list')?.addEventListener('click', () => format('insertUnorderedList'));

    // Evento Submit
    document.getElementById('submit-btn')?.addEventListener('click', pubblicaArticolo);

    // Download PDF (Simulato)
    document.getElementById('download-btn')?.addEventListener('click', () => {
        alert("Download del PDF dell'articolo avviato...");
    });
});

export { };
