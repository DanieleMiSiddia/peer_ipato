const token = localStorage.getItem('token');

// 1. Protezione pagina
if (!token) {
    window.location.href = '/';
}

// 2. Struttura dati ricevuta dall'API
interface ConferenzaMembroPCItem {
    id_conferenza:       string;
    nome:                string;
    data_fine_revisione: string;
}

// 3. Formatta una data ISO in "GG/MM/AAAA"
function formatData(iso: string): string {
    const d = new Date(iso);
    const gg = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const aa = d.getFullYear();
    return `${gg}/${mm}/${aa}`;
}

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
async function loadConferenze(): Promise<void> {
    const container  = document.getElementById('conferenze-rows-container') as HTMLElement;
    const mainUI     = document.getElementById('list-main-ui') as HTMLElement;
    const emptyUI    = document.getElementById('empty-state') as HTMLElement;
    const countLabel = document.getElementById('conf-count') as HTMLElement;

    try {
        const response = await fetch('/api/dashboard-membro-pc/conferenze', {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (!response.ok) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
            return;
        }

        const data = await response.json();
        const conferenze: ConferenzaMembroPCItem[] = data.conferenze;

        if (conferenze.length === 0) {
            mainUI.style.display  = 'none';
            emptyUI.style.display = 'block';
            return;
        }

        container.innerHTML = '';

        conferenze.forEach((conf: ConferenzaMembroPCItem) => {
            const row = document.createElement('div');
            row.className = 'data-row';
            row.style.gridTemplateColumns = '2.5fr 1.5fr 1.3fr';
            row.innerHTML = `
                <div class="row-info">
                    <h3>${conf.nome}</h3>
                    <p>${conf.id_conferenza}</p>
                </div>
                <div class="scadenza">${formatData(conf.data_fine_revisione)}</div>
                <div class="actions">
                    <button class="btn btn-primary">Visualizza Articoli</button>
                </div>
            `;
            const btnVisualizza = row.querySelector('.btn-primary') as HTMLButtonElement;
            btnVisualizza.addEventListener('click', () => {
                window.location.href = '/pages/ListaArticoliPC.html?id=' + conf.id_conferenza;
            });
            container.appendChild(row);
        });

        countLabel.innerText = `${conferenze.length} CONFERENZE`;

    } catch (error) {
        console.error('Errore caricamento conferenze:', error);
    }
}

// 6. Torna alla Dashboard Revisore
const btnTornaRevisore = document.getElementById('btn-torna-revisore');
if (btnTornaRevisore) {
    btnTornaRevisore.addEventListener('click', () => {
        window.location.href = '/pages/dashboard/DashboardRevisore.html';
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
loadConferenze();

export {};
