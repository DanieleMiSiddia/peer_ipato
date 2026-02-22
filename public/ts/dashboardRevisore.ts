const token = localStorage.getItem('token');

// 1. Protezione pagina: se non c'è token, redirect al login
if (!token) {
    window.location.href = '/';
}

// 2. Struttura dati ricevuta dall'API
interface ArticoloAssegnato {
    id_articolo:         string;
    titolo:              string;
    stato:               string;
    topic:               string;
    media_voti:          number;
    id_conferenza:       string;
    id_autore:           string;
    metodo_assegnazione: string;
    data_scadenza:       string;
    sorgente:            'Assegnazione' | 'Offerta';
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
async function loadArticoli(): Promise<void> {
    const container  = document.getElementById('articoli-rows-container') as HTMLElement;
    const mainUI     = document.getElementById('list-main-ui') as HTMLElement;
    const emptyUI    = document.getElementById('empty-state') as HTMLElement;
    const countLabel = document.getElementById('art-count') as HTMLElement;

    try {
        const response = await fetch('/api/dashboard-revisore/articoli-assegnati', {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (!response.ok) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
            return;
        }

        const data = await response.json();
        const articoli: ArticoloAssegnato[] = data.articoli;

        if (articoli.length === 0) {
            mainUI.style.display  = 'none';
            emptyUI.style.display = 'block';
            return;
        }

        container.innerHTML = '';

        articoli.forEach((art: ArticoloAssegnato) => {
            const badgeClass = art.sorgente === 'Offerta' ? 'badge-blue' : 'badge-purple';
            const row = document.createElement('div');
            row.className = 'art-row';
            row.innerHTML = `
                <div class="art-info">
                    <h3>${art.titolo}</h3>
                    <p>${art.id_articolo}</p>
                </div>
                <div class="scadenza">${formatData(art.data_scadenza)}</div>
                <div><span class="badge ${badgeClass}">${art.sorgente}</span></div>
                <div class="actions">
                    <button class="btn btn-primary">Scrivi Revisione</button>
                </div>
            `;
            container.appendChild(row);
        });

        countLabel.innerText = `${articoli.length} ARTICOLI`;

    } catch (error) {
        console.error('Errore caricamento articoli:', error);
    }
}

// 6. Navigazione a "Dashboard Membro PC"
const btnMembroPC = document.getElementById('btn-dashboard-membro-pc');
if (btnMembroPC) {
    btnMembroPC.addEventListener('click', () => {
        window.location.href = '/pages/dashboard/DashboardMembroPC.html';
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
loadArticoli();

export {};
