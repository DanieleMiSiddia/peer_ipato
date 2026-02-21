const token = localStorage.getItem('token');

// 1. Protezione pagina: se non c'è token, redirect al login
if (!token) {
    window.location.href = '/';
}

// 2. Struttura dati ricevuta dall'API
interface ConferenzaSottomissione {
    id_conferenza: string;
    nome: string;
    scadenza: string; // data scadenza sottomissione (es. "2025-06-30")
}

// 3. Carica profilo e popola il nome nell'header
async function caricaProfiloDashboard(): Promise<void> {
    try {
        const response = await fetch('/api/homepage/profilo', {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (!response.ok) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
            return;
        }

        const data = await response.json();
        const headerUser = document.getElementById('header-user');
        if (headerUser) {
            headerUser.textContent = data.utente.nome + ' ' + data.utente.cognome;
        }

    } catch (error) {
        console.error('Errore caricamento profilo:', error);
        window.location.href = '/';
    }
}

// 4. Chiama l'API e genera le righe della tabella
async function loadConferenze(): Promise<void> {
    const container = document.getElementById('conference-rows-container') as HTMLElement;
    const mainUI = document.getElementById('list-main-ui') as HTMLElement;
    const emptyUI = document.getElementById('empty-state') as HTMLElement;
    const countLabel = document.getElementById('conf-count') as HTMLElement;

    try {
        // Endpoint che restituisce le conferenze in stato "Fase Sottomissione"
        const response = await fetch('/api/dashboard-autore/conferenze', {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (!response.ok) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
            return;
        }

        const data = await response.json();
        const conferenze: ConferenzaSottomissione[] = data.conferenze;

        if (conferenze.length === 0) {
            mainUI.style.display = 'none';
            emptyUI.style.display = 'block';
            return;
        }

        container.innerHTML = '';

        conferenze.forEach((conf: ConferenzaSottomissione) => {
            // Formatta la data di scadenza in italiano
            const scadenzaFormatted = conf.scadenza
                ? new Date(conf.scadenza).toLocaleDateString('it-IT', {
                    day: '2-digit', month: 'long', year: 'numeric'
                })
                : 'N/D';

            const row = document.createElement('div');
            row.className = 'conf-row';
            row.innerHTML = `
                <div class="conf-info">
                    <h3>${conf.nome}</h3>
                    <p>${conf.id_conferenza}</p>
                </div>
                <div><span class="badge badge-blue">Autore</span></div>
                <div class="deadline">
                    <svg class="deadline-icon" viewBox="0 0 24 24"><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/></svg>
                    ${scadenzaFormatted}
                </div>
                <div class="actions">
                    <button class="btn btn-primary">
                        <svg class="icon" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg>
                        Sottometti Articolo
                    </button>
                </div>
            `;

            // Collega il bottone alla pagina di sottomissione
            const btnSottometti = row.querySelector('.btn-primary') as HTMLButtonElement;
            btnSottometti.addEventListener('click', () => {
                window.location.href = '/pages/SottomettiArticolo.html?id=' + conf.id_conferenza;
            });

            container.appendChild(row);
        });

        countLabel.innerText = `${conferenze.length} CONFERENZE`;

    } catch (error) {
        console.error('Errore caricamento conferenze:', error);
    }
}

// 5. Bottone Lista Articoli Sottomessi
const btnListaArticoli = document.getElementById('btn-lista-articoli');
if (btnListaArticoli) {
    btnListaArticoli.addEventListener('click', () => {
        window.location.href = '/pages/ListaArticoliSottomessi.html';
    });
}

// 6. Gestione logout
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + token }
            });
        } catch (error) {
            console.error('Errore logout:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
        }
    });
}

caricaProfiloDashboard();
loadConferenze();

export { };
