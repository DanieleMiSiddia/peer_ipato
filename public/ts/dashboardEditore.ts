const token = localStorage.getItem('token');

// 1. Protezione pagina
if (!token) {
    window.location.href = '/';
}

interface ConferenzaEditore {
    id_conferenza: string;
    nome: string;
    articoli_revisionati: number;
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

// 3. Carica conferenze
async function loadConferenze(): Promise<void> {
    const container = document.getElementById('conference-rows-container') as HTMLElement;
    const mainUI = document.getElementById('list-main-ui') as HTMLElement;
    const emptyUI = document.getElementById('empty-state') as HTMLElement;
    const countLabel = document.getElementById('conf-count') as HTMLElement;

    try {
        const response = await fetch('/api/dashboard-editore/conferenze', {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (!response.ok) {
            console.error('Errore caricamento conferenze editore');
            return;
        }

        const data = await response.json();
        const conferenze: ConferenzaEditore[] = data.conferenze;

        if (conferenze.length === 0) {
            mainUI.style.display = 'none';
            emptyUI.style.display = 'block';
            return;
        }

        container.innerHTML = '';
        conferenze.forEach(conf => {
            const row = document.createElement('div');
            row.className = 'conf-row';
            row.innerHTML = `
                <div class="conf-info">
                    <h3>${conf.nome}</h3>
                    <p>${conf.id_conferenza}</p>
                </div>
                <div class="rev-count">${conf.articoli_revisionati} articoli revisionati</div>
                <div class="actions">
                    <a href="" class="btn btn-primary btn-gestisci">
                        <svg class="icon" viewBox="0 0 24 24" style="width:16px;height:16px;">
                            <path d="M18 2h-3a5 5 0 0 0-10 0H2v20h20V2h-4zM7 4a3 3 0 0 1 6 0v1H7V4zm13 16H4V4h1v3h12V4h1v16z" />
                        </svg>
                        Gestisci pubblicazioni
                    </a>
                </div>
            `;

            const btnGestisci = row.querySelector('.btn-gestisci') as HTMLButtonElement;
            btnGestisci.addEventListener('click', () => {
                // Naviga alla pagina di gestione pubblicazioni (da implementare)
                window.location.href = `/pages/GestionePubblicazioni.html?id=${conf.id_conferenza}`;
            });

            container.appendChild(row);
        });

        countLabel.textContent = `${conferenze.length} CONFERENZE`;

    } catch (error) {
        console.error('Errore loadConferenze:', error);
    }
}

// 4. Logout
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    });
}

// Inizializza
document.addEventListener('DOMContentLoaded', () => {
    caricaProfilo();
    loadConferenze();
});

export { };
