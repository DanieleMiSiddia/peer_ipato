const token = localStorage.getItem('token');

// 1. Protezione pagina
if (!token) {
    window.location.href = '/';
}

interface Articolo {
    id_articolo: string;
    titolo: string;
    nome_conferenza: string;
    stato: string;
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

// 3. Carica articoli sottomessi
async function loadArticoli(): Promise<void> {
    const container = document.getElementById('articles-rows-container') as HTMLElement;
    const mainUI = document.getElementById('list-main-ui') as HTMLElement;
    const emptyUI = document.getElementById('empty-state') as HTMLElement;
    const countLabel = document.getElementById('art-count') as HTMLElement;

    try {
        const response = await fetch('/api/dashboard-autore/articoli', {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (!response.ok) {
            console.error('Errore API articoli');
            return;
        }

        const data = await response.json();
        const articoli: Articolo[] = data.articoli;

        if (articoli.length === 0) {
            mainUI.style.display = 'none';
            emptyUI.style.display = 'block';
            return;
        }

        container.innerHTML = '';
        articoli.forEach(art => {
            const row = document.createElement('div');
            row.className = 'article-row';

            // Mappa stato a classe badge
            let badgeClass = 'badge-yellow';
            let statoLabel = art.stato;

            if (art.stato === 'ACCETTATO') badgeClass = 'badge-green';
            if (art.stato === 'RIFIUTATO') badgeClass = 'badge-red';
            if (art.stato === 'IN_REVISIONE_F') {
                badgeClass = 'badge-blue';
                statoLabel = 'IN REVISIONE';
            }

            row.innerHTML = `
                <div class="article-info">
                    <h3>${art.titolo}</h3>
                    <p>${art.id_articolo}</p>
                </div>
                <div class="conf-name">${art.nome_conferenza}</div>
                <div class="actions">
                    <button class="icon-btn edit" title="Modifica">
                        <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                    </button>
                    <button class="icon-btn delete" title="Elimina">
                        <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                    </button>
                </div>
            `;
            container.appendChild(row);
        });

        countLabel.textContent = `${articoli.length} ARTICOLI`;

    } catch (error) {
        console.error('Errore loadArticoli:', error);
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

// 5. Inizializza
document.addEventListener('DOMContentLoaded', () => {
    caricaProfilo();
    loadArticoli();
});

export { };
