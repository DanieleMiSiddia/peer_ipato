const token = localStorage.getItem('token');

// 1. Protezione pagina: se non c'è token, redirect al login
if (!token) {
    window.location.href = '/';
}

// 2. Struttura dati ricevuta dall'API
interface ConferenzaItem {
    id_conferenza: string;
    nome:          string;
    stato:         string;
}

// 3. Mappa stato → classe CSS del pallino colorato
const STATO_CLASSE: Record<string, string> = {
    'Fase Sottomissione': 'dot-yellow',
    'Fase Revisione':     'dot-green',
    'Fase Pubblicazione': 'dot-blue'
};

// 4. Carica profilo e popola il nome nell'header
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

// 5. Chiama l'API e genera le righe della tabella
async function loadConferences(): Promise<void> {
    const container  = document.getElementById('conference-rows-container') as HTMLElement;
    const mainUI     = document.getElementById('list-main-ui') as HTMLElement;
    const emptyUI    = document.getElementById('empty-state') as HTMLElement;
    const countLabel = document.getElementById('conf-count') as HTMLElement;

    try {
        const response = await fetch('/api/dashboard-chair/conferenze', {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (!response.ok) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
            return;
        }

        const data = await response.json();
        const conferenze: ConferenzaItem[] = data.conferenze;

        if (conferenze.length === 0) {
            mainUI.style.display  = 'none';
            emptyUI.style.display = 'block';
            return;
        }

        container.innerHTML = '';

        conferenze.forEach((conf: ConferenzaItem) => {
            const dotClasse = STATO_CLASSE[conf.stato] ?? 'dot-yellow';
            const row = document.createElement('div');
            row.className = 'conf-row';
            row.innerHTML = `
                <div class="conf-info">
                    <h3>${conf.nome}</h3>
                    <p>${conf.id_conferenza}</p>
                </div>
                <div><span class="badge badge-purple">Chair</span></div>
                <div class="status">
                    <span class="dot ${dotClasse}"></span>
                    ${conf.stato}
                </div>
                <div class="actions">
                    <button class="btn btn-primary">Gestisci Conferenza</button>
                </div>
            `;
            // Collega il bottone "Gestisci Conferenza" alla pagina di gestione
            const btnGestisci = row.querySelector('.btn-primary') as HTMLButtonElement;
            btnGestisci.addEventListener('click', () => {
                window.location.href = '/pages/GestioneConferenza.html?id=' + conf.id_conferenza;
            });

            container.appendChild(row);
        });

        countLabel.innerText = `${conferenze.length} CONFERENZE`;

    } catch (error) {
        console.error('Errore caricamento conferenze:', error);
    }
}

// 6. Navigazione a "Crea Conferenza"
const btnCreaConferenza = document.getElementById('btn-crea-conferenza');
if (btnCreaConferenza) {
    btnCreaConferenza.addEventListener('click', () => {
        window.location.href = '/pages/dashboard/CreaNuovaConferenza.html';
    });
}

// 7. Gestione logout
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
loadConferences();

export {};
